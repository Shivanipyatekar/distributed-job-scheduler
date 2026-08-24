import {
  AlertCircle,
  LoaderCircle,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import {
  useCreateSchedule,
  useUpdateSchedule,
} from "./useScheduleMutations";

import CronPresetSelector from "./CronPresetSelector";

const getErrorMessage = (error) =>
  error?.response?.data?.message ??
  error?.message ??
  "Schedule could not be saved.";

const emptyForm = {
  cronExpression: "",
  timezone: "UTC",
  type: "",
  payload: "{}",
  priority: "",
  maxAttempts: "",
};

function ScheduleEditor({
  isOpen,
  schedule,
  projectId,
  queueId,
  queueName,
  onClose,
}) {
  const isEditing = Boolean(schedule);

  const createMutation =
    useCreateSchedule(
      projectId,
      queueId
    );

  const updateMutation =
    useUpdateSchedule(
      projectId,
      queueId
    );

  const [form, setForm] =
    useState(emptyForm);

  const [formError, setFormError] =
    useState("");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (schedule) {
      setForm({
        cronExpression:
          schedule.cron_expression ??
          "",

        timezone:
          schedule.payload_template
            ?.timezone ??
          "UTC",

        type:
          schedule.payload_template
            ?.type ??
          "",

        payload:
          JSON.stringify(
            schedule.payload_template
              ?.payload ?? {},
            null,
            2
          ),

        priority:
          schedule.payload_template
            ?.priority ??
          "",

        maxAttempts:
          schedule.payload_template
            ?.maxAttempts ??
          "",
      });
    } else {
      setForm(emptyForm);
    }

    setFormError("");

    createMutation.reset();
    updateMutation.reset();
  }, [isOpen, schedule]);

  if (!isOpen) {
    return null;
  }

  const activeMutation =
    isEditing
      ? updateMutation
      : createMutation;

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

    const cronExpression =
      form.cronExpression.trim();

    const timezone =
      form.timezone.trim();

    const type =
      form.type.trim();

    if (!cronExpression) {
      setFormError(
        "Cron expression is required."
      );
      return;
    }

    if (!timezone) {
      setFormError(
        "Timezone is required."
      );
      return;
    }

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

    const jobTemplate = {
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
          "Priority must be between -32768 and 32767."
        );
        return;
      }

      jobTemplate.priority =
        priority;
    }

    if (
      form.maxAttempts !== ""
    ) {
      const maxAttempts =
        Number(
          form.maxAttempts
        );

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

      jobTemplate.maxAttempts =
        maxAttempts;
    }

    const scheduleData = {
      cronExpression,
      timezone,
      jobTemplate,
    };

    try {
      if (isEditing) {
        await updateMutation.mutateAsync({
          scheduleId:
            schedule.id,
          scheduleData,
        });
      } else {
        await createMutation.mutateAsync(
          scheduleData
        );
      }

      onClose();
    } catch {
      // Error rendered below.
    }
  };

  const errorMessage =
    formError ||
    (activeMutation.isError
      ? getErrorMessage(
          activeMutation.error
        )
      : "");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {isEditing
                ? "Edit schedule"
                : "Create schedule"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Configure a recurring job for{" "}
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
              activeMutation.isPending
            }
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6 px-6 py-5">
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

            {/* Cron */}
		<div className="space-y-4">
  <CronPresetSelector
    value={form.cronExpression}
    onChange={(value) =>
      updateField(
        "cronExpression",
        value
      )
    }
  />

  <div>
    <div className="flex items-center justify-between">
      <label className="text-sm font-medium text-slate-700">
        Cron expression
      </label>

      <span className="text-xs text-slate-400">
        minute hour day month weekday
      </span>
    </div>

    <input
      type="text"
      value={
        form.cronExpression
      }
      onChange={(event) =>
        updateField(
          "cronExpression",
          event.target.value
        )
      }
      placeholder="0 9 * * *"
      className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-mono text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
    />

    <div className="mt-2 rounded-lg bg-slate-50 px-3 py-2">
      <p className="font-mono text-xs text-slate-500">
        * * * * *
      </p>

      <p className="mt-1 text-xs text-slate-400">
        minute · hour · day of month ·
        month · day of week
      </p>
    </div>
  </div>
</div>
            {/* Job type */}
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
                placeholder="e.g. generate-report"
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Payload */}
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

            {/* Priority / attempts */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Priority
                </label>

                <input
                  type="number"
                  min="-32768"
                  max="32767"
                  value={
                    form.priority
                  }
                  onChange={(event) =>
                    updateField(
                      "priority",
                      event.target.value
                    )
                  }
                  placeholder="Queue default"
                  className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                  placeholder="Queue default"
                  className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={
                activeMutation.isPending
              }
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                activeMutation.isPending
              }
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {activeMutation.isPending && (
                <LoaderCircle
                  size={16}
                  className="animate-spin"
                />
              )}

              {activeMutation.isPending
                ? "Saving..."
                : isEditing
                  ? "Save changes"
                  : "Create schedule"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ScheduleEditor;
