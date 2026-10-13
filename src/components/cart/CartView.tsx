"use client";

import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getCartStatus, type CartLineStatus } from "@/app/actions/cart";
import { useHydrated } from "@/hooks/use-hydrated";
import { toman } from "@/lib/format";
import { useCartStore } from "@/store/cart-store";

const key = (p: string, v: string | null) => `${p}:${v ?? ""}`;

export default function CartView() {
  const hydrated = useHydrated();
  const items = useCartStore((s) => s.items);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clear = useCartStore((s) => s.clear);

  const [status, setStatus] = useState<Record<string, CartLineStatus>>({});
  const [checkedKey, setCheckedKey] = useState<string | null>(null);

  const refsKey = items.map((i) => key(i.productId, i.variantId)).join("|");
  const checked = items.length === 0 || checkedKey === refsKey;

  useEffect(() => {
    if (!hydrated || items.length === 0) return;
    let cancelled = false;
    getCartStatus(items.map((i) => ({ productId: i.productId, variantId: i.variantId })))
      .then((rows) => {
        if (cancelled) return;
        setStatus(Object.fromEntries(rows.map((r) => [key(r.productId, r.variantId), r])));
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setCheckedKey(refsKey);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, refsKey]);

  const lines = useMemo(
    () =>
      items.map((i) => {
        const st = status[key(i.productId, i.variantId)];
        const unavailable = st ? !st.available : false;
        const price = st && st.available ? st.price : i.price;
        const overStock = !!st && st.available && i.quantity > st.stock;
        const priceChanged = !!st && st.available && st.price !== i.price;
        return { ...i, st, unavailable, price, oldPrice: i.price, overStock, priceChanged };
      }),
    [items, status]
  );

  const payable = lines.filter((l) => !l.unavailable);
  const count = payable.reduce((n, l) => n + l.quantity, 0);
  const subtotal = payable.reduce((n, l) => n + l.price * l.quantity, 0);
  const blocked = lines.some((l) => l.unavailable || l.overStock);

  if (!hydrated) {
    return <div className="h-64 animate-pulse rounded-xl bg-blush-100" aria-hidden />;
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-blush-300 bg-white px-6 py-16 text-center">
        <ShoppingBag size={36} className="text-plum-600" />
        <p className="text-sm text-plum-900">سبد خرید شما خالی است.</p>
        <Link href="/products" className="rounded-lg bg-plum-700 px-5 py-2 text-sm text-white hover:bg-plum-900">
          مشاهده محصولات
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <ul className="divide-y divide-blush-200 rounded-xl border border-blush-200 bg-white h-fit">
        {lines.map((l) => (
          <li key={key(l.productId, l.variantId)} className="flex gap-4 p-4">
            <Image
              src={l.image}
              alt=""
              width={80}
              height={80}
              className="size-20 shrink-0 rounded-lg border border-blush-200 object-cover"
            />

            <div className="min-w-0 flex-1 space-y-2">
              <p className="text-sm font-bold text-plum-900">{l.name}</p>

              {l.unavailable ? (
                <p className="text-xs text-red-600">این کالا دیگر موجود نیست. آن را از سبد حذف کنید.</p>
              ) : (
                <>
                  <p className="text-sm text-plum-900">
                    {toman(l.price)} <span className="text-xs">تومان</span>
                  </p>
                  {l.priceChanged && (
                    <p className="text-xs text-amber-700">
                      قیمت تغییر کرده است (هنگام افزودن: {toman(l.oldPrice)} تومان).
                    </p>
                  )}
                </>
              )}

              {l.overStock && l.st && (
                <p className="text-xs text-red-600">
                  فقط {toman(l.st.stock)} عدد موجود است.{" "}
                  <button
                    onClick={() => setQuantity(l.productId, l.variantId, l.st!.stock)}
                    className="underline"
                  >
                    تنظیم تعداد
                  </button>
                </p>
              )}

              <div className="flex items-center justify-between">
                {!l.unavailable && (
                  <div className="flex items-center rounded-lg border border-blush-200">
                    <button
                      aria-label="زیاد کردن"
                      onClick={() => setQuantity(l.productId, l.variantId, l.quantity + 1)}
                      disabled={!!l.st && l.quantity >= l.st.stock}
                      className="grid size-8 place-items-center text-plum-700 disabled:text-gray-300"
                    >
                      <Plus size={14} />
                    </button>
                    <span className="w-8 text-center text-sm">{toman(l.quantity)}</span>
                    <button
                      aria-label="کم کردن"
                      onClick={() => setQuantity(l.productId, l.variantId, l.quantity - 1)}
                      className="grid size-8 place-items-center text-plum-700"
                    >
                      <Minus size={14} />
                    </button>
                  </div>
                )}
                <button
                  onClick={() => removeItem(l.productId, l.variantId)}
                  aria-label="حذف از سبد"
                  className="mr-auto flex items-center gap-1 text-xs text-red-600 hover:underline"
                >
                  <Trash2 size={14} /> حذف
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <aside className="h-fit space-y-4 rounded-xl border border-blush-200 bg-white p-5 text-sm lg:sticky lg:top-24">
        <h2 className="font-bold text-plum-900">خلاصه سفارش</h2>
        <dl className="space-y-2">
          <div className="flex justify-between">
            <dt className="text-plum-600">تعداد کالا</dt>
            <dd>{toman(count)}</dd>
          </div>
          <div className="flex justify-between border-t border-blush-200 pt-2 font-bold text-plum-900">
            <dt>جمع کل</dt>
            <dd>{toman(subtotal)} تومان</dd>
          </div>
        </dl>
        <p className="text-xs text-plum-600">هزینه ارسال و کد تخفیف در مرحله بعد اعمال می‌شود.</p>

        {blocked && (
          <p role="alert" className="text-xs text-red-600">
            برای ادامه، کالاهای ناموجود را حذف یا تعداد را اصلاح کنید.
          </p>
        )}

        {blocked ? (
          <button disabled className="w-full cursor-not-allowed rounded-xl bg-plum-700 py-3 text-white opacity-50">
            ادامه و ثبت سفارش
          </button>
        ) : (
          <Link
            href="/checkout"
            className="block w-full rounded-xl bg-plum-700 py-3 text-center text-white hover:bg-plum-900"
          >
            ادامه و ثبت سفارش
          </Link>
        )}

        <button onClick={clear} className="w-full text-xs text-plum-600 hover:underline">
          خالی کردن سبد
        </button>
        {!checked && <p className="text-center text-xs text-plum-600">در حال بررسی موجودی…</p>}
      </aside>
    </div>
  );
}