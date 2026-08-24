import { Router } from "express";
import {
  createOrganization,
  getOrganizations,
  getOrganization,
} from "../controllers/organization.controller.js";
import { createOrganizationValidator } from "../validators/organization.validator.js";
import {
  getOrganizationMembers,
  addOrganizationMember,
  updateOrganizationMemberRole,
  removeOrganizationMember,
  transferOrganizationOwnership,
} from "../controllers/organization-member.controller.js";

import {
  organizationIdValidator,
  addOrganizationMemberValidator,
  updateOrganizationMemberRoleValidator,
  removeOrganizationMemberValidator,
  transferOrganizationOwnershipValidator,
} from "../validators/organization-member.validator.js";
import authenticate from "../middleware/auth.middleware.js";
import validateRequest from "../middleware/validate-request.middleware.js";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  createOrganizationValidator,
  validateRequest,
  createOrganization
);

router.get("/", getOrganizations);

router.get(
  "/:organizationId/members",
  organizationIdValidator,
  validateRequest,
  getOrganizationMembers
);

router.post(
  "/:organizationId/members",
  addOrganizationMemberValidator,
  validateRequest,
  addOrganizationMember
);

router.patch(
  "/:organizationId/members/:userId/role",
  updateOrganizationMemberRoleValidator,
  validateRequest,
  updateOrganizationMemberRole
);

router.delete(
  "/:organizationId/members/:userId",
  removeOrganizationMemberValidator,
  validateRequest,
  removeOrganizationMember
);

router.patch(
  "/:organizationId/ownership",
  transferOrganizationOwnershipValidator,
  validateRequest,
  transferOrganizationOwnership
);
router.get("/:organizationId", getOrganization);

export default router;
