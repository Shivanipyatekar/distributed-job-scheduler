import {
  AlertCircle,
  RefreshCw,
  Skull,
} from "lucide-react";
import {
  useEffect,
  useState,
} from "react";
import {
  useNavigate,
} from "react-router-dom";

import useWorkspace from "../../app/useWorkspace";
import DashboardLayout from "../../components/layout/DashboardLayout";

import {
  useProject,
} from "../projects/useProjects";
import {
  useQueues,
} from "../queues/useQueues";

import DeadLetterPagination from "./DeadLetterPagination";
import DeadLetterRequeueDialog from "./DeadLetterRequeueDialog";
import DeadLetterRow from "./DeadLetterRow.jsx";

import {
  useDeadLetterEntries,
} from "./useDeadLetter";

const getErrorMessage = (error) =>
  error?.response?.data?.message ??
  error?.message ??
  "Dead-letter jobs could not be loaded.";

function DeadLetterPage() {
  const navigate =
    useNavigate();

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

  const [page, setPage] =
    useState(1);

  const [
    requeueEntry,
    setRequeueEntry,
  ] = useState(null);

  /*
   * --------------------------------
   * Queue normalization
   * --------------------------------
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
   * --------------------------------
   * Keep queue valid
   * --------------------------------
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
   * --------------------------------
   * Query
   * --------------------------------
   */

  const dlqQuery =
    useDeadLetterEntries(
      projectId,
      activeQueueId,
      {
        page,
        limit: 20,
      }
    );

  const entries =
    dlqQuery.data?.entries ??
    [];

  const pagination =
    dlqQuery.data?.pagination;

  /*
   * --------------------------------
   * Handlers
   * --------------------------------
   */

  const handleQueueChange = (
    nextQueueId
  ) => {
    setQueueId(
      nextQueueId
    );

    setPage(1);
    setRequeueEntry(null);
  };

  const handleRefresh =
    () => {
      queuesQuery.refetch();

      if (activeQueueId) {
        dlqQuery.refetch();
      }
    };

  const handleView = (
    entry
  ) => {
    navigate(
      `/queues/${entry.queue_id}/dead-letter/${entry.id}`
    );
  };

  /*
   * --------------------------------
   * Overall page state
   * --------------------------------
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
              Dead Letter Queue
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Inspect permanently
              failed jobs and requeue
              them after resolving
              their failure cause.
            </p>
          </div>

          <button
            type="button"
            onClick={
              handleRefresh
            }
            disabled={
              queuesQuery.isFetching ||
              dlqQuery.isFetching
            }
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={
                queuesQuery.isFetching ||
                dlqQuery.isFetching
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>
        </div>

        {/* Initial loading */}
        {isInitialLoading && (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center">
            <p className="text-sm text-slate-500">
              Loading dead-letter
              queue...
            </p>
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
                    Dead-letter queue
                    could not be loaded
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
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center">
              <Skull
                size={38}
                className="mx-auto text-slate-300"
              />

              <h2 className="mt-4 font-semibold text-slate-900">
                No queues
                available
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Create a queue
                before monitoring
                dead-letter jobs.
              </p>
            </div>
          )}

        {/* Explorer */}
        {!isInitialLoading &&
          !hasInitialError &&
          queues.length >
            0 && (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              {/* Toolbar */}
              <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-semibold text-slate-900">
                    Failed jobs
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {selectedQueue
                      ? `Viewing ${selectedQueue.name}`
                      : "Select a queue"}
                  </p>
                </div>

                <select
                  value={
                    activeQueueId
                  }
                  onChange={(event) =>
                    handleQueueChange(
                      event.target.value
                    )
                  }
                  className="min-w-[200px] rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  {queues.map(
                    (queue) => (
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
              </div>

              {/* Loading */}
              {dlqQuery.isLoading && (
                <div className="px-6 py-14 text-center text-sm text-slate-500">
                  Loading dead-letter
                  jobs...
                </div>
              )}

              {/* Query error */}
              {dlqQuery.isError && (
                <div className="p-5">
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle
                        size={19}
                        className="mt-0.5 shrink-0 text-red-600"
                      />

                      <div>
                        <p className="font-medium text-red-800">
                          Dead-letter jobs
                          could not be
                          loaded
                        </p>

                        <p className="mt-1 text-sm text-red-600">
                          {getErrorMessage(
                            dlqQuery.error
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Empty */}
              {!dlqQuery.isLoading &&
                !dlqQuery.isError &&
                entries.length ===
                  0 && (
                  <div className="px-6 py-14 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
                      <Skull
                        size={22}
                        className="text-emerald-600"
                      />
                    </div>

                    <h3 className="mt-4 font-medium text-slate-900">
                      Dead-letter queue
                      is empty
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      No permanently
                      failed jobs are
                      waiting for manual
                      intervention.
                    </p>
                  </div>
                )}

              {/* Table */}
              {!dlqQuery.isLoading &&
                !dlqQuery.isError &&
                entries.length >
                  0 && (
                  <>
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead className="bg-slate-50">
                          <tr className="border-b border-slate-200">
                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Job
                            </th>

                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Status
                            </th>

                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Failure
                            </th>

                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Attempts
                            </th>

                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Priority
                            </th>

                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Failed at
                            </th>

                            <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Actions
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {entries.map(
                            (entry) => (
                              <DeadLetterRow
                                key={
                                  entry.id
                                }
                                entry={
                                  entry
                                }
                                onView={
                                  handleView
                                }
                                onRequeue={
                                  setRequeueEntry
                                }
                                isRequeueing={
                                  Boolean(
                                    requeueEntry
                                  )
                                }
                              />
                            )
                          )}
                        </tbody>
                      </table>
                    </div>

                    <DeadLetterPagination
                      pagination={
                        pagination
                      }
                      onPageChange={
                        setPage
                      }
                    />
                  </>
                )}
            </div>
          )}

        {/* Requeue */}
        <DeadLetterRequeueDialog
          isOpen={Boolean(
            requeueEntry
          )}
          entry={
            requeueEntry
          }
          projectId={projectId}
          queueId={
            activeQueueId
          }
          onClose={() =>
            setRequeueEntry(null)
          }
        />
      </div>
    </DashboardLayout>
  );
}

export default DeadLetterPage;
