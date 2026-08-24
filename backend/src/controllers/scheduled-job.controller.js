import {
  activateCronSchedule,
  createCronSchedule,
  deactivateCronSchedule,
  deleteCronSchedule,
  getCronScheduleById,
  listCronSchedules,
  updateCronSchedule,
} from "../services/scheduled-job.service.js";

export const create = async (req, res, next) => {
  const schedule = await createCronSchedule({
    projectId: req.params.projectId,
    queueId: req.params.queueId,
    userId: req.user.id,
    scheduleData: req.body,
  });

  return res.status(201).json({
    success: true,
    message: "Cron schedule created successfully",
    data: schedule,
  });
};

export const list = async (req, res, next) => {
  const schedules = await listCronSchedules({
    projectId: req.params.projectId,
    queueId: req.params.queueId,
    userId: req.user.id,
  });

  return res.status(200).json({
    success: true,
    message: "Cron schedules retrieved successfully",
    data: schedules,
    count: schedules.length,
  });
};

export const getById = async (req, res, next) => {
  const schedule = await getCronScheduleById({
    scheduleId: req.params.scheduleId,
    projectId: req.params.projectId,
    queueId: req.params.queueId,
    userId: req.user.id,
  });

  return res.status(200).json({
    success: true,
    message: "Cron schedule retrieved successfully",
    data: schedule,
  });
};

export const update = async (req, res, next) => {
  const schedule = await updateCronSchedule({
    scheduleId: req.params.scheduleId,
    projectId: req.params.projectId,
    queueId: req.params.queueId,
    userId: req.user.id,
    scheduleData: req.body,
  });

  return res.status(200).json({
    success: true,
    message: "Cron schedule updated successfully",
    data: schedule,
  });
};

export const activate = async (req, res, next) => {
  const schedule = await activateCronSchedule({
    scheduleId: req.params.scheduleId,
    projectId: req.params.projectId,
    queueId: req.params.queueId,
    userId: req.user.id,
  });

  return res.status(200).json({
    success: true,
    message: "Cron schedule activated successfully",
    data: schedule,
  });
};

export const deactivate = async (
  req,
  res,
  next,
) => {
  const schedule = await deactivateCronSchedule({
    scheduleId: req.params.scheduleId,
    projectId: req.params.projectId,
    queueId: req.params.queueId,
    userId: req.user.id,
  });

  return res.status(200).json({
    success: true,
    message: "Cron schedule deactivated successfully",
    data: schedule,
  });
};

export const remove = async (req, res, next) => {
  const schedule = await deleteCronSchedule({
    scheduleId: req.params.scheduleId,
    projectId: req.params.projectId,
    queueId: req.params.queueId,
    userId: req.user.id,
  });

  return res.status(200).json({
    success: true,
    message: "Cron schedule deleted successfully",
    data: schedule,
  });
};
