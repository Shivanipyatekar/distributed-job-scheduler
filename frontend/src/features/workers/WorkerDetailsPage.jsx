import {
  Activity,
  AlertCircle,
  ArrowLeft,
  Clock3,
  Cpu,
  HardDrive,
  LoaderCircle,
  RefreshCw,
  Server,
  Workflow,
} from "lucide-react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import useWorkspace from "../../app/useWorkspace";
import DashboardLayout from "../../components/layout/DashboardLayout";

import ExecutionStatusBadge from "../jobs/ExecutionStatusBadge";
import JobStatusBadge from "../jobs/JobStatusBadge";
import { useProject } from "../projects/useProjects";

import WorkerStatusBadge from "./WorkerStatusBadge";
import { useWorker } from "./useWorkers";

const getErrorMessage = (error) =>
  error?.response?.data?.message ??
  error?.message ??
  "Worker details could not be loaded.";

const formatDate = (value) => {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleString();
};

const formatDuration = (
  milliseconds
) => {
  if (
    milliseconds === null ||
    milliseconds === undefined
  ) {
    return "—";
  }

  const value =
    Number(milliseconds);

  if (value < 1000) {
    return `${Math.round(
      value
    )} ms`;
  }

  return `${(
    value / 1000
  ).toFixed(2)} s`;
};

