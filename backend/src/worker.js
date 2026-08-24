
import "dotenv/config";

import { pool } from "./config/database.js";
import { materializeDueCronSchedules } from "./services/cron-materializer.service.js";
import {
  claimNextJob,
  markWorkerDraining,
  markWorkerOffline,
  processClaimedJob,
  recoverStaleWorkers,
  registerWorker,
  sendHeartbeat,
} from "./services/worker.service.js";

const HEARTBEAT_INTERVAL_MS = 5_000;
const POLL_INTERVAL_MS = 1_000;
const RECOVERY_INTERVAL_MS = 10_000;
const CRON_MATERIALIZER_INTERVAL_MS =
  Number(process.env.CRON_MATERIALIZER_INTERVAL_MS) ||
  5_000;
const WORKER_STALE_AFTER_SECONDS = 30;
const SHUTDOWN_TIMEOUT_MS = 30_000;

const WORKER_CONCURRENCY = Number(
  process.env.WORKER_CONCURRENCY ?? 5,
);

if (
  !Number.isInteger(WORKER_CONCURRENCY) ||
  WORKER_CONCURRENCY <= 0
) {
  throw new Error(
    "WORKER_CONCURRENCY must be a positive integer",
  );
}

const activeJobs = new Set();

let currentWorkerId = null;
let heartbeatTimer = null;
let recoveryTimer = null;
let cronMaterializerTimer = null;
let pollingLoopPromise = null;
let shutdownPromise = null;
let recoveryInProgress = false;
let isCronMaterializing = false;
let isShuttingDown = false;

const wait = (milliseconds) => {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
};

const startHeartbeatLoop = (workerId) => {
  return setInterval(() => {
    void sendHeartbeat(workerId).catch((error) => {
      console.error("Worker heartbeat error:", error);
    });
  }, HEARTBEAT_INTERVAL_MS);
};

const runWorkerRecovery = async () => {
  if (recoveryInProgress || isShuttingDown) {
    return;
  }

  recoveryInProgress = true;

  try {
    const result = await recoverStaleWorkers(
      WORKER_STALE_AFTER_SECONDS,
    );

    if (result.workersRecovered > 0) {
      console.warn(
        `Recovered ${result.workersRecovered} stale worker(s): ` +
          `${result.jobsRequeued} job(s) requeued, ` +
          `${result.jobsDead} job(s) moved to dead-letter queue`,
      );
    }
  } catch (error) {
    console.error("Worker recovery error:", error);
  } finally {
    recoveryInProgress = false;
  }
};

const startWorkerRecoveryLoop = () => {
  void runWorkerRecovery();

  return setInterval(() => {
    void runWorkerRecovery();
  }, RECOVERY_INTERVAL_MS);
};

const runCronMaterializer = async () => {
  if (isCronMaterializing || isShuttingDown) {
    return;
  }

  isCronMaterializing = true;

  try {
    const { materializedCount } =
      await materializeDueCronSchedules();

    if (materializedCount > 0) {
      console.log(
        `Materialized ${materializedCount} due cron job(s)`,
      );
    }
  } catch (error) {
    if (!isShuttingDown) {
      console.error(
        "Cron materialization failed:",
        error,
      );
    }
  } finally {
    isCronMaterializing = false;
  }
};

const startCronMaterializerLoop = () => {
  void runCronMaterializer();

  console.log(
    `Cron materializer started with interval ` +
      `${CRON_MATERIALIZER_INTERVAL_MS}ms`,
  );

  return setInterval(() => {
    void runCronMaterializer();
  }, CRON_MATERIALIZER_INTERVAL_MS);
};

const processJobInBackground = ({
  claimedJob,
  workerId,
}) => {
  const jobPromise = processClaimedJob({
    job: claimedJob.job,
    execution: claimedJob.execution,
    workerId,
  })
    .then((result) => {
      console.log(
        `Job ${claimedJob.job.id} finished with status: ` +
          `${result.status}`,
      );
    })
    .catch((error) => {
      console.error(
        `Failed to process job ${claimedJob.job.id}:`,
        error,
      );
    })
    .finally(() => {
      activeJobs.delete(jobPromise);
    });

  activeJobs.add(jobPromise);
};

