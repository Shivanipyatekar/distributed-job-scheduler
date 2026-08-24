import {
  Activity,
  Clock3,
  Cpu,
  HardDrive,
  Server,
  Workflow,
} from "lucide-react";

import WorkerStatusBadge from "./WorkerStatusBadge";

const formatDate = (value) => {
  if (!value) {
    return "—";
  }

  return new Date(
    value
  ).toLocaleString();
};

const formatUptime = (
  seconds
) => {
  if (
    seconds === null ||
    seconds === undefined
  ) {
    return "—";
  }

  const totalSeconds =
    Math.max(
      0,
      Math.floor(
        Number(seconds)
      )
    );

  const days =
    Math.floor(
      totalSeconds / 86400
    );

  const hours =
    Math.floor(
      (totalSeconds % 86400) /
        3600
    );

  const minutes =
    Math.floor(
      (totalSeconds % 3600) /
        60
    );

  if (days > 0) {
    return `${days}d ${hours}h`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
};

const formatDuration = (
  milliseconds
) => {
  if (
    milliseconds === null ||
    milliseconds === undefined
  ) {
    return "—";
  }

  const value =
    Number(milliseconds);

  if (value < 1000) {
    return `${Math.round(
      value
    )} ms`;
  }

  return `${(
    value / 1000
  ).toFixed(2)} s`;
};

function Stat({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs text-slate-400">
        <Icon size={13} />

        {label}
      </div>

      <p className="mt-1 text-sm font-medium text-slate-700">
        {value}
      </p>
    </div>
  );
}

function WorkerCard({
  worker,
  onSelect,
}) {
  const healthStatus =
    worker.health_status ??
    worker.status;

  return (
    <button
      type="button"
      onClick={() =>
        onSelect(worker)
      }
      className="w-full rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:border-blue-200 hover:shadow-sm"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="rounded-xl bg-blue-50 p-2.5">
            <Server
              size={20}
              className="text-blue-600"
            />
          </div>

          <div className="min-w-0">
            <p className="truncate font-semibold text-slate-900">
              {worker.hostname}
            </p>

            <p className="mt-1 font-mono text-xs text-slate-400">
              PID {worker.pid}
            </p>
          </div>
        </div>

        <WorkerStatusBadge
          status={
            healthStatus
          }
        />
      </div>

      {/* Runtime */}
      <div className="mt-5 grid grid-cols-2 gap-4 border-y border-slate-100 py-4 sm:grid-cols-4">
        <Stat
          icon={Cpu}
          label="CPU"
          value={
            worker.cpu_pct !==
              null &&
            worker.cpu_pct !==
              undefined
              ? `${Number(
                  worker.cpu_pct
                ).toFixed(1)}%`
              : "—"
          }
        />

        <Stat
          icon={HardDrive}
          label="Memory"
          value={
            worker.memory_mb !==
              null &&
            worker.memory_mb !==
              undefined
              ? `${Math.round(
                  Number(
                    worker.memory_mb
                  )
                )} MB`
              : "—"
          }
        />

        <Stat
          icon={Clock3}
          label="Uptime"
          value={formatUptime(
            worker.uptime_seconds
          )}
        />

        <Stat
          icon={Workflow}
          label="Active jobs"
          value={
            worker.project_active_jobs ??
            0
          }
        />
      </div>

      {/* Execution stats */}
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat
          icon={Activity}
          label="Executions"
          value={
            worker.project_total_executions ??
            0
          }
        />

        <Stat
          icon={Activity}
          label="Succeeded"
          value={
            worker.project_succeeded_executions ??
            0
          }
        />

        <Stat
          icon={Activity}
          label="Failed"
          value={
            worker.project_failed_executions ??
            0
          }
        />

        <Stat
          icon={Clock3}
          label="Avg duration"
          value={formatDuration(
            worker.average_duration_ms
          )}
        />
      </div>

      {/* Footer */}
      <div className="mt-5 flex flex-col gap-1 border-t border-slate-100 pt-4 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
        <span>
          Last heartbeat:{" "}
          {formatDate(
            worker.heartbeat_at ??
              worker.last_seen_at
          )}
        </span>

        <span className="font-medium text-blue-600">
          View worker details →
        </span>
      </div>
    </button>
  );
}

export default WorkerCard;
