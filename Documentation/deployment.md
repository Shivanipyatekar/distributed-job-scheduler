# Deployment

## Required Components

A complete deployment consists of:

```text
React Frontend
Express API
PostgreSQL
Worker Service
Cron Materializer
```

## Recommended Separation

### Frontend Service

Build and host the Vite/React application.

Typical build:

```bash
cd frontend
npm install
npm run build
```

Configure the frontend to call the deployed API.

### API Service

```bash
cd backend
npm install
npm run migrate
npm start
```

Required production environment variables include the PostgreSQL connection and JWT secret values expected by `src/config/env.js`.

### PostgreSQL

Use a persistent managed PostgreSQL instance for deployment.

Do not use a local development database for a hosted application.

### Worker Service

Run:

```bash
node src/worker.js
```

as a continuously running worker process.

The API service alone does not execute jobs.

### Cron Materializer

Keep the cron materializer running continuously so due recurring schedules are converted into concrete jobs.

## Worker Scaling

Workers are horizontally scalable.

One replica:

```text
Worker Service × 1
```

can later become:

```text
Worker Service × 5
```

Each worker self-registers and begins polling.

No manual worker row creation is required.

## Why Scaling Is Safe

PostgreSQL transactional locking and `FOR UPDATE SKIP LOCKED` prevent workers from selecting already claimed job rows.

Queue concurrency limits further control how many jobs from a queue can run simultaneously.

## Deployment Health Checklist

Before final demonstration:

- frontend loads,
- API health endpoint returns 200,
- PostgreSQL migrations are current,
- login works,
- worker is online,
- worker heartbeats appear,
- immediate job executes,
- delayed job remains pending until due,
- queue pause prevents claims,
- cron schedule materializes,
- intentional failure retries,
- exhausted failure appears in DLQ,
- DLQ requeue works,
- worker monitoring displays status,
- metrics page loads.

## Security

Production deployment should use:

- HTTPS,
- strong JWT secret,
- managed database credentials,
- restricted CORS configuration,
- secrets stored in platform environment settings,
- no committed `.env` file.

## Production Extensions

Possible future improvements:

- Docker images,
- Kubernetes deployment,
- autoscaling,
- centralized logs,
- OpenTelemetry,
- Redis,
- dedicated message broker,
- alerting,
- rate limiting,
- CI/CD.
