import type { CartItem } from "@voltix/api-client";
import { createStore } from "zustand/vanilla";

export type CartState = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
};

function cartItemsTotal(items: CartItem[]): number {
  return items.reduce((sum, i) => {
    const unit = i.unitPrice ?? 0;
    return sum + unit * i.quantity;
  }, 0);
}

export const cartStore = createStore<CartState>()((set) => ({
  items: [],
  addItem: (item) =>
    set((state) => {
      const idx = state.items.findIndex((x) => x.productId === item.productId);
      if (idx >= 0) {
        const next = [...state.items];
        next[idx] = {
          ...next[idx],
          quantity: next[idx].quantity + item.quantity,
        };
        return { items: next };
      }
      return { items: [...state.items, item] };
    }),
  removeItem: (productId) =>
    set((state) => ({
      items: state.items.filter((i) => i.productId !== productId),
    })),
}));

export function cartTotalPrice(): number {
  return cartItemsTotal(cartStore.getState().items);
}
