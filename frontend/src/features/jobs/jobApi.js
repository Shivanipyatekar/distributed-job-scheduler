import api from "../../api/client";

export const getJobs = async ({
  projectId,
  queueId,
  page = 1,
  limit = 20,
  status = "",
  type = "",
}) => {
  const params = {
    page,
    limit,
  };

  if (status) {
    params.status = status;
  }

  if (type?.trim()) {
    params.type = type.trim();
  }

  const response = await api.get(
    `/projects/${projectId}/queues/${queueId}/jobs`,
    {
      params,
    }
  );

  return {
    jobs: response.data.data ?? [],
    pagination: response.data.pagination,
  };
};

export const getJob = async ({
  projectId,
  queueId,
  jobId,
}) => {
  const response = await api.get(
    `/projects/${projectId}/queues/${queueId}/jobs/${jobId}`
  );

  return response.data.data;
};

export const createJob = async ({
  projectId,
  queueId,
  jobData,
}) => {
  const response = await api.post(
    `/projects/${projectId}/queues/${queueId}/jobs`,
    jobData
  );

  return response.data.data;
};

export const createBatchJobs = async ({
  projectId,
  queueId,
  jobs,
}) => {
  const response = await api.post(
    `/projects/${projectId}/queues/${queueId}/jobs/batch`,
    {
      jobs,
    }
  );

  return response.data.data;
};

export const updateJob = async ({
  projectId,
  queueId,
  jobId,
  jobData,
}) => {
  const response = await api.patch(
    `/projects/${projectId}/queues/${queueId}/jobs/${jobId}`,
    jobData
  );

  return response.data.data;
};

export const deleteJob = async ({
  projectId,
  queueId,
  jobId,
}) => {
  const response = await api.delete(
    `/projects/${projectId}/queues/${queueId}/jobs/${jobId}`
  );

  return response.data.data;
};

export const getJobExecutions = async ({
  projectId,
  queueId,
  jobId,
}) => {
  const response = await api.get(
    `/projects/${projectId}/queues/${queueId}/jobs/${jobId}/executions`
  );

  return response.data.data ?? [];
};

export const getJobLogs = async ({
  projectId,
  queueId,
  jobId,
  page = 1,
  limit = 20,
  level = "",
}) => {
  const params = {
    page,
    limit,
  };

  if (level) {
    params.level = level;
  }

  const response = await api.get(
    `/projects/${projectId}/queues/${queueId}/jobs/${jobId}/logs`,
    {
      params,
    }
  );

  return {
    logs: response.data.data ?? [],
    pagination: response.data.pagination,
  };
};
