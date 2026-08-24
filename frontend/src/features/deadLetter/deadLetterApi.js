import api from "../../api/client";

export const getDeadLetterEntries = async ({
  projectId,
  queueId,
  page = 1,
  limit = 20,
}) => {
  const response = await api.get(
    `/projects/${projectId}/queues/${queueId}/dead-letter`,
    {
      params: {
        page,
        limit,
      },
    }
  );

  return {
    entries: response.data.data ?? [],
    pagination: response.data.pagination,
  };
};

export const getDeadLetterEntry = async ({
  projectId,
  queueId,
  deadLetterId,
}) => {
  const response = await api.get(
    `/projects/${projectId}/queues/${queueId}/dead-letter/${deadLetterId}`
  );

  return response.data.data;
};

export const requeueDeadLetterEntry = async ({
  projectId,
  queueId,
  deadLetterId,
}) => {
  const response = await api.post(
    `/projects/${projectId}/queues/${queueId}/dead-letter/${deadLetterId}/requeue`
  );

  return response.data.data;
};