const formatUptime = (
  seconds
) => {
  if (
    seconds === null ||
    seconds === undefined
  ) {
    return "—";
  }

  const totalSeconds =
    Math.max(
      0,
      Math.floor(
        Number(seconds)
      )
    );

  const days =
    Math.floor(
      totalSeconds / 86400
    );

  const hours =
    Math.floor(
      (totalSeconds % 86400) /
        3600
    );

  const minutes =
    Math.floor(
      (totalSeconds % 3600) /
        60
    );

  if (days > 0) {
    return `${days}d ${hours}h`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
};

function OverviewItem({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-400">
        <Icon size={14} />

        {label}
      </div>

      <p className="mt-2 break-words text-sm font-medium text-slate-800">
        {value}
      </p>
    </div>
  );
}

function WorkerDetailsPage() {
  const navigate = useNavigate();

  const {
    workerId,
  } = useParams();

  const {
    selectedProjectId:
      projectId,
  } = useWorkspace();

  const projectQuery =
    useProject(projectId);

  const workerQuery =
    useWorker(
      projectId,
      workerId,
      {
        heartbeatLimit: 30,
        executionLimit: 20,
      }
    );

  const result =
    workerQuery.data;

  const worker =
    result?.worker;

  const heartbeats =
    result?.heartbeats ??
    [];

  const recentExecutions =
    result?.recentExecutions ??
    [];

  const activeJobs =
    result?.activeJobs ??
    [];

  const isLoading =
    projectQuery.isLoading ||
    workerQuery.isLoading;

  const hasError =
    projectQuery.isError ||
    workerQuery.isError;

  const error =
    projectQuery.error ??
    workerQuery.error;

  const healthStatus =
    worker?.health_status ??
    worker?.status;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Back */}
        <button
          type="button"
          onClick={() =>
            navigate("/workers")
          }
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-800"
        >
          <ArrowLeft size={16} />

          Back to workers
        </button>

        {/* Loading */}
        {isLoading && (
          <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <LoaderCircle
                size={20}
                className="animate-spin"
              />

              Loading worker details...
            </div>
          </div>
        )}

        {/* Error */}
        {!isLoading &&
          hasError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
              <div className="flex items-start gap-3">
                <AlertCircle
                  size={20}
                  className="mt-0.5 shrink-0 text-red-600"
                />

                <div>
                  <p className="font-medium text-red-800">
                    Worker details could
                    not be loaded
                  </p>

                  <p className="mt-1 text-sm text-red-600">
                    {getErrorMessage(
                      error
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

        {!isLoading &&
          !hasError &&
          worker && (
            <>
              {/* Header */}
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">
                    {projectQuery.data
                      ?.name ??
                      "Project"}
                  </p>

                  <div className="mt-1 flex flex-wrap items-center gap-3">
                    <h1 className="text-2xl font-semibold text-slate-900">
                      {worker.hostname}
                    </h1>

                    <WorkerStatusBadge
                      status={
                        healthStatus
                      }
                    />
                  </div>

                  <p className="mt-1 font-mono text-xs text-slate-400">
                    {worker.id}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    workerQuery.refetch()
                  }
                  disabled={
                    workerQuery.isFetching
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  <RefreshCw
                    size={16}
                    className={
                      workerQuery.isFetching
                        ? "animate-spin"
                        : ""
                    }
                  />

                  Refresh
                </button>
              </div>

              {/* Overview */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-2">
                  <Server
                    size={18}
                    className="text-slate-500"
                  />

                  <h2 className="font-semibold text-slate-900">
                    Worker overview
                  </h2>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <OverviewItem
                    icon={Server}
                    label="PID"
                    value={
                      worker.pid ??
                      "—"
                    }
                  />

                  <OverviewItem
                    icon={Clock3}
                    label="Uptime"
                    value={formatUptime(
                      worker.uptime_seconds
                    )}
                  />

                  <OverviewItem
                    icon={Cpu}
                    label="CPU"
                    value={
                      worker.cpu_pct !==
                        null &&
                      worker.cpu_pct !==
                        undefined
                        ? `${Number(
                            worker.cpu_pct
                          ).toFixed(1)}%`
                        : "—"
                    }
                  />

                  <OverviewItem
                    icon={HardDrive}
                    label="Memory"
                    value={
                      worker.memory_mb !==
                        null &&
                      worker.memory_mb !==
                        undefined
                        ? `${Math.round(
                            Number(
                              worker.memory_mb
                            )
                          )} MB`
                        : "—"
                    }
                  />

                  <OverviewItem
                    icon={Workflow}
                    label="Active jobs"
                    value={
                      worker.project_active_jobs ??
                      0
                    }
                  />

                  <OverviewItem
                    icon={Activity}
                    label="Executions"
                    value={
                      worker.project_total_executions ??
                      0
                    }
                  />

                  <OverviewItem
                    icon={Activity}
                    label="Succeeded"
                    value={
                      worker.project_succeeded_executions ??
                      0
                    }
                  />

                  <OverviewItem
                    icon={Activity}
                    label="Failed"
                    value={
                      worker.project_failed_executions ??
                      0
                    }
                  />
                </div>

                <div className="mt-5 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2 xl:grid-cols-4">
                  <OverviewItem
                    icon={Clock3}
                    label="Average duration"
                    value={formatDuration(
                      worker.average_duration_ms
                    )}
                  />

                  <OverviewItem
                    icon={Clock3}
                    label="Started"
                    value={formatDate(
                      worker.started_at
                    )}
                  />

                  <OverviewItem
                    icon={Clock3}
                    label="Last seen"
                    value={formatDate(
                      worker.last_seen_at
                    )}
                  />

                  <OverviewItem
                    icon={Clock3}
                    label="Last execution"
                    value={formatDate(
                      worker.last_execution_at
                    )}
                  />
                </div>
              </div>

              {/* Active jobs */}
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="border-b border-slate-200 px-5 py-4">
                  <h2 className="font-semibold text-slate-900">
                    Active jobs
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Jobs currently locked
                    by this worker.
                  </p>
                </div>

                {activeJobs.length ===
                  0 ? (
                  <div className="px-6 py-10 text-center text-sm text-slate-500">
                    This worker is not
                    currently processing
                    any jobs.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-slate-50">
                        <tr className="border-b border-slate-200">
                          <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Job
                          </th>

                          <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Queue
                          </th>

                          <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Status
                          </th>

                          <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Priority
                          </th>

                          <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Attempts
                          </th>

                          <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Locked at
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {activeJobs.map(
                          (job) => (
                            <tr
                              key={job.id}
                              className="border-b border-slate-100"
                            >
                              <td className="px-5 py-4">
                                <button
                                  type="button"
                                  onClick={() =>
                                    navigate(
                                      `/queues/${job.queue_id}/jobs/${job.id}`
                                    )
                                  }
                                  className="text-left"
                                >
                                  <p className="font-medium text-blue-600 hover:text-blue-700">
                                    {
                                      job.type
                                    }
                                  </p>

                                  <p className="mt-1 max-w-[180px] truncate font-mono text-xs text-slate-400">
                                    {job.id}
                                  </p>
                                </button>
                              </td>

                              <td className="px-5 py-4 text-sm text-slate-600">
                                {
                                  job.queue_name
                                }
                              </td>

                              <td className="px-5 py-4">
                                <JobStatusBadge
                                  status={
                                    job.status
                                  }
                                />
                              </td>

                              <td className="px-5 py-4 text-sm text-slate-600">
                                {job.priority ??
                                  "—"}
                              </td>

                              <td className="px-5 py-4 text-sm text-slate-600">
                                {
                                  job.attempt_count
                                }
                                /
                                {
                                  job.max_attempts
                                }
                              </td>

                              <td className="px-5 py-4 text-sm text-slate-500">
                                {formatDate(
                                  job.locked_at
                                )}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Recent executions */}
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="border-b border-slate-200 px-5 py-4">
                  <h2 className="font-semibold text-slate-900">
                    Recent executions
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Most recent job
                    attempts handled by
                    this worker.
                  </p>
                </div>

                {recentExecutions.length ===
                  0 ? (
                  <div className="px-6 py-10 text-center text-sm text-slate-500">
                    No executions have
                    been recorded for
                    this worker.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-slate-50">
                        <tr className="border-b border-slate-200">
                          <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Job
                          </th>

                          <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Queue
                          </th>

                          <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Attempt
                          </th>

                          <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Status
                          </th>

                          <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Duration
                          </th>

                          <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Started
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {recentExecutions.map(
                          (execution) => (
                            <tr
                              key={
                                execution.id
                              }
                              className="border-b border-slate-100"
                            >
                              <td className="px-5 py-4">
                                <button
                                  type="button"
                                  onClick={() =>
                                    navigate(
                                      `/queues/${execution.queue_id}/jobs/${execution.job_id}`
                                    )
                                  }
                                  className="text-left"
                                >
                                  <p className="font-medium text-blue-600 hover:text-blue-700">
                                    {
                                      execution.job_type
                                    }
                                  </p>

                                  <p className="mt-1 max-w-[180px] truncate font-mono text-xs text-slate-400">
                                    {
                                      execution.job_id
                                    }
                                  </p>
                                </button>
                              </td>

                              <td className="px-5 py-4 text-sm text-slate-600">
                                {
                                  execution.queue_name
                                }
                              </td>

                              <td className="px-5 py-4 text-sm text-slate-600">
                                #
                                {
                                  execution.attempt_no
                                }
                              </td>

                              <td className="px-5 py-4">
                                <ExecutionStatusBadge
                                  status={
                                    execution.status
                                  }
                                />
                              </td>

                              <td className="px-5 py-4 text-sm text-slate-600">
                                {formatDuration(
                                  execution.duration_ms
                                )}
                              </td>

                              <td className="px-5 py-4 text-sm text-slate-500">
                                {formatDate(
                                  execution.started_at
                                )}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Heartbeat history */}
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="border-b border-slate-200 px-5 py-4">
                  <h2 className="font-semibold text-slate-900">
                    Heartbeat history
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Latest CPU and memory
                    samples reported by
                    the worker.
                  </p>
                </div>

                {heartbeats.length ===
                  0 ? (
                  <div className="px-6 py-10 text-center text-sm text-slate-500">
                    No heartbeat samples
                    found.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-slate-50">
                        <tr className="border-b border-slate-200">
                          <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Timestamp
                          </th>

                          <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                            CPU
                          </th>

                          <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Memory
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {heartbeats.map(
                          (
                            heartbeat
                          ) => (
                            <tr
                              key={
                                heartbeat.id
                              }
                              className="border-b border-slate-100"
                            >
                              <td className="px-5 py-4 text-sm text-slate-500">
                                {formatDate(
                                  heartbeat.heartbeat_at
                                )}
                              </td>

                              <td className="px-5 py-4 text-sm text-slate-600">
                                {heartbeat.cpu_pct !==
                                  null &&
                                heartbeat.cpu_pct !==
                                  undefined
                                  ? `${Number(
                                      heartbeat.cpu_pct
                                    ).toFixed(1)}%`
                                  : "—"}
                              </td>

                              <td className="px-5 py-4 text-sm text-slate-600">
                                {heartbeat.memory_mb !==
                                  null &&
                                heartbeat.memory_mb !==
                                  undefined
                                  ? `${Math.round(
                                      Number(
                                        heartbeat.memory_mb
                                      )
                                    )} MB`
                                  : "—"}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <p className="text-center text-xs text-slate-400">
                Worker details refresh
                automatically every 10
                seconds.
              </p>
            </>
          )}
      </div>
    </DashboardLayout>
  );
}

export default WorkerDetailsPage;
