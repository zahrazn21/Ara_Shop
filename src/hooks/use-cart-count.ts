"use client";
import { useCartStore } from "@/store/cart-store";
import { useHydrated } from "./use-hydrated";

export function useCartCount() {
  const hydrated = useHydrated();
  const count = useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));
  return hydrated ? count : 0;
}
