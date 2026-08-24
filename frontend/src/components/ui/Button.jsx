import { LoaderCircle } from "lucide-react";

const variants = {
  primary:
    "bg-brand text-white hover:bg-brand-strong focus-visible:ring-brand/25",
  secondary:
    "border border-line bg-surface text-ink hover:bg-surface-muted focus-visible:ring-brand/20",
  danger:
    "bg-danger text-white hover:bg-red-800 focus-visible:ring-danger/20",
  ghost:
    "bg-transparent text-muted hover:bg-surface-muted hover:text-ink focus-visible:ring-brand/20",
};

const Button = ({
  children,
  type = "button",
  variant = "primary",
  isLoading = false,
  disabled = false,
  className = "",
  ...props
}) => {
  const variantClasses = variants[variant] || variants.primary;

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      className={`
        inline-flex min-h-11 items-center justify-center gap-2 rounded-xl
        px-4 py-2.5 text-sm font-semibold transition
        focus-visible:outline-none focus-visible:ring-4
        disabled:cursor-not-allowed disabled:opacity-55
        ${variantClasses}
        ${className}
      `}
      {...props}
    >
      {isLoading && (
        <LoaderCircle
          aria-hidden="true"
          className="size-4 animate-spin"
        />
      )}

      {children}
    </button>
  );
};

export default Button;
