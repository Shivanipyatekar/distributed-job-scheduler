# Worker Lifecycle

Workers are independently running backend processes.

They are **not manually created through the frontend**.

## Startup

Starting:

```bash
node src/worker.js
```

causes the worker to register itself.

Registration records information such as:

- worker ID,
- hostname,
- process ID,
- status,
- start time,
- last seen time.

## Online State

After registration, the worker:

1. starts heartbeats,
2. starts polling,
3. claims work up to configured worker concurrency.

## Heartbeats

Heartbeats provide health information such as:

- timestamp,
- CPU percentage,
- memory usage.

Worker monitoring combines this with:

- uptime,
- execution totals,
- failures/successes,
- active jobs,
- average duration.

## Claim Loop

```text
poll
 ↓
find eligible queue
 ↓
check queue concurrency
 ↓
find eligible job
 ↓
FOR UPDATE SKIP LOCKED
 ↓
mark running
 ↓
execute
```

## Local Multi-worker Demonstration

Run the worker command in multiple terminals.

Each process registers independently even if all use the same machine.

```text
Worker 1  hostname=sneha-pc  PID=...
Worker 2  hostname=sneha-pc  PID=...
Worker 3  hostname=sneha-pc  PID=...
```

They are still separate worker processes.

## Graceful Shutdown

On controlled shutdown, the worker transitions through its draining/offline lifecycle instead of abruptly accepting new work.

## Stale Worker Recovery

The implementation uses a stale threshold to detect workers that stopped heartbeating.

Recovery handles jobs that were locked/running on the stale worker.

### Attempts Remain

```text
worker stale
 ↓
execution crashed
 ↓
job pending again
 ↓
worker offline
```

### Attempts Exhausted

```text
worker stale
 ↓
execution crashed
 ↓
job dead
 ↓
DLQ entry
 ↓
worker offline
```

## Deployment

A worker is deployed as a service/process separate from the API.

Scaling workers means scaling process/container replicas, not inserting rows manually.

```text
PostgreSQL
   ↑
 ┌─┼───────────────┐
 │ │               │
Worker 1        Worker 2        Worker 3
```

Each replica self-registers when it starts.
