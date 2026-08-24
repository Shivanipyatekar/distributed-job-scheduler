import {
  getWorkerDetails,
  listWorkers,
} from "../services/worker-monitoring.service.js";

export const list = async (req, res, next) => {
  const workers = await listWorkers({
    projectId: req.params.projectId,
    userId: req.user.id,
  });

  return res.status(200).json({
    success: true,
    message: "Workers retrieved successfully",
    data: workers,
    count: workers.length,
  });
};

export const getById = async (req, res, next) => {
  const result = await getWorkerDetails({
    projectId: req.params.projectId,
    workerId: req.params.workerId,
    userId: req.user.id,
    query: req.query,
  });

  return res.status(200).json({
    success: true,
    message: "Worker details retrieved successfully",
    data: result,
  });
};
