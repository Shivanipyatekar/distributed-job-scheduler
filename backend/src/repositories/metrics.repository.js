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

export const findProjectSummary = async ({
  projectId,
  windowHours,
  staleAfterSeconds,
}) => {
  const query = `
    WITH job_stats AS (
      SELECT
        COUNT(*)::integer AS total_jobs,
        (
          COUNT(*) FILTER (
            WHERE status = 'pending'
          )
        )::integer AS pending_jobs,
        (
          COUNT(*) FILTER (
            WHERE status = 'running'
          )
        )::integer AS running_jobs,
        (
          COUNT(*) FILTER (
            WHERE status = 'succeeded'
          )
        )::integer AS succeeded_jobs,
        (
          COUNT(*) FILTER (
            WHERE status = 'failed'
          )
        )::integer AS failed_jobs,
        (
          COUNT(*) FILTER (
            WHERE status = 'dead'
          )
        )::integer AS dead_jobs,
        (
          COUNT(*) FILTER (
            WHERE created_at >=
              NOW() - (
                $2::integer * INTERVAL '1 hour'
              )
          )
        )::integer AS created_in_window,
        (
          COUNT(*) FILTER (
            WHERE status = 'succeeded'
              AND updated_at >=
                NOW() - (
                  $2::integer * INTERVAL '1 hour'
                )
          )
        )::integer AS succeeded_in_window,
        (
          COUNT(*) FILTER (
            WHERE status = 'failed'
              AND updated_at >=
                NOW() - (
                  $2::integer * INTERVAL '1 hour'
                )
          )
        )::integer AS failed_in_window,
        (
          COUNT(*) FILTER (
            WHERE status = 'dead'
              AND updated_at >=
                NOW() - (
                  $2::integer * INTERVAL '1 hour'
                )
          )
        )::integer AS dead_in_window
      FROM jobs
      WHERE project_id = $1
    ),
    queue_stats AS (
      SELECT
        COUNT(*)::integer AS total_queues,
        (
          COUNT(*) FILTER (
            WHERE is_paused = true
          )
        )::integer AS paused_queues
      FROM queues
      WHERE project_id = $1
    ),
    worker_stats AS (
      SELECT
        (
          COUNT(*) FILTER (
            WHERE status = 'online'
              AND last_seen_at >=
                NOW() - (
                  $3::integer * INTERVAL '1 second'
                )
          )
        )::integer AS online_workers,
        (
          COUNT(*) FILTER (
            WHERE status = 'draining'
          )
        )::integer AS draining_workers,
        (
          COUNT(*) FILTER (
            WHERE status = 'offline'
          )
        )::integer AS offline_workers,
        (
          COUNT(*) FILTER (
            WHERE status <> 'offline'
              AND last_seen_at <
                NOW() - (
                  $3::integer * INTERVAL '1 second'
                )
          )
        )::integer AS stale_workers
      FROM workers
    ),
    execution_stats AS (
      SELECT
        COUNT(*)::integer AS executions_in_window,
        (
          COUNT(*) FILTER (
            WHERE je.status = 'failed'
          )
        )::integer AS failed_attempts_in_window,
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
        )::double precision
          AS average_execution_duration_ms
      FROM job_executions je
      JOIN jobs j
        ON j.id = je.job_id
      WHERE j.project_id = $1
        AND je.started_at >=
          NOW() - (
            $2::integer * INTERVAL '1 hour'
          )
    ),
    dead_letter_stats AS (
      SELECT
        COUNT(*)::integer AS dead_letter_entries
      FROM dead_letter_queue dlq
      JOIN queues q
        ON q.id = dlq.queue_id
      WHERE q.project_id = $1
    )
    SELECT
      js.*,
      qs.total_queues,
      qs.paused_queues,
      ws.online_workers,
      ws.draining_workers,
      ws.offline_workers,
      ws.stale_workers,
      es.executions_in_window,
      es.failed_attempts_in_window,
      COALESCE(
        es.average_execution_duration_ms,
        0
      ) AS average_execution_duration_ms,
      dls.dead_letter_entries,
      (
        CASE
          WHEN (
            js.succeeded_in_window +
            js.failed_in_window +
            js.dead_in_window
          ) = 0
            THEN 0
          ELSE ROUND(
            (
              js.succeeded_in_window * 100.0
            ) / (
              js.succeeded_in_window +
              js.failed_in_window +
              js.dead_in_window
            ),
            2
          )
        END
      )::double precision AS success_rate_pct
    FROM job_stats js
    CROSS JOIN queue_stats qs
    CROSS JOIN worker_stats ws
    CROSS JOIN execution_stats es
    CROSS JOIN dead_letter_stats dls
  `;

  const { rows } = await pool.query(query, [
    projectId,
    windowHours,
    staleAfterSeconds,
  ]);

  return rows[0];
};

