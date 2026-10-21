import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getAdminCategories } from "@/lib/admin-category-queries";
import { toman } from "@/lib/format";
import CategoryActions from "@/components/admin/CategoryActions";

export const metadata: Metadata = { title: "دسته‌بندی‌ها | پنل مدیریت ارغوان شاپ" };

type Row = { id: string; name: string; slug: string; image: string | null; _count: { products: number } };

function CategoryRow({ c, child }: { c: Row; child?: boolean }) {
  return (
    <div className={`flex flex-wrap items-center justify-between gap-3 p-3 text-sm ${child ? "pr-10" : ""}`}>
      <div className="flex min-w-0 items-center gap-3">
        {c.image ? (
          <Image
            src={c.image}
            alt=""
            width={40}
            height={40}
            className="size-10 shrink-0 rounded-lg border border-blush-200 object-cover"
          />
        ) : (
          <div className="size-10 shrink-0 rounded-lg bg-blush-100" />
        )}
        <div className="min-w-0">
          <p className="truncate font-bold text-plum-900">{c.name}</p>
          <p className="text-xs text-plum-600">
            <span dir="ltr">/{c.slug}</span> · {toman(c._count.products)} محصول
          </p>
        </div>
      </div>
      <CategoryActions id={c.id} />
    </div>
  );
}

export default async function AdminCategoriesPage() {
  const categories = await getAdminCategories();

  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-plum-900">دسته‌بندی‌ها</h1>
        <Link
          href="/admin/categories/new"
          className="rounded-lg bg-plum-700 px-4 py-2 text-sm text-white hover:bg-plum-900"
        >
          + دسته‌بندی جدید
        </Link>
      </div>

      {categories.length === 0 ? (
        <p className="rounded-xl border border-dashed border-blush-300 p-8 text-center text-sm text-plum-600">
          هنوز دسته‌بندی‌ای نساخته‌اید.
        </p>
      ) : (
        <ul className="space-y-3">
          {categories.map((c) => (
            <li
              key={c.id}
              className="divide-y divide-blush-200 overflow-hidden rounded-xl border border-blush-200 bg-white"
            >
              <CategoryRow c={c} />
              {c.children.map((ch) => (
                <CategoryRow key={ch.id} c={ch} child />
              ))}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}