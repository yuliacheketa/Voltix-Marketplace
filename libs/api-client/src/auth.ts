import { authApiClient } from "./client.js";
import type {
  AuthSessionResponse,
  AuthUser,
  VerifyEmailResponse,
} from "./types.js";

export async function registerAuth(input: {
  email: string;
  password: string;
  confirmPassword: string;
  role?: "CUSTOMER" | "SELLER";
  shopName?: string;
}): Promise<AuthSessionResponse> {
  const { data } = await authApiClient.post<AuthSessionResponse>(
    "/api/auth/register",
    input
  );
  return data;
}

export async function loginAuth(input: {
  email: string;
  password: string;
}): Promise<AuthSessionResponse> {
  const { data } = await authApiClient.post<AuthSessionResponse>(
    "/api/auth/login",
    input
  );
  return data;
}

export async function getMeAuth(): Promise<{ user: AuthUser }> {
  const { data } = await authApiClient.get<{ user: AuthUser }>("/api/auth/me");
  return data;
}

export async function verifyEmailAuth(
  token: string
): Promise<VerifyEmailResponse> {
  const { data } = await authApiClient.get<VerifyEmailResponse>(
    "/api/auth/verify-email",
    { params: { token } }
  );
  return data;
}
