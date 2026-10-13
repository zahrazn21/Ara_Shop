"use server";
import { prisma } from "@/lib/prisma";

export type CartLineStatus = {
  productId: string;
  variantId: string | null;
  available: boolean;
  price: number; 
  stock: number;
};

type Ref = { productId: string; variantId: string | null };

export async function getCartStatus(refs: Ref[]): Promise<CartLineStatus[]> {
  const list = (Array.isArray(refs) ? refs : []).slice(0, 50);
  const ids = [...new Set(list.map((r) => String(r.productId)))];
  if (ids.length === 0) return [];

  const products = await prisma.product.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      price: true,
      stock: true,
      status: true,
      variants: { select: { id: true, stock: true, priceDiff: true } },
    },
  });
  const byId = new Map(products.map((p) => [p.id, p]));

  return list.map((r) => {
    const p = byId.get(r.productId);
    const gone = { productId: r.productId, variantId: r.variantId, available: false, price: 0, stock: 0 };
    if (!p) return gone;

    if (r.variantId) {
      const v = p.variants.find((x) => x.id === r.variantId);
      if (!v) return gone;
      return {
        productId: p.id,
        variantId: v.id,
        available: p.status === "ACTIVE" && v.stock > 0,
        price: p.price + v.priceDiff,
        stock: v.stock,
      };
    }

    // محصولی که تنوع دارد باید با تنوع در سبد باشد
    if (p.variants.length > 0) return gone;
    return {
      productId: p.id,
      variantId: null,
      available: p.status === "ACTIVE" && p.stock > 0,
      price: p.price,
      stock: p.stock,
    };
  });
}