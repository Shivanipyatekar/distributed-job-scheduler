import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  requeueDeadLetterEntry,
} from "./deadLetterApi";

import {
  deadLetterKeys,
} from "./useDeadLetter";

import {
  jobKeys,
} from "../jobs/useJobs";

export const useRequeueDeadLetter = (
  projectId,
  queueId
) => {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      deadLetterId
    ) =>
      requeueDeadLetterEntry({
        projectId,
        queueId,
        deadLetterId,
      }),

    onSuccess: () => {
      /*
       * DLQ entry disappears after
       * successful requeue.
       */
      queryClient.invalidateQueries({
        queryKey:
          deadLetterKeys.lists(),
      });

      /*
       * Job becomes pending again,
       * so refresh job lists too.
       */
      queryClient.invalidateQueries({
        queryKey:
          jobKeys.lists(),
      });
    },
  });
};
