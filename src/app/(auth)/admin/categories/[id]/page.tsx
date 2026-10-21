import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminCategory, getParentOptions } from "@/lib/admin-category-queries";
import CategoryForm from "@/components/admin/CategoryForm";

export const metadata: Metadata = { title: "ویرایش دسته‌بندی | پنل مدیریت ارغوان شاپ" };

type Params = Promise<{ id: string }>;

export default async function EditCategoryPage({ params }: { params: Params }) {
  const { id } = await params;
  const [category, parents] = await Promise.all([getAdminCategory(id), getParentOptions(id)]);
  if (!category) notFound();

  return (
    <div className="max-w-xl space-y-5">
      <Link href="/admin/categories" className="text-xs text-plum-700 hover:underline">
        ← دسته‌بندی‌ها
      </Link>
      <h1 className="text-lg font-bold text-plum-900">ویرایش دسته‌بندی</h1>
      <CategoryForm
        parents={parents}
        category={{
          id: category.id,
          name: category.name,
          slug: category.slug,
          image: category.image,
          parentId: category.parentId,
          hasChildren: category._count.children > 0,
        }}
      />
    </div>
  );
}