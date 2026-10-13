import type { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { toman } from "./format";

export const SHIPPING_COST = 50_000;
export const FREE_SHIPPING_FROM = 1_500_000;

export const shippingFor = (subtotal: number) =>
  subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING_COST;

export class CheckoutError extends Error {}

export type LineInput = { productId: string; variantId: string | null; quantity: number };

export type PricedLine = {
  productId: string;
  variantId: string | null;
  name: string;
  image: string;
  price: number;
  quantity: number;
  variantLabel: string | null;
};

type Db = Prisma.TransactionClient;


export async function priceLines(raw: unknown, db: Db = prisma): Promise<PricedLine[]> {
  if (!Array.isArray(raw) || raw.length === 0) throw new CheckoutError("سبد خرید خالی است.");
  if (raw.length > 50) throw new CheckoutError("تعداد ردیف‌های سبد بیش از حد مجاز است.");

  const wanted = new Map<string, LineInput>();
  for (const item of raw as unknown[]) {
    const r = (item ?? {}) as Record<string, unknown>;
    const productId = typeof r.productId === "string" ? r.productId : "";
    const variantId = typeof r.variantId === "string" && r.variantId ? r.variantId : null;
    const quantity = Number(r.quantity);
    if (!productId || !Number.isInteger(quantity) || quantity < 1 || quantity > 99)
      throw new CheckoutError("اطلاعات سبد خرید معتبر نیست.");
    const k = `${productId}:${variantId ?? ""}`;
    wanted.set(k, { productId, variantId, quantity: (wanted.get(k)?.quantity ?? 0) + quantity });
  }

  const products = await db.product.findMany({
    where: { id: { in: [...new Set([...wanted.values()].map((w) => w.productId))] } },
    select: {
      id: true,
      name: true,
      image: true,
      price: true,
      stock: true,
      status: true,
      variants: { select: { id: true, color: true, size: true, number: true, stock: true, priceDiff: true } },
    },
  });
  const byId = new Map(products.map((p) => [p.id, p]));

  return [...wanted.values()].map((w) => {
    const p = byId.get(w.productId);
    if (!p || p.status !== "ACTIVE")
      throw new CheckoutError(
        p ? `«${p.name}» دیگر در دسترس نیست.` : "یکی از کالاهای سبد دیگر در دسترس نیست."
      );

    let stock = p.stock;
    let price = p.price;
    let variantLabel: string | null = null;

    if (p.variants.length > 0) {
      const v = p.variants.find((x) => x.id === w.variantId);
      if (!v) throw new CheckoutError(`مشخصات «${p.name}» دیگر معتبر نیست. آن را از سبد حذف و دوباره اضافه کنید.`);
      stock = v.stock;
      price = p.price + v.priceDiff;
      variantLabel = [v.color, v.size, v.number].filter(Boolean).join(" / ") || null;
    } else if (w.variantId) {
      throw new CheckoutError(`مشخصات «${p.name}» دیگر معتبر نیست. آن را از سبد حذف و دوباره اضافه کنید.`);
    }

    if (stock <= 0) throw new CheckoutError(`«${p.name}» ناموجود شده است.`);
    if (w.quantity > stock)
      throw new CheckoutError(`از «${p.name}» فقط ${toman(stock)} عدد موجود است.`);

    return {
      productId: p.id,
      variantId: w.variantId,
      name: p.name,
      image: p.image,
      price,
      quantity: w.quantity,
      variantLabel,
    };
  });
}

export async function evaluateCoupon(code: string, subtotal: number, db: Db = prisma) {
  const c = await db.coupon.findFirst({
    where: { code: { equals: code.trim(), mode: "insensitive" } },
  });
  if (!c || !c.isActive) throw new CheckoutError("کد تخفیف معتبر نیست.");
  if (c.expiresAt && c.expiresAt < new Date()) throw new CheckoutError("این کد تخفیف منقضی شده است.");
  if (c.usageLimit !== null && c.usedCount >= c.usageLimit)
    throw new CheckoutError("ظرفیت استفاده از این کد تمام شده است.");
  if (c.minOrderTotal !== null && subtotal < c.minOrderTotal)
    throw new CheckoutError(`حداقل مبلغ سفارش برای این کد ${toman(c.minOrderTotal)} تومان است.`);

  let discount = c.type === "PERCENT" ? Math.floor((subtotal * c.value) / 100) : c.value;
  if (c.type === "PERCENT" && c.maxDiscount !== null) discount = Math.min(discount, c.maxDiscount);
  discount = Math.min(discount, subtotal); // تخفیف از جمع کالاها بیشتر نمی‌شود

  return { id: c.id, discount };
}