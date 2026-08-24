import * as jobExecutionRepository from "../repositories/job-execution.repository.js";
import * as jobLogRepository from "../repositories/job-log.repository.js";
import * as jobRepository from "../repositories/job.repository.js";
import AppError from "../utils/app-error.js";

export const createJob = async ({
  projectId,
  queueId,
  userId,
  jobData,
}) => {
  const {
    type,
    payload = {},
    priority = null,
    maxAttempts = null,
    delayMs = 0,
    scheduledAt=null,
  } = jobData;

  if (typeof type !== "string" || type.trim() === "") {
    throw new AppError("Job type is required", 400);
  }

  if (
    payload === null ||
    typeof payload !== "object" ||
    Array.isArray(payload)
  ) {
    throw new AppError("Job payload must be a JSON object", 400);
  }

  if (
    priority !== null &&
    (!Number.isInteger(priority) ||
      priority < -32768 ||
      priority > 32767)
  ) {
    throw new AppError(
      "Job priority must be an integer between -32768 and 32767",
      400
    );
  }

  if (
    maxAttempts !== null &&
    (!Number.isInteger(maxAttempts) || maxAttempts < 1)
  ) {
    throw new AppError(
      "maxAttempts must be a positive integer",
      400
    );
  }

  if (!Number.isSafeInteger(delayMs) || delayMs < 0) {
    throw new AppError(
      "delayMs must be a non-negative integer",
      400
    );
  }

  if (scheduledAt !== null && delayMs > 0) {
  throw new AppError(
    "Use either delayMs or scheduledAt, not both",
    400
  );
}

let availableAt = null;

if (scheduledAt !== null) {
  if (typeof scheduledAt !== "string") {
    throw new AppError(
      "scheduledAt must be an ISO 8601 date string",
      400
    );
  }

  const scheduledDate = new Date(scheduledAt);

  if (Number.isNaN(scheduledDate.getTime())) {
    throw new AppError(
      "scheduledAt must be a valid ISO 8601 date",
      400
    );
  }

  if (scheduledDate.getTime() <= Date.now()) {
    throw new AppError(
      "scheduledAt must be in the future",
      400
    );
  }

  availableAt = scheduledDate.toISOString();
} else if (delayMs > 0) {
  const delayedDate = new Date(Date.now() + delayMs);

  if (Number.isNaN(delayedDate.getTime())) {
    throw new AppError(
      "delayMs produces an invalid date",
      400
    );
  }

  availableAt = delayedDate.toISOString();
}

  const job = await jobRepository.createJob({
    projectId,
    queueId,
    userId,
    type: type.trim(),
    payload,
    priority,
    maxAttempts,
    availableAt,
  });

  if (!job) {
    throw new AppError("Queue not found or access denied", 404);
  }

  return job;
};


export const findJobsByQueueForUser = async ({
  projectId,
  queueId,
  userId,
  filters,
}) => {
  const allowedStatuses = [
    "pending",
    "running",
    "succeeded",
    "failed",
    "dead",
  ];

  const page = Number(filters.page ?? 1);
  const limit = Number(filters.limit ?? 20);
  const status = filters.status ?? null;
  const type = filters.type?.trim() || null;

  if (!Number.isInteger(page) || page < 1) {
    throw new AppError("page must be a positive integer", 400);
  }

  if (
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > 100
  ) {
    throw new AppError(
      "limit must be an integer between 1 and 100",
      400
    );
  }

  if (status && !allowedStatuses.includes(status)) {
    throw new AppError(
      `status must be one of: ${allowedStatuses.join(", ")}`,
      400
    );
  }

  if (
    filters.type !== undefined &&
    typeof filters.type !== "string"
  ) {
    throw new AppError("type must be a string", 400);
  }

  const offset = (page - 1) * limit;

  const result = await jobRepository.findJobsByQueueForUser({
    projectId,
    queueId,
    userId,
    status,
    type,
    limit,
    offset,
  });

  return {
    jobs: result.jobs,
    pagination: {
      page,
      limit,
      total: result.total,
      totalPages: Math.ceil(result.total / limit),
    },
  };
};


