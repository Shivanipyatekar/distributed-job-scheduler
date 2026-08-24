# Automated Tests for Critical Functionality

The assignment requires executable automated tests for critical behavior.

The backend test stack is:

- Node.js built-in `node:test`,
- `node:assert/strict`,
- Supertest,
- PostgreSQL integration testing where persistence/concurrency matters.

Run:

```bash
cd backend
npm test
```

Watch mode:

```bash
npm run test:watch
```

## Testing Principle

Coverage percentage alone is not the goal.

The highest-value tests are the behaviors whose failure would break:

- security,
- atomicity,
- scheduling correctness,
- retries,
- recovery,
- authorization,
- DLQ behavior.

## Critical Coverage Matrix

| Area | Critical Scenario | Expected Result |
|---|---|---|
| App | Unknown public route | 404 |
| Auth | Register valid user | 201 |
| Auth | Duplicate email | 409 |
| Auth | Login valid credentials | 200 + JWT |
| Auth | Invalid password | 401 |
| Auth | Protected endpoint without JWT | 401 |
| Organization | Creator membership | Role = owner |
| Organization | Owner adds admin/member | Allowed |
| Organization | Admin assigns admin | Forbidden |
| Organization | Admin changes roles | Forbidden |
| Organization | Owner changes member role | Allowed |
| Organization | Directly demote owner | Rejected |
| Ownership | Admin transfers ownership | Forbidden |
| Ownership | Owner transfers to member | New owner + old owner becomes admin |
| Projects | Owner/admin create project | Allowed |
| Projects | Unauthorized mutation | Rejected |
| Queues | Create queue | Correct defaults/config |
| Queues | Duplicate name | Conflict |
| Queues | Pause | Worker cannot claim new job |
| Queues | Resume | Eligible again |
| Queues | Retry validation | Invalid retry config rejected |
| Jobs | Immediate job | available immediately |
| Jobs | Delayed job | unavailable before `available_at` |
| Jobs | Scheduled one-time job | available at requested time |
| Jobs | Batch | Creates requested jobs |
| Jobs | Update non-pending | Rejected |
| Jobs | Delete non-pending | Rejected |
| Claiming | Two workers claim same job | Exactly one succeeds |
| Claiming | Queue concurrency reached | Additional claim prevented |
| Claiming | Priority ordering | Highest eligible priority first |
| Claiming | Paused queue | No claim |
| Retry | Failed attempt with attempts left | Requeued with computed delay |
| Retry | Fixed strategy | Fixed delay |
| Retry | Linear strategy | Increasing linear delay |
| Retry | Exponential strategy | Exponential delay capped at max |
| DLQ | Attempts exhausted | Job dead + DLQ record |
| DLQ | Requeue dead job | Pending, attempts reset, DLQ removed |
| Worker | Worker registration | Worker online |
| Worker | Heartbeat | last_seen/heartbeat updated |
| Recovery | Stale worker | Worker becomes offline |
| Recovery | Stale running job with attempts left | Requeued |
| Recovery | Stale running job exhausted | Dead + DLQ |
| Cron | Valid schedule | next_run_at calculated |
| Cron | Invalid cron | Rejected |
| Cron | Invalid timezone | Rejected |
| Cron | Due schedule materialized | Concrete job created |
| Cron | Materialization | next_run_at advances |
| Monitoring | Worker list | Health/execution data returned |
| Metrics | Project access | Only project organization members |

## Concurrency Test: Most Important

One of the strongest tests for the assignment is atomic claiming.

### Setup
- Create one queue.
- Create one pending eligible job.
- Register two online workers.

### Action
Call the claim function concurrently from both workers.

### Assertion

```text
worker A claim ─┐
                ├── exactly one receives job
worker B claim ─┘
```

The same job ID must never be returned to both workers.

This validates the transaction + `FOR UPDATE SKIP LOCKED` strategy.

## Queue Concurrency Test

Example:

```text
queue.concurrency_limit = 1
```

If one running job already exists, another worker must not claim another job from that queue until capacity becomes available.

## Retry/DLQ Test

Given:

```text
max_attempts = 3
```

Repeated handler failures should lead to:

```text
attempt 1 → retry
attempt 2 → retry
attempt 3 → dead → DLQ
```

Assertions should verify job state, execution rows, retry timing, DLQ insertion and logs.

## Stale Worker Recovery Test

Simulate an online worker whose last heartbeat is older than the configured stale threshold.

If it owns a running job:

- execution becomes crashed,
- job becomes pending when attempts remain,
- or job becomes dead + DLQ if exhausted,
- worker becomes offline.

## Test Database Safety

Integration tests should ideally use a dedicated test database or isolated test data.

Do not allow destructive cleanup to target a production database.

Recommended environment separation:

```text
development database
test database
production database
```

## Submission Evidence

Before submitting, run:

```bash
npm test
```

and include the successful terminal output in the repository/demo if useful.

Do not claim a test suite is passing unless the final local run actually passes.
