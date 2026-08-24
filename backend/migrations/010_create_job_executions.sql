CREATE TABLE IF NOT EXISTS job_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  job_id UUID NOT NULL
    REFERENCES jobs(id)
    ON DELETE CASCADE,

  worker_id UUID
    REFERENCES workers(id)
    ON DELETE SET NULL,

  attempt_no INT NOT NULL,

  status TEXT NOT NULL,

  started_at TIMESTAMPTZ NOT NULL,

  finished_at TIMESTAMPTZ,

  error TEXT,

  UNIQUE (job_id, attempt_no)
);

CREATE INDEX IF NOT EXISTS idx_executions_job
ON job_executions(job_id);
