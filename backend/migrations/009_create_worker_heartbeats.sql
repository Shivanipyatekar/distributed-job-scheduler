CREATE TABLE IF NOT EXISTS worker_heartbeats (
  id BIGSERIAL PRIMARY KEY,

  worker_id UUID NOT NULL
    REFERENCES workers(id)
    ON DELETE CASCADE,

  heartbeat_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  cpu_pct REAL,

  memory_mb INT
);

CREATE INDEX IF NOT EXISTS idx_heartbeats_worker_time
ON worker_heartbeats(worker_id, heartbeat_at DESC);
