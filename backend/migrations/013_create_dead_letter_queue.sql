CREATE TABLE IF NOT EXISTS dead_letter_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  job_id UUID NOT NULL
    REFERENCES jobs(id)
    ON DELETE CASCADE,

  queue_id UUID NOT NULL
    REFERENCES queues(id)
    ON DELETE CASCADE,

  payload JSONB NOT NULL,

  failure_reason TEXT,

  attempts_made INT NOT NULL,

  failed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dlq_queue_time
ON dead_letter_queue(queue_id, failed_at DESC);
