import { CronExpressionParser } from "cron-parser";
import { pool } from "../config/database.js";

export const materializeDueCronSchedules = async ({
  limit = 25,
} = {}) => {
  const safeLimit =
    Number.isInteger(limit) && limit > 0
      ? Math.min(limit, 100)
      : 25;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const scheduleResult = await client.query(
      `
        SELECT
          sj.id AS schedule_id,
          sj.queue_id,
          sj.cron_expression,
          sj.payload_template,
          sj.next_run_at,
          q.project_id,
          q.priority AS queue_priority,
          rp.max_attempts AS retry_max_attempts
        FROM scheduled_jobs sj
        JOIN queues q
          ON q.id = sj.queue_id
        LEFT JOIN retry_policies rp
          ON rp.queue_id = sj.queue_id
        WHERE sj.is_active = true
          AND sj.next_run_at <= NOW()
        ORDER BY sj.next_run_at ASC
        FOR UPDATE OF sj SKIP LOCKED
        LIMIT $1
      `,
      [safeLimit],
    );

    const materializedJobs = [];

    for (const schedule of scheduleResult.rows) {
      const template = schedule.payload_template;
      const timezone = template.timezone ?? "UTC";
      const scheduledRunAt = schedule.next_run_at;

      const interval = CronExpressionParser.parse(
        schedule.cron_expression,
        {
          currentDate: new Date(),
          tz: timezone,
        },
      );

      const nextRunAt = new Date(
        interval.next().toString(),
      ).toISOString();

      const jobResult = await client.query(
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
          VALUES (
            $1,
            $2,
            $3,
            $4::jsonb,
            COALESCE($5::smallint, $6::smallint),
            COALESCE(
              $7::integer,
              $8::integer,
              5
            ),
            $9::timestamptz
          )
          RETURNING *
        `,
        [
          schedule.queue_id,
          schedule.project_id,
          template.type,
          JSON.stringify(template.payload ?? {}),
          template.priority,
          schedule.queue_priority,
          template.maxAttempts,
          schedule.retry_max_attempts,
          scheduledRunAt,
        ],
      );

      await client.query(
        `
          UPDATE scheduled_jobs
          SET
            last_run_at = $2::timestamptz,
            next_run_at = $3::timestamptz
          WHERE id = $1
        `,
        [
          schedule.schedule_id,
          scheduledRunAt,
          nextRunAt,
        ],
      );

      materializedJobs.push({
        scheduleId: schedule.schedule_id,
        job: jobResult.rows[0],
        nextRunAt,
      });
    }

    await client.query("COMMIT");

    return {
      materializedCount: materializedJobs.length,
      materializedJobs,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
