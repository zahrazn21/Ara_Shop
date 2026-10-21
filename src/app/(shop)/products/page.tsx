import ProductsFilter from "@/components/product/ProductFilters";
import ProductGrid from "@/components/product/ProductGrid";
import ProductsToolbar from "@/components/product/ProductsToolbar";
import {
  getCategories,
  getPriceBounds,
  getProducts,
  type ProductSort,
} from "@/lib/queries";
import Link from "next/link";

type SearchParams = Promise<{
  page?: string;
  sort?: string;
  category?: string;
  q?: string;
  view?: string;
  minPrice?: string;
  maxPrice?: string;
  inStock?: string;
}>;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);

  const [{ products, total, totalPages }, categories, priceBounds] =
    await Promise.all([
      getProducts({
        page,
        sort: sp.sort as ProductSort | undefined,
        category: sp.category,
        q: sp.q,
        minPrice: Number(sp.minPrice) || undefined,
        maxPrice: Number(sp.maxPrice) || undefined,
        inStock: sp.inStock === "1",
      }),
      getCategories(),
      getPriceBounds(),
    ]);

  const href = (p: number) => {
    const params = new URLSearchParams(
      Object.entries({ ...sp, page: String(p) }).filter(([, v]) => v) as [
        string,
        string,
      ][],
    );
    return `/products?${params}`;
  };

  
  return (
    <div className="mx-auto max-w-7xl my-4">
      <div className="flex gap-6 w-full">
        <ProductsFilter categories={categories} priceBounds={priceBounds} />
        <div className="w-full">
          <ProductsToolbar total={total} />
          <ProductGrid products={products} view={sp.view === "list" ? "list" : "grid"} />
        </div>
      </div>
      {totalPages > 1 && (
        <nav className="mt-10 flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={href(p)}
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