export const findQueueMetrics = async ({
  projectId,
}) => {
  const query = `
    SELECT
      q.id,
      q.name,
      q.priority,
      q.concurrency_limit,
      q.is_paused,
      q.created_at,
      job_stats.total_jobs,
      job_stats.pending_jobs,
      job_stats.running_jobs,
      job_stats.succeeded_jobs,
      job_stats.failed_jobs,
      job_stats.dead_jobs,
      job_stats.average_attempts,
      job_stats.succeeded_last_hour,
      dead_letter_stats.dead_letter_entries
    FROM queues q
    LEFT JOIN LATERAL (
      SELECT
        COUNT(*)::integer AS total_jobs,
        (
          COUNT(*) FILTER (
            WHERE j.status = 'pending'
          )
        )::integer AS pending_jobs,
        (
          COUNT(*) FILTER (
            WHERE j.status = 'running'
          )
        )::integer AS running_jobs,
        (
          COUNT(*) FILTER (
            WHERE j.status = 'succeeded'
          )
        )::integer AS succeeded_jobs,
        (
          COUNT(*) FILTER (
            WHERE j.status = 'failed'
          )
        )::integer AS failed_jobs,
        (
          COUNT(*) FILTER (
            WHERE j.status = 'dead'
          )
        )::integer AS dead_jobs,
        COALESCE(
          AVG(j.attempt_count),
          0
        )::double precision AS average_attempts,
        (
          COUNT(*) FILTER (
            WHERE j.status = 'succeeded'
              AND j.updated_at >=
                NOW() - INTERVAL '1 hour'
          )
        )::integer AS succeeded_last_hour
      FROM jobs j
      WHERE j.queue_id = q.id
    ) job_stats
      ON TRUE
    LEFT JOIN LATERAL (
      SELECT
        COUNT(*)::integer AS dead_letter_entries
      FROM dead_letter_queue dlq
      WHERE dlq.queue_id = q.id
    ) dead_letter_stats
      ON TRUE
    WHERE q.project_id = $1
    ORDER BY
      q.priority DESC,
      q.created_at ASC
  `;

  const { rows } = await pool.query(query, [
    projectId,
  ]);

  return rows;
};

export const findThroughputSeries = async ({
  projectId,
  windowHours,
  bucketMinutes,
}) => {
  const query = `
    WITH settings AS (
      SELECT
        (
          $2::integer * INTERVAL '1 hour'
        ) AS window_interval,
        (
          $3::integer * INTERVAL '1 minute'
        ) AS bucket_interval
    ),
    bounds AS (
      SELECT
        window_interval,
        bucket_interval,
        NOW() - window_interval AS window_start,
        date_bin(
          bucket_interval,
          NOW() - window_interval,
          TIMESTAMPTZ '2000-01-01'
        ) AS first_bucket,
        date_bin(
          bucket_interval,
          NOW(),
          TIMESTAMPTZ '2000-01-01'
        ) AS last_bucket
      FROM settings
    ),
    buckets AS (
      SELECT
        generate_series(
          first_bucket,
          last_bucket,
          bucket_interval
        ) AS bucket_start,
        bucket_interval
      FROM bounds
    ),
    created_events AS (
      SELECT
        date_bin(
          b.bucket_interval,
          j.created_at,
          TIMESTAMPTZ '2000-01-01'
        ) AS bucket_start,
        COUNT(*)::integer AS created_jobs
      FROM jobs j
      CROSS JOIN bounds b
      WHERE j.project_id = $1
        AND j.created_at >= b.window_start
      GROUP BY 1
    ),
    terminal_events AS (
      SELECT
        date_bin(
          b.bucket_interval,
          j.updated_at,
          TIMESTAMPTZ '2000-01-01'
        ) AS bucket_start,
        (
          COUNT(*) FILTER (
            WHERE j.status = 'succeeded'
          )
        )::integer AS succeeded_jobs,
        (
          COUNT(*) FILTER (
            WHERE j.status = 'failed'
          )
        )::integer AS failed_jobs,
        (
          COUNT(*) FILTER (
            WHERE j.status = 'dead'
          )
        )::integer AS dead_jobs
      FROM jobs j
      CROSS JOIN bounds b
      WHERE j.project_id = $1
        AND j.updated_at >= b.window_start
        AND j.status IN (
          'succeeded',
          'failed',
          'dead'
        )
      GROUP BY 1
    )
    SELECT
      buckets.bucket_start,
      buckets.bucket_start +
        buckets.bucket_interval AS bucket_end,
      COALESCE(
        created_events.created_jobs,
        0
      )::integer AS created_jobs,
      COALESCE(
        terminal_events.succeeded_jobs,
        0
      )::integer AS succeeded_jobs,
      COALESCE(
        terminal_events.failed_jobs,
        0
      )::integer AS failed_jobs,
      COALESCE(
        terminal_events.dead_jobs,
        0
      )::integer AS dead_jobs
    FROM buckets
    LEFT JOIN created_events
      ON created_events.bucket_start =
        buckets.bucket_start
    LEFT JOIN terminal_events
      ON terminal_events.bucket_start =
        buckets.bucket_start
    ORDER BY buckets.bucket_start ASC
  `;

  const { rows } = await pool.query(query, [
    projectId,
    windowHours,
    bucketMinutes,
  ]);

  return rows;
};
