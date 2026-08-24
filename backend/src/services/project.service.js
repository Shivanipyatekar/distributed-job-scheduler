import {
  createProject as createProjectRecord,
  findProjectsByOrganizationForUser,
  findProjectByIdForUser,
  updateProjectName as updateProjectNameRecord,
updateProjectApiKeyHash,
deleteProject as deleteProjectRecord,
} from "../repositories/project.repository.js";
import { findOrganizationMember } from "../repositories/organization-member.repository.js";
import {
  generateApiKey,
  hashApiKey,
} from "../utils/api-key.js";
import AppError from "../utils/app-error.js";

const getOrganizationMembership = async (
  organizationId,
  userId
) => {
  const membership = await findOrganizationMember(
    organizationId,
    userId
  );

  if (!membership) {
    throw new AppError("Organization not found", 404);
  }

  return membership;
};

export const createProject = async ({
  organizationId,
  userId,
  name,
}) => {
  const membership = await getOrganizationMembership(
    organizationId,
    userId
  );

  if (!["owner", "admin"].includes(membership.role)) {
    throw new AppError(
      "You do not have permission to create projects",
      403
    );
  }

  const apiKey = generateApiKey();
  const apiKeyHash = hashApiKey(apiKey);

  try {
    const project = await createProjectRecord({
      organizationId,
      name,
      apiKeyHash,
    });

    return {
      ...project,
      api_key: apiKey,
    };
  } catch (error) {
    if (error.code === "23505") {
      throw new AppError(
        "A project with this name already exists in the organization",
        409
      );
    }

    throw error;
  }
};

export const getOrganizationProjects = async ({
  organizationId,
  userId,
}) => {
  await getOrganizationMembership(organizationId, userId);

  return findProjectsByOrganizationForUser(
    organizationId,
    userId
  );
};

export const getProjectById = async ({
  projectId,
  userId,
}) => {
  const project = await findProjectByIdForUser(
    projectId,
    userId
  );

  if (!project) {
    throw new AppError("Project not found", 404);
  }

  return project;
};

const getManageableProject = async (projectId, userId) => {
  const project = await findProjectByIdForUser(
    projectId,
    userId
  );

  if (!project) {
    throw new AppError("Project not found", 404);
  }

  if (!["owner", "admin"].includes(project.role)) {
    throw new AppError(
      "You do not have permission to manage this project",
      403
    );
  }

  return project;
};

export const updateProject = async ({
  projectId,
  userId,
  name,
}) => {
  await getManageableProject(projectId, userId);

  try {
    return await updateProjectNameRecord(projectId, name);
  } catch (error) {
    if (error.code === "23505") {
      throw new AppError(
        "A project with this name already exists in the organization",
        409
      );
    }

    throw error;
  }
};

export const rotateProjectApiKey = async ({
  projectId,
  userId,
}) => {
  await getManageableProject(projectId, userId);

  const apiKey = generateApiKey();
  const apiKeyHash = hashApiKey(apiKey);

  const project = await updateProjectApiKeyHash(
    projectId,
    apiKeyHash
  );

  return {
    ...project,
    api_key: apiKey,
  };
};

export const removeProject = async ({
  projectId,
  userId,
}) => {
  await getManageableProject(projectId, userId);

  return deleteProjectRecord(projectId);
};
