# Setup Instructions

## Prerequisites

- Node.js 20+
- npm
- PostgreSQL 16+
- Git

```bash
node --version
npm --version
psql --version
git --version
```

## Clone

```bash
git clone https://github.com/Khenwal-Sneha/distributed-job-scheduler.git
cd distributed-job-scheduler
```

## PostgreSQL

Create the database:

```bash
sudo -u postgres psql
```

```sql
CREATE DATABASE job_scheduler;
```

```sql
\q
```

## Backend

```bash
cd backend
npm install
```

Create `.env` and configure the values expected by `src/config/env.js`.

Typical values:

```env
PORT=5000
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/job_scheduler
JWT_SECRET=replace_with_a_long_random_secret
```

Run migrations:

```bash
npm run migrate
```

Start the API:

```bash
npm run dev
```

or:

```bash
npm start
```

Health check:

```text
GET http://localhost:5000/api/health
```

## Worker

Workers are independent processes and self-register.

```bash
cd backend
node src/worker.js
```

Open additional terminals and run the same command to demonstrate multiple workers.

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Point the frontend API configuration to the deployed/local backend.

## Tests

```bash
cd backend
npm test
```

Watch mode:

```bash
npm run test:watch
```

## Required Runtime Processes

For the complete system:

1. PostgreSQL
2. Express API
3. At least one worker
4. Cron materializer
5. React frontend

A job may be created by the API even when no worker is running, but it will remain `pending` until an eligible worker claims it.
