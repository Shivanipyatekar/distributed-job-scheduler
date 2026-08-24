import { pool } from "../config/database.js";

export const createJob = async ({
  queueId,
  projectId,
  userId,
  type,
  payload,
  priority = null,
  maxAttempts = null,
  availableAt = null,
}) => {
  const query = `
    INSERT INTO jobs (
      queue_id,
      project_id,
      type,
      payload,
      priority,
      max_attempts,
      available_at
    )
    SELECT
      q.id,
      p.id,
      $4,
      $5::jsonb,
      COALESCE($6::smallint, q.priority),
      COALESCE($7::integer, rp.max_attempts, 5),
      COALESCE($8::timestamptz, NOW())
    FROM queues q
    JOIN projects p
      ON p.id = q.project_id
    JOIN organization_members om
      ON om.organization_id = p.organization_id
    LEFT JOIN retry_policies rp
      ON rp.queue_id = q.id
    WHERE q.id = $1
      AND p.id = $2
      AND om.user_id = $3
    RETURNING *;
  `;

  const values = [
    queueId,
    projectId,
    userId,
    type,
    JSON.stringify(payload ?? {}),
    priority,
    maxAttempts,
    availableAt,
  ];

  const result = await pool.query(query, values);

  return result.rows[0] ?? null;
};


export const findJobsByQueueForUser = async ({
  projectId,
  queueId,
  userId,
  status = null,
  type = null,
  limit,
  offset,
}) => {
  const conditions = [
    "p.id = $1",
    "q.id = $2",
    "om.user_id = $3",
  ];

  const filterValues = [projectId, queueId, userId];

  if (status) {
    filterValues.push(status);
    conditions.push(`j.status = $${filterValues.length}`);
  }

  if (type) {
    filterValues.push(type);
    conditions.push(`j.type = $${filterValues.length}`);
  }

  const scopedQuery = `
    FROM jobs j
    JOIN queues q
      ON q.id = j.queue_id
    JOIN projects p
      ON p.id = q.project_id
      AND p.id = j.project_id
    JOIN organization_members om
      ON om.organization_id = p.organization_id
    WHERE ${conditions.join(" AND ")}
  `;

  const countQuery = `
    SELECT COUNT(*)::integer AS total
    ${scopedQuery};
  `;

  const dataValues = [...filterValues, limit, offset];
  const limitPosition = dataValues.length - 1;
  const offsetPosition = dataValues.length;

  const jobsQuery = `
    SELECT j.*
    ${scopedQuery}
    ORDER BY j.created_at DESC
    LIMIT $${limitPosition}
    OFFSET $${offsetPosition};
  `;

  const [countResult, jobsResult] = await Promise.all([
    pool.query(countQuery, filterValues),
    pool.query(jobsQuery, dataValues),
  ]);

  return {
    jobs: jobsResult.rows,
    total: Number(countResult.rows[0].total),
  };
};

export const findJobByIdForUser = async ({
  jobId,
  queueId,
  projectId,
  userId,
}) => {
  const query = `
    SELECT j.*
    FROM jobs j
    JOIN queues q
      ON q.id = j.queue_id
    JOIN projects p
      ON p.id = q.project_id
      AND p.id = j.project_id
    JOIN organization_members om
      ON om.organization_id = p.organization_id
    WHERE j.id = $1
      AND q.id = $2
      AND p.id = $3
      AND om.user_id = $4;
  `;

  const result = await pool.query(query, [
    jobId,
    queueId,
    projectId,
    userId,
  ]);

  return result.rows[0] ?? null;
};

export const updatePendingJobForUser = async ({
  jobId,
  queueId,
  projectId,
  userId,
  type = null,
  payload = null,
  priority = null,
  maxAttempts = null,
  availableAt = null,
}) => {
  const query = `
    UPDATE jobs j
    SET
      type = COALESCE($5, j.type),
      payload = COALESCE($6::jsonb, j.payload),
      priority = COALESCE($7::smallint, j.priority),
      max_attempts = COALESCE($8::integer, j.max_attempts),
      available_at = COALESCE(
        $9::timestamptz,
        j.available_at
      ),
      updated_at = NOW()
    FROM queues q
    JOIN projects p
      ON p.id = q.project_id
    JOIN organization_members om
      ON om.organization_id = p.organization_id
    WHERE j.id = $1
      AND j.queue_id = q.id
      AND q.id = $2
      AND j.project_id = p.id
      AND p.id = $3
      AND om.user_id = $4
      AND om.role IN ('owner', 'admin')
      AND j.status = 'pending'
    RETURNING j.*;
  `;

  const result = await pool.query(query, [
    jobId,
    queueId,
    projectId,
    userId,
    type,
    payload === null ? null : JSON.stringify(payload),
    priority,
    maxAttempts,
    availableAt,
  ]);

  return result.rows[0] ?? null;
};

export const deletePendingJobForUser = async ({
  jobId,
  queueId,
  projectId,
  userId,
}) => {
  const query = `
    DELETE FROM jobs j
    USING
      queues q,
      projects p,
      organization_members om
    WHERE j.id = $1
      AND j.queue_id = q.id
      AND q.id = $2
      AND q.project_id = p.id
      AND j.project_id = p.id
      AND p.id = $3
      AND om.organization_id = p.organization_id
      AND om.user_id = $4
      AND om.role IN ('owner', 'admin')
      AND j.status = 'pending'
    RETURNING j.*;
  `;

  const result = await pool.query(query, [
    jobId,
    queueId,
    projectId,
    userId,
  ]);

  return result.rows[0] ?? null;
};

export const createBatchJobs = async ({
  projectId,
  queueId,
  userId,
  jobs,
}) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const scopeResult = await client.query(
      `
        SELECT
          q.id,
          q.project_id,
          q.priority AS default_priority,
          COALESCE(
            rp.max_attempts,
            5
          ) AS default_max_attempts
        FROM queues q
        JOIN projects p
          ON p.id = q.project_id
        JOIN organization_members om
          ON om.organization_id = p.organization_id
        LEFT JOIN retry_policies rp
          ON rp.queue_id = q.id
        WHERE q.id = $1
          AND p.id = $2
          AND om.user_id = $3
        FOR SHARE OF q;
      `,
      [queueId, projectId, userId]
    );

    const scopedQueue = scopeResult.rows[0];

    if (!scopedQueue) {
      await client.query("ROLLBACK");
      return null;
    }

    const values = [];

    const placeholders = jobs.map((job, index) => {
      const position = index * 7;

      values.push(
        scopedQueue.id,
        scopedQueue.project_id,
        job.type,
        JSON.stringify(job.payload),
        job.priority ?? scopedQueue.default_priority,
        job.maxAttempts ??
          scopedQueue.default_max_attempts,
        job.availableAt
      );

      return `
        (
          $${position + 1},
          $${position + 2},
          $${position + 3},
          $${position + 4}::jsonb,
          $${position + 5}::smallint,
          $${position + 6}::integer,
          COALESCE(
            $${position + 7}::timestamptz,
            NOW()
          )
        )
      `;
    });

    const insertResult = await client.query(
      `
        INSERT INTO jobs (
          queue_id,
          project_id,
          type,
          payload,
          priority,
          max_attempts,
          available_at
        )
        VALUES ${placeholders.join(",")}
        RETURNING *;
      `,
      values
    );

    await client.query("COMMIT");

    return insertResult.rows;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
