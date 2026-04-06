import { useStore } from "zustand/react";
import type { CartItem } from "@voltix/api-client";
import { authStore } from "./authStore.js";
import { cartStore, cartTotalPrice } from "./cartStore.js";

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

export function useAuthStore<T>(
  selector: (s: ReturnType<typeof authStore.getState>) => T
): T {
  return useStore(authStore, selector);
}

export function useAuthUser() {
  return useStore(authStore, (s) => s.user);
}

export function useAuthHydrated() {
  return useStore(authStore, (s) => s.hydrated);
}

export { cartTotalPrice };
