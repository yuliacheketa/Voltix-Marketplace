import { getProducts, getProductById, getCategories } from "@voltix/api-client";

export function fetchProductsPage(filters) {
  return getProducts(filters);
}

export function fetchProductById(id) {
  return getProductById(id);
}

export function fetchCategories() {
  return getCategories();
}
