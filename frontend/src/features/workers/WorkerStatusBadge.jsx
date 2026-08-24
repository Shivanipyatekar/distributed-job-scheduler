const statusStyles = {
  online:
    "border-emerald-200 bg-emerald-50 text-emerald-700",

  draining:
    "border-amber-200 bg-amber-50 text-amber-700",

  stale:
    "border-orange-200 bg-orange-50 text-orange-700",

  offline:
    "border-slate-200 bg-slate-100 text-slate-600",
};

function WorkerStatusBadge({
  status,
}) {
  const normalizedStatus =
    status?.toLowerCase() ??
    "offline";

  const style =
    statusStyles[
      normalizedStatus
    ] ??
    statusStyles.offline;

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${style}`}
    >
      <span
        className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
          normalizedStatus ===
          "online"
            ? "bg-emerald-500"
            : normalizedStatus ===
                "draining"
              ? "bg-amber-500"
              : normalizedStatus ===
                  "stale"
                ? "bg-orange-500"
                : "bg-slate-400"
        }`}
      />

      {normalizedStatus}
    </span>
  );
}

export default WorkerStatusBadge;
