export const digits = (s: string) =>
  s
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));

export function normalizePhone(raw: string): string | null {
  let p = digits(raw).replace(/[\s\-()]/g, "");
  if (p.startsWith("+98")) p = "0" + p.slice(3);
  else if (p.startsWith("0098")) p = "0" + p.slice(4);
  else if (p.startsWith("98") && p.length === 12) p = "0" + p.slice(2);
  else if (p.length === 10 && p.startsWith("9")) p = "0" + p;
  return /^09\d{9}$/.test(p) ? p : null;
}