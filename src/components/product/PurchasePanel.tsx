"use client";
import { useEffect, useState } from "react";
import { Check, Minus, Plus, ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { discountPercent, toman } from "@/lib/format";
import type { ProductDetail, ProductVariantItem } from "@/types/products";
import { colorSwatch } from "@/lib/colors";

const MAX_QTY = 99; 

const variantLabel = (v: ProductVariantItem) =>
  [v.color, v.size, v.number].filter(Boolean).join(" / ") || v.sku || "پیش‌فرض";

const LOW_STOCK = 5;

export default function PurchasePanel({
  product,
  children,
  onVariantChange,
}: {
  product: ProductDetail;
  children?: React.ReactNode;
  onVariantChange?: (variant: ProductVariantItem | null) => void;
}) {
  const addItem = useCartStore((s) => s.addItem);

  const hasVariants = product.variants.length > 0;
  const [variantId, setVariantId] = useState<string | null>(
    () => product.variants.find((v) => v.stock > 0)?.id ?? null
  );
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const variant = product.variants.find((v) => v.id === variantId) ?? null;

  useEffect(() => {
    onVariantChange?.(variant);
  }, [variant, onVariantChange]);
  const diff = variant?.priceDiff ?? 0;
  const price = product.price + diff;
  const original = product.originalPrice ? product.originalPrice + diff : null;
  const off = discountPercent(price, original);

  const stock = hasVariants ? (variant?.stock ?? 0) : product.stock;
  const soldOut = stock <= 0;
  const maxQty = Math.min(stock, MAX_QTY);

  const selectVariant = (id: string) => {
    setVariantId(id);
    onVariantChange?.(product.variants.find((v) => v.id === id) ?? null); 
    setQty(1);
    setAdded(false);
  };

  const handleAdd = () => {
    addItem(
      {
        productId: product.id,
        variantId,
        name: variant ? `${product.name} - ${variantLabel(variant)}` : product.name,
        price,
        image: product.image,
      },
      qty
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="mt-6 space-y-5">
      <div className="flex items-center justify-between gap-4 rounded-xl border border-blush-200 bg-white px-5 py-4">
        <p>
          <span className="text-2xl font-bold text-plum-900">{toman(price)}</span>{" "}
          <span className="text-sm text-plum-600">تومان</span>
        </p>
        {original && off > 0 && (
          <p className="flex items-center gap-2 text-sm">
            <span className="text-gray-400 line-through">{toman(original)}</span>
            <span className="rounded-full bg-plum-700 px-2 py-0.5 text-[11px] text-white">
              {toman(off)}٪ تخفیف
            </span>
          </p>
        )}
      </div>

      {children}

      {hasVariants && (
        <div>
          <h2 className="mb-3 text-sm font-bold text-plum-900">انتخاب تنوع</h2>
          <div role="radiogroup" aria-label="انتخاب تنوع" className="flex flex-wrap gap-3">
            {product.variants.map((v) => {
              const selected = v.id === variantId;
              const out = v.stock <= 0;
              const swatch = v.colorHex ?? colorSwatch(v.color);
              return (
                <button
                  key={v.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  disabled={out}
                  onClick={() => selectVariant(v.id)}
                  className={`relative min-w-32 rounded-xl border-2 bg-white px-4 py-3 text-right transition-colors ${
                    selected ? "border-plum-700" : "border-blush-200 hover:border-blush-300"
                  } ${out ? "cursor-not-allowed opacity-50" : ""}`}
                >
                  {selected && (
                    <span className="absolute -top-2 -right-2 grid size-5 place-items-center rounded-full bg-plum-700 text-white">
                      <Check size={12} />
                    </span>
                  )}
                  <span className="flex items-center gap-2 text-sm font-bold text-plum-900">
                    {swatch && (
                      <span
                        aria-hidden
                        className="size-4 shrink-0 rounded-full border border-black/10"
                        style={{ backgroundColor: swatch }}
                      />
                    )}
                    {variantLabel(v)}
                  </span>
                  <span className="mt-1 block text-xs text-plum-600">
                    {out ? "ناموجود" : `${toman(product.price + v.priceDiff)} تومان`}
                  </span>
                </button>
              );
            })}
          </div>

          {variant && (
            <p className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-1 rounded-xl bg-white px-4 py-3 text-sm">
              <span>
                <span className="text-plum-600">تنوع: </span>
                <b className="text-plum-900">{variantLabel(variant)}</b>
              </span>
              <span>
                <span className="text-plum-600">موجودی: </span>
                <b className="text-green-700">{toman(variant.stock)} عدد</b>
              </span>
            </p>
          )}
        </div>
      )}
      {!soldOut && stock <= LOW_STOCK && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
          تنها {toman(stock)} عدد در انبار باقی مانده است.
        </p>
      )}

      {!soldOut && (
        <div>
          <p className="mb-2 text-sm font-bold text-plum-900">تعداد:</p>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center rounded-full border border-blush-200 bg-white">
              <button
                type="button"
                aria-label="کم کردن"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={qty <= 1}
                className="grid size-10 place-items-center text-plum-700 disabled:text-gray-300"
              >
                <Minus size={16} />
              </button>
              <span className="w-10 text-center text-sm font-bold">{toman(qty)}</span>
              <button
                type="button"
                aria-label="زیاد کردن"
                onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                disabled={qty >= maxQty}
                className="grid size-10 place-items-center text-plum-700 disabled:text-gray-300"
              >
                <Plus size={16} />
              </button>
            </div>
            <span className="text-xs text-plum-600">
              {stock > MAX_QTY
                ? `حداکثر ${toman(MAX_QTY)} عدد در هر سفارش`
                : `حداکثر ${toman(stock)} عدد موجود است`}
            </span>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={handleAdd}
        disabled={soldOut}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-plum-700 py-3 text-sm text-white hover:bg-plum-900 disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        {added ? (
          <>
            <Check size={16} /> به سبد اضافه شد
          </>
        ) : soldOut ? (
          "ناموجود"
        ) : (
          <>
            <ShoppingCart size={16} /> افزودن به سبد خرید
          </>
        )}
      </button>
    </div>
  );
}