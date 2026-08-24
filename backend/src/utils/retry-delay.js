export const calculateRetryDelay = ({
  strategy,
  baseDelayMs,
  maxDelayMs,
  attemptNo,
}) => {
  const normalizedAttempt = Math.max(Number(attemptNo), 1);

  let delayMs;

  switch (strategy) {
    case "fixed":
      delayMs = baseDelayMs;
      break;

    case "linear":
      delayMs = baseDelayMs * normalizedAttempt;
      break;

    case "exponential":
      delayMs = baseDelayMs * 2 ** (normalizedAttempt - 1);
      break;

    default:
      throw new Error(`Unsupported retry strategy: ${strategy}`);
  }

  return Math.min(delayMs, maxDelayMs);
};
