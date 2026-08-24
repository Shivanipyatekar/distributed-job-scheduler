import {
  Activity,
  AlertCircle,
  LoaderCircle,
  RefreshCw,
  Server,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import useWorkspace from "../../app/useWorkspace";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { useProject } from "../projects/useProjects";

import WorkerCard from "./WorkerCard";
import { useWorkers } from "./useWorkers";

const getErrorMessage = (error) =>
  error?.response?.data?.message ??
  error?.message ??
  "Workers could not be loaded.";

function WorkersPage() {
  const navigate = useNavigate();

  const {
    selectedProjectId: projectId,
  } = useWorkspace();

  const projectQuery =
    useProject(projectId);

  const workersQuery =
    useWorkers(projectId);

  const workers =
    workersQuery.data ?? [];

  const onlineWorkers =
    workers.filter(
      (worker) =>
        worker.health_status ===
          "online" ||
        (
          !worker.health_status &&
          worker.status === "online"
        )
    ).length;

  const staleWorkers =
    workers.filter(
      (worker) =>
        worker.health_status ===
        "stale"
    ).length;

  const offlineWorkers =
    workers.filter(
      (worker) =>
        worker.health_status ===
          "offline" ||
        (
          !worker.health_status &&
          worker.status === "offline"
        )
    ).length;

  const activeJobs =
    workers.reduce(
      (total, worker) =>
        total +
        Number(
          worker.project_active_jobs ??
            0
        ),
      0
    );

  const handleWorkerSelect = (
    worker
  ) => {
    navigate(
      `/workers/${worker.id}`
    );
  };

  const isInitialLoading =
    projectQuery.isLoading ||
    workersQuery.isLoading;

  const hasError =
    projectQuery.isError ||
    workersQuery.isError;

  const error =
    projectQuery.error ??
    workersQuery.error;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600">
              {projectQuery.data
                ?.name ??
                "Project"}
            </p>

            <h1 className="mt-1 text-2xl font-semibold text-slate-900">
              Workers
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Monitor worker health,
              resource usage, and job
              execution activity.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              workersQuery.refetch()
            }
            disabled={
              workersQuery.isFetching
            }
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={
                workersQuery.isFetching
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>
        </div>

        {/* Loading */}
        {isInitialLoading && (
          <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <LoaderCircle
                size={20}
                className="animate-spin"
              />

              Loading workers...
            </div>
          </div>
        )}

        {/* Error */}
        {!isInitialLoading &&
          hasError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
              <div className="flex items-start gap-3">
                <AlertCircle
                  size={20}
                  className="mt-0.5 shrink-0 text-red-600"
                />

                <div>
                  <p className="font-medium text-red-800">
                    Workers could not
                    be loaded
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

        {!isInitialLoading &&
          !hasError && (
            <>
              {/* Summary */}
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500">
                        Total workers
                      </p>

                      <p className="mt-2 text-2xl font-semibold text-slate-900">
                        {
                          workers.length
                        }
                      </p>
                    </div>

                    <div className="rounded-xl bg-blue-50 p-3">
                      <Server
                        size={20}
                        className="text-blue-600"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500">
                        Online
                      </p>

                      <p className="mt-2 text-2xl font-semibold text-slate-900">
                        {onlineWorkers}
                      </p>
                    </div>

                    <div className="rounded-xl bg-emerald-50 p-3">
                      <Wifi
                        size={20}
                        className="text-emerald-600"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500">
                        Stale / offline
                      </p>

                      <p className="mt-2 text-2xl font-semibold text-slate-900">
                        {staleWorkers +
                          offlineWorkers}
                      </p>
                    </div>

                    <div className="rounded-xl bg-amber-50 p-3">
                      <WifiOff
                        size={20}
                        className="text-amber-600"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500">
                        Active jobs
                      </p>

                      <p className="mt-2 text-2xl font-semibold text-slate-900">
                        {activeJobs}
                      </p>
                    </div>

                    <div className="rounded-xl bg-violet-50 p-3">
                      <Activity
                        size={20}
                        className="text-violet-600"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Empty */}
              {workers.length ===
                0 && (
                <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center">
                  <Server
                    size={38}
                    className="mx-auto text-slate-300"
                  />

                  <h2 className="mt-4 font-semibold text-slate-900">
                    No workers found
                  </h2>

                  <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
                    Start a worker
                    process and it will
                    appear here after
                    registering with the
                    scheduler.
                  </p>
                </div>
              )}

              {/* Cards */}
              {workers.length >
                0 && (
                <div className="grid gap-4 xl:grid-cols-2">
                  {workers.map(
                    (worker) => (
                      <WorkerCard
                        key={worker.id}
                        worker={worker}
                        onSelect={
                          handleWorkerSelect
                        }
                      />
                    )
                  )}
                </div>
              )}

              <p className="text-center text-xs text-slate-400">
                Worker health refreshes
                automatically every 10
                seconds.
              </p>
            </>
          )}
      </div>
    </DashboardLayout>
  );
}

export default WorkersPage;
