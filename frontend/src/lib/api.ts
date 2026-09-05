import axios from "axios";

export const TOKEN_STORAGE_KEY = "mittyboard.token";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/** Fired when the API rejects a request as unauthenticated, so the app can log the user out. */
export const AUTH_LOGOUT_EVENT = "mittyboard:unauthorized";

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      window.dispatchEvent(new CustomEvent(AUTH_LOGOUT_EVENT));
    }
    return Promise.reject(error);
  },
);

/** Best-effort extraction of a human-readable message from a failed API call. */
export function apiErrorMessage(error: unknown, fallback = "Something went wrong."): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; error?: string } | undefined;
    if (data?.message) return data.message;
    if (data?.error) return data.error;
    if (error.response?.status === 401) return "Your session has expired. Please log in again.";
    if (error.message === "Network Error") {
      return "Can't reach the server. Is the backend running?";
    }
  }
  return fallback;
}
