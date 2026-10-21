import { headers } from "next/headers";

type Bucket = { count: number; resetAt: number };

const g = globalThis as unknown as { __rateLimit?: Map<string, Bucket> };
const store = (g.__rateLimit ??= new Map<string, Bucket>());

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  if (store.size > 5000) {
    for (const [k, b] of store) if (b.resetAt <= now) store.delete(k);
  }
  const b = store.get(key);
  if (!b || b.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (b.count >= limit) return false;
  b.count++;
  return true;
}

export async function clientIp(): Promise<string | null> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || null;
}