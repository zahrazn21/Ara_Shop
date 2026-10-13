import Link from "next/link";
import ProductCard from "@/components/product/ProductCard";
import { ProductCardData } from "@/types/products";

export default function ProductSection({
  title,
  href,
  products,
  cols,
  compact,
}: {
  title: string;
  href: string;
  products: ProductCardData[];
  cols: 2 | 4 | 6;
  compact?: boolean;
}) {
  const grid =
    cols === 6
      ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-6"
      : cols === 4
        ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        : "grid-cols-2";

  return (
    <section>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-bold text-plum-900">{title}</h2>
        <Link href={href} className="text-xs text-plum-700">
          مشاهده همه
        </Link>
      </div>

      <div className={`grid gap-4 ${grid}`}>
        {products.map((p) => (
          <ProductCard key={p.id} product={p} compact={compact} />
        ))}
      </div>
    </section>
  );
}