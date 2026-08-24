import { useQuery } from "@tanstack/react-query";
import { getJobExecutions } from "./jobApi";
import { jobKeys } from "./useJobs";

export const useJobExecutions = (
  projectId,
  queueId,
  jobId
) => {
  return useQuery({
    queryKey: jobKeys.executions(
      projectId,
      queueId,
      jobId
    ),

    queryFn: () =>
      getJobExecutions({
        projectId,
        queueId,
        jobId,
      }),

    enabled: Boolean(
      projectId &&
      queueId &&
      jobId
    ),
  });
};
