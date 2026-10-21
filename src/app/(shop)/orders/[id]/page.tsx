import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { ORDER_STATUS_LABEL } from "@/lib/labels";
import { toman } from "@/lib/format";

export const metadata: Metadata = {
  title: "سفارش من | ارغوان شاپ",
  robots: { index: false },
};

type Params = Promise<{ id: string }>;

const date = new Intl.DateTimeFormat("fa-IR", {
  dateStyle: "long",
  timeStyle: "short",
});

export default async function OrderPage({ params }: { params: Params }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const order = await prisma.order.findFirst({
    where: { id, userId: user.id },
    include: {
      items: true,
      address: true,
      coupon: { select: { code: true } },
    },
  });
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-lg font-bold text-plum-900">جزئیات سفارش</h1>{" "}
        <p className="mt-1 text-xs text-plum-600">
          کد پیگیری: <span dir="ltr">{order.id.slice(-8)}</span> ·{" "}
          {date.format(order.createdAt)}
        </p>
      </div>

      <p className="rounded-xl bg-blush-100 px-4 py-3 text-sm text-plum-900">
        وضعیت: <b>{ORDER_STATUS_LABEL[order.status]}</b>
        {order.trackingCode && (
          <span className="block pt-1 text-xs text-plum-700">
            کد رهگیری مرسوله: <b dir="ltr">{order.trackingCode}</b>
          </span>
        )}
        {order.status === "PENDING_PAYMENT" && (
          <span className="block pt-1 text-xs text-plum-700">
            پرداخت آنلاین هنوز فعال نشده است.
          </span>
        )}
      </p>

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
                {i.variantLabel && (
                  <p className="text-xs text-plum-600">{i.variantLabel}</p>
                )}
              </div>
              <span className="text-xs text-plum-600">
                {toman(i.quantity)} ×
              </span>
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
            <dd>
              {order.shippingCost === 0 ? "رایگان" : toman(order.shippingCost)}
            </dd>
          </div>
          <div className="flex justify-between border-t border-blush-200 pt-2 font-bold text-plum-900">
            <dt>مبلغ کل</dt>
            <dd>{toman(order.totalPrice)} تومان</dd>
          </div>
        </dl>
      </section>

      {order.address && (
        <section className="rounded-xl border border-blush-200 bg-white p-4 text-sm">
          <h2 className="mb-2 font-bold text-plum-900">آدرس تحویل</h2>
          <p>{order.address.fullName}</p>
          <p className="text-plum-700">
            {order.address.province}، {order.address.city}،{" "}
            {order.address.addressLine}
          </p>
          <p className="mt-1 text-xs text-plum-600">
            کد پستی {order.address.postalCode} · موبایل {order.address.phone}
          </p>
        </section>
      )}

      <div className="flex gap-4 text-sm">
        <Link href="/orders" className="text-plum-700 hover:underline">
          همه‌ی سفارش‌ها
        </Link>
        <Link href="/products" className="text-plum-700 hover:underline">
          ادامه خرید
        </Link>
      </div>
    </div>
  );
}
