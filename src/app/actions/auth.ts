"use server";
import { randomBytes } from "crypto";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession, destroySession } from "@/lib/session";
import { codeMatches, generateCode, hashCode, OTP_MAX_ATTEMPTS, OTP_RESEND_MS, OTP_TTL_MS } from "@/lib/otp";
import { digits, normalizePhone } from "@/lib/phone";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { sendSms } from "@/lib/sms";
import { Prisma } from "@prisma/client";
import { validateUsername } from "@/lib/username";

export type OtpState =
  | { step: "phone" | "code" | "username"; phone?: string; code?: string; error?: string }
  | undefined;

const field = (fd: FormData, k: string) => String(fd.get(k) ?? "");

async function sendCode(_: OtpState, fd: FormData): Promise<OtpState> {
  const phone = normalizePhone(field(fd, "phone"));
  if (!phone) return { step: "phone", error: "شماره موبایل معتبر نیست. مثال: ۰۹۱۲۳۴۵۶۷۸۹" };

  const ip = await clientIp();
  const allowed =
    rateLimit(`otp:phone:${phone}`, 5, 60 * 60_000) &&
    (!ip || rateLimit(`otp:ip:${ip}`, 10, 60 * 60_000));
  if (!allowed) return { step: "phone", error: "تعداد درخواست‌ها زیاد بود. کمی بعد دوباره امتحان کنید." };

  const old = await prisma.otpCode.findUnique({ where: { phone } });
  if (old) {
    const wait = Math.ceil((old.sentAt.getTime() + OTP_RESEND_MS - Date.now()) / 1000);
    if (wait > 0)
      return { step: "code", phone, error: `کد قبلاً ارسال شده است. ${wait} ثانیه‌ی دیگر می‌توانید دوباره درخواست دهید.` };
  }

  const code = generateCode();
  const data = {
    codeHash: hashCode(phone, code),
    expiresAt: new Date(Date.now() + OTP_TTL_MS),
    attempts: 0,
    sentAt: new Date(),
  };
  await prisma.otpCode.upsert({ where: { phone }, update: data, create: { phone, ...data } });

  try {
    await sendSms(phone, code);
  } catch {
    await prisma.otpCode.deleteMany({ where: { phone } });
    return { step: "phone", error: "ارسال پیامک انجام نشد. دوباره تلاش کنید." };
  }
  return { step: "code", phone };
}

async function verifyCode(_: OtpState, fd: FormData): Promise<OtpState> {
  const phone = normalizePhone(field(fd, "phone"));
  const code = digits(field(fd, "code")).trim();
  if (!phone) return { step: "phone", error: "شماره موبایل معتبر نیست." };
  if (!/^\d{6}$/.test(code)) return { step: "code", phone, error: "کد ۶ رقمی را وارد کنید." };

  const ip = await clientIp();
  if (ip && !rateLimit(`otp-verify:ip:${ip}`, 30, 15 * 60_000))
    return { step: "code", phone, error: "تعداد تلاش‌ها زیاد بود. چند دقیقه بعد دوباره امتحان کنید." };

  const counted = await prisma.otpCode.updateMany({
    where: { phone, expiresAt: { gt: new Date() }, attempts: { lt: OTP_MAX_ATTEMPTS } },
    data: { attempts: { increment: 1 } },
  });
  if (counted.count === 0)
    return { step: "phone", error: "کد منقضی شده یا تلاش‌ها از حد مجاز گذشته است. دوباره درخواست کد کنید." };


  const otp = await prisma.otpCode.findUnique({ where: { phone } });
  if (!otp || !codeMatches(phone, code, otp.codeHash))
    return { step: "code", phone, error: "کد وارد‌شده درست نیست." };

  // حساب از قبل هست؟ اگه نه، برای ساخت حساب نام کاربری لازمه
  const existing = await prisma.user.findUnique({ where: { phone }, select: { id: true } });
  let username: string | undefined;

  if (!existing) {
    // کد درست بوده، پس این تلاش «اشتباه» حساب نمی‌شه و ۵ دقیقه وقت برای انتخاب نام می‌دیم
    const holdCode = () =>
      prisma.otpCode.update({
        where: { phone },
        data: { attempts: { decrement: 1 }, expiresAt: new Date(Date.now() + 5 * 60_000) },
      });

    const raw = field(fd, "username");
    if (!raw.trim()) {
      await holdCode();
      return { step: "username", phone, code };
    }

    const u = validateUsername(raw);
    if ("error" in u) {
      await holdCode();
      return { step: "username", phone, code, error: u.error };
    }

    const taken = await prisma.user.findFirst({
      where: { username: { equals: u.value, mode: "insensitive" } },
      select: { id: true },
    });
    if (taken) {
      await holdCode();
      return { step: "username", phone, code, error: "این نام کاربری قبلاً انتخاب شده است. نام دیگری امتحان کنید." };
    }
    username = u.value;
  }

  const used = await prisma.otpCode.deleteMany({ where: { phone, codeHash: otp.codeHash } });
  if (used.count === 0)
    return { step: "phone", error: "این کد قبلاً استفاده شده است. دوباره درخواست کد کنید." };

  const user = await prisma.user
    .upsert({
      where: { phone },
      update: {},
      create: { phone, username: username ?? `user_${randomBytes(4).toString("hex")}` },
    })
    .catch((e: unknown) =>
      e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002" ? null : Promise.reject(e),
    );

  if (!user)
    return { step: "phone", error: "این نام کاربری هم‌زمان توسط شخص دیگری گرفته شد. دوباره وارد شوید و نام دیگری انتخاب کنید." };

  await createSession({ userId: user.id, role: user.role });
  redirect(user.role === "ADMIN" ? "/admin" : "/");
}
export async function otpAuth(prev: OtpState, fd: FormData): Promise<OtpState> {
  const intent = field(fd, "intent");
  if (intent === "verify") return verifyCode(prev, fd);
  if (intent === "reset") return { step: "phone" };
  return sendCode(prev, fd);
}

export async function logout() {
  await destroySession();
  redirect("/login");
}