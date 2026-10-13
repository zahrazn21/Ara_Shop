"use client";

import { Edit, Plus, Trash2, X } from "lucide-react";
import { startTransition, useActionState, useEffect, useMemo, useRef, useState } from "react";
import { getProductForEdit, updateProduct, type EditState } from "@/app/actions/products";
import { PRODUCT_STATUS_LABEL } from "@/lib/labels";
import { Field, inputClass } from "./fields";
import ProductDetailsFields from "./ProductDetailsFields";
import VariantRow, { emptyVariant, fileKey, type VariantDraft } from "./VariantRow";
import Image from "next/image";

type Product = NonNullable<Awaited<ReturnType<typeof getProductForEdit>>>;

const MAX_IMAGES = 6;
const ltr = `${inputClass} text-left`;

type Variant = VariantDraft;
type Spec = { id: number; key: string; value: string };

let uid = 0;

function EditForm({ product, onDone }: { product: Product; onDone: () => void }) {
  const [state, formAction, pending] = useActionState<EditState, FormData>(updateProduct, undefined);

  useEffect(() => {
    if (state?.ok) onDone();
  }, [state, onDone]);

  const [kept, setKept] = useState<string[]>(product.images);
  const [files, setFiles] = useState<File[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);

  const [variants, setVariants] = useState<Variant[]>(() =>
    product.variants.map((v) => ({
      id: ++uid,
      dbId: v.id,
      color: v.color ?? "",
      colorHex: v.colorHex ?? "",
      imageKey: v.image ?? "",
      size: v.size ?? "",
      number: v.number ?? "",
      sku: v.sku ?? "",
      stock: String(v.stock),
      priceDiff: String(v.priceDiff),
    })),
  );
  const [specs, setSpecs] = useState<Spec[]>(() =>
    Object.entries(product.specifications ?? {}).map(([key, value]) => ({ id: ++uid, key, value })),
  );

  const newPreviews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  useEffect(() => () => newPreviews.forEach(URL.revokeObjectURL), [newPreviews]);

  const syncInput = (list: File[]) => {
    const dt = new DataTransfer();
    list.forEach((f) => dt.items.add(f));
    if (fileInput.current) fileInput.current.files = dt.files;
  };
  const addFiles = (picked: FileList | null) => {
    const room = MAX_IMAGES - kept.length;
    const next = [...files, ...Array.from(picked ?? [])].slice(0, Math.max(room, 0));
    setFiles(next);
    syncInput(next);
  };
  const removeKept = (i: number) => setKept((l) => l.filter((_, j) => j !== i));
  const removeNew = (i: number) => {
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

  const hasVariants = variants.length > 0;
  const section = "space-y-4 border-b border-blush-200 pb-6";
  const h2 = "text-sm font-bold text-plum-900";

  const imageKeys = [...kept, ...files.map(fileKey)];

  const thumbs = [
    ...kept.map((src, i) => ({ src, onRemove: () => removeKept(i) })),
    ...newPreviews.map((src, i) => ({ src, onRemove: () => removeNew(i) })),
  ];

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <input type="hidden" name="id" value={product.id} />

      <section className={section}>
        <h2 className={h2}>اطلاعات پایه</h2>
        <Field label="نام محصول">
          <input name="name" defaultValue={product.name} required className={inputClass} />
        </Field>
        <Field label="اسلاگ (بخش آخر آدرس)" hint="با تغییر آن، آدرس قبلی محصول از کار می‌افتد.">
          <input name="slug" defaultValue={product.slug} required dir="ltr" className={ltr} />
        </Field>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="دسته‌بندی">
            <select name="categoryId" required defaultValue={product.categoryId} className={inputClass}>
              {product.categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="برند">
            <input name="brand" defaultValue={product.brand ?? ""} className={inputClass} />
          </Field>
          <Field label="وضعیت">
            <select name="status" defaultValue={product.status} className={inputClass}>
              {Object.entries(PRODUCT_STATUS_LABEL).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="توضیحات">
          <textarea name="description" defaultValue={product.description ?? ""} rows={4} className={inputClass} />
        </Field>
        <Field label="ویژگی‌ها" hint="هر ویژگی در یک خط">
          <textarea name="features" defaultValue={product.features.join("\n")} rows={4} className={inputClass} />
        </Field>
      </section>

      <ProductDetailsFields defaults={product} />

      <section className={section}>
        <h2 className={h2}>قیمت و موجودی</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="قیمت فروش (تومان)">
            <input name="price" type="number" min={0} required defaultValue={product.price} dir="ltr" className={ltr} />
          </Field>
          <Field label="قیمت قبل از تخفیف" hint="اختیاری؛ باید از قیمت فروش بیشتر باشد.">
            <input
              name="originalPrice"
              type="number"
              min={0}
              defaultValue={product.originalPrice ?? ""}
              dir="ltr"
              className={ltr}
            />
          </Field>
          <Field
            label="موجودی"
            hint={hasVariants ? "محصول تنوع دارد؛ موجودی از روی تنوع‌ها حساب می‌شود." : undefined}
          >
            <input
              name="stock"
              type="number"
              min={0}
              defaultValue={product.stock}
              disabled={hasVariants}
              dir="ltr"
              className={ltr}
            />
          </Field>
          <Field label="کد محصول (SKU)">
            <input name="sku" defaultValue={product.sku ?? ""} dir="ltr" className={ltr} />
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
          disabled={thumbs.length >= MAX_IMAGES}
          onChange={(e) => addFiles(e.target.files)}
          className="block text-sm file:ml-3 file:rounded-lg file:border-0 file:bg-blush-100 file:px-4 file:py-2 file:text-plum-700"
        />
        {thumbs.length > 0 && (
          <ul className="flex flex-wrap gap-3">
            {thumbs.map((t, i) => (
              <li key={t.src} className="relative">
                <Image width={500} height={400} src={t.src} alt="" className="size-20 rounded-lg border border-blush-200 object-cover" />
                {i === 0 && (
                  <span className="absolute bottom-1 right-1 rounded bg-plum-700 px-1.5 text-[10px] text-white">
                    اصلی
                  </span>
                )}
                <button
                  type="button"
                  onClick={t.onRemove}
                  aria-label="حذف عکس"
                  className="absolute -left-2 -top-2 grid size-5 place-items-center rounded-full bg-white shadow ring-1 ring-blush-300"
                >
                  <X size={12} />
                </button>
              </li>
            ))}
          </ul>
        )}
        <input type="hidden" name="keepImages" value={JSON.stringify(kept)} />
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
            imageKeys={imageKeys}
            onChange={(k, val) => patchVariant(v.id, k, val)}
            onRemove={() => setVariants((l) => l.filter((x) => x.id !== v.id))}
          />
        ))}
        <input
          type="hidden"
          name="variants"
          value={JSON.stringify(
            variants.map(({ id: _local, dbId, imageKey, ...rest }) => {
              const i = imageKeys.indexOf(imageKey);
              return { id: dbId ?? null, ...rest, imageIndex: i >= 0 ? i : null };
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
        <input
          type="hidden"
          name="specifications"
          value={JSON.stringify(specs.map(({ key, value }) => ({ key, value })))}
        />
      </section>

      {state?.error && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onDone}
          className="rounded-lg border border-blush-300 px-4 py-2 text-sm text-plum-700 hover:bg-blush-100"
        >
          انصراف
        </button>
        <button
          disabled={pending}
          className="rounded-lg bg-plum-700 px-6 py-2.5 text-sm text-white hover:bg-plum-900 disabled:opacity-60"
        >
          {pending ? "در حال ذخیره…" : "ذخیره تغییرات"}
        </button>
      </div>
    </form>
  );
}

function EditProductModal({ closeModal, productId }: { closeModal: () => void; productId: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "missing">("loading");

  useEffect(() => {
    let cancelled = false;
    getProductForEdit(productId)
      .then((p) => {
        if (cancelled) return;
        setProduct(p);
        setStatus(p ? "ready" : "missing");
      })
      .catch(() => !cancelled && setStatus("missing"));
    return () => {
      cancelled = true;
    };
  }, [productId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeModal();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [closeModal]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={closeModal}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-product-title"
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white p-6 scrollbar-hide"
      >
        <button
          onClick={closeModal}
          aria-label="بستن"
          className="absolute left-4 top-4 text-plum-600 hover:text-plum-900"
        >
          <X size={20} />
        </button>

        <h2 id="edit-product-title" className="mb-4 text-lg font-bold text-plum-900">
          ویرایش محصول
        </h2>

        {status === "loading" && <p className="py-10 text-center text-sm text-plum-600">در حال بارگذاری…</p>}
        {status === "missing" && (
          <p className="py-10 text-center text-sm text-red-600">محصول پیدا نشد یا دسترسی ندارید.</p>
        )}
        {status === "ready" && product && <EditForm product={product} onDone={closeModal} />}
      </div>
    </div>
  );
}

export default function EditProduct({ productId }: { productId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const closeModal = () => setIsOpen(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        aria-label="ویرایش محصول"
        className="rounded-lg p-2 text-plum-700 hover:bg-blush-100"
      >
        <Edit size={15} />
      </button>
      {isOpen && <EditProductModal closeModal={closeModal} productId={productId} />}
    </>
  );
}