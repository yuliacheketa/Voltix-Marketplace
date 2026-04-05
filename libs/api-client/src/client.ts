import axios, { type AxiosInstance } from "axios";

declare const process: { env: Record<string, string | undefined> } | undefined;

export function getBaseURL(): string {
  if (typeof process !== "undefined" && process?.env?.API_URL) {
    return process.env.API_URL;
  }
  return "";
}

const JWT_STORAGE_KEY = "voltix_jwt";

export function getApiClient(): AxiosInstance {
  const instance = axios.create({
    baseURL: getBaseURL(),
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

export const apiClient = getApiClient();

export { JWT_STORAGE_KEY };
