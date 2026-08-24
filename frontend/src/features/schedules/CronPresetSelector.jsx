const presets = [
  {
    label: "Every 5 minutes",
    value: "*/5 * * * *",
  },
  {
    label: "Every 15 minutes",
    value: "*/15 * * * *",
  },
  {
    label: "Every hour",
    value: "0 * * * *",
  },
  {
    label: "Every day at 9 AM",
    value: "0 9 * * *",
  },
  {
    label: "Every day at midnight",
    value: "0 0 * * *",
  },
  {
    label: "Every Monday at 9 AM",
    value: "0 9 * * 1",
  },
];

function CronPresetSelector({
  value,
  onChange,
}) {
  return (
    <div>
      <label className="text-sm font-medium text-slate-700">
        Quick preset
      </label>

      <select
        value={
          presets.some(
            (preset) =>
              preset.value === value
          )
            ? value
            : ""
        }
        onChange={(event) => {
          if (event.target.value) {
            onChange(
              event.target.value
            );
          }
        }}
        className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      >
        <option value="">
          Custom cron expression
        </option>

        {presets.map(
          (preset) => (
            <option
              key={preset.value}
              value={preset.value}
            >
              {preset.label}
            </option>
          )
        )}
      </select>
    </div>
  );
}

export default CronPresetSelector;
