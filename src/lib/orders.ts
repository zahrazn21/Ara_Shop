import type { OrderStatus, Prisma } from "@prisma/client";
import { prisma } from "./prisma";

export const UNPAID_ORDER_MINUTES = 30;

// از هر وضعیت می‌شود به کدام وضعیت‌ها رفت
export const NEXT_STATUSES: Record<OrderStatus, OrderStatus[]> = {
  PENDING_PAYMENT: ["PAID", "CANCELLED"],
  PAID: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

/** سفارش را لغو می‌کند و موجودی و کوپن را برمی‌گرداند. اگه وضعیتش دیگه یکی از `from` نباشه، false */
export async function cancelOrderTx(tx: Prisma.TransactionClient, id: string, from: OrderStatus[]) {
  // اول سفارش را «قفل» می‌کنیم تا دو بار لغو نشه و موجودی دو بار برنگرده
  const claimed = await tx.order.updateMany({
    where: { id, status: { in: from } },
    data: { status: "CANCELLED" },
  });
  if (claimed.count === 0) return false;

  const order = await tx.order.findUnique({
    where: { id },
    select: {
      couponId: true,
      items: { select: { productId: true, variantId: true, quantity: true } },
    },
  });
  if (!order) return false;

  for (const it of order.items) {
    if (it.variantId) {
      await tx.productVariant.update({
        where: { id: it.variantId },
        data: { stock: { increment: it.quantity } },
      });
    } else {
      await tx.product.update({
        where: { id: it.productId },
        data: { stock: { increment: it.quantity } },
      });
    }
  }

  if (order.couponId) {
    await tx.coupon.updateMany({
      where: { id: order.couponId, usedCount: { gt: 0 } },
      data: { usedCount: { decrement: 1 } },
    });
  }
  return true;
}

export async function cancelExpiredOrders() {
  const limit = new Date(Date.now() - UNPAID_ORDER_MINUTES * 60_000);

  const expired = await prisma.order.findMany({
    where: { status: "PENDING_PAYMENT", createdAt: { lt: limit } },
    select: { id: true },
    take: 50,
  });

  for (const { id } of expired) {
    await prisma.$transaction((tx) => cancelOrderTx(tx, id, ["PENDING_PAYMENT"]));
  }
  return expired.length;
}