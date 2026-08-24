import { useQuery } from "@tanstack/react-query";
import { getJobs } from "./jobApi";

export const jobKeys = {
  all: ["jobs"],

  lists: () => [
    ...jobKeys.all,
    "list",
  ],

  list: (
    projectId,
    queueId,
    filters
  ) => [
    ...jobKeys.lists(),
    projectId,
    queueId,
    filters,
  ],

  details: () => [
    ...jobKeys.all,
    "detail",
  ],

  detail: (
    projectId,
    queueId,
    jobId
  ) => [
    ...jobKeys.details(),
    projectId,
    queueId,
    jobId,
  ],

  executions: (
    projectId,
    queueId,
    jobId
  ) => [
    ...jobKeys.detail(
      projectId,
      queueId,
      jobId
    ),
    "executions",
  ],

  logs: (
    projectId,
    queueId,
    jobId,
    filters
  ) => [
    ...jobKeys.detail(
      projectId,
      queueId,
      jobId
    ),
    "logs",
    filters,
  ],
};

export const useJobs = (
  projectId,
  queueId,
  {
    page = 1,
    limit = 20,
    status = "",
    type = "",
  } = {}
) => {
  const filters = {
    page,
    limit,
    status,
    type,
  };

  return useQuery({
    queryKey: jobKeys.list(
      projectId,
      queueId,
      filters
    ),

    queryFn: () =>
      getJobs({
        projectId,
        queueId,
        ...filters,
      }),

    enabled: Boolean(
      projectId &&
      queueId
    ),
  });
};
