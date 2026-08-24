import {
  AlertCircle,
  Clock3,
  LoaderCircle,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useCreateJob } from "./useJobMutations";

const getErrorMessage = (error) =>
  error?.response?.data?.message ??
  error?.message ??
  "Job could not be created.";

const initialForm = {
  type: "",
  payload: "{}",
  priority: "",
  maxAttempts: "",
  timingMode: "immediate",
  delayMs: "",
  scheduledAt: "",
};

function JobEditor({
  isOpen,
  onClose,
  projectId,
  queueId,
  queueName,
}) {
  const createMutation =
    useCreateJob(projectId, queueId);

  const [form, setForm] =
    useState(initialForm);

  const [formError, setFormError] =
    useState("");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setForm(initialForm);
    setFormError("");
    createMutation.reset();
  }, [isOpen]);

  if (!isOpen) {
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

    const type =
      form.type.trim();

    if (!type) {
      setFormError(
        "Job type is required."
      );
      return;
    }

    let payload;

    try {
      payload =
        JSON.parse(form.payload);
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

    const jobData = {
      type,
      payload,
    };

    if (
      form.priority !== ""
    ) {
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

      jobData.priority =
        priority;
    }

    if (
      form.maxAttempts !== ""
    ) {
      const maxAttempts =
        Number(form.maxAttempts);

      if (
        !Number.isInteger(
          maxAttempts
        ) ||
        maxAttempts < 1
      ) {
        setFormError(
          "Max attempts must be a positive integer."
        );
        return;
      }

      jobData.maxAttempts =
        maxAttempts;
    }

    if (
      form.timingMode ===
      "delayed"
    ) {
      const delayMs =
        Number(form.delayMs);

      if (
        !Number.isSafeInteger(
          delayMs
        ) ||
        delayMs < 1
      ) {
        setFormError(
          "Delay must be a positive number of milliseconds."
        );
        return;
      }

      jobData.delayMs =
        delayMs;
    }

    if (
      form.timingMode ===
      "scheduled"
    ) {
      if (
        !form.scheduledAt
      ) {
        setFormError(
          "Scheduled time is required."
        );
        return;
      }

      const scheduledDate =
        new Date(
          form.scheduledAt
        );

      if (
        Number.isNaN(
          scheduledDate.getTime()
        ) ||
        scheduledDate.getTime() <=
          Date.now()
      ) {
        setFormError(
          "Scheduled time must be in the future."
        );
        return;
      }

      jobData.scheduledAt =
        scheduledDate.toISOString();
    }

    try {
      await createMutation.mutateAsync(
        jobData
      );

      onClose();
    } catch {
      // Mutation error is rendered below.
    }
  };

  const errorMessage =
    formError ||
    (createMutation.isError
      ? getErrorMessage(
          createMutation.error
        )
      : "");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Create job
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Add a job to{" "}
              <span className="font-medium text-slate-700">
                {queueName ??
                  "this queue"}
              </span>
              .
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={
              createMutation.isPending
            }
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
        >
          <div className="space-y-6 px-6 py-5">
            {/* Error */}
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

            {/* Type */}
            <div>
              <label
                htmlFor="job-type"
                className="text-sm font-medium text-slate-700"
              >
                Job type
              </label>

              <input
                id="job-type"
                type="text"
                value={form.type}
                onChange={(
                  event
                ) =>
                  updateField(
                    "type",
                    event.target
                      .value
                  )
                }
                placeholder="e.g. send-email"
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <p className="mt-1.5 text-xs text-slate-400">
                Identifies the task
                workers should execute.
              </p>
            </div>

            {/* Payload */}
            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="job-payload"
                  className="text-sm font-medium text-slate-700"
                >
                  Payload
                </label>

                <span className="text-xs text-slate-400">
                  JSON object
                </span>
              </div>

              <textarea
                id="job-payload"
                rows={7}
                value={form.payload}
                onChange={(
                  event
                ) =>
                  updateField(
                    "payload",
                    event.target
                      .value
                  )
                }
                spellCheck="false"
                className="mt-2 w-full resize-y rounded-lg border border-slate-200 px-3 py-3 font-mono text-sm leading-6 text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Priority + max attempts */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="job-priority"
                  className="text-sm font-medium text-slate-700"
                >
                  Priority
                </label>

                <input
                  id="job-priority"
                  type="number"
                  min="-32768"
                  max="32767"
                  value={
                    form.priority
                  }
                  onChange={(
                    event
                  ) =>
                    updateField(
                      "priority",
                      event.target
                        .value
                    )
                  }
                  placeholder="Queue default"
                  className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <p className="mt-1.5 text-xs text-slate-400">
                  Leave blank to use
                  the queue priority.
                </p>
              </div>

              <div>
                <label
                  htmlFor="job-max-attempts"
                  className="text-sm font-medium text-slate-700"
                >
                  Max attempts
                </label>

                <input
                  id="job-max-attempts"
                  type="number"
                  min="1"
                  value={
                    form.maxAttempts
                  }
                  onChange={(
                    event
                  ) =>
                    updateField(
                      "maxAttempts",
                      event.target
                        .value
                    )
                  }
                  placeholder="Queue default"
                  className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <p className="mt-1.5 text-xs text-slate-400">
                  Leave blank to use
                  the retry policy.
                </p>
              </div>
            </div>

            {/* Scheduling */}
            <div>
              <div className="flex items-center gap-2">
                <Clock3
                  size={17}
                  className="text-slate-500"
                />

                <h3 className="text-sm font-semibold text-slate-900">
                  Scheduling
                </h3>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {[
                  {
                    value:
                      "immediate",
                    label:
                      "Immediate",
                    description:
                      "Run as soon as possible",
                  },
                  {
                    value:
                      "delayed",
                    label:
                      "Delayed",
                    description:
                      "Wait before becoming available",
                  },
                  {
                    value:
                      "scheduled",
                    label:
                      "Scheduled",
                    description:
                      "Run at a specific time",
                  },
                ].map(
                  (option) => {
                    const active =
                      form.timingMode ===
                      option.value;

                    return (
                      <button
                        key={
                          option.value
                        }
                        type="button"
                        onClick={() =>
                          updateField(
                            "timingMode",
                            option.value
                          )
                        }
                        className={`rounded-xl border p-4 text-left transition ${
                          active
                            ? "border-blue-500 bg-blue-50"
                            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <p
                          className={`text-sm font-medium ${
                            active
                              ? "text-blue-700"
                              : "text-slate-700"
                          }`}
                        >
                          {
                            option.label
                          }
                        </p>

                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          {
                            option.description
                          }
                        </p>
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* Delay */}
            {form.timingMode ===
              "delayed" && (
              <div>
                <label
                  htmlFor="job-delay"
                  className="text-sm font-medium text-slate-700"
                >
                  Delay
                </label>

                <div className="mt-2 flex">
                  <input
                    id="job-delay"
                    type="number"
                    min="1"
                    step="1"
                    value={
                      form.delayMs
                    }
                    onChange={(
                      event
                    ) =>
                      updateField(
                        "delayMs",
                        event.target
                          .value
                      )
                    }
                    placeholder="5000"
                    className="min-w-0 flex-1 rounded-l-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:z-10 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                  <span className="flex items-center rounded-r-lg border border-l-0 border-slate-200 bg-slate-50 px-3 text-sm text-slate-500">
                    ms
                  </span>
                </div>

                <p className="mt-1.5 text-xs text-slate-400">
                  Example: 5000 =
                  five seconds.
                </p>
              </div>
            )}

            {/* Scheduled */}
            {form.timingMode ===
              "scheduled" && (
              <div>
                <label
                  htmlFor="job-scheduled-at"
                  className="text-sm font-medium text-slate-700"
                >
                  Scheduled time
                </label>

                <input
                  id="job-scheduled-at"
                  type="datetime-local"
                  value={
                    form.scheduledAt
                  }
                  onChange={(
                    event
                  ) =>
                    updateField(
                      "scheduledAt",
                      event.target
                        .value
                    )
                  }
                  className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <p className="mt-1.5 text-xs text-slate-400">
                  Must be a future
                  date and time.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={
                createMutation.isPending
              }
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                createMutation.isPending
              }
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {createMutation.isPending && (
                <LoaderCircle
                  size={16}
                  className="animate-spin"
                />
              )}

              {createMutation.isPending
                ? "Creating..."
                : "Create job"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default JobEditor;
