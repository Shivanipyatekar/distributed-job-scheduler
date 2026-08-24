import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createBatchJobs,
  createJob,
  deleteJob,
  updateJob,
} from "./jobApi";
import { jobKeys } from "./useJobs";

export const useCreateJob = (
  projectId,
  queueId
) => {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (jobData) =>
      createJob({
        projectId,
        queueId,
        jobData,
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: jobKeys.lists(),
      });
    },
  });
};

export const useCreateBatchJobs = (
  projectId,
  queueId
) => {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (jobs) =>
      createBatchJobs({
        projectId,
        queueId,
        jobs,
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: jobKeys.lists(),
      });
    },
  });
};

export const useUpdateJob = (
  projectId,
  queueId
) => {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      jobId,
      jobData,
    }) =>
      updateJob({
        projectId,
        queueId,
        jobId,
        jobData,
      }),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: jobKeys.lists(),
      });

      queryClient.invalidateQueries({
        queryKey: jobKeys.detail(
          projectId,
          queueId,
          variables.jobId
        ),
      });
    },
  });
};

export const useDeleteJob = (
  projectId,
  queueId
) => {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (jobId) =>
      deleteJob({
        projectId,
        queueId,
        jobId,
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: jobKeys.lists(),
      });
    },
  });
};
