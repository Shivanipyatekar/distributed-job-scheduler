import {
  Activity,
  Database,
  RefreshCw,
  Workflow,
} from "lucide-react";
import appConfig from "../../app/appConfig";

const executionStages = [
  {
    icon: Database,
    label: "Claim",
    detail: "Atomic PostgreSQL locks",
    color: "text-info bg-info-soft",
  },
  {
    icon: Activity,
    label: "Execute",
    detail: "Concurrent worker runtime",
    color: "text-brand bg-brand-soft",
  },
  {
    icon: RefreshCw,
    label: "Recover",
    detail: "Retries and crash recovery",
    color: "text-accent bg-accent-soft",
  },
];

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-canvas p-4 sm:p-6 lg:p-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-[1280px] overflow-hidden rounded-[28px] border border-line bg-surface shadow-panel lg:grid-cols-[1.05fr_0.95fr]">
        <aside className="flex flex-col justify-between border-b border-line bg-brand-soft/60 p-6 sm:p-9 lg:border-r lg:border-b-0 lg:p-12">
          <div>
            <div className="flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded-2xl bg-brand text-white">
                <Workflow className="size-5" aria-hidden="true" />
              </div>

              <div>
                <p className="text-lg font-bold tracking-tight text-ink">
                  {appConfig.name}
                </p>
                <p className="text-xs font-medium text-muted">
                  {appConfig.productName}
                </p>
              </div>
            </div>

            <div className="mt-14 max-w-xl lg:mt-24">
              <p className="font-mono text-[0.68rem] font-semibold tracking-[0.18em] text-brand">
                CONTROL PLANE / 01
              </p>

              <h1 className="mt-4 max-w-lg text-4xl font-semibold leading-[1.05] tracking-[-0.04em] text-ink sm:text-5xl">
                Every background job, accounted for.
              </h1>

              <p className="mt-5 max-w-lg text-base leading-7 text-muted">
                Schedule work, inspect execution, and recover failures from one
                reliable operational view.
              </p>
            </div>
          </div>

          <div className="mt-12 max-w-xl rounded-2xl border border-brand/20 bg-surface/80 p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-mono text-[0.68rem] font-semibold tracking-[0.16em] text-muted">
                EXECUTION TRACE
              </p>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-success-soft px-2.5 py-1 text-xs font-semibold text-success">
                <span className="size-1.5 rounded-full bg-success" />
                Observable
              </span>
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              {executionStages.map(
                ({ icon: Icon, label, detail, color }, index) => (
                  <div
                    key={label}
                    className="rounded-xl border border-line bg-surface p-3"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`grid size-8 place-items-center rounded-lg ${color}`}
                      >
                        <Icon className="size-4" aria-hidden="true" />
                      </span>

                      <span className="font-mono text-[0.65rem] text-muted">
                        0{index + 1}
                      </span>
                    </div>

                    <p className="mt-3 text-sm font-bold text-ink">{label}</p>
                    <p className="mt-1 text-xs leading-5 text-muted">
                      {detail}
                    </p>
                  </div>
                ),
              )}
            </div>
          </div>
        </aside>

        <main className="flex items-center justify-center px-6 py-12 sm:px-10 lg:px-14">
          <div className="w-full max-w-[430px]">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AuthLayout;
