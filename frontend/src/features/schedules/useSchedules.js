import { useQuery } from "@tanstack/react-query";
import {
  getSchedule,
  getSchedules,
} from "./scheduleApi";

export const scheduleKeys = {
  all: ["schedules"],

  lists: () => [
    ...scheduleKeys.all,
    "list",
  ],

  list: (projectId, queueId) => [
    ...scheduleKeys.lists(),
    projectId,
    queueId,
  ],

  details: () => [
    ...scheduleKeys.all,
    "detail",
  ],

  detail: (
    projectId,
    queueId,
    scheduleId
  ) => [
    ...scheduleKeys.details(),
    projectId,
    queueId,
    scheduleId,
  ],
};

export const useSchedules = (
  projectId,
  queueId
) =>
  useQuery({
    queryKey: scheduleKeys.list(
      projectId,
      queueId
    ),

    queryFn: () =>
      getSchedules({
        projectId,
        queueId,
      }),

    enabled: Boolean(
      projectId &&
      queueId
    ),

    staleTime: 10_000,
  });

export const useSchedule = (
  projectId,
  queueId,
  scheduleId
) =>
  useQuery({
    queryKey: scheduleKeys.detail(
      projectId,
      queueId,
      scheduleId
    ),

    queryFn: () =>
      getSchedule({
        projectId,
        queueId,
        scheduleId,
      }),

    enabled: Boolean(
      projectId &&
      queueId &&
      scheduleId
    ),
  });
