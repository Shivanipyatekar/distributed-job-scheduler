CREATE TABLE IF NOT EXISTS scheduled_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  queue_id UUID NOT NULL
    REFERENCES queues(id)
    ON DELETE CASCADE,

  cron_expression TEXT NOT NULL,

  payload_template JSONB NOT NULL DEFAULT '{}',

  is_active BOOLEAN NOT NULL DEFAULT true,

  next_run_at TIMESTAMPTZ NOT NULL,

  last_run_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_scheduled_due
ON scheduled_jobs(next_run_at)
WHERE is_active;
