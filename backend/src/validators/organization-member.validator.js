import { body, param } from "express-validator";

export const organizationIdValidator = [
  param("organizationId")
    .isUUID()
    .withMessage("A valid organization ID is required"),
];

export const addOrganizationMemberValidator = [
  ...organizationIdValidator,

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Member email is required")
    .bail()
    .isEmail()
    .withMessage("A valid email address is required")
    .normalizeEmail(),

  body("role")
    .optional()
    .isIn(["admin", "member"])
    .withMessage("Role must be either admin or member"),
];

export const updateOrganizationMemberRoleValidator = [
  ...organizationIdValidator,

  param("userId")
    .isUUID()
    .withMessage("A valid user ID is required"),

  body("role")
    .notEmpty()
    .withMessage("Role is required")
    .bail()
    .isIn(["admin", "member"])
    .withMessage("Role must be either admin or member"),
];

export const removeOrganizationMemberValidator = [
  ...organizationIdValidator,

  param("userId")
    .isUUID()
    .withMessage("A valid user ID is required"),
];

export const transferOrganizationOwnershipValidator = [
  ...organizationIdValidator,

  body("newOwnerId")
    .notEmpty()
    .withMessage("New owner ID is required")
    .bail()
    .isUUID()
    .withMessage("A valid new owner ID is required"),
];
