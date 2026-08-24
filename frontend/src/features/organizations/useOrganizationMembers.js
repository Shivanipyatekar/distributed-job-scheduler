import {
  useQuery,
} from "@tanstack/react-query";

import {
  getOrganizationMembers,
} from "./organizationMemberApi";

export const organizationMemberKeys = {
  all: ["organization-members"],

  lists: () => [
    ...organizationMemberKeys.all,
    "list",
  ],

  list: (organizationId) => [
    ...organizationMemberKeys.lists(),
    organizationId,
  ],
};

export const useOrganizationMembers = (
  organizationId
) =>
  useQuery({
    queryKey:
      organizationMemberKeys.list(
        organizationId
      ),

    queryFn: () =>
      getOrganizationMembers(
        organizationId
      ),

    enabled: Boolean(
      organizationId
    ),
  });
