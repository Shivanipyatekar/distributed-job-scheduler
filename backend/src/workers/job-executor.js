const MAX_TEST_DURATION_MS = 30000;

const handlers = new Map();

const wait = (durationMs) =>
  new Promise((resolve) => {
    setTimeout(resolve, durationMs);
  });

export const registerJobHandler = (type, handler) => {
  if (typeof type !== "string" || type.trim() === "") {
    throw new TypeError("Job handler type must be a non-empty string");
  }

  if (typeof handler !== "function") {
    throw new TypeError("Job handler must be a function");
  }

  handlers.set(type.trim(), handler);
};

export const executeJob = async (job) => {
  const handler = handlers.get(job.type);

  if (!handler) {
    throw new Error(`No handler registered for job type: ${job.type}`);
  }

  return handler(job.payload ?? {}, job);
};

registerJobHandler("test", async (payload) => {
  const requestedDuration = Number(payload.durationMs ?? 1000);

  const durationMs = Number.isFinite(requestedDuration)
    ? Math.min(Math.max(requestedDuration, 0), MAX_TEST_DURATION_MS)
    : 1000;

  await wait(durationMs);

  if (payload.shouldFail === true) {
    throw new Error(payload.errorMessage || "Test job failed as requested");
  }

  return {
    message: "Test job executed successfully",
    durationMs,
  };
});
