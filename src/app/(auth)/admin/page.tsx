import Link from "next/link";
import { getDashboardStats } from "@/lib/admin-queries";
import { toman } from "@/lib/format";
import { ORDER_STATUS_LABEL } from "@/lib/labels";

const date = new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium" });

export default async function AdminHome() {
  const s = await getDashboardStats();

  const stats = [
    { label: "فروش", value: `${toman(s.revenue)} تومان` },
    { label: "سفارش‌ها", value: toman(s.orders) },
    { label: "محصولات فعال", value: toman(s.products) },
    { label: "کاربران", value: toman(s.users) },
  ];

  const todo = [
    s.pendingReviews > 0 && {
      text: `${toman(s.pendingReviews)} نظر منتظر تأیید است`,
      href: "/admin/reviews?status=PENDING",
    },
    s.lowStock > 0 && { text: `${toman(s.lowStock)} محصول موجودی ۵ عدد یا کمتر دارد`, href: "/admin/products" },
  ].filter(Boolean) as { text: string; href: string }[];

  return (
    <div className="max-w-5xl space-y-8">
      <h1 className="text-lg font-bold text-plum-900">داشبورد</h1>

      <dl className="grid grid-cols-2 divide-blush-200 overflow-hidden rounded-xl border border-blush-200 bg-white lg:grid-cols-4 lg:divide-x lg:divide-x-reverse">
        {stats.map((x) => (
          <div key={x.label} className="p-4">
            <dt className="text-xs text-plum-600">{x.label}</dt>
            <dd className="mt-1 text-lg font-bold text-plum-900">{x.value}</dd>
          </div>
        ))}
      </dl>

      {todo.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-bold text-plum-900">نیاز به بررسی</h2>
          <ul className="space-y-1 text-sm">
            {todo.map((t) => (
              <li key={t.text}>
                <Link href={t.href} className="text-plum-700 hover:underline">
                  {t.text}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="mb-2 text-sm font-bold text-plum-900">آخرین سفارش‌ها</h2>
        {s.recentOrders.length === 0 ? (
          <p className="rounded-xl border border-dashed border-blush-300 p-6 text-center text-sm text-plum-600">
            هنوز سفارشی ثبت نشده است.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-blush-200 bg-white">
            <table className="w-full text-right text-sm">
              <thead className="border-b border-blush-200 text-xs text-plum-600">
                <tr>
                  <th className="p-3 font-normal">کد</th>
                  <th className="p-3 font-normal">کاربر</th>
                  <th className="p-3 font-normal">مبلغ (تومان)</th>
                  <th className="p-3 font-normal">وضعیت</th>
                  <th className="p-3 font-normal">تاریخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blush-200">
                {s.recentOrders.map((o) => (
                  <tr key={o.id}>
                    <td className="p-3" dir="ltr">
                      {o.id.slice(-6)}
                    </td>
                    <td className="p-3">{o.user.username}</td>
                    <td className="p-3">{toman(o.totalPrice)}</td>
                    <td className="p-3">{ORDER_STATUS_LABEL[o.status]}</td>
                    <td className="p-3">{date.format(o.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}