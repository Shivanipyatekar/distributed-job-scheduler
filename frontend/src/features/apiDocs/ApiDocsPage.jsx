import {
  BookOpen,
  KeyRound,
  Search,
  ShieldCheck,
  Terminal,
} from "lucide-react";
import { useMemo, useState } from "react";

import DashboardLayout from "../../components/layout/DashboardLayout";
import { apiDocSections } from "./apiDocsData";

const methodStyles = {
  GET: "bg-info-soft text-info",
  POST: "bg-brand-soft text-brand-strong",
  PATCH: "bg-accent-soft text-accent",
  DELETE: "bg-danger-soft text-danger",
};

const ApiDocsPage = () => {
  const [search, setSearch] = useState("");

  const filteredSections =
    useMemo(() => {
      const value =
        search.trim().toLowerCase();

      if (!value) {
        return apiDocSections;
      }

      return apiDocSections
        .map((section) => ({
          ...section,
          endpoints:
            section.endpoints.filter(
              (endpoint) =>
                endpoint.path
                  .toLowerCase()
                  .includes(value) ||
                endpoint.method
                  .toLowerCase()
                  .includes(value) ||
                endpoint.description
                  .toLowerCase()
                  .includes(value) ||
                section.title
                  .toLowerCase()
                  .includes(value)
            ),
        }))
        .filter(
          (section) =>
            section.endpoints.length > 0
        );
    }, [search]);

  const endpointCount =
    apiDocSections.reduce(
      (total, section) =>
        total +
        section.endpoints.length,
      0
    );

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <section>
          <p className="font-mono text-[0.68rem] font-semibold tracking-[0.18em] text-brand">
            DEVELOPER REFERENCE
          </p>

          <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-[-0.04em] text-ink">
                API Documentation
              </h1>

              <p className="mt-3 max-w-2xl leading-7 text-muted">
                REST API reference for
                authentication, queues,
                jobs, recurring schedules,
                workers, and scheduler
                monitoring.
              </p>
            </div>

            <span className="w-fit rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-muted">
              {endpointCount} endpoints
            </span>
          </div>
        </section>

        {/* API overview */}
        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-line bg-surface p-5 shadow-panel">
            <span className="grid size-10 place-items-center rounded-xl bg-brand-soft text-brand">
              <Terminal className="size-5" />
            </span>

            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted">
              Base URL
            </p>

            <code className="mt-2 block break-all text-sm font-semibold text-ink">
              /api/v1
            </code>
          </div>

          <div className="rounded-2xl border border-line bg-surface p-5 shadow-panel">
            <span className="grid size-10 place-items-center rounded-xl bg-info-soft text-info">
              <KeyRound className="size-5" />
            </span>

            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted">
              Authentication
            </p>

            <code className="mt-2 block text-sm font-semibold text-ink">
              Authorization: Bearer JWT
            </code>
          </div>

          <div className="rounded-2xl border border-line bg-surface p-5 shadow-panel">
            <span className="grid size-10 place-items-center rounded-xl bg-accent-soft text-accent">
              <ShieldCheck className="size-5" />
            </span>

            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted">
              Authorization
            </p>

            <p className="mt-2 text-sm font-semibold text-ink">
              Owner · Admin · Member
            </p>
          </div>
        </section>

        {/* Search */}
        <section className="rounded-2xl border border-line bg-surface p-4 shadow-panel">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search endpoint, method, or feature..."
              className="
                w-full rounded-xl
                border border-line
                bg-canvas py-2.5
                pl-10 pr-4
                text-sm text-ink
                outline-none transition
                placeholder:text-muted
                focus:border-brand
                focus:ring-4
                focus:ring-brand/10
              "
            />
          </div>
        </section>

        {/* Sections */}
        <div className="space-y-8">
          {filteredSections.map(
            (section) => (
              <section
                key={section.id}
                id={section.id}
              >
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-ink">
                    {section.title}
                  </h2>

                  <p className="mt-1 text-sm text-muted">
                    {section.description}
                  </p>
                </div>

                <div className="space-y-3">
                  {section.endpoints.map(
                    (
                      endpoint,
                      index
                    ) => (
                      <details
                        key={`${endpoint.method}-${endpoint.path}-${index}`}
                        className="group overflow-hidden rounded-2xl border border-line bg-surface shadow-panel"
                      >
                        <summary className="flex cursor-pointer list-none flex-col gap-3 px-5 py-4 transition hover:bg-surface-muted sm:flex-row sm:items-center">
                          <span
                            className={`
                              w-fit rounded-lg
                              px-2.5 py-1
                              font-mono text-xs
                              font-bold
                              ${
                                methodStyles[
                                  endpoint
                                    .method
                                ]
                              }
                            `}
                          >
                            {
                              endpoint.method
                            }
                          </span>

                          <code className="min-w-0 flex-1 break-all text-sm font-semibold text-ink">
                            {endpoint.path}
                          </code>

                          <span className="w-fit rounded-full border border-line bg-canvas px-2.5 py-1 text-xs font-semibold text-muted">
                            {endpoint.auth}
                          </span>
                        </summary>

                        <div className="border-t border-line px-5 py-5">
                          <p className="text-sm leading-6 text-muted">
                            {
                              endpoint.description
                            }
                          </p>

                          {endpoint.query && (
                            <div className="mt-5">
                              <p className="text-xs font-bold uppercase tracking-wide text-muted">
                                Query parameters
                              </p>

                              <code className="mt-2 block rounded-xl bg-canvas px-4 py-3 text-sm text-ink">
                                {
                                  endpoint.query
                                }
                              </code>
                            </div>
                          )}

                          {endpoint.body && (
                            <div className="mt-5">
                              <p className="text-xs font-bold uppercase tracking-wide text-muted">
                                Example request body
                              </p>

                              <pre className="mt-2 overflow-x-auto rounded-xl bg-ink p-4 text-sm leading-6 text-white">
                                {JSON.stringify(
                                  endpoint.body,
                                  null,
                                  2
                                )}
                              </pre>
                            </div>
                          )}

                          {endpoint.auth !==
                            "Public" && (
                            <div className="mt-5 rounded-xl border border-line bg-canvas p-4">
                              <p className="text-xs font-bold uppercase tracking-wide text-muted">
                                Authentication
                              </p>

                              <code className="mt-2 block text-sm text-ink">
                                Authorization:
                                Bearer
                                &lt;token&gt;
                              </code>
                            </div>
                          )}
                        </div>
                      </details>
                    )
                  )}
                </div>
              </section>
            )
          )}
        </div>

        {filteredSections.length ===
          0 && (
          <div className="rounded-2xl border border-dashed border-line bg-surface p-10 text-center">
            <BookOpen className="mx-auto size-8 text-muted" />

            <p className="mt-3 font-semibold text-ink">
              No endpoints found
            </p>

            <p className="mt-1 text-sm text-muted">
              Try another search term.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ApiDocsPage;
