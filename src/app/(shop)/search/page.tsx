
import Link from "next/link";
import { Search } from "lucide-react";
import ProductsFilter from "@/components/product/ProductFilters";
import ProductGrid from "@/components/product/ProductGrid";
import ProductsToolbar from "@/components/product/ProductsToolbar";
import {
  getCategories,
  getPriceBounds,
  getProducts,
  type ProductSort,
} from "@/lib/queries";

type SearchParams = Promise<{
  q?: string;
  page?: string;
  sort?: string;
  category?: string;
  view?: string;
  minPrice?: string;
  maxPrice?: string;
  inStock?: string;
}>;

export const metadata = {
  title: "جستجوی محصولات | ارغوان شاپ",
  description: "جستجو در محصولات، برندها و دسته‌بندی‌های ارغوان شاپ.",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const query = (sp.q ?? "").trim();
  const page = Math.max(1, Number(sp.page) || 1);

  const [{ products, total, totalPages }, categories, priceBounds] =
    await Promise.all([
      getProducts({
        page,
        sort: sp.sort as ProductSort | undefined,
        category: sp.category,
        q: query || undefined,
        minPrice: Number(sp.minPrice) || undefined,
        maxPrice: Number(sp.maxPrice) || undefined,
        inStock: sp.inStock === "1",
      }),
      getCategories(),
      getPriceBounds(),
    ]);

  const pageHref = (p: number) => {
    const params = new URLSearchParams(
      Object.entries({ ...sp, page: String(p) }).filter(
        ([, value]) => value,
      ) as [string, string][],
    );
    return `/search?${params.toString()}`;
  };

  return (
    <div dir="rtl" className="mx-auto min-h-[60vh] max-w-7xl px-4 py-6">
      <section className="mb-8 rounded-3xl border border-blush-200 bg-linear-to-bl from-blush-100 to-white p-5 sm:p-8">
        <div className="flex items-center gap-3">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white text-plum-700 shadow-sm">
            <Search size={22} />
          </span>

          <div>
            <h1 className="text-xl font-black text-plum-900 sm:text-2xl">
              جستجوی محصولات
            </h1>
            <p className="mt-1 text-sm leading-7 text-plum-600">
              محصول یا برند موردنظرت را در ارغوان شاپ پیدا کن.
            </p>
          </div>
        </div>

        <form
          action="/search"
          className="mt-5 flex gap-2 rounded-2xl border border-blush-200 bg-white p-2 shadow-sm"
        >
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="مثلاً شامپو، کرم مرطوب‌کننده یا نام برند..."
            className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-plum-900 outline-none placeholder:text-plum-600/70"
          />

          <button
            type="submit"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-plum-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-plum-900"
          >
            <Search size={17} />
            جستجو
          </button>
        </form>
      </section>

      {query && (
        <p className="mb-5 text-sm text-plum-600">
          نتایج جستجو برای{" "}
          <span className="font-bold text-plum-900">«{query}»</span>
          {" "}ـ {total} محصول
        </p>
      )}

      <div className="flex items-start gap-6">
        <aside className="hidden shrink-0 md:block">
          <ProductsFilter
            categories={categories}
            priceBounds={priceBounds}
          />
        </aside>

        <div className="min-w-0 flex-1">
          <ProductsToolbar title="نتایج جستجو" total={total} />

          <ProductGrid
            products={products}
            view={sp.view === "list" ? "list" : "grid"}
          />
        </div>
      </div>

      {totalPages > 1 && (
        <nav
          aria-label="صفحه‌بندی نتایج"
          className="mt-10 flex justify-center gap-2"
        >
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={pageHref(p)}
              aria-current={p === page ? "page" : undefined}
              className={`grid size-9 place-items-center rounded-full text-sm ${
                p === page
                  ? "bg-plum-700 text-white"
                  : "bg-blush-100 text-plum-900 hover:bg-blush-200"
              }`}
            >
              {p}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
