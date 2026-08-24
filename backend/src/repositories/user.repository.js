import { pool } from "../config/database.js";

export const findUserByEmail = async (email) => {
  const query = `
    SELECT id, email, password_hash, name, created_at, updated_at
    FROM users
    WHERE email = $1
    LIMIT 1
  `;

  const { rows } = await pool.query(query, [email]);

  return rows[0] ?? null;
};

export const createUser = async ({ name, email, passwordHash }) => {
  const query = `
    INSERT INTO users (name, email, password_hash)
    VALUES ($1, $2, $3)
    RETURNING id, name, email, created_at, updated_at
  `;

  const { rows } = await pool.query(query, [
    name,
    email,
    passwordHash,
  ]);

  return rows[0];
};
