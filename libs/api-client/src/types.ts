export type ProductSort = "price_asc" | "price_desc" | "rating" | "newest";

export interface Category {
  id: string;
  name: string;
  slug?: string;
}

export interface ProductReview {
  id: string;
  author: string;
  rating: number;
  text: string;
  createdAt: string;
}

export interface Product {
  id: string;
  title: string;
  description?: string;
  price: number;
  currency: string;
  categoryId?: string;
  imageUrl?: string;
  imageUrls?: string[];
  rating?: number;
  inStock?: boolean;
  createdAt?: string;
  attributes?: Record<string, string>;
  reviews?: ProductReview[];
}

export interface CartItem {
  productId: string;
  quantity: number;
  title?: string;
  unitPrice?: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  currency: string;
  status: string;
  createdAt: string;
}

export interface ProductFilters {
  categoryId?: string;
  categoryIds?: string[];
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStockOnly?: boolean;
  sort?: ProductSort;
  limit?: number;
  offset?: number;
}

export interface CreateOrderPayload {
  items: CartItem[];
  currency: string;
}

export type AuthRole = "CUSTOMER" | "SELLER" | "MODERATOR" | "ADMIN";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: AuthRole;
  isVerified: boolean;
  createdAt: string;
}

export interface SellerProfileSummary {
  id: string;
  shopName: string;
  status: string;
}

export interface AuthSessionResponse {
  user: AuthUser;
  token: string;
  message?: string;
  sellerProfile?: SellerProfileSummary;
}

export interface VerifyEmailResponse {
  ok: boolean;
  message: string;
}
