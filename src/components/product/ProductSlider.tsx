"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "@/components/product/ProductCard";
import type { ProductCardData } from "@/types/products";

type Props = {
  title: string;
  href?: string;
  products: ProductCardData[];
  compact?: boolean;
  className?: string;
};


export default function ProductSlider({ title, href, products, compact, className = "" }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ atStart: true, atEnd: true });

  const update = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const pos = Math.abs(el.scrollLeft);
    const max = el.scrollWidth - el.clientWidth;
    const atStart = pos < 4;
    const atEnd = pos > max - 4;
    setEdge((p) => (p.atStart === atStart && p.atEnd === atEnd ? p : { atStart, atEnd }));
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    el.addEventListener("scroll", update, { passive: true });
    return () => {
      ro.disconnect();
      el.removeEventListener("scroll", update);
    };
  }, [update, products.length]);

  const scrollByPage = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const rtl = getComputedStyle(el).direction === "rtl";
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({
      left: (rtl ? -1 : 1) * dir * el.clientWidth * 0.9,
      behavior: reduce ? "auto" : "smooth",
    });
  };

  if (products.length === 0) return null;

  const arrow =
    "absolute top-1/2 z-20 hidden size-10 -translate-y-1/2 place-items-center rounded-full border border-blush-200 bg-white text-plum-700 shadow-md transition-colors hover:bg-blush-100 md:grid";

  return (
    <section aria-roledescription="carousel" aria-label={title} className={className}>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-bold text-plum-900">{title}</h2>
        {href && (
          <Link href={href} className="text-xs text-plum-700 hover:underline">
            مشاهده همه
          </Link>
        )}
      </div>

      <div className="relative">
        {!edge.atStart && (
          <button type="button" onClick={() => scrollByPage(-1)} aria-label="قبلی" className={`${arrow} inset-s-1`}>
            <ChevronRight size={20} />
          </button>
        )}
        {!edge.atEnd && (
          <button type="button" onClick={() => scrollByPage(1)} aria-label="بعدی" className={`${arrow} inset-e-1`}>
            <ChevronLeft size={20} />
          </button>
        )}

        <div
          ref={trackRef}
          className="scrollbar-hide -mx-1 -my-2 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 py-2 sm:gap-4"
        >
          {products.map((p, i) => (
            <div
              key={p.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} از ${products.length}`}
              className="flex shrink-0 basis-[44%] snap-start sm:basis-[30%] md:basis-[20%] lg:basis-[15%]"
            >
              <ProductCard product={p} compact={compact} className="h-full w-full" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
