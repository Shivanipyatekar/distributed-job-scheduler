import {
  AlertCircle,
  LoaderCircle,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useUpdateJob } from "./useJobMutations";

const getErrorMessage = (error) =>
  error?.response?.data?.message ??
  error?.message ??
  "Job could not be updated.";

function PendingJobEditor({
  isOpen,
  job,
  projectId,
  queueId,
  onClose,
}) {
  const updateMutation =
    useUpdateJob(projectId, queueId);

  const [form, setForm] = useState({
    type: "",
    payload: "{}",
    priority: "",
    maxAttempts: "",
    delayMs: "",
  });

  const [formError, setFormError] =
    useState("");

  useEffect(() => {
    if (!isOpen || !job) {
      return;
    }

    setForm({
      type: job.type ?? "",
      payload: JSON.stringify(
        job.payload ?? {},
        null,
        2
      ),
      priority:
        job.priority ?? "",
      maxAttempts:
        job.max_attempts ?? "",
      delayMs: "",
    });

    setFormError("");
    updateMutation.reset();
  }, [isOpen, job]);

  if (!isOpen || !job) {
    return null;
  }

  const updateField = (
    field,
    value
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setFormError("");
  };

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setFormError("");

    const type = form.type.trim();

    if (!type) {
      setFormError(
        "Job type is required."
      );
      return;
    }

    let payload;

    try {
      payload = JSON.parse(
        form.payload
      );
    } catch {
      setFormError(
        "Payload must be valid JSON."
      );
      return;
    }

    if (
      payload === null ||
      Array.isArray(payload) ||
      typeof payload !== "object"
    ) {
      setFormError(
        "Payload must be a JSON object."
      );
      return;
    }

    const priority =
      Number(form.priority);

    if (
      !Number.isInteger(priority) ||
      priority < -32768 ||
      priority > 32767
    ) {
      setFormError(
        "Priority must be an integer between -32768 and 32767."
      );
      return;
    }

    const maxAttempts =
      Number(form.maxAttempts);

    if (
      !Number.isInteger(maxAttempts) ||
      maxAttempts < 1
    ) {
      setFormError(
        "Max attempts must be a positive integer."
      );
      return;
    }

    const jobData = {
      type,
      payload,
      priority,
      maxAttempts,
    };

    if (form.delayMs !== "") {
      const delayMs =
        Number(form.delayMs);

      if (
        !Number.isSafeInteger(
          delayMs
        ) ||
        delayMs < 0
      ) {
        setFormError(
          "Delay must be a non-negative integer."
        );
        return;
      }

      jobData.delayMs = delayMs;
    }

    try {
      await updateMutation.mutateAsync({
        jobId: job.id,
        jobData,
      });

      onClose();
    } catch {
      // Mutation error rendered below.
    }
  };

  const errorMessage =
    formError ||
    (updateMutation.isError
      ? getErrorMessage(
          updateMutation.error
        )
      : "");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Edit job
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Update this pending job before
              a worker claims it.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={
              updateMutation.isPending
            }
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-5 px-6 py-5">
            {errorMessage && (
              <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                <AlertCircle
                  size={18}
                  className="mt-0.5 shrink-0 text-red-600"
                />

                <p className="text-sm text-red-700">
                  {errorMessage}
                </p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-slate-700">
                Job type
              </label>

              <input
                type="text"
                value={form.type}
                onChange={(event) =>
                  updateField(
                    "type",
                    event.target.value
                  )
                }
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">
                  Payload
                </label>

                <span className="text-xs text-slate-400">
                  JSON object
                </span>
              </div>

              <textarea
                rows={7}
                value={form.payload}
                onChange={(event) =>
                  updateField(
                    "payload",
                    event.target.value
                  )
                }
                spellCheck="false"
                className="mt-2 w-full resize-y rounded-lg border border-slate-200 px-3 py-3 font-mono text-sm leading-6 text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Priority
                </label>

                <input
                  type="number"
                  min="-32768"
                  max="32767"
                  value={form.priority}
                  onChange={(event) =>
                    updateField(
                      "priority",
                      event.target.value
                    )
                  }
                  className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Max attempts
                </label>

                <input
                  type="number"
                  min="1"
                  value={
                    form.maxAttempts
                  }
                  onChange={(event) =>
                    updateField(
                      "maxAttempts",
                      event.target.value
                    )
                  }
                  className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Reschedule delay
              </label>

              <div className="mt-2 flex">
                <input
                  type="number"
                  min="0"
                  value={form.delayMs}
                  onChange={(event) =>
                    updateField(
                      "delayMs",
                      event.target.value
                    )
                  }
                  placeholder="Leave blank to keep current availability"
                  className="min-w-0 flex-1 rounded-l-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:z-10 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <span className="flex items-center rounded-r-lg border border-l-0 border-slate-200 bg-slate-50 px-3 text-sm text-slate-500">
                  ms
                </span>
              </div>

              <p className="mt-1.5 text-xs text-slate-400">
                Leave blank to preserve the
                current available time. Use 0
                to make it available now.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={
                updateMutation.isPending
              }
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                updateMutation.isPending
              }
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {updateMutation.isPending && (
                <LoaderCircle
                  size={16}
                  className="animate-spin"
                />
              )}

              {updateMutation.isPending
                ? "Saving..."
                : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PendingJobEditor;
