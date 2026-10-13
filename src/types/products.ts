import type { Gender, Prisma, ProductStatus, SkinType, VolumeUnit } from "@prisma/client";
export type { ProductStatus };

export const productCardSelect = {
  id: true, name: true, slug: true, price: true, originalPrice: true,
  image: true, brand: true, rating: true, reviewCount: true, createdAt: true,
  _count: { select: { variants: true } },
} satisfies Prisma.ProductSelect;

export const productDetailInclude = {
  category: { select: { id: true, name: true, slug: true } },
  variants: { orderBy: { createdAt: "asc" } },
} satisfies Prisma.ProductInclude;

export type ProductCardRow = Prisma.ProductGetPayload<{ select: typeof productCardSelect }>;
export type ProductDetailRow = Prisma.ProductGetPayload<{ include: typeof productDetailInclude }>;


export type ProductCardData = Omit<ProductCardRow, "createdAt"> & {
  isNew: boolean;
};

export type ProductVariantItem = {
  id: string;
  color: string | null;
  colorHex: string | null;
  image: string | null;
  size: string | null;
  number: string | null;
  sku: string | null;
  stock: number;
  priceDiff: number; 
};

export type ProductDetail = {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice: number | null;
  image: string;
  images: string[];
  brand: string | null;
  sku: string | null;  
  description: string | null;
  features: string[];
  specifications: Record<string, string> | null;
  subtitle: string | null;
  volume: number | null;
  volumeUnit: VolumeUnit | null;
  countryOfOrigin: string | null;
  barcode: string | null;
  healthLicense: string | null;
  ingredients: string | null;
  usage: string | null;
  warnings: string | null;
  skinTypes: SkinType[];
  gender: Gender | null;
  paoMonths: number | null;
  tags: string[];
  stock: number; 
  status: ProductStatus;
  rating: number;
  reviewCount: number;
  category: { id: string; name: string; slug: string };
  variants: ProductVariantItem[];
  
};


export type AddToCartInput = {
  productId: string;
  variantId: string | null;
  name: string;
  price: number;
  image: string;
};