"use server";
import type { OrderStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { ORDER_STATUS_LABEL } from "@/lib/labels";
import { cancelOrderTx, NEXT_STATUSES } from "@/lib/orders";
import { digits } from "@/lib/phone";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

export type OrderActionState = { ok?: boolean; error?: string } | undefined;

function cleanTracking(raw?: string): { value: string | null } | { error: string } {
  const t = digits(raw ?? "").replace(/\s+/g, "");
  if (!t) return { value: null };
  if (!/^[A-Za-z0-9-]{5,30}$/.test(t))
    return { error: "کد رهگیری باید ۵ تا ۳۰ کاراکتر و فقط شامل حروف انگلیسی، عدد و - باشد." };
  return { value: t };
}

function revalidateOrder(id: string) {
  for (const p of ["/admin/orders", `/admin/orders/${id}`, "/admin", "/orders", `/orders/${id}`, "/products", "/"])
    revalidatePath(p);
}

export async function changeOrderStatus(
  id: string,
  to: OrderStatus,
  trackingCode?: string,
): Promise<OrderActionState> {
  await requireAdmin();
  if (!Object.hasOwn(ORDER_STATUS_LABEL, to)) return { error: "وضعیت نامعتبر است." };

  const t = cleanTracking(trackingCode);
  if ("error" in t) return { error: t.error };

  try {
    const order = await prisma.order.findUnique({ where: { id }, select: { status: true } });
    if (!order) return { error: "سفارش پیدا نشد." };
    if (!NEXT_STATUSES[order.status].includes(to)) return { error: "این تغییر وضعیت مجاز نیست." };

    let changed: boolean;
    if (to === "CANCELLED") {
      changed = await prisma.$transaction((tx) => cancelOrderTx(tx, id, [order.status]));
    } else {
      const r = await prisma.order.updateMany({
        where: { id, status: order.status },
        data: { status: to, ...(to === "SHIPPED" && t.value ? { trackingCode: t.value } : {}) },
      });
      changed = r.count > 0;
    }
    if (!changed) return { error: "وضعیت سفارش هم‌زمان تغییر کرد. صفحه را تازه کنید." };
  } catch {
    return { error: "انجام نشد. دوباره تلاش کنید." };
  }

  revalidateOrder(id);
  return { ok: true };
}

export async function updateTrackingCode(id: string, trackingCode: string): Promise<OrderActionState> {
  await requireAdmin();
  const t = cleanTracking(trackingCode);
  if ("error" in t) return { error: t.error };

  try {
    const r = await prisma.order.updateMany({
      where: { id, status: { in: ["PROCESSING", "SHIPPED", "DELIVERED"] } },
      data: { trackingCode: t.value },
    });
    if (r.count === 0) return { error: "برای این سفارش نمی‌شود کد رهگیری ثبت کرد." };
  } catch {
    return { error: "انجام نشد. دوباره تلاش کنید." };
  }

  revalidateOrder(id);
  return { ok: true };
}