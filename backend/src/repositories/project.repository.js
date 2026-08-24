import { pool } from "../config/database.js";

export const createProject = async ({
  organizationId,
  name,
  apiKeyHash,
}) => {
  const result = await pool.query(
    `
      INSERT INTO projects (
        organization_id,
        name,
        api_key_hash
      )
      VALUES ($1, $2, $3)
      RETURNING id, organization_id, name, created_at
    `,
    [organizationId, name, apiKeyHash]
  );

  return result.rows[0];
};

export const findProjectsByOrganizationForUser = async (
  organizationId,
  userId
) => {
  const result = await pool.query(
    `
      SELECT
        p.id,
        p.organization_id,
        p.name,
        p.created_at
      FROM projects p
      INNER JOIN organization_members om
        ON om.organization_id = p.organization_id
      WHERE p.organization_id = $1
        AND om.user_id = $2
      ORDER BY p.created_at DESC
    `,
    [organizationId, userId]
  );

  return result.rows;
};

export const findProjectByIdForUser = async (
  projectId,
  userId
) => {
  const result = await pool.query(
    `
      SELECT
        p.id,
        p.organization_id,
        p.name,
        p.created_at,
        om.role
      FROM projects p
      INNER JOIN organization_members om
        ON om.organization_id = p.organization_id
      WHERE p.id = $1
        AND om.user_id = $2
    `,
    [projectId, userId]
  );

  return result.rows[0] ?? null;
};

export const updateProjectName = async (
  projectId,
  name
) => {
  const result = await pool.query(
    `
      UPDATE projects
      SET name = $2
      WHERE id = $1
      RETURNING id, organization_id, name, created_at
    `,
    [projectId, name]
  );

  return result.rows[0] ?? null;
};

export const updateProjectApiKeyHash = async (
  projectId,
  apiKeyHash
) => {
  const result = await pool.query(
    `
      UPDATE projects
      SET api_key_hash = $2
      WHERE id = $1
      RETURNING id, organization_id, name, created_at
    `,
    [projectId, apiKeyHash]
  );

  return result.rows[0] ?? null;
};

export const deleteProject = async (projectId) => {
  const result = await pool.query(
    `
      DELETE FROM projects
      WHERE id = $1
      RETURNING id, organization_id, name
    `,
    [projectId]
  );

  return result.rows[0] ?? null;
};
