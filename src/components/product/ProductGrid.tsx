import ProductCard, { type CardView } from "./ProductCard";
import type { ProductCardData } from "@/types/products";

type Props = {
  products: ProductCardData[];
  title?: string;
  compact?: boolean;
  view?: CardView;
  className?: string;
};

const gridLayout = "grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4";
const listLayout = "grid grid-cols-1 gap-3";

export default function ProductGrid({ products, title, compact, view = "grid", className }: Props) {
  if (products.length === 0) {
    return <p className="py-10 text-center text-sm text-plum-600">محصولی پیدا نشد.</p>;
  }

  return (
    <section>
      {title && <h2 className="mb-5 text-lg font-bold text-plum-900">{title}</h2>}
      <div className={className ?? (view === "list" ? listLayout : gridLayout)}>
        {products.map((p) => (
          <ProductCard key={p.id} product={p} compact={compact} view={view} />
        ))}
      </div>
    </section>
  );
}