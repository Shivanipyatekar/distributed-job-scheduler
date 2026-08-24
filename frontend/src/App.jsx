import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import {
  GuestRoute,
  OrganizationRequiredRoute,
  ProjectRequiredRoute,
  ProtectedRoute,
} from "./app/RouteGuards";

import useWorkspace from "./app/useWorkspace";

import LoginPage from "./features/auth/LoginPage";
import RegisterPage from "./features/auth/RegisterPage";
import useAuth from "./features/auth/useAuth";

import DashboardPage from "./features/dashboard/DashboardPage";
import JobDetailsPage from "./features/jobs/JobDetailsPage";
import JobsPage from "./features/jobs/JobsPage";
import OrganizationsPage from "./features/organizations/OrganizationsPage";
import ProjectsPage from "./features/projects/ProjectsPage";
import QueuesPage from "./features/queues/QueuesPage";
import SchedulesPage from "./features/schedules/SchedulesPage";
import WorkersPage from "./features/workers/WorkersPage";
import WorkerDetailsPage from "./features/workers/WorkerDetailsPage";
import DeadLetterPage from "./features/deadLetter/DeadLetterPage";
import DeadLetterDetailsPage from "./features/deadLetter/DeadLetterDetailsPage";
import ApiDocsPage from "./features/apiDocs/ApiDocsPage";

const App = () => {
  const { isAuthenticated } = useAuth();

  const {
    selectedOrganizationId,
    selectedProjectId,
  } = useWorkspace();

  let defaultRoute = "/login";

  if (
    isAuthenticated &&
    !selectedOrganizationId
  ) {
    defaultRoute = "/organizations";
  } else if (
    isAuthenticated &&
    !selectedProjectId
  ) {
    defaultRoute = "/projects";
  } else if (isAuthenticated) {
    defaultRoute = "/dashboard";
  }

  return (
    <Routes>
      {/* Authentication */}

      <Route
        path="/login"
        element={
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        }
      />

      <Route
        path="/register"
        element={
          <GuestRoute>
            <RegisterPage />
          </GuestRoute>
        }
      />

      {/* Organizations */}

      <Route
        path="/organizations"
        element={
          <ProtectedRoute>
            <OrganizationsPage />
          </ProtectedRoute>
        }
      />

      {/* Projects */}

      <Route
        path="/projects"
        element={
          <ProtectedRoute>
            <OrganizationRequiredRoute>
              <ProjectsPage />
            </OrganizationRequiredRoute>
          </ProtectedRoute>
        }
      />

      {/* Dashboard */}

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <ProjectRequiredRoute>
              <DashboardPage />
            </ProjectRequiredRoute>
          </ProtectedRoute>
        }
      />

      {/* Queues */}

      <Route
        path="/queues"
        element={
          <ProtectedRoute>
            <ProjectRequiredRoute>
              <QueuesPage />
            </ProjectRequiredRoute>
          </ProtectedRoute>
        }
      />

      {/* Jobs */}

      <Route
        path="/jobs"
        element={
          <ProtectedRoute>
            <ProjectRequiredRoute>
              <JobsPage />
            </ProjectRequiredRoute>
          </ProtectedRoute>
        }
      />

      {/* Job details */}

      <Route
        path="/queues/:queueId/jobs/:jobId"
        element={
          <ProtectedRoute>
            <ProjectRequiredRoute>
              <JobDetailsPage />
            </ProjectRequiredRoute>
          </ProtectedRoute>
        }
      />

      {/* Schedules */}

      <Route
        path="/schedules"
        element={
          <ProtectedRoute>
            <ProjectRequiredRoute>
              <SchedulesPage />
            </ProjectRequiredRoute>
          </ProtectedRoute>
        }
      />

<Route
  path="/workers"
  element={
    <ProtectedRoute>
      <ProjectRequiredRoute>
        <WorkersPage />
      </ProjectRequiredRoute>
    </ProtectedRoute>
  }
/>

<Route
  path="/workers/:workerId"
  element={
    <ProtectedRoute>
      <ProjectRequiredRoute>
        <WorkerDetailsPage />
      </ProjectRequiredRoute>
    </ProtectedRoute>
  }
/>

<Route
  path="/dead-letter"
  element={
    <ProtectedRoute>
      <ProjectRequiredRoute>
        <DeadLetterPage />
      </ProjectRequiredRoute>
    </ProtectedRoute>
  }
/>

<Route
  path="/api-docs"
  element={
    <ProtectedRoute>
      <ProjectRequiredRoute>
        <ApiDocsPage />
      </ProjectRequiredRoute>
    </ProtectedRoute>
  }
/>
<Route
  path="/queues/:queueId/dead-letter/:deadLetterId"
  element={
    <ProtectedRoute>
      <ProjectRequiredRoute>
        <DeadLetterDetailsPage />
      </ProjectRequiredRoute>
    </ProtectedRoute>
  }
/>

      {/* Default */}

      <Route
        path="/"
        element={
          <Navigate
            to={defaultRoute}
            replace
          />
        }
      />

      {/* Unknown routes */}

      <Route
        path="*"
        element={
          <Navigate
            to={defaultRoute}
            replace
          />
        }
      />
    </Routes>
  );
};

export default App;
