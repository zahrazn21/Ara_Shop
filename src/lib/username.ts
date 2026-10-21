const RESERVED = new Set([
  "admin", "administrator", "root", "support", "moderator", "system", "staff", "arghavan",
]);

export function validateUsername(raw: string): { value: string } | { error: string } {
  const v = raw.trim().toLowerCase();
  if (!/^[a-z0-9_.]{3,20}$/.test(v))
    return { error: "نام کاربری باید ۳ تا ۲۰ کاراکتر باشد و فقط شامل حروف انگلیسی، عدد، نقطه و _ باشد." };
  if (/^[._]|[._]$/.test(v))
    return { error: "نام کاربری نباید با نقطه یا _ شروع یا تمام شود." };
  if (RESERVED.has(v)) return { error: "این نام کاربری مجاز نیست." };
  return { value: v };
}