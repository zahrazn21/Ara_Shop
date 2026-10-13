"use client";
import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

export function useHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,   // کلاینت
    () => false   // سرور و هیدریشن
  );
}