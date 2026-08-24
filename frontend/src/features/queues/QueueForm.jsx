import { LoaderCircle, Save, X } from "lucide-react";
import { useState } from "react";

const inputClassName =
  "mt-1.5 w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-muted/60 focus:border-brand focus:ring-2 focus:ring-brand/10";

const getInitialFormData = (queue) => ({
  name: queue?.name ?? "",
  concurrencyLimit: String(queue?.concurrency_limit ?? 10),
  priority: String(queue?.priority ?? 0),
  strategy: queue?.retry_policy?.strategy ?? "exponential",
  baseDelayMs: String(
    queue?.retry_policy?.base_delay_ms ?? 1000,
  ),
  maxDelayMs: String(
    queue?.retry_policy?.max_delay_ms ?? 60000,
  ),
  maxAttempts: String(
    queue?.retry_policy?.max_attempts ?? 5,
  ),
});

const validateForm = (formData) => {
  const errors = {};
  const name = formData.name.trim();
  const concurrencyLimit = Number(formData.concurrencyLimit);
  const priority = Number(formData.priority);
  const baseDelayMs = Number(formData.baseDelayMs);
  const maxDelayMs = Number(formData.maxDelayMs);
  const maxAttempts = Number(formData.maxAttempts);

  if (name.length < 2 || name.length > 100) {
    errors.name = "Name must be between 2 and 100 characters.";
  }

  if (
    !Number.isInteger(concurrencyLimit) ||
    concurrencyLimit < 1 ||
    concurrencyLimit > 1000
  ) {
    errors.concurrencyLimit =
      "Concurrency must be between 1 and 1000.";
  }

  if (
    !Number.isInteger(priority) ||
    priority < 0 ||
    priority > 100
  ) {
    errors.priority = "Priority must be between 0 and 100.";
  }

  if (
    !Number.isInteger(baseDelayMs) ||
    baseDelayMs < 0 ||
    baseDelayMs > 86400000
  ) {
    errors.baseDelayMs =
      "Base delay must be between 0 and 86400000 ms.";
  }

  if (
    !Number.isInteger(maxDelayMs) ||
    maxDelayMs < 0 ||
    maxDelayMs > 86400000
  ) {
    errors.maxDelayMs =
      "Maximum delay must be between 0 and 86400000 ms.";
  } else if (maxDelayMs < baseDelayMs) {
    errors.maxDelayMs =
      "Maximum delay cannot be less than base delay.";
  }

  if (
    !Number.isInteger(maxAttempts) ||
    maxAttempts < 1 ||
    maxAttempts > 100
  ) {
    errors.maxAttempts =
      "Maximum attempts must be between 1 and 100.";
  }

  return errors;
};

function QueueForm({
  queue = null,
  onSubmit,
  onCancel,
  isSubmitting = false,
  errorMessage = "",
}) {
  const [formData, setFormData] = useState(() =>
    getInitialFormData(queue),
  );
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setFieldErrors((current) => ({
      ...current,
      [name]: undefined,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const validationErrors = validateForm(formData);
    setFieldErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    onSubmit({
      name: formData.name.trim(),
      concurrencyLimit: Number(formData.concurrencyLimit),
      priority: Number(formData.priority),
      retryPolicy: {
        strategy: formData.strategy,
        baseDelayMs: Number(formData.baseDelayMs),
        maxDelayMs: Number(formData.maxDelayMs),
        maxAttempts: Number(formData.maxAttempts),
      },
    });
  };

  const renderError = (fieldName) =>
    fieldErrors[fieldName] ? (
      <p className="mt-1 text-xs font-medium text-danger">
        {fieldErrors[fieldName]}
      </p>
    ) : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMessage && (
        <div
          role="alert"
          className="rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger"
        >
          {errorMessage}
        </div>
      )}

      <div>
        <label className="text-sm font-semibold text-ink">
          Queue name
          <input
            autoFocus
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="email-delivery"
            className={inputClassName}
          />
        </label>
        {renderError("name")}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-semibold text-ink">
            Concurrency limit
            <input
              type="number"
              name="concurrencyLimit"
              min="1"
              max="1000"
              value={formData.concurrencyLimit}
              onChange={handleChange}
              className={inputClassName}
            />
          </label>
          {renderError("concurrencyLimit")}
        </div>

        <div>
          <label className="text-sm font-semibold text-ink">
            Priority
            <input
              type="number"
              name="priority"
              min="0"
              max="100"
              value={formData.priority}
              onChange={handleChange}
              className={inputClassName}
            />
          </label>
          {renderError("priority")}
        </div>
      </div>

      <section className="rounded-2xl border border-line bg-canvas/60 p-4">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-ink">
            Retry policy
          </h3>
          <p className="mt-1 text-xs text-muted">
            Controls retry attempts and backoff timing.
          </p>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-semibold text-ink">
            Strategy
            <select
              name="strategy"
              value={formData.strategy}
              onChange={handleChange}
              className={inputClassName}
            >
              <option value="fixed">Fixed delay</option>
              <option value="linear">Linear backoff</option>
              <option value="exponential">
                Exponential backoff
              </option>
            </select>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-ink">
                Base delay (ms)
                <input
                  type="number"
                  name="baseDelayMs"
                  min="0"
                  max="86400000"
                  value={formData.baseDelayMs}
                  onChange={handleChange}
                  className={inputClassName}
                />
              </label>
              {renderError("baseDelayMs")}
            </div>

            <div>
              <label className="text-sm font-semibold text-ink">
                Maximum delay (ms)
                <input
                  type="number"
                  name="maxDelayMs"
                  min="0"
                  max="86400000"
                  value={formData.maxDelayMs}
                  onChange={handleChange}
                  className={inputClassName}
                />
              </label>
              {renderError("maxDelayMs")}
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-ink">
              Maximum attempts
              <input
                type="number"
                name="maxAttempts"
                min="1"
                max="100"
                value={formData.maxAttempts}
                onChange={handleChange}
                className={inputClassName}
              />
            </label>
            {renderError("maxAttempts")}
          </div>
        </div>
      </section>

      <div className="flex justify-end gap-3 border-t border-line pt-5">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-xl border border-line px-4 py-2.5 text-sm font-semibold text-muted transition hover:bg-canvas hover:text-ink disabled:opacity-50"
        >
          <X size={16} />
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? (
            <LoaderCircle size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          {queue ? "Save changes" : "Create queue"}
        </button>
      </div>
    </form>
  );
}

export default QueueForm;
