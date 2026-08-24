import {
  createProject as createProjectService,
  getOrganizationProjects,
  getProjectById,
  updateProject as updateProjectService,
  rotateProjectApiKey as rotateProjectApiKeyService,
  removeProject,
} from "../services/project.service.js";
import asyncHandler from "../utils/async-handler.js";

export const createProject = asyncHandler(
  async (req, res) => {
    const project = await createProjectService({
      organizationId: req.params.organizationId,
      userId: req.user.id,
      name: req.body.name,
    });

    res.status(201).json({
      success: true,
      message:
        "Project created successfully. Save the API key because it will not be shown again.",
      data: {
        project,
      },
    });
  }
);

export const getProjects = asyncHandler(
  async (req, res) => {
    const projects = await getOrganizationProjects({
      organizationId: req.params.organizationId,
      userId: req.user.id,
    });

    res.status(200).json({
      success: true,
      message: "Projects retrieved successfully",
      data: {
        projects,
      },
    });
  }
);

export const getProject = asyncHandler(
  async (req, res) => {
    const project = await getProjectById({
      projectId: req.params.projectId,
      userId: req.user.id,
    });

    res.status(200).json({
      success: true,
      message: "Project retrieved successfully",
      data: {
        project,
      },
    });
  }
);

export const updateProject = asyncHandler(
  async (req, res) => {
    const project = await updateProjectService({
      projectId: req.params.projectId,
      userId: req.user.id,
      name: req.body.name,
    });

    res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data: {
        project,
      },
    });
  }
);

export const rotateProjectApiKey = asyncHandler(
  async (req, res) => {
    const project = await rotateProjectApiKeyService({
      projectId: req.params.projectId,
      userId: req.user.id,
    });

    res.status(200).json({
      success: true,
      message:
        "Project API key rotated successfully. Save the new key because it will not be shown again.",
      data: {
        project,
      },
    });
  }
);

export const deleteProject = asyncHandler(
  async (req, res) => {
    const project = await removeProject({
      projectId: req.params.projectId,
      userId: req.user.id,
    });

    res.status(200).json({
      success: true,
      message: "Project deleted successfully",
      data: {
        project,
      },
    });
  }
);
