import { useQuery } from "@tanstack/react-query";
import { getJobLogs } from "./jobApi";
import { jobKeys } from "./useJobs";

export const useJobLogs = (
  projectId,
  queueId,
  jobId,
  {
    page = 1,
    limit = 20,
    level = "",
  } = {}
) => {
  const filters = {
    page,
    limit,
    level,
  };

  return useQuery({
    queryKey: jobKeys.logs(
      projectId,
      queueId,
      jobId,
      filters
    ),

    queryFn: () =>
      getJobLogs({
        projectId,
        queueId,
        jobId,
        ...filters,
      }),

    enabled: Boolean(
      projectId &&
      queueId &&
      jobId
    ),
  });
};
