import * as workerRecoveryRepository from "../repositories/worker-recovery.repository.js";
import * as jobExecutionRepository from "../repositories/job-execution.repository.js";
import { calculateRetryDelay } from "../utils/retry-delay.js";
import { executeJob } from "../workers/job-executor.js";
import { hostname as getHostname } from "node:os";
import * as workerRepository from "../repositories/worker.repository.js";
import AppError from "../utils/app-error.js";

let previousCpuUsage = process.cpuUsage();
let previousSampleTime = process.hrtime.bigint();

const getCpuPercentage = () => {
  const currentCpuUsage = process.cpuUsage();
  const currentSampleTime = process.hrtime.bigint();

  const cpuTimeMicroseconds =
    currentCpuUsage.user -
    previousCpuUsage.user +
    (currentCpuUsage.system - previousCpuUsage.system);

  const elapsedMicroseconds =
    Number(currentSampleTime - previousSampleTime) / 1000;

  previousCpuUsage = currentCpuUsage;
  previousSampleTime = currentSampleTime;

  if (elapsedMicroseconds <= 0) {
    return 0;
  }

  return Math.min(
    Number(((cpuTimeMicroseconds / elapsedMicroseconds) * 100).toFixed(2)),
    100,
  );
};

export const registerWorker = async () => {
  return workerRepository.registerWorker({
    hostname: getHostname(),
    pid: process.pid,
  });
};

export const sendHeartbeat = async (workerId) => {
  const heartbeat = await workerRepository.recordHeartbeat({
    workerId,
    cpuPct: getCpuPercentage(),
    memoryMb: Math.round(process.memoryUsage().rss / 1024 / 1024),
  });

  if (!heartbeat) {
    throw new AppError("Worker not found", 404);
  }

  return heartbeat;
};

export const claimNextJob = async (workerId) => {
  return workerRepository.claimNextJob(workerId);
};


export const processClaimedJob = async ({
  job,
  execution,
  workerId,
}) => {
  let result;

  try {
    result = await executeJob(job);
  } catch (error) {
    const errorMessage = (
      error instanceof Error ? error.message : String(error)
    ).slice(0, 5000);

    const retryContext = await workerRepository.getJobRetryContext({
      jobId: job.id,
      workerId,
    });

    if (!retryContext) {
      throw new AppError("Job retry context not found", 404);
    }

    if (retryContext.attempt_count < retryContext.max_attempts) {
      const retryDelayMs = calculateRetryDelay({
        strategy: retryContext.retry_strategy,
        baseDelayMs: retryContext.base_delay_ms,
        maxDelayMs: retryContext.max_delay_ms,
        attemptNo: retryContext.attempt_count,
      });

      const lifecycle =
        await jobExecutionRepository.markExecutionFailedForRetry({
          executionId: execution.id,
          jobId: job.id,
          workerId,
          errorMessage,
          retryDelayMs,
        });

      return {
        status: "retrying",
        error: errorMessage,
        retryDelayMs,
        lifecycle,
      };
    }

    const lifecycle =
      await jobExecutionRepository.moveJobToDeadLetterQueue({
        executionId: execution.id,
        jobId: job.id,
        workerId,
        errorMessage,
      });

    return {
      status: "dead",
      error: errorMessage,
      lifecycle,
    };
  }

  const lifecycle =
    await jobExecutionRepository.markExecutionSucceeded({
      executionId: execution.id,
      jobId: job.id,
      workerId,
    });

  return {
    status: "succeeded",
    result,
    lifecycle,
  };
};

export const recoverStaleWorkers = async (staleAfterSeconds = 30) => {
  return workerRecoveryRepository.recoverStaleWorkers({
    staleAfterSeconds,
  });
};

const updateWorkerStatus = async ({
  workerId,
  status,
}) => {
  const worker = await workerRepository.updateWorkerStatus({
    workerId,
    status,
  });

  if (!worker) {
    throw new AppError("Worker not found", 404);
  }

  return worker;
};

export const markWorkerDraining = async (workerId) => {
  return updateWorkerStatus({
    workerId,
    status: "draining",
  });
};

export const markWorkerOffline = async (workerId) => {
  return updateWorkerStatus({
    workerId,
    status: "offline",
  });
};
