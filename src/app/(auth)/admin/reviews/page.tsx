import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { ReviewStatus } from "@prisma/client";
import { getAdminReviews, getReviewCounts } from "@/lib/admin-queries";
import { faDate, toman } from "@/lib/format";
import { REVIEW_STATUS_LABEL } from "@/lib/labels";
import ReviewActions from "@/components/admin/ReviewActions";
import Stars from "@/components/product/Stars";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "نظرها | پنل مدیریت ارغوان شاپ" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

const BADGE: Record<ReviewStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-700",
};

const STATUSES = Object.keys(REVIEW_STATUS_LABEL) as ReviewStatus[];

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const q = one(sp.q)?.trim().slice(0, 100) || undefined;
  const rawStatus = one(sp.status);
  const status: ReviewStatus | undefined =
    rawStatus === "all"
      ? undefined
      : STATUSES.includes(rawStatus as ReviewStatus)
        ? (rawStatus as ReviewStatus)
        : "PENDING";
  const rawPage = Number(one(sp.page));
  const page = Number.isFinite(rawPage)
    ? Math.min(Math.max(1, Math.floor(rawPage)), 10000)
    : 1;

  const [{ items, total, pageCount }, counts] = await Promise.all([
    getAdminReviews({ status, q, page }),
    getReviewCounts(),
  ]);

  const href = (opts: { status?: string; page?: number }) => {
    const u = new URLSearchParams();
    const s = opts.status ?? status ?? "all";
    u.set("status", s);
    if (q) u.set("q", q);
    if (opts.page && opts.page > 1) u.set("page", String(opts.page));
    return `/admin/reviews?${u.toString()}`;
  };

  const allCount = counts.PENDING + counts.APPROVED + counts.REJECTED;
  const tabs = [
    ...STATUSES.map((s) => ({
      key: s as string,
      label: REVIEW_STATUS_LABEL[s],
      count: counts[s],
    })),
    { key: "all", label: "همه", count: allCount },
  ];
  const activeKey = status ?? "all";
  if (page > pageCount) redirect(href({ page: pageCount }));
  return (
    <div className="max-w-4xl space-y-5">
      <div className="flex items-baseline justify-between">
        <h1 className="text-lg font-bold text-plum-900">نظرها</h1>
        <span className="text-xs text-plum-600">
          {toman(total)} نظر در این فیلتر
        </span>
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
        <input type="hidden" name="status" value={activeKey} />
        <input
          name="q"
          defaultValue={q}
          placeholder="جستجو در متن نظر، نام محصول یا نام کاربری"
          className="min-w-52 flex-1 rounded-lg border border-blush-300 bg-white px-3 py-2"
        />
        <button className="rounded-lg bg-plum-700 px-4 py-2 text-white hover:bg-plum-900">
          جستجو
        </button>
      </form>

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-blush-300 p-8 text-center text-sm text-plum-600">
          {q
            ? "نظری با این جستجو پیدا نشد."
            : status === "PENDING"
              ? "نظر منتظر تأییدی وجود ندارد."
              : "نظری پیدا نشد."}
        </p>
      ) : (
        <ul className="space-y-4">
          {items.map((r) => (
            <li
              key={r.id}
              className="space-y-3 rounded-xl border border-blush-200 bg-white p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Image
                    src={r.product.image}
                    alt=""
                    width={40}
                    height={40}
                    className="size-10 shrink-0 rounded-lg border border-blush-200 object-cover"
                  />
                  <Link
                    href={`/products/${r.product.slug}`}
                    target="_blank"
                    className="truncate text-sm font-bold text-plum-900 hover:underline"
                  >
                    {r.product.name}
                  </Link>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${BADGE[r.status]}`}
                >
                  {REVIEW_STATUS_LABEL[r.status]}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-plum-600">
                <Stars value={r.rating} />
                <span className="font-bold text-plum-900">
                  {r.user.username}
                </span>
                <time dateTime={r.createdAt.toISOString()}>
                  {faDate(r.createdAt)}
                </time>
              </div>

              <p className="whitespace-pre-line text-sm leading-7">
                {r.comment}
              </p>

              {r.imageUrls.length > 0 && (
                <ul className="flex flex-wrap gap-2">
                  {r.imageUrls.map((src) => (
                    <li key={src}>
                      <a href={src} target="_blank" rel="noreferrer">
                        <Image
                          width={500}
                          height={500}
                          src={src}
                          alt=""
                          className="size-16 rounded-lg border border-blush-200 object-cover"
                        />
                      </a>
                    </li>
                  ))}
                </ul>
              )}

              {r.status === "REJECTED" && r.adminNote && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                  دلیل رد: {r.adminNote}
                </p>
              )}

              <ReviewActions id={r.id} status={r.status} />
            </li>
          ))}
        </ul>
      )}

      {pageCount > 1 && (
        <nav
          aria-label="صفحه‌بندی"
          className="flex items-center justify-center gap-3 text-sm"
        >
          {page > 1 && (
            <Link
              href={href({ page: page - 1 })}
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
              href={href({ page: page + 1 })}
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
