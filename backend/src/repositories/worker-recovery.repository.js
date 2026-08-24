import { pool } from "../config/database.js";
import { createJobLog } from "./job-log.repository.js";

export const recoverStaleWorkers = async ({
  staleAfterSeconds = 30,
} = {}) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const staleWorkerResult = await client.query(
      `
        SELECT
          id,
          hostname,
          pid,
          last_seen_at
        FROM workers
        WHERE status IN ('online', 'draining')
          AND last_seen_at <
            NOW() - (
              $1::double precision * INTERVAL '1 second'
            )
        ORDER BY last_seen_at ASC
        FOR UPDATE SKIP LOCKED
      `,
      [staleAfterSeconds],
    );

    const staleWorkers = staleWorkerResult.rows;

    if (staleWorkers.length === 0) {
      await client.query("COMMIT");

      return {
        workersRecovered: 0,
        jobsRequeued: 0,
        jobsDead: 0,
      };
    }

    const workerIds = staleWorkers.map((worker) => worker.id);

    const runningJobResult = await client.query(
      `
        SELECT *
        FROM jobs
        WHERE status = 'running'
          AND locked_by = ANY($1::uuid[])
        ORDER BY locked_at ASC
        FOR UPDATE
      `,
      [workerIds],
    );

    let jobsRequeued = 0;
    let jobsDead = 0;

    for (const job of runningJobResult.rows) {
      const staleWorker = staleWorkers.find(
        (worker) => worker.id === job.locked_by,
      );

      const failureReason =
        `Worker ${job.locked_by} stopped sending heartbeats ` +
        `while executing attempt ${job.attempt_count}`;

      const executionResult = await client.query(
        `
          UPDATE job_executions
          SET
            status = 'crashed',
            finished_at = NOW(),
            error = $1
          WHERE job_id = $2
            AND worker_id = $3
            AND status = 'running'
          RETURNING *
        `,
        [failureReason, job.id, job.locked_by],
      );

      const execution = executionResult.rows[0] ?? null;

      if (job.attempt_count >= job.max_attempts) {
        const deadJobResult = await client.query(
          `
            UPDATE jobs
            SET
              status = 'dead',
              locked_by = NULL,
              locked_at = NULL,
              updated_at = NOW()
            WHERE id = $1
              AND status = 'running'
              AND locked_by = $2
            RETURNING *
          `,
          [job.id, job.locked_by],
        );

        const deadJob = deadJobResult.rows[0];

        if (!deadJob) {
          throw new Error(
            `Crashed job ${job.id} could not be marked dead`,
          );
        }

        await client.query(
          `
            INSERT INTO dead_letter_queue (
              job_id,
              queue_id,
              payload,
              failure_reason,
              attempts_made
            )
            VALUES ($1, $2, $3, $4, $5)
          `,
          [
            deadJob.id,
            deadJob.queue_id,
            deadJob.payload,
            failureReason,
            deadJob.attempt_count,
          ],
        );

        await createJobLog(
          {
            jobId: deadJob.id,
            executionId: execution?.id ?? null,
            level: "error",
            message:
              `${failureReason}. Maximum attempts reached; ` +
              `job moved to the dead-letter queue`,
          },
          client,
        );

        jobsDead += 1;
        continue;
      }

      const requeuedJobResult = await client.query(
        `
          UPDATE jobs
          SET
            status = 'pending',
            available_at = NOW(),
            locked_by = NULL,
            locked_at = NULL,
            updated_at = NOW()
          WHERE id = $1
            AND status = 'running'
            AND locked_by = $2
          RETURNING *
        `,
        [job.id, job.locked_by],
      );

      if (!requeuedJobResult.rows[0]) {
        throw new Error(
          `Crashed job ${job.id} could not be requeued`,
        );
      }

      await createJobLog(
        {
          jobId: job.id,
          executionId: execution?.id ?? null,
          level: "warn",
          message:
            `${failureReason}. Job requeued for another worker`,
        },
        client,
      );

      jobsRequeued += 1;
    }

    await client.query(
      `
        UPDATE workers
        SET status = 'offline'
        WHERE id = ANY($1::uuid[])
      `,
      [workerIds],
    );

    await client.query("COMMIT");

    return {
      workersRecovered: staleWorkers.length,
      jobsRequeued,
      jobsDead,
      workerIds,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
