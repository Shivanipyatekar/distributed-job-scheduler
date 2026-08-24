import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import AuthContext from "./AuthContext";
import { loginUser, registerUser } from "./authApi";
import {
  clearAuthSession,
  getStoredToken,
  getStoredUser,
  saveAuthSession,
} from "./authStorage";

const createInitialSession = () => {
  const token = getStoredToken();
  const user = getStoredUser();

  if (!token || !user) {
    clearAuthSession();
    return { user: null, token: null };
  }

  return { user, token };
};

const AuthProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const [session, setSession] = useState(createInitialSession);

  const applyAuthResponse = useCallback((response) => {
    const user = response?.data?.user;
    const token = response?.data?.token;

    if (!user || !token) {
      throw new Error("The server returned an invalid authentication response");
    }

    saveAuthSession({ user, token });
    setSession({ user, token });

    return response;
  }, []);

  const login = useCallback(
    async (credentials) => {
      const response = await loginUser(credentials);
      return applyAuthResponse(response);
    },
    [applyAuthResponse],
  );

  const register = useCallback(
    async (userData) => {
      const response = await registerUser(userData);
      return applyAuthResponse(response);
    },
    [applyAuthResponse],
  );

  const logout = useCallback(() => {
    clearAuthSession();
    setSession({ user: null, token: null });
    queryClient.clear();
  }, [queryClient]);

  useEffect(() => {
    window.addEventListener("auth:unauthorized", logout);

    return () => {
      window.removeEventListener("auth:unauthorized", logout);
    };
  }, [logout]);

  const value = useMemo(
    () => ({
      user: session.user,
      token: session.token,
      isAuthenticated: Boolean(session.user && session.token),
      login,
      register,
      logout,
    }),
    [session, login, register, logout],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
