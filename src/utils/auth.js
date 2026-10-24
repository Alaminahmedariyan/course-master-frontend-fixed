const TOKEN_KEY = "token";

export const saveToken = (token) => {
  if (token) localStorage.setItem(TOKEN_KEY, token);
};

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  // Remove legacy and dev-only keys as well
  localStorage.removeItem("user_token");
  localStorage.removeItem("dev_bypass");
};