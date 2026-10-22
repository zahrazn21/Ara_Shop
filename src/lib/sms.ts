export async function sendSms(phone: string, code: string) {
  if (process.env.NODE_ENV !== "production" || process.env.SMS_DEBUG === "1") {
    console.log(`📱 کد تأیید برای ${phone}: ${code}`);
    return;
  }
  // TODO: اینجا به سرویس پیامک واقعی (کاوه‌نگار، ملی‌پیامک، ...) وصل می‌شیم
  throw new Error("سرویس پیامک تنظیم نشده است");
}