export { apiClient, getApiClient, JWT_STORAGE_KEY } from "./client.js";
export {
  getProducts,
  getProductById,
  getCategories,
  createOrder,
  getPriceHistory,
} from "./api.js";
export type {
  Category,
  Product,
  CartItem,
  Order,
  PricePoint,
  ProductFilters,
  CreateOrderPayload,
} from "./types.js";
