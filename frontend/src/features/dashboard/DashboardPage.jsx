import { useState } from "react";
import { RefreshCw } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import useWorkspace from "../../app/useWorkspace";
import { getApiErrorMessage } from "../../utils/apiError";
import MetricsOverview from "./MetricsOverview";
import ThroughputChart from "./ThroughputChart";
import useProjectMetrics from "./useProjectMetrics";

const metricRanges = {
  "6": {
    label: "Last 6 hours",
    windowHours: 6,
    bucketMinutes: 30,
  },
  "24": {
    label: "Last 24 hours",
    windowHours: 24,
    bucketMinutes: 60,
  },
  "72": {
    label: "Last 3 days",
    windowHours: 72,
    bucketMinutes: 180,
  },
  "168": {
    label: "Last 7 days",
    windowHours: 168,
    bucketMinutes: 360,
  },
};

const formatNumber = (value) => {
  return Number(value ?? 0).toLocaleString();
};

const formatDuration = (milliseconds) => {
  const value = Number(milliseconds ?? 0);

  if (value < 1000) {
    return `${Math.round(value)} ms`;
  }

  return `${(value / 1000).toFixed(1)} s`;
};

const DashboardPage = () => {
  const [rangeKey, setRangeKey] = useState("24");
  const { selectedProjectId } = useWorkspace();
  const selectedRange = metricRanges[rangeKey];

  const metricsQuery = useProjectMetrics({
    projectId: selectedProjectId,
    windowHours: selectedRange.windowHours,
    bucketMinutes: selectedRange.bucketMinutes,
  });

  const metrics = metricsQuery.data;
  const summary = metrics?.summary;
  const queues = metrics?.queues ?? [];
  const responseWindow = metrics?.window ?? selectedRange;

  const snapshotItems = [
    {
      label: "Pending",
      value: formatNumber(summary?.pending_jobs),
    },
    {
      label: "Running",
      value: formatNumber(summary?.running_jobs),
    },
    {
      label: "Executions",
      value: formatNumber(summary?.executions_in_window),
    },
    {
      label: "Average runtime",
      value: formatDuration(
        summary?.average_execution_duration_ms,
      ),
    },
    {
      label: "Dead-letter entries",
      value: formatNumber(summary?.dead_letter_entries),
    },
  ];

  return (
    <DashboardLayout>
      <section className="mb-8 flex flex-col justify-between gap-5 border-b border-line pb-7 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand">
            Project control room
          </p>

          <h1 className="text-3xl font-semibold tracking-[-0.035em] text-ink sm:text-4xl">
            Operational overview
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
            Live throughput, queue pressure, execution health, and
            worker availability for the selected project.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {metricsQuery.isFetching && !metricsQuery.isPending && (
            <span className="flex items-center gap-2 text-xs text-muted">
              <RefreshCw size={13} className="animate-spin" />
              Updating
            </span>
          )}

          <label>
            <span className="sr-only">Metrics time range</span>
            <select
              value={rangeKey}
              onChange={(event) => setRangeKey(event.target.value)}
              className="rounded-xl border border-line bg-surface px-3 py-2 text-sm font-medium text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
            >
              {Object.entries(metricRanges).map(([key, range]) => (
                <option key={key} value={key}>
                  {range.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {metricsQuery.isError ? (
        <section
          role="alert"
          className="rounded-2xl border border-danger/25 bg-danger-soft p-6"
        >
          <h2 className="font-semibold text-danger">
            Metrics could not be loaded
          </h2>

          <p className="mt-2 text-sm text-danger/80">
            {getApiErrorMessage(metricsQuery.error)}
          </p>

          <button
            type="button"
            onClick={() => metricsQuery.refetch()}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-danger px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            <RefreshCw size={16} />
            Try again
          </button>
        </section>
      ) : (
        <>
          <MetricsOverview
            summary={summary}
            windowHours={responseWindow.windowHours}
            isLoading={metricsQuery.isPending}
          />

          <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(18rem,0.5fr)]">
            <ThroughputChart
              throughput={metrics?.throughput}
              windowHours={responseWindow.windowHours}
              isLoading={metricsQuery.isPending}
            />

            <article className="rounded-2xl border border-line bg-surface p-5 shadow-panel">
              <div className="border-b border-line pb-4">
                <h2 className="font-semibold text-ink">Queue pulse</h2>
                <p className="mt-1 text-xs text-muted">
                  Current pressure across project queues.
                </p>
              </div>

              {metricsQuery.isPending ? (
                <div className="mt-5 space-y-4">
                  {Array.from({ length: 3 }, (_, index) => (
                    <div
                      key={index}
                      className="h-16 animate-pulse rounded-xl bg-canvas"
                    />
                  ))}
                </div>
              ) : queues.length === 0 ? (
                <div className="grid min-h-64 place-items-center text-center">
                  <div>
                    <p className="text-sm font-semibold text-ink">
                      No queues yet
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      Create a queue to begin processing jobs.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-3 divide-y divide-line">
                  {queues.slice(0, 5).map((queue) => (
                    <div key={queue.id} className="py-3.5">
                      <div className="flex items-center justify-between gap-3">
                        <p className="truncate text-sm font-semibold text-ink">
                          {queue.name}
                        </p>

                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[0.68rem] font-semibold ${
                            queue.is_paused
                              ? "bg-warning-soft text-warning"
                              : "bg-success-soft text-success"
                          }`}
                        >
                          {queue.is_paused ? "Paused" : "Active"}
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
                        <span>
                          {formatNumber(queue.pending_jobs)} pending
                        </span>
                        <span>
                          {formatNumber(queue.running_jobs)} running
                        </span>
                        <span>
                          {formatNumber(queue.succeeded_last_hour)} done
                          /hr
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </article>
          </section>

          <section className="mt-6 grid overflow-hidden rounded-2xl border border-line bg-surface shadow-panel sm:grid-cols-2 lg:grid-cols-5">
            {snapshotItems.map((item) => (
              <div
                key={item.label}
                className="border-b border-line px-5 py-4 last:border-b-0 sm:border-r sm:last:border-r-0 lg:border-b-0"
              >
                <p className="text-xs font-medium text-muted">
                  {item.label}
                </p>
                <p className="mt-1.5 text-xl font-semibold text-ink">
                  {item.value}
                </p>
              </div>
            ))}
          </section>
        </>
      )}
    </DashboardLayout>
  );
};

export default DashboardPage;
