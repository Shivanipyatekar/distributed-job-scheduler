export const apiDocSections = [
  {
    id: "health",
    title: "Health",
    description: "API availability and health checks.",
    endpoints: [
      {
        method: "GET",
        path: "/api/health",
        auth: "Public",
        description: "Check whether the API server is running.",
      },
    ],
  },

  {
    id: "auth",
    title: "Authentication",
    description: "Register users and obtain JWT access tokens.",
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/auth/register",
        auth: "Public",
        description: "Create a new user account.",
        body: {
          name: "Sneha Khenwal",
          email: "sneha@example.com",
          password: "StrongPassword123!",
        },
      },
      {
        method: "POST",
        path: "/api/v1/auth/login",
        auth: "Public",
        description: "Authenticate a user and return a JWT.",
        body: {
          email: "sneha@example.com",
          password: "StrongPassword123!",
        },
      },
    ],
  },

  {
    id: "organizations",
    title: "Organizations",
    description:
      "Create organizations and manage members, roles, and ownership.",
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/organizations",
        auth: "Authenticated",
        description:
          "Create an organization. The creator automatically becomes owner.",
        body: {
          name: "Engineering",
          slug: "engineering",
        },
      },
      {
        method: "GET",
        path: "/api/v1/organizations",
        auth: "Authenticated",
        description:
          "List organizations available to the authenticated user.",
      },
      {
        method: "GET",
        path: "/api/v1/organizations/:organizationId",
        auth: "Member",
        description: "Get one organization.",
      },
      {
        method: "GET",
        path: "/api/v1/organizations/:organizationId/members",
        auth: "Member",
        description: "List organization members.",
      },
      {
        method: "POST",
        path: "/api/v1/organizations/:organizationId/members",
        auth: "Owner / Admin",
        description:
          "Add an already registered user to the organization.",
        body: {
          email: "member@example.com",
          role: "member",
        },
      },
      {
        method: "PATCH",
        path: "/api/v1/organizations/:organizationId/members/:userId/role",
        auth: "Owner",
        description:
          "Change a member between member and admin roles.",
        body: {
          role: "admin",
        },
      },
      {
        method: "DELETE",
        path: "/api/v1/organizations/:organizationId/members/:userId",
        auth: "Owner / Admin",
        description:
          "Remove an eligible member from the organization.",
      },
      {
        method: "PATCH",
        path: "/api/v1/organizations/:organizationId/ownership",
        auth: "Owner",
        description:
          "Transfer ownership to an existing organization member.",
        body: {
          newOwnerId: "user-uuid",
        },
      },
    ],
  },

  {
    id: "projects",
    title: "Projects",
    description:
      "Manage scheduler projects within an organization.",
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/organizations/:organizationId/projects",
        auth: "Owner / Admin",
        description:
          "Create a project and receive its initial API key.",
        body: {
          name: "Production Jobs",
        },
      },
      {
        method: "GET",
        path: "/api/v1/organizations/:organizationId/projects",
        auth: "Member",
        description:
          "List projects belonging to an organization.",
      },
      {
        method: "GET",
        path: "/api/v1/projects/:projectId",
        auth: "Member",
        description: "Get a project by ID.",
      },
      {
        method: "PATCH",
        path: "/api/v1/projects/:projectId",
        auth: "Owner / Admin",
        description: "Update project information.",
        body: {
          name: "Background Processing",
        },
      },
      {
        method: "POST",
        path: "/api/v1/projects/:projectId/api-key/rotate",
        auth: "Owner / Admin",
        description:
          "Rotate the project's API key. The new key is shown only once.",
      },
      {
        method: "DELETE",
        path: "/api/v1/projects/:projectId",
        auth: "Owner / Admin",
        description: "Delete a project.",
      },
    ],
  },

  {
    id: "queues",
    title: "Queues",
    description:
      "Configure concurrency, priority and retry behavior.",
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/projects/:projectId/queues",
        auth: "Owner / Admin",
        description: "Create a job queue.",
        body: {
          name: "emails",
          concurrencyLimit: 5,
          priority: 10,
          retryPolicy: {
            strategy: "exponential",
            baseDelayMs: 1000,
            maxDelayMs: 60000,
          },
        },
      },
      {
        method: "GET",
        path: "/api/v1/projects/:projectId/queues",
        auth: "Member",
        description: "List queues belonging to a project.",
      },
      {
        method: "GET",
        path: "/api/v1/queues/:queueId",
        auth: "Member",
        description: "Get queue configuration.",
      },
      {
        method: "GET",
        path: "/api/v1/queues/:queueId/statistics",
        auth: "Member",
        description: "Get queue job statistics.",
      },
      {
        method: "PATCH",
        path: "/api/v1/queues/:queueId",
        auth: "Owner / Admin",
        description:
          "Update queue configuration and retry policy.",
      },
      {
        method: "POST",
        path: "/api/v1/queues/:queueId/pause",
        auth: "Owner / Admin",
        description: "Pause new job processing for a queue.",
      },
      {
        method: "POST",
        path: "/api/v1/queues/:queueId/resume",
        auth: "Owner / Admin",
        description: "Resume a paused queue.",
      },
      {
        method: "DELETE",
        path: "/api/v1/queues/:queueId",
        auth: "Owner / Admin",
        description: "Delete an eligible queue.",
      },
    ],
  },

  {
    id: "jobs",
    title: "Jobs",
    description:
      "Create, inspect and manage asynchronous jobs.",
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/projects/:projectId/queues/:queueId/jobs",
        auth: "Authenticated",
        description:
          "Create an immediate, delayed, or scheduled job.",
        body: {
          type: "send-email",
          payload: {
            recipient: "user@example.com",
          },
          priority: 10,
          maxAttempts: 5,
          delayMs: 0,
        },
      },
      {
        method: "POST",
        path: "/api/v1/projects/:projectId/queues/:queueId/jobs/batch",
        auth: "Authenticated",
        description:
          "Create multiple jobs in a single request. Maximum 100 jobs.",
        body: {
          jobs: [
            {
              type: "send-email",
              payload: {
                recipient: "first@example.com",
              },
            },
            {
              type: "send-email",
              payload: {
                recipient: "second@example.com",
              },
            },
          ],
        },
      },
      {
        method: "GET",
        path: "/api/v1/projects/:projectId/queues/:queueId/jobs",
        auth: "Member",
        description:
          "List queue jobs with pagination and optional status/type filters.",
        query: "page, limit, status, type",
      },
      {
        method: "GET",
        path: "/api/v1/projects/:projectId/queues/:queueId/jobs/:jobId",
        auth: "Member",
        description: "Get a job by ID.",
      },
      {
        method: "GET",
        path: "/api/v1/projects/:projectId/queues/:queueId/jobs/:jobId/executions",
        auth: "Member",
        description:
          "Get execution/attempt history for a job.",
      },
      {
        method: "GET",
        path: "/api/v1/projects/:projectId/queues/:queueId/jobs/:jobId/logs",
        auth: "Member",
        description: "Get execution logs for a job.",
        query: "page, limit, level",
      },
      {
        method: "PATCH",
        path: "/api/v1/projects/:projectId/queues/:queueId/jobs/:jobId",
        auth: "Owner / Admin",
        description:
          "Update a job while it is still pending.",
      },
      {
        method: "DELETE",
        path: "/api/v1/projects/:projectId/queues/:queueId/jobs/:jobId",
        auth: "Owner / Admin",
        description: "Delete a pending job.",
      },
    ],
  },

  {
    id: "schedules",
    title: "Schedules",
    description:
      "Create and manage recurring cron-based jobs.",
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/projects/:projectId/queues/:queueId/cron-schedules",
        auth: "Owner / Admin",
        description: "Create a recurring schedule.",
        body: {
          cronExpression: "0 9 * * *",
          timezone: "Asia/Kolkata",
          jobTemplate: {
            type: "daily-report",
            payload: {
              report: "summary",
            },
            priority: 5,
            maxAttempts: 3,
          },
        },
      },
      {
        method: "GET",
        path: "/api/v1/projects/:projectId/queues/:queueId/cron-schedules",
        auth: "Member",
        description: "List recurring schedules.",
      },
      {
        method: "GET",
        path: "/api/v1/projects/:projectId/queues/:queueId/cron-schedules/:scheduleId",
        auth: "Member",
        description: "Get a recurring schedule.",
      },
      {
        method: "PATCH",
        path: "/api/v1/projects/:projectId/queues/:queueId/cron-schedules/:scheduleId",
        auth: "Owner / Admin",
        description: "Update a recurring schedule.",
      },
      {
        method: "POST",
        path: "/api/v1/projects/:projectId/queues/:queueId/cron-schedules/:scheduleId/activate",
        auth: "Owner / Admin",
        description: "Activate an inactive schedule.",
      },
      {
        method: "POST",
        path: "/api/v1/projects/:projectId/queues/:queueId/cron-schedules/:scheduleId/deactivate",
        auth: "Owner / Admin",
        description: "Deactivate a schedule.",
      },
      {
        method: "DELETE",
        path: "/api/v1/projects/:projectId/queues/:queueId/cron-schedules/:scheduleId",
        auth: "Owner / Admin",
        description: "Delete a recurring schedule.",
      },
    ],
  },

  {
    id: "workers",
    title: "Workers",
    description:
      "Monitor distributed worker processes and executions.",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/projects/:projectId/workers",
        auth: "Member",
        description:
          "List workers with health, heartbeat and execution statistics.",
      },
      {
        method: "GET",
        path: "/api/v1/projects/:projectId/workers/:workerId",
        auth: "Member",
        description:
          "Get worker details, heartbeat history, recent executions and active jobs.",
        query: "heartbeatLimit, executionLimit",
      },
    ],
  },

  {
    id: "dead-letter",
    title: "Dead Letter Queue",
    description:
      "Inspect and recover permanently failed jobs.",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/projects/:projectId/queues/:queueId/dead-letter",
        auth: "Member",
        description: "List dead-letter entries.",
        query: "page, limit",
      },
      {
        method: "GET",
        path: "/api/v1/projects/:projectId/queues/:queueId/dead-letter/:deadLetterId",
        auth: "Member",
        description: "Inspect one dead-letter entry.",
      },
      {
        method: "POST",
        path: "/api/v1/projects/:projectId/queues/:queueId/dead-letter/:deadLetterId/requeue",
        auth: "Owner / Admin",
        description:
          "Reset a dead job and place it back into the queue.",
      },
    ],
  },

  {
    id: "metrics",
    title: "Metrics",
    description:
      "Project-level scheduler performance and health metrics.",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/projects/:projectId/metrics",
        auth: "Member",
        description:
          "Retrieve dashboard metrics for a project.",
      },
    ],
  },
];
