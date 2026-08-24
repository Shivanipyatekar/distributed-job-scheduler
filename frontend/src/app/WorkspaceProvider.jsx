import { useState } from "react";
import useAuth from "../features/auth/useAuth";
import WorkspaceContext from "./WorkspaceContext";

const emptyWorkspace = {
  selectedOrganizationId: null,
  selectedProjectId: null,
};

const getStorageKey = (userId) => {
  return `job_scheduler_workspace_${userId}`;
};

const getStoredWorkspace = (userId) => {
  if (!userId) {
    return { ...emptyWorkspace };
  }

  const storageKey = getStorageKey(userId);
  const storedWorkspace = localStorage.getItem(storageKey);

  if (!storedWorkspace) {
    return { ...emptyWorkspace };
  }

  try {
    return {
      ...emptyWorkspace,
      ...JSON.parse(storedWorkspace),
    };
  } catch {
    localStorage.removeItem(storageKey);
    return { ...emptyWorkspace };
  }
};

const WorkspaceState = ({
  children,
  userId,
}) => {
  const [workspace, setWorkspace] = useState(() =>
    getStoredWorkspace(userId),
  );

  const updateWorkspace = (updater) => {
    setWorkspace((currentWorkspace) => {
      const nextWorkspace =
        typeof updater === "function"
          ? updater(currentWorkspace)
          : updater;

      if (userId) {
        localStorage.setItem(
          getStorageKey(userId),
          JSON.stringify(nextWorkspace),
        );
      }

      return nextWorkspace;
    });
  };

  const selectOrganization = (organizationId) => {
    updateWorkspace({
      selectedOrganizationId: organizationId,
      selectedProjectId: null,
    });
  };

  const selectProject = (projectId) => {
    updateWorkspace((currentWorkspace) => ({
      ...currentWorkspace,
      selectedProjectId: projectId,
    }));
  };

  const clearProject = () => {
    updateWorkspace((currentWorkspace) => ({
      ...currentWorkspace,
      selectedProjectId: null,
    }));
  };

  const clearWorkspace = () => {
    if (userId) {
      localStorage.removeItem(getStorageKey(userId));
    }

    setWorkspace({ ...emptyWorkspace });
  };

  const value = {
    ...workspace,
    selectOrganization,
    selectProject,
    clearProject,
    clearWorkspace,
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
};

const WorkspaceProvider = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.id || null;

  return (
    <WorkspaceState
      key={userId || "guest"}
      userId={userId}
    >
      {children}
    </WorkspaceState>
  );
};

export default WorkspaceProvider;
