export {
  apiClient,
  authApiClient,
  getApiClient,
  getBaseURL,
  getCatalogBaseURL,
  getAuthBaseURL,
  getAuthToken,
  setAuthToken,
  JWT_STORAGE_KEY,
} from "./client.js";
export { registerAuth, loginAuth, getMeAuth, verifyEmailAuth } from "./auth.js";
export {
  getProducts,
  getProductById,
  getCategories,
  createOrder,
} from "./api.js";
export type {
  Category,
  Product,
  ProductReview,
  ProductSort,
  CartItem,
  Order,
  ProductFilters,
  CreateOrderPayload,
  AuthUser,
  AuthRole,
  AuthSessionResponse,
  SellerProfileSummary,
  VerifyEmailResponse,
} from "./types.js";
