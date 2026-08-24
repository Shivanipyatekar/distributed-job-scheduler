CREATE TABLE IF NOT EXISTS workers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  hostname TEXT NOT NULL,

  pid INT NOT NULL,

  status TEXT NOT NULL DEFAULT 'online',

  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_workers_status
ON workers(status)
WHERE status <> 'offline';
