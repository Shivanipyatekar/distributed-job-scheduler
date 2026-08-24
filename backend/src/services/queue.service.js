import {
  createQueue as createQueueRecord,
  findQueuesByProjectForUser,
  findQueueByIdForUser,
updateQueueConfiguration,
setQueuePausedState,
findQueueStatistics,
deleteQueue as deleteQueueRecord,
} from "../repositories/queue.repository.js";
import { findProjectByIdForUser } from "../repositories/project.repository.js";
import AppError from "../utils/app-error.js";

const getProjectForUser = async (projectId, userId) => {
  const project = await findProjectByIdForUser(
    projectId,
    userId
  );

  if (!project) {
    throw new AppError("Project not found", 404);
  }

  return project;
};

export const createQueue = async ({
  projectId,
  userId,
  name,
  concurrencyLimit = 10,
  priority = 0,
  retryPolicy = {},
}) => {
  const project = await getProjectForUser(projectId, userId);

  if (!["owner", "admin"].includes(project.role)) {
    throw new AppError(
      "You do not have permission to create queues",
      403
    );
  }

  const baseDelayMs = retryPolicy.baseDelayMs ?? 1000;
  const maxDelayMs =
    retryPolicy.maxDelayMs ?? Math.max(60000, baseDelayMs);

  try {
    return await createQueueRecord({
      projectId,
      name,
      concurrencyLimit,
      priority,
      retryPolicy: {
        strategy: retryPolicy.strategy ?? "exponential",
        baseDelayMs,
        maxDelayMs,
        maxAttempts: retryPolicy.maxAttempts ?? 5,
      },
    });
  } catch (error) {
    if (error.code === "23505") {
      throw new AppError(
        "A queue with this name already exists in the project",
        409
      );
    }

    throw error;
  }
};

export const getProjectQueues = async ({
  projectId,
  userId,
}) => {
  await getProjectForUser(projectId, userId);

  return findQueuesByProjectForUser(projectId, userId);
};

export const getQueueById = async ({
  queueId,
  userId,
}) => {
  const queue = await findQueueByIdForUser(queueId, userId);

  if (!queue) {
    throw new AppError("Queue not found", 404);
  }

  return queue;
};

const getManageableQueue = async (queueId, userId) => {
  const queue = await findQueueByIdForUser(queueId, userId);

  if (!queue) {
    throw new AppError("Queue not found", 404);
  }

  if (!["owner", "admin"].includes(queue.role)) {
    throw new AppError(
      "You do not have permission to manage this queue",
      403
    );
  }

  return queue;
};

export const updateQueue = async (queueId, userId, updates) => {
  const queue = await getManageableQueue(queueId, userId);

  const retryUpdates = updates.retryPolicy ?? {};
  const currentRetryPolicy = queue.retry_policy;

  const retryPolicy = {
    strategy:
      retryUpdates.strategy ?? currentRetryPolicy.strategy,

    baseDelayMs:
      retryUpdates.baseDelayMs ?? currentRetryPolicy.base_delay_ms,

    maxDelayMs:
      retryUpdates.maxDelayMs ?? currentRetryPolicy.max_delay_ms,

    maxAttempts:
      retryUpdates.maxAttempts ?? currentRetryPolicy.max_attempts,
  };

  if (retryPolicy.maxDelayMs < retryPolicy.baseDelayMs) {
    throw new AppError(
      "Maximum delay must be greater than or equal to base delay",
      400
    );
  }

  try {
    return await updateQueueConfiguration({
      queueId,
      name: updates.name ?? queue.name,
      concurrencyLimit:
        updates.concurrencyLimit ?? queue.concurrency_limit,
      priority: updates.priority ?? queue.priority,
      retryPolicy,
    });
  } catch (error) {
    if (error.code === "23505") {
      throw new AppError(
        "A queue with this name already exists in the project",
        409
      );
    }

    throw error;
  }
};

export const pauseQueue = async (queueId, userId) => {
  const queue = await getManageableQueue(queueId, userId);

  if (queue.is_paused) {
    throw new AppError("Queue is already paused", 409);
  }

  return setQueuePausedState(queueId, true);
};

export const resumeQueue = async (queueId, userId) => {
  const queue = await getManageableQueue(queueId, userId);

  if (!queue.is_paused) {
    throw new AppError("Queue is already active", 409);
  }

  return setQueuePausedState(queueId, false);
};

export const getQueueStatistics = async (queueId, userId) => {
  const queue = await findQueueByIdForUser(queueId, userId);

  if (!queue) {
    throw new AppError("Queue not found", 404);
  }

  const statistics = await findQueueStatistics(queueId);

  if (!statistics) {
    throw new AppError("Queue statistics not found", 404);
  }

  return statistics;
};

export const deleteQueue = async (queueId, userId) => {
  await getManageableQueue(queueId, userId);

  const deletedQueue = await deleteQueueRecord(queueId);

  if (!deletedQueue) {
    throw new AppError("Queue not found", 404);
  }

  return deletedQueue;
};
