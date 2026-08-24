import { pool } from "../config/database.js";

export const createOrganization = async ({ name, slug, ownerId }) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const organizationResult = await client.query(
      `
        INSERT INTO organizations (name, slug, owner_id)
        VALUES ($1, $2, $3)
        RETURNING id, name, slug, owner_id, created_at
      `,
      [name, slug, ownerId]
    );

    const organization = organizationResult.rows[0];

    await client.query(
      `
        INSERT INTO organization_members (
          organization_id,
          user_id,
          role
        )
        VALUES ($1, $2, 'owner')
      `,
      [organization.id, ownerId]
    );

    await client.query("COMMIT");

    return {
      ...organization,
      role: "owner",
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const findOrganizationBySlug = async (slug) => {
  const result = await pool.query(
    `
      SELECT id, name, slug, owner_id, created_at
      FROM organizations
      WHERE slug = $1
    `,
    [slug]
  );

  return result.rows[0] ?? null;
};

export const findOrganizationsByUserId = async (userId) => {
  const result = await pool.query(
    `
      SELECT
        o.id,
        o.name,
        o.slug,
        o.owner_id,
        o.created_at,
        om.role,
        om.joined_at
      FROM organizations o
      INNER JOIN organization_members om
        ON om.organization_id = o.id
      WHERE om.user_id = $1
      ORDER BY o.created_at DESC
    `,
    [userId]
  );

  return result.rows;
};

export const findOrganizationByIdForUser = async (
  organizationId,
  userId
) => {
  const result = await pool.query(
    `
      SELECT
        o.id,
        o.name,
        o.slug,
        o.owner_id,
        o.created_at,
        om.role,
        om.joined_at
      FROM organizations o
      INNER JOIN organization_members om
        ON om.organization_id = o.id
      WHERE o.id = $1
        AND om.user_id = $2
    `,
    [organizationId, userId]
  );

  return result.rows[0] ?? null;
};

export const transferOrganizationOwnership = async ({
  organizationId,
  currentOwnerId,
  newOwnerId,
}) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const newOwnerMembership = await client.query(
      `
        SELECT user_id
        FROM organization_members
        WHERE organization_id = $1
          AND user_id = $2
        FOR UPDATE
      `,
      [organizationId, newOwnerId]
    );

    if (newOwnerMembership.rowCount === 0) {
      await client.query("ROLLBACK");
      return null;
    }

    const organizationResult = await client.query(
      `
        UPDATE organizations
        SET owner_id = $2
        WHERE id = $1
          AND owner_id = $3
        RETURNING id, name, slug, owner_id, created_at
      `,
      [organizationId, newOwnerId, currentOwnerId]
    );

    if (organizationResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return null;
    }

    await client.query(
      `
        UPDATE organization_members
        SET role = 'admin'
        WHERE organization_id = $1
          AND user_id = $2
      `,
      [organizationId, currentOwnerId]
    );

    await client.query(
      `
        UPDATE organization_members
        SET role = 'owner'
        WHERE organization_id = $1
          AND user_id = $2
      `,
      [organizationId, newOwnerId]
    );

    await client.query("COMMIT");

    return organizationResult.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
