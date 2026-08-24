function ScheduleStatusBadge({
  isActive,
}) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${
        isActive
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-slate-200 bg-slate-50 text-slate-600"
      }`}
    >
      {isActive
        ? "Active"
        : "Inactive"}
    </span>
  );
}

export default ScheduleStatusBadge;
