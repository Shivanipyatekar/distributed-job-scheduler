import {
  Eye,
  RotateCcw,
} from "lucide-react";

import JobStatusBadge from "../jobs/JobStatusBadge";

const formatDate = (value) => {
  if (!value) {
    return "—";
  }

  return new Date(
    value
  ).toLocaleString();
};

function DeadLetterRow({
  entry,
  onView,
  onRequeue,
  isRequeueing,
}) {
  return (
    <tr className="border-b border-slate-100 transition hover:bg-slate-50">
      {/* Job */}
      <td className="px-5 py-4">
        <p className="font-medium text-slate-900">
          {entry.type}
        </p>

        <p className="mt-1 max-w-[180px] truncate font-mono text-xs text-slate-400">
          {entry.job_id}
        </p>
      </td>

      {/* Status */}
      <td className="px-5 py-4">
        <JobStatusBadge
          status={
            entry.job_status
          }
        />
      </td>

      {/* Failure */}
      <td className="px-5 py-4">
        <p className="max-w-[300px] truncate text-sm text-red-600">
          {entry.failure_reason ??
            "Unknown failure"}
        </p>
      </td>

      {/* Attempts */}
      <td className="px-5 py-4 text-sm text-slate-600">
        {entry.attempts_made ??
          entry.attempt_count ??
          0}
        /
        {entry.max_attempts ??
          "—"}
      </td>

      {/* Priority */}
      <td className="px-5 py-4 text-sm text-slate-600">
        {entry.priority ??
          "—"}
      </td>

      {/* Failed */}
      <td className="px-5 py-4 text-sm text-slate-500">
        {formatDate(
          entry.failed_at
        )}
      </td>

      {/* Actions */}
      <td className="px-5 py-4">
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() =>
              onView(entry)
            }
            title="View details"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <Eye size={16} />
          </button>

          {entry.job_status ===
            "dead" && (
            <button
              type="button"
              onClick={() =>
                onRequeue(entry)
              }
              disabled={
                isRequeueing
              }
              title="Requeue job"
              className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <RotateCcw
                size={16}
              />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

export default DeadLetterRow;
