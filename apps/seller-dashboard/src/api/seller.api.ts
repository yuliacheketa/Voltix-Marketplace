import { authApiClient } from "@voltix/api-client";
import axios from "axios";

export type SellerProfile = {
  id: string;
  shopName: string;
  description: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  status: string;
  rating: number;
  totalSales: number;
  isVerified: boolean;
  createdAt: string;
};

export async function getSellerMe(): Promise<SellerProfile> {
  const { data } = await authApiClient.get<{
    success: boolean;
    data: { profile: SellerProfile };
  }>("/api/seller/me");
  return data.data.profile;
}

export async function patchSellerMe(payload: {
  shopName?: string;
  description?: string | null;
  logoUrl?: string | null;
  bannerUrl?: string | null;
}): Promise<SellerProfile> {
  const { data } = await authApiClient.patch<{
    success: boolean;
    data: { profile: SellerProfile };
  }>("/api/seller/me", payload);
  return data.data.profile;
}

export type DashboardStats = {
  totalRevenue: string;
  totalOrders: number;
  pendingOrders: number;
  totalProducts: number;
  averageRating: number;
};

export async function getStats(): Promise<DashboardStats> {
  const { data } = await authApiClient.get<{
    success: boolean;
    data: { stats: DashboardStats };
  }>("/api/seller/stats");
  return data.data.stats;
}

export type SellerProductRow = {
  id: string;
  name: string;
  slug: string;
  basePrice: string;
  status: string;
  rating: number;
  reviewCount: number;
  totalSold: number;
  createdAt: string;
  categoryName: string;
  mainImageUrl: string | null;
};

export async function getProducts(params: {
  page: number;
  status?: string;
}): Promise<{
  products: SellerProductRow[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> {
  const { data } = await authApiClient.get<{
    success: boolean;
    data: {
      products: SellerProductRow[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    };
  }>("/api/seller/products", {
    params: { page: params.page, limit: 20, status: params.status },
  });
  return data.data;
}

export type FullProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  basePrice: string;
  status: string;
  categoryId: string;
  category: { id: string; name: string };
  images: Array<{
    id: string;
    url: string;
    altText: string | null;
    isMain: boolean;
    position: number;
  }>;
  attributes: Array<{ id: string; name: string; value: string }>;
  variants: Array<{
    id: string;
    name: string;
    value: string;
    price: string;
    stock: number;
    sku: string | null;
  }>;
};

export async function getProduct(id: string): Promise<FullProduct> {
  const { data } = await authApiClient.get<{
    success: boolean;
    data: { product: FullProduct };
  }>(`/api/seller/products/${id}`);
  return data.data.product;
}

export type CreateProductPayload = {
  name: string;
  categoryId: string;
  description: string;
  basePrice: number;
  attributes?: Array<{ name: string; value: string }>;
  variants: Array<{
    name: string;
    value: string;
    price: number;
    stock: number;
    sku?: string;
  }>;
  images: Array<{ url: string; altText?: string; isMain: boolean }>;
};

export async function createProduct(
  payload: CreateProductPayload
): Promise<{ id: string }> {
  const { data } = await authApiClient.post<{
    success: boolean;
    data: { product: { id: string } };
  }>("/api/seller/products", payload);
  return data.data.product;
}

export async function updateProduct(
  id: string,
  payload: Partial<CreateProductPayload>
): Promise<void> {
  await authApiClient.patch(`/api/seller/products/${id}`, payload);
}

export async function archiveProduct(id: string): Promise<void> {
  await authApiClient.delete(`/api/seller/products/${id}`);
}

export type SellerOrderRow = {
  id: string;
  status: string;
  totalAmount: string;
  createdAt: string;
  address: { city: string; country: string };
  items: Array<{
    productName: string;
    variantName: string | null;
    quantity: number;
    unitPrice: string;
    totalPrice: string;
  }>;
};

export async function getOrders(params: {
  page: number;
  limit?: number;
  status?: string;
}): Promise<{
  orders: SellerOrderRow[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> {
  const { data } = await authApiClient.get<{
    success: boolean;
    data: {
      orders: SellerOrderRow[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    };
  }>("/api/seller/orders", {
    params: {
      page: params.page,
      limit: params.limit ?? 20,
      status: params.status,
    },
  });
  return data.data;
}

export async function patchOrderStatus(
  sellerOrderId: string,
  status: "PROCESSING" | "SHIPPED"
): Promise<void> {
  await authApiClient.patch(`/api/seller/orders/${sellerOrderId}/status`, {
    status,
  });
}

export type CategoryOption = { id: string; name: string; slug: string };

export async function getCategories(): Promise<CategoryOption[]> {
  const { data } = await authApiClient.get<{
    success: boolean;
    data: { categories: CategoryOption[] };
  }>("/api/seller/categories");
  return data.data.categories;
}

export function isAxiosErr(e: unknown): e is import("axios").AxiosError {
  return axios.isAxiosError(e);
}
