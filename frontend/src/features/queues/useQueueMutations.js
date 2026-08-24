import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { metricsKeys } from "../dashboard/metricsApi";
import {
  createQueue,
  pauseQueue,
  queueKeys,
  removeQueue,
  resumeQueue,
  updateQueue,
} from "./queueApi";

const mergeQueue = (currentQueue, updatedQueue) => ({
  ...currentQueue,
  ...updatedQueue,
});

const updateQueueCaches = (
  queryClient,
  projectId,
  updatedQueue,
) => {
  queryClient.setQueryData(
    queueKeys.detail(updatedQueue.id),
    (currentQueue) =>
      mergeQueue(currentQueue, updatedQueue),
  );

  queryClient.setQueryData(
    queueKeys.project(projectId),
    (currentQueues) =>
      currentQueues?.map((queue) =>
        queue.id === updatedQueue.id
          ? mergeQueue(queue, updatedQueue)
          : queue,
      ),
  );
};

const invalidateQueueMetrics = (queryClient) => {
  queryClient.invalidateQueries({
    queryKey: metricsKeys.all,
  });
};

export const useCreateQueue = (projectId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (queueData) =>
      createQueue({ projectId, queueData }),
    onSuccess: (queue) => {
      queryClient.setQueryData(
        queueKeys.detail(queue.id),
        queue,
      );

      queryClient.invalidateQueries({
        queryKey: queueKeys.project(projectId),
      });

      invalidateQueueMetrics(queryClient);
    },
  });
};

export const useUpdateQueue = (projectId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ queueId, queueData }) =>
      updateQueue({ queueId, queueData }),
    onSuccess: (queue) => {
      updateQueueCaches(
        queryClient,
        projectId,
        queue,
      );

      queryClient.invalidateQueries({
        queryKey: queueKeys.statistics(queue.id),
      });

      invalidateQueueMetrics(queryClient);
    },
  });
};

export const useSetQueuePaused = (projectId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ queueId, shouldPause }) =>
      shouldPause
        ? pauseQueue(queueId)
        : resumeQueue(queueId),
    onSuccess: (queue) => {
      updateQueueCaches(
        queryClient,
        projectId,
        queue,
      );

      queryClient.invalidateQueries({
        queryKey: queueKeys.statistics(queue.id),
      });

      invalidateQueueMetrics(queryClient);
    },
  });
};

export const useDeleteQueue = (projectId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeQueue,
    onSuccess: (deletedQueue) => {
      queryClient.setQueryData(
        queueKeys.project(projectId),
        (currentQueues) =>
          currentQueues?.filter(
            (queue) => queue.id !== deletedQueue.id,
          ),
      );

      queryClient.removeQueries({
        queryKey: queueKeys.detail(deletedQueue.id),
      });

      queryClient.removeQueries({
        queryKey: queueKeys.statistics(deletedQueue.id),
      });

      invalidateQueueMetrics(queryClient);
    },
  });
};
