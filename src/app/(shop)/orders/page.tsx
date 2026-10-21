import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { faDate, toman } from "@/lib/format";
import { ORDER_STATUS_BADGE, ORDER_STATUS_LABEL } from "@/lib/labels";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "سفارش‌های من | ارغوان شاپ",
  robots: { index: false },
};

export default async function OrdersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      status: true,
      totalPrice: true,
      createdAt: true,
      items: { take: 4, select: { id: true, image: true } },
      _count: { select: { items: true } },
    },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-5 px-4 py-8">
      <h1 className="text-lg font-bold text-plum-900">سفارش‌های من</h1>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-blush-300 p-8 text-center text-sm text-plum-600">
          هنوز سفارشی ثبت نکرده‌اید.
          <Link href="/products" className="mt-2 block font-bold text-plum-700 hover:underline">
            مشاهده‌ی محصولات
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {orders.map((o) => (
            <li key={o.id}>
              <Link
                href={`/orders/${o.id}`}
                className="block space-y-3 rounded-xl border border-blush-200 bg-white p-4 text-sm hover:bg-blush-100/40"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-plum-600">
                    کد پیگیری: <span dir="ltr">{o.id.slice(-8)}</span> · {faDate(o.createdAt)}
                  </p>
                  <span className={`rounded-full px-2 py-0.5 text-xs ${ORDER_STATUS_BADGE[o.status]}`}>
                    {ORDER_STATUS_LABEL[o.status]}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {o.items.map(
                      (i) =>
                        i.image && (
                          <Image
                            key={i.id}
                            src={i.image}
                            alt=""
                            width={40}
                            height={40}
                            className="size-10 rounded-lg border border-blush-200 object-cover"
                          />
                        ),
                    )}
                    {o._count.items > o.items.length && (
                      <span className="text-xs text-plum-600">+{toman(o._count.items - o.items.length)}</span>
                    )}
                  </div>
                  <span className="font-bold text-plum-900">{toman(o.totalPrice)} تومان</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}