const startPollingLoop = async (workerId) => {
  while (!isShuttingDown) {
    try {
      while (
        !isShuttingDown &&
        activeJobs.size < WORKER_CONCURRENCY
      ) {
        const claimedJob = await claimNextJob(workerId);

        if (!claimedJob) {
          break;
        }

        console.log(
          `Claimed job ${claimedJob.job.id}, ` +
            `attempt ${claimedJob.execution.attempt_no}`,
        );

        processJobInBackground({
          claimedJob,
          workerId,
        });
      }
    } catch (error) {
      if (!isShuttingDown) {
        console.error("Worker polling error:", error);
      }
    }

    if (!isShuttingDown) {
      await wait(POLL_INTERVAL_MS);
    }
  }
};

const waitForActiveJobs = async () => {
  if (activeJobs.size === 0) {
    return true;
  }

  console.log(
    `Waiting for ${activeJobs.size} active job(s) to finish`,
  );

  let timeoutId;

  const completionPromise = Promise.allSettled([
    ...activeJobs,
  ]).then(() => true);

  const timeoutPromise = new Promise((resolve) => {
    timeoutId = setTimeout(() => {
      resolve(false);
    }, SHUTDOWN_TIMEOUT_MS);
  });

  const completed = await Promise.race([
    completionPromise,
    timeoutPromise,
  ]);

  clearTimeout(timeoutId);

  return completed;
};

const shutdownWorker = async (signal) => {
  if (shutdownPromise) {
    return shutdownPromise;
  }

  shutdownPromise = (async () => {
    isShuttingDown = true;

    console.log(
      `${signal} received. Starting graceful shutdown`,
    );

    if (recoveryTimer) {
      clearInterval(recoveryTimer);
      recoveryTimer = null;
    }

    if (cronMaterializerTimer) {
      clearInterval(cronMaterializerTimer);
      cronMaterializerTimer = null;
    }

    if (currentWorkerId) {
      await markWorkerDraining(currentWorkerId);

      console.log(
        `Worker ${currentWorkerId} is now draining`,
      );
    }

    if (pollingLoopPromise) {
      await pollingLoopPromise;
    }

    const jobsCompleted = await waitForActiveJobs();

    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = null;
    }

    if (jobsCompleted && currentWorkerId) {
      await markWorkerOffline(currentWorkerId);

      console.log(
        `Worker ${currentWorkerId} is now offline`,
      );
    } else if (!jobsCompleted) {
      console.warn(
        "Shutdown timeout reached. The worker remains " +
          "draining so crash recovery can recover its jobs",
      );
    }

    await pool.end();

    console.log("Worker shutdown completed");

    process.exit(jobsCompleted ? 0 : 1);
  })().catch(async (error) => {
    console.error("Graceful shutdown failed:", error);

    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = null;
    }

    if (recoveryTimer) {
      clearInterval(recoveryTimer);
      recoveryTimer = null;
    }

    if (cronMaterializerTimer) {
      clearInterval(cronMaterializerTimer);
      cronMaterializerTimer = null;
    }

    try {
      await pool.end();
    } catch (poolError) {
      console.error(
        "Failed to close PostgreSQL pool:",
        poolError,
      );
    }

    process.exit(1);
  });

  return shutdownPromise;
};

const startWorker = async () => {
  const worker = await registerWorker();

  currentWorkerId = worker.id;

  await sendHeartbeat(worker.id);

  heartbeatTimer = startHeartbeatLoop(worker.id);
  recoveryTimer = startWorkerRecoveryLoop();
  cronMaterializerTimer =
    startCronMaterializerLoop();

  console.log(
    `Worker ${worker.id} started with concurrency ` +
      `${WORKER_CONCURRENCY}`,
  );

  pollingLoopPromise = startPollingLoop(worker.id);

  await pollingLoopPromise;
};

process.once("SIGINT", () => {
  void shutdownWorker("SIGINT");
});

process.once("SIGTERM", () => {
  void shutdownWorker("SIGTERM");
});

startWorker().catch(async (error) => {
  console.error("Failed to start worker:", error);

  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }

  if (recoveryTimer) {
    clearInterval(recoveryTimer);
    recoveryTimer = null;
  }

  if (cronMaterializerTimer) {
    clearInterval(cronMaterializerTimer);
    cronMaterializerTimer = null;
  }

  try {
    if (currentWorkerId) {
      await markWorkerOffline(currentWorkerId);
    }

    await pool.end();
  } catch (cleanupError) {
    console.error("Worker cleanup failed:", cleanupError);
  }

  process.exit(1);
});
