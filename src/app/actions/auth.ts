"use server";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession, destroySession } from "@/lib/session";

export type AuthState = { error?: string } | undefined;

const field = (fd: FormData, k: string) => String(fd.get(k) ?? "");

export async function register(_: AuthState, fd: FormData): Promise<AuthState> {
  const username = field(fd, "username").trim();
  const email = field(fd, "email").trim().toLowerCase();
  const password = field(fd, "password");

  if (!/^[a-zA-Z0-9_]{3,20}$/.test(username))
    return { error: "نام کاربری باید ۳ تا ۲۰ حرف انگلیسی، عدد یا _ باشد." };
  if (!/^\S+@\S+\.\S+$/.test(email)) return { error: "ایمیل معتبر وارد کنید." };
  if (password.length < 8) return { error: "رمز عبور باید حداقل ۸ کاراکتر باشد." };

  const exists = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
    select: { id: true },
  });
  if (exists) return { error: "این ایمیل یا نام کاربری قبلاً ثبت شده است." };

  let user;
  try {
    user = await prisma.user.create({
      data: { username, email, password: await bcrypt.hash(password, 12) },
    });
  } catch {
    return { error: "ثبت‌نام انجام نشد. دوباره تلاش کنید." };
  }

  await createSession({ userId: user.id, role: user.role });
  redirect("/");
}

export async function login(_: AuthState, fd: FormData): Promise<AuthState> {
  const email = field(fd, "email").trim().toLowerCase();
  const password = field(fd, "password");

  const user = await prisma.user.findUnique({ where: { email } });
  const ok = user && (await bcrypt.compare(password, user.password));

  if (!user || !ok) return { error: "ایمیل یا رمز عبور اشتباه است." };

  await createSession({ userId: user.id, role: user.role });
  redirect(user.role === "ADMIN" ? "/admin" : "/");
}

export async function logout() {
  await destroySession();
  redirect("/login");
}