# System Architecture

<img width="1800" height="3120" alt="system-architecture" src="https://github.com/user-attachments/assets/bb6813a5-5e80-4a57-84d8-ab63858103d2" />


## Overview

The architecture separates the control plane from job execution.

### React Frontend

Provides the management dashboard for:

- organizations and projects,
- queues,
- jobs,
- recurring schedules,
- workers,
- dead-letter entries,
- metrics,
- API documentation.

The frontend communicates with the Express API over REST.

### Express API

The API handles:

- authentication,
- organization membership and RBAC,
- project management,
- queue configuration,
- job creation and inspection,
- cron schedule configuration,
- DLQ actions,
- worker monitoring,
- project metrics.

The API does not execute jobs directly.

### PostgreSQL

PostgreSQL is the system of record and also coordinates job claiming.

It stores:

- users,
- organizations and members,
- projects,
- queues,
- retry policies,
- jobs,
- job executions,
- job logs,
- workers,
- worker heartbeats,
- scheduled jobs,
- dead-letter entries.

### Worker Processes

Workers are independent processes.

Each worker:

1. registers itself,
2. sends heartbeats,
3. polls for eligible queues/jobs,
4. atomically claims a job,
5. creates execution records,
6. runs the job handler,
7. marks success or applies retry/DLQ behavior.

Multiple workers can safely compete for jobs.

### Atomic Claiming

The system uses PostgreSQL transactions and:

```sql
FOR UPDATE SKIP LOCKED
```

This provides a simple database-backed distributed coordination mechanism. A row locked by one worker is skipped by competing workers, preventing duplicate claims.

### Cron Materializer

Recurring schedules are definitions, not permanently pre-created jobs.

The materializer:

1. finds active schedules whose `next_run_at` is due,
2. creates concrete jobs,
3. updates `last_run_at`,
4. calculates the next occurrence,
5. advances `next_run_at`.

### Reliability Path

```text
API creates job
      ↓
PostgreSQL stores pending job
      ↓
worker claims job atomically
      ↓
execution recorded
      ↓
success OR retry
      ↓
retry exhausted
      ↓
dead-letter queue
```

### Monitoring

Workers periodically insert heartbeat information.

Worker monitoring exposes:

- online/stale/offline health,
- last seen time,
- CPU percentage,
- memory usage,
- uptime,
- active jobs,
- execution totals,
- average duration,
- recent execution history.

Stale workers are recovered by the backend worker recovery logic.
