# Distributed Job Scheduler

A production-inspired distributed job scheduling platform built with **Express.js, PostgreSQL, React, and JavaScript**.

The system supports authenticated organizations and projects, configurable queues, immediate/delayed/scheduled/recurring jobs, batch creation, distributed workers, retries, dead-letter handling, heartbeats, stale-worker recovery, execution history, logs, metrics, and a management dashboard.

## Live Deployment

| Service | URL |
|---|---|
| Frontend | [https://runline.onrender.com](https://runline.onrender.com) |
| Backend API | [https://runline-api.onrender.com](https://runline-api.onrender.com) |
| API Health | [https://runline-api.onrender.com/api/health](https://runline-api.onrender.com/api/health) |

![Distributed Job Scheduler Architecture](Documentation/images/system-architecture.png)

## Documentation

Detailed project documentation is available in the [`Documentation`](Documentation/) folder:

- [System Architecture](Documentation/architecture.md)
- [Database Design & ER Diagram](Documentation/database-and-erd.md)
- [API Documentation](Documentation/api-documentation.md)
- [Design Decisions](Documentation/design-decisions.md)
- [Automated Tests](Documentation/automated-tests.md)
- [Job Lifecycle](Documentation/job-lifecycle.md)
- [Worker Lifecycle](Documentation/worker-lifecycle.md)
- [Scheduling](Documentation/scheduling.md)
- [Retries & Dead Letter Queue](Documentation/retry-and-dlq.md)
- [RBAC](Documentation/rbac.md)
- [Deployment](Documentation/deployment.md)
- [Demo Guide](Documentation/demo-guide.md)

---

## Tech Stack

### Backend
- Node.js
- Express.js
- PostgreSQL
- `pg`
- JWT authentication
- bcrypt
- cron-parser
- ES Modules
- Node.js built-in test runner
- Supertest

### Frontend
- React
- Vite
- JavaScript
- React Router
- Axios
- TanStack Query
- Tailwind CSS
- Recharts
- Lucide React

---

## Repository Structure

```text
distributed-job-scheduler/
├── backend/
│   ├── migrations/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── database/
│   │   ├── middleware/
│   │   ├── repositories/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── validators/
│   │   ├── workers/
│   │   ├── app.js
│   │   ├── server.js
│   │   └── worker.js
│   └── tests/
├── frontend/
│   └── src/
├── Documentation/
│   └── images/
└── README.md
```

---


# Docker Setup (Recommended)

The easiest way to run the complete Runline stack locally is with Docker.

The Docker setup starts:

```text
Runline
├── PostgreSQL
├── Database migration service
├── Express API
├── Worker
│   ├── job polling
│   ├── heartbeats
│   ├── stale-worker recovery
│   └── cron materialization
└── React frontend served by Nginx
```

The API and worker use the same backend Docker image but run different commands.

---

## 1. Docker Prerequisites

Install:

- Docker
- Docker Compose

Check:

```bash
docker --version
docker-compose --version
```

On systems using Docker Compose v2:

```bash
docker compose version
```

---

## 2. Clone the Repository

```bash
git clone https://github.com/Khenwal-Sneha/distributed-job-scheduler.git
cd distributed-job-scheduler
```

---

## 3. Create Docker Environment File

Copy the safe example file:

```bash
cp .env.docker.example .env.docker
```

Edit:

```bash
nano .env.docker
```

Example:

```env
POSTGRES_USER=runline
POSTGRES_PASSWORD=replace_with_a_strong_local_password
POSTGRES_DB=job_scheduler

JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=1d

VITE_API_BASE_URL=http://localhost:5000/api/v1
```

Do not commit `.env.docker`.

Only `.env.docker.example` should be committed.

---

## 4. Build and Start the Complete Stack

Docker Compose v1:

```bash
sudo docker-compose --env-file .env.docker up --build
```

Docker Compose v2:

```bash
sudo docker compose --env-file .env.docker up --build
```

On first startup Docker will:

1. create PostgreSQL,
2. wait for PostgreSQL to become healthy,
3. run database migrations,
4. start the Express API,
5. start the worker,
6. start the React/Nginx frontend.

The migration container exits after completing successfully. Exit code `0` is expected.

---

## 5. Open Runline

Frontend:

```text
http://localhost:8080
```

Backend API:

```text
http://localhost:5000
```

Health endpoint:

```text
http://localhost:5000/api/health
```

Test:

```bash
curl http://localhost:5000/api/health
```

Expected:

```json
{
  "success": true,
  "message": "Distributed Job Scheduler API is running"
}
```

---

## 6. Docker Services

### PostgreSQL

Container:

```text
runline-postgres
```

Host port:

```text
localhost:5433
```

Port `5433` avoids conflicts with a locally installed PostgreSQL server using `5432`.

Inside Docker, backend services connect through:

```text
postgres:5432
```

### Migration Service

Runs:

```bash
npm run migrate
```

before API and worker startup.

### API

Container:

```text
runline-api
```

Runs:

```bash
npm start
```

which starts:

```text
node src/server.js
```

### Worker

Container:

```text
runline-worker
```

Runs:

```bash
node src/worker.js
```

The worker process handles:

- worker registration,
- job polling,
- atomic claims,
- concurrent execution,
- heartbeats,
- stale-worker recovery,
- graceful shutdown,
- cron materialization.

A separate cron container is not required because cron materialization is already part of the worker process.

### Frontend

Container:

```text
runline-frontend
```

The frontend uses a multi-stage build:

```text
Node.js
   ↓
Vite production build
   ↓
Nginx
```

Nginx includes React Router fallback routing so refreshing routes such as:

```text
/jobs
/workers
/dead-letter
/api-docs
```

still loads the React application correctly.

---

## 7. View Container Status

Docker Compose v1:

```bash
sudo docker-compose --env-file .env.docker ps
```

Docker Compose v2:

```bash
sudo docker compose --env-file .env.docker ps
```

Expected running services:

```text
runline-postgres
runline-api
runline-worker
runline-frontend
```

The migration service may appear as:

```text
Exited (0)
```

which is normal after successful initialization.

---

## 8. View Logs

All services:

```bash
sudo docker-compose --env-file .env.docker logs
```

API:

```bash
sudo docker-compose --env-file .env.docker logs api
```

Worker:

```bash
sudo docker-compose --env-file .env.docker logs worker
```

PostgreSQL:

```bash
sudo docker-compose --env-file .env.docker logs postgres
```

Follow continuously:

```bash
sudo docker-compose --env-file .env.docker logs -f
```

---

## 9. Stop the Stack

```bash
sudo docker-compose --env-file .env.docker down
```

This keeps the PostgreSQL volume.

To intentionally remove the Docker database volume too:

```bash
sudo docker-compose --env-file .env.docker down -v
```

---

## 10. Rebuild After Code Changes

```bash
sudo docker-compose --env-file .env.docker up --build
```

Fresh build without cache:

```bash
sudo docker-compose --env-file .env.docker build --no-cache
sudo docker-compose --env-file .env.docker up
```

---

## Docker Architecture

```text
                     Browser
                        │
                        ▼
                localhost:8080
              ┌─────────────────┐
              │ React + Nginx   │
              │    Frontend     │
              └────────┬────────┘
                       │
                       ▼
                localhost:5000
              ┌─────────────────┐
              │   Express API   │
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │   PostgreSQL    │
              └────────▲────────┘
                       │
              ┌────────┴────────┐
              │ Runline Worker  │
              │ Job polling     │
              │ Heartbeats      │
              │ Recovery        │
              │ Cron materializer
              └─────────────────┘
```

---

# Manual Setup (Without Docker)


## 1. Prerequisites

Install:

- Node.js 20+ (project developed using Node.js 22)
- npm
- PostgreSQL 16+
- Git

Confirm:

```bash
node --version
npm --version
psql --version
git --version
```

---

## 2. Clone the Repository

```bash
git clone https://github.com/Khenwal-Sneha/distributed-job-scheduler.git
cd distributed-job-scheduler
```

---

## 3. PostgreSQL Setup

Create a PostgreSQL database for the scheduler.

Example:

```bash
sudo -u postgres psql
```

Inside PostgreSQL:

```sql
CREATE DATABASE job_scheduler;
```

Exit:

```sql
\q
```

Use a PostgreSQL connection string appropriate for your local environment.

---

## 4. Backend Setup

```bash
cd backend
npm install
```

Create:

```text
backend/.env
```

Configure the environment variables expected by `src/config/env.js`.

Typical configuration:

```env
PORT=5000
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/job_scheduler
JWT_SECRET=replace_with_a_long_random_secret
```

If your local `env.js` defines additional JWT or runtime variables, include them as defined there.

### Run Database Migrations

```bash
npm run migrate
```

### Start the API

Development:

```bash
npm run dev
```

Production-style:

```bash
npm start
```

Default local API:

```text
http://localhost:5000
```

Health check:

```text
GET http://localhost:5000/api/health
```

---

## 5. Start a Worker

Workers are separate processes. They register themselves when they start.

Open another terminal:

```bash
cd backend
node src/worker.js
```

The worker will:

1. register itself,
2. send heartbeats,
3. poll for eligible jobs,
4. atomically claim jobs,
5. execute jobs,
6. update execution history and logs,
7. retry failures or move exhausted jobs to the dead-letter queue.

Multiple worker processes can be started simultaneously:

```bash
node src/worker.js
```

Each process becomes an independent worker instance.

---

## 6. Cron Materialization

Recurring schedules are stored in `scheduled_jobs`.

The cron materializer checks schedules that are due, inserts real jobs into the jobs table, and advances `next_run_at`.

Run the materializer using the project command/process currently wired to the backend deployment. In production, keep it running as a long-lived process/service alongside the API and workers.

---

## 7. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The Vite development server will print the frontend URL.

Ensure the frontend API configuration points to the backend API, for example:

```text
http://localhost:5000
```

---

## 8. Run Automated Tests

From the backend:

```bash
npm test
```

Watch mode:

```bash
npm run test:watch
```

The critical test plan is documented in:

[Documentation/automated-tests.md](Documentation/automated-tests.md)

---

# Authentication

Most `/api/v1` endpoints require a JWT.

Header:

```http
Authorization: Bearer <JWT_TOKEN>
```

Public endpoints:

```text
GET  /api/health
POST /api/v1/auth/register
POST /api/v1/auth/login
```

---

# API Reference

## Health

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | API health check |

## Authentication

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/v1/auth/register` | Register user |
| POST | `/api/v1/auth/login` | Login and receive JWT |

## Organizations & Members

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/v1/organizations` | Create organization |
| GET | `/api/v1/organizations` | List user's organizations |
| GET | `/api/v1/organizations/:organizationId` | Get organization |
| GET | `/api/v1/organizations/:organizationId/members` | List members |
| POST | `/api/v1/organizations/:organizationId/members` | Add member |
| PATCH | `/api/v1/organizations/:organizationId/members/:userId/role` | Change role |
| DELETE | `/api/v1/organizations/:organizationId/members/:userId` | Remove member |
| PATCH | `/api/v1/organizations/:organizationId/ownership` | Transfer ownership |

## Projects

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/v1/organizations/:organizationId/projects` | Create project |
| GET | `/api/v1/organizations/:organizationId/projects` | List organization projects |
| GET | `/api/v1/projects/:projectId` | Get project |
| PATCH | `/api/v1/projects/:projectId` | Update project |
| POST | `/api/v1/projects/:projectId/api-key/rotate` | Rotate project API key |
| DELETE | `/api/v1/projects/:projectId` | Delete project |

## Queues

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/v1/projects/:projectId/queues` | Create queue |
| GET | `/api/v1/projects/:projectId/queues` | List project queues |
| GET | `/api/v1/queues/:queueId` | Get queue |
| GET | `/api/v1/queues/:queueId/statistics` | Queue statistics |
| PATCH | `/api/v1/queues/:queueId` | Update queue |
| POST | `/api/v1/queues/:queueId/pause` | Pause queue |
| POST | `/api/v1/queues/:queueId/resume` | Resume queue |
| DELETE | `/api/v1/queues/:queueId` | Delete queue |

## Jobs

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/v1/projects/:projectId/queues/:queueId/jobs` | Create immediate/delayed/scheduled job |
| POST | `/api/v1/projects/:projectId/queues/:queueId/jobs/batch` | Create batch jobs |
| GET | `/api/v1/projects/:projectId/queues/:queueId/jobs` | List jobs |
| GET | `/api/v1/projects/:projectId/queues/:queueId/jobs/:jobId` | Get job |
| GET | `/api/v1/projects/:projectId/queues/:queueId/jobs/:jobId/executions` | Execution history |
| GET | `/api/v1/projects/:projectId/queues/:queueId/jobs/:jobId/logs` | Job logs |
| PATCH | `/api/v1/projects/:projectId/queues/:queueId/jobs/:jobId` | Update pending job |
| DELETE | `/api/v1/projects/:projectId/queues/:queueId/jobs/:jobId` | Delete pending job |

Job listing supports pagination and filters such as:

```text
page
limit
status
type
```

## Recurring / Cron Schedules

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/v1/projects/:projectId/queues/:queueId/cron-schedules` | Create cron schedule |
| GET | `/api/v1/projects/:projectId/queues/:queueId/cron-schedules` | List schedules |
| GET | `/api/v1/projects/:projectId/queues/:queueId/cron-schedules/:scheduleId` | Get schedule |
| PATCH | `/api/v1/projects/:projectId/queues/:queueId/cron-schedules/:scheduleId` | Update schedule |
| POST | `/api/v1/projects/:projectId/queues/:queueId/cron-schedules/:scheduleId/activate` | Activate schedule |
| POST | `/api/v1/projects/:projectId/queues/:queueId/cron-schedules/:scheduleId/deactivate` | Deactivate schedule |
| DELETE | `/api/v1/projects/:projectId/queues/:queueId/cron-schedules/:scheduleId` | Delete schedule |

## Workers

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/v1/projects/:projectId/workers` | List workers and health |
| GET | `/api/v1/projects/:projectId/workers/:workerId` | Worker details |

Worker details include heartbeat history, recent executions, and active jobs.

## Dead Letter Queue

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/v1/projects/:projectId/queues/:queueId/dead-letter` | List DLQ entries |
| GET | `/api/v1/projects/:projectId/queues/:queueId/dead-letter/:deadLetterId` | Get DLQ entry |
| POST | `/api/v1/projects/:projectId/queues/:queueId/dead-letter/:deadLetterId/requeue` | Manually requeue dead job |

## Metrics

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/v1/projects/:projectId/metrics` | Project dashboard metrics |

For request bodies, authorization rules, response behavior, and examples, see:

[Full API Documentation](Documentation/api-documentation.md)

---

# Worker Scaling

Workers are not created manually through the UI.

Each deployed worker process executes:

```bash
node src/worker.js
```

and self-registers.

Scaling from one worker to multiple workers means increasing the number of worker processes/containers:

```text
PostgreSQL
   ├── Worker 1
   ├── Worker 2
   └── Worker 3
```

Atomic claiming uses PostgreSQL row locking with `FOR UPDATE SKIP LOCKED`, preventing competing workers from claiming the same job.

---

# Core Job Lifecycle

```text
pending
   ↓
running
   ↓
succeeded
```

On failure:

```text
running
   ↓
failed attempt
   ↓
retrying / pending
   ↓
running
   ↓
...
   ↓
dead
   ↓
Dead Letter Queue
```

A DLQ job may be manually requeued.

---

# Deployment Processes

A complete deployment should run:

```text
React Frontend
Express API
PostgreSQL
Worker Service
Cron Materializer
```

The worker service can be horizontally scaled without changing the API.

See [Documentation/deployment.md](Documentation/deployment.md).

---

# License

This project was developed as a technical assignment for demonstrating backend engineering, distributed job processing, database concurrency, reliability, API design, and full-stack implementation.
