import * as metricsRepository from "../repositories/metrics.repository.js";
import AppError from "../utils/app-error.js";

const DEFAULT_WINDOW_HOURS = 24;
const DEFAULT_BUCKET_MINUTES = 60;
const MAX_WINDOW_HOURS = 168;
const MAX_BUCKET_MINUTES = 1440;
const MAX_DATA_POINTS = 500;
const WORKER_STALE_AFTER_SECONDS = 30;

const parseInteger = ({
  value,
  defaultValue,
  minimum,
  maximum,
  fieldName,
}) => {
  if (value === undefined) {
    return defaultValue;
  }

  const parsedValue = Number(value);

  if (
    !Number.isInteger(parsedValue) ||
    parsedValue < minimum ||
    parsedValue > maximum
  ) {
    throw new AppError(
      `${fieldName} must be an integer between ` +
        `${minimum} and ${maximum}`,
      400,
    );
  }

  return parsedValue;
};

export const getProjectMetrics = async ({
  projectId,
  userId,
  query = {},
}) => {
  const hasAccess =
    await metricsRepository.hasProjectAccess({
      projectId,
      userId,
    });

  if (!hasAccess) {
    throw new AppError("Project not found", 404);
  }

  const windowHours = parseInteger({
    value: query.windowHours,
    defaultValue: DEFAULT_WINDOW_HOURS,
    minimum: 1,
    maximum: MAX_WINDOW_HOURS,
    fieldName: "windowHours",
  });

  const bucketMinutes = parseInteger({
    value: query.bucketMinutes,
    defaultValue: DEFAULT_BUCKET_MINUTES,
    minimum: 1,
    maximum: MAX_BUCKET_MINUTES,
    fieldName: "bucketMinutes",
  });

  const dataPointCount = Math.ceil(
    (windowHours * 60) / bucketMinutes,
  );

  if (dataPointCount > MAX_DATA_POINTS) {
    throw new AppError(
      `The requested metrics range exceeds ` +
        `${MAX_DATA_POINTS} data points`,
      400,
    );
  }

  const [
    summary,
    queues,
    throughput,
  ] = await Promise.all([
    metricsRepository.findProjectSummary({
      projectId,
      windowHours,
      staleAfterSeconds:
        WORKER_STALE_AFTER_SECONDS,
    }),
    metricsRepository.findQueueMetrics({
      projectId,
    }),
    metricsRepository.findThroughputSeries({
      projectId,
      windowHours,
      bucketMinutes,
    }),
  ]);

  return {
    window: {
      windowHours,
      bucketMinutes,
    },
    summary,
    queues,
    throughput,
  };
};
