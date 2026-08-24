import * as workerMonitoringRepository from "../repositories/worker-monitoring.repository.js";
import AppError from "../utils/app-error.js";

const WORKER_STALE_AFTER_SECONDS = 30;
const DEFAULT_HEARTBEAT_LIMIT = 30;
const DEFAULT_EXECUTION_LIMIT = 20;
const MAX_LIMIT = 100;

const ensureProjectAccess = async ({
  projectId,
  userId,
}) => {
  const hasAccess =
    await workerMonitoringRepository.hasProjectAccess({
      projectId,
      userId,
    });

  if (!hasAccess) {
    throw new AppError("Project not found", 404);
  }
};

const parseLimit = ({
  value,
  defaultValue,
  fieldName,
}) => {
  if (value === undefined) {
    return defaultValue;
  }

  const parsedValue = Number(value);

  if (
    !Number.isInteger(parsedValue) ||
    parsedValue < 1 ||
    parsedValue > MAX_LIMIT
  ) {
    throw new AppError(
      `${fieldName} must be an integer between 1 and ${MAX_LIMIT}`,
      400,
    );
  }

  return parsedValue;
};

export const listWorkers = async ({
  projectId,
  userId,
}) => {
  await ensureProjectAccess({
    projectId,
    userId,
  });

  return workerMonitoringRepository.findWorkersForProject({
    projectId,
    staleAfterSeconds: WORKER_STALE_AFTER_SECONDS,
  });
};

export const getWorkerDetails = async ({
  projectId,
  workerId,
  userId,
  query = {},
}) => {
  await ensureProjectAccess({
    projectId,
    userId,
  });

  const heartbeatLimit = parseLimit({
    value: query.heartbeatLimit,
    defaultValue: DEFAULT_HEARTBEAT_LIMIT,
    fieldName: "heartbeatLimit",
  });

  const executionLimit = parseLimit({
    value: query.executionLimit,
    defaultValue: DEFAULT_EXECUTION_LIMIT,
    fieldName: "executionLimit",
  });

  const worker =
    await workerMonitoringRepository.findWorkerForProject({
      projectId,
      workerId,
      staleAfterSeconds: WORKER_STALE_AFTER_SECONDS,
    });

  if (!worker) {
    throw new AppError("Worker not found", 404);
  }

  const [
    heartbeats,
    recentExecutions,
    activeJobs,
  ] = await Promise.all([
    workerMonitoringRepository.findWorkerHeartbeats({
      workerId,
      limit: heartbeatLimit,
    }),
    workerMonitoringRepository.findWorkerRecentExecutions({
      workerId,
      projectId,
      limit: executionLimit,
    }),
    workerMonitoringRepository.findWorkerActiveJobs({
      workerId,
      projectId,
    }),
  ]);

  return {
    worker,
    heartbeats,
    recentExecutions,
    activeJobs,
  };
};
