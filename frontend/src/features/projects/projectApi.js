import apiClient from "../../api/client";

export const projectKeys = {
  all: ["projects"],
  byOrganization: (organizationId) => [
    "projects",
    "organization",
    organizationId,
  ],
  detail: (projectId) => ["projects", projectId],
};

export const getProjects = async (organizationId) => {
  const response = await apiClient.get(
    `/organizations/${organizationId}/projects`,
  );

  return response.data.data.projects;
};

export const getProject = async (projectId) => {
  const response = await apiClient.get(`/projects/${projectId}`);

  return response.data.data.project;
};

export const createProject = async ({
  organizationId,
  name,
}) => {
  const response = await apiClient.post(
    `/organizations/${organizationId}/projects`,
    { name },
  );

  return {
    project: response.data.data.project,
    message: response.data.message,
  };
};

export const updateProject = async ({ projectId, name }) => {
  const response = await apiClient.patch(
    `/projects/${projectId}`,
    { name },
  );

  return response.data.data.project;
};

export const rotateProjectApiKey = async (projectId) => {
  const response = await apiClient.post(
    `/projects/${projectId}/api-key/rotate`,
  );

  return {
    project: response.data.data.project,
    message: response.data.message,
  };
};

export const deleteProject = async (projectId) => {
  const response = await apiClient.delete(
    `/projects/${projectId}`,
  );

  return response.data.data.project;
};
