import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  activateSchedule,
  createSchedule,
  deactivateSchedule,
  deleteSchedule,
  updateSchedule,
} from "./scheduleApi";

import { scheduleKeys } from "./useSchedules";

export const useCreateSchedule = (
  projectId,
  queueId
) => {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (scheduleData) =>
      createSchedule({
        projectId,
        queueId,
        scheduleData,
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey:
          scheduleKeys.lists(),
      });
    },
  });
};

export const useUpdateSchedule = (
  projectId,
  queueId
) => {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      scheduleId,
      scheduleData,
    }) =>
      updateSchedule({
        projectId,
        queueId,
        scheduleId,
        scheduleData,
      }),

    onSuccess: (
      _,
      variables
    ) => {
      queryClient.invalidateQueries({
        queryKey:
          scheduleKeys.lists(),
      });

      queryClient.invalidateQueries({
        queryKey:
          scheduleKeys.detail(
            projectId,
            queueId,
            variables.scheduleId
          ),
      });
    },
  });
};

export const useActivateSchedule = (
  projectId,
  queueId
) => {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (scheduleId) =>
      activateSchedule({
        projectId,
        queueId,
        scheduleId,
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey:
          scheduleKeys.lists(),
      });
    },
  });
};

export const useDeactivateSchedule = (
  projectId,
  queueId
) => {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (scheduleId) =>
      deactivateSchedule({
        projectId,
        queueId,
        scheduleId,
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey:
          scheduleKeys.lists(),
      });
    },
  });
};

export const useDeleteSchedule = (
  projectId,
  queueId
) => {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (scheduleId) =>
      deleteSchedule({
        projectId,
        queueId,
        scheduleId,
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey:
          scheduleKeys.lists(),
      });
    },
  });
};
