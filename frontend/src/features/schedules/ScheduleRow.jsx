import {
  Edit3,
  PauseCircle,
  PlayCircle,
  Trash2,
} from "lucide-react";

import ScheduleStatusBadge from "./ScheduleStatusBadge";

const formatDate = (value) => {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleString();
};

function ScheduleRow({
  schedule,
  onEdit,
  onActivate,
  onDeactivate,
  onDelete,
  isStateChanging,
}) {
  const timezone =
    schedule.payload_template?.timezone ??
    "UTC";

  const jobType =
    schedule.payload_template?.type ??
    "—";

  return (
    <tr className="border-b border-slate-100 transition hover:bg-slate-50">
      {/* Job template */}
      <td className="px-5 py-4">
        <p className="font-medium text-slate-900">
          {jobType}
        </p>

        <p className="mt-1 max-w-[180px] truncate font-mono text-xs text-slate-400">
          {schedule.id}
        </p>
      </td>

      {/* Cron */}
      <td className="px-5 py-4">
        <code className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-700">
          {schedule.cron_expression}
        </code>
      </td>

      {/* Timezone */}
      <td className="px-5 py-4 text-sm text-slate-600">
        {timezone}
      </td>

      {/* Status */}
      <td className="px-5 py-4">
        <ScheduleStatusBadge
          isActive={
            schedule.is_active
          }
        />
      </td>

      {/* Next run */}
      <td className="px-5 py-4 text-sm text-slate-500">
        {formatDate(
          schedule.next_run_at
        )}
      </td>

      {/* Last run */}
      <td className="px-5 py-4 text-sm text-slate-500">
        {formatDate(
          schedule.last_run_at
        )}
      </td>

      {/* Actions */}
      <td className="px-5 py-4">
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() =>
              onEdit(schedule)
            }
            title="Edit schedule"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <Edit3 size={16} />
          </button>

          {schedule.is_active ? (
            <button
              type="button"
              disabled={
                isStateChanging
              }
              onClick={() =>
                onDeactivate(
                  schedule
                )
              }
              title="Deactivate schedule"
              className="rounded-lg p-2 text-amber-600 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <PauseCircle
                size={17}
              />
            </button>
          ) : (
            <button
              type="button"
              disabled={
                isStateChanging
              }
              onClick={() =>
                onActivate(
                  schedule
                )
              }
              title="Activate schedule"
              className="rounded-lg p-2 text-emerald-600 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <PlayCircle
                size={17}
              />
            </button>
          )}

          <button
            type="button"
            onClick={() =>
              onDelete(schedule)
            }
            title="Delete schedule"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
}

export default ScheduleRow;
