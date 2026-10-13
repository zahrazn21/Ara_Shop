import Link from "next/link";
import { getCategoryOptions } from "@/lib/admin-queries";
import NewProductForm from "@/components/admin/NewProductForm";

export default async function NewProductPage() {
  const categories = await getCategoryOptions();

  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex items-baseline justify-between">
        <h1 className="text-lg font-bold text-plum-900">افزودن محصول</h1>
        <Link href="/admin/products" className="text-xs text-plum-700 hover:underline">
          بازگشت به لیست
        </Link>
      </div>

      {categories.length === 0 ? (
        <p className="rounded-xl border border-dashed border-blush-300 p-8 text-center text-sm text-plum-600">
          هنوز دسته‌بندی‌ای ثبت نشده است. محصول باید در یک دسته باشد؛ ابتدا یک دسته‌بندی بسازید.
        </p>
      ) : (
        <NewProductForm categories={categories} />
      )}
    </div>
  );
}