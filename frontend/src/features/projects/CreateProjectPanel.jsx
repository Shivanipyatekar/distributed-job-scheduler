import { useState } from "react";
import {
  CircleAlert,
  FolderKanban,
} from "lucide-react";
import Button from "../../components/ui/Button";
import TextField from "../../components/ui/TextField";
import {
  getApiErrorMessage,
  getApiFieldErrors,
} from "../../utils/apiError";
import ApiKeyReveal from "./ApiKeyReveal";
import { useCreateProject } from "./useProjects";

const CreateProjectPanel = ({
  organizationId,
  onCreated,
}) => {
  const createProjectMutation = useCreateProject();

  const [name, setName] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [formError, setFormError] = useState("");
  const [createdProject, setCreatedProject] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const normalizedName = name.trim();

    if (!normalizedName) {
      setFieldError("Project name is required");
      return;
    }

    if (
      normalizedName.length < 2 ||
      normalizedName.length > 100
    ) {
      setFieldError(
        "Project name must be between 2 and 100 characters",
      );
      return;
    }

    setFieldError("");
    setFormError("");

    try {
      const { project } =
        await createProjectMutation.mutateAsync({
          organizationId,
          name: normalizedName,
        });

      const { api_key: apiKey, ...safeProject } = project;

      setName("");

      if (!apiKey) {
        setFormError(
          "The project was created, but its API key was not returned. Rotate the key from project settings before using a worker.",
        );
        return;
      }

      setCreatedProject({
        project: safeProject,
        apiKey,
      });
    } catch (error) {
      const apiFieldErrors = getApiFieldErrors(error);

      setFieldError(apiFieldErrors.name || "");
      setFormError(
        getApiErrorMessage(error, "Unable to create the project."),
      );
    }
  };

  const handleContinue = () => {
    const project = createdProject.project;

    setCreatedProject(null);
    createProjectMutation.reset();
    onCreated(project);
  };

  return (
    <>
      <aside className="rounded-2xl border border-line bg-surface p-5 shadow-panel sm:p-6">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-info-soft text-info">
            <FolderKanban className="size-5" aria-hidden="true" />
          </span>

          <div>
            <h2 className="font-bold text-ink">New project</h2>
            <p className="mt-1 text-sm leading-6 text-muted">
              A project contains queues, jobs, workers, and metrics.
            </p>
          </div>
        </div>

        <form
          className="mt-6 space-y-5"
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
            id="project-name"
            name="name"
            label="Project name"
            placeholder="Email processing"
            value={name}
            error={fieldError}
            hint="Names must be unique inside this organization."
            onChange={(event) => {
              setName(event.target.value);
              setFieldError("");
              setFormError("");
            }}
            required
          />

          <Button
            type="submit"
            className="w-full"
            isLoading={createProjectMutation.isPending}
          >
            {createProjectMutation.isPending
              ? "Creating project…"
              : "Create project"}
          </Button>
        </form>
      </aside>

      {createdProject && (
        <ApiKeyReveal
          projectName={createdProject.project.name}
          apiKey={createdProject.apiKey}
          onContinue={handleContinue}
        />
      )}
    </>
  );
};

export default CreateProjectPanel;
