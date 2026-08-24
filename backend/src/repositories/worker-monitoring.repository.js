import { pool } from "../config/database.js";

export const hasProjectAccess = async ({
  projectId,
  userId,
}) => {
  const query = `
    SELECT 1
    FROM projects p
    JOIN organization_members om
      ON om.organization_id = p.organization_id
    WHERE p.id = $1
      AND om.user_id = $2
  `;

  const { rowCount } = await pool.query(query, [
    projectId,
    userId,
  ]);

  return rowCount > 0;
};

const queryWorkers = async ({
  projectId,
  staleAfterSeconds,
  workerId = null,
}) => {
  const query = `
    SELECT
      w.id,
      w.hostname,
      w.pid,
      w.status,
      w.started_at,
      w.last_seen_at,
      CASE
        WHEN w.status = 'offline'
          THEN 'offline'
        WHEN w.last_seen_at <
          NOW() - (
            $2::integer * INTERVAL '1 second'
          )
          THEN 'stale'
        ELSE w.status
      END AS health_status,
      (
        EXTRACT(
          EPOCH FROM (NOW() - w.started_at)
        )
      )::double precision AS uptime_seconds,
      latest_heartbeat.heartbeat_at,
      latest_heartbeat.cpu_pct,
      latest_heartbeat.memory_mb,
      COALESCE(
        execution_stats.total_executions,
        0
      ) AS project_total_executions,
      COALESCE(
        execution_stats.succeeded_executions,
        0
      ) AS project_succeeded_executions,
      COALESCE(
        execution_stats.failed_executions,
        0
      ) AS project_failed_executions,
      execution_stats.average_duration_ms,
      execution_stats.last_execution_at,
      COALESCE(
        active_stats.active_jobs,
        0
      ) AS project_active_jobs
    FROM workers w
    LEFT JOIN LATERAL (
      SELECT
        wh.heartbeat_at,
        wh.cpu_pct,
        wh.memory_mb
      FROM worker_heartbeats wh
      WHERE wh.worker_id = w.id
      ORDER BY wh.heartbeat_at DESC
      LIMIT 1
    ) latest_heartbeat
      ON TRUE
    LEFT JOIN LATERAL (
      SELECT
        COUNT(*)::integer AS total_executions,
        COUNT(*) FILTER (
          WHERE je.status = 'succeeded'
        )::integer AS succeeded_executions,
        COUNT(*) FILTER (
          WHERE je.status = 'failed'
        )::integer AS failed_executions,
        (
          AVG(
            EXTRACT(
              EPOCH FROM (
                je.finished_at - je.started_at
              )
            ) * 1000
          ) FILTER (
            WHERE je.finished_at IS NOT NULL
          )
        )::double precision AS average_duration_ms,
        MAX(je.started_at) AS last_execution_at
      FROM job_executions je
      JOIN jobs j
        ON j.id = je.job_id
      WHERE je.worker_id = w.id
        AND j.project_id = $1
    ) execution_stats
      ON TRUE
    LEFT JOIN LATERAL (
      SELECT
        COUNT(*)::integer AS active_jobs
      FROM jobs j
      WHERE j.locked_by = w.id
        AND j.project_id = $1
        AND j.status = 'running'
    ) active_stats
      ON TRUE
    WHERE (
      $3::uuid IS NULL OR
      w.id = $3
    )
    ORDER BY
      CASE w.status
        WHEN 'online' THEN 1
        WHEN 'draining' THEN 2
        ELSE 3
      END,
      w.last_seen_at DESC
  `;

  const { rows } = await pool.query(query, [
    projectId,
    staleAfterSeconds,
    workerId,
  ]);

  return rows;
};

export const findWorkersForProject = async ({
  projectId,
  staleAfterSeconds,
}) => {
  return queryWorkers({
    projectId,
    staleAfterSeconds,
  });
};

export const findWorkerForProject = async ({
  projectId,
  workerId,
  staleAfterSeconds,
}) => {
  const workers = await queryWorkers({
    projectId,
    workerId,
    staleAfterSeconds,
  });

  return workers[0] ?? null;
};

export const findWorkerHeartbeats = async ({
  workerId,
  limit,
}) => {
  const query = `
    SELECT
      id,
      worker_id,
      heartbeat_at,
      cpu_pct,
      memory_mb
    FROM worker_heartbeats
    WHERE worker_id = $1
    ORDER BY heartbeat_at DESC
    LIMIT $2
  `;

  const { rows } = await pool.query(query, [
    workerId,
    limit,
  ]);

  return rows;
};

export const findWorkerRecentExecutions = async ({
  workerId,
  projectId,
  limit,
}) => {
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
      j.queue_id,
      j.type AS job_type,
      q.name AS queue_name
    FROM job_executions je
    JOIN jobs j
      ON j.id = je.job_id
    JOIN queues q
      ON q.id = j.queue_id
    WHERE je.worker_id = $1
      AND j.project_id = $2
    ORDER BY je.started_at DESC
    LIMIT $3
  `;

  const { rows } = await pool.query(query, [
    workerId,
    projectId,
    limit,
  ]);

  return rows;
};

export const findWorkerActiveJobs = async ({
  workerId,
  projectId,
}) => {
  const query = `
    SELECT
      j.id,
      j.queue_id,
      j.type,
      j.status,
      j.priority,
      j.attempt_count,
      j.max_attempts,
      j.locked_at,
      q.name AS queue_name
    FROM jobs j
    JOIN queues q
      ON q.id = j.queue_id
    WHERE j.locked_by = $1
      AND j.project_id = $2
      AND j.status = 'running'
    ORDER BY j.locked_at ASC
  `;

  const { rows } = await pool.query(query, [
    workerId,
    projectId,
  ]);

  return rows;
};
