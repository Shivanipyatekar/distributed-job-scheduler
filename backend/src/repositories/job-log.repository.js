import { pool } from "../config/database.js";

export const createJobLog = async (
  {
    jobId,
    executionId = null,
    level = "info",
    message,
  },
  database = pool,
) => {
  const query = `
    INSERT INTO job_logs (
      job_id,
      execution_id,
      level,
      message,
      created_at
    )
    VALUES ($1, $2, $3, $4, NOW())
    RETURNING
      id,
      job_id,
      execution_id,
      level,
      message,
      created_at
  `;

  const { rows } = await database.query(query, [
    jobId,
    executionId,
    level,
    message,
  ]);

  return rows[0];
};
export const getJobLogs = async (
  {
    jobId,
    level = null,
    limit,
    offset,
  },
  database = pool,
) => {
  const query = `
    SELECT
      jl.id,
      jl.job_id,
      jl.execution_id,
      jl.level,
      jl.message,
      jl.created_at,
      je.attempt_no,
      je.status AS execution_status,
      COUNT(*) OVER()::integer AS total_count
    FROM job_logs jl
    LEFT JOIN job_executions je
      ON je.id = jl.execution_id
    WHERE jl.job_id = $1
      AND (
        $2::text IS NULL OR
        jl.level = $2
      )
    ORDER BY jl.created_at DESC, jl.id DESC
    LIMIT $3
    OFFSET $4
  `;

  const { rows } = await database.query(query, [
    jobId,
    level,
    limit,
    offset,
  ]);

  const total = rows[0]?.total_count ?? 0;

  const logs = rows.map(
    ({ total_count: _totalCount, ...log }) => log,
  );

  return {
    logs,
    total,
  };
};
