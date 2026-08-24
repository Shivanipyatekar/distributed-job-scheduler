import { useState } from "react";
import {
  CircleAlert,
  ShieldCheck,
} from "lucide-react";
import { Link, useNavigate } from "react-router";
import Button from "../../components/ui/Button";
import TextField from "../../components/ui/TextField";
import {
  getApiErrorMessage,
  getApiFieldErrors,
} from "../../utils/apiError";
import AuthLayout from "./AuthLayout";
import useAuth from "./useAuth";

const initialFormData = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

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
    const normalizedName = formData.name.trim();
    const normalizedEmail = formData.email.trim();

    if (!normalizedName) {
      errors.name = "Name is required";
    } else if (
      normalizedName.length < 2 ||
      normalizedName.length > 100
    ) {
      errors.name = "Name must be between 2 and 100 characters";
    }

    if (!normalizedEmail) {
      errors.email = "Email is required";
    } else if (!emailPattern.test(normalizedEmail)) {
      errors.email = "Enter a valid email address";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (
      formData.password.length < 8 ||
      formData.password.length > 72
    ) {
      errors.password = "Password must be between 8 and 72 characters";
    } else if (
      !/[a-z]/.test(formData.password) ||
      !/[A-Z]/.test(formData.password) ||
      !/[0-9]/.test(formData.password)
    ) {
      errors.password =
        "Include an uppercase letter, lowercase letter, and number";
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Confirm your password";
    } else if (formData.confirmPassword !== formData.password) {
      errors.confirmPassword = "Passwords do not match";
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
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      navigate("/dashboard", { replace: true });
    } catch (error) {
      setFieldErrors(getApiFieldErrors(error));
      setFormError(
        getApiErrorMessage(
          error,
          "Unable to create your account. Please try again.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div>
        <p className="font-mono text-[0.68rem] font-semibold tracking-[0.18em] text-brand">
          CREATE ACCOUNT
        </p>

        <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-ink">
          Set up your control room.
        </h2>

        <p className="mt-3 leading-7 text-muted">
          Create an account to organize projects and distributed workloads.
        </p>

        <form
          className="mt-7 space-y-4"
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
            id="name"
            name="name"
            type="text"
            label="Full name"
            placeholder="Your name"
            autoComplete="name"
            value={formData.name}
            error={fieldErrors.name}
            onChange={handleChange}
            required
          />

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
            placeholder="Create a secure password"
            autoComplete="new-password"
            value={formData.password}
            error={fieldErrors.password}
            hint="8–72 characters with uppercase, lowercase, and a number."
            onChange={handleChange}
            required
          />

          <TextField
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            label="Confirm password"
            placeholder="Repeat your password"
            autoComplete="new-password"
            value={formData.confirmPassword}
            error={fieldErrors.confirmPassword}
            onChange={handleChange}
            required
          />

          <Button
            type="submit"
            className="w-full"
            isLoading={isSubmitting}
          >
            {isSubmitting ? "Creating account…" : "Create account"}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-brand underline-offset-4 hover:text-brand-strong hover:underline"
          >
            Sign in
          </Link>
        </p>

        <div className="mt-6 flex items-center justify-center gap-2 border-t border-line pt-5 text-xs text-muted">
          <ShieldCheck className="size-3.5" aria-hidden="true" />
          Passwords are hashed and never returned by the API
        </div>
      </div>
    </AuthLayout>
  );
};

export default RegisterPage;
