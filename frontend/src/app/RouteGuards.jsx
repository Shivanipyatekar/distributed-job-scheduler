import { Navigate, useLocation } from "react-router";
import useAuth from "../features/auth/useAuth";
import useWorkspace from "./useWorkspace";

export const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  return children;
};

export const GuestRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export const OrganizationRequiredRoute = ({ children }) => {
  const { selectedOrganizationId } = useWorkspace();

  if (!selectedOrganizationId) {
    return <Navigate to="/organizations" replace />;
  }

  return children;
};

export const ProjectRequiredRoute = ({ children }) => {
  const {
    selectedOrganizationId,
    selectedProjectId,
  } = useWorkspace();

  if (!selectedOrganizationId) {
    return <Navigate to="/organizations" replace />;
  }

  if (!selectedProjectId) {
    return <Navigate to="/projects" replace />;
  }

  return children;
};
