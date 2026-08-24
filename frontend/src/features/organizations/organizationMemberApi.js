import api from "../../api/client";

export const getOrganizationMembers = async (
  organizationId
) => {
  const response = await api.get(
    `/organizations/${organizationId}/members`
  );

  return (
    response.data.data?.members ?? []
  );
};

export const addOrganizationMember = async ({
  organizationId,
  email,
  role,
}) => {
  const response = await api.post(
    `/organizations/${organizationId}/members`,
    {
      email,
      role,
    }
  );

  return response.data.data?.member;
};

export const updateOrganizationMemberRole =
  async ({
    organizationId,
    userId,
    role,
  }) => {
    const response = await api.patch(
      `/organizations/${organizationId}/members/${userId}/role`,
      {
        role,
      }
    );

    return response.data.data?.member;
  };

export const removeOrganizationMember =
  async ({
    organizationId,
    userId,
  }) => {
    const response = await api.delete(
      `/organizations/${organizationId}/members/${userId}`
    );

    return response.data.data?.member;
  };

export const transferOrganizationOwnership =
  async ({
    organizationId,
    newOwnerId,
  }) => {
    const response = await api.patch(
      `/organizations/${organizationId}/ownership`,
      {
        newOwnerId,
      }
    );

    return response.data.data?.organization;
  };
