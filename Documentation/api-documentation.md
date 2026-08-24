# API Documentation

## Base Paths

Health:

```text
/api/health
```

Application API:

```text
/api/v1
```

## Authentication

Protected endpoints expect:

```http
Authorization: Bearer <JWT_TOKEN>
```

The API generally returns an envelope of the form:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {}
}
```

Validation and operational failures use an error response with `success: false`.

---

## Health

### GET `/api/health`

Authentication: Public

Purpose: Check whether the Distributed Job Scheduler API is running.

---

# Authentication

## POST `/api/v1/auth/register`

Authentication: Public

Example:

```json
{
  "name": "Sneha Khenwal",
  "email": "sneha@example.com",
  "password": "StrongPassword123!"
}
```

Success: `201 Created`

## POST `/api/v1/auth/login`

Authentication: Public

```json
{
  "email": "sneha@example.com",
  "password": "StrongPassword123!"
}
```

Success: `200 OK`

The response contains the authenticated user and JWT.

---

# Organizations

## POST `/api/v1/organizations`

Authentication: Authenticated

Creates an organization. The creator becomes its owner.

## GET `/api/v1/organizations`

Authentication: Authenticated

Lists organizations accessible to the authenticated user.

## GET `/api/v1/organizations/:organizationId`

Authentication: Organization member

Returns an organization accessible to the user.

---

# Organization Members

## GET `/api/v1/organizations/:organizationId/members`

Authentication: Organization member

Lists members with their role and joined information.

## POST `/api/v1/organizations/:organizationId/members`

Authentication: Owner or Admin

Adds an already registered user.

Example:

```json
{
  "email": "member@example.com",
  "role": "member"
}
```

Rules:

- owner can add `member` or `admin`,
- admin cannot add another `admin`.

## PATCH `/api/v1/organizations/:organizationId/members/:userId/role`

Authentication: Owner

Example:

```json
{
  "role": "admin"
}
```

The organization's owner cannot be demoted through this endpoint.

## DELETE `/api/v1/organizations/:organizationId/members/:userId`

Authentication: Owner or Admin

Rules include:

- owner cannot be removed,
- admin cannot remove another admin.

## PATCH `/api/v1/organizations/:organizationId/ownership`

Authentication: Current Owner

Example:

```json
{
  "newOwnerId": "USER_UUID"
}
```

The new owner must already belong to the organization.

After transfer:

- new owner → `owner`
- old owner → `admin`

---

# Projects

## POST `/api/v1/organizations/:organizationId/projects`

Authentication: Owner or Admin

```json
{
  "name": "Production Jobs"
}
```

Success: `201 Created`

The initial API key is returned when created and should be saved because it is not intended to be repeatedly exposed.

## GET `/api/v1/organizations/:organizationId/projects`

Authentication: Organization member

## GET `/api/v1/projects/:projectId`

Authentication: Organization member

## PATCH `/api/v1/projects/:projectId`

Authentication: Owner or Admin

```json
{
  "name": "Background Processing"
}
```

## POST `/api/v1/projects/:projectId/api-key/rotate`

Authentication: Owner or Admin

Rotates the project API key.

## DELETE `/api/v1/projects/:projectId`

Authentication: Owner or Admin

---

# Queues

## POST `/api/v1/projects/:projectId/queues`

Authentication: Owner or Admin

Example:

```json
{
  "name": "emails",
  "concurrencyLimit": 5,
  "priority": 10,
  "retryPolicy": {
    "strategy": "exponential",
    "baseDelayMs": 1000,
    "maxDelayMs": 60000,
    "maxAttempts": 5
  }
}
```

Queue configuration supports:

- name,
- concurrency limit,
- priority,
- retry policy.

## GET `/api/v1/projects/:projectId/queues`

Authentication: Project/organization member

## GET `/api/v1/queues/:queueId`

Authentication: Project/organization member

## GET `/api/v1/queues/:queueId/statistics`

Authentication: Project/organization member

Returns queue health/job statistics.

## PATCH `/api/v1/queues/:queueId`

Authentication: Owner or Admin

Updates eligible queue configuration.

## POST `/api/v1/queues/:queueId/pause`

Authentication: Owner or Admin

Paused queues are excluded from new worker claims.

## POST `/api/v1/queues/:queueId/resume`

Authentication: Owner or Admin

## DELETE `/api/v1/queues/:queueId`

Authentication: Owner or Admin

---

# Jobs

## POST `/api/v1/projects/:projectId/queues/:queueId/jobs`

Creates a single job.

Example immediate job:

```json
{
  "type": "email.send",
  "payload": {
    "recipient": "user@example.com"
  },
  "priority": 10,
  "maxAttempts": 5
}
```

Delayed job:

```json
{
  "type": "email.send",
  "payload": {},
  "delayMs": 60000
}
```

Scheduled one-time job:

```json
{
  "type": "report.generate",
  "payload": {},
  "scheduledAt": "2026-08-25T10:00:00.000Z"
}
```

`scheduledAt` and positive `delayMs` are not used together.

## POST `/api/v1/projects/:projectId/queues/:queueId/jobs/batch`

Creates up to 100 jobs in one request.

```json
{
  "jobs": [
    {
      "type": "email.send",
      "payload": {
        "recipient": "a@example.com"
      }
    },
    {
      "type": "email.send",
      "payload": {
        "recipient": "b@example.com"
      }
    }
  ]
}
```

## GET `/api/v1/projects/:projectId/queues/:queueId/jobs`

Supports:

```text
page
limit
status
type
```

Supported lifecycle status filtering includes:

```text
pending
running
succeeded
failed
dead
```

## GET `/api/v1/projects/:projectId/queues/:queueId/jobs/:jobId`

Returns one job.

## GET `/api/v1/projects/:projectId/queues/:queueId/jobs/:jobId/executions`

Returns execution attempt history.

## GET `/api/v1/projects/:projectId/queues/:queueId/jobs/:jobId/logs`

Returns job logs with pagination/filter support.

## PATCH `/api/v1/projects/:projectId/queues/:queueId/jobs/:jobId`

Authentication: Owner or Admin

Only pending jobs can be edited.

## DELETE `/api/v1/projects/:projectId/queues/:queueId/jobs/:jobId`

Authentication: Owner or Admin

Only pending jobs can be deleted.

---

# Cron Schedules

## POST `/api/v1/projects/:projectId/queues/:queueId/cron-schedules`

Authentication: Owner or Admin

Example:

```json
{
  "cronExpression": "0 9 * * *",
  "timezone": "Asia/Kolkata",
  "jobTemplate": {
    "type": "report.daily",
    "payload": {
      "scope": "daily"
    },
    "priority": 5,
    "maxAttempts": 3
  }
}
```

The backend validates:

- cron expression,
- IANA timezone,
- job template,
- payload,
- priority,
- max attempts.

## GET `/api/v1/projects/:projectId/queues/:queueId/cron-schedules`

Authentication: Member

## GET `/api/v1/projects/:projectId/queues/:queueId/cron-schedules/:scheduleId`

Authentication: Member

## PATCH `/api/v1/projects/:projectId/queues/:queueId/cron-schedules/:scheduleId`

Authentication: Owner or Admin

## POST `/api/v1/projects/:projectId/queues/:queueId/cron-schedules/:scheduleId/activate`

Authentication: Owner or Admin

## POST `/api/v1/projects/:projectId/queues/:queueId/cron-schedules/:scheduleId/deactivate`

Authentication: Owner or Admin

## DELETE `/api/v1/projects/:projectId/queues/:queueId/cron-schedules/:scheduleId`

Authentication: Owner or Admin

---

# Workers

Workers self-register when the worker process starts. There is intentionally no frontend/API action for manually creating workers.

## GET `/api/v1/projects/:projectId/workers`

Authentication: Project/organization member

Returns worker information such as:

- ID,
- hostname,
- PID,
- status,
- health status,
- uptime,
- latest heartbeat,
- CPU,
- memory,
- active jobs,
- execution counts,
- average duration.

## GET `/api/v1/projects/:projectId/workers/:workerId`

Authentication: Project/organization member

Returns:

- worker,
- heartbeat history,
- recent executions,
- active jobs.

The backend supports bounded heartbeat/execution history limits.

---

# Dead Letter Queue

## GET `/api/v1/projects/:projectId/queues/:queueId/dead-letter`

Authentication: Member

Query:

```text
page
limit
```

Returns entries such as:

- failed job,
- payload,
- failure reason,
- attempts made,
- failure timestamp,
- job type,
- priority.

## GET `/api/v1/projects/:projectId/queues/:queueId/dead-letter/:deadLetterId`

Authentication: Member

Returns detailed DLQ information.

## POST `/api/v1/projects/:projectId/queues/:queueId/dead-letter/:deadLetterId/requeue`

Authentication: Owner or Admin

Requeue behavior:

1. job becomes `pending`,
2. attempt count resets,
3. job becomes immediately available,
4. worker lock is cleared,
5. DLQ entry is removed,
6. a job log records manual requeue.

---

# Metrics

## GET `/api/v1/projects/:projectId/metrics`

Authentication: Project/organization member

Returns project-level scheduler dashboard metrics.

The exact supported metric query parameters are determined by the current `metrics.service.js`; they should not be documented more narrowly than the implementation supports.

---

# Common Status Codes

| Status | Meaning |
|---|---|
| 200 | Successful read/update/action |
| 201 | Resource created |
| 400 | Validation or invalid operation |
| 401 | Missing/invalid authentication |
| 403 | Authenticated but insufficient role |
| 404 | Resource not found/inaccessible |
| 409 | Resource/state conflict |
| 500 | Unexpected server failure |

The frontend also exposes this API reference through its API Documentation page.
