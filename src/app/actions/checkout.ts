"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import {
  CheckoutError,
  evaluateCoupon,
  priceLines,
  shippingFor,
  type PricedLine,
} from "@/lib/checkout";


export type AddressItem = {
  id: string;
  title: string | null;
  fullName: string;
  phone: string;
  province: string;
  city: string;
  postalCode: string;
  addressLine: string;
  isDefault: boolean;
};

const MAX_ADDRESSES = 10;

const digits = (s: string) =>
  s
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();

export async function createAddress(
  fd: FormData
): Promise<{ ok: true; address: AddressItem } | { ok: false; error: string }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "ابتدا وارد حساب خود شوید." };

  const fullName = str(fd, "fullName");
  const phone = digits(str(fd, "phone"));
  const province = str(fd, "province");
  const city = str(fd, "city");
  const postalCode = digits(str(fd, "postalCode"));
  const addressLine = str(fd, "addressLine");
  const title = str(fd, "title");

  if (fullName.length < 3) return { ok: false, error: "نام و نام خانوادگی گیرنده را وارد کنید." };
  if (!/^09\d{9}$/.test(phone)) return { ok: false, error: "شماره موبایل باید با ۰۹ شروع شود و ۱۱ رقم باشد." };
  if (!province || !city) return { ok: false, error: "استان و شهر را وارد کنید." };
  if (!/^\d{10}$/.test(postalCode)) return { ok: false, error: "کد پستی باید ۱۰ رقم باشد." };
  if (addressLine.length < 10) return { ok: false, error: "نشانی کامل را وارد کنید (حداقل ۱۰ حرف)." };

  const count = await prisma.address.count({ where: { userId: user.id } });
  if (count >= MAX_ADDRESSES) return { ok: false, error: `حداکثر ${MAX_ADDRESSES} آدرس می‌توانید ثبت کنید.` };

  const address = await prisma.address.create({
    data: {
      userId: user.id,
      title: title || null,
      fullName,
      phone,
      province,
      city,
      postalCode,
      addressLine,
      isDefault: count === 0, 
    },
    select: {
      id: true, title: true, fullName: true, phone: true, province: true,
      city: true, postalCode: true, addressLine: true, isDefault: true,
    },
  });
  return { ok: true, address };
}

export type Quote =
  | {
      ok: true;
      items: PricedLine[];
      subtotal: number;
      shipping: number;
      discount: number;
      total: number;
      couponError?: string;
    }
  | { ok: false; error: string };

export async function quoteOrder(lines: unknown, couponCode?: string): Promise<Quote> {
  if (!(await getCurrentUser())) return { ok: false, error: "ابتدا وارد حساب خود شوید." };

  try {
    const items = await priceLines(lines);
    const subtotal = items.reduce((n, i) => n + i.price * i.quantity, 0);

    let discount = 0;
    let couponError: string | undefined;
    if (couponCode?.trim()) {
      try {
        discount = (await evaluateCoupon(couponCode, subtotal)).discount;
      } catch (e) {
        if (!(e instanceof CheckoutError)) throw e;
        couponError = e.message;
      }
    }

    const shipping = shippingFor(subtotal);
    return { ok: true, items, subtotal, shipping, discount, total: subtotal - discount + shipping, couponError };
  } catch (e) {
    if (e instanceof CheckoutError) return { ok: false, error: e.message };
    return { ok: false, error: "محاسبه‌ی سفارش انجام نشد. دوباره تلاش کنید." };
  }
}


export async function placeOrder(
  lines: unknown,
  addressId: string,
  couponCode?: string
): Promise<{ ok: true; orderId: string } | { ok: false; error: string }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "ابتدا وارد حساب خود شوید." };

  try {
    const orderId = await prisma.$transaction(async (tx) => {
      const address = await tx.address.findFirst({
        where: { id: String(addressId), userId: user.id },
        select: { id: true },
      });
      if (!address) throw new CheckoutError("آدرس انتخاب‌شده معتبر نیست.");

      const items = await priceLines(lines, tx);
      const subtotal = items.reduce((n, i) => n + i.price * i.quantity, 0);

      let discount = 0;
      let couponId: string | null = null;
      if (couponCode?.trim()) {
        const c = await evaluateCoupon(couponCode, subtotal, tx);
        const n = await tx.$executeRaw`
          UPDATE "coupons" SET "usedCount" = "usedCount" + 1
          WHERE "id" = ${c.id} AND ("usageLimit" IS NULL OR "usedCount" < "usageLimit")`;
        if (n === 0) throw new CheckoutError("ظرفیت استفاده از این کد تمام شده است.");
        discount = c.discount;
        couponId = c.id;
      }

      for (const it of items) {
        const r = it.variantId
          ? await tx.productVariant.updateMany({
              where: { id: it.variantId, stock: { gte: it.quantity } },
              data: { stock: { decrement: it.quantity } },
            })
          : await tx.product.updateMany({
              where: { id: it.productId, status: "ACTIVE", stock: { gte: it.quantity } },
              data: { stock: { decrement: it.quantity } },
            });
        if (r.count === 0) throw new CheckoutError(`موجودی «${it.name}» کافی نیست.`);
      }

      const shipping = shippingFor(subtotal);
      const order = await tx.order.create({
        data: {
          userId: user.id,
          addressId: address.id,
          couponId,
          subtotal,
          shippingCost: shipping,
          discount,
          totalPrice: subtotal - discount + shipping,
          items: {
            create: items.map((i) => ({
              productId: i.productId,
              variantId: i.variantId,
              name: i.name,
              price: i.price,
              quantity: i.quantity,
              image: i.image,
              variantLabel: i.variantLabel,
            })),
          },
        },
        select: { id: true },
      });
      return order.id;
    });

    revalidatePath("/admin");
    revalidatePath("/admin/products");
    return { ok: true, orderId };
  } catch (e) {
    if (e instanceof CheckoutError) return { ok: false, error: e.message };
    return { ok: false, error: "ثبت سفارش انجام نشد. دوباره تلاش کنید." };
  }
}