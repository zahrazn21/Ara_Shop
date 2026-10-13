import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "ara-session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // ۷ روز

export type SessionPayload = { userId: string; role: "USER" | "ADMIN" };

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) {
    throw new Error("SESSION_SECRET باید در .env تعریف شده و حداقل ۳۲ کاراکتر باشد");
  }
  return new TextEncoder().encode(s);
}

export const signSession = (p: SessionPayload) =>
  new SignJWT({ ...p })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secret());

export async function verifySession(token?: string): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    if (typeof payload.userId !== "string") return null;
    return { userId: payload.userId, role: payload.role === "ADMIN" ? "ADMIN" : "USER" };
  } catch {
    return null; 
  }
}