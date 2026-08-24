import {
  Edit3,
  Trash2,
} from "lucide-react";
import JobStatusBadge from "./JobStatusBadge";

const formatDate = (value) => {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleString();
};

function JobRow({
  job,
  queueName,
  onSelect,
  onEdit,
  onDelete,
}) {
  const canModify =
    job.status === "pending";

  return (
    <tr className="border-b border-slate-100 transition hover:bg-slate-50">
      <td className="px-5 py-4">
        <button
          type="button"
          onClick={() => onSelect(job)}
          className="text-left"
        >
          <p className="font-medium text-slate-900 transition hover:text-blue-600">
            {job.type}
          </p>

          <p className="mt-1 max-w-[180px] truncate font-mono text-xs text-slate-400">
            {job.id}
          </p>
        </button>
      </td>

      <td className="px-5 py-4 text-sm text-slate-600">
        {queueName ?? "—"}
      </td>

      <td className="px-5 py-4">
        <JobStatusBadge status={job.status} />
      </td>

      <td className="px-5 py-4 text-sm text-slate-600">
        {job.priority ?? 0}
      </td>

      <td className="px-5 py-4 text-sm text-slate-600">
        {job.attempt_count ?? 0}
        {" / "}
        {job.max_attempts ?? "—"}
      </td>

      <td className="px-5 py-4 text-sm text-slate-500">
        {formatDate(job.available_at)}
      </td>

      <td className="px-5 py-4 text-sm text-slate-500">
        {formatDate(job.created_at)}
      </td>

      <td className="px-5 py-4">
        {canModify ? (
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              onClick={() => onEdit(job)}
              title="Edit job"
              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <Edit3 size={16} />
            </button>

            <button
              type="button"
              onClick={() => onDelete(job)}
              title="Delete job"
              className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ) : (
          <div className="text-right text-xs text-slate-400">
            —
          </div>
        )}
      </td>
    </tr>
  );
}

export default JobRow;
