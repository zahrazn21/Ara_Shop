
const COLORS: Record<string, string> = {
  قرمز: "#dc2626",
  زرشکی: "#7f1d1d",
  صورتی: "#ec4899",
  گلبهی: "#f4a6b8",
  "صورتی روشن": "#f9c4d8",
  نارنجی: "#f97316",
  زرد: "#facc15",
  طلایی: "#d4af37",
  سبز: "#16a34a",
  "سبز روشن": "#86efac",
  "سبز تیره": "#166534",
  لیمویی: "#bef264",
  فیروزه‌ای: "#14b8a6",
  آبی: "#2563eb",
  "آبی روشن": "#7dd3fc",
  آسمانی: "#38bdf8",
  "آبی تیره": "#1e3a8a",
  سرمه‌ای: "#1e3a8a",
  بنفش: "#9333ea",
  یاسی: "#c4b5fd",
  بژ: "#d9c4a3",
  کرم: "#f5e6c8",
  شیری: "#fffdd0",
  قهوه‌ای: "#78350f",
  نسکافه‌ای: "#a47551",
  مسی: "#b87333",
  نقره‌ای: "#c0c0c0",
  خاکستری: "#9ca3af",
  طوسی: "#9ca3af",
  مشکی: "#111827",
  سفید: "#ffffff",
};

const normalize = (s: string) =>
  s.replace(/ي/g, "ی").replace(/ك/g, "ک").replace(/[\u200c\s]+/g, "").trim();

const NORMALIZED = new Map(Object.entries(COLORS).map(([k, v]) => [normalize(k), v]));

export function colorSwatch(name: string | null | undefined): string | null {
  if (!name) return null;
  const raw = name.trim();
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(raw)) return raw;
  return NORMALIZED.get(normalize(raw)) ?? null;
}