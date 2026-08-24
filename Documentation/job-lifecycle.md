# Job Lifecycle

## Primary Success Path

```text
pending
   ↓
running
   ↓
succeeded
```

## Creation

A job may be:

- immediate,
- delayed,
- scheduled for a specific time,
- materialized from a recurring cron schedule,
- created as part of a batch.

A job begins in `pending`.

## Eligibility

A pending job becomes claimable only when:

- its queue is not paused,
- the queue has concurrency capacity,
- `available_at <= NOW()`,
- its attempt count has not exhausted the limit.

## Claim

A worker claims a job transactionally.

The operation:

1. verifies the worker is online,
2. selects an eligible queue,
3. checks concurrency,
4. selects an eligible job,
5. locks the row,
6. updates the job to running,
7. assigns the worker,
8. increments the attempt,
9. creates an execution record,
10. writes a job log.

## Success

When execution succeeds:

- execution status is marked succeeded,
- job status is marked succeeded,
- completion/duration information becomes available through execution history.

## Failure with Attempts Remaining

```text
running
   ↓
failed attempt
   ↓
retry delay calculated
   ↓
pending
   ↓
available_at in future
```

The same job can later be claimed again.

## Retry Exhaustion

```text
running
   ↓
failed
   ↓
attempt limit reached
   ↓
dead
   ↓
dead_letter_queue
```

## Manual Recovery

An owner/admin can requeue a DLQ entry:

```text
dead
 ↓
manual requeue
 ↓
pending
```

The attempt count is reset and the dead-letter entry is removed.

## Historical Visibility

The current job row is complemented by:

- `job_executions` — attempt history,
- `job_logs` — lifecycle/event logs,
- `dead_letter_queue` — permanent failure context.

This allows the frontend to show not just the current state but how the job reached that state.
