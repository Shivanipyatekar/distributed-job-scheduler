import { pool } from "../config/database.js";

export const findOrganizationMember = async (
  organizationId,
  userId
) => {
  const result = await pool.query(
    `
      SELECT
        om.organization_id,
        om.user_id,
        om.role,
        om.joined_at,
        u.name,
        u.email
      FROM organization_members om
      INNER JOIN users u
        ON u.id = om.user_id
      WHERE om.organization_id = $1
        AND om.user_id = $2
    `,
    [organizationId, userId]
  );

  return result.rows[0] ?? null;
};

export const findOrganizationMembers = async (
  organizationId
) => {
  const result = await pool.query(
    `
      SELECT
        om.user_id,
        u.name,
        u.email,
        om.role,
        om.joined_at
      FROM organization_members om
      INNER JOIN users u
        ON u.id = om.user_id
      WHERE om.organization_id = $1
      ORDER BY om.joined_at ASC
    `,
    [organizationId]
  );

  return result.rows;
};

export const addOrganizationMember = async ({
  organizationId,
  userId,
  role,
}) => {
  const result = await pool.query(
    `
      INSERT INTO organization_members (
        organization_id,
        user_id,
        role
      )
      VALUES ($1, $2, $3)
      RETURNING organization_id, user_id, role, joined_at
    `,
    [organizationId, userId, role]
  );

  return result.rows[0];
};

export const updateOrganizationMemberRole = async ({
  organizationId,
  userId,
  role,
}) => {
  const result = await pool.query(
    `
      UPDATE organization_members
      SET role = $3
      WHERE organization_id = $1
        AND user_id = $2
      RETURNING organization_id, user_id, role, joined_at
    `,
    [organizationId, userId, role]
  );

  return result.rows[0] ?? null;
};

export const removeOrganizationMember = async (
  organizationId,
  userId
) => {
  const result = await pool.query(
    `
      DELETE FROM organization_members
      WHERE organization_id = $1
        AND user_id = $2
      RETURNING organization_id, user_id, role
    `,
    [organizationId, userId]
  );

  return result.rows[0] ?? null;
};
