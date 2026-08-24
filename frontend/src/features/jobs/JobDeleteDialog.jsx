import {
  AlertTriangle,
  LoaderCircle,
  X,
} from "lucide-react";
import { useDeleteJob } from "./useJobMutations";

const getErrorMessage = (error) =>
  error?.response?.data?.message ??
  error?.message ??
  "Job could not be deleted.";

function JobDeleteDialog({
  isOpen,
  job,
  projectId,
  queueId,
  onClose,
}) {
  const deleteMutation =
    useDeleteJob(projectId, queueId);

  if (!isOpen || !job) {
    return null;
  }

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(
        job.id
      );

      onClose();
    } catch {
      // Error shown below.
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-red-50 p-2.5">
              <AlertTriangle
                size={20}
                className="text-red-600"
              />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Delete job
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                This action cannot be
                undone.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={
              deleteMutation.isPending
            }
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5">
          <p className="text-sm leading-6 text-slate-600">
            Delete{" "}
            <span className="font-medium text-slate-900">
              {job.type}
            </span>
            ?
          </p>

          <p className="mt-2 break-all font-mono text-xs text-slate-400">
            {job.id}
          </p>

          {deleteMutation.isError && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {getErrorMessage(
                deleteMutation.error
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={
              deleteMutation.isPending
            }
            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={
              deleteMutation.isPending
            }
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            {deleteMutation.isPending && (
              <LoaderCircle
                size={16}
                className="animate-spin"
              />
            )}

            {deleteMutation.isPending
              ? "Deleting..."
              : "Delete job"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default JobDeleteDialog;
