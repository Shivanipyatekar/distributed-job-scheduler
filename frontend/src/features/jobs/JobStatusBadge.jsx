const statusClasses = {
  pending:
    "border-amber-200 bg-amber-50 text-amber-700",

  running:
    "border-blue-200 bg-blue-50 text-blue-700",

  succeeded:
    "border-emerald-200 bg-emerald-50 text-emerald-700",

  failed:
    "border-red-200 bg-red-50 text-red-700",

  dead:
    "border-rose-200 bg-rose-50 text-rose-700",
};

function JobStatusBadge({ status }) {
  const normalizedStatus = status?.toLowerCase() ?? "unknown";

  const classes =
    statusClasses[normalizedStatus] ??
    "border-slate-200 bg-slate-50 text-slate-600";

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${classes}`}
    >
      {normalizedStatus}
    </span>
  );
}

export default JobStatusBadge;
