import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createOrganization,
  getOrganization,
  getOrganizations,
  organizationKeys,
} from "./organizationApi";

export const useOrganizations = () => {
  return useQuery({
    queryKey: organizationKeys.all,
    queryFn: getOrganizations,
  });
};

export const useOrganization = (organizationId) => {
  return useQuery({
    queryKey: organizationKeys.detail(organizationId),
    queryFn: () => getOrganization(organizationId),
    enabled: Boolean(organizationId),
  });
};

export const useCreateOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOrganization,
    onSuccess: (organization) => {
      queryClient.setQueryData(
        organizationKeys.detail(organization.id),
        organization,
      );

      queryClient.invalidateQueries({
        queryKey: organizationKeys.all,
      });
    },
  });
};
