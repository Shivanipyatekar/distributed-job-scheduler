CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  organization_id UUID NOT NULL
    REFERENCES organizations(id)
    ON DELETE CASCADE,

  name TEXT NOT NULL,

  api_key_hash TEXT NOT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (organization_id, name)
);

CREATE INDEX IF NOT EXISTS idx_projects_org
ON projects(organization_id);
