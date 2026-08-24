# Retry Policies and Dead Letter Queue

## Retry Goal

Transient failures should not immediately become permanent job failures.

The scheduler supports configurable retries at the queue level.

## Supported Strategies

### Fixed

Every retry uses approximately the same configured base delay.

```text
1s → 1s → 1s
```

### Linear

Delay grows linearly with attempts.

Conceptually:

```text
1s → 2s → 3s
```

### Exponential

Delay grows rapidly.

Conceptually:

```text
1s → 2s → 4s → 8s
```

The configured maximum delay caps the result.

## Retry Eligibility

After an execution fails:

```text
attempt_count < max_attempts
```

means the job can be retried.

The job returns to pending with a future `available_at`.

## Retry Exhaustion

When no attempts remain:

```text
job.status = dead
```

and a dead-letter record is created.

## Dead Letter Queue

The DLQ stores context including:

- job,
- queue,
- payload,
- failure reason,
- attempts made,
- failure timestamp.

## Why Separate DLQ Storage?

It provides an explicit operational view of terminal failures.

The frontend can list the DLQ without mixing permanent failures into the normal pending/running workflow.

## Manual Requeue

Authorized owner/admin users can manually requeue.

The operation:

1. sets job status to pending,
2. resets attempt count,
3. sets availability to now,
4. clears worker locks,
5. removes the DLQ entry,
6. writes an informational job log.

This provides a controlled recovery path after a bug or downstream issue has been fixed.
