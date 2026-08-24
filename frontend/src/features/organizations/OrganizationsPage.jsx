import {
  ArrowRight,
  Building2,
  CircleAlert,
  LogOut,
  RefreshCw,
  Users,
  Workflow,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import appConfig from "../../app/appConfig";
import useWorkspace from "../../app/useWorkspace";
import Button from "../../components/ui/Button";
import { getApiErrorMessage } from "../../utils/apiError";

import useAuth from "../auth/useAuth";

import CreateOrganizationPanel from "./CreateOrganizationPanel";
import OrganizationMembersPanel from "./OrganizationMembersPanel";
import { useOrganizations } from "./useOrganizations";

const roleStyles = {
  owner: "bg-accent-soft text-accent",
  admin: "bg-info-soft text-info",
  member: "bg-surface-muted text-muted",
};

const formatCreatedDate = (date) => {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    year: "numeric",
  }).format(new Date(date));
};

const OrganizationsPage = () => {
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const {
    selectedOrganizationId,
    selectOrganization,
  } = useWorkspace();

  const {
    data: organizations = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useOrganizations();

  const [
    managedOrganizationId,
    setManagedOrganizationId,
  ] = useState(null);

  const managedOrganization =
    organizations.find(
      (organization) =>
        organization.id ===
        managedOrganizationId
    );

  const openOrganization = (
    organization
  ) => {
    selectOrganization(
      organization.id
    );

    navigate("/projects");
  };

  const manageOrganization = (
    organization
  ) => {
    setManagedOrganizationId(
      organization.id
    );
  };

  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-brand text-white">
              <Workflow
                className="size-5"
                aria-hidden="true"
              />
            </span>

            <div>
              <p className="font-bold tracking-tight text-ink">
                {appConfig.name}
              </p>

              <p className="text-xs text-muted">
                Workspace selection
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-ink">
                {user?.name}
              </p>

              <p className="text-xs text-muted">
                {user?.email}
              </p>
            </div>

            <Button
              variant="secondary"
              className="px-3"
              onClick={logout}
              aria-label="Sign out"
            >
              <LogOut
                className="size-4"
                aria-hidden="true"
              />

              <span className="hidden sm:inline">
                Sign out
              </span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:py-14">
        <div className="grid items-start gap-8 lg:grid-cols-[1.35fr_0.65fr]">
          <section>
            <p className="font-mono text-[0.68rem] font-semibold tracking-[0.18em] text-brand">
              WORKSPACE DIRECTORY
            </p>

            <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="text-4xl font-semibold tracking-[-0.04em] text-ink">
                  Choose where work lives.
                </h1>

                <p className="mt-3 max-w-2xl leading-7 text-muted">
                  Select an organization
                  to access its projects,
                  queues, and execution
                  history.
                </p>
              </div>

              {!isLoading &&
                !isError && (
                  <span className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-muted">
                    {
                      organizations.length
                    }{" "}
                    {organizations.length ===
                    1
                      ? "organization"
                      : "organizations"}
                  </span>
                )}
            </div>

            <div className="mt-8">
              {isLoading && (
                <div className="grid gap-4 sm:grid-cols-2">
                  {[1, 2, 3, 4].map(
                    (item) => (
                      <div
                        key={item}
                        className="h-48 animate-pulse rounded-2xl border border-line bg-surface-muted"
                      />
                    )
                  )}
                </div>
              )}

              {isError && (
                <div className="rounded-2xl border border-danger/20 bg-danger-soft p-5">
                  <div className="flex gap-3">
                    <CircleAlert
                      className="mt-0.5 size-5 shrink-0 text-danger"
                      aria-hidden="true"
                    />

                    <div>
                      <h2 className="font-bold text-danger">
                        Organizations
                        could not be
                        loaded
                      </h2>

                      <p className="mt-1 text-sm leading-6 text-danger">
                        {getApiErrorMessage(
                          error
                        )}
                      </p>

                      <Button
                        variant="secondary"
                        className="mt-4"
                        isLoading={
                          isFetching
                        }
                        onClick={() =>
                          refetch()
                        }
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

              {!isLoading &&
                !isError &&
                organizations.length ===
                  0 && (
                  <div className="rounded-2xl border border-dashed border-line bg-surface p-8 text-center">
                    <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-brand-soft text-brand">
                      <Building2
                        className="size-5"
                        aria-hidden="true"
                      />
                    </span>

                    <h2 className="mt-4 font-bold text-ink">
                      No organizations
                      yet
                    </h2>

                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
                      Create your first
                      organization using
                      the panel alongside
                      this directory.
                    </p>
                  </div>
                )}

              {!isLoading &&
                !isError &&
                organizations.length >
                  0 && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {organizations.map(
                      (
                        organization
                      ) => {
                        const isSelected =
                          organization.id ===
                          selectedOrganizationId;

                        const isManaging =
                          organization.id ===
                          managedOrganizationId;

                        return (
                          <div
                            key={
                              organization.id
                            }
                            className={`
                              rounded-2xl border bg-surface p-5
                              shadow-panel transition
                              ${
                                isSelected ||
                                isManaging
                                  ? "border-brand ring-2 ring-brand/10"
                                  : "border-line"
                              }
                            `}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <span className="grid size-11 place-items-center rounded-xl bg-brand-soft text-brand">
                                <Building2
                                  className="size-5"
                                  aria-hidden="true"
                                />
                              </span>

                              <span
                                className={`
                                  rounded-full px-2.5 py-1
                                  text-xs font-bold capitalize
                                  ${
                                    roleStyles[
                                      organization
                                        .role
                                    ] ||
                                    roleStyles.member
                                  }
                                `}
                              >
                                {
                                  organization.role
                                }
                              </span>
                            </div>

                            <h2 className="mt-5 text-lg font-bold text-ink">
                              {
                                organization.name
                              }
                            </h2>

                            <p className="mt-1 font-mono text-xs text-muted">
                              /
                              {
                                organization.slug
                              }
                            </p>

                            <p className="mt-4 text-xs text-muted">
                              Joined{" "}
                              {formatCreatedDate(
                                organization.joined_at ||
                                  organization.created_at
                              )}
                            </p>

                            <div className="mt-5 flex flex-col gap-2 border-t border-line pt-4 sm:flex-row">
                              <Button
                                className="flex-1"
                                onClick={() =>
                                  openOrganization(
                                    organization
                                  )
                                }
                              >
                                Open
                                <ArrowRight
                                  className="size-4"
                                  aria-hidden="true"
                                />
                              </Button>

                              <Button
                                variant="secondary"
                                className="flex-1"
                                onClick={() =>
                                  manageOrganization(
                                    organization
                                  )
                                }
                              >
                                <Users
                                  className="size-4"
                                  aria-hidden="true"
                                />

                                Members
                              </Button>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                )}
            </div>
          </section>

          <CreateOrganizationPanel
            onCreated={
              openOrganization
            }
          />
        </div>

        {/* Member management */}
        {managedOrganization && (
          <div className="mt-10">
            <OrganizationMembersPanel
              organizationId={
                managedOrganization.id
              }
              organizationName={
                managedOrganization.name
              }
              onClose={() =>
                setManagedOrganizationId(
                  null
                )
              }
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default OrganizationsPage;
