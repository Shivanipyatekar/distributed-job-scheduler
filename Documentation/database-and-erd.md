# Database Design and ER Diagram
<img width="3843" height="1914" alt="er-diagram" src="https://github.com/user-attachments/assets/5c1ba641-b684-4ab5-b576-2be447490a51" />


## Main Entities

### users
Stores registered users and authentication identity.

### organizations
Top-level tenant/workspace.

### organization_members
Maps users to organizations with:

- owner,
- admin,
- member

roles.

### projects
Projects belong to organizations and provide an isolation boundary for queues, jobs, workers and metrics.

### queues
Queues belong to projects and define:

- concurrency limit,
- priority,
- pause state.

### retry_policies
Defines queue-level retry behavior such as:

- fixed,
- linear,
- exponential

with base/max delay and attempt limits.

### jobs
Represents executable work.

Important lifecycle-related fields include:

- status,
- priority,
- payload,
- available time,
- attempt count,
- max attempts,
- lock owner,
- lock timestamp.

### job_executions
Stores an immutable-style attempt history for each execution attempt.

This makes it possible to inspect:

- attempt number,
- worker,
- start/end timestamps,
- duration,
- result status,
- errors.

### job_logs
Stores job-related informational, warning and error events.

### workers
Represents independently running worker processes.

### worker_heartbeats
Stores worker health samples over time.

### scheduled_jobs
Stores recurring cron definitions, timezone information and next/last run timestamps.

### dead_letter_queue
Stores jobs that exhausted their retry attempts and require inspection or manual requeue.

## Database Design Principles

### Referential Integrity
Foreign keys protect entity relationships and cascading behavior is used where appropriate.

### Transactional Job Claiming
Claims are performed inside a transaction so worker selection, job locking and execution creation form a consistent operation.

### Concurrency Safety
`FOR UPDATE SKIP LOCKED` allows multiple workers to poll concurrently without waiting on already claimed rows.

### Indexing
Indexes are used around frequently queried scheduling/worker/job fields so polling and due-schedule lookups remain efficient.

### Separation of Current State and History
`jobs` stores the current lifecycle state while `job_executions` and `job_logs` preserve historical information.

### Explicit Dead-Letter Storage
A separate DLQ table makes permanently failed work visible and recoverable without overloading the primary jobs query path.
