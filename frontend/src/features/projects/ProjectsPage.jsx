import {
  ArrowLeft,
  ArrowRight,
  CircleAlert,
  FolderKanban,
  LockKeyhole,
  LogOut,
  RefreshCw,
  Workflow,
} from "lucide-react";
import { Navigate, useNavigate } from "react-router";
import appConfig from "../../app/appConfig";
import useWorkspace from "../../app/useWorkspace";
import Button from "../../components/ui/Button";
import { getApiErrorMessage } from "../../utils/apiError";
import useAuth from "../auth/useAuth";
import { useOrganization } from "../organizations/useOrganizations";
import CreateProjectPanel from "./CreateProjectPanel";
import { useProjects } from "./useProjects";

const formatCreatedDate = (date) => {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
};

const ProjectsPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const {
    selectedOrganizationId,
    selectedProjectId,
    selectProject,
  } = useWorkspace();

  const {
    data: organization,
    isLoading: isOrganizationLoading,
    isError: isOrganizationError,
    error: organizationError,
  } = useOrganization(selectedOrganizationId);

  const {
    data: projects = [],
    isLoading: areProjectsLoading,
    isError: areProjectsError,
    error: projectsError,
    refetch,
    isFetching,
  } = useProjects(selectedOrganizationId);

  if (!selectedOrganizationId) {
    return <Navigate to="/organizations" replace />;
  }

  const openProject = (project) => {
    selectProject(project.id);
    navigate("/dashboard");
  };

  const canCreateProject = ["owner", "admin"].includes(
    organization?.role,
  );

  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-brand text-white">
              <Workflow className="size-5" aria-hidden="true" />
            </span>

            <div>
              <p className="font-bold tracking-tight text-ink">
                {appConfig.name}
              </p>
              <p className="text-xs text-muted">
                {organization?.name || "Project selection"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="ghost"
              className="px-3"
              onClick={() => navigate("/organizations")}
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">
                Switch organization
              </span>
            </Button>

            <div className="hidden text-right md:block">
              <p className="text-sm font-semibold text-ink">
                {user?.name}
              </p>
              <p className="text-xs text-muted">{user?.email}</p>
            </div>

            <Button
              variant="secondary"
              className="px-3"
              onClick={logout}
              aria-label="Sign out"
            >
              <LogOut className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:py-14">
        <div className="grid items-start gap-8 lg:grid-cols-[1.35fr_0.65fr]">
          <section>
            <p className="font-mono text-[0.68rem] font-semibold tracking-[0.18em] text-info">
              PROJECT DIRECTORY
            </p>

            <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="text-4xl font-semibold tracking-[-0.04em] text-ink">
                  Select a workload boundary.
                </h1>

                <p className="mt-3 max-w-2xl leading-7 text-muted">
                  Projects isolate queues, workers, credentials, and
                  operational metrics.
                </p>
              </div>

              {organization?.role && (
                <span className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-bold capitalize text-muted">
                  {organization.role}
                </span>
              )}
            </div>

            <div className="mt-8">
              {(isOrganizationLoading || areProjectsLoading) && (
                <div className="grid gap-4 sm:grid-cols-2">
                  {[1, 2, 3, 4].map((item) => (
                    <div
                      key={item}
                      className="h-44 animate-pulse rounded-2xl border border-line bg-surface-muted"
                    />
                  ))}
                </div>
              )}

              {(isOrganizationError || areProjectsError) && (
                <div className="rounded-2xl border border-danger/20 bg-danger-soft p-5">
                  <div className="flex gap-3">
                    <CircleAlert
                      className="mt-0.5 size-5 shrink-0 text-danger"
                      aria-hidden="true"
                    />

                    <div>
                      <h2 className="font-bold text-danger">
                        Projects could not be loaded
                      </h2>

                      <p className="mt-1 text-sm leading-6 text-danger">
                        {getApiErrorMessage(
                          organizationError || projectsError,
                        )}
                      </p>

                      <Button
                        variant="secondary"
                        className="mt-4"
                        isLoading={isFetching}
                        onClick={() => refetch()}
                      >
                        <RefreshCw
                          className="size-4"
                          aria-hidden="true"
                        />
                        Try again
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {!areProjectsLoading &&
                !areProjectsError &&
                projects.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-line bg-surface p-8 text-center">
                    <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-info-soft text-info">
                      <FolderKanban
                        className="size-5"
                        aria-hidden="true"
                      />
                    </span>

                    <h2 className="mt-4 font-bold text-ink">
                      No projects yet
                    </h2>

                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
                      {canCreateProject
                        ? "Create the first project using the panel alongside this directory."
                        : "Ask an organization owner or admin to create a project."}
                    </p>
                  </div>
                )}

              {!areProjectsLoading &&
                !areProjectsError &&
                projects.length > 0 && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {projects.map((project) => {
                      const isSelected =
                        project.id === selectedProjectId;

                      return (
                        <button
                          key={project.id}
                          type="button"
                          onClick={() => openProject(project)}
                          className={`
                            group rounded-2xl border bg-surface p-5 text-left
                            shadow-panel transition
                            hover:-translate-y-0.5 hover:border-info/40
                            focus-visible:outline-none focus-visible:ring-4
                            focus-visible:ring-info/15
                            ${
                              isSelected
                                ? "border-info ring-2 ring-info/10"
                                : "border-line"
                            }
                          `}
                        >
                          <div className="flex items-start justify-between">
                            <span className="grid size-11 place-items-center rounded-xl bg-info-soft text-info">
                              <FolderKanban
                                className="size-5"
                                aria-hidden="true"
                              />
                            </span>

                            <span className="font-mono text-[0.65rem] text-muted">
                              {project.id.slice(0, 8)}
                            </span>
                          </div>

                          <h2 className="mt-5 text-lg font-bold text-ink">
                            {project.name}
                          </h2>

                          <p className="mt-1 text-xs text-muted">
                            Created{" "}
                            {formatCreatedDate(project.created_at)}
                          </p>

                          <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
                            <span className="text-xs font-medium text-muted">
                              Open control plane
                            </span>

                            <ArrowRight
                              className="size-4 text-info transition-transform group-hover:translate-x-0.5"
                              aria-hidden="true"
                            />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
            </div>
          </section>

          {canCreateProject ? (
            <CreateProjectPanel
              organizationId={selectedOrganizationId}
              onCreated={openProject}
            />
          ) : (
            !isOrganizationLoading && (
              <aside className="rounded-2xl border border-line bg-surface p-6 shadow-panel">
                <span className="grid size-10 place-items-center rounded-xl bg-warning-soft text-warning">
                  <LockKeyhole className="size-5" aria-hidden="true" />
                </span>

                <h2 className="mt-4 font-bold text-ink">
                  Member access
                </h2>

                <p className="mt-2 text-sm leading-6 text-muted">
                  Only organization owners and admins can create projects.
                  Existing projects remain available to you.
                </p>
              </aside>
            )
          )}
        </div>
      </main>
    </div>
  );
};

export default ProjectsPage;