export const findJobByIdForUser = async ({
  jobId,
  queueId,
  projectId,
  userId,
}) => {
  const job = await jobRepository.findJobByIdForUser({
    jobId,
    queueId,
    projectId,
    userId,
  });

  if (!job) {
    throw new AppError("Job not found", 404);
  }

  return job;
};

export const updatePendingJob = async ({
  jobId,
  queueId,
  projectId,
  userId,
  jobData,
}) => {
  const supportedFields = [
    "type",
    "payload",
    "priority",
    "maxAttempts",
    "delayMs",
  ];

  const hasUpdate = supportedFields.some((field) =>
    Object.prototype.hasOwnProperty.call(jobData, field)
  );

  if (!hasUpdate) {
    throw new AppError(
      "Provide at least one job field to update",
      400
    );
  }

  const {
    type,
    payload,
    priority,
    maxAttempts,
    delayMs,
  } = jobData;

  if (
    type !== undefined &&
    (typeof type !== "string" || type.trim() === "")
  ) {
    throw new AppError(
      "Job type must be a non-empty string",
      400
    );
  }

  if (
    payload !== undefined &&
    (payload === null ||
      typeof payload !== "object" ||
      Array.isArray(payload))
  ) {
    throw new AppError(
      "Job payload must be a JSON object",
      400
    );
  }

  if (
    priority !== undefined &&
    (!Number.isInteger(priority) ||
      priority < -32768 ||
      priority > 32767)
  ) {
    throw new AppError(
      "Job priority must be an integer between -32768 and 32767",
      400
    );
  }

  if (
    maxAttempts !== undefined &&
    (!Number.isInteger(maxAttempts) || maxAttempts < 1)
  ) {
    throw new AppError(
      "maxAttempts must be a positive integer",
      400
    );
  }

  let availableAt = null;

  if (delayMs !== undefined) {
    if (!Number.isSafeInteger(delayMs) || delayMs < 0) {
      throw new AppError(
        "delayMs must be a non-negative integer",
        400
      );
    }

    const delayedDate = new Date(Date.now() + delayMs);

    if (Number.isNaN(delayedDate.getTime())) {
      throw new AppError(
        "delayMs produces an invalid date",
        400
      );
    }

    availableAt = delayedDate.toISOString();
  }

  const job = await jobRepository.updatePendingJobForUser({
    jobId,
    queueId,
    projectId,
    userId,
    type: type === undefined ? null : type.trim(),
    payload: payload === undefined ? null : payload,
    priority: priority ?? null,
    maxAttempts: maxAttempts ?? null,
    availableAt,
  });

  if (!job) {
    throw new AppError(
      "Pending job not found or access denied",
      404
    );
  }

  return job;
};

export const deletePendingJob = async ({
  jobId,
  queueId,
  projectId,
  userId,
}) => {
  const job = await jobRepository.deletePendingJobForUser({
    jobId,
    queueId,
    projectId,
    userId,
  });

  if (!job) {
    throw new AppError(
      "Pending job not found or access denied",
      404
    );
  }

  return job;
};

