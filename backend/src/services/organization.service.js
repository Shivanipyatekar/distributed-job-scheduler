import {
  createOrganization as createOrganizationRecord,
  findOrganizationBySlug,
  findOrganizationsByUserId,
  findOrganizationByIdForUser,
} from "../repositories/organization.repository.js";
import AppError from "../utils/app-error.js";

export const createOrganization = async ({
  name,
  slug,
  ownerId,
}) => {
  const existingOrganization = await findOrganizationBySlug(slug);

  if (existingOrganization) {
    throw new AppError(
      "An organization with this slug already exists",
      409
    );
  }

  try {
    return await createOrganizationRecord({
      name,
      slug,
      ownerId,
    });
  } catch (error) {
    // Handles concurrent requests attempting to use the same slug.
    if (error.code === "23505") {
      throw new AppError(
        "An organization with this slug already exists",
        409
      );
    }

    throw error;
  }
};

export const getUserOrganizations = async (userId) => {
  return findOrganizationsByUserId(userId);
};

export const getOrganizationById = async ({
  organizationId,
  userId,
}) => {
  const organization = await findOrganizationByIdForUser(
    organizationId,
    userId
  );

  if (!organization) {
    throw new AppError("Organization not found", 404);
  }

  return organization;
};
