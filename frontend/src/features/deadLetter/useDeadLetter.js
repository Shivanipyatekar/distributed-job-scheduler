import {
  useQuery,
} from "@tanstack/react-query";

import {
  getDeadLetterEntries,
  getDeadLetterEntry,
} from "./deadLetterApi";

export const deadLetterKeys = {
  all: ["dead-letter"],

  lists: () => [
    ...deadLetterKeys.all,
    "list",
  ],

  list: (
    projectId,
    queueId,
    filters
  ) => [
    ...deadLetterKeys.lists(),
    projectId,
    queueId,
    filters,
  ],

  details: () => [
    ...deadLetterKeys.all,
    "detail",
  ],

  detail: (
    projectId,
    queueId,
    deadLetterId
  ) => [
    ...deadLetterKeys.details(),
    projectId,
    queueId,
    deadLetterId,
  ],
};

export const useDeadLetterEntries = (
  projectId,
  queueId,
  {
    page = 1,
    limit = 20,
  } = {}
) => {
  const filters = {
    page,
    limit,
  };

  return useQuery({
    queryKey:
      deadLetterKeys.list(
        projectId,
        queueId,
        filters
      ),

    queryFn: () =>
      getDeadLetterEntries({
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

export const useDeadLetterEntry = (
  projectId,
  queueId,
  deadLetterId
) =>
  useQuery({
    queryKey:
      deadLetterKeys.detail(
        projectId,
        queueId,
        deadLetterId
      ),

    queryFn: () =>
      getDeadLetterEntry({
        projectId,
        queueId,
        deadLetterId,
      }),

    enabled: Boolean(
      projectId &&
      queueId &&
      deadLetterId
    ),
  });
