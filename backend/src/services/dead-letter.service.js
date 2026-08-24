import * as deadLetterRepository from "../repositories/dead-letter.repository.js";
import { findQueueByIdForUser } from "../repositories/queue.repository.js";
import AppError from "../utils/app-error.js";

const getScopedQueue = async ({
  projectId,
  queueId,
  userId,
}) => {
  const queue = await findQueueByIdForUser(
    queueId,
    userId,
  );

  if (
    !queue ||
    queue.project_id !== projectId
  ) {
    throw new AppError("Queue not found", 404);
  }

  return queue;
};

export const listDeadLetterEntries = async ({
  projectId,
  queueId,
  userId,
  query = {},
}) => {
  await getScopedQueue({
    projectId,
    queueId,
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

  const offset = (page - 1) * limit;

  const result =
    await deadLetterRepository.findDeadLetterEntriesForUser({
      projectId,
      queueId,
      userId,
      limit,
      offset,
    });

  return {
    entries: result.entries,
    pagination: {
      page,
      limit,
      total: result.total,
      totalPages: Math.ceil(result.total / limit),
    },
  };
};

export const getDeadLetterEntry = async ({
  deadLetterId,
  projectId,
  queueId,
  userId,
}) => {
  await getScopedQueue({
    projectId,
    queueId,
    userId,
  });

  const entry =
    await deadLetterRepository.findDeadLetterEntryForUser({
      deadLetterId,
      projectId,
      queueId,
      userId,
    });

  if (!entry) {
    throw new AppError(
      "Dead-letter entry not found",
      404,
    );
  }

  return entry;
};

export const requeueDeadLetterJob = async ({
  deadLetterId,
  projectId,
  queueId,
  userId,
}) => {
  const queue = await getScopedQueue({
    projectId,
    queueId,
    userId,
  });

  if (!["owner", "admin"].includes(queue.role)) {
    throw new AppError(
      "You do not have permission to requeue this job",
      403,
    );
  }

  const entry =
    await deadLetterRepository.findDeadLetterEntryForUser({
      deadLetterId,
      projectId,
      queueId,
      userId,
    });

  if (!entry) {
    throw new AppError(
      "Dead-letter entry not found",
      404,
    );
  }

  if (entry.job_status !== "dead") {
    throw new AppError(
      "Only dead jobs can be requeued",
      409,
    );
  }

  const result =
    await deadLetterRepository.requeueDeadLetterEntry({
      deadLetterId,
      projectId,
      queueId,
      userId,
    });

  if (!result) {
    throw new AppError(
      "Dead-letter entry is no longer available",
      409,
    );
  }

  return result;
};
