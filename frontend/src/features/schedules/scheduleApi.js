import api from "../../api/client";

export const getSchedules = async ({
  projectId,
  queueId,
}) => {
  const response = await api.get(
    `/projects/${projectId}/queues/${queueId}/cron-schedules`
  );

  return response.data.data ?? [];
};

export const getSchedule = async ({
  projectId,
  queueId,
  scheduleId,
}) => {
  const response = await api.get(
    `/projects/${projectId}/queues/${queueId}/cron-schedules/${scheduleId}`
  );

  return response.data.data;
};

export const createSchedule = async ({
  projectId,
  queueId,
  scheduleData,
}) => {
  const response = await api.post(
    `/projects/${projectId}/queues/${queueId}/cron-schedules`,
    scheduleData
  );

  return response.data.data;
};

export const updateSchedule = async ({
  projectId,
  queueId,
  scheduleId,
  scheduleData,
}) => {
  const response = await api.patch(
    `/projects/${projectId}/queues/${queueId}/cron-schedules/${scheduleId}`,
    scheduleData
  );

  return response.data.data;
};

export const activateSchedule = async ({
  projectId,
  queueId,
  scheduleId,
}) => {
  const response = await api.post(
    `/projects/${projectId}/queues/${queueId}/cron-schedules/${scheduleId}/activate`
  );

  return response.data.data;
};

export const deactivateSchedule = async ({
  projectId,
  queueId,
  scheduleId,
}) => {
  const response = await api.post(
    `/projects/${projectId}/queues/${queueId}/cron-schedules/${scheduleId}/deactivate`
  );

  return response.data.data;
};

export const deleteSchedule = async ({
  projectId,
  queueId,
  scheduleId,
}) => {
  const response = await api.delete(
    `/projects/${projectId}/queues/${queueId}/cron-schedules/${scheduleId}`
  );

  return response.data.data;
};
