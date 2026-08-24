const statusClasses = {
  running:
    "border-blue-200 bg-blue-50 text-blue-700",

  succeeded:
    "border-emerald-200 bg-emerald-50 text-emerald-700",

  failed:
    "border-red-200 bg-red-50 text-red-700",

  crashed:
    "border-amber-200 bg-amber-50 text-amber-700",
};

function ExecutionStatusBadge({
  status,
}) {
  const normalized =
    status?.toLowerCase() ??
    "unknown";

  const classes =
    statusClasses[normalized] ??
    "border-slate-200 bg-slate-50 text-slate-600";

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${classes}`}
    >
      {normalized}
    </span>
  );
}

export default ExecutionStatusBadge;
