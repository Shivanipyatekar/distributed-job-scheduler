import { Router } from "express";
import {
  createProject,
  getProjects,
  getProject,
  updateProject,
  rotateProjectApiKey,
  deleteProject,
} from "../controllers/project.controller.js";
import {
  createProjectValidator,
  organizationProjectValidator,
  projectIdValidator,
  updateProjectValidator,
} from "../validators/project.validator.js";
import authenticate from "../middleware/auth.middleware.js";
import validateRequest from "../middleware/validate-request.middleware.js";

const router = Router();

router.use(authenticate);

router.post(
  "/organizations/:organizationId/projects",
  createProjectValidator,
  validateRequest,
  createProject
);

router.get(
  "/organizations/:organizationId/projects",
  organizationProjectValidator,
  validateRequest,
  getProjects
);

router.get(
  "/projects/:projectId",
  projectIdValidator,
  validateRequest,
  getProject
);

router.patch(
  "/projects/:projectId",
  updateProjectValidator,
  validateRequest,
  updateProject
);

router.post(
  "/projects/:projectId/api-key/rotate",
  projectIdValidator,
  validateRequest,
  rotateProjectApiKey
);

router.delete(
  "/projects/:projectId",
  projectIdValidator,
  validateRequest,
  deleteProject
);

export default router;
