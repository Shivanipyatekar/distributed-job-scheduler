import {
  Activity,
  CircleCheckBig,
  Layers3,
  RadioTower,
} from "lucide-react";

const formatNumber = (value) => {
  return Number(value ?? 0).toLocaleString();
};

const MetricsOverview = ({
  summary,
  windowHours = 24,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="h-44 animate-pulse rounded-2xl border border-line bg-surface"
          />
        ))}
      </section>
    );
  }

  const activeQueues = Math.max(
    Number(summary?.total_queues ?? 0) -
      Number(summary?.paused_queues ?? 0),
    0,
  );

  const cards = [
    {
      label: "Total jobs",
      value: formatNumber(summary?.total_jobs),
      note: `${formatNumber(
        summary?.created_in_window,
      )} created in the last ${windowHours}h`,
      icon: Activity,
      tone: "bg-brand-soft text-brand",
    },
    {
      label: "Success rate",
      value: `${Number(
        summary?.success_rate_pct ?? 0,
      ).toFixed(1)}%`,
      note: `${formatNumber(
        summary?.failed_in_window,
      )} failed · ${formatNumber(
        summary?.dead_in_window,
      )} dead`,
      icon: CircleCheckBig,
      tone: "bg-success-soft text-success",
    },
    {
      label: "Active queues",
      value: formatNumber(activeQueues),
      note: `${formatNumber(
        summary?.paused_queues,
      )} of ${formatNumber(summary?.total_queues)} paused`,
      icon: Layers3,
      tone: "bg-info-soft text-info",
    },
    {
      label: "Online workers",
      value: formatNumber(summary?.online_workers),
      note: `${formatNumber(
        summary?.stale_workers,
      )} stale · ${formatNumber(
        summary?.offline_workers,
      )} offline`,
      icon: RadioTower,
      tone: "bg-accent-soft text-accent",
    },
  ];

  return (
    <section
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      aria-label="Project metrics overview"
    >
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <article
            key={card.label}
            className="relative overflow-hidden rounded-2xl border border-line bg-surface p-5 shadow-panel"
          >
            <div className="flex items-start justify-between">
              <p className="text-sm font-medium text-muted">
                {card.label}
              </p>

              <span className={`rounded-xl p-2.5 ${card.tone}`}>
                <Icon size={19} strokeWidth={1.9} />
              </span>
            </div>

            <p className="mt-6 text-3xl font-semibold tracking-[-0.035em] text-ink">
              {card.value}
            </p>

            <p className="mt-2 text-xs leading-5 text-muted">
              {card.note}
            </p>

            <span className="absolute inset-x-0 bottom-0 h-0.5 bg-brand/15" />
          </article>
        );
      })}
    </section>
  );
};

export default MetricsOverview;
