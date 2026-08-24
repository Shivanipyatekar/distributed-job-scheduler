import api from "../../api/client";

export const getWorkers = async ({
  projectId,
}) => {
  const response = await api.get(
    `/projects/${projectId}/workers`
  );

  return response.data.data ?? [];
};

export const getWorker = async ({
  projectId,
  workerId,
  heartbeatLimit = 30,
  executionLimit = 20,
}) => {
  const response = await api.get(
    `/projects/${projectId}/workers/${workerId}`,
    {
      params: {
        heartbeatLimit,
        executionLimit,
      },
    }
  );

  return response.data.data;
};
