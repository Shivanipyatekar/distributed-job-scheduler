const TextField = ({
  id,
  label,
  error,
  hint,
  required = false,
  className = "",
  ...inputProps
}) => {
  const descriptionId = error
    ? `${id}-error`
    : hint
      ? `${id}-hint`
      : undefined;

  return (
    <div className={`space-y-2 ${className}`}>
      <label
        htmlFor={id}
        className="block text-sm font-semibold text-ink"
      >
        {label}

        {required && (
          <span className="ml-1 text-accent" aria-hidden="true">
            *
          </span>
        )}
      </label>

      <input
        id={id}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={descriptionId}
        className={`
          min-h-11 w-full rounded-xl border bg-surface px-3.5 py-2.5
          text-sm text-ink outline-none transition
          placeholder:text-muted/65
          ${
            error
              ? "border-danger focus:border-danger focus:ring-4 focus:ring-danger/10"
              : "border-line hover:border-muted/45 focus:border-brand focus:ring-4 focus:ring-brand/10"
          }
        `}
        {...inputProps}
      />

      {error ? (
        <p id={`${id}-error`} className="text-sm text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs leading-5 text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
};

export default TextField;
