import { useState } from "react";
import {
  Building2,
  CircleAlert,
} from "lucide-react";
import Button from "../../components/ui/Button";
import TextField from "../../components/ui/TextField";
import {
  getApiErrorMessage,
  getApiFieldErrors,
} from "../../utils/apiError";
import { useCreateOrganization } from "./useOrganizations";

const initialFormData = {
  name: "",
  slug: "",
};

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const createSlug = (value) => {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const CreateOrganizationPanel = ({ onCreated }) => {
  const createOrganizationMutation = useCreateOrganization();

  const [formData, setFormData] = useState(initialFormData);
  const [slugEdited, setSlugEdited] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");

  const handleNameChange = (event) => {
    const name = event.target.value;

    setFormData((currentData) => ({
      ...currentData,
      name,
      slug: slugEdited ? currentData.slug : createSlug(name),
    }));

    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      name: "",
      slug: "",
    }));

    setFormError("");
  };

  const handleSlugChange = (event) => {
    const slug = event.target.value.toLowerCase();

    setSlugEdited(true);
    setFormData((currentData) => ({
      ...currentData,
      slug,
    }));

    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      slug: "",
    }));

    setFormError("");
  };

  const validateForm = () => {
    const errors = {};
    const normalizedName = formData.name.trim();
    const normalizedSlug = formData.slug.trim();

    if (!normalizedName) {
      errors.name = "Organization name is required";
    } else if (
      normalizedName.length < 2 ||
      normalizedName.length > 100
    ) {
      errors.name =
        "Organization name must be between 2 and 100 characters";
    }

    if (!normalizedSlug) {
      errors.slug = "Organization slug is required";
    } else if (
      normalizedSlug.length < 3 ||
      normalizedSlug.length > 63
    ) {
      errors.slug = "Slug must be between 3 and 63 characters";
    } else if (!slugPattern.test(normalizedSlug)) {
      errors.slug =
        "Use lowercase letters, numbers, and single hyphens only";
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setFormError("");

    try {
      const organization =
        await createOrganizationMutation.mutateAsync({
          name: formData.name.trim(),
          slug: formData.slug.trim(),
        });

      setFormData(initialFormData);
      setSlugEdited(false);
      onCreated(organization);
    } catch (error) {
      setFieldErrors(getApiFieldErrors(error));
      setFormError(
        getApiErrorMessage(
          error,
          "Unable to create the organization.",
        ),
      );
    }
  };

  return (
    <aside className="rounded-2xl border border-line bg-surface p-5 shadow-panel sm:p-6">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
          <Building2 className="size-5" aria-hidden="true" />
        </span>

        <div>
          <h2 className="font-bold text-ink">New organization</h2>
          <p className="mt-1 text-sm leading-6 text-muted">
            Organizations contain members, projects, and queues.
          </p>
        </div>
      </div>

      <form className="mt-6 space-y-5" onSubmit={handleSubmit} noValidate>
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
          id="organization-name"
          name="name"
          label="Organization name"
          placeholder="Example Labs"
          value={formData.name}
          error={fieldErrors.name}
          onChange={handleNameChange}
          required
        />

        <TextField
          id="organization-slug"
          name="slug"
          label="Organization slug"
          placeholder="example-labs"
          value={formData.slug}
          error={fieldErrors.slug}
          hint="A permanent lowercase identifier for this workspace."
          onChange={handleSlugChange}
          required
        />

        <Button
          type="submit"
          className="w-full"
          isLoading={createOrganizationMutation.isPending}
        >
          {createOrganizationMutation.isPending
            ? "Creating organization…"
            : "Create and continue"}
        </Button>
      </form>
    </aside>
  );
};

export default CreateOrganizationPanel;
