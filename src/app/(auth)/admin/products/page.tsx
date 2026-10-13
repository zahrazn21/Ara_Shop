import Image from "next/image";
import Link from "next/link";
import type { ProductStatus } from "@prisma/client";
import { getAdminProducts } from "@/lib/admin-queries";
import { PRODUCT_STATUS_LABEL } from "@/lib/labels";
import { toman } from "@/lib/format";
import { Edit, Trash } from "lucide-react";
import EditProductModal from "@/components/admin/EditProduct";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

const BADGE: Record<ProductStatus, string> = {
  ACTIVE: "bg-green-100 text-green-800",
  DRAFT: "bg-blush-100 text-plum-700",
  OUT_OF_STOCK: "bg-amber-100 text-amber-800",
  ARCHIVED: "bg-gray-100 text-gray-500",
};

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const q = one(sp.q)?.trim() || undefined;
  const rawStatus = one(sp.status);
  const status =
    rawStatus && rawStatus in PRODUCT_STATUS_LABEL
      ? (rawStatus as ProductStatus)
      : undefined;
  const page = Math.max(1, Number(one(sp.page)) || 1);

  const { items, total, pageCount } = await getAdminProducts({
    q,
    status,
    page,
  });

  const pageHref = (n: number) => {
    const u = new URLSearchParams();
    if (q) u.set("q", q);
    if (status) u.set("status", status);
    if (n > 1) u.set("page", String(n));
    const qs = u.toString();
    return `/admin/products${qs ? `?${qs}` : ""}`;
  };

  const totalLabel =
    total === 0 ? "محصولی ثبت نشده است." : `${toman(total)} محصول`;
  const title = q || status ? `نتایج جستجو (${totalLabel})` : totalLabel;
  const description = q
    ? `جستجو برای "${q}"`
    : status
      ? `فیلتر بر اساس "${PRODUCT_STATUS_LABEL[status]}"`
      : undefined;
  const pageTitle = q || status ? `جستجو | ${title}` : "محصولات | ارغوان شاپ";
  const pageDescription = description
    ? `${description} در ارغوان شاپ`
    : "مدیریت محصولات در ارغوان شاپ";

  return (
    <div className="max-w-6xl space-y-5">
      <div className="flex items-baseline justify-between">
        <h1 className="text-lg font-bold text-plum-900">محصولات</h1>
        <span className="text-xs text-plum-600">{toman(total)} محصول</span>
      </div>

      <form className="flex flex-wrap gap-2 text-sm">
        <input
          name="q"
          defaultValue={q}
          placeholder="جستجوی نام، برند یا کد محصول"
          className="min-w-52 flex-1 rounded-lg border border-blush-300 bg-white px-3 py-2"
        />
        <select
          name="status"
          defaultValue={status ?? ""}
          className="rounded-lg border border-blush-300 bg-white px-3 py-2"
        >
          <option value="">همه (بدون بایگانی)</option>
          {Object.entries(PRODUCT_STATUS_LABEL).map(([k, label]) => (
            <option key={k} value={k}>
              {label}
            </option>
          ))}
        </select>
        <button className="rounded-lg bg-plum-700 px-4 py-2 text-white hover:bg-plum-900">
          جستجو
        </button>
      </form>
      <div className="flex items-center gap-4 ">
        <Link
          href="/admin/products/new"
          className="rounded-lg bg-plum-700 px-4 py-2 text-sm text-white hover:bg-plum-900"
        >
          افزودن محصول
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-blush-300 p-8 text-center text-sm text-plum-600">
          {q || status
            ? "محصولی با این فیلتر پیدا نشد."
            : "هنوز محصولی ثبت نشده است."}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-blush-200 bg-white">
          <table className="w-full text-right text-sm">
            <thead className="border-b border-blush-200 text-xs text-plum-600">
              <tr>
                <th className="p-3 font-normal">محصول</th>
                <th className="p-3 font-normal">دسته</th>
                <th className="p-3 font-normal">قیمت (تومان)</th>
                <th className="p-3 font-normal">موجودی</th>
                <th className="p-3 font-normal">وضعیت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blush-200">
              {items.map((p) => (
                <tr key={p.id}>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <Image
                        src={p.image}
                        alt=""
                        width={40}
                        height={40}
                        className="size-10 shrink-0 rounded-lg border border-blush-200 object-cover"
                      />
                      <div className="min-w-0">
                        <Link
                          href={`/products/${p.slug}`}
                          target="_blank"
                          className="block truncate font-bold text-plum-900 hover:underline"
                        >
                          {p.name}
                        </Link>
                        {p.brand && (
                          <span className="text-xs text-plum-600">
                            {p.brand}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-3">{p.category.name}</td>
                  <td className="p-3">{toman(p.price)}</td>
                  <td className="p-3">
                    <span
                      className={p.totalStock <= 5 ? "text-red-600" : undefined}
                    >
                      {p.totalStock === 0 ? "تمام شده" : toman(p.totalStock)}
                    </span>
                    {p.variantCount > 0 && (
                      <span className="block text-xs text-plum-600">
                        {toman(p.variantCount)} تنوع
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${BADGE[p.status]}`}
                    >
                      {PRODUCT_STATUS_LABEL[p.status]}
                    </span>
                  </td>
                  <td className="text-plum-900 ">
                    <EditProductModal productId={p.id} />
                  </td>
                  <td className="text-plum-900 ">
                    <Trash size={16} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pageCount > 1 && (
        <nav
          aria-label="صفحه‌بندی"
          className="flex items-center justify-center gap-3 text-sm"
        >
          {page > 1 && (
            <Link
              href={pageHref(page - 1)}
              className="text-plum-700 hover:underline"
            >
              قبلی
            </Link>
          )}
          <span className="text-plum-600">
            صفحه {toman(page)} از {toman(pageCount)}
          </span>
          {page < pageCount && (
            <Link
              href={pageHref(page + 1)}
              className="text-plum-700 hover:underline"
            >
              بعدی
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
