import {
  AlertCircle,
  ArrowLeft,
  Clock3,
  FileText,
  LoaderCircle,
  RefreshCw,
  Server,
} from "lucide-react";
import {
  useState,
} from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";
import useWorkspace from "../../app/useWorkspace";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { useProject } from "../projects/useProjects";
import { useQueues } from "../queues/useQueues";
import ExecutionStatusBadge from "./ExecutionStatusBadge";
import JobStatusBadge from "./JobStatusBadge";
import { useJob } from "./useJob";
import { useJobExecutions } from "./useJobExecutions";
import { useJobLogs } from "./useJobLogs";

const getErrorMessage = (error) =>
  error?.response?.data?.message ??
  error?.message ??
  "Job details could not be loaded.";

const formatDate = (value) => {
  if (!value) {
    return "—";
  }

  return new Date(
    value
  ).toLocaleString();
};

const formatDuration = (
  durationMs
) => {
  if (
    durationMs === null ||
    durationMs === undefined
  ) {
    return "—";
  }

  const milliseconds =
    Number(durationMs);

  if (
    Number.isNaN(milliseconds)
  ) {
    return "—";
  }

  if (milliseconds < 1000) {
    return `${Math.round(
      milliseconds
    )} ms`;
  }

  const seconds =
    milliseconds / 1000;

  if (seconds < 60) {
    return `${seconds.toFixed(
      2
    )} s`;
  }

  const minutes =
    Math.floor(seconds / 60);

  const remainingSeconds =
    Math.round(seconds % 60);

  return `${minutes}m ${remainingSeconds}s`;
};

const logLevelClasses = {
  info:
    "border-blue-200 bg-blue-50 text-blue-700",

  warn:
    "border-amber-200 bg-amber-50 text-amber-700",

  warning:
    "border-amber-200 bg-amber-50 text-amber-700",

  error:
    "border-red-200 bg-red-50 text-red-700",

  debug:
    "border-slate-200 bg-slate-50 text-slate-600",
};

function DetailItem({
  label,
  children,
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <div className="mt-1 text-sm font-medium text-slate-700">
        {children ?? "—"}
      </div>
    </div>
  );
}

