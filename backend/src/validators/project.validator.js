import { body, param } from "express-validator";

export const organizationProjectValidator = [
  param("organizationId")
    .isUUID()
    .withMessage("A valid organization ID is required"),
];

export const createProjectValidator = [
  ...organizationProjectValidator,

  body("name")
    .trim()
    .notEmpty()
    .withMessage("Project name is required")
    .bail()
    .isLength({ min: 2, max: 100 })
    .withMessage(
      "Project name must be between 2 and 100 characters"
    ),
];

export const projectIdValidator = [
  param("projectId")
    .isUUID()
    .withMessage("A valid project ID is required"),
];

export const updateProjectValidator = [
  ...projectIdValidator,

  body("name")
    .trim()
    .notEmpty()
    .withMessage("Project name is required")
    .bail()
    .isLength({ min: 2, max: 100 })
    .withMessage(
      "Project name must be between 2 and 100 characters"
    ),
];
