import {
  createOrganization as createOrganizationService,
  getUserOrganizations,
  getOrganizationById,
} from "../services/organization.service.js";
import asyncHandler from "../utils/async-handler.js";

export const createOrganization = asyncHandler(
  async (req, res) => {
    const organization = await createOrganizationService({
      name: req.body.name,
      slug: req.body.slug,
      ownerId: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Organization created successfully",
      data: {
        organization,
      },
    });
  }
);

export const getOrganizations = asyncHandler(
  async (req, res) => {
    const organizations = await getUserOrganizations(req.user.id);

    res.status(200).json({
      success: true,
      message: "Organizations retrieved successfully",
      data: {
        organizations,
      },
    });
  }
);

export const getOrganization = asyncHandler(
  async (req, res) => {
    const organization = await getOrganizationById({
      organizationId: req.params.organizationId,
      userId: req.user.id,
    });

    res.status(200).json({
      success: true,
      message: "Organization retrieved successfully",
      data: {
        organization,
      },
    });
  }
);