export const createBatchJobs = async ({
  projectId,
  queueId,
  userId,
  batchData,
}) => {
  const { jobs } = batchData;

  if (!Array.isArray(jobs) || jobs.length === 0) {
    throw new AppError(
      "jobs must be a non-empty array",
      400
    );
  }

  if (jobs.length > 100) {
    throw new AppError(
      "A batch cannot contain more than 100 jobs",
      400
    );
  }

  const preparedJobs = jobs.map((job, index) => {
    if (
      job === null ||
      typeof job !== "object" ||
      Array.isArray(job)
    ) {
      throw new AppError(
        `jobs[${index}] must be a JSON object`,
        400
      );
    }

    const {
      type,
      payload = {},
      priority = null,
      maxAttempts = null,
      delayMs = 0,
      scheduledAt = null,
    } = job;

    if (typeof type !== "string" || type.trim() === "") {
      throw new AppError(
        `jobs[${index}].type is required`,
        400
      );
    }

    if (
      payload === null ||
      typeof payload !== "object" ||
      Array.isArray(payload)
    ) {
      throw new AppError(
        `jobs[${index}].payload must be a JSON object`,
        400
      );
    }

    if (
      priority !== null &&
      (!Number.isInteger(priority) ||
        priority < -32768 ||
        priority > 32767)
    ) {
      throw new AppError(
        `jobs[${index}].priority must be an integer between -32768 and 32767`,
        400
      );
    }

    if (
      maxAttempts !== null &&
      (!Number.isInteger(maxAttempts) ||
        maxAttempts < 1)
    ) {
      throw new AppError(
        `jobs[${index}].maxAttempts must be a positive integer`,
        400
      );
    }

    if (!Number.isSafeInteger(delayMs) || delayMs < 0) {
      throw new AppError(
        `jobs[${index}].delayMs must be a non-negative integer`,
        400
      );
    }

    if (scheduledAt !== null && delayMs > 0) {
      throw new AppError(
        `jobs[${index}] cannot use delayMs and scheduledAt together`,
        400
      );
    }

    let availableAt = null;

    if (scheduledAt !== null) {
      if (typeof scheduledAt !== "string") {
        throw new AppError(
          `jobs[${index}].scheduledAt must be an ISO 8601 date string`,
          400
        );
      }

      const scheduledDate = new Date(scheduledAt);

      if (
        Number.isNaN(scheduledDate.getTime()) ||
        scheduledDate.getTime() <= Date.now()
      ) {
        throw new AppError(
          `jobs[${index}].scheduledAt must be a valid future date`,
          400
        );
      }

      availableAt = scheduledDate.toISOString();
    } else if (delayMs > 0) {
      const delayedDate = new Date(Date.now() + delayMs);

      if (Number.isNaN(delayedDate.getTime())) {
        throw new AppError(
          `jobs[${index}].delayMs produces an invalid date`,
          400
        );
      }

      availableAt = delayedDate.toISOString();
    }

    return {
      type: type.trim(),
      payload,
      priority,
      maxAttempts,
      availableAt,
    };
  });

  const createdJobs = await jobRepository.createBatchJobs({
    projectId,
    queueId,
    userId,
    jobs: preparedJobs,
  });

  if (!createdJobs) {
    throw new AppError(
      "Queue not found or access denied",
      404
    );
  }

  return createdJobs;
};

export const getJobExecutionHistory = async ({
  jobId,
  queueId,
  projectId,
  userId,
}) => {
  await findJobByIdForUser({
    jobId,
    queueId,
    projectId,
    userId,
  });

  return jobExecutionRepository.getJobExecutions({
    jobId,
  });
};

export const getJobLogHistory = async ({
  jobId,
  queueId,
  projectId,
  userId,
  query = {},
}) => {
  await findJobByIdForUser({
    jobId,
    queueId,
    projectId,
    userId,
  });

  const page = Number(query.page ?? 1);
  const limit = Number(query.limit ?? 20);

  if (!Number.isInteger(page) || page <= 0) {
    throw new AppError(
      "Page must be a positive integer",
      400,
    );
  }

  if (
    !Number.isInteger(limit) ||
    limit <= 0 ||
    limit > 100
  ) {
    throw new AppError(
      "Limit must be an integer between 1 and 100",
      400,
    );
  }

  let level = null;

  if (query.level !== undefined) {
    if (
      typeof query.level !== "string" ||
      query.level.trim() === ""
    ) {
      throw new AppError(
        "Log level must be a non-empty string",
        400,
      );
    }

    level = query.level.trim().toLowerCase();

    const supportedLevels = [
      "debug",
      "info",
      "warn",
      "error",
    ];

    if (!supportedLevels.includes(level)) {
      throw new AppError(
        "Log level must be debug, info, warn, or error",
        400,
      );
    }
  }

  const offset = (page - 1) * limit;

  const result = await jobLogRepository.getJobLogs({
    jobId,
    level,
    limit,
    offset,
  });

  return {
    logs: result.logs,
    pagination: {
      page,
      limit,
      total: result.total,
      totalPages: Math.ceil(result.total / limit),
    },
  };
};
