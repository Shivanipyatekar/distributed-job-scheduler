import { useQuery } from "@tanstack/react-query";
import { getJob } from "./jobApi";
import { jobKeys } from "./useJobs";

export const useJob = (
  projectId,
  queueId,
  jobId
) => {
  return useQuery({
    queryKey: jobKeys.detail(
      projectId,
      queueId,
      jobId
    ),

    queryFn: () =>
      getJob({
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
