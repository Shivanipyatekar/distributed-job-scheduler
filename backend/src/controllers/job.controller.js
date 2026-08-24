import {
  createJob,
  findJobsByQueueForUser,
  findJobByIdForUser,
  updatePendingJob,
  deletePendingJob,
getJobExecutionHistory,
getJobLogHistory,
  createBatchJobs,
} from "../services/job.service.js";

export const create = async (req, res, next) => {
  const job = await createJob({
    projectId: req.params.projectId,
    queueId: req.params.queueId,
    userId: req.user.id,
    jobData: req.body,
  });

  return res.status(201).json({
    success: true,
    message: "Job created successfully",
    data: job,
  });
};

export const list = async (req, res, next) => {
  const result = await findJobsByQueueForUser({
    projectId: req.params.projectId,
    queueId: req.params.queueId,
    userId: req.user.id,
    filters: req.query,
  });

  return res.status(200).json({
    success: true,
    message: "Jobs retrieved successfully",
    data: result.jobs,
    pagination: result.pagination,
  });
};

export const getById = async (req, res, next) => {
  const job = await findJobByIdForUser({
    jobId: req.params.jobId,
    queueId: req.params.queueId,
    projectId: req.params.projectId,
    userId: req.user.id,
  });

  return res.status(200).json({
    success: true,
    message: "Job retrieved successfully",
    data: job,
  });
};

export const update = async (req, res, next) => {
  const job = await updatePendingJob({
    jobId: req.params.jobId,
    queueId: req.params.queueId,
    projectId: req.params.projectId,
    userId: req.user.id,
    jobData: req.body,
  });

  return res.status(200).json({
    success: true,
    message: "Job updated successfully",
    data: job,
  });
};

export const remove = async (req, res, next) => {
  const job = await deletePendingJob({
    jobId: req.params.jobId,
    queueId: req.params.queueId,
    projectId: req.params.projectId,
    userId: req.user.id,
  });

  return res.status(200).json({
    success: true,
    message: "Job deleted successfully",
    data: job,
  });
};

export const createBatch = async (req, res, next) => {
  const jobs = await createBatchJobs({
    projectId: req.params.projectId,
    queueId: req.params.queueId,
    userId: req.user.id,
    batchData: req.body,
  });

  return res.status(201).json({
    success: true,
    message: "Batch jobs created successfully",
    data: jobs,
    count: jobs.length,
  });
};

export const getExecutions = async (
  req,
  res,
  next,
) => {
  const executions = await getJobExecutionHistory({
    jobId: req.params.jobId,
    queueId: req.params.queueId,
    projectId: req.params.projectId,
    userId: req.user.id,
  });

  return res.status(200).json({
    success: true,
    message:
      "Job execution history retrieved successfully",
    data: executions,
  });
};

export const getLogs = async (req, res, next) => {
  const result = await getJobLogHistory({
    jobId: req.params.jobId,
    queueId: req.params.queueId,
    projectId: req.params.projectId,
    userId: req.user.id,
    query: req.query,
  });

  return res.status(200).json({
    success: true,
    message: "Job logs retrieved successfully",
    data: result.logs,
    pagination: result.pagination,
  });
};
