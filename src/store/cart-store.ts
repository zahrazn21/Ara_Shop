"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartLine = {
  productId: string;
  variantId: string | null;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

type CartState = {
  items: CartLine[];
  addItem: (line: Omit<CartLine, "quantity">, qty?: number) => void;
  removeItem: (productId: string, variantId: string | null) => void;
  setQuantity: (productId: string, variantId: string | null, qty: number) => void;
  clear: () => void;
};

const same = (a: CartLine, p: string, v: string | null) =>
  a.productId === p && a.variantId === v;

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (line, qty = 1) =>
        set((s) => {
          const found = s.items.find((i) => same(i, line.productId, line.variantId));
          return found
            ? { items: s.items.map((i) => (i === found ? { ...i, quantity: i.quantity + qty } : i)) }
            : { items: [...s.items, { ...line, quantity: qty }] };
        }),
      removeItem: (p, v) => set((s) => ({ items: s.items.filter((i) => !same(i, p, v)) })),
      setQuantity: (p, v, qty) =>
        set((s) => ({
          items: qty <= 0
            ? s.items.filter((i) => !same(i, p, v))
            : s.items.map((i) => (same(i, p, v) ? { ...i, quantity: qty } : i)),
        })),
      clear: () => set({ items: [] }),
    }),
    { name: "Arghavan-cart" }
  )
);
