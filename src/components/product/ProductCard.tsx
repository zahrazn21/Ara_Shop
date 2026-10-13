"use client";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, SlidersHorizontal, Star } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { discountPercent, toman } from "@/lib/format";
import type { ProductCardData } from "@/types/products";

export type CardView = "grid" | "list";

type Props = {
  product: ProductCardData;
  compact?: boolean;
  width?: number;
  className?: string;
  view?: CardView;
};

export default function ProductCard({ product: p, compact, width, className = "", view = "grid" }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const off = discountPercent(p.price, p.originalPrice);
  const hasVariants = p._count.variants > 0;
  const href = `/products/${p.slug}`;

  const badge =
    off > 0 || p.isNew ? (
      <span className="absolute top-2 left-2 z-10 rounded-full bg-plum-700 px-2 py-0.5 text-[10px] font-medium text-white">
        {off > 0 ? `${toman(off)}٪ تخفیف` : "جدید"}
      </span>
    ) : null;

  const round = "grid size-9 shrink-0 place-items-center rounded-full bg-plum-700 text-white transition-colors hover:bg-plum-900";
  const action = compact ? null : hasVariants ? (
    <Link href={href} aria-label="انتخاب مشخصات" title="انتخاب مشخصات" className={round}>
      <SlidersHorizontal size={15} />
    </Link>
  ) : (
    <button
      type="button"
      aria-label="افزودن به سبد"
      title="افزودن به سبد"
      onClick={() => addItem({ productId: p.id, variantId: null, name: p.name, price: p.price, image: p.image })}
      className={round}
    >
      <ShoppingCart size={15} />
    </button>
  );

  const rating = !compact && (
    <p className="flex items-center gap-1 text-[11px] text-plum-600">
      <Star size={12} fill="currentColor" className="text-gold" />
      <span className="font-medium text-ink">{toman(p.rating)}</span>
      <span>({toman(p.reviewCount)})</span>
    </p>
  );

  const price = (
    <div className="leading-tight">
      {p.originalPrice && off > 0 && (
        <p className="text-[11px] text-gray-400 line-through">{toman(p.originalPrice)}</p>
      )}
      <p className="text-sm font-bold text-plum-900">
        {toman(p.price)} <span className="text-[11px] font-normal">تومان</span>
      </p>
    </div>
  );

  if (view === "list") {
    return (
      <article className={`group relative flex gap-4 rounded-xl border border-blush-200 bg-white p-3 transition-shadow hover:shadow-md ${className}`}>
        {badge}
        <Link href={href} className="relative aspect-square w-28 shrink-0 overflow-hidden rounded-lg bg-blush-100/60 sm:w-36">
          <Image src={p.image} alt={p.name} fill sizes="144px" className="object-contain p-3 transition-transform duration-500 group-hover:scale-105" />
        </Link>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5 py-1">
          {p.brand && <p className="text-[11px] text-plum-600">{p.brand}</p>}
          <Link href={href}>
            <h3 className="line-clamp-2 text-sm font-bold text-plum-900 hover:underline">{p.name}</h3>
          </Link>
          {rating}
          <div className="mt-auto flex items-end justify-between gap-3 pt-2">
            {price}
            {action}
          </div>
        </div>
      </article>
    );
  }
  return (
    <article
      style={width ? { width } : undefined}
      className={`group relative flex flex-col rounded-xl border border-blush-200 bg-white  p-2.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-blush-300 hover:shadow-md ${className}`}
    >
      {badge}
      <Link href={href} className="flex flex-1 flex-col">
        <div className="relative aspect-square overflow-hidden rounded-lg bg-white border-dashed border-2 border-gold ">
          <Image src={p.image} alt={p.name} fill sizes="(min-width:1024px) 220px, 45vw" className="object-contain p-4 transition-transform duration-500 group-hover:scale-105" />
        </div>
        <div className="mt-3 space-y-1 px-0.5">
          {p.brand && !compact && <p className="truncate text-[11px] text-plum-600">{p.brand}</p>}
          <h3 className="line-clamp-2 min-h-10 text-xs leading-5 text-ink">{p.name}</h3>
          {rating}
        </div>
      </Link>

      <div className="mt-2 flex min-h-11 items-end justify-between gap-2 px-0.5">
        {price}
        {action}
      </div>
    </article>
  );
}