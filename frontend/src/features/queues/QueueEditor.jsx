import { Settings2, X } from "lucide-react";
import QueueForm from "./QueueForm";
import {
  useCreateQueue,
  useUpdateQueue,
} from "./useQueueMutations";

const getErrorMessage = (error) =>
  error?.response?.data?.errors?.[0]?.message ??
  error?.response?.data?.message ??
  error?.message ??
  "The queue could not be saved.";

function QueueEditor({
  projectId,
  queue = null,
  onClose,
}) {
  const createMutation = useCreateQueue(projectId);
  const updateMutation = useUpdateQueue(projectId);

  const activeMutation = queue
    ? updateMutation
    : createMutation;

  const handleSubmit = (queueData) => {
    if (queue) {
      updateMutation.mutate(
        {
          queueId: queue.id,
          queueData,
        },
        {
          onSuccess: onClose,
        },
      );

      return;
    }

    createMutation.mutate(queueData, {
      onSuccess: onClose,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-ink/20 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="queue-editor-title"
      onMouseDown={onClose}
    >
      <aside
        className="h-full w-full max-w-xl overflow-y-auto border-l border-line bg-surface shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-line bg-surface/95 px-5 py-5 backdrop-blur sm:px-7">
          <div className="flex gap-3">
            <div className="rounded-xl bg-brand-soft p-2.5 text-brand">
              <Settings2 size={20} />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">
                Queue configuration
              </p>

              <h2
                id="queue-editor-title"
                className="mt-1 text-xl font-semibold text-ink"
              >
                {queue ? `Edit ${queue.name}` : "Create a queue"}
              </h2>

              <p className="mt-1 text-sm text-muted">
                Configure concurrency, priority, and retry behavior.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={activeMutation.isPending}
            aria-label="Close queue editor"
            className="rounded-xl border border-line p-2 text-muted transition hover:bg-canvas hover:text-ink disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </header>

        <div className="px-5 py-6 sm:px-7">
          <QueueForm
            queue={queue}
            onSubmit={handleSubmit}
            onCancel={onClose}
            isSubmitting={activeMutation.isPending}
            errorMessage={
              activeMutation.isError
                ? getErrorMessage(activeMutation.error)
                : ""
            }
          />
        </div>
      </aside>
    </div>
  );
}

export default QueueEditor;
