"use client";

import { Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import {
  createAddress,
  placeOrder,
  quoteOrder,
  type AddressItem,
  type Quote,
} from "@/app/actions/checkout";
import { Field, inputClass } from "@/components/admin/fields";
import { useHydrated } from "@/hooks/use-hydrated";
import { toman } from "@/lib/format";
import { useCartStore } from "@/store/cart-store";

export default function CheckoutView({ initialAddresses }: { initialAddresses: AddressItem[] }) {
  const router = useRouter();
  const hydrated = useHydrated();
  const items = useCartStore((s) => s.items);
  const clear = useCartStore((s) => s.clear);

  const [addresses, setAddresses] = useState(initialAddresses);
  const [addressId, setAddressId] = useState<string | null>(initialAddresses[0]?.id ?? null);
  const [adding, setAdding] = useState(initialAddresses.length === 0);
  const [addrError, setAddrError] = useState<string>();
  const [savingAddr, startSaveAddr] = useTransition();

  const onSaveAddress = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget); 
    setAddrError(undefined);
    startSaveAddr(async () => {
      const r = await createAddress(fd);
      if (!r.ok) return setAddrError(r.error);
      setAddresses((l) => [...l, r.address]);
      setAddressId(r.address.id);
      setAdding(false);
    });
  };

  const [codeInput, setCodeInput] = useState("");
  const [code, setCode] = useState("");
  const [quoteState, setQuoteState] = useState<{ key: string; quote: Quote } | null>(null);

  const lines = useMemo(
    () => items.map((i) => ({ productId: i.productId, variantId: i.variantId, quantity: i.quantity })),
    [items]
  );
  const quoteKey = JSON.stringify([lines, code]);
  const quote = quoteState?.key === quoteKey ? quoteState.quote : null; // null = در حال محاسبه

  useEffect(() => {
    if (!hydrated || lines.length === 0) return;
    let cancelled = false;
    quoteOrder(lines, code)
      .then((q) => !cancelled && setQuoteState({ key: quoteKey, quote: q }))
      .catch(
        () =>
          !cancelled &&
          setQuoteState({ key: quoteKey, quote: { ok: false, error: "ارتباط با سرور برقرار نشد." } })
      );
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, quoteKey]);

  const [placing, startPlace] = useTransition();
  const [error, setError] = useState<string>();
  const [done, setDone] = useState(false);

  const onPlace = () => {
    if (!addressId) return setError("یک آدرس انتخاب کنید.");
    setError(undefined);
    startPlace(async () => {
      const r = await placeOrder(lines, addressId, code);
      if (!r.ok) return setError(r.error);
      setDone(true); 
      clear();
      router.push(`/orders/${r.orderId}`);
    });
  };

  if (!hydrated) return <div className="h-64 animate-pulse rounded-xl bg-blush-100" aria-hidden />;

  if (done) return <p className="py-16 text-center text-sm text-plum-600">سفارش ثبت شد. در حال انتقال…</p>;

  if (items.length === 0)
    return (
      <div className="rounded-xl border border-dashed border-blush-300 bg-white px-6 py-16 text-center text-sm">
        <p className="mb-4 text-plum-900">سبد خرید شما خالی است.</p>
        <Link href="/products" className="rounded-lg bg-plum-700 px-5 py-2 text-white hover:bg-plum-900">
          مشاهده محصولات
        </Link>
      </div>
    );

  const ok = quote?.ok ? quote : null;
  const canPlace = !!ok && !!addressId && !placing;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
      <div className="space-y-6">
        <section className="space-y-3 rounded-xl border border-blush-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-plum-900">آدرس تحویل</h2>
            {!adding && (
              <button
                onClick={() => setAdding(true)}
                className="flex items-center gap-1 text-xs text-plum-700 hover:underline"
              >
                <Plus size={14} /> آدرس جدید
              </button>
            )}
          </div>

          {addresses.length > 0 && (
            <ul className="space-y-2">
              {addresses.map((a) => (
                <li key={a.id}>
                  <label
                    className={`flex cursor-pointer gap-3 rounded-lg border p-3 text-sm ${
                      addressId === a.id ? "border-plum-700 bg-blush-100" : "border-blush-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={addressId === a.id}
                      onChange={() => setAddressId(a.id)}
                      className="mt-1"
                    />
                    <span className="space-y-1">
                      <span className="block font-bold text-plum-900">
                        {a.title ? `${a.title} — ` : ""}
                        {a.fullName}
                      </span>
                      <span className="block text-plum-700">
                        {a.province}، {a.city}، {a.addressLine}
                      </span>
                      <span className="block text-xs text-plum-600">
                        کد پستی {a.postalCode} · موبایل {a.phone}
                      </span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          )}

          {adding && (
            <form onSubmit={onSaveAddress} className="space-y-3 border-t border-blush-200 pt-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="عنوان (اختیاری)">
                  <input name="title" placeholder="خانه، محل کار…" className={inputClass} />
                </Field>
                <Field label="نام و نام خانوادگی گیرنده">
                  <input name="fullName" required className={inputClass} />
                </Field>
                <Field label="شماره موبایل">
                  <input name="phone" required inputMode="numeric" dir="ltr" placeholder="09123456789" className={`${inputClass} text-left`} />
                </Field>
                <Field label="کد پستی">
                  <input name="postalCode" required inputMode="numeric" dir="ltr" maxLength={10} className={`${inputClass} text-left`} />
                </Field>
                <Field label="استان">
                  <input name="province" required className={inputClass} />
                </Field>
                <Field label="شهر">
                  <input name="city" required className={inputClass} />
                </Field>
              </div>
              <Field label="نشانی کامل">
                <textarea name="addressLine" required rows={3} className={inputClass} />
              </Field>

              {addrError && (
                <p role="alert" className="text-xs text-red-600">
                  {addrError}
                </p>
              )}

              <div className="flex justify-end gap-2">
                {addresses.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setAdding(false)}
                    className="rounded-lg border border-blush-300 px-4 py-2 text-sm text-plum-700 hover:bg-blush-100"
                  >
                    انصراف
                  </button>
                )}
                <button
                  disabled={savingAddr}
                  className="rounded-lg bg-plum-700 px-5 py-2 text-sm text-white hover:bg-plum-900 disabled:opacity-60"
                >
                  {savingAddr ? "در حال ذخیره…" : "ذخیره آدرس"}
                </button>
              </div>
            </form>
          )}
        </section>

        <section className="rounded-xl border border-blush-200 bg-white p-5">
          <h2 className="mb-3 text-sm font-bold text-plum-900">کالاهای سفارش</h2>
          {quote === null && <p className="text-xs text-plum-600">در حال بررسی قیمت و موجودی…</p>}
          {quote && !quote.ok && (
            <p role="alert" className="text-sm text-red-600">
              {quote.error}{" "}
              <Link href="/cart" className="underline">
                بازگشت به سبد
              </Link>
            </p>
          )}
          {ok && (
            <ul className="divide-y divide-blush-200">
              {ok.items.map((i) => (
                <li key={`${i.productId}:${i.variantId ?? ""}`} className="flex items-center gap-3 py-3 text-sm">
                  <Image src={i.image} alt="" width={48} height={48} className="size-12 rounded-lg border border-blush-200 object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-plum-900">{i.name}</p>
                    {i.variantLabel && <p className="text-xs text-plum-600">{i.variantLabel}</p>}
                  </div>
                  <span className="text-xs text-plum-600">{toman(i.quantity)} ×</span>
                  <span>{toman(i.price)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <aside className="h-fit space-y-4 rounded-xl border border-blush-200 bg-white p-5 text-sm lg:sticky lg:top-24">
        <h2 className="font-bold text-plum-900">خلاصه پرداخت</h2>

        <div>
          <div className="flex gap-2">
            <input
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              placeholder="کد تخفیف"
              dir="ltr"
              className={`${inputClass} text-left`}
            />
            <button
              onClick={() => setCode(codeInput.trim())}
              disabled={!codeInput.trim()}
              className="shrink-0 rounded-lg border border-plum-700 px-3 text-plum-700 hover:bg-blush-100 disabled:opacity-50"
            >
              اعمال
            </button>
          </div>
          {ok?.couponError && <p className="mt-1 text-xs text-red-600">{ok.couponError}</p>}
          {ok && code && !ok.couponError && (
            <p className="mt-1 text-xs text-green-700">
              کد اعمال شد.{" "}
              <button
                onClick={() => {
                  setCode("");
                  setCodeInput("");
                }}
                className="underline"
              >
                حذف
              </button>
            </p>
          )}
        </div>

        {ok ? (
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="text-plum-600">جمع کالاها</dt>
              <dd>{toman(ok.subtotal)}</dd>
            </div>
            {ok.discount > 0 && (
              <div className="flex justify-between text-green-700">
                <dt>تخفیف</dt>
                <dd>− {toman(ok.discount)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-plum-600">هزینه ارسال</dt>
              <dd>{ok.shipping === 0 ? "رایگان" : toman(ok.shipping)}</dd>
            </div>
            <div className="flex justify-between border-t border-blush-200 pt-2 font-bold text-plum-900">
              <dt>مبلغ قابل پرداخت</dt>
              <dd>{toman(ok.total)} تومان</dd>
            </div>
          </dl>
        ) : (
          <p className="text-xs text-plum-600">{quote === null ? "در حال محاسبه…" : "مبلغ قابل محاسبه نیست."}</p>
        )}

        {error && (
          <p role="alert" className="text-xs text-red-600">
            {error}
          </p>
        )}

        <button
          onClick={onPlace}
          disabled={!canPlace}
          className="w-full rounded-xl bg-plum-700 py-3 text-white hover:bg-plum-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {placing ? "در حال ثبت…" : "ثبت سفارش"}
        </button>
        {!addressId && <p className="text-xs text-plum-600">برای ادامه یک آدرس انتخاب یا ثبت کنید.</p>}
      </aside>
    </div>
  );
}