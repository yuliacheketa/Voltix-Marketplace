export interface Category {
  id: string;
  name: string;
  slug?: string;
}

export interface Product {
  id: string;
  title: string;
  description?: string;
  price: number;
  currency: string;
  categoryId?: string;
  imageUrl?: string;
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

export interface PricePoint {
  at: string;
  price: number;
}

export interface ProductFilters {
  categoryId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
  offset?: number;
}

export interface CreateOrderPayload {
  items: CartItem[];
  currency: string;
}
