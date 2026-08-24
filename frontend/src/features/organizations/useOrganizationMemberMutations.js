import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  addOrganizationMember,
  removeOrganizationMember,
  transferOrganizationOwnership,
  updateOrganizationMemberRole,
} from "./organizationMemberApi";

import {
  organizationMemberKeys,
} from "./useOrganizationMembers";

const invalidateOrganizationData = (
  queryClient,
  organizationId
) => {
  queryClient.invalidateQueries({
    queryKey:
      organizationMemberKeys.list(
        organizationId
      ),
  });

  /*
   * Ownership transfer changes the
   * current user's organization role,
   * so refresh existing organization
   * list/detail queries too.
   */
  queryClient.invalidateQueries({
    queryKey: ["organizations"],
  });
};

export const useAddOrganizationMember = (
  organizationId
) => {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      email,
      role,
    }) =>
      addOrganizationMember({
        organizationId,
        email,
        role,
      }),

    onSuccess: () => {
      invalidateOrganizationData(
        queryClient,
        organizationId
      );
    },
  });
};

export const useUpdateOrganizationMemberRole =
  (organizationId) => {
    const queryClient =
      useQueryClient();

    return useMutation({
      mutationFn: ({
        userId,
        role,
      }) =>
        updateOrganizationMemberRole({
          organizationId,
          userId,
          role,
        }),

      onSuccess: () => {
        invalidateOrganizationData(
          queryClient,
          organizationId
        );
      },
    });
  };

export const useRemoveOrganizationMember = (
  organizationId
) => {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (userId) =>
      removeOrganizationMember({
        organizationId,
        userId,
      }),

    onSuccess: () => {
      invalidateOrganizationData(
        queryClient,
        organizationId
      );
    },
  });
};

export const useTransferOrganizationOwnership =
  (organizationId) => {
    const queryClient =
      useQueryClient();

    return useMutation({
      mutationFn: (
        newOwnerId
      ) =>
        transferOrganizationOwnership({
          organizationId,
          newOwnerId,
        }),

      onSuccess: () => {
        invalidateOrganizationData(
          queryClient,
          organizationId
        );
      },
    });
  };
