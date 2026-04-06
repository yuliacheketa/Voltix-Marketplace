import { apiClient, getBaseURL } from "./client.js";
import * as dummyJson from "./dummyJson.js";
import type {
  Category,
  CreateOrderPayload,
  Order,
  Product,
  ProductFilters,
} from "./types.js";

function productFiltersToSearchParams(
  filters?: ProductFilters
): URLSearchParams {
  const p = new URLSearchParams();
  if (!filters) return p;
  if (filters.search) p.set("search", filters.search);
  if (filters.minPrice != null) p.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice != null) p.set("maxPrice", String(filters.maxPrice));
  if (filters.minRating != null) p.set("minRating", String(filters.minRating));
  if (filters.inStockOnly === true) p.set("inStockOnly", "true");
  if (filters.sort) p.set("sort", filters.sort);
  if (filters.limit != null) p.set("limit", String(filters.limit));
  if (filters.offset != null) p.set("offset", String(filters.offset));
  if (filters.categoryIds?.length) {
    for (const id of filters.categoryIds) {
      p.append("categoryId", id);
    }
  } else if (filters.categoryId) {
    p.append("categoryId", filters.categoryId);
  }
  return p;
}

export async function getProducts(
  filters?: ProductFilters
): Promise<Product[]> {
  if (!getBaseURL()) {
    return dummyJson.getProducts(filters);
  }
  const params = productFiltersToSearchParams(filters);
  const { data } = await apiClient.get<Product[]>("/products", {
    params,
  });
  return data;
}

export async function getProductById(id: string): Promise<Product> {
  if (!getBaseURL()) {
    return dummyJson.getProductById(id);
  }
  const { data } = await apiClient.get<Product>(`/products/${id}`);
  return data;
}

export async function getCategories(): Promise<Category[]> {
  if (!getBaseURL()) {
    return dummyJson.getCategories();
  }
  const { data } = await apiClient.get<Category[]>("/categories");
  return data;
}

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  if (!getBaseURL()) {
    return dummyJson.createOrder(payload);
  }
  const { data } = await apiClient.post<Order>("/orders", payload);
  return data;
}
