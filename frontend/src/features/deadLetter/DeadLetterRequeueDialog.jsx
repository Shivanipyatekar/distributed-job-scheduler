import {
  AlertTriangle,
  LoaderCircle,
  RotateCcw,
  X,
} from "lucide-react";

import {
  useRequeueDeadLetter,
} from "./useDeadLetterMutations";

const getErrorMessage = (error) =>
  error?.response?.data?.message ??
  error?.message ??
  "Job could not be requeued.";

function DeadLetterRequeueDialog({
  isOpen,
  entry,
  projectId,
  queueId,
  onClose,
}) {
  const requeueMutation =
    useRequeueDeadLetter(
      projectId,
      queueId
    );

  if (!isOpen || !entry) {
    return null;
  }

  const handleRequeue =
    async () => {
      try {
        await requeueMutation
          .mutateAsync(
            entry.id
          );

        onClose();
      } catch {
        // Error displayed below.
      }
    };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-blue-50 p-2.5">
              <RotateCcw
                size={20}
                className="text-blue-600"
              />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Requeue job
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Move this dead job
                back into the queue.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={
              requeueMutation.isPending
            }
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 px-6 py-5">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle
                size={18}
                className="mt-0.5 shrink-0 text-amber-600"
              />

              <p className="text-sm leading-6 text-amber-800">
                The attempt count will
                reset to 0 and the job
                can be picked up by a
                worker again immediately.
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Job
            </p>

            <p className="mt-1 font-medium text-slate-900">
              {entry.type}
            </p>

            <p className="mt-1 break-all font-mono text-xs text-slate-400">
              {entry.job_id}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Failure reason
            </p>

            <p className="mt-1 text-sm leading-6 text-red-600">
              {entry.failure_reason ??
                "Unknown failure"}
            </p>
          </div>

          {requeueMutation.isError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {getErrorMessage(
                requeueMutation.error
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={
              requeueMutation.isPending
            }
            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={
              handleRequeue
            }
            disabled={
              requeueMutation.isPending
            }
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {requeueMutation.isPending ? (
              <LoaderCircle
                size={16}
                className="animate-spin"
              />
            ) : (
              <RotateCcw
                size={16}
              />
            )}

            {requeueMutation.isPending
              ? "Requeueing..."
              : "Requeue job"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeadLetterRequeueDialog;
