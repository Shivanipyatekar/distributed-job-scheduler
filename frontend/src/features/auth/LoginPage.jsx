import { useState } from "react";
import {
  CircleAlert,
  Server,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router";
import Button from "../../components/ui/Button";
import TextField from "../../components/ui/TextField";
import {
  getApiErrorMessage,
  getApiFieldErrors,
} from "../../utils/apiError";
import AuthLayout from "./AuthLayout";
import useAuth from "./useAuth";

const initialFormData = {
  email: "",
  password: "",
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState(initialFormData);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));

    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      [name]: "",
    }));

    setFormError("");
  };

  const validateForm = () => {
    const errors = {};
    const normalizedEmail = formData.email.trim();

    if (!normalizedEmail) {
      errors.email = "Email is required";
    } else if (!emailPattern.test(normalizedEmail)) {
      errors.email = "Enter a valid email address";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setFormError("");

    try {
      await login({
        email: formData.email.trim(),
        password: formData.password,
      });

      const previousLocation = location.state?.from;
      const destination = previousLocation
        ? `${previousLocation.pathname}${previousLocation.search || ""}`
        : "/dashboard";

      navigate(destination, { replace: true });
    } catch (error) {
      setFieldErrors(getApiFieldErrors(error));
      setFormError(
        getApiErrorMessage(error, "Unable to sign in. Please try again."),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div>
        <p className="font-mono text-[0.68rem] font-semibold tracking-[0.18em] text-brand">
          MEMBER ACCESS
        </p>

        <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-ink">
          Return to the control room.
        </h2>

        <p className="mt-3 leading-7 text-muted">
          Sign in to manage projects, queues, workers, and scheduled jobs.
        </p>

        <form
          className="mt-8 space-y-5"
          onSubmit={handleSubmit}
          noValidate
        >
          {formError && (
            <div
              role="alert"
              className="flex gap-3 rounded-xl border border-danger/20 bg-danger-soft px-4 py-3 text-sm text-danger"
            >
              <CircleAlert
                className="mt-0.5 size-4 shrink-0"
                aria-hidden="true"
              />
              <p>{formError}</p>
            </div>
          )}

          <TextField
            id="email"
            name="email"
            type="email"
            label="Email address"
            placeholder="you@example.com"
            autoComplete="email"
            value={formData.email}
            error={fieldErrors.email}
            onChange={handleChange}
            required
          />

          <TextField
            id="password"
            name="password"
            type="password"
            label="Password"
            placeholder="Enter your password"
            autoComplete="current-password"
            value={formData.password}
            error={fieldErrors.password}
            onChange={handleChange}
            required
          />

          <Button
            type="submit"
            className="w-full"
            isLoading={isSubmitting}
          >
            {isSubmitting ? "Signing in…" : "Enter control room"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          New to Runline?{" "}
          <Link
            to="/register"
            className="font-semibold text-brand underline-offset-4 hover:text-brand-strong hover:underline"
          >
            Create an account
          </Link>
        </p>

        <div className="mt-8 flex items-center justify-center gap-2 border-t border-line pt-5 text-xs text-muted">
          <Server className="size-3.5" aria-hidden="true" />
          Secured using Bearer-token authentication
        </div>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
