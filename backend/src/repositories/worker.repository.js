import { pool } from "../config/database.js";
import { createJobExecution } from "./job-execution.repository.js";
import { createJobLog } from "./job-log.repository.js";

export const registerWorker = async ({ hostname, pid }) => {
  const query = `
    INSERT INTO workers (
      hostname,
      pid,
      status,
      started_at,
      last_seen_at
    )
    VALUES ($1, $2, 'online', NOW(), NOW())
    RETURNING
      id,
      hostname,
      pid,
      status,
      started_at,
      last_seen_at
  `;

  const { rows } = await pool.query(query, [hostname, pid]);

  return rows[0];
};

export const recordHeartbeat = async ({
  workerId,
  cpuPct = null,
  memoryMb = null,
}) => {
  const query = `
    WITH updated_worker AS (
      UPDATE workers
      SET last_seen_at = NOW()
      WHERE id = $1
      RETURNING id
    )
    INSERT INTO worker_heartbeats (
      worker_id,
      heartbeat_at,
      cpu_pct,
      memory_mb
    )
    SELECT id, NOW(), $2, $3
    FROM updated_worker
    RETURNING
      id,
      worker_id,
      heartbeat_at,
      cpu_pct,
      memory_mb
  `;

  const { rows } = await pool.query(query, [
    workerId,
    cpuPct,
    memoryMb,
  ]);

  return rows[0] ?? null;
};

export const updateWorkerStatus = async ({
  workerId,
  status,
}) => {
  const result = await pool.query(
    `
      UPDATE workers
      SET
        status = $2,
        last_seen_at = NOW()
      WHERE id = $1
      RETURNING
        id,
        hostname,
        pid,
        status,
        started_at,
        last_seen_at
    `,
    [workerId, status],
  );

  return result.rows[0] ?? null;
};

export const claimNextJob = async (workerId) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const workerResult = await client.query(
  `
    SELECT id
    FROM workers
    WHERE id = $1
      AND status = 'online'
    FOR UPDATE
  `,
  [workerId],
);

if (!workerResult.rows[0]) {
  await client.query("COMMIT");
  return null;
}

    const queueResult = await client.query(`
      SELECT
        q.id,
        q.concurrency_limit
      FROM queues q
      WHERE q.is_paused = false
        AND (
          SELECT COUNT(*)
          FROM jobs running_job
          WHERE running_job.queue_id = q.id
            AND running_job.status = 'running'
        ) < q.concurrency_limit
        AND EXISTS (
          SELECT 1
          FROM jobs pending_job
          WHERE pending_job.queue_id = q.id
            AND pending_job.status = 'pending'
            AND pending_job.available_at <= NOW()
            AND pending_job.attempt_count < pending_job.max_attempts
        )
      ORDER BY
        q.priority DESC,
        q.created_at ASC
      FOR UPDATE SKIP LOCKED
      LIMIT 1
    `);

    const queue = queueResult.rows[0];

    if (!queue) {
      await client.query("COMMIT");
      return null;
    }

    const jobResult = await client.query(
      `
        SELECT j.id
        FROM jobs j
        WHERE j.queue_id = $1
          AND j.status = 'pending'
          AND j.available_at <= NOW()
          AND j.attempt_count < j.max_attempts
          AND (
            SELECT COUNT(*)
            FROM jobs running_job
            WHERE running_job.queue_id = $1
              AND running_job.status = 'running'
          ) < $2
        ORDER BY
          j.priority DESC,
          j.available_at ASC,
          j.created_at ASC
        FOR UPDATE SKIP LOCKED
        LIMIT 1
      `,
      [queue.id, queue.concurrency_limit],
    );

    const job = jobResult.rows[0];

    if (!job) {
      await client.query("COMMIT");
      return null;
    }

    const claimedJobResult = await client.query(
      `
        UPDATE jobs
        SET
          status = 'running',
          locked_by = $1,
          locked_at = NOW(),
          attempt_count = attempt_count + 1,
          updated_at = NOW()
        WHERE id = $2
          AND status = 'pending'
        RETURNING *
      `,
      [workerId, job.id],
    );

    const claimedJob = claimedJobResult.rows[0];

    if (!claimedJob) {
      throw new Error("Selected job could not be claimed");
    }

    const execution = await createJobExecution(
      {
        jobId: claimedJob.id,
        workerId,
        attemptNo: claimedJob.attempt_count,
      },
      client,
    );

    const log = await createJobLog(
      {
        jobId: claimedJob.id,
        executionId: execution.id,
        level: "info",
        message:
          `Job claimed by worker ${workerId}; ` +
          `attempt ${claimedJob.attempt_count} started`,
      },
      client,
    );

    await client.query("COMMIT");

    return {
      job: claimedJob,
      execution,
      log,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const getJobRetryContext = async ({
  jobId,
  workerId,
}) => {
  const query = `
    SELECT
      j.id,
      j.queue_id,
      j.payload,
      j.attempt_count,
      j.max_attempts,
      COALESCE(rp.strategy, 'exponential') AS retry_strategy,
      COALESCE(rp.base_delay_ms, 1000) AS base_delay_ms,
      COALESCE(rp.max_delay_ms, 60000) AS max_delay_ms
    FROM jobs j
    LEFT JOIN retry_policies rp
      ON rp.queue_id = j.queue_id
    WHERE j.id = $1
      AND j.locked_by = $2
      AND j.status = 'running'
  `;

  const { rows } = await pool.query(query, [
    jobId,
    workerId,
  ]);

  return rows[0] ?? null;
};
