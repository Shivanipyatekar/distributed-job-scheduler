import { pool } from "../config/database.js";

export const createQueue = async ({
  projectId,
  name,
  concurrencyLimit,
  priority,
  retryPolicy,
}) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const queueResult = await client.query(
      `
        INSERT INTO queues (
          project_id,
          name,
          concurrency_limit,
          priority
        )
        VALUES ($1, $2, $3, $4)
        RETURNING
          id,
          project_id,
          name,
          concurrency_limit,
          priority,
          is_paused,
          created_at,
          updated_at
      `,
      [projectId, name, concurrencyLimit, priority]
    );

    const queue = queueResult.rows[0];

    const retryPolicyResult = await client.query(
      `
        INSERT INTO retry_policies (
          queue_id,
          strategy,
          base_delay_ms,
          max_delay_ms,
          max_attempts
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING
          id,
          queue_id,
          strategy,
          base_delay_ms,
          max_delay_ms,
          max_attempts
      `,
      [
        queue.id,
        retryPolicy.strategy,
        retryPolicy.baseDelayMs,
        retryPolicy.maxDelayMs,
        retryPolicy.maxAttempts,
      ]
    );

    await client.query("COMMIT");

    return {
      ...queue,
      retry_policy: retryPolicyResult.rows[0],
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const findQueuesByProjectForUser = async (
  projectId,
  userId
) => {
  const result = await pool.query(
    `
      SELECT
        q.id,
        q.project_id,
        q.name,
        q.concurrency_limit,
        q.priority,
        q.is_paused,
        q.created_at,
        q.updated_at,
        om.role,
        JSON_BUILD_OBJECT(
          'id', rp.id,
          'strategy', rp.strategy,
          'base_delay_ms', rp.base_delay_ms,
          'max_delay_ms', rp.max_delay_ms,
          'max_attempts', rp.max_attempts
        ) AS retry_policy
      FROM queues q
      INNER JOIN projects p
        ON p.id = q.project_id
      INNER JOIN organization_members om
        ON om.organization_id = p.organization_id
      LEFT JOIN retry_policies rp
        ON rp.queue_id = q.id
      WHERE q.project_id = $1
        AND om.user_id = $2
      ORDER BY q.priority DESC, q.created_at ASC
    `,
    [projectId, userId]
  );

  return result.rows;
};

export const findQueueByIdForUser = async (
  queueId,
  userId
) => {
  const result = await pool.query(
    `
      SELECT
        q.id,
        q.project_id,
        q.name,
        q.concurrency_limit,
        q.priority,
        q.is_paused,
        q.created_at,
        q.updated_at,
        om.role,
        JSON_BUILD_OBJECT(
          'id', rp.id,
          'strategy', rp.strategy,
          'base_delay_ms', rp.base_delay_ms,
          'max_delay_ms', rp.max_delay_ms,
          'max_attempts', rp.max_attempts
        ) AS retry_policy
      FROM queues q
      INNER JOIN projects p
        ON p.id = q.project_id
      INNER JOIN organization_members om
        ON om.organization_id = p.organization_id
      LEFT JOIN retry_policies rp
        ON rp.queue_id = q.id
      WHERE q.id = $1
        AND om.user_id = $2
    `,
    [queueId, userId]
  );

  return result.rows[0] ?? null;
};

export const updateQueueConfiguration = async ({
  queueId,
  name,
  concurrencyLimit,
  priority,
  retryPolicy,
}) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const queueResult = await client.query(
      `
        UPDATE queues
        SET
          name = $2,
          concurrency_limit = $3,
          priority = $4,
          updated_at = now()
        WHERE id = $1
        RETURNING
          id,
          project_id,
          name,
          concurrency_limit,
          priority,
          is_paused,
          created_at,
          updated_at
      `,
      [queueId, name, concurrencyLimit, priority]
    );

    const retryPolicyResult = await client.query(
      `
        UPDATE retry_policies
        SET
          strategy = $2,
          base_delay_ms = $3,
          max_delay_ms = $4,
          max_attempts = $5
        WHERE queue_id = $1
        RETURNING
          id,
          queue_id,
          strategy,
          base_delay_ms,
          max_delay_ms,
          max_attempts
      `,
      [
        queueId,
        retryPolicy.strategy,
        retryPolicy.baseDelayMs,
        retryPolicy.maxDelayMs,
        retryPolicy.maxAttempts,
      ]
    );

    await client.query("COMMIT");

    return {
      ...queueResult.rows[0],
      retry_policy: retryPolicyResult.rows[0],
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const setQueuePausedState = async (
  queueId,
  isPaused
) => {
  const result = await pool.query(
    `
      UPDATE queues
      SET
        is_paused = $2,
        updated_at = now()
      WHERE id = $1
      RETURNING
        id,
        project_id,
        name,
        concurrency_limit,
        priority,
        is_paused,
        created_at,
        updated_at
    `,
    [queueId, isPaused]
  );

  return result.rows[0] ?? null;
};

export const deleteQueue = async (queueId) => {
  const result = await pool.query(
    `
      DELETE FROM queues
      WHERE id = $1
      RETURNING id, project_id, name
    `,
    [queueId]
  );

  return result.rows[0] ?? null;
};

export const findQueueStatistics = async (queueId) => {
  const result = await pool.query(
    `
      WITH job_stats AS (
        SELECT
          COUNT(*)::INT AS total_jobs,

          COUNT(*) FILTER (
            WHERE status = 'pending'
          )::INT AS pending_jobs,

          COUNT(*) FILTER (
            WHERE status = 'pending'
              AND available_at <= now()
          )::INT AS ready_jobs,

          COUNT(*) FILTER (
            WHERE status = 'pending'
              AND available_at > now()
          )::INT AS scheduled_jobs,

          COUNT(*) FILTER (
            WHERE status = 'running'
          )::INT AS running_jobs,

          COUNT(*) FILTER (
            WHERE status = 'succeeded'
          )::INT AS succeeded_jobs,

          COUNT(*) FILTER (
            WHERE status = 'failed'
          )::INT AS failed_jobs,

          COUNT(*) FILTER (
            WHERE status = 'dead'
          )::INT AS dead_jobs
        FROM jobs
        WHERE queue_id = $1
      ),

      execution_stats AS (
        SELECT
          COUNT(*) FILTER (
            WHERE je.status = 'succeeded'
              AND je.finished_at >= now() - INTERVAL '1 hour'
          )::INT AS completed_last_hour,

          COUNT(*) FILTER (
            WHERE je.status = 'failed'
              AND je.finished_at >= now() - INTERVAL '1 hour'
          )::INT AS failed_attempts_last_hour,

          COALESCE(
            AVG(
              EXTRACT(
                EPOCH FROM (je.finished_at - je.started_at)
              ) * 1000
            ) FILTER (
              WHERE je.status = 'succeeded'
                AND je.finished_at IS NOT NULL
            ),
            0
          )::DOUBLE PRECISION AS average_execution_time_ms
        FROM job_executions je
        INNER JOIN jobs j
          ON j.id = je.job_id
        WHERE j.queue_id = $1
      )

      SELECT
        q.id AS queue_id,
        q.name,
        q.is_paused,
        js.total_jobs,
        js.pending_jobs,
        js.ready_jobs,
        js.scheduled_jobs,
        js.running_jobs,
        js.succeeded_jobs,
        js.failed_jobs,
        js.dead_jobs,
        es.completed_last_hour,
        es.failed_attempts_last_hour,
        es.average_execution_time_ms
      FROM queues q
      CROSS JOIN job_stats js
      CROSS JOIN execution_stats es
      WHERE q.id = $1
    `,
    [queueId]
  );

  return result.rows[0] ?? null;
};
