import { createHmac, randomInt, timingSafeEqual } from "crypto";

export const OTP_TTL_MS = 2 * 60_000; 
export const OTP_RESEND_MS = 60_000; 
export const OTP_MAX_ATTEMPTS = 5; 

export const generateCode = () => String(randomInt(0, 1_000_000)).padStart(6, "0");

export function hashCode(phone: string, code: string) {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET تعریف نشده است");
  return createHmac("sha256", secret).update(`${phone}:${code}`).digest("hex");
}

export function codeMatches(phone: string, code: string, hash: string) {
  const a = Buffer.from(hashCode(phone, code), "hex");
  const b = Buffer.from(hash, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}