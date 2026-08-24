import apiClient from "../../api/client";

export const metricsKeys = {
  all: ["project-metrics"],
  project: (projectId, windowHours, bucketMinutes) => [
    ...metricsKeys.all,
    projectId,
    windowHours,
    bucketMinutes,
  ],
};

export const getProjectMetrics = async ({
  projectId,
  windowHours = 24,
  bucketMinutes = 60,
}) => {
  const response = await apiClient.get(
    `/projects/${projectId}/metrics`,
    {
      params: {
        windowHours,
        bucketMinutes,
      },
    },
  );

  return response.data.data;
};
