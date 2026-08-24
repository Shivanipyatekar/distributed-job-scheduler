import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createProject,
  deleteProject,
  getProject,
  getProjects,
  projectKeys,
  rotateProjectApiKey,
  updateProject,
} from "./projectApi";

const removeApiKey = (project) => {
  const safeProject = { ...project };
  delete safeProject.api_key;

  return safeProject;
};

export const useProjects = (organizationId) => {
  return useQuery({
    queryKey: projectKeys.byOrganization(organizationId),
    queryFn: () => getProjects(organizationId),
    enabled: Boolean(organizationId),
  });
};

export const useProject = (projectId) => {
  return useQuery({
    queryKey: projectKeys.detail(projectId),
    queryFn: () => getProject(projectId),
    enabled: Boolean(projectId),
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProject,
    onSuccess: ({ project }, variables) => {
      const safeProject = removeApiKey(project);
      queryClient.setQueryData(
        projectKeys.detail(project.id),
        safeProject,
      );

      queryClient.invalidateQueries({
        queryKey: projectKeys.byOrganization(
          variables.organizationId,
        ),
      });
    },
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProject,
    onSuccess: (project) => {
      queryClient.setQueryData(
        projectKeys.detail(project.id),
        project,
      );

      queryClient.invalidateQueries({
        queryKey: projectKeys.byOrganization(
          project.organization_id,
        ),
      });
    },
  });
};

export const useRotateProjectApiKey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rotateProjectApiKey,
    onSuccess: ({ project }) => {
      	const safeProject=removeApiKey(project);
	queryClient.setQueryData(
        projectKeys.detail(project.id),
        safeProject,
      );

      queryClient.invalidateQueries({
        queryKey: projectKeys.byOrganization(
          project.organization_id,
        ),
      });
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProject,
    onSuccess: (project) => {
      queryClient.removeQueries({
        queryKey: projectKeys.detail(project.id),
      });

      queryClient.invalidateQueries({
        queryKey: projectKeys.byOrganization(
          project.organization_id,
        ),
      });
    },
  });
};
