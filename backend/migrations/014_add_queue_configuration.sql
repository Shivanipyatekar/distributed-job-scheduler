BEGIN;

ALTER TABLE queues
  ADD COLUMN IF NOT EXISTS priority SMALLINT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_paused BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();


DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'queues_concurrency_limit_positive'
      AND conrelid = 'queues'::regclass
  ) THEN
    ALTER TABLE queues
      ADD CONSTRAINT queues_concurrency_limit_positive
      CHECK (concurrency_limit > 0);
  END IF;
END
$$;


CREATE INDEX IF NOT EXISTS idx_queues_active_priority
  ON queues (project_id, priority DESC)
  WHERE is_paused = false;

COMMIT;
