import { useState } from "react";
import { Link,NavLink } from "react-router";
import {
  Activity,
  BookOpen,
  Boxes,
  CalendarClock,
  CircleGauge,
  LogOut,
  Menu,
  Network,
  ServerCog,
  ShieldAlert,
  Workflow,
  X,
} from "lucide-react";
import appConfig from "../../app/appConfig";
import useWorkspace from "../../app/useWorkspace";
import useAuth from "../../features/auth/useAuth";
import { useOrganization } from "../../features/organizations/useOrganizations";
import { useProject } from "../../features/projects/useProjects";

const navigationItems = [
  {
    label: "Overview",
    icon: CircleGauge,
    to: "/dashboard",
    available: true,
  },
  {
    label: "Queues",
    icon: Boxes,
    to: "/queues",
    available: true,
  },
  { label: "Jobs", icon: Activity, to:"/jobs",available:true },
  { label: "Schedules", icon: CalendarClock, to:"/schedules",available:true },
  { label: "Workers", icon: ServerCog, to:"/workers",available:true },
  { label: "Dead letter", icon: ShieldAlert, to:"/dead-letter",available:true },
  {
  label: "API Docs",
  icon: BookOpen,
  to: "/api-docs",
  available: true,
},
];

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { selectedOrganizationId, selectedProjectId } = useWorkspace();

  const organizationQuery = useOrganization(selectedOrganizationId);
  const projectQuery = useProject(selectedProjectId);

  const organization = organizationQuery.data;
  const project = projectQuery.data;

  const initials =
    user?.name
      ?.split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U";

  const sidebar = (
    <aside className="flex h-full flex-col border-r border-line bg-surface">
      <div className="flex h-20 items-center justify-between border-b border-line px-5">
        <Link to="/dashboard" className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-brand text-white">
            <Workflow size={21} strokeWidth={2.2} />
          </span>

          <span>
            <span className="block text-[0.68rem] font-semibold uppercase tracking-[0.19em] text-muted">
              Control plane
            </span>
            <span className="block text-lg font-semibold tracking-tight text-ink">
              {appConfig.name}
            </span>
          </span>
        </Link>

        <button
          type="button"
          className="rounded-lg p-2 text-muted hover:bg-canvas hover:text-ink lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close navigation"
        >
          <X size={20} />
        </button>
      </div>

      <div className="border-b border-line px-5 py-5">
        <p className="mb-2 text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-muted">
          Active workspace
        </p>

        <div className="border-l-2 border-accent pl-3">
          <Link
            to="/organizations"
            className="block truncate text-sm text-muted hover:text-brand"
          >
            {organization?.name || "Loading organization…"}
          </Link>

          <Link
            to="/projects"
            className="mt-1 block truncate font-semibold text-ink hover:text-brand"
          >
            {project?.name || "Loading project…"}
          </Link>
        </div>
      </div>

	<nav className="flex-1 space-y-1 px-3 py-5" aria-label="Dashboard">
  {navigationItems.map((item) => {
    const Icon = item.icon;

    if (!item.available) {
      return (
        <button
          key={item.label}
          type="button"
          disabled
          title="Coming in the next steps"
          className="flex w-full cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-muted/65"
        >
          <Icon size={18} strokeWidth={1.9} />
          <span>{item.label}</span>
        </button>
      );
    }

    return (
      <NavLink
        key={item.label}
        to={item.to}
        end={item.to === "/dashboard"}
        onClick={() => setSidebarOpen(false)}
        className={({ isActive }) =>
          `flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
            isActive
              ? "bg-brand-soft text-brand-strong"
              : "text-muted hover:bg-canvas hover:text-ink"
          }`
        }
      >
        {({ isActive }) => (
          <>
            <Icon size={18} strokeWidth={1.9} />
            <span>{item.label}</span>

            {isActive && (
              <span className="ml-auto size-1.5 rounded-full bg-accent" />
            )}
          </>
        )}
      </NavLink>
    );
  })}
</nav>

      <div className="border-t border-line p-4">
        <div className="mb-3 flex items-center gap-3 px-1">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-info-soft text-xs font-bold text-info">
            {initials}
          </span>

          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-ink">
              {user?.name}
            </span>
            <span className="block truncate text-xs text-muted">
              {user?.email}
            </span>
          </span>
        </div>

        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-muted hover:bg-danger-soft hover:text-danger"
        >
          <LogOut size={17} />
          Sign out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-canvas lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]">
      <div className="hidden h-screen lg:sticky lg:top-0 lg:block">
        {sidebar}
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-ink/20"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close navigation overlay"
          />

          <div className="relative h-full w-[17rem] shadow-2xl">
            {sidebar}
          </div>
        </div>
      )}

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-20 items-center border-b border-line bg-surface/95 px-4 backdrop-blur sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="mr-3 rounded-lg p-2 text-muted hover:bg-canvas hover:text-ink lg:hidden"
            aria-label="Open navigation"
          >
            <Menu size={21} />
          </button>

          <div className="flex min-w-0 items-center gap-3">
            <span className="hidden size-8 place-items-center rounded-lg border border-line bg-canvas text-brand sm:grid">
              <Network size={16} />
            </span>

            <div className="min-w-0">
              <p className="truncate text-xs text-muted">
                {organization?.name || "Organization"}
              </p>
              <p className="truncate text-sm font-semibold text-ink">
                {project?.name || "Project workspace"}
              </p>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2 rounded-full border border-line bg-canvas px-3 py-1.5">
            <span className="size-2 rounded-full bg-success" />
            <span className="text-xs font-semibold text-ink">
              Control plane online
            </span>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
