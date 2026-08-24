import { useQuery } from "@tanstack/react-query";
import {
  getProjectMetrics,
  metricsKeys,
} from "./metricsApi";

const METRICS_POLL_INTERVAL = 15_000;

const useProjectMetrics = ({
  projectId,
  windowHours = 24,
  bucketMinutes = 60,
}) => {
  return useQuery({
    queryKey: metricsKeys.project(
      projectId,
      windowHours,
      bucketMinutes,
    ),
    queryFn: () =>
      getProjectMetrics({
        projectId,
        windowHours,
        bucketMinutes,
      }),
    enabled: Boolean(projectId),
    refetchInterval: METRICS_POLL_INTERVAL,
    refetchIntervalInBackground: false,
  });
};

export default useProjectMetrics;
