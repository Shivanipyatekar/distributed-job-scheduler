import { useQuery } from "@tanstack/react-query";
import {
  getProjectQueues,
  getQueue,
  getQueueStatistics,
  queueKeys,
} from "./queueApi";

export const useQueues = (projectId) =>
  useQuery({
    queryKey: queueKeys.project(projectId),
    queryFn: () => getProjectQueues(projectId),
    enabled: Boolean(projectId),
    staleTime: 10_000,
  });

export const useQueue = (queueId) =>
  useQuery({
    queryKey: queueKeys.detail(queueId),
    queryFn: () => getQueue(queueId),
    enabled: Boolean(queueId),
  });

export const useQueueStatistics = (queueId) =>
  useQuery({
    queryKey: queueKeys.statistics(queueId),
    queryFn: () => getQueueStatistics(queueId),
    enabled: Boolean(queueId),
    refetchInterval: 10_000,
  });
