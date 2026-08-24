import { pool } from "../config/database.js";

export const createCronSchedule = async ({
  queueId,
  projectId,
  userId,
  cronExpression,
  jobTemplate,
  nextRunAt,
}) => {
  const query = `
    INSERT INTO scheduled_jobs (
      queue_id,
      cron_expression,
      payload_template,
      is_active,
      next_run_at
    )
    SELECT
      q.id,
      $4,
      $5::jsonb,
      true,
      $6::timestamptz
    FROM queues q
    JOIN projects p
      ON p.id = q.project_id
    JOIN organization_members om
      ON om.organization_id = p.organization_id
    WHERE q.id = $1
      AND p.id = $2
      AND om.user_id = $3
      AND om.role IN ('owner', 'admin')
    RETURNING *;
  `;

  const result = await pool.query(query, [
    queueId,
    projectId,
    userId,
    cronExpression,
    JSON.stringify(jobTemplate),
    nextRunAt,
  ]);

  return result.rows[0] ?? null;
};

export const findCronSchedulesForUser = async ({
  queueId,
  projectId,
  userId,
}) => {
  const query = `
    SELECT
      sj.*,
      q.name AS queue_name,
      om.role AS organization_role
    FROM scheduled_jobs sj
    JOIN queues q
      ON q.id = sj.queue_id
    JOIN projects p
      ON p.id = q.project_id
    JOIN organization_members om
      ON om.organization_id = p.organization_id
    WHERE q.id = $1
      AND p.id = $2
      AND om.user_id = $3
    ORDER BY
      sj.is_active DESC,
      sj.next_run_at ASC,
      sj.id ASC
  `;

  const { rows } = await pool.query(query, [
    queueId,
    projectId,
    userId,
  ]);

  return rows;
};

export const findCronScheduleForUser = async ({
  scheduleId,
  queueId,
  projectId,
  userId,
}) => {
  const query = `
    SELECT
      sj.*,
      q.name AS queue_name,
      om.role AS organization_role
    FROM scheduled_jobs sj
    JOIN queues q
      ON q.id = sj.queue_id
    JOIN projects p
      ON p.id = q.project_id
    JOIN organization_members om
      ON om.organization_id = p.organization_id
    WHERE sj.id = $1
      AND q.id = $2
      AND p.id = $3
      AND om.user_id = $4
  `;

  const { rows } = await pool.query(query, [
    scheduleId,
    queueId,
    projectId,
    userId,
  ]);

  return rows[0] ?? null;
};

export const updateCronSchedule = async ({
  scheduleId,
  queueId,
  projectId,
  userId,
  cronExpression,
  jobTemplate,
  nextRunAt,
}) => {
  const query = `
    UPDATE scheduled_jobs sj
    SET
      cron_expression = $5,
      payload_template = $6::jsonb,
      next_run_at = $7::timestamptz
    FROM queues q
    JOIN projects p
      ON p.id = q.project_id
    JOIN organization_members om
      ON om.organization_id = p.organization_id
    WHERE sj.id = $1
      AND sj.queue_id = q.id
      AND q.id = $2
      AND p.id = $3
      AND om.user_id = $4
      AND om.role IN ('owner', 'admin')
    RETURNING sj.*
  `;

  const { rows } = await pool.query(query, [
    scheduleId,
    queueId,
    projectId,
    userId,
    cronExpression,
    JSON.stringify(jobTemplate),
    nextRunAt,
  ]);

  return rows[0] ?? null;
};

export const setCronScheduleActiveState = async ({
  scheduleId,
  queueId,
  projectId,
  userId,
  isActive,
  nextRunAt = null,
}) => {
  const query = `
    UPDATE scheduled_jobs sj
    SET
      is_active = $5,
      next_run_at = CASE
        WHEN $5 = true
          THEN $6::timestamptz
        ELSE sj.next_run_at
      END
    FROM queues q
    JOIN projects p
      ON p.id = q.project_id
    JOIN organization_members om
      ON om.organization_id = p.organization_id
    WHERE sj.id = $1
      AND sj.queue_id = q.id
      AND q.id = $2
      AND p.id = $3
      AND om.user_id = $4
      AND om.role IN ('owner', 'admin')
    RETURNING sj.*
  `;

  const { rows } = await pool.query(query, [
    scheduleId,
    queueId,
    projectId,
    userId,
    isActive,
    nextRunAt,
  ]);

  return rows[0] ?? null;
};

export const deleteCronSchedule = async ({
  scheduleId,
  queueId,
  projectId,
  userId,
}) => {
  const query = `
    DELETE FROM scheduled_jobs sj
    USING
      queues q,
      projects p,
      organization_members om
    WHERE sj.id = $1
      AND sj.queue_id = q.id
      AND q.id = $2
      AND q.project_id = p.id
      AND p.id = $3
      AND om.organization_id = p.organization_id
      AND om.user_id = $4
      AND om.role IN ('owner', 'admin')
    RETURNING sj.*
  `;

  const { rows } = await pool.query(query, [
    scheduleId,
    queueId,
    projectId,
    userId,
  ]);

  return rows[0] ?? null;
};
