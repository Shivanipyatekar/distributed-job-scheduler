import { TOKEN_STORAGE_KEY } from "../../api/client";

const USER_STORAGE_KEY = "job_scheduler_user";

export const getStoredToken = () => {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
};

export const getStoredUser = () => {
  const storedUser = localStorage.getItem(USER_STORAGE_KEY);

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser);
  } catch {
    localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }
};

export const saveAuthSession = ({ user, token }) => {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
};

export const clearAuthSession = () => {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
};
