"use client";
import { useState, useTransition } from "react";
import type { OrderStatus } from "@prisma/client";
import { changeOrderStatus, updateTrackingCode, type OrderActionState } from "@/app/actions/orders";
import { ORDER_STATUS_LABEL } from "@/lib/labels";
import { inputClass } from "./fields";

const TRACKABLE: OrderStatus[] = ["PROCESSING", "SHIPPED", "DELIVERED"];

export default function OrderActions({
  id,
  status,
  next,
  trackingCode,
}: {
  id: string;
  status: OrderStatus;
  next: OrderStatus[];
  trackingCode: string | null;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [code, setCode] = useState(trackingCode ?? "");

  const run = (fn: () => Promise<OrderActionState>) => {
    setError(null);
    setDone(false);
    start(async () => {
      const r = await fn();
      if (r?.error) setError(r.error);
      else setDone(true);
    });
  };

  const change = (to: OrderStatus) => {
    if (
      to === "CANCELLED" &&
      !window.confirm(
        "سفارش لغو شود؟ موجودی کالاها و استفاده از کوپن برگردانده می‌شود. (اگر مبلغی پرداخت شده، بازگرداندن وجه را جداگانه انجام دهید.)",
      )
    )
      return;
    run(() => changeOrderStatus(id, to, code));
  };

  return (
    <div className="space-y-4">
      {next.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {next.map((s) => (
            <button
              key={s}
              type="button"
              disabled={pending}
              onClick={() => change(s)}
              className={`rounded-lg px-4 py-2 text-xs disabled:opacity-50 ${
                s === "CANCELLED" ? "text-red-600 hover:bg-red-50" : "bg-plum-700 text-white hover:bg-plum-900"
              }`}
            >
              {s === "CANCELLED" ? "لغو سفارش" : `تغییر به «${ORDER_STATUS_LABEL[s]}»`}
            </button>
          ))}
        </div>
      ) : (
        <p className="text-xs text-plum-600">این سفارش به وضعیت نهایی رسیده و قابل تغییر نیست.</p>
      )}

      {status === "PENDING_PAYMENT" && (
        <p className="text-xs text-plum-600">
          تا وقتی درگاه پرداخت وصل نشده، اگر مشتری مبلغ را به‌صورت دستی (مثلاً کارت‌به‌کارت) پرداخت کرد، سفارش را «پرداخت‌شده» کنید.
        </p>
      )}

      {TRACKABLE.includes(status) && (
        <div className="space-y-2 rounded-lg bg-blush-100/60 p-3">
          <label className="block text-xs text-plum-900">
            کد رهگیری مرسوله (اختیاری)
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={30}
              dir="ltr"
              className={`${inputClass} mt-1 text-left`}
            />
          </label>
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => updateTrackingCode(id, code))}
            className="rounded-lg border border-blush-300 bg-white px-3 py-1.5 text-xs text-plum-700 hover:bg-blush-100 disabled:opacity-50"
          >
            ذخیره‌ی کد رهگیری
          </button>
          {status === "PROCESSING" && (
            <p className="text-xs text-plum-600">اگر کد را الان بنویسید و «ارسال‌شده» را بزنید، با همان وضعیت ذخیره می‌شود.</p>
          )}
        </div>
      )}

      {pending && <p className="text-xs text-plum-600">در حال انجام…</p>}
      {done && !pending && (
        <p role="status" className="text-xs text-green-700">
          انجام شد.
        </p>
      )}
      {error && (
        <p role="alert" className="text-xs text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}