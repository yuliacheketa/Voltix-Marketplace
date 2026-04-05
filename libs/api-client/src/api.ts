import { apiClient } from "./client.js";
import type {
  Category,
  CreateOrderPayload,
  Order,
  PricePoint,
  Product,
  ProductFilters,
} from "./types.js";

export async function getProducts(
  filters?: ProductFilters
): Promise<Product[]> {
  const { data } = await apiClient.get<Product[]>("/products", {
    params: filters,
  });
  return data;
}

export async function getProductById(id: string): Promise<Product> {
  const { data } = await apiClient.get<Product>(`/products/${id}`);
  return data;
}

export async function getCategories(): Promise<Category[]> {
  const { data } = await apiClient.get<Category[]>("/categories");
  return data;
}

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const { data } = await apiClient.post<Order>("/orders", payload);
  return data;
}

export async function getPriceHistory(
  productId: string
): Promise<PricePoint[]> {
  const { data } = await apiClient.get<PricePoint[]>(
    `/products/${productId}/price-history`
  );
  return data;
}
