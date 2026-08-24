import {
  ArrowUpRight,
  Gauge,
  Pause,
  Play,
  RefreshCcw,
  Workflow,
} from "lucide-react";

const formatStrategy = (strategy = "") =>
  strategy.charAt(0).toUpperCase() + strategy.slice(1);

function QueueCard({
  queue,
  onOpen,
  onTogglePause,
  isUpdating = false,
}) {
  const canManage = ["owner", "admin"].includes(queue.role);
  const retryPolicy = queue.retry_policy ?? {};

  return (
    <article className="group relative overflow-hidden rounded-[1.4rem] border border-line bg-surface p-5 shadow-panel transition duration-200 hover:-translate-y-0.5 hover:border-brand/30">
      <div
        className={`absolute inset-y-0 left-0 w-1 ${
          queue.is_paused ? "bg-warning" : "bg-brand"
        }`}
      />

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="mb-3 flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                queue.is_paused
                  ? "bg-warning/10 text-warning"
                  : "bg-brand-soft text-brand-strong"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  queue.is_paused
                    ? "bg-warning"
                    : "bg-brand"
                }`}
              />
              {queue.is_paused ? "Paused" : "Active"}
            </span>

            <span className="text-xs font-medium text-muted">
              Priority {queue.priority}
            </span>
          </div>

          <h2 className="truncate text-lg font-semibold text-ink">
            {queue.name}
          </h2>

          <p className="mt-1 text-sm text-muted">
            Queue execution and retry configuration
          </p>
        </div>

        <div className="rounded-xl bg-canvas p-2.5 text-brand">
          <Workflow size={20} strokeWidth={1.8} />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-line bg-canvas/60 p-3">
          <div className="flex items-center gap-2 text-xs font-medium text-muted">
            <Gauge size={14} />
            Concurrency
          </div>
          <p className="mt-1 text-lg font-semibold text-ink">
            {queue.concurrency_limit}
          </p>
        </div>

        <div className="rounded-xl border border-line bg-canvas/60 p-3">
          <div className="flex items-center gap-2 text-xs font-medium text-muted">
            <RefreshCcw size={14} />
            Retry policy
          </div>
          <p className="mt-1 truncate text-sm font-semibold text-ink">
            {formatStrategy(retryPolicy.strategy) || "Not configured"}
          </p>
          {retryPolicy.max_attempts && (
            <p className="mt-0.5 text-xs text-muted">
              {retryPolicy.max_attempts} attempts
            </p>
          )}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
        {canManage ? (
          <button
            type="button"
            disabled={isUpdating}
            onClick={() => onTogglePause(queue)}
            className="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold text-muted transition hover:bg-canvas hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
          >
            {queue.is_paused ? (
              <Play size={16} />
            ) : (
              <Pause size={16} />
            )}
            {queue.is_paused ? "Resume" : "Pause"}
          </button>
        ) : (
          <span className="text-xs font-medium text-muted">
            View-only access
          </span>
        )}

        <button
          type="button"
          onClick={() => onOpen(queue)}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand transition hover:text-brand-strong"
        >
          Manage
          <ArrowUpRight
            size={16}
            className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </button>
      </div>
    </article>
  );
}

export default QueueCard;
