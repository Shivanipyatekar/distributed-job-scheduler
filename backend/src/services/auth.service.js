import {
  createUser,
  findUserByEmail,
} from "../repositories/user.repository.js";
import {
  hashPassword,
  comparePassword,
} from "../utils/password.js";
import { generateToken } from "../utils/jwt.js";
import AppError from "../utils/app-error.js";

export const registerUser = async ({ name, email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await findUserByEmail(normalizedEmail);

  if (existingUser) {
    throw new AppError("An account with this email already exists", 409);
  }

  const passwordHash = await hashPassword(password);

  let user;

  try {
    user = await createUser({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
    });
  } catch (error) {
    // Handles simultaneous registrations using the same email.
    if (error.code === "23505") {
      throw new AppError("An account with this email already exists", 409);
    }

    throw error;
  }

  const token = generateToken(user.id);

  return { user, token };
};

export const loginUser = async ({ email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await findUserByEmail(normalizedEmail);

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const passwordMatches = await comparePassword(
    password,
    user.password_hash
  );

  if (!passwordMatches) {
    throw new AppError("Invalid email or password", 401);
  }

  const { password_hash, ...safeUser } = user;

  const token = generateToken(user.id);

  return {
    user: safeUser,
    token,
  };
};
