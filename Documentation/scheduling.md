# Scheduling

The scheduler supports four timing models.

## 1. Immediate Job

Created without a future delay/time.

```text
created
 ↓
pending + eligible now
```

## 2. Delayed Job

Created using `delayMs`.

Example concept:

```text
delayMs = 60000
```

The backend calculates a future `available_at`.

Workers ignore the job until that timestamp.

## 3. One-time Scheduled Job

Created with `scheduledAt`.

Example:

```text
2026-08-25T10:00:00.000Z
```

The job remains pending but unavailable before that time.

## 4. Recurring Cron Job

Recurring schedules are stored in `scheduled_jobs`.

A schedule contains:

- queue,
- cron expression,
- timezone,
- job template,
- active state,
- next run,
- last run.

Example:

```text
0 9 * * *
```

with:

```text
Asia/Kolkata
```

## Materialization

When a schedule is due:

```text
scheduled_job due
      ↓
cron materializer
      ↓
normal job inserted
      ↓
last_run_at updated
      ↓
next_run_at advanced
```

This is preferable to executing arbitrary work directly from the cron scheduler because every occurrence goes through the normal job pipeline:

- concurrency,
- worker claiming,
- execution history,
- retry policy,
- logs,
- DLQ.

## Activation

Schedules can be:

- activated,
- deactivated,
- updated,
- deleted.

An inactive schedule is not materialized.

## Timezones

The backend validates IANA timezone names before accepting a recurring schedule.

This avoids silently treating invalid timezone strings as valid scheduling configuration.
