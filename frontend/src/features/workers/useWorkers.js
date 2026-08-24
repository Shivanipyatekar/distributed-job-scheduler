import {
  useQuery,
} from "@tanstack/react-query";

import {
  getWorker,
  getWorkers,
} from "./workerApi";

export const workerKeys = {
  all: ["workers"],

  lists: () => [
    ...workerKeys.all,
    "list",
  ],

  list: (projectId) => [
    ...workerKeys.lists(),
    projectId,
  ],

  details: () => [
    ...workerKeys.all,
    "detail",
  ],

  detail: (
    projectId,
    workerId,
    heartbeatLimit,
    executionLimit
  ) => [
    ...workerKeys.details(),
    projectId,
    workerId,
    heartbeatLimit,
    executionLimit,
  ],
};

export const useWorkers = (
  projectId
) =>
  useQuery({
    queryKey:
      workerKeys.list(
        projectId
      ),

    queryFn: () =>
      getWorkers({
        projectId,
      }),

    enabled: Boolean(
      projectId
    ),

    /*
     * Worker health changes frequently.
     */
    refetchInterval: 10_000,

    staleTime: 5_000,
  });

export const useWorker = (
  projectId,
  workerId,
  {
    heartbeatLimit = 30,
    executionLimit = 20,
  } = {}
) =>
  useQuery({
    queryKey:
      workerKeys.detail(
        projectId,
        workerId,
        heartbeatLimit,
        executionLimit
      ),

    queryFn: () =>
      getWorker({
        projectId,
        workerId,
        heartbeatLimit,
        executionLimit,
      }),

    enabled: Boolean(
      projectId &&
      workerId
    ),

    refetchInterval: 10_000,
  });
