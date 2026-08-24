import { pool } from "../config/database.js";
import { createJobLog } from "./job-log.repository.js";

export const createJobExecution = async (
  {
    jobId,
    workerId,
    attemptNo,
  },
  database = pool,
) => {
  const query = `
    INSERT INTO job_executions (
      job_id,
      worker_id,
      attempt_no,
      status,
      started_at
    )
    VALUES ($1, $2, $3, 'running', NOW())
    RETURNING
      id,
      job_id,
      worker_id,
      attempt_no,
      status,
      started_at,
      finished_at,
      error
  `;

  const { rows } = await database.query(query, [
    jobId,
    workerId,
    attemptNo,
  ]);

  return rows[0];
};

export const markExecutionSucceeded = async ({
  executionId,
  jobId,
  workerId,
}) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const executionResult = await client.query(
      `
        UPDATE job_executions
        SET
          status = 'succeeded',
          finished_at = NOW(),
          error = NULL
        WHERE id = $1
          AND job_id = $2
          AND worker_id = $3
          AND status = 'running'
        RETURNING *
      `,
      [executionId, jobId, workerId],
    );

    if (!executionResult.rows[0]) {
      throw new Error("Running job execution was not found");
    }

    const jobResult = await client.query(
      `
        UPDATE jobs
        SET
          status = 'succeeded',
          locked_by = NULL,
          locked_at = NULL,
          updated_at = NOW()
        WHERE id = $1
          AND locked_by = $2
          AND status = 'running'
        RETURNING *
      `,
      [jobId, workerId],
    );

    if (!jobResult.rows[0]) {
      throw new Error("Running job was not found for this worker");
    }

    const log = await createJobLog(
      {
        jobId,
        executionId,
        level: "info",
        message:
          `Job completed successfully on attempt ` +
          `${executionResult.rows[0].attempt_no}`,
      },
      client,
    );

    await client.query("COMMIT");

    return {
      job: jobResult.rows[0],
      execution: executionResult.rows[0],
      log,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const markExecutionFailedForRetry = async ({
  executionId,
  jobId,
  workerId,
  errorMessage,
  retryDelayMs,
}) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const executionResult = await client.query(
      `
        UPDATE job_executions
        SET
          status = 'failed',
          finished_at = NOW(),
          error = $1
        WHERE id = $2
          AND job_id = $3
          AND worker_id = $4
          AND status = 'running'
        RETURNING *
      `,
      [errorMessage, executionId, jobId, workerId],
    );

    if (!executionResult.rows[0]) {
      throw new Error("Running job execution was not found");
    }

    const jobResult = await client.query(
      `
        UPDATE jobs
        SET
          status = 'pending',
          available_at =
            NOW() + ($1::double precision * INTERVAL '1 millisecond'),
          locked_by = NULL,
          locked_at = NULL,
          updated_at = NOW()
        WHERE id = $2
          AND locked_by = $3
          AND status = 'running'
        RETURNING *
      `,
      [retryDelayMs, jobId, workerId],
    );

    if (!jobResult.rows[0]) {
      throw new Error("Running job was not found for this worker");
    }

    const log = await createJobLog(
      {
        jobId,
        executionId,
        level: "warn",
        message:
          `Attempt ${executionResult.rows[0].attempt_no} failed: ` +
          `${errorMessage}. Retrying in ${retryDelayMs}ms`,
      },
      client,
    );

    await client.query("COMMIT");

    return {
      job: jobResult.rows[0],
      execution: executionResult.rows[0],
      log,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const moveJobToDeadLetterQueue = async ({
  executionId,
  jobId,
  workerId,
  errorMessage,
}) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const executionResult = await client.query(
      `
        UPDATE job_executions
        SET
          status = 'failed',
          finished_at = NOW(),
          error = $1
        WHERE id = $2
          AND job_id = $3
          AND worker_id = $4
          AND status = 'running'
        RETURNING *
      `,
      [errorMessage, executionId, jobId, workerId],
    );

    if (!executionResult.rows[0]) {
      throw new Error("Running job execution was not found");
    }

    const jobResult = await client.query(
      `
        UPDATE jobs
        SET
          status = 'dead',
          locked_by = NULL,
          locked_at = NULL,
          updated_at = NOW()
        WHERE id = $1
          AND locked_by = $2
          AND status = 'running'
        RETURNING *
      `,
      [jobId, workerId],
    );

    const job = jobResult.rows[0];

    if (!job) {
      throw new Error("Running job was not found for this worker");
    }

    const deadLetterResult = await client.query(
      `
        INSERT INTO dead_letter_queue (
          job_id,
          queue_id,
          payload,
          failure_reason,
          attempts_made
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `,
      [
        job.id,
        job.queue_id,
        job.payload,
        errorMessage,
        job.attempt_count,
      ],
    );

   const log = await createJobLog(
  {
    jobId,
    executionId,
    level: "error",
    message:
      `Job moved to dead-letter queue after ` +
      `${job.attempt_count} attempts: ${errorMessage}`,
  },
  client,
); 

    await client.query("COMMIT");

    return {
      job,
      execution: executionResult.rows[0],
      deadLetterEntry: deadLetterResult.rows[0],
      log,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const getJobExecutions = async (
  { jobId },
  database = pool,
) => {
  const query = `
    SELECT
      je.id,
      je.job_id,
      je.worker_id,
      je.attempt_no,
      je.status,
      je.started_at,
      je.finished_at,
      je.error,
      (
        EXTRACT(
          EPOCH FROM (
            COALESCE(je.finished_at, NOW()) -
            je.started_at
          )
        ) * 1000
      )::double precision AS duration_ms,
      w.hostname AS worker_hostname,
      w.pid AS worker_pid,
      w.status AS worker_status
    FROM job_executions je
    LEFT JOIN workers w
      ON w.id = je.worker_id
    WHERE je.job_id = $1
    ORDER BY je.attempt_no DESC
  `;

  const { rows } = await database.query(query, [
    jobId,
  ]);

  return rows;
};
