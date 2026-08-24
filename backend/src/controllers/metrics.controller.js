import { getProjectMetrics } from "../services/metrics.service.js";

export const getDashboardMetrics = async (
  req,
  res,
  next,
) => {
  const metrics = await getProjectMetrics({
    projectId: req.params.projectId,
    userId: req.user.id,
    query: req.query,
  });

  return res.status(200).json({
    success: true,
    message: "Project metrics retrieved successfully",
    data: metrics,
  });
};
