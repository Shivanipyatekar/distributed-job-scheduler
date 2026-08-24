import {
  AlertCircle,
  BriefcaseBusiness,
  Layers3,
  LoaderCircle,
  Plus,
  RefreshCw,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import useWorkspace from "../../app/useWorkspace";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { useProject } from "../projects/useProjects";
import { useQueues } from "../queues/useQueues";

import BatchJobEditor from "./BatchJobEditor";
import JobDeleteDialog from "./JobDeleteDialog";
import JobEditor from "./JobEditor";
import JobRow from "./JobRow";
import JobsFilters from "./JobsFilters";
import JobsPagination from "./JobsPagination";
import PendingJobEditor from "./PendingJobEditor";
import { useJobs } from "./useJobs";

const getErrorMessage = (error) =>
  error?.response?.data?.message ??
  error?.message ??
  "Jobs could not be loaded.";

function JobsPage() {
  const navigate = useNavigate();

  const { selectedProjectId } = useWorkspace();
  const projectId=selectedProjectId;

  const projectQuery = useProject(projectId);
  const queuesQuery = useQueues(projectId);

  /*
   * ----------------------------------------------------
   * State
   * ----------------------------------------------------
   */

  const [queueId, setQueueId] = useState("");

  const [status, setStatus] = useState("");

  const [typeInput, setTypeInput] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const [page, setPage] = useState(1);

  const [isCreateOpen, setIsCreateOpen] =
    useState(false);

  const [isBatchOpen, setIsBatchOpen] =
    useState(false);

  const [editingJob, setEditingJob] =
    useState(null);

  const [deletingJob, setDeletingJob] =
    useState(null);

  const limit = 20;

  /*
   * ----------------------------------------------------
   * Normalize queue response
   * ----------------------------------------------------
   */

  const queueData = queuesQuery.data;

  const queues = Array.isArray(queueData)
    ? queueData
    : Array.isArray(queueData?.queues)
      ? queueData.queues
      : Array.isArray(queueData?.data)
        ? queueData.data
        : Array.isArray(queueData?.data?.queues)
          ? queueData.data.queues
          : [];

  /*
   * While queueId state is initially empty,
   * use the first queue immediately.
   */
  const activeQueueId =
    queueId || queues[0]?.id || "";

  const selectedQueue = queues.find(
    (queue) =>
      queue.id === activeQueueId
  );
  /*
   * ----------------------------------------------------
   * Keep selected queue valid
   * ----------------------------------------------------
   */

  useEffect(() => {
    if (queues.length === 0) {
      setQueueId("");
      return;
    }

    const selectedQueueExists =
      queues.some(
        (queue) =>
          queue.id === queueId
      );

    if (!selectedQueueExists) {
      setQueueId(
        queues[0].id
      );

      setPage(1);
    }
  }, [queues, queueId]);

  /*
   * ----------------------------------------------------
   * Debounce type filter
   * ----------------------------------------------------
   */

  useEffect(() => {
    const timeout =
      setTimeout(() => {
        setTypeFilter(
          typeInput.trim()
        );

        setPage(1);
      }, 350);

    return () =>
      clearTimeout(timeout);
  }, [typeInput]);

  /*
   * ----------------------------------------------------
   * Jobs query
   * ----------------------------------------------------
   */

  const jobsQuery = useJobs(
    projectId,
    activeQueueId,
    {
      page,
      limit,
      status,
      type: typeFilter,
    }
  );

  const jobs =
    jobsQuery.data?.jobs ?? [];

  const pagination =
    jobsQuery.data?.pagination;

  /*
   * ----------------------------------------------------
   * Handlers
   * ----------------------------------------------------
   */

  const handleQueueChange = (
    nextQueueId
  ) => {
    setQueueId(nextQueueId);
    setPage(1);

    setEditingJob(null);
    setDeletingJob(null);
  };

  const handleStatusChange = (
    nextStatus
  ) => {
    setStatus(nextStatus);
    setPage(1);
  };

  const handleJobSelect = (
    job
  ) => {
    navigate(
      `/queues/${activeQueueId}/jobs/${job.id}`
    );
  };

  const handleEditJob = (
    job
  ) => {
    setEditingJob(job);
  };

  const handleDeleteJob = (
    job
  ) => {
    setDeletingJob(job);
  };

  const handleRefresh = () => {
    queuesQuery.refetch();

    if (activeQueueId) {
      jobsQuery.refetch();
    }
  };

  /*
   * ----------------------------------------------------
   * Loading/error state
   * ----------------------------------------------------
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

  /*
   * ----------------------------------------------------
   * Render
   * ----------------------------------------------------
   */

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600">
              {projectQuery.data?.name ??
                "Project"}
            </p>

            <h1 className="mt-1 text-2xl font-semibold text-slate-900">
              Jobs
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Create, schedule and inspect
              background jobs across your
              queues.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            {/* Create batch */}
            <button
              type="button"
              disabled={
                queues.length === 0 ||
                !activeQueueId
              }
              onClick={() =>
                setIsBatchOpen(true)
              }
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Layers3 size={16} />

              Create batch
            </button>

            {/* Create job */}
            <button
              type="button"
              disabled={
                queues.length === 0 ||
                !activeQueueId
              }
              onClick={() =>
                setIsCreateOpen(true)
              }
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus size={16} />

              Create job
            </button>
          </div>
        </div>

        {/* Initial loading */}
        {isInitialLoading && (
          <div className="flex min-h-[280px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <LoaderCircle
                size={20}
                className="animate-spin"
              />

              Loading jobs...
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
                    Jobs could not be
                    loaded
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
          queues.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center">
              <BriefcaseBusiness
                size={36}
                className="mx-auto text-slate-300"
              />

              <h2 className="mt-4 font-semibold text-slate-900">
                No queues available
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Create a queue before
                creating jobs.
              </p>
            </div>
          )}

        {/* Job explorer */}
        {!isInitialLoading &&
          !hasInitialError &&
          queues.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              {/* Explorer top */}
              <div className="border-b border-slate-200 px-5 py-4">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div>
                    <h2 className="font-semibold text-slate-900">
                      Job explorer
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {selectedQueue
                        ? `Viewing ${selectedQueue.name}`
                        : "Select a queue"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={
                      handleRefresh
                    }
                    disabled={
                      queuesQuery.isFetching ||
                      jobsQuery.isFetching
                    }
                    className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <RefreshCw
                      size={15}
                      className={
                        queuesQuery.isFetching ||
                        jobsQuery.isFetching
                          ? "animate-spin"
                          : ""
                      }
                    />

                    Refresh
                  </button>
                </div>

                {/* Filters */}
                <div className="mt-4">
                  <JobsFilters
                    queues={queues}
                    queueId={
                      activeQueueId
                    }
                    status={status}
                    type={typeInput}
                    onQueueChange={
                      handleQueueChange
                    }
                    onStatusChange={
                      handleStatusChange
                    }
                    onTypeChange={
                      setTypeInput
                    }
                  />
                </div>
              </div>

              {/* Loading jobs */}
              {jobsQuery.isLoading && (
                <div className="flex min-h-[240px] items-center justify-center">
                  <div className="flex items-center gap-3 text-sm text-slate-500">
                    <LoaderCircle
                      size={20}
                      className="animate-spin"
                    />

                    Loading queue
                    jobs...
                  </div>
                </div>
              )}

              {/* Jobs error */}
              {jobsQuery.isError && (
                <div className="p-5">
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle
                        size={19}
                        className="mt-0.5 shrink-0 text-red-600"
                      />

                      <div>
                        <p className="font-medium text-red-800">
                          Queue jobs could
                          not be loaded
                        </p>

                        <p className="mt-1 text-sm text-red-600">
                          {getErrorMessage(
                            jobsQuery.error
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Empty jobs */}
              {!jobsQuery.isLoading &&
                !jobsQuery.isError &&
                jobs.length === 0 && (
                  <div className="px-6 py-12 text-center">
                    <BriefcaseBusiness
                      size={34}
                      className="mx-auto text-slate-300"
                    />

                    <h3 className="mt-4 font-medium text-slate-900">
                      No jobs found
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {status ||
                      typeFilter
                        ? "No jobs match the current filters."
                        : "This queue does not have any jobs yet."}
                    </p>

                    {!status &&
                      !typeFilter && (
                        <button
                          type="button"
                          disabled={
                            !activeQueueId
                          }
                          onClick={() =>
                            setIsCreateOpen(
                              true
                            )
                          }
                          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Plus
                            size={
                              16
                            }
                          />

                          Create first job
                        </button>
                      )}
                  </div>
                )}

              {/* Jobs table */}
              {!jobsQuery.isLoading &&
                !jobsQuery.isError &&
                jobs.length > 0 && (
                  <>
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
                              Available
                            </th>

                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Created
                            </th>

                            <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Actions
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {jobs.map(
                            (job) => (
                              <JobRow
                                key={
                                  job.id
                                }
                                job={job}
                                queueName={
                                  selectedQueue?.name
                                }
                                onSelect={
                                  handleJobSelect
                                }
                                onEdit={
                                  handleEditJob
                                }
                                onDelete={
                                  handleDeleteJob
                                }
                              />
                            )
                          )}
                        </tbody>
                      </table>
                    </div>

                    <JobsPagination
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

        {/* Create job */}
        <JobEditor
          isOpen={isCreateOpen}
          onClose={() =>
            setIsCreateOpen(false)
          }
          projectId={projectId}
          queueId={activeQueueId}
          queueName={
            selectedQueue?.name
          }
        />

        {/* Create batch */}
        <BatchJobEditor
          isOpen={isBatchOpen}
          onClose={() =>
            setIsBatchOpen(false)
          }
          projectId={projectId}
          queueId={activeQueueId}
          queueName={
            selectedQueue?.name
          }
        />

        {/* Edit pending */}
        <PendingJobEditor
          isOpen={Boolean(
            editingJob
          )}
          job={editingJob}
          projectId={projectId}
          queueId={activeQueueId}
          onClose={() =>
            setEditingJob(null)
          }
        />

        {/* Delete pending */}
        <JobDeleteDialog
          isOpen={Boolean(
            deletingJob
          )}
          job={deletingJob}
          projectId={projectId}
          queueId={activeQueueId}
          onClose={() =>
            setDeletingJob(null)
          }
        />
      </div>
    </DashboardLayout>
  );
}

export default JobsPage;
