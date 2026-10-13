import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductsFilter from "@/components/product/ProductFilters";
import ProductGrid from "@/components/product/ProductGrid";
import ProductsToolbar from "@/components/product/ProductsToolbar";
import {
  getCategoryBySlug,
  getPriceBounds,
  getProducts,
  type ProductSort,
} from "@/lib/queries";

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<{
  page?: string;
  sort?: string;
  view?: string;
  minPrice?: string;
  maxPrice?: string;
  inStock?: string;
}>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "دسته‌بندی پیدا نشد" };
  return {
    title: `${category.name} | ارغوان شاپ`,
    description: `خرید آنلاین ${category.name} با ارسال سریع از ارغوان شاپ`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);

  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const page = Math.max(1, Number(sp.page) || 1);
  const view = sp.view === "list" ? "list" : "grid";

  const categoryIds = [category.id, ...category.children.map((c) => c.id)];

  const [{ products, total, totalPages }, priceBounds] = await Promise.all([
    getProducts({
      page,
      sort: sp.sort as ProductSort | undefined,
      categoryIds,
      minPrice: Number(sp.minPrice) || undefined,
      maxPrice: Number(sp.maxPrice) || undefined,
      inStock: sp.inStock === "1",
    }),
    getPriceBounds(),
  ]);

  const pageHref = (p: number) => {
    const params = new URLSearchParams(
      Object.entries({ ...sp, page: String(p) }).filter(([, v]) => v) as [
        string,
        string,
      ][],
    );
    return `/category/${category.slug}?${params}`;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-4">
      <nav aria-label="مسیر صفحه" className="mb-4 text-xs text-plum-600">
        <Link href="/">خانه</Link> / <Link href="/products">محصولات</Link> /{" "}
        {category.parent && (
          <>
            <Link href={`/category/${category.parent.slug}`}>
              {category.parent.name}
            </Link>{" "}
            /{" "}
          </>
        )}
        <span className="text-plum-900">{category.name}</span>
      </nav>

      {category.children.length > 0 && (
        <ul className="mb-6 flex flex-wrap gap-3">
          {category.children.map((c) => (
            <li key={c.id}>
              <Link
                href={`/category/${c.slug}`}
                className="flex items-center gap-2 rounded-full border border-blush-200 bg-white py-1.5 pr-1.5 pl-4 text-sm text-plum-900 hover:bg-blush-100"
              >
                <span className="relative size-8 overflow-hidden rounded-full bg-blush-100">
                  {c.image && (
                    <Image
                      src={c.image}
                      alt=""
                      fill
                      sizes="32px"
                      className="object-cover"
                    />
                  )}
                </span>
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-6">
        <ProductsFilter
          categories={[]}
          priceBounds={priceBounds}
          hideCategories
        />
        <div className="min-w-0 flex-1">
          <ProductsToolbar title={category.name} total={total} />
          <ProductGrid products={products} view={view} />
        </div>
      </div>

      {totalPages > 1 && (
        <nav aria-label="صفحه‌بندی" className="mt-10 flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={pageHref(p)}
              aria-current={p === page ? "page" : undefined}
              className={`grid size-9 place-items-center rounded-full text-sm ${
                p === page
                  ? "bg-plum-700 text-white"
                  : "bg-blush-100 text-plum-900"
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
