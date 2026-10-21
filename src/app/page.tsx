import Link from "next/link";
import HeroSlider from "@/components/home/HeroSlider";
import CategoryGrid from "@/components/home/CategoryGrid";
import ProductSection from "@/components/home/ProductSection";
import Newsletter from "@/components/home/Newsletter";
import {
  getCategories,
  getFeaturedProducts,
  getNewestProducts,
} from "@/lib/queries";
import Image from "next/image";
import AboutSection from "@/components/home/AboutSection";
import ProductSlider from "@/components/product/ProductSlider";

export const revalidate = 300;

export default async function HomePage() {
  const [categories, featured, newest] = await Promise.all([
    getCategories(),
    getFeaturedProducts(),
    getNewestProducts(),
  ]);

  return (
    <>
      <HeroSlider />
      <div className="mx-auto max-w-7xl space-y-14 px-4 py-12">
        <CategoryGrid categories={categories} />
        <ProductSlider
          title="محصولات ویژه"
          href="/products?sort=popular"
          products={featured}
        />
        <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          <Link
            href="/category/skincare"
            className="relative hidden min-h-64 items-center overflow-hidden  bg-blush-200 p-8 lg:flex"
          >
            <Image
              src={"/images/skincare.jpg"}
              alt=""
              fill
              sizes="100vw"
              className="object-cover"
            />
            <div className="z-10">
              <h3 className="text-2xl font-bold text-plum-900">
                مراقبت از پوست
              </h3>
              <p className="mt-2 text-plum-700">سرمایه‌گذاری برای آینده</p>
              <span className="mt-5 inline-block rounded-full bg-plum-700 px-5 py-2 text-sm text-white">
                مشاهده محصولات
              </span>
            </div>
          </Link>
          <ProductSection
            title="جدیدترین محصولات"
            href="/products?sort=newest"
            products={newest}
            cols={4}
            compact
          />
          
        </div>
      </div>
      <AboutSection />
      {/* <Newsletter /> */}
    </>
  );
}
