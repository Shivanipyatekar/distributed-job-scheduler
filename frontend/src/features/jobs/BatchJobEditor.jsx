import {
  AlertCircle,
  LoaderCircle,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useCreateBatchJobs } from "./useJobMutations";

const createEmptyJob = () => ({
  type: "",
  payload: "{}",
  priority: "",
  maxAttempts: "",
  delayMs: "",
});

const getErrorMessage = (error) =>
  error?.response?.data?.message ??
  error?.message ??
  "Batch jobs could not be created.";

function BatchJobEditor({
  isOpen,
  onClose,
  projectId,
  queueId,
  queueName,
}) {
  const createBatchMutation =
    useCreateBatchJobs(projectId, queueId);

  const [jobs, setJobs] = useState([
    createEmptyJob(),
  ]);

  const [formError, setFormError] =
    useState("");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setJobs([createEmptyJob()]);
    setFormError("");
    createBatchMutation.reset();
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const updateJob = (
    index,
    field,
    value
  ) => {
    setJobs((current) =>
      current.map((job, jobIndex) =>
        jobIndex === index
          ? {
              ...job,
              [field]: value,
            }
          : job
      )
    );

    setFormError("");
  };

  const addJob = () => {
    if (jobs.length >= 100) {
      setFormError(
        "A batch cannot contain more than 100 jobs."
      );

      return;
    }

    setJobs((current) => [
      ...current,
      createEmptyJob(),
    ]);
  };

  const removeJob = (index) => {
    if (jobs.length === 1) {
      return;
    }

    setJobs((current) =>
      current.filter(
        (_, jobIndex) =>
          jobIndex !== index
      )
    );
  };

  const prepareJobs = () => {
    return jobs.map(
      (job, index) => {
        const type =
          job.type.trim();

        if (!type) {
          throw new Error(
            `Job ${index + 1}: type is required.`
          );
        }

        let payload;

        try {
          payload =
            JSON.parse(job.payload);
        } catch {
          throw new Error(
            `Job ${index + 1}: payload must be valid JSON.`
          );
        }

        if (
          payload === null ||
          Array.isArray(payload) ||
          typeof payload !==
            "object"
        ) {
          throw new Error(
            `Job ${index + 1}: payload must be a JSON object.`
          );
        }

        const prepared = {
          type,
          payload,
        };

        if (
          job.priority !== ""
        ) {
          const priority =
            Number(job.priority);

          if (
            !Number.isInteger(
              priority
            ) ||
            priority < -32768 ||
            priority > 32767
          ) {
            throw new Error(
              `Job ${index + 1}: priority must be between -32768 and 32767.`
            );
          }

          prepared.priority =
            priority;
        }

        if (
          job.maxAttempts !== ""
        ) {
          const maxAttempts =
            Number(
              job.maxAttempts
            );

          if (
            !Number.isInteger(
              maxAttempts
            ) ||
            maxAttempts < 1
          ) {
            throw new Error(
              `Job ${index + 1}: max attempts must be a positive integer.`
            );
          }

          prepared.maxAttempts =
            maxAttempts;
        }

        if (
          job.delayMs !== ""
        ) {
          const delayMs =
            Number(job.delayMs);

          if (
            !Number.isSafeInteger(
              delayMs
            ) ||
            delayMs < 0
          ) {
            throw new Error(
              `Job ${index + 1}: delay must be a non-negative integer.`
            );
          }

          prepared.delayMs =
            delayMs;
        }

        return prepared;
      }
    );
  };

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setFormError("");

    let preparedJobs;

    try {
      preparedJobs =
        prepareJobs();
    } catch (error) {
      setFormError(
        error.message
      );

      return;
    }

    try {
      await createBatchMutation.mutateAsync(
        preparedJobs
      );

      onClose();
    } catch {
      // Mutation error displayed below.
    }
  };

  const errorMessage =
    formError ||
    (createBatchMutation.isError
      ? getErrorMessage(
          createBatchMutation.error
        )
      : "");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Create batch
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Add multiple jobs to{" "}
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
              createBatchMutation.isPending
            }
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
        >
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

            {/* Batch info */}
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-slate-700">
                  Batch jobs
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Maximum 100 jobs per
                  request.
                </p>
              </div>

              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-600">
                {jobs.length} / 100
              </span>
            </div>

            {/* Jobs */}
            <div className="space-y-4">
              {jobs.map(
                (job, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-slate-200 p-5"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="font-medium text-slate-900">
                        Job {index + 1}
                      </h3>

                      <button
                        type="button"
                        disabled={
                          jobs.length === 1
                        }
                        onClick={() =>
                          removeJob(index)
                        }
                        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <Trash2
                          size={15}
                        />

                        Remove
                      </button>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      {/* Type */}
                      <div className="sm:col-span-2">
                        <label className="text-sm font-medium text-slate-700">
                          Job type
                        </label>

                        <input
                          type="text"
                          value={
                            job.type
                          }
                          onChange={(
                            event
                          ) =>
                            updateJob(
                              index,
                              "type",
                              event
                                .target
                                .value
                            )
                          }
                          placeholder="e.g. send-email"
                          className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                      </div>

                      {/* Payload */}
                      <div className="sm:col-span-2">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-slate-700">
                            Payload
                          </label>

                          <span className="text-xs text-slate-400">
                            JSON object
                          </span>
                        </div>

                        <textarea
                          rows={4}
                          value={
                            job.payload
                          }
                          onChange={(
                            event
                          ) =>
                            updateJob(
                              index,
                              "payload",
                              event
                                .target
                                .value
                            )
                          }
                          spellCheck="false"
                          className="mt-2 w-full resize-y rounded-lg border border-slate-200 px-3 py-3 font-mono text-sm leading-6 text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                      </div>

                      {/* Priority */}
                      <div>
                        <label className="text-sm font-medium text-slate-700">
                          Priority
                        </label>

                        <input
                          type="number"
                          min="-32768"
                          max="32767"
                          value={
                            job.priority
                          }
                          onChange={(
                            event
                          ) =>
                            updateJob(
                              index,
                              "priority",
                              event
                                .target
                                .value
                            )
                          }
                          placeholder="Queue default"
                          className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                      </div>

                      {/* Max attempts */}
                      <div>
                        <label className="text-sm font-medium text-slate-700">
                          Max attempts
                        </label>

                        <input
                          type="number"
                          min="1"
                          value={
                            job.maxAttempts
                          }
                          onChange={(
                            event
                          ) =>
                            updateJob(
                              index,
                              "maxAttempts",
                              event
                                .target
                                .value
                            )
                          }
                          placeholder="Queue default"
                          className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                      </div>

                      {/* Delay */}
                      <div className="sm:col-span-2">
                        <label className="text-sm font-medium text-slate-700">
                          Delay
                        </label>

                        <div className="mt-2 flex">
                          <input
                            type="number"
                            min="0"
                            value={
                              job.delayMs
                            }
                            onChange={(
                              event
                            ) =>
                              updateJob(
                                index,
                                "delayMs",
                                event
                                  .target
                                  .value
                              )
                            }
                            placeholder="0"
                            className="min-w-0 flex-1 rounded-l-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:z-10 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                          />

                          <span className="flex items-center rounded-r-lg border border-l-0 border-slate-200 bg-slate-50 px-3 text-sm text-slate-500">
                            ms
                          </span>
                        </div>

                        <p className="mt-1.5 text-xs text-slate-400">
                          Leave blank for
                          immediate execution.
                        </p>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>

            {/* Add */}
            <button
              type="button"
              disabled={
                jobs.length >= 100
              }
              onClick={addJob}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus size={16} />
              Add another job
            </button>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={
                createBatchMutation.isPending
              }
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                createBatchMutation.isPending
              }
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {createBatchMutation.isPending && (
                <LoaderCircle
                  size={16}
                  className="animate-spin"
                />
              )}

              {createBatchMutation.isPending
                ? "Creating..."
                : `Create ${jobs.length} ${
                    jobs.length === 1
                      ? "job"
                      : "jobs"
                  }`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BatchJobEditor;
