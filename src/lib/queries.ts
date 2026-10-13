import { cache } from "react";
import { prisma } from "./prisma";
import {
  productCardSelect,
  productDetailInclude,
  type ProductCardData,
  type ProductDetail,
} from "@/types/products";

const NEW_DAYS = 14;

function toCard(rows: Awaited<ReturnType<typeof findCards>>): ProductCardData[] {
  const now = Date.now();
  return rows.map(({ createdAt, ...rest }) => ({
    ...rest,
    isNew: now - createdAt.getTime() < NEW_DAYS * 864e5,
  }));
}

const findCards = (args: { orderBy: object; take: number }) =>
  prisma.product.findMany({
    where: { status: "ACTIVE" },
    select: productCardSelect,
    ...args,
  });

export const getFeaturedProducts = async () =>
  toCard(await findCards({ orderBy: [{ reviewCount: "desc" }, { createdAt: "desc" }], take: 12 }));

export const getNewestProducts = async () =>
  toCard(await findCards({ orderBy: { createdAt: "desc" }, take: 4 }));



export const getCategories = () =>
  prisma.category.findMany({
    where: { parentId: null },
    select: { id: true, name: true, slug: true, image: true },
    take: 8,
  });


const PAGE_SIZE = 12;

const sorts = {
  newest: { createdAt: "desc" },
  popular: { reviewCount: "desc" },
  cheap: { price: "asc" },
  expensive: { price: "desc" },
} as const;

export type ProductSort = keyof typeof sorts;

export async function getProducts({
  page = 1, sort = "popular", category, categoryIds, q, minPrice, maxPrice, inStock,
}: {
  page?: number; sort?: ProductSort; category?: string; categoryIds?: string[]; q?: string;
  minPrice?: number; maxPrice?: number; inStock?: boolean;
}) {
  const where = {
    status: "ACTIVE" as const,
    ...(category && { category: { slug: category } }),
    ...(categoryIds && { categoryId: { in: categoryIds } }),
    ...(q && { name: { contains: q, mode: "insensitive" as const } }),
    ...((minPrice || maxPrice) && {
      price: { ...(minPrice && { gte: minPrice }), ...(maxPrice && { lte: maxPrice }) },
    }),
    ...(inStock && {
      OR: [{ stock: { gt: 0 } }, { variants: { some: { stock: { gt: 0 } } } }],
    }),
  };
  const [rows, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: sorts[sort] ?? sorts.newest,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: productCardSelect,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products: toCard(rows),
    total,
    totalPages: Math.ceil(total / PAGE_SIZE),
  };
}

export async function getPriceBounds() {
  const { _min, _max } = await prisma.product.aggregate({
    where: { status: "ACTIVE" },
    _min: { price: true },
    _max: { price: true },
  });
  const min = Math.floor((_min.price ?? 0) / 10000) * 10000;
  const max = Math.ceil((_max.price ?? 0) / 10000) * 10000;
  return { min, max: Math.max(max, min + 10000) };
}



export const getProductBySlug = cache(async (rawSlug: string): Promise<ProductDetail | null> => {
  const slug = decodeURIComponent(rawSlug);
  const p = await prisma.product.findFirst({
    where: { slug, status: "ACTIVE" },
    include: productDetailInclude,
  });
  if (!p) return null;

  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    originalPrice: p.originalPrice,
    image: p.image,
    images: p.images?.length ? p.images : [p.image],
    brand: p.brand,
    sku: p.sku,
    description: p.description,
    features: p.features ?? [],
    specifications: (p.specifications as Record<string, string> | null) ?? null,
    subtitle: p.subtitle,
    volume: p.volume,
    volumeUnit: p.volumeUnit,
    countryOfOrigin: p.countryOfOrigin,
    barcode: p.barcode,
    healthLicense: p.healthLicense,
    ingredients: p.ingredients,
    usage: p.usage,
    warnings: p.warnings,
    skinTypes: p.skinTypes ?? [],
    gender: p.gender,
    paoMonths: p.paoMonths,
    tags: p.tags ?? [],
    stock: p.stock,
    status: p.status,
    rating: p.rating,
    reviewCount: p.reviewCount,
    category: p.category,
    variants: p.variants.map((v) => ({
      id: v.id,
      color: v.color,
      colorHex: v.colorHex,
      image: v.image,
      size: v.size,
      number: v.number,
      sku: v.sku,
      stock: v.stock,
      priceDiff: v.priceDiff,
    })),
  };
});

const RELATED_LIMIT = 12;
const RELATED_MIN = 8;


export async function getRelatedProducts(categoryId: string, excludeId: string, brand?: string | null) {
  const sameCategory = await prisma.product.findMany({
    where: { status: "ACTIVE", categoryId, id: { not: excludeId } },
    select: productCardSelect,
    orderBy: { reviewCount: "desc" },
    take: RELATED_LIMIT,
  });

  let rows = sameCategory;
  if (brand && rows.length < RELATED_MIN) {
    const exclude = [excludeId, ...rows.map((r) => r.id)];
    const sameBrand = await prisma.product.findMany({
      where: { status: "ACTIVE", brand, id: { notIn: exclude } },
      select: productCardSelect,
      orderBy: { reviewCount: "desc" },
      take: RELATED_LIMIT - rows.length,
    });
    rows = [...rows, ...sameBrand];
  }
  return toCard(rows);
}


export const getProductReviews = (productId: string, take = 10) =>
  prisma.review.findMany({
    where: { productId, status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    take,
    select: {
      id: true,
      rating: true,
      comment: true,
      imageUrls: true,
      createdAt: true,
      user: { select: { username: true } },
    },
  });


export const getCategoryBySlug = cache(async (rawSlug: string) => {
  let slug = rawSlug;
  try {
    slug = decodeURIComponent(rawSlug);
  } catch {
    return null;
  }

  return prisma.category.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      image: true,
      parent: { select: { name: true, slug: true } },
      children: {
        orderBy: { name: "asc" },
        select: { id: true, name: true, slug: true, image: true },
      },
    },
  });
});