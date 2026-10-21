"use client";
import Image from "next/image";
import { useActionState, useState } from "react";
import { createCategory, updateCategory, type CategoryState } from "@/app/actions/category";
import { Field, inputClass } from "./fields";

export type CategoryInitial = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  parentId: string | null;
  hasChildren: boolean;
};

export default function CategoryForm({
  category,
  parents,
}: {
  category?: CategoryInitial;
  parents: { id: string; name: string }[];
}) {
  const [state, action, pending] = useActionState<CategoryState, FormData>(
    category ? updateCategory : createCategory,
    undefined,
  );

  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(category));
  const [parentId, setParentId] = useState(category?.parentId ?? "");

  const onName = (v: string) => {
    setName(v);
    if (!slugTouched) setSlug(v.trim().replace(/\s+/g, "-").toLowerCase());
  };

  return (
    <form action={action} className="space-y-4 rounded-xl border border-blush-200 bg-white p-4">
      {category && <input type="hidden" name="id" value={category.id} />}

      <Field label="نام دسته‌بندی">
        <input
          name="name"
          value={name}
          onChange={(e) => onName(e.target.value)}
          required
          maxLength={60}
          className={inputClass}
        />
      </Field>

      <Field
        label="اسلاگ (بخشی از آدرس صفحه)"
        hint={`آدرس صفحه: /category/${slug || "…"}. ترجیحاً انگلیسی (مثل skincare). تغییرش آدرس قبلی صفحه را از کار می‌اندازد.`}
      >
        <input
          name="slug"
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(e.target.value);
          }}
          required
          maxLength={60}
          dir="ltr"
          className={`${inputClass} text-left`}
        />
      </Field>

      <Field
        label="دسته‌ی والد (اختیاری)"
        hint={
          category?.hasChildren
            ? "این دسته‌بندی زیرمجموعه دارد، پس نمی‌تواند زیرمجموعه‌ی دسته‌ی دیگری باشد."
            : "خالی = دسته‌ی اصلی (در منو و صفحه‌ی اصلی دیده می‌شود)."
        }
      >
        <select
          name="parentId"
          value={parentId}
          onChange={(e) => setParentId(e.target.value)}
          disabled={category?.hasChildren}
          className={inputClass}
        >
          <option value="">— دسته‌ی اصلی —</option>
          {parents.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </Field>

      <div className="space-y-2">
        <p className="text-sm text-plum-900">عکس دسته‌بندی (اختیاری)</p>
        {category?.image && (
          <div className="flex items-center gap-3">
            <Image
              src={category.image}
              alt=""
              width={64}
              height={64}
              className="size-16 rounded-lg border border-blush-200 object-cover"
            />
            <label className="flex items-center gap-2 text-xs text-plum-700">
              <input type="checkbox" name="removeImage" className="size-4 accent-plum-700" />
              حذف عکس فعلی
            </label>
          </div>
        )}
        <input type="file" name="image" accept="image/jpeg,image/png,image/webp" className="block text-sm" />
        <p className="text-xs text-plum-600">JPG، PNG یا WebP، حداکثر ۳ مگابایت. با انتخاب عکس جدید، عکس قبلی جایگزین می‌شود.</p>
      </div>

      {state?.error && (
        <p role="alert" className="text-xs text-red-700">
          {state.error}
        </p>
      )}
      {state?.ok && (
        <p role="status" className="text-xs text-green-700">
          تغییرات ذخیره شد.
        </p>
      )}

      <button
        disabled={pending}
        className="rounded-lg bg-plum-700 px-4 py-2 text-sm text-white hover:bg-plum-900 disabled:opacity-60"
      >
        {pending ? "در حال ذخیره…" : category ? "ذخیره تغییرات" : "ساخت دسته‌بندی"}
      </button>
    </form>
  );
}
