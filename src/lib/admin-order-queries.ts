import type { OrderStatus, Prisma } from "@prisma/client";
import { ADMIN_PAGE_SIZE } from "./admin-queries";
import { digits } from "./phone";
import { prisma } from "./prisma";
import { requireAdmin } from "./session";

export async function getAdminOrders({ status, q, page }: { status?: OrderStatus; q?: string; page: number }) {
  await requireAdmin();

  const term = q?.trim();
  const num = term ? digits(term).replace(/\D/g, "") : "";

  const where: Prisma.OrderWhereInput = {
    ...(status && { status }),
    ...(term && {
      OR: [
        { id: { endsWith: term.toLowerCase() } }, 
        { trackingCode: { contains: term, mode: "insensitive" } },
        { user: { username: { contains: term, mode: "insensitive" } } },
        { address: { fullName: { contains: term, mode: "insensitive" } } },
        ...(num.length >= 3
          ? [{ user: { phone: { contains: num } } }, { address: { phone: { contains: num } } }]
          : []),
      ],
    }),
  };

  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * ADMIN_PAGE_SIZE,
      take: ADMIN_PAGE_SIZE,
      select: {
        id: true,
        status: true,
        totalPrice: true,
        createdAt: true,
        trackingCode: true,
        user: { select: { username: true } },
        address: { select: { fullName: true } },
        _count: { select: { items: true } },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return { items, total, pageCount: Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE)) };
}

export async function getOrderCounts() {
  await requireAdmin();
  const rows = await prisma.order.groupBy({ by: ["status"], _count: { _all: true } });
  const counts: Record<OrderStatus, number> = {
    PENDING_PAYMENT: 0,
    PAID: 0,
    PROCESSING: 0,
    SHIPPED: 0,
    DELIVERED: 0,
    CANCELLED: 0,
  };
  for (const r of rows) counts[r.status] = r._count._all;
  return counts;
}

export async function getAdminOrder(id: string) {
  await requireAdmin();
  return prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      address: true,
      coupon: { select: { code: true } },
      user: { select: { username: true, phone: true } },
    },
  });
}