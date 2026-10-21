"use client";
import { CategoryState, deleteCategory } from "@/app/actions/category";
import Link from "next/link";
import { useState, useTransition } from "react";

export default function CategoryActions({ id }: { id: string }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const remove = () => {
    if (!window.confirm("این دسته‌بندی حذف شود؟")) return;
    setError(null);
    start(async () => {
      const r: CategoryState = await deleteCategory(id);
      if (r?.error) setError(r.error);
    });
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-4 text-xs">
        <Link href={`/admin/categories/${id}`} className="text-plum-700 hover:underline">
          ویرایش
        </Link>
        <button type="button" disabled={pending} onClick={remove} className="text-red-600 hover:underline disabled:opacity-50">
          حذف
        </button>
      </div>
      {error && (
        <p role="alert" className="max-w-xs text-xs text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
