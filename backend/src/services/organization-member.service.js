import { findUserByEmail } from "../repositories/user.repository.js";
import {
  findOrganizationMember,
  findOrganizationMembers,
  addOrganizationMember,
  updateOrganizationMemberRole,
  removeOrganizationMember,
} from "../repositories/organization-member.repository.js";
import { transferOrganizationOwnership } from "../repositories/organization.repository.js";
import AppError from "../utils/app-error.js";

const getAuthenticatedMembership = async (
  organizationId,
  authenticatedUserId
) => {
  const membership = await findOrganizationMember(
    organizationId,
    authenticatedUserId
  );

  if (!membership) {
    throw new AppError("Organization not found", 404);
  }

  return membership;
};

export const getMembers = async ({
  organizationId,
  authenticatedUserId,
}) => {
  await getAuthenticatedMembership(
    organizationId,
    authenticatedUserId
  );

  return findOrganizationMembers(organizationId);
};

export const addMember = async ({
  organizationId,
  authenticatedUserId,
  email,
  role = "member",
}) => {
  const authenticatedMembership =
    await getAuthenticatedMembership(
      organizationId,
      authenticatedUserId
    );

  if (!["owner", "admin"].includes(authenticatedMembership.role)) {
    throw new AppError(
      "You do not have permission to add organization members",
      403
    );
  }

  if (
    authenticatedMembership.role === "admin" &&
    role === "admin"
  ) {
    throw new AppError(
      "Only the organization owner can assign the admin role",
      403
    );
  }

  const user = await findUserByEmail(email);

  if (!user) {
    throw new AppError(
      "No registered user was found with this email",
      404
    );
  }

  const existingMembership = await findOrganizationMember(
    organizationId,
    user.id
  );

  if (existingMembership) {
    throw new AppError(
      "This user is already an organization member",
      409
    );
  }

  try {
    const membership = await addOrganizationMember({
      organizationId,
      userId: user.id,
      role,
    });

    return {
      ...membership,
      name: user.name,
      email: user.email,
    };
  } catch (error) {
    if (error.code === "23505") {
      throw new AppError(
        "This user is already an organization member",
        409
      );
    }

    throw error;
  }
};
export const changeMemberRole = async ({
  organizationId,
  authenticatedUserId,
  userId,
  role,
}) => {
  const authenticatedMembership =
    await getAuthenticatedMembership(
      organizationId,
      authenticatedUserId
    );

  if (authenticatedMembership.role !== "owner") {
    throw new AppError(
      "Only the organization owner can change member roles",
      403
    );
  }

  const targetMembership = await findOrganizationMember(
    organizationId,
    userId
  );

  if (!targetMembership) {
    throw new AppError("Organization member not found", 404);
  }

  if (targetMembership.role === "owner") {
    throw new AppError(
      "The organization owner's role cannot be changed",
      400
    );
  }

  return updateOrganizationMemberRole({
    organizationId,
    userId,
    role,
  });
};

export const deleteMember = async ({
  organizationId,
  authenticatedUserId,
  userId,
}) => {
  const authenticatedMembership =
    await getAuthenticatedMembership(
      organizationId,
      authenticatedUserId
    );

  if (!["owner", "admin"].includes(authenticatedMembership.role)) {
    throw new AppError(
      "You do not have permission to remove organization members",
      403
    );
  }

  const targetMembership = await findOrganizationMember(
    organizationId,
    userId
  );

  if (!targetMembership) {
    throw new AppError("Organization member not found", 404);
  }

  if (targetMembership.role === "owner") {
    throw new AppError(
      "The organization owner cannot be removed",
      400
    );
  }

  if (
    authenticatedMembership.role === "admin" &&
    targetMembership.role === "admin"
  ) {
    throw new AppError(
      "An admin cannot remove another admin",
      403
    );
  }

  return removeOrganizationMember(organizationId, userId);
};

export const transferOwnership = async ({
  organizationId,
  authenticatedUserId,
  newOwnerId,
}) => {
  const authenticatedMembership =
    await getAuthenticatedMembership(
      organizationId,
      authenticatedUserId
    );

  if (authenticatedMembership.role !== "owner") {
    throw new AppError(
      "Only the current organization owner can transfer ownership",
      403
    );
  }

  if (authenticatedUserId === newOwnerId) {
    throw new AppError(
      "You are already the organization owner",
      400
    );
  }

  const newOwnerMembership = await findOrganizationMember(
    organizationId,
    newOwnerId
  );

  if (!newOwnerMembership) {
    throw new AppError(
      "The new owner must already be an organization member",
      400
    );
  }

  const organization = await transferOrganizationOwnership({
    organizationId,
    currentOwnerId: authenticatedUserId,
    newOwnerId,
  });

  if (!organization) {
    throw new AppError(
      "Organization ownership could not be transferred",
      409
    );
  }

  return organization;
};
