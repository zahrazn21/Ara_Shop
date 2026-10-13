import { Trash2 } from "lucide-react";
import { toman } from "@/lib/format";
import { colorSwatch } from "@/lib/colors";
import { Field, inputClass } from "./fields";

export type VariantDraft = {
  id: number;
  dbId?: string;
  color: string;
  colorHex: string;
  size: string;
  number: string;
  sku: string;
  stock: string;
  priceDiff: string;
  imageKey: string;
};

export const fileKey = (f: File) => `new:${f.name}:${f.size}:${f.lastModified}`;

export const emptyVariant = (id: number): VariantDraft => ({
  id,
  color: "",
  colorHex: "",
  size: "",
  number: "",
  sku: "",
  stock: "0",
  priceDiff: "0",
  imageKey: "",
});

type TextKey = "color" | "colorHex" | "size" | "number" | "sku" | "stock" | "priceDiff";

const FIELDS: { key: TextKey; label: string; ltr?: boolean; type?: "number"; hint?: string }[] = [
  { key: "color", label: "رنگ" },
  { key: "colorHex", label: "کد رنگ", ltr: true, hint: "مثل #f4a6b8" },
  { key: "size", label: "سایز" },
  { key: "number", label: "شماره" },
  { key: "sku", label: "SKU", ltr: true },
  { key: "stock", label: "موجودی", ltr: true, type: "number" },
  { key: "priceDiff", label: "اختلاف قیمت", ltr: true, type: "number" },
];

export default function VariantRow({
  variant: v,
  index,
  imageKeys,
  onChange,
  onRemove,
}: {
  variant: VariantDraft;
  index: number;
  imageKeys: string[];
  onChange: (key: keyof VariantDraft, value: string) => void;
  onRemove: () => void;
}) {
  const swatch = colorSwatch(v.colorHex) ?? colorSwatch(v.color);

  return (
    <div className="space-y-3 rounded-lg border border-blush-200 p-3">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-xs font-bold text-plum-900">
          {swatch && (
            <span aria-hidden className="size-4 rounded-full border border-black/10" style={{ backgroundColor: swatch }} />
          )}
          تنوع {toman(index + 1)}
        </span>
        <button type="button" onClick={onRemove} aria-label="حذف تنوع" className="text-red-600">
          <Trash2 size={16} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {FIELDS.map((f) => (
          <Field key={f.key} label={f.label} hint={f.hint}>
            <input
              value={v[f.key]}
              onChange={(e) => onChange(f.key, e.target.value)}
              type={f.type ?? "text"}
              min={f.key === "stock" ? 0 : undefined}
              dir={f.ltr ? "ltr" : undefined}
              placeholder={f.key === "colorHex" ? "#" : undefined}
              className={inputClass}
            />
          </Field>
        ))}
        <Field label="عکس این تنوع" hint="با انتخاب این تنوع، عکس در گالری نمایش داده می‌شود.">
          <select value={v.imageKey} onChange={(e) => onChange("imageKey", e.target.value)} className={inputClass}>
            <option value="">بدون عکس مخصوص</option>
            {imageKeys.map((key, i) => (
              <option key={key} value={key}>
                عکس {toman(i + 1)}
              </option>
            ))}
          </select>
        </Field>
      </div>
    </div>
  );
}
