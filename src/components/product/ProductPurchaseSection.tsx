"use client";
import { useCallback, useState } from "react";
import ProductGallery from "./ProductGallery";
import PurchasePanel from "./PurchasePanel";
import type { ProductDetail, ProductVariantItem } from "@/types/products";
import TrustBadges from "./TrustBadges";

export default function ProductPurchaseSection({
  product,
  children,
}: {
  product: ProductDetail;
  children?: React.ReactNode;
}) {
  const [sel, setSel] = useState<{ variant: ProductVariantItem | null; n: number }>({ variant: null, n: 0 });
  const handleVariant = useCallback(
    (variant: ProductVariantItem | null) => setSel((s) => ({ variant, n: s.n + 1 })),
    [],
  );

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <ProductGallery images={product.images} name={product.name} selectedImage={sel.variant?.image} selectionKey={sel.n} />
      <div>
        {children}
        <PurchasePanel product={product} onVariantChange={handleVariant} />
        <TrustBadges />
      </div>
    </div>
  );
}