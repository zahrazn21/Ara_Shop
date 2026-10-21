import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminOrder } from "@/lib/admin-order-queries";
import { toman } from "@/lib/format";
import { ORDER_STATUS_BADGE, ORDER_STATUS_LABEL } from "@/lib/labels";
import { NEXT_STATUSES } from "@/lib/orders";
import OrderActions from "@/components/admin/OrderActions";

export const metadata: Metadata = { title: "جزئیات سفارش | پنل مدیریت ارغوان شاپ" };

type Params = Promise<{ id: string }>;
const date = new Intl.DateTimeFormat("fa-IR", { dateStyle: "long", timeStyle: "short" });

export default async function AdminOrderPage({ params }: { params: Params }) {
  const { id } = await params;
  const order = await getAdminOrder(id);
  if (!order) notFound();

  return (
    <div className="max-w-3xl space-y-5">
      <Link href="/admin/orders" className="text-xs text-plum-700 hover:underline">
        ← همه‌ی سفارش‌ها
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-plum-900">
            سفارش <span dir="ltr">{order.id.slice(-8)}</span>
          </h1>
          <p className="mt-1 text-xs text-plum-600">{date.format(order.createdAt)}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs ${ORDER_STATUS_BADGE[order.status]}`}>
          {ORDER_STATUS_LABEL[order.status]}
        </span>
      </div>

      <section className="space-y-3 rounded-xl border border-blush-200 bg-white p-4">
        <h2 className="text-sm font-bold text-plum-900">تغییر وضعیت</h2>
        <OrderActions
          id={order.id}
          status={order.status}
          next={NEXT_STATUSES[order.status]}
          trackingCode={order.trackingCode}
        />
      </section>

      <section className="rounded-xl border border-blush-200 bg-white p-4 text-sm">
        <h2 className="mb-2 font-bold text-plum-900">مشتری</h2>
        <p>
          {order.user.username}
          {order.user.phone && (
            <span dir="ltr" className="mr-3 text-xs text-plum-600">
              {order.user.phone}
            </span>
          )}
        </p>
      </section>

      {order.address && (
        <section className="rounded-xl border border-blush-200 bg-white p-4 text-sm">
          <h2 className="mb-2 font-bold text-plum-900">آدرس تحویل</h2>
          <p>{order.address.fullName}</p>
          <p className="text-plum-700">
            {order.address.province}، {order.address.city}، {order.address.addressLine}
          </p>
          <p className="mt-1 text-xs text-plum-600">
            کد پستی {order.address.postalCode} · موبایل {order.address.phone}
          </p>
        </section>
      )}

      <section className="rounded-xl border border-blush-200 bg-white">
        <ul className="divide-y divide-blush-200">
          {order.items.map((i) => (
            <li key={i.id} className="flex items-center gap-3 p-4 text-sm">
              {i.image && (
                <Image
                  src={i.image}
                  alt=""
                  width={48}
                  height={48}
                  className="size-12 rounded-lg border border-blush-200 object-cover"
                />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-plum-900">{i.name}</p>
                {i.variantLabel && <p className="text-xs text-plum-600">{i.variantLabel}</p>}
              </div>
              <span className="text-xs text-plum-600">{toman(i.quantity)} ×</span>
              <span>{toman(i.price)}</span>
            </li>
          ))}
        </ul>
        <dl className="space-y-2 border-t border-blush-200 p-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-plum-600">جمع کالاها</dt>
            <dd>{toman(order.subtotal)}</dd>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-green-700">
              <dt>تخفیف{order.coupon ? ` (${order.coupon.code})` : ""}</dt>
              <dd>− {toman(order.discount)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-plum-600">هزینه ارسال</dt>
            <dd>{order.shippingCost === 0 ? "رایگان" : toman(order.shippingCost)}</dd>
          </div>
          <div className="flex justify-between border-t border-blush-200 pt-2 font-bold text-plum-900">
            <dt>مبلغ کل</dt>
            <dd>{toman(order.totalPrice)} تومان</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}