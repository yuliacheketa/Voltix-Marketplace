import type { Product } from "@voltix/api-client";
import { createStore } from "zustand/vanilla";

export const COMPARE_MAX_ITEMS = 4;

export type CompareState = {
  products: Product[];
  addProduct: (product: Product) => void;
  removeProduct: (productId: string) => void;
};

export const compareStore = createStore<CompareState>()((set) => ({
  products: [],
  addProduct: (product) =>
    set((state) => {
      if (state.products.some((p) => p.id === product.id)) {
        return state;
      }
      if (state.products.length >= COMPARE_MAX_ITEMS) {
        return state;
      }
      return { products: [...state.products, product] };
    }),
  removeProduct: (productId) =>
    set((state) => ({
      products: state.products.filter((p) => p.id !== productId),
    })),
}));
