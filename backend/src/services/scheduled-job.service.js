import { CronExpressionParser } from "cron-parser";
import * as scheduledJobRepository from "../repositories/scheduled-job.repository.js";
import AppError from "../utils/app-error.js";

const hasOwn = (object, property) => {
  return Object.prototype.hasOwnProperty.call(
    object,
    property,
  );
};

const validateTimezone = (timezone) => {
  if (
    typeof timezone !== "string" ||
    timezone.trim() === ""
  ) {
    throw new AppError(
      "timezone must be a valid IANA timezone",
      400,
    );
  }

  const normalizedTimezone = timezone.trim();

  try {
    new Intl.DateTimeFormat("en-US", {
      timeZone: normalizedTimezone,
    });
  } catch {
    throw new AppError(
      "timezone must be a valid IANA timezone",
      400,
    );
  }

  return normalizedTimezone;
};

const validateCronExpression = (cronExpression) => {
  if (
    typeof cronExpression !== "string" ||
    cronExpression.trim() === ""
  ) {
    throw new AppError(
      "cronExpression is required",
      400,
    );
  }

  return cronExpression.trim();
};

const validateJobTemplate = ({
  jobTemplate,
  timezone,
}) => {
  if (
    jobTemplate === null ||
    typeof jobTemplate !== "object" ||
    Array.isArray(jobTemplate)
  ) {
    throw new AppError(
      "jobTemplate must be a JSON object",
      400,
    );
  }

  const {
    type,
    payload = {},
    priority = null,
    maxAttempts = null,
  } = jobTemplate;

  if (
    typeof type !== "string" ||
    type.trim() === ""
  ) {
    throw new AppError(
      "jobTemplate.type is required",
      400,
    );
  }

  if (
    payload === null ||
    typeof payload !== "object" ||
    Array.isArray(payload)
  ) {
    throw new AppError(
      "jobTemplate.payload must be a JSON object",
      400,
    );
  }

  if (
    priority !== null &&
    (
      !Number.isInteger(priority) ||
      priority < -32768 ||
      priority > 32767
    )
  ) {
    throw new AppError(
      "jobTemplate.priority must be an integer " +
        "between -32768 and 32767",
      400,
    );
  }

  if (
    maxAttempts !== null &&
    (
      !Number.isInteger(maxAttempts) ||
      maxAttempts < 1
    )
  ) {
    throw new AppError(
      "jobTemplate.maxAttempts must be a positive integer",
      400,
    );
  }

  return {
    type: type.trim(),
    payload,
    priority,
    maxAttempts,
    timezone,
  };
};

const calculateNextRunAt = ({
  cronExpression,
  timezone,
}) => {
  try {
    const interval = CronExpressionParser.parse(
      cronExpression,
      {
        currentDate: new Date(),
        tz: timezone,
      },
    );

    return new Date(
      interval.next().toString(),
    ).toISOString();
  } catch {
    throw new AppError(
      "Invalid cron expression",
      400,
    );
  }
};

const ensureManagePermission = (schedule) => {
  if (
    !["owner", "admin"].includes(
      schedule.organization_role,
    )
  ) {
    throw new AppError(
      "You do not have permission to manage this schedule",
      403,
    );
  }
};

export const createCronSchedule = async ({
  projectId,
  queueId,
  userId,
  scheduleData,
}) => {
  const {
    cronExpression,
    timezone = "UTC",
    jobTemplate,
  } = scheduleData;

  const normalizedTimezone =
    validateTimezone(timezone);

  const normalizedCronExpression =
    validateCronExpression(cronExpression);

  const normalizedJobTemplate =
    validateJobTemplate({
      jobTemplate,
      timezone: normalizedTimezone,
    });

  const nextRunAt = calculateNextRunAt({
    cronExpression: normalizedCronExpression,
    timezone: normalizedTimezone,
  });

  const schedule =
    await scheduledJobRepository.createCronSchedule({
      projectId,
      queueId,
      userId,
      cronExpression: normalizedCronExpression,
      jobTemplate: normalizedJobTemplate,
      nextRunAt,
    });

  if (!schedule) {
    throw new AppError(
      "Queue not found or access denied",
      404,
    );
  }

  return schedule;
};

export const listCronSchedules = async ({
  projectId,
  queueId,
  userId,
}) => {
  return scheduledJobRepository
    .findCronSchedulesForUser({
      projectId,
      queueId,
      userId,
    });
};

