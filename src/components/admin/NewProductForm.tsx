"use client";

import { Plus, Trash2, X } from "lucide-react";
import { startTransition, useActionState, useEffect, useMemo, useRef, useState } from "react";
import { createProduct, type EditState } from "@/app/actions/products";
import { PRODUCT_STATUS_LABEL } from "@/lib/labels";
import { Field, inputClass } from "./fields";
import ProductDetailsFields from "./ProductDetailsFields";
import VariantRow, { emptyVariant, fileKey, type VariantDraft } from "./VariantRow";
import Image from "next/image";

const MAX_IMAGES = 6;
const ltr = `${inputClass} text-left`;

type Variant = VariantDraft;
type Spec = { id: number; key: string; value: string };

const slugify = (s: string) =>
  s.trim().toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, "").replace(/\s+/g, "-");

let uid = 0;

export default function NewProductForm({ categories }: { categories: { id: string; label: string }[] }) {
  const [state, formAction, pending] = useActionState<EditState, FormData>(createProduct, undefined);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);

  const [files, setFiles] = useState<File[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [specs, setSpecs] = useState<Spec[]>([]);

  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  useEffect(() => () => previews.forEach(URL.revokeObjectURL), [previews]);

  const syncInput = (list: File[]) => {
    const dt = new DataTransfer();
    list.forEach((f) => dt.items.add(f));
    if (fileInput.current) fileInput.current.files = dt.files;
  };
  const addFiles = (picked: FileList | null) => {
    const next = [...files, ...Array.from(picked ?? [])].slice(0, MAX_IMAGES);
    setFiles(next);
    syncInput(next);
  };
  const removeFile = (i: number) => {
    const next = files.filter((_, j) => j !== i);
    setFiles(next);
    syncInput(next);
  };

  const patchVariant = (id: number, k: keyof Variant, v: string) =>
    setVariants((list) => list.map((x) => (x.id === id ? { ...x, [k]: v } : x)));
  const patchSpec = (id: number, k: "key" | "value", v: string) =>
    setSpecs((list) => list.map((x) => (x.id === id ? { ...x, [k]: v } : x)));

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(() => formAction(fd));
  };

  const fileKeys = files.map(fileKey);
  const hasVariants = variants.length > 0;
  const section = "space-y-4 border-b border-blush-200 pb-6";
  const h2 = "text-sm font-bold text-plum-900";

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <section className={section}>
        <h2 className={h2}>اطلاعات پایه</h2>
        <Field label="نام محصول">
          <input
            name="name"
            required
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!slugTouched) setSlug(slugify(e.target.value));
            }}
            className={inputClass}
          />
        </Field>
        <Field label="اسلاگ (بخش آخر آدرس)" hint="از روی نام ساخته می‌شود؛ می‌توانید تغییرش دهید.">
          <input
            name="slug"
            required
            dir="ltr"
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
            className={ltr}
          />
        </Field>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="دسته‌بندی">
            <select name="categoryId" required defaultValue="" className={inputClass}>
              <option value="" disabled>
                انتخاب کنید
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="برند">
            <input name="brand" className={inputClass} />
          </Field>
          <Field label="وضعیت">
            <select name="status" defaultValue="ACTIVE" className={inputClass}>
              {Object.entries(PRODUCT_STATUS_LABEL)
                .filter(([k]) => k !== "ARCHIVED")
                .map(([k, label]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
            </select>
          </Field>
        </div>
        <Field label="توضیحات">
          <textarea name="description" rows={4} className={inputClass} />
        </Field>
        <Field label="ویژگی‌ها" hint="هر ویژگی در یک خط">
          <textarea name="features" rows={4} className={inputClass} />
        </Field>
      </section>

      <ProductDetailsFields />

      <section className={section}>
        <h2 className={h2}>قیمت و موجودی</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="قیمت فروش (تومان)">
            <input name="price" type="number" min={0} required dir="ltr" className={ltr} />
          </Field>
          <Field label="قیمت قبل از تخفیف" hint="اختیاری؛ باید از قیمت فروش بیشتر باشد.">
            <input name="originalPrice" type="number" min={0} dir="ltr" className={ltr} />
          </Field>
          <Field
            label="موجودی"
            hint={hasVariants ? "محصول تنوع دارد؛ موجودی از روی تنوع‌ها حساب می‌شود." : undefined}
          >
            <input name="stock" type="number" min={0} defaultValue={0} disabled={hasVariants} dir="ltr" className={ltr} />
          </Field>
          <Field label="کد محصول (SKU)">
            <input name="sku" dir="ltr" className={ltr} />
          </Field>
        </div>
      </section>

      <section className={section}>
        <h2 className={h2}>عکس‌ها</h2>
        <p className="text-xs text-plum-600">
          حداکثر {MAX_IMAGES} عکس JPG، PNG یا WebP تا ۳ مگابایت. اولین عکس، عکس اصلی محصول است.
        </p>
        <input
          ref={fileInput}
          name="images"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={(e) => addFiles(e.target.files)}
          className="block text-sm file:ml-3 file:rounded-lg file:border-0 file:bg-blush-100 file:px-4 file:py-2 file:text-plum-700"
        />
        {previews.length > 0 && (
          <ul className="flex flex-wrap gap-3">
            {previews.map((src, i) => (
              <li key={src} className="relative">
                <Image width={400} height={500} src={src} alt="" className="size-20 rounded-lg border border-blush-200 object-cover" />
                {i === 0 && (
                  <span className="absolute bottom-1 right-1 rounded bg-plum-700 px-1.5 text-[10px] text-white">
                    اصلی
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  aria-label="حذف عکس"
                  className="absolute -left-2 -top-2 grid size-5 place-items-center rounded-full bg-white shadow ring-1 ring-blush-300"
                >
                  <X size={12} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={section}>
        <div className="flex items-center justify-between">
          <h2 className={h2}>تنوع‌ها (رنگ، سایز، شماره)</h2>
          <button
            type="button"
            onClick={() => setVariants((l) => [...l, emptyVariant(++uid)])}
            className="flex items-center gap-1 text-xs text-plum-700 hover:underline"
          >
            <Plus size={14} /> افزودن تنوع
          </button>
        </div>
        {!hasVariants && <p className="text-xs text-plum-600">اگر محصول رنگ یا سایز ندارد، چیزی اضافه نکنید.</p>}

        {variants.map((v, n) => (
          <VariantRow
            key={v.id}
            variant={v}
            index={n}
            imageKeys={fileKeys}
            onChange={(k, val) => patchVariant(v.id, k, val)}
            onRemove={() => setVariants((l) => l.filter((x) => x.id !== v.id))}
          />
        ))}
        <input
          type="hidden"
          name="variants"
          value={JSON.stringify(
            variants.map(({ id: _local, imageKey, ...rest }) => {
              const i = fileKeys.indexOf(imageKey);
              return { ...rest, imageIndex: i >= 0 ? i : null };
            }),
          )}
        />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className={h2}>مشخصات فنی</h2>
          <button
            type="button"
            onClick={() => setSpecs((l) => [...l, { id: ++uid, key: "", value: "" }])}
            className="flex items-center gap-1 text-xs text-plum-700 hover:underline"
          >
            <Plus size={14} /> افزودن ردیف
          </button>
        </div>
        {specs.map((s) => (
          <div key={s.id} className="flex items-center gap-2">
            <input
              aria-label="عنوان"
              placeholder="عنوان (مثلاً حجم)"
              value={s.key}
              onChange={(e) => patchSpec(s.id, "key", e.target.value)}
              className={inputClass}
            />
            <input
              aria-label="مقدار"
              placeholder="مقدار (مثلاً ۵۰ میلی‌لیتر)"
              value={s.value}
              onChange={(e) => patchSpec(s.id, "value", e.target.value)}
              className={inputClass}
            />
            <button
              type="button"
              onClick={() => setSpecs((l) => l.filter((x) => x.id !== s.id))}
              aria-label="حذف ردیف"
              className="text-red-600"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        <input type="hidden" name="specifications" value={JSON.stringify(specs)} />
      </section>

      {state?.error && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <div className="flex justify-end">
        <button
          disabled={pending}
          className="rounded-lg bg-plum-700 px-6 py-2.5 text-sm text-white hover:bg-plum-900 disabled:opacity-60"
        >
          {pending ? "در حال ذخیره…" : "ثبت محصول"}
        </button>
      </div>
    </form>
  );
}