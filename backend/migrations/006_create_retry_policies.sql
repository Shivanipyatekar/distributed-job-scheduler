CREATE TABLE IF NOT EXISTS retry_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  queue_id UUID NOT NULL
    REFERENCES queues(id)
    ON DELETE CASCADE,

  strategy TEXT NOT NULL DEFAULT 'exponential',

  base_delay_ms INT NOT NULL DEFAULT 1000,

  max_delay_ms INT NOT NULL DEFAULT 60000,

  max_attempts INT NOT NULL DEFAULT 5,

  UNIQUE (queue_id)
);
