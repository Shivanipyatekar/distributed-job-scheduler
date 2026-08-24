import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity } from "lucide-react";

const formatTick = (timestamp) => {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const formatTooltipLabel = (timestamp) => {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const ThroughputChart = ({
  throughput = [],
  windowHours = 24,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="h-[25rem] animate-pulse rounded-2xl border border-line bg-surface" />
    );
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-line bg-surface shadow-panel">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
        <div>
          <h2 className="font-semibold text-ink">Execution throughput</h2>
          <p className="mt-1 text-xs text-muted">
            Job activity grouped across the last {windowHours} hours.
          </p>
        </div>

        <span className="rounded-full bg-brand-soft px-2.5 py-1 text-xs font-semibold text-brand">
          Live · 15s polling
        </span>
      </header>

      {throughput.length === 0 ? (
        <div className="grid h-80 place-items-center px-6 text-center">
          <div>
            <span className="mx-auto grid size-11 place-items-center rounded-xl bg-brand-soft text-brand">
              <Activity size={20} />
            </span>

            <p className="mt-3 text-sm font-semibold text-ink">
              No throughput data
            </p>

            <p className="mt-1 text-xs text-muted">
              Metrics will appear after jobs enter this project.
            </p>
          </div>
        </div>
      ) : (
        <div className="h-80 px-2 pb-4 pt-6 sm:px-5">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={throughput}
              margin={{
                top: 4,
                right: 12,
                left: -18,
                bottom: 0,
              }}
            >
              <CartesianGrid
                stroke="#d8ddd6"
                strokeDasharray="3 5"
                vertical={false}
              />

              <XAxis
                dataKey="bucket_start"
                tickFormatter={formatTick}
                tickLine={false}
                axisLine={false}
                minTickGap={28}
                tick={{
                  fill: "#68736e",
                  fontSize: 11,
                }}
              />

              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tick={{
                  fill: "#68736e",
                  fontSize: 11,
                }}
              />

              <Tooltip
                labelFormatter={formatTooltipLabel}
                contentStyle={{
                  backgroundColor: "#fffefa",
                  border: "1px solid #d8ddd6",
                  borderRadius: "12px",
                  boxShadow: "0 10px 30px rgba(24, 33, 30, 0.1)",
                  fontSize: "12px",
                }}
              />

              <Legend
                iconType="circle"
                iconSize={7}
                wrapperStyle={{
                  paddingTop: "16px",
                  fontSize: "12px",
                }}
              />

              <Line
                type="monotone"
                dataKey="created_jobs"
                name="Created"
                stroke="#4259a8"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />

              <Line
                type="monotone"
                dataKey="succeeded_jobs"
                name="Succeeded"
                stroke="#1f6f5f"
                strokeWidth={2.4}
                dot={false}
                activeDot={{ r: 4 }}
              />

              <Line
                type="monotone"
                dataKey="failed_jobs"
                name="Failed"
                stroke="#df6843"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />

              <Line
                type="monotone"
                dataKey="dead_jobs"
                name="Dead"
                stroke="#b23b46"
                strokeWidth={2}
                strokeDasharray="5 4"
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </article>
  );
};

export default ThroughputChart;
