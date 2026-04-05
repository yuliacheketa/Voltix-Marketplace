import { useStore } from "zustand/react";
import type { CartItem } from "@voltix/api-client";
import type { Product } from "@voltix/api-client";
import { cartStore, cartTotalPrice } from "./cartStore.js";
import { compareStore } from "./compareStore.js";

export function useCartStore<T>(
  selector: (s: ReturnType<typeof cartStore.getState>) => T
): T {
  return useStore(cartStore, selector);
}

export function useCartItems(): CartItem[] {
  return useStore(cartStore, (s) => s.items);
}

export function useCartTotalPrice(): number {
  return useStore(cartStore, (s) =>
    s.items.reduce((sum, i) => sum + (i.unitPrice ?? 0) * i.quantity, 0)
  );
}

export function useCompareStore<T>(
  selector: (s: ReturnType<typeof compareStore.getState>) => T
): T {
  return useStore(compareStore, selector);
}

export function useCompareProducts(): Product[] {
  return useStore(compareStore, (s) => s.products);
}

export { cartTotalPrice };
