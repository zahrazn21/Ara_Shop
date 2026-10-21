"use server";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { getCurrentUser } from "@/lib/session";
import { validateUsername } from "@/lib/username";

export type ProfileState = { ok?: boolean; error?: string } | undefined;

const NAME_RE = /^[\p{L}\p{M}\u200c .'-]{2,60}$/u;

export async function updateProfile(_: ProfileState, fd: FormData): Promise<ProfileState> {
  const user = await getCurrentUser();
  if (!user) return { error: "ابتدا وارد حساب خود شوید." };
  if (!rateLimit(`profile:${user.id}`, 20, 60 * 60_000))
    return { error: "تعداد تغییرات زیاد بود. کمی بعد دوباره امتحان کنید." };

  const u = validateUsername(String(fd.get("username") ?? ""));
  if ("error" in u) return { error: u.error };

  const name = String(fd.get("name") ?? "").replace(/\s+/g, " ").trim();
  if (name && !NAME_RE.test(name)) return { error: "نام و نام خانوادگی را فقط با حروف وارد کنید." };

  const taken = await prisma.user.findFirst({
    where: { username: { equals: u.value, mode: "insensitive" }, NOT: { id: user.id } },
    select: { id: true },
  });
  if (taken) return { error: "این نام کاربری قبلاً انتخاب شده است." };

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: { username: u.value, name: name || null },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002")
      return { error: "این نام کاربری قبلاً انتخاب شده است." };
    return { error: "ذخیره انجام نشد. دوباره تلاش کنید." };
  }

  revalidatePath("/profile");
  return { ok: true };
}