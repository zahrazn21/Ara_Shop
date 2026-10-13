import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Star } from "lucide-react";
import { getProductBySlug, getProductReviews, getRelatedProducts } from "@/lib/queries";
import { toman } from "@/lib/format";
import { GENDER_LABEL, SKIN_TYPE_LABEL, VOLUME_UNIT_LABEL } from "@/lib/labels";
import ProductPurchaseSection from "@/components/product/ProductPurchaseSection";
import ProductSlider from "@/components/product/ProductSlider";
import ProductTabs, { type TabItem } from "@/components/product/ProductTabs";
import ProductReviews from "@/components/product/ProductReviews";
import ReviewForm from "@/components/product/ReviewForm";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "محصول پیدا نشد" };
  return {
    title: `${product.name} | ارغوان شاپ`,
    description: product.description?.slice(0, 160),
    openGraph: { images: [product.image] },
  };
}

export default async function ProductDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [related, reviews] = await Promise.all([
    getRelatedProducts(product.category.id, product.id, product.brand),
    getProductReviews(product.id),
  ]);
  const specs = product.specifications ? Object.entries(product.specifications) : [];

  // ---------- خلاصه‌ی اطلاعات (نشان‌های زیر عنوان) ----------
  const volumeText =
    product.volume && product.volumeUnit ? `${toman(product.volume)} ${VOLUME_UNIT_LABEL[product.volumeUnit]}` : null;
  const skinText = product.skinTypes.length ? product.skinTypes.map((t) => SKIN_TYPE_LABEL[t]).join("، ") : null;
  const skinChip = !skinText
    ? null
    : product.skinTypes.includes("ALL")
      ? "مناسب همه‌ی انواع پوست"
      : `پوست ${skinText}`;
  const chips = [
    volumeText,
    skinChip,
    product.countryOfOrigin && `ساخت ${product.countryOfOrigin}`,
    ...product.tags,
  ].filter((c): c is string => Boolean(c));

  // ---------- جدول مشخصات: اطلاعات ثابت + مشخصات آزاد ----------
  const rows: [string, string][] = [];
  if (product.brand) rows.push(["برند", product.brand]);
  if (volumeText) rows.push(["حجم / وزن خالص", volumeText]);
  if (skinText) rows.push(["مناسب برای", skinText]);
  if (product.gender) rows.push(["گروه مخاطب", GENDER_LABEL[product.gender]]);
  if (product.countryOfOrigin) rows.push(["کشور سازنده", product.countryOfOrigin]);
  if (product.paoMonths) rows.push(["مدت مصرف پس از باز کردن", `${toman(product.paoMonths)} ماه`]);
  if (product.healthLicense) rows.push(["شماره پروانه بهداشت", product.healthLicense]);
  if (product.barcode) rows.push(["بارکد", product.barcode]);
  if (product.sku) rows.push(["کد محصول", product.sku]);
  rows.push(...specs);

  const tabs: TabItem[] = [];

  if (product.description || product.features.length > 0) {
    tabs.push({
      id: "about",
      label: "معرفی",
      content: (
        <div className="space-y-6">
          {product.description && <p className="whitespace-pre-line text-sm leading-8">{product.description}</p>}
          {product.features.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-bold text-plum-900">ویژگی‌ها</h3>
              <ul className="list-disc space-y-2 pr-5 text-sm">
                {product.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ),
    });
  }

  if (product.ingredients) {
    tabs.push({
      id: "ingredients",
      label: "ترکیبات",
      content: <p dir="auto" className="whitespace-pre-line text-sm leading-8">{product.ingredients}</p>,
    });
  }

  if (product.usage || product.warnings) {
    tabs.push({
      id: "usage",
      label: "طرز استفاده",
      content: (
        <div className="space-y-6">
          {product.usage && <p className="whitespace-pre-line text-sm leading-8">{product.usage}</p>}
          {product.warnings && (
            <div className="rounded-xl bg-amber-50 px-4 py-3">
              <h3 className="mb-1 text-sm font-bold text-amber-900">هشدارها</h3>
              <p className="whitespace-pre-line text-sm leading-7 text-amber-900">{product.warnings}</p>
            </div>
          )}
        </div>
      ),
    });
  }

  if (rows.length > 0) {
    tabs.push({
      id: "specs",
      label: "مشخصات",
      content: (
        <dl className="divide-y divide-blush-200 rounded-xl border border-blush-200 bg-white text-sm">
          {rows.map(([k, v]) => (
            <div key={k} className="grid grid-cols-3 gap-4 px-4 py-3">
              <dt className="text-plum-600">{k}</dt>
              <dd className="col-span-2">{v}</dd>
            </div>
          ))}
        </dl>
      ),
    });
  }

  tabs.push({
    id: "reviews",
    label: `نظرات (${toman(product.reviewCount)})`,
    content: (
      <div className="space-y-8">
        <ReviewForm productId={product.id} />
        <ProductReviews reviews={reviews} rating={product.rating} count={product.reviewCount} />
      </div>
    ),
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <nav aria-label="مسیر صفحه" className="mb-6 text-xs text-plum-600">
        <Link href="/">خانه</Link> /{" "}
        <Link href="/products">محصولات</Link> /{" "}
        <Link href={`/products?category=${product.category.slug}`}>{product.category.name}</Link>
      </nav>

      <ProductPurchaseSection product={product}>
        {product.brand && <p className="text-xs text-plum-600">{product.brand}</p>}
        <h1 className="mt-1 text-xl font-bold text-plum-900">{product.name}</h1>
        {product.subtitle && <p className="mt-1 text-sm text-plum-600">{product.subtitle}</p>}

        <p className="mt-3 flex items-center gap-2 text-xs text-plum-700">
          <Star size={14} fill="currentColor" />
          {toman(product.rating)}
          <span className="text-gray-400">({toman(product.reviewCount)} نظر)</span>
        </p>

        {chips.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2">
            {chips.map((c) => (
              <li key={c} className="rounded-full bg-blush-100 px-3 py-1 text-xs text-plum-700">
                {c}
              </li>
            ))}
          </ul>
        )}
      </ProductPurchaseSection>

      <div className="mt-12">
        <ProductTabs tabs={tabs} />
      </div>

      {related.length > 0 && (
        <ProductSlider
          className="mt-12"
          title="محصولات مشابه"
          href={`/products?category=${product.category.slug}`}
          products={related}
        />
      )}
    </div>
  );
}
