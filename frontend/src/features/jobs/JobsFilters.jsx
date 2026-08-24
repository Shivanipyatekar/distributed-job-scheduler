import Search from "lucide-react/dist/esm/icons/search";

function JobsFilters({
  queues,
  queueId,
  status,
  type,
  onQueueChange,
  onStatusChange,
  onTypeChange,
}) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <select
        value={queueId}
        onChange={(event) =>
          onQueueChange(event.target.value)
        }
        className="min-w-[180px] rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      >
        {queues.map((queue) => (
          <option
            key={queue.id}
            value={queue.id}
          >
            {queue.name}
          </option>
        ))}
      </select>

      <select
        value={status}
        onChange={(event) =>
          onStatusChange(event.target.value)
        }
        className="min-w-[160px] rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      >
        <option value="">
          All statuses
        </option>

        <option value="pending">
          Pending
        </option>

        <option value="running">
          Running
        </option>

        <option value="succeeded">
          Succeeded
        </option>

        <option value="failed">
          Failed
        </option>

        <option value="dead">
          Dead
        </option>
      </select>

      <div className="relative min-w-[220px] flex-1">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type="text"
          value={type}
          onChange={(event) =>
            onTypeChange(event.target.value)
          }
          placeholder="Filter by job type"
          className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>
    </div>
  );
}

export default JobsFilters;