function JobDetailsPage() {
  const navigate =
    useNavigate();

  const {
    queueId,
    jobId,
  } = useParams();

  const { projectId } =
    useWorkspace();

  const [logPage, setLogPage] =
    useState(1);

  const [logLevel, setLogLevel] =
    useState("");

  const logLimit = 20;

  const projectQuery =
    useProject(projectId);

  const queuesQuery =
    useQueues(projectId);

  const jobQuery =
    useJob(
      projectId,
      queueId,
      jobId
    );

  const executionsQuery =
    useJobExecutions(
      projectId,
      queueId,
      jobId
    );

  const logsQuery =
    useJobLogs(
      projectId,
      queueId,
      jobId,
      {
        page: logPage,
        limit: logLimit,
        level: logLevel,
      }
    );

  const job =
    jobQuery.data;

  const queues =
    queuesQuery.data ?? [];

  const queue =
    queues.find(
      (item) =>
        item.id === queueId
    );

  const executions =
    executionsQuery.data ?? [];

  const logs =
    logsQuery.data?.logs ?? [];

  const logPagination =
    logsQuery.data?.pagination;

  const isLoading =
    jobQuery.isLoading ||
    projectQuery.isLoading;

  const handleLogLevelChange = (
    value
  ) => {
    setLogLevel(value);
    setLogPage(1);
  };

  const handleRefresh = () => {
    jobQuery.refetch();
    executionsQuery.refetch();
    logsQuery.refetch();
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <LoaderCircle
              size={20}
              className="animate-spin"
            />

            Loading job details...
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (jobQuery.isError) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <button
            type="button"
            onClick={() =>
              navigate(-1)
            }
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
          >
            <ArrowLeft size={16} />

            Back to jobs
          </button>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
            <div className="flex items-start gap-3">
              <AlertCircle
                size={20}
                className="mt-0.5 text-red-600"
              />

              <div>
                <p className="font-medium text-red-800">
                  Job could not be loaded
                </p>

                <p className="mt-1 text-sm text-red-600">
                  {getErrorMessage(
                    jobQuery.error
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <button
            type="button"
            onClick={() =>
              navigate(-1)
            }
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
          >
            <ArrowLeft size={16} />

            Back to jobs
          </button>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">
                {projectQuery.data
                  ?.name ??
                  "Project"}

                {queue?.name
                  ? ` / ${queue.name}`
                  : ""}
              </p>

              <div className="mt-1 flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-semibold text-slate-900">
                  {job?.type ??
                    "Job"}
                </h1>

                <JobStatusBadge
                  status={
                    job?.status
                  }
                />
              </div>

              <p className="mt-2 font-mono text-xs text-slate-400">
                {job?.id}
              </p>
            </div>

            <button
              type="button"
              onClick={
                handleRefresh
              }
              disabled={
                jobQuery.isFetching ||
                executionsQuery.isFetching ||
                logsQuery.isFetching
              }
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={
                  jobQuery.isFetching ||
                  executionsQuery.isFetching ||
                  logsQuery.isFetching
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh
            </button>
          </div>
        </div>

        {/* Overview */}
        <div className="rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="font-semibold text-slate-900">
              Job overview
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Current scheduling and
              execution information.
            </p>
          </div>

          <div className="grid gap-6 p-5 sm:grid-cols-2 lg:grid-cols-4">
            <DetailItem label="Queue">
              {queue?.name ??
                "—"}
            </DetailItem>

            <DetailItem label="Priority">
              {job?.priority ?? 0}
            </DetailItem>

            <DetailItem label="Attempts">
              {job?.attempt_count ??
                0}
              {" / "}
              {job?.max_attempts ??
                "—"}
            </DetailItem>

            <DetailItem label="Available at">
              {formatDate(
                job?.available_at
              )}
            </DetailItem>

            <DetailItem label="Created">
              {formatDate(
                job?.created_at
              )}
            </DetailItem>

            <DetailItem label="Updated">
              {formatDate(
                job?.updated_at
              )}
            </DetailItem>

            <DetailItem label="Locked at">
              {formatDate(
                job?.locked_at
              )}
            </DetailItem>

            <DetailItem label="Worker ID">
              {job?.locked_by ? (
                <span className="font-mono text-xs">
                  {job.locked_by}
                </span>
              ) : (
                "Not assigned"
              )}
            </DetailItem>
          </div>
        </div>

        {/* Payload */}
        <div className="rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4">
            <FileText
              size={18}
              className="text-slate-500"
            />

            <div>
              <h2 className="font-semibold text-slate-900">
                Payload
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Data submitted with
                this job.
              </p>
            </div>
          </div>

          <div className="p-5">
            <pre className="overflow-x-auto rounded-xl bg-slate-950 p-4 text-sm leading-6 text-slate-200">
              {JSON.stringify(
                job?.payload ?? {},
                null,
                2
              )}
            </pre>
          </div>
        </div>

        {/* Execution history */}
        <div className="rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4">
            <Clock3
              size={18}
              className="text-slate-500"
            />

            <div>
              <h2 className="font-semibold text-slate-900">
                Execution history
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Worker assignments,
                durations and failures
                for every attempt.
              </p>
            </div>
          </div>

          {executionsQuery.isLoading && (
            <div className="flex justify-center p-8">
              <LoaderCircle
                size={20}
                className="animate-spin text-slate-400"
              />
            </div>
          )}

          {executionsQuery.isError && (
            <div className="p-5 text-sm text-red-600">
              {getErrorMessage(
                executionsQuery.error
              )}
            </div>
          )}

          {!executionsQuery.isLoading &&
            !executionsQuery.isError &&
            executions.length ===
              0 && (
              <div className="px-5 py-8 text-center text-sm text-slate-500">
                No execution attempts
                recorded yet.
              </div>
            )}

          {!executionsQuery.isLoading &&
            !executionsQuery.isError &&
            executions.length >
              0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-slate-50">
                    <tr className="border-b border-slate-200">
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Attempt
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Status
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Worker
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Duration
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Started
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Finished
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {executions.map(
                      (
                        execution
                      ) => (
                        <tr
                          key={
                            execution.id
                          }
                          className="border-b border-slate-100 align-top"
                        >
                          <td className="px-5 py-4 text-sm font-medium text-slate-700">
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

                          <td className="px-5 py-4">
                            {execution.worker_hostname ? (
                              <div>
                                <p className="text-sm font-medium text-slate-700">
                                  {
                                    execution.worker_hostname
                                  }
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                  PID{" "}
                                  {execution.worker_pid ??
                                    "—"}
                                  {" · "}
                                  {execution.worker_status ??
                                    "unknown"}
                                </p>
                              </div>
                            ) : (
                              <span className="text-sm text-slate-400">
                                Worker unavailable
                              </span>
                            )}
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

                          <td className="px-5 py-4 text-sm text-slate-500">
                            {formatDate(
                              execution.finished_at
                            )}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>

                {executions.some(
                  (execution) =>
                    execution.error
                ) && (
                  <div className="border-t border-slate-200 p-5">
                    <h3 className="text-sm font-semibold text-slate-900">
                      Execution errors
                    </h3>

                    <div className="mt-3 space-y-3">
                      {executions
                        .filter(
                          (
                            execution
                          ) =>
                            execution.error
                        )
                        .map(
                          (
                            execution
                          ) => (
                            <div
                              key={
                                execution.id
                              }
                              className="rounded-xl border border-red-200 bg-red-50 p-4"
                            >
                              <p className="text-xs font-semibold text-red-700">
                                Attempt #
                                {
                                  execution.attempt_no
                                }
                              </p>

                              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-red-700">
                                {
                                  execution.error
                                }
                              </p>
                            </div>
                          )
                        )}
                    </div>
                  </div>
                )}
              </div>
            )}
        </div>

        {/* Logs */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Server
                size={18}
                className="text-slate-500"
              />

              <div>
                <h2 className="font-semibold text-slate-900">
                  Job logs
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Log entries generated
                  during job execution.
                </p>
              </div>
            </div>

            <select
              value={logLevel}
              onChange={(
                event
              ) =>
                handleLogLevelChange(
                  event.target.value
                )
              }
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">
                All levels
              </option>

              <option value="info">
                Info
              </option>

              <option value="warn">
                Warn
              </option>

              <option value="error">
                Error
              </option>

              <option value="debug">
                Debug
              </option>
            </select>
          </div>

          {logsQuery.isLoading && (
            <div className="flex justify-center p-8">
              <LoaderCircle
                size={20}
                className="animate-spin text-slate-400"
              />
            </div>
          )}

          {logsQuery.isError && (
            <div className="p-5 text-sm text-red-600">
              {getErrorMessage(
                logsQuery.error
              )}
            </div>
          )}

          {!logsQuery.isLoading &&
            !logsQuery.isError &&
            logs.length === 0 && (
              <div className="px-5 py-8 text-center text-sm text-slate-500">
                No logs found.
              </div>
            )}

          {!logsQuery.isLoading &&
            !logsQuery.isError &&
            logs.length > 0 && (
              <div className="divide-y divide-slate-100">
                {logs.map(
                  (log) => {
                    const level =
                      log.level?.toLowerCase() ??
                      "info";

                    const classes =
                      logLevelClasses[
                        level
                      ] ??
                      "border-slate-200 bg-slate-50 text-slate-600";

                    return (
                      <div
                        key={
                          log.id
                        }
                        className="px-5 py-4"
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full border px-2.5 py-1 text-xs font-medium uppercase ${classes}`}
                            >
                              {level}
                            </span>

                            {log.attempt_no && (
                              <span className="text-xs text-slate-400">
                                Attempt #
                                {
                                  log.attempt_no
                                }
                              </span>
                            )}

                            {log.execution_status && (
                              <span className="text-xs capitalize text-slate-400">
                                {
                                  log.execution_status
                                }
                              </span>
                            )}
                          </div>

                          <span className="text-xs text-slate-400">
                            {formatDate(
                              log.created_at
                            )}
                          </span>
                        </div>

                        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                          {
                            log.message
                          }
                        </p>
                      </div>
                    );
                  }
                )}
              </div>
            )}

          {logPagination &&
            logPagination.total >
              0 && (
              <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                  {logPagination.total}{" "}
                  {logPagination.total ===
                  1
                    ? "log"
                    : "logs"}
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={
                      logPage <= 1
                    }
                    onClick={() =>
                      setLogPage(
                        (
                          current
                        ) =>
                          current -
                          1
                      )
                    }
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>

                  <span className="px-2 text-sm text-slate-500">
                    Page{" "}
                    <span className="font-medium text-slate-700">
                      {
                        logPagination.page
                      }
                    </span>
                    {" of "}
                    <span className="font-medium text-slate-700">
                      {
                        logPagination.totalPages
                      }
                    </span>
                  </span>

                  <button
                    type="button"
                    disabled={
                      logPage >=
                      logPagination.totalPages
                    }
                    onClick={() =>
                      setLogPage(
                        (
                          current
                        ) =>
                          current +
                          1
                      )
                    }
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default JobDetailsPage;
