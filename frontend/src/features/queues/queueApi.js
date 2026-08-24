import apiClient from "../../api/client";

export const queueKeys = {
  all: ["queues"],
  project: (projectId) => [
    ...queueKeys.all,
    "project",
    projectId,
  ],
  detail: (queueId) => [
    ...queueKeys.all,
    "detail",
    queueId,
  ],
  statistics: (queueId) => [
    ...queueKeys.all,
    "statistics",
    queueId,
  ],
};

export const getProjectQueues = async (projectId) => {
  const response = await apiClient.get(
    `/projects/${projectId}/queues`,
  );

  return response.data.data.queues;
};

export const getQueue = async (queueId) => {
  const response = await apiClient.get(`/queues/${queueId}`);

  return response.data.data.queue;
};

export const getQueueStatistics = async (queueId) => {
  const response = await apiClient.get(
    `/queues/${queueId}/statistics`,
  );

  return response.data.data.statistics;
};

export const createQueue = async ({
  projectId,
  queueData,
}) => {
  const response = await apiClient.post(
    `/projects/${projectId}/queues`,
    queueData,
  );

  return response.data.data.queue;
};

export const updateQueue = async ({
  queueId,
  queueData,
}) => {
  const response = await apiClient.patch(
    `/queues/${queueId}`,
    queueData,
  );

  return response.data.data.queue;
};

export const pauseQueue = async (queueId) => {
  const response = await apiClient.post(
    `/queues/${queueId}/pause`,
  );

  return response.data.data.queue;
};

export const resumeQueue = async (queueId) => {
  const response = await apiClient.post(
    `/queues/${queueId}/resume`,
  );

  return response.data.data.queue;
};

export const removeQueue = async (queueId) => {
  const response = await apiClient.delete(
    `/queues/${queueId}`,
  );

  return response.data.data.queue;
};
