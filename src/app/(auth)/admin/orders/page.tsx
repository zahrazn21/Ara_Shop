import type { Metadata } from "next";
import Link from "next/link";
import type { OrderStatus } from "@prisma/client";
import { getAdminOrders, getOrderCounts } from "@/lib/admin-order-queries";
import { faDate, toman } from "@/lib/format";
import { ORDER_STATUS_BADGE, ORDER_STATUS_LABEL } from "@/lib/labels";

export const metadata: Metadata = { title: "سفارش‌ها | پنل مدیریت ارغوان شاپ" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const STATUSES = Object.keys(ORDER_STATUS_LABEL) as OrderStatus[];

export default async function AdminOrdersPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const q = one(sp.q)?.trim().slice(0, 100) || undefined;
  const rawStatus = one(sp.status);
  const status = STATUSES.includes(rawStatus as OrderStatus) ? (rawStatus as OrderStatus) : undefined;
  const rawPage = Number(one(sp.page));
  const page = Number.isFinite(rawPage) ? Math.min(Math.max(1, Math.floor(rawPage)), 10000) : 1;

  const [{ items, total, pageCount }, counts] = await Promise.all([
    getAdminOrders({ status, q, page }),
    getOrderCounts(),
  ]);

  const href = (opts: { status?: string; page?: number }) => {
    const u = new URLSearchParams();
    const s = opts.status ?? status ?? "all";
    if (s !== "all") u.set("status", s);
    if (q) u.set("q", q);
    if (opts.page && opts.page > 1) u.set("page", String(opts.page));
    const qs = u.toString();
    return qs ? `/admin/orders?${qs}` : "/admin/orders";
  };

  const allCount = STATUSES.reduce((sum, s) => sum + counts[s], 0);
  const tabs = [
    { key: "all", label: "همه", count: allCount },
    ...STATUSES.map((s) => ({ key: s as string, label: ORDER_STATUS_LABEL[s], count: counts[s] })),
  ];
  const activeKey = status ?? "all";

  return (
    <div className="max-w-4xl space-y-5">
      <div className="flex items-baseline justify-between">
        <h1 className="text-lg font-bold text-plum-900">سفارش‌ها</h1>
        <span className="text-xs text-plum-600">{toman(total)} سفارش در این فیلتر</span>
      </div>

      <nav aria-label="فیلتر وضعیت" className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={href({ status: t.key })}
            aria-current={t.key === activeKey ? "page" : undefined}
            className={`rounded-full px-4 py-1.5 text-xs ${
              t.key === activeKey
                ? "bg-plum-700 text-white"
                : "bg-white text-plum-700 ring-1 ring-blush-300 hover:bg-blush-100"
            }`}
          >
            {t.label} ({toman(t.count)})
          </Link>
        ))}
      </nav>

      <form className="flex gap-2 text-sm">
        {status && <input type="hidden" name="status" value={status} />}
        <input
          name="q"
          defaultValue={q}
          placeholder="جستجو: کد پیگیری، کد رهگیری، نام کاربری، نام گیرنده یا شماره موبایل"
          className="min-w-52 flex-1 rounded-lg border border-blush-300 bg-white px-3 py-2"
        />
        <button className="rounded-lg bg-plum-700 px-4 py-2 text-white hover:bg-plum-900">جستجو</button>
      </form>

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-blush-300 p-8 text-center text-sm text-plum-600">
          سفارشی پیدا نشد.
        </p>
      ) : (
        <ul className="space-y-3">
          {items.map((o) => (
            <li key={o.id}>
              <Link
                href={`/admin/orders/${o.id}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blush-200 bg-white p-4 text-sm hover:bg-blush-100/40"
              >
                <div className="space-y-1">
                  <p className="font-bold text-plum-900">
                    سفارش <span dir="ltr">{o.id.slice(-8)}</span>
                  </p>
                  <p className="text-xs text-plum-600">
                    {o.user.username}
                    {o.address ? ` · گیرنده: ${o.address.fullName}` : ""} · {faDate(o.createdAt)} ·{" "}
                    {toman(o._count.items)} قلم
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span>{toman(o.totalPrice)} تومان</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs ${ORDER_STATUS_BADGE[o.status]}`}>
                    {ORDER_STATUS_LABEL[o.status]}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {pageCount > 1 && (
        <nav aria-label="صفحه‌بندی" className="flex items-center justify-center gap-3 text-sm">
          {page > 1 && (
            <Link href={href({ page: page - 1 })} className="text-plum-700 hover:underline">
              قبلی
            </Link>
          )}
          <span className="text-plum-600">
            صفحه {toman(page)} از {toman(pageCount)}
          </span>
          {page < pageCount && (
            <Link href={href({ page: page + 1 })} className="text-plum-700 hover:underline">
              بعدی
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}