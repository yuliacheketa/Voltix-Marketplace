import axios, { type AxiosInstance } from "axios";

declare const process: { env: Record<string, string | undefined> } | undefined;

function localBackendOrigin(): string | null {
  if (typeof window === "undefined") return null;
  const h = window.location.hostname;
  if (h === "localhost" || h === "127.0.0.1" || h === "[::1]") {
    return `http://${h}:4000`;
  }
  return null;
}

export function getCatalogBaseURL(): string {
  if (typeof process !== "undefined" && process?.env?.API_URL) {
    return process.env.API_URL;
  }
  return "";
}

export function getAuthBaseURL(): string {
  if (typeof process !== "undefined" && process?.env?.API_URL) {
    return process.env.API_URL;
  }
  const local = localBackendOrigin();
  if (local) return local;
  return "";
}

export function getBaseURL(): string {
  return getCatalogBaseURL();
}

const JWT_STORAGE_KEY = "voltix_jwt";

export function getAuthToken(): string | null {
  if (typeof localStorage === "undefined") return null;
  return localStorage.getItem(JWT_STORAGE_KEY);
}

export function setAuthToken(token: string | null): void {
  if (typeof localStorage === "undefined") return;
  if (token) {
    localStorage.setItem(JWT_STORAGE_KEY, token);
  } else {
    localStorage.removeItem(JWT_STORAGE_KEY);
  }
}

function createApiInstance(baseURL: string): AxiosInstance {
  const instance = axios.create({
    baseURL,
    headers: { "Content-Type": "application/json" },
  });

  instance.interceptors.request.use((config) => {
    if (typeof localStorage === "undefined") return config;
    const token = localStorage.getItem(JWT_STORAGE_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return instance;
}

export const apiClient = createApiInstance(getCatalogBaseURL());

export const authApiClient = createApiInstance(getAuthBaseURL());

export function getApiClient(): AxiosInstance {
  return apiClient;
}

export { JWT_STORAGE_KEY };
