CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  queue_id UUID NOT NULL
    REFERENCES queues(id)
    ON DELETE CASCADE,

  project_id UUID NOT NULL
    REFERENCES projects(id)
    ON DELETE CASCADE,

  type TEXT NOT NULL,

  payload JSONB NOT NULL DEFAULT '{}',

  status TEXT NOT NULL DEFAULT 'pending',

  priority SMALLINT NOT NULL DEFAULT 0,

  max_attempts INT NOT NULL DEFAULT 5,

  attempt_count INT NOT NULL DEFAULT 0,

  available_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  locked_by UUID
    REFERENCES workers(id)
    ON DELETE SET NULL,

  locked_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_jobs_poll
ON jobs(queue_id, status, available_at)
WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_jobs_project
ON jobs(project_id);