export const getCronScheduleById = async ({
  scheduleId,
  projectId,
  queueId,
  userId,
}) => {
  const schedule =
    await scheduledJobRepository
      .findCronScheduleForUser({
        scheduleId,
        projectId,
        queueId,
        userId,
      });

  if (!schedule) {
    throw new AppError(
      "Cron schedule not found",
      404,
    );
  }

  return schedule;
};

export const updateCronSchedule = async ({
  scheduleId,
  projectId,
  queueId,
  userId,
  scheduleData,
}) => {
  const supportedFields = [
    "cronExpression",
    "timezone",
    "jobTemplate",
  ];

  const hasUpdate = supportedFields.some((field) =>
    hasOwn(scheduleData, field),
  );

  if (!hasUpdate) {
    throw new AppError(
      "Provide at least one schedule field to update",
      400,
    );
  }

  const currentSchedule =
    await getCronScheduleById({
      scheduleId,
      projectId,
      queueId,
      userId,
    });

  ensureManagePermission(currentSchedule);

  const timezone = hasOwn(
    scheduleData,
    "timezone",
  )
    ? validateTimezone(scheduleData.timezone)
    : validateTimezone(
        currentSchedule.payload_template
          ?.timezone ?? "UTC",
      );

  const cronExpression = hasOwn(
    scheduleData,
    "cronExpression",
  )
    ? validateCronExpression(
        scheduleData.cronExpression,
      )
    : currentSchedule.cron_expression;

  const templateSource = hasOwn(
    scheduleData,
    "jobTemplate",
  )
    ? scheduleData.jobTemplate
    : currentSchedule.payload_template;

  const jobTemplate = validateJobTemplate({
    jobTemplate: templateSource,
    timezone,
  });

  const nextRunAt = calculateNextRunAt({
    cronExpression,
    timezone,
  });

  const schedule =
    await scheduledJobRepository
      .updateCronSchedule({
        scheduleId,
        projectId,
        queueId,
        userId,
        cronExpression,
        jobTemplate,
        nextRunAt,
      });

  if (!schedule) {
    throw new AppError(
      "Cron schedule not found",
      404,
    );
  }

  return schedule;
};

export const activateCronSchedule = async ({
  scheduleId,
  projectId,
  queueId,
  userId,
}) => {
  const currentSchedule =
    await getCronScheduleById({
      scheduleId,
      projectId,
      queueId,
      userId,
    });

  ensureManagePermission(currentSchedule);

  if (currentSchedule.is_active) {
    throw new AppError(
      "Cron schedule is already active",
      409,
    );
  }

  const timezone = validateTimezone(
    currentSchedule.payload_template
      ?.timezone ?? "UTC",
  );

  const nextRunAt = calculateNextRunAt({
    cronExpression:
      currentSchedule.cron_expression,
    timezone,
  });

  const schedule =
    await scheduledJobRepository
      .setCronScheduleActiveState({
        scheduleId,
        projectId,
        queueId,
        userId,
        isActive: true,
        nextRunAt,
      });

  if (!schedule) {
    throw new AppError(
      "Cron schedule not found",
      404,
    );
  }

  return schedule;
};

export const deactivateCronSchedule = async ({
  scheduleId,
  projectId,
  queueId,
  userId,
}) => {
  const currentSchedule =
    await getCronScheduleById({
      scheduleId,
      projectId,
      queueId,
      userId,
    });

  ensureManagePermission(currentSchedule);

  if (!currentSchedule.is_active) {
    throw new AppError(
      "Cron schedule is already inactive",
      409,
    );
  }

  const schedule =
    await scheduledJobRepository
      .setCronScheduleActiveState({
        scheduleId,
        projectId,
        queueId,
        userId,
        isActive: false,
      });

  if (!schedule) {
    throw new AppError(
      "Cron schedule not found",
      404,
    );
  }

  return schedule;
};

export const deleteCronSchedule = async ({
  scheduleId,
  projectId,
  queueId,
  userId,
}) => {
  const currentSchedule =
    await getCronScheduleById({
      scheduleId,
      projectId,
      queueId,
      userId,
    });

  ensureManagePermission(currentSchedule);

  const schedule =
    await scheduledJobRepository
      .deleteCronSchedule({
        scheduleId,
        projectId,
        queueId,
        userId,
      });

  if (!schedule) {
    throw new AppError(
      "Cron schedule not found",
      404,
    );
  }

  return schedule;
};
