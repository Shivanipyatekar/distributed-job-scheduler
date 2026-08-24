import {
  AlertCircle,
  LoaderCircle,
  PauseCircle,
  Plus,
  RefreshCw,
  Workflow,
} from "lucide-react";
import { useState } from "react";
import useWorkspace  from "../../app/useWorkspace";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { useProject } from "../projects/useProjects";
import QueueCard from "./QueueCard";
import QueueEditor from "./QueueEditor";
import { useSetQueuePaused } from "./useQueueMutations";
import { useQueues } from "./useQueues";

const getErrorMessage = (error) =>
  error?.response?.data?.message ??
  error?.message ??
  "Queues could not be loaded.";

function QueuesPage() {
  const { selectedProjectId: projectId } = useWorkspace(); 
  const projectQuery = useProject(projectId);
  const queuesQuery = useQueues(projectId);
  const pauseMutation = useSetQueuePaused(projectId);

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingQueue, setEditingQueue] = useState(null);

  const queues = queuesQuery.data ?? [];
  const canManage = ["owner", "admin"].includes(
    projectQuery.data?.role,
  );

  const activeQueues = queues.filter(
    (queue) => !queue.is_paused,
  ).length;
  const pausedQueues = queues.length - activeQueues;

  const openCreateEditor = () => {
    setEditingQueue(null);
    setIsEditorOpen(true);
  };

  const openEditEditor = (queue) => {
    setEditingQueue(queue);
    setIsEditorOpen(true);
  };

  const closeEditor = () => {
    setIsEditorOpen(false);
    setEditingQueue(null);
  };

  const handleTogglePause = (queue) => {
    pauseMutation.mutate({
      queueId: queue.id,
      shouldPause: !queue.is_paused,
    });
  };

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-7xl">
        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">
              Execution lanes
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">
              Queues
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              Control queue priority, worker concurrency, retry
              behavior, and processing availability.
            </p>
          </div>

          {canManage && (
            <button
              type="button"
              onClick={openCreateEditor}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-strong"
            >
              <Plus size={17} />
              New queue
            </button>
          )}
        </header>

        <section className="mt-7 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-line bg-surface p-4 shadow-panel">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
              Total queues
            </p>
            <p className="mt-2 text-2xl font-semibold text-ink">
              {queues.length}
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-surface p-4 shadow-panel">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
              Active
            </p>
            <p className="mt-2 text-2xl font-semibold text-brand">
              {activeQueues}
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-surface p-4 shadow-panel">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
              Paused
            </p>
            <p className="mt-2 text-2xl font-semibold text-warning">
              {pausedQueues}
            </p>
          </div>
        </section>

        {pauseMutation.isError && (
          <div
            role="alert"
            className="mt-5 flex items-start gap-3 rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger"
          >
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            {getErrorMessage(pauseMutation.error)}
          </div>
        )}

        <section className="mt-7">
          {queuesQuery.isPending ? (
            <div className="flex min-h-64 items-center justify-center rounded-2xl border border-line bg-surface">
              <div className="text-center">
                <LoaderCircle
                  size={26}
                  className="mx-auto animate-spin text-brand"
                />
                <p className="mt-3 text-sm text-muted">
                  Loading queues…
                </p>
              </div>
            </div>
          ) : queuesQuery.isError ? (
            <div className="rounded-2xl border border-danger/20 bg-surface px-6 py-12 text-center">
              <AlertCircle
                size={30}
                className="mx-auto text-danger"
              />

              <h2 className="mt-4 text-lg font-semibold text-ink">
                Queues unavailable
              </h2>

              <p className="mt-2 text-sm text-muted">
                {getErrorMessage(queuesQuery.error)}
              </p>

              <button
                type="button"
                onClick={() => queuesQuery.refetch()}
                className="mt-5 inline-flex items-center gap-2 rounded-xl border border-line px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-canvas"
              >
                <RefreshCw size={16} />
                Try again
              </button>
            </div>
          ) : queues.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-brand/30 bg-brand-soft/35 px-6 py-14 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-surface text-brand shadow-panel">
                <Workflow size={23} />
              </div>

              <h2 className="mt-5 text-xl font-semibold text-ink">
                No execution lanes yet
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
                Create a queue to define how jobs are prioritized,
                retried, and distributed across workers.
              </p>

              {canManage && (
                <button
                  type="button"
                  onClick={openCreateEditor}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-strong"
                >
                  <Plus size={17} />
                  Create first queue
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-muted">
                  Ordered by priority and creation time
                </p>

                {queuesQuery.isFetching && (
                  <span className="inline-flex items-center gap-2 text-xs font-medium text-muted">
                    <RefreshCw
                      size={13}
                      className="animate-spin"
                    />
                    Refreshing
                  </span>
                )}
              </div>

              <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                {queues.map((queue) => (
                  <QueueCard
                    key={queue.id}
                    queue={queue}
                    onOpen={openEditEditor}
                    onTogglePause={handleTogglePause}
                    isUpdating={
                      pauseMutation.isPending &&
                      pauseMutation.variables?.queueId ===
                        queue.id
                    }
                  />
                ))}
              </div>
            </>
          )}
        </section>

        {pausedQueues > 0 && (
          <div className="mt-6 flex items-center gap-3 rounded-xl border border-warning/20 bg-warning/5 px-4 py-3 text-sm text-muted">
            <PauseCircle
              size={18}
              className="shrink-0 text-warning"
            />
            Paused queues retain their pending jobs but workers will
            not claim them until processing resumes.
          </div>
        )}
      </div>

      {isEditorOpen && (
        <QueueEditor
          key={editingQueue?.id ?? "create-queue"}
          projectId={projectId}
          queue={editingQueue}
          onClose={closeEditor}
        />
      )}
    </DashboardLayout>
  );
}

export default QueuesPage;
