CREATE TABLE IF NOT EXISTS job_logs (
  id BIGSERIAL PRIMARY KEY,

  job_id UUID NOT NULL
    REFERENCES jobs(id)
    ON DELETE CASCADE,

  execution_id UUID
    REFERENCES job_executions(id)
    ON DELETE CASCADE,

  level TEXT NOT NULL DEFAULT 'info',

  message TEXT NOT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_logs_job_time
ON job_logs(job_id, created_at);
