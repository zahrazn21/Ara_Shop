import type { Prisma, ProductStatus, ReviewStatus } from "@prisma/client";
import { prisma } from "./prisma";

const REVENUE_STATUSES = ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] as const;

export async function getDashboardStats() {
  const [products, users, orders, pendingReviews, lowStock, revenue, recentOrders] =
    await Promise.all([
      prisma.product.count({ where: { status: "ACTIVE" } }),
      prisma.user.count(),
      prisma.order.count(),
      prisma.review.count({ where: { status: "PENDING" } }),
      prisma.product.count({
        where: { status: "ACTIVE", variants: { none: {} }, stock: { lte: 5 } },
      }),
      prisma.order.aggregate({
        _sum: { totalPrice: true },
        where: { status: { in: [...REVENUE_STATUSES] } },
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          totalPrice: true,
          status: true,
          createdAt: true,
          user: { select: { username: true } },
        },
      }),
    ]);

  return {
    products,
    users,
    orders,
    pendingReviews,
    lowStock,
    revenue: revenue._sum.totalPrice ?? 0,
    recentOrders,
  };
}



export const ADMIN_PAGE_SIZE = 20;

type ProductListParams = { q?: string; status?: ProductStatus; page: number };

export async function getAdminProducts({ q, status, page }: ProductListParams) {
  const where: Prisma.ProductWhereInput = {
    status: status ?? { not: "ARCHIVED" },
    ...(q && {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { slug: { contains: q, mode: "insensitive" } },
        { sku: { contains: q, mode: "insensitive" } },
        { brand: { contains: q, mode: "insensitive" } },
      ],
    }),
  };

  const [rows, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * ADMIN_PAGE_SIZE,
      take: ADMIN_PAGE_SIZE,
      select: {
        id: true,
        name: true,
        slug: true,
        image: true,
        brand: true,
        price: true,
        stock: true,
        status: true,
        category: { select: { name: true } },
        variants: { select: { stock: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  const items = rows.map(({ variants, ...p }) => ({
    ...p,
    variantCount: variants.length,
    totalStock: variants.length ? variants.reduce((n, v) => n + v.stock, 0) : p.stock,
  }));

  return { items, total, pageCount: Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE)) };
}

export async function getCategoryOptions() {
  const rows = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, parent: { select: { name: true } } },
  });
  return rows.map((c) => ({ id: c.id, label: c.parent ? `${c.parent.name} › ${c.name}` : c.name }));
}


export const ADMIN_REVIEWS_PAGE_SIZE = 15;

export async function getAdminReviews({ status, q, page }: { status?: ReviewStatus; q?: string; page: number }) {
  const where: Prisma.ReviewWhereInput = {
    ...(status && { status }),
    ...(q && {
      OR: [
        { comment: { contains: q, mode: "insensitive" } },
        { product: { name: { contains: q, mode: "insensitive" } } },
        { user: { username: { contains: q, mode: "insensitive" } } },
      ],
    }),
  };

  const [items, total] = await Promise.all([
    prisma.review.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * ADMIN_REVIEWS_PAGE_SIZE,
      take: ADMIN_REVIEWS_PAGE_SIZE,
      select: {
        id: true,
        rating: true,
        comment: true,
        imageUrls: true,
        status: true,
        adminNote: true,
        createdAt: true,
        user: { select: { username: true } },
        product: { select: { name: true, slug: true, image: true } },
      },
    }),
    prisma.review.count({ where }),
  ]);

  return { items, total, pageCount: Math.max(1, Math.ceil(total / ADMIN_REVIEWS_PAGE_SIZE)) };
}

export async function getReviewCounts() {
  const rows = await prisma.review.groupBy({ by: ["status"], _count: { _all: true } });
  const counts: Record<ReviewStatus, number> = { PENDING: 0, APPROVED: 0, REJECTED: 0 };
  for (const r of rows) counts[r.status] = r._count._all;
  return counts;
}
