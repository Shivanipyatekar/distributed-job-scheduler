import { body } from "express-validator";

export const createOrganizationValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Organization name is required")
    .bail()
    .isLength({ min: 2, max: 100 })
    .withMessage(
      "Organization name must be between 2 and 100 characters"
    ),

  body("slug")
    .trim()
    .notEmpty()
    .withMessage("Organization slug is required")
    .bail()
    .isLength({ min: 3, max: 63 })
    .withMessage("Slug must be between 3 and 63 characters")
    .bail()
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage(
      "Slug can contain lowercase letters, numbers, and single hyphens only"
    ),
];
