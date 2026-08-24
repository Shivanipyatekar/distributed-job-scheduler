import {
  AlertCircle,
  ArrowLeft,
  Clock3,
  LoaderCircle,
  RotateCcw,
} from "lucide-react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import useWorkspace from "../../app/useWorkspace";
import DashboardLayout from "../../components/layout/DashboardLayout";

import JobStatusBadge from "../jobs/JobStatusBadge";
import { useProject } from "../projects/useProjects";

import DeadLetterRequeueDialog from "./DeadLetterRequeueDialog";
import { useDeadLetterEntry } from "./useDeadLetter";
import { useState } from "react";

const getErrorMessage = (error) =>
  error?.response?.data?.message ??
  error?.message ??
  "Dead-letter entry could not be loaded.";

const formatDate = (value) => {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleString();
};

function DetailItem({
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-2 break-words text-sm font-medium text-slate-800">
        {value ?? "—"}
      </p>
    </div>
  );
}

function DeadLetterDetailsPage() {
  const navigate = useNavigate();

  const {
    queueId,
    deadLetterId,
  } = useParams();

  const {
    selectedProjectId: projectId,
  } = useWorkspace();

  const projectQuery =
    useProject(projectId);

  const entryQuery =
    useDeadLetterEntry(
      projectId,
      queueId,
      deadLetterId
    );

  const [requeueEntry, setRequeueEntry] =
    useState(null);

  const entry =
    entryQuery.data;

  const isLoading =
    projectQuery.isLoading ||
    entryQuery.isLoading;

  const hasError =
    projectQuery.isError ||
    entryQuery.isError;

  const error =
    projectQuery.error ??
    entryQuery.error;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <button
          type="button"
          onClick={() =>
            navigate("/dead-letter")
          }
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-800"
        >
          <ArrowLeft size={16} />

          Back to dead letter queue
        </button>

        {isLoading && (
          <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <LoaderCircle
                size={20}
                className="animate-spin"
              />

              Loading dead-letter entry...
            </div>
          </div>
        )}

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
                    Dead-letter entry could
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
          entry && (
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
                      {entry.type}
                    </h1>

                    <JobStatusBadge
                      status={
                        entry.job_status
                      }
                    />
                  </div>

                  <p className="mt-1 font-mono text-xs text-slate-400">
                    {entry.job_id}
                  </p>
                </div>

                {entry.job_status ===
                  "dead" && (
                  <button
                    type="button"
                    onClick={() =>
                      setRequeueEntry(
                        entry
                      )
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
                  >
                    <RotateCcw
                      size={16}
                    />

                    Requeue job
                  </button>
                )}
              </div>

              {/* Overview */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h2 className="font-semibold text-slate-900">
                  Failure overview
                </h2>

                <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <DetailItem
                    label="Queue"
                    value={
                      entry.queue_name
                    }
                  />

                  <DetailItem
                    label="Attempts made"
                    value={
                      entry.attempts_made
                    }
                  />

                  <DetailItem
                    label="Max attempts"
                    value={
                      entry.max_attempts
                    }
                  />

                  <DetailItem
                    label="Priority"
                    value={
                      entry.priority
                    }
                  />

                  <DetailItem
                    label="Failed at"
                    value={formatDate(
                      entry.failed_at
                    )}
                  />

                  <DetailItem
                    label="Job created"
                    value={formatDate(
                      entry.job_created_at
                    )}
                  />

                  <DetailItem
                    label="Available at"
                    value={formatDate(
                      entry.available_at
                    )}
                  />

                  <DetailItem
                    label="Role"
                    value={
                      entry.organization_role
                    }
                  />
                </div>
              </div>

              {/* Failure reason */}
              <div className="rounded-2xl border border-red-200 bg-white p-5">
                <div className="flex items-center gap-2">
                  <AlertCircle
                    size={18}
                    className="text-red-500"
                  />

                  <h2 className="font-semibold text-slate-900">
                    Failure reason
                  </h2>
                </div>

                <div className="mt-4 rounded-xl bg-red-50 p-4">
                  <p className="whitespace-pre-wrap text-sm leading-6 text-red-700">
                    {entry.failure_reason ??
                      "No failure reason was recorded."}
                  </p>
                </div>
              </div>

              {/* Payload */}
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="border-b border-slate-200 px-5 py-4">
                  <h2 className="font-semibold text-slate-900">
                    Job payload
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Payload captured when
                    the job entered the
                    dead-letter queue.
                  </p>
                </div>

                <div className="p-5">
                  <pre className="overflow-x-auto rounded-xl bg-slate-950 p-4 text-sm leading-6 text-slate-200">
                    {JSON.stringify(
                      entry.payload ?? {},
                      null,
                      2
                    )}
                  </pre>
                </div>
              </div>

              {/* IDs */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-2">
                  <Clock3
                    size={18}
                    className="text-slate-500"
                  />

                  <h2 className="font-semibold text-slate-900">
                    Identifiers
                  </h2>
                </div>

                <div className="mt-5 space-y-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Dead-letter ID
                    </p>

                    <p className="mt-1 break-all font-mono text-sm text-slate-600">
                      {entry.id}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Job ID
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/queues/${entry.queue_id}/jobs/${entry.job_id}`
                        )
                      }
                      className="mt-1 break-all font-mono text-sm text-blue-600 transition hover:text-blue-700"
                    >
                      {entry.job_id}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

        <DeadLetterRequeueDialog
          isOpen={Boolean(
            requeueEntry
          )}
          entry={requeueEntry}
          projectId={projectId}
          queueId={queueId}
          onClose={() =>
            setRequeueEntry(null)
          }
        />
      </div>
    </DashboardLayout>
  );
}

export default DeadLetterDetailsPage;
