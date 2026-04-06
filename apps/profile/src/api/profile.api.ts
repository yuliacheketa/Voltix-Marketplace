import { authApiClient } from "@voltix/api-client";
import axios, { type AxiosError } from "axios";

export type ProfileUser = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  avatarUrl: string | null;
  role: string;
  isVerified: boolean;
  createdAt: string;
};

export type ProfileAddress = {
  id: string;
  label: string | null;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string | null;
  zip: string;
  country: string;
  isDefault: boolean;
};

export type UpdateProfilePayload = {
  name?: string;
  phone?: string | null;
  avatarUrl?: string | null;
};

export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
};

export type CreateAddressPayload = {
  label?: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state?: string;
  zip: string;
  country: string;
  isDefault?: boolean;
};

export type UpdateAddressPayload = Partial<CreateAddressPayload>;

export type OrderItemRow = {
  productName: string;
  variantName: string | null;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
};

export type OrderRow = {
  id: string;
  status: string;
  totalAmount: string;
  deliveryCost: string;
  createdAt: string;
  items: OrderItemRow[];
  payment: { status: string } | null;
};

export type OrdersPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export async function getMe(): Promise<{
  user: ProfileUser;
  addresses: ProfileAddress[];
}> {
  const { data } = await authApiClient.get<{
    success: boolean;
    data: { user: ProfileUser; addresses: ProfileAddress[] };
  }>("/api/users/me");
  const payload = data?.data;
  if (!payload?.user) {
    throw new Error("Некоректна відповідь сервера (профіль)");
  }
  return {
    user: payload.user,
    addresses: payload.addresses ?? [],
  };
}

export async function updateProfile(
  payload: UpdateProfilePayload
): Promise<ProfileUser> {
  const { data } = await authApiClient.patch<{
    success: boolean;
    data: { user: ProfileUser };
  }>("/api/users/me", payload);
  return data.data.user;
}

export async function changePassword(
  payload: ChangePasswordPayload
): Promise<void> {
  await authApiClient.patch("/api/users/me/password", payload);
}

export async function getOrders(
  page: number,
  limit: number
): Promise<{ orders: OrderRow[]; pagination: OrdersPagination }> {
  const { data } = await authApiClient.get<{
    success: boolean;
    data: { orders: OrderRow[]; pagination: OrdersPagination };
  }>("/api/users/me/orders", { params: { page, limit } });
  return data.data;
}

export async function createAddress(
  payload: CreateAddressPayload
): Promise<ProfileAddress> {
  const { data } = await authApiClient.post<{
    success: boolean;
    data: { address: ProfileAddress };
  }>("/api/users/me/addresses", payload);
  return data.data.address;
}

export async function updateAddress(
  addressId: string,
  payload: UpdateAddressPayload
): Promise<ProfileAddress> {
  const { data } = await authApiClient.patch<{
    success: boolean;
    data: { address: ProfileAddress };
  }>(`/api/users/me/addresses/${addressId}`, payload);
  return data.data.address;
}

export async function deleteAddress(addressId: string): Promise<void> {
  await authApiClient.delete(`/api/users/me/addresses/${addressId}`);
}

export function isAxiosError(e: unknown): e is AxiosError {
  return axios.isAxiosError(e);
}
