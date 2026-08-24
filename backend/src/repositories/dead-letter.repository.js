import { pool } from "../config/database.js";
import { createJobLog } from "./job-log.repository.js";

export const findDeadLetterEntriesForUser = async ({
  projectId,
  queueId,
  userId,
  limit,
  offset,
}) => {
  const query = `
    SELECT
      dlq.id,
      dlq.job_id,
      dlq.queue_id,
      dlq.payload,
      dlq.failure_reason,
      dlq.attempts_made,
      dlq.failed_at,
      j.type,
      j.status AS job_status,
      j.priority,
      j.max_attempts,
      j.attempt_count,
      j.created_at AS job_created_at,
      q.name AS queue_name,
      (COUNT(*) OVER())::integer AS total_count
    FROM dead_letter_queue dlq
    JOIN jobs j
      ON j.id = dlq.job_id
    JOIN queues q
      ON q.id = dlq.queue_id
    JOIN projects p
      ON p.id = q.project_id
      AND p.id = j.project_id
    JOIN organization_members om
      ON om.organization_id = p.organization_id
    WHERE p.id = $1
      AND q.id = $2
      AND om.user_id = $3
    ORDER BY dlq.failed_at DESC, dlq.id DESC
    LIMIT $4
    OFFSET $5
  `;

  const { rows } = await pool.query(query, [
    projectId,
    queueId,
    userId,
    limit,
    offset,
  ]);

  const total = rows[0]?.total_count ?? 0;

  const entries = rows.map(
    ({ total_count: _totalCount, ...entry }) =>
      entry,
  );

  return {
    entries,
    total,
  };
};

export const findDeadLetterEntryForUser = async ({
  deadLetterId,
  projectId,
  queueId,
  userId,
}) => {
  const query = `
    SELECT
      dlq.id,
      dlq.job_id,
      dlq.queue_id,
      dlq.payload,
      dlq.failure_reason,
      dlq.attempts_made,
      dlq.failed_at,
      j.type,
      j.status AS job_status,
      j.priority,
      j.max_attempts,
      j.attempt_count,
      j.available_at,
      j.created_at AS job_created_at,
      q.name AS queue_name,
      om.role AS organization_role
    FROM dead_letter_queue dlq
    JOIN jobs j
      ON j.id = dlq.job_id
    JOIN queues q
      ON q.id = dlq.queue_id
    JOIN projects p
      ON p.id = q.project_id
      AND p.id = j.project_id
    JOIN organization_members om
      ON om.organization_id = p.organization_id
    WHERE dlq.id = $1
      AND p.id = $2
      AND q.id = $3
      AND om.user_id = $4
  `;

  const { rows } = await pool.query(query, [
    deadLetterId,
    projectId,
    queueId,
    userId,
  ]);

  return rows[0] ?? null;
};

export const requeueDeadLetterEntry = async ({
  deadLetterId,
  projectId,
  queueId,
  userId,
}) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const entryResult = await client.query(
      `
        SELECT
          dlq.id,
          dlq.job_id,
          dlq.queue_id,
          dlq.failure_reason,
          dlq.attempts_made,
          j.status AS job_status
        FROM dead_letter_queue dlq
        JOIN jobs j
          ON j.id = dlq.job_id
        JOIN queues q
          ON q.id = dlq.queue_id
        JOIN projects p
          ON p.id = q.project_id
          AND p.id = j.project_id
        JOIN organization_members om
          ON om.organization_id = p.organization_id
        WHERE dlq.id = $1
          AND p.id = $2
          AND q.id = $3
          AND om.user_id = $4
          AND om.role IN ('owner', 'admin')
        FOR UPDATE OF dlq, j
      `,
      [
        deadLetterId,
        projectId,
        queueId,
        userId,
      ],
    );

    const entry = entryResult.rows[0];

    if (!entry) {
      await client.query("ROLLBACK");
      return null;
    }

    const jobResult = await client.query(
      `
        UPDATE jobs
        SET
          status = 'pending',
          attempt_count = 0,
          available_at = NOW(),
          locked_by = NULL,
          locked_at = NULL,
          updated_at = NOW()
        WHERE id = $1
          AND status = 'dead'
        RETURNING
          id,
          queue_id,
          project_id,
          type,
          payload,
          status,
          priority,
          max_attempts,
          attempt_count,
          available_at,
          locked_by,
          locked_at,
          created_at,
          updated_at
      `,
      [entry.job_id],
    );

    const job = jobResult.rows[0];

    if (!job) {
      throw new Error(
        "Dead-letter job is not in dead status",
      );
    }

    const deletedEntryResult = await client.query(
      `
        DELETE FROM dead_letter_queue
        WHERE id = $1
        RETURNING *
      `,
      [deadLetterId],
    );

    const log = await createJobLog(
      {
        jobId: job.id,
        level: "info",
        message:
          "Job manually requeued from the " +
          "dead-letter queue",
      },
      client,
    );

    await client.query("COMMIT");

    return {
      job,
      deadLetterEntry:
        deletedEntryResult.rows[0],
      log,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
