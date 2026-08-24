import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

function JobsPagination({
  pagination,
  onPageChange,
}) {
  if (!pagination) {
    return null;
  }

  const {
    page = 1,
    total = 0,
    totalPages = 1,
    limit = 20,
  } = pagination;

  if (total === 0) {
    return null;
  }

  const firstItem =
    (page - 1) * limit + 1;

  const lastItem = Math.min(
    page * limit,
    total
  );

  return (
    <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-500">
        Showing{" "}
        <span className="font-medium text-slate-700">
          {firstItem}
        </span>
        {" – "}
        <span className="font-medium text-slate-700">
          {lastItem}
        </span>
        {" of "}
        <span className="font-medium text-slate-700">
          {total}
        </span>
        {" jobs"}
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() =>
            onPageChange(page - 1)
          }
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={16} />
          Previous
        </button>

        <span className="px-2 text-sm text-slate-500">
          Page{" "}
          <span className="font-medium text-slate-700">
            {page}
          </span>
          {" of "}
          <span className="font-medium text-slate-700">
            {Math.max(totalPages, 1)}
          </span>
        </span>

        <button
          type="button"
          disabled={
            page >= totalPages
          }
          onClick={() =>
            onPageChange(page + 1)
          }
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

export default JobsPagination;
