# Design Decisions and Trade-offs

This document records the main engineering choices behind the Distributed Job Scheduler.

## 1. PostgreSQL as Both System of Record and Queue Coordinator

### Decision
Use PostgreSQL for application state and job coordination.

### Why
The assignment emphasizes concurrency, reliability and database design. PostgreSQL transactions and row locks provide the primitives needed for safe claims.

### Trade-off
A dedicated broker such as Kafka, RabbitMQ or Redis-based queues could provide higher specialized throughput, but would increase infrastructure complexity.

For the assignment scale, PostgreSQL keeps the architecture understandable while still demonstrating real distributed coordination.

---

## 2. `FOR UPDATE SKIP LOCKED` for Atomic Job Claims

### Decision
Workers select eligible work inside a transaction using row-level locks and `SKIP LOCKED`.

### Benefits
- prevents two workers from claiming the same row,
- avoids blocking on work another worker is claiming,
- supports multiple concurrent workers,
- remains fully transactional.

### Trade-off
Claim throughput depends on the relational database and query/index design.

---

## 3. API and Worker as Separate Processes

### Decision
The Express API creates/manages work while workers execute jobs independently.

### Benefits
- API responsiveness is not tied to job duration,
- workers can scale independently,
- a worker crash does not require API restart,
- deployment more closely resembles real background-processing systems.

### Trade-off
Deployment requires multiple process types.

---

## 4. Polling Instead of Push Delivery

### Decision
Workers poll PostgreSQL at a configured interval.

### Benefits
- simple,
- reliable,
- no broker dependency,
- easy to reason about.

### Trade-off
Polling creates some database load and introduces bounded pickup latency.

---

## 5. Queue-Level Concurrency Control

### Decision
Each queue defines a concurrency limit.

Workers only claim from queues whose running-job count is below the configured limit.

### Benefit
Protects downstream systems from too many concurrent executions.

### Trade-off
The concurrency check must be coordinated transactionally as worker count increases.

---

## 6. Priority at Queue and Job Level

### Decision
Queue/job priority influences scheduling order.

### Benefit
Urgent workloads can move ahead of lower-priority work.

### Trade-off
A constant stream of high-priority jobs can delay lower-priority work, so priority policy must be used carefully.

---

## 7. Delayed Jobs via `available_at`

### Decision
Delayed and scheduled jobs remain in the jobs table but cannot be claimed until their availability timestamp.

### Benefit
No secondary scheduling infrastructure is required for one-time delayed work.

### Trade-off
Efficient polling depends on indexes around state and availability.

---

## 8. Recurring Jobs as Schedule Definitions + Materialization

### Decision
Cron schedules are stored separately. A materializer creates concrete jobs as schedules become due.

### Benefit
Each occurrence becomes a normal job and therefore receives the same execution, retry, log and DLQ behavior.

### Trade-off
The materializer becomes an additional long-running runtime component.

---

## 9. Queue Retry Policies

### Decision
Support fixed, linear and exponential retry delay strategies.

### Benefit
Different workloads can select an appropriate retry pattern.

- fixed: predictable delay,
- linear: gradual increase,
- exponential: strong backoff for unstable dependencies.

### Trade-off
Retry policies add operational complexity and must be capped to avoid excessive delays.

---

## 10. Separate Dead Letter Queue

### Decision
Jobs that exhaust attempts become dead and receive a DLQ record.

### Benefit
Permanent failures become explicitly visible and can be inspected/requeued.

### Trade-off
The job and DLQ states must remain transactionally consistent.

---

## 11. Execution History Separate from Job State

### Decision
Keep current job state in `jobs`, but store every attempt in `job_executions`.

### Benefit
Provides an audit/history model without overwriting previous attempt information.

### Trade-off
Additional storage grows with the number of attempts.

---

## 12. Dedicated Job Logs

### Decision
Execution events are persisted in a job log table.

### Benefit
The UI/API can explain what happened to an individual job.

### Trade-off
Production systems may additionally send logs to centralized observability infrastructure.

---

## 13. Worker Heartbeats

### Decision
Workers periodically write heartbeat data and update last-seen information.

### Benefit
The system can distinguish active from stale/offline workers.

### Trade-off
Heartbeats create recurring write traffic.

---

## 14. Stale Worker Recovery

### Decision
Workers that stop heartbeating beyond the stale threshold are recovered.

Affected running work is either:

- requeued when attempts remain, or
- marked dead and moved to DLQ when attempts are exhausted.

### Benefit
A worker crash does not permanently strand jobs in `running`.

### Trade-off
The stale threshold must balance failure-detection speed against false positives during temporary pauses.

---

## 15. JWT Authentication + Organization RBAC

### Decision
Use JWT for user sessions and Owner/Admin/Member authorization at organization scope.

### Benefit
Separates authentication from authorization and gives meaningful access control for a multi-user management platform.

### Trade-off
Role-aware service/repository queries are more complex than globally accessible resources.

---

## 16. Project API Key Rotation

### Decision
Projects support generated/rotated API credentials and avoid repeatedly exposing the secret.

### Benefit
Supports integration-oriented project access and safer secret lifecycle.

### Trade-off
Clients must store newly issued credentials securely.

---

## 17. Modular Backend Layers

### Decision
Separate routes, controllers, services, repositories, validators, middleware and utilities.

### Benefit
Improves maintainability, testability and separation of concerns.

### Trade-off
More files and indirection than a small monolithic Express script.

---

## 18. React Query for Frontend Server State

### Decision
Use TanStack Query for remote data fetching/caching/mutations.

### Benefit
Provides cache invalidation, loading/error states and polling behavior appropriate for a monitoring dashboard.

### Trade-off
Introduces a state-management abstraction beyond basic React state.

---

# Summary

The architecture intentionally favors correctness, transactional behavior and explainability over maximum theoretical throughput.

For a production system operating at much larger scale, likely extensions would include:

- dedicated message broker,
- Redis caching/coordination,
- OpenTelemetry,
- centralized logs,
- Kubernetes autoscaling,
- rate limiting,
- event-driven dashboard updates,
- managed PostgreSQL replicas/partitioning.

Those are extensions, not requirements for demonstrating the core distributed scheduling concepts in this implementation.
