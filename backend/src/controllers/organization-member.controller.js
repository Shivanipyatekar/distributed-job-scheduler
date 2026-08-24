import {
  getMembers,
  addMember,
  changeMemberRole,
  deleteMember,
  transferOwnership as transferOwnershipService,
} from "../services/organization-member.service.js";
import asyncHandler from "../utils/async-handler.js";

export const getOrganizationMembers = asyncHandler(
  async (req, res) => {
    const members = await getMembers({
      organizationId: req.params.organizationId,
      authenticatedUserId: req.user.id,
    });

    res.status(200).json({
      success: true,
      message: "Organization members retrieved successfully",
      data: {
        members,
      },
    });
  }
);

export const addOrganizationMember = asyncHandler(
  async (req, res) => {
    const member = await addMember({
      organizationId: req.params.organizationId,
      authenticatedUserId: req.user.id,
      email: req.body.email,
      role: req.body.role,
    });

    res.status(201).json({
      success: true,
      message: "Organization member added successfully",
      data: {
        member,
      },
    });
  }
);

export const updateOrganizationMemberRole = asyncHandler(
  async (req, res) => {
    const member = await changeMemberRole({
      organizationId: req.params.organizationId,
      authenticatedUserId: req.user.id,
      userId: req.params.userId,
      role: req.body.role,
    });

    res.status(200).json({
      success: true,
      message: "Organization member role updated successfully",
      data: {
        member,
      },
    });
  }
);

export const removeOrganizationMember = asyncHandler(
  async (req, res) => {
    const member = await deleteMember({
      organizationId: req.params.organizationId,
      authenticatedUserId: req.user.id,
      userId: req.params.userId,
    });

    res.status(200).json({
      success: true,
      message: "Organization member removed successfully",
      data: {
        member,
      },
    });
  }
);
export const transferOrganizationOwnership = asyncHandler(
  async (req, res) => {
    const organization = await transferOwnershipService({
      organizationId: req.params.organizationId,
      authenticatedUserId: req.user.id,
      newOwnerId: req.body.newOwnerId,
    });

    res.status(200).json({
      success: true,
      message: "Organization ownership transferred successfully",
      data: {
        organization,
      },
    });
  }
);
