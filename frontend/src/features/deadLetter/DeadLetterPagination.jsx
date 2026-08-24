function DeadLetterPagination({
  pagination,
  onPageChange,
}) {
  if (!pagination) {
    return null;
  }

  const {
    page = 1,
    limit = 20,
    total = 0,
    totalPages = 0,
  } = pagination;

  if (total === 0) {
    return null;
  }

  const first =
    (page - 1) * limit + 1;

  const last =
    Math.min(
      page * limit,
      total
    );

  return (
    <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-500">
        Showing {first}-{last} of{" "}
        {total} dead-letter jobs
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() =>
            onPageChange(
              page - 1
            )
          }
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous
        </button>

        <span className="px-2 text-sm text-slate-500">
          Page {page} of{" "}
          {Math.max(
            totalPages,
            1
          )}
        </span>

        <button
          type="button"
          disabled={
            page >= totalPages
          }
          onClick={() =>
            onPageChange(
              page + 1
            )
          }
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default DeadLetterPagination;
