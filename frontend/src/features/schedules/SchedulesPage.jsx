import {
  AlertCircle,
  CalendarClock,
  LoaderCircle,
  Plus,
  RefreshCw,
} from "lucide-react";
import {
  useEffect,
  useState,
} from "react";

import useWorkspace from "../../app/useWorkspace";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { useProject } from "../projects/useProjects";
import { useQueues } from "../queues/useQueues";

import ScheduleRow from "./ScheduleRow";
import {
  useSchedules,
} from "./useSchedules";
import ScheduleEditor from "./ScheduleEditor";
import ScheduleDeleteDialog from "./ScheduleDeleteDialog";
import {
  useActivateSchedule,
  useDeactivateSchedule,
} from "./useScheduleMutations";

const getErrorMessage = (error) =>
  error?.response?.data?.message ??
  error?.message ??
  "Schedules could not be loaded.";

function SchedulesPage() {
  const {
    selectedProjectId:
      projectId,
  } = useWorkspace();

  const projectQuery =
    useProject(projectId);

  const queuesQuery =
    useQueues(projectId);

  const [queueId, setQueueId] =
    useState("");

  const [
    isCreateOpen,
    setIsCreateOpen,
  ] = useState(false);

  const [
    editingSchedule,
    setEditingSchedule,
  ] = useState(null);

  const [
    deletingSchedule,
    setDeletingSchedule,
  ] = useState(null);

  /*
   * ---------------------------------------------
   * Queue normalization
   * ---------------------------------------------
   */

  const queueData =
    queuesQuery.data;

  const queues =
    Array.isArray(queueData)
      ? queueData
      : Array.isArray(
            queueData?.queues
          )
        ? queueData.queues
        : Array.isArray(
              queueData?.data
            )
          ? queueData.data
          : Array.isArray(
                queueData?.data
                  ?.queues
              )
            ? queueData.data
                .queues
            : [];

  const activeQueueId =
    queueId ||
    queues[0]?.id ||
    "";

  const selectedQueue =
    queues.find(
      (queue) =>
        queue.id ===
        activeQueueId
    );

  /*
   * ---------------------------------------------
   * Keep queue valid
   * ---------------------------------------------
   */

  useEffect(() => {
    if (
      queues.length === 0
    ) {
      setQueueId("");
      return;
    }

    const exists =
      queues.some(
        (queue) =>
          queue.id ===
          queueId
      );

    if (!exists) {
      setQueueId(
        queues[0].id
      );
    }
  }, [queues, queueId]);

  /*
   * ---------------------------------------------
   * Query
   * ---------------------------------------------
   */

  const schedulesQuery =
    useSchedules(
      projectId,
      activeQueueId
    );

  const schedules =
    schedulesQuery.data ?? [];

  /*
   * ---------------------------------------------
   * Mutations
   * ---------------------------------------------
   */

  const activateMutation =
    useActivateSchedule(
      projectId,
      activeQueueId
    );

  const deactivateMutation =
    useDeactivateSchedule(
      projectId,
      activeQueueId
    );

  /*
   * ---------------------------------------------
   * Handlers
   * ---------------------------------------------
   */

  const handleQueueChange = (
    nextQueueId
  ) => {
    setQueueId(
      nextQueueId
    );

    setEditingSchedule(null);
    setDeletingSchedule(null);
  };

  const handleRefresh =
    () => {
      queuesQuery.refetch();

      if (activeQueueId) {
        schedulesQuery.refetch();
      }
    };

  const handleActivate =
    async (schedule) => {
      try {
        await activateMutation
          .mutateAsync(
            schedule.id
          );
      } catch {
        // Error surfaced below.
      }
    };

  const handleDeactivate =
    async (schedule) => {
      try {
        await deactivateMutation
          .mutateAsync(
            schedule.id
          );
      } catch {
        // Error surfaced below.
      }
    };

  /*
   * ---------------------------------------------
   * Page state
   * ---------------------------------------------
   */

  const isInitialLoading =
    projectQuery.isLoading ||
    queuesQuery.isLoading;

  const hasInitialError =
    projectQuery.isError ||
    queuesQuery.isError;

  const initialError =
    projectQuery.error ??
    queuesQuery.error;

  const mutationError =
    activateMutation.error ??
    deactivateMutation.error;

  const isStateChanging =
    activateMutation.isPending ||
    deactivateMutation.isPending;

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
              Schedules
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage recurring cron
              jobs across your queues.
            </p>
          </div>

          <button
            type="button"
            disabled={
              queues.length === 0 ||
              !activeQueueId
            }
            onClick={() =>
              setIsCreateOpen(
                true
              )
            }
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={16} />

            Create schedule
          </button>
        </div>

        {/* Initial loading */}
        {isInitialLoading && (
          <div className="flex min-h-[280px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <LoaderCircle
                size={20}
                className="animate-spin"
              />

              Loading schedules...
            </div>
          </div>
        )}

        {/* Initial error */}
        {!isInitialLoading &&
          hasInitialError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
              <div className="flex items-start gap-3">
                <AlertCircle
                  size={20}
                  className="mt-0.5 shrink-0 text-red-600"
                />

                <div>
                  <p className="font-medium text-red-800">
                    Schedules could
                    not be loaded
                  </p>

                  <p className="mt-1 text-sm text-red-600">
                    {getErrorMessage(
                      initialError
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

        {/* No queues */}
        {!isInitialLoading &&
          !hasInitialError &&
          queues.length ===
            0 && (
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center">
              <CalendarClock
                size={36}
                className="mx-auto text-slate-300"
              />

              <h2 className="mt-4 font-semibold text-slate-900">
                No queues
                available
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Create a queue
                before creating
                recurring schedules.
              </p>
            </div>
          )}

        {/* Main schedule explorer */}
        {!isInitialLoading &&
          !hasInitialError &&
          queues.length >
            0 && (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              {/* Top */}
              <div className="border-b border-slate-200 px-5 py-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="font-semibold text-slate-900">
                      Cron schedules
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {selectedQueue
                        ? `Viewing ${selectedQueue.name}`
                        : "Select a queue"}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    {/* Queue selector */}
                    <select
                      value={
                        activeQueueId
                      }
                      onChange={(
                        event
                      ) =>
                        handleQueueChange(
                          event
                            .target
                            .value
                        )
                      }
                      className="min-w-[190px] rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      {queues.map(
                        (
                          queue
                        ) => (
                          <option
                            key={
                              queue.id
                            }
                            value={
                              queue.id
                            }
                          >
                            {
                              queue.name
                            }
                          </option>
                        )
                      )}
                    </select>

                    {/* Refresh */}
                    <button
                      type="button"
                      onClick={
                        handleRefresh
                      }
                      disabled={
                        queuesQuery
                          .isFetching ||
                        schedulesQuery
                          .isFetching
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <RefreshCw
                        size={15}
                        className={
                          queuesQuery
                            .isFetching ||
                          schedulesQuery
                            .isFetching
                            ? "animate-spin"
                            : ""
                        }
                      />

                      Refresh
                    </button>
                  </div>
                </div>
              </div>

              {/* Mutation error */}
              {mutationError && (
                <div className="border-b border-red-200 bg-red-50 px-5 py-3 text-sm text-red-700">
                  {getErrorMessage(
                    mutationError
                  )}
                </div>
              )}

              {/* Loading */}
              {schedulesQuery
                .isLoading && (
                <div className="flex min-h-[240px] items-center justify-center">
                  <div className="flex items-center gap-3 text-sm text-slate-500">
                    <LoaderCircle
                      size={20}
                      className="animate-spin"
                    />

                    Loading cron
                    schedules...
                  </div>
                </div>
              )}

              {/* Query error */}
              {schedulesQuery
                .isError && (
                <div className="p-5">
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle
                        size={19}
                        className="mt-0.5 shrink-0 text-red-600"
                      />

                      <div>
                        <p className="font-medium text-red-800">
                          Queue schedules
                          could not be
                          loaded
                        </p>

                        <p className="mt-1 text-sm text-red-600">
                          {getErrorMessage(
                            schedulesQuery
                              .error
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Empty */}
              {!schedulesQuery
                .isLoading &&
                !schedulesQuery
                  .isError &&
                schedules.length ===
                  0 && (
                  <div className="px-6 py-12 text-center">
                    <CalendarClock
                      size={34}
                      className="mx-auto text-slate-300"
                    />

                    <h3 className="mt-4 font-medium text-slate-900">
                      No schedules
                      found
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      This queue does
                      not have any
                      recurring jobs
                      yet.
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        setIsCreateOpen(
                          true
                        )
                      }
                      className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
                    >
                      <Plus
                        size={
                          16
                        }
                      />

                      Create first
                      schedule
                    </button>
                  </div>
                )}

              {/* Table */}
              {!schedulesQuery
                .isLoading &&
                !schedulesQuery
                  .isError &&
                schedules.length >
                  0 && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-slate-50">
                        <tr className="border-b border-slate-200">
                          <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Job
                          </th>

                          <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Cron
                          </th>

                          <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Timezone
                          </th>

                          <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Status
                          </th>

                          <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Next run
                          </th>

                          <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Last run
                          </th>

                          <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Actions
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {schedules.map(
                          (
                            schedule
                          ) => (
                            <ScheduleRow
                              key={
                                schedule.id
                              }
                              schedule={
                                schedule
                              }
                              onEdit={
                                setEditingSchedule
                              }
                              onActivate={
                                handleActivate
                              }
                              onDeactivate={
                                handleDeactivate
                              }
                              onDelete={
                                setDeletingSchedule
                              }
                              isStateChanging={
                                isStateChanging
                              }
                            />
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
            </div>
          )}

        {/*
          Editor and delete dialog
          come in the next step.
        */}

       <ScheduleEditor
  isOpen={
    isCreateOpen ||
    Boolean(editingSchedule)
  }
  schedule={
    editingSchedule
  }
  projectId={projectId}
  queueId={activeQueueId}
  queueName={
    selectedQueue?.name
  }
  onClose={() => {
    setIsCreateOpen(false);
    setEditingSchedule(null);
  }}
/>

<ScheduleDeleteDialog
  isOpen={Boolean(
    deletingSchedule
  )}
  schedule={
    deletingSchedule
  }
  projectId={projectId}
  queueId={activeQueueId}
  onClose={() =>
    setDeletingSchedule(null)
  }
/>
      </div>
    </DashboardLayout>
  );
}

export default SchedulesPage;
