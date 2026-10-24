import axios from "axios";
import { getToken, clearToken } from "../utils/auth";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
});

// A wrong password on login/register must not trigger a redirect or reload
const AUTH_PATHS = ["/auth/login", "/auth/register"];

// Attach the token in Bearer format
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || "";
    const isAuthRequest = AUTH_PATHS.some((p) => url.includes(p));

    if (status === 401 && !isAuthRequest) {
      clearToken();
      const onAuthPage = ["/login", "/register"].includes(window.location.pathname);
      if (!onAuthPage) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;