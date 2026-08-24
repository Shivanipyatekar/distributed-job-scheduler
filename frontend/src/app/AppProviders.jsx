import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router";
import AuthProvider from "../features/auth/AuthProvider";
import queryClient from "./queryClient";
import WorkspaceProvider from "./WorkspaceProvider";

const AppProviders = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <WorkspaceProvider>
            {children}
          </WorkspaceProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default AppProviders;
