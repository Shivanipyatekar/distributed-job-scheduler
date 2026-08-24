CREATE TABLE IF NOT EXISTS queues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  project_id UUID NOT NULL
    REFERENCES projects(id)
    ON DELETE CASCADE,

  name TEXT NOT NULL,

  concurrency_limit INT NOT NULL DEFAULT 10,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (project_id, name)
);
