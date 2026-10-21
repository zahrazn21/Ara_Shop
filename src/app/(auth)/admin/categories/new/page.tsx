import type { Metadata } from "next";
import Link from "next/link";
import { getParentOptions } from "@/lib/admin-category-queries";
import CategoryForm from "@/components/admin/CategoryForm";

export const metadata: Metadata = { title: "دسته‌بندی جدید | پنل مدیریت ارغوان شاپ" };

export default async function NewCategoryPage() {
  const parents = await getParentOptions();

  return (
    <div className="max-w-xl space-y-5">
      <Link href="/admin/categories" className="text-xs text-plum-700 hover:underline">
        ← دسته‌بندی‌ها
      </Link>
      <h1 className="text-lg font-bold text-plum-900">دسته‌بندی جدید</h1>
      <CategoryForm parents={parents} />
    </div>
  );
}