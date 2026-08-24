import apiClient from "../../api/client";

export const organizationKeys = {
  all: ["organizations"],
  detail: (organizationId) => [
    "organizations",
    organizationId,
  ],
};

export const getOrganizations = async () => {
  const response = await apiClient.get("/organizations");

  return response.data.data.organizations;
};

export const getOrganization = async (organizationId) => {
  const response = await apiClient.get(
    `/organizations/${organizationId}`,
  );

  return response.data.data.organization;
};

export const createOrganization = async ({ name, slug }) => {
  const response = await apiClient.post("/organizations", {
    name,
    slug,
  });

  return response.data.data.organization;
};
