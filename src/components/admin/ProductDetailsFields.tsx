import type { Gender, SkinType, VolumeUnit } from "@prisma/client";
import { GENDER_LABEL, SKIN_TYPE_LABEL, VOLUME_UNIT_LABEL } from "@/lib/labels";
import { Field, inputClass } from "./fields";

export type ProductDetailsDefaults = {
  subtitle?: string | null;
  volume?: number | null;
  volumeUnit?: VolumeUnit | null;
  countryOfOrigin?: string | null;
  barcode?: string | null;
  healthLicense?: string | null;
  ingredients?: string | null;
  usage?: string | null;
  warnings?: string | null;
  skinTypes?: SkinType[];
  gender?: Gender | null;
  paoMonths?: number | null;
  tags?: string[];
};

const ltr = `${inputClass} text-left`;

export default function ProductDetailsFields({ defaults = {} }: { defaults?: ProductDetailsDefaults }) {
  const d = defaults;
  return (
    <>
      <section className="space-y-4 border-b border-blush-200 pb-6">
        <h2 className="text-sm font-bold text-plum-900">اطلاعات تکمیلی</h2>

        <Field label="عنوان فرعی" hint="مثلاً نام انگلیسی محصول؛ زیر عنوان اصلی نمایش داده می‌شود.">
          <input name="subtitle" defaultValue={d.subtitle ?? ""} dir="ltr" className={ltr} />
        </Field>

        <div className="grid gap-3 sm:grid-cols-4">
          <Field label="حجم / وزن خالص">
            <input name="volume" type="number" min={0} step="any" defaultValue={d.volume ?? ""} dir="ltr" className={ltr} />
          </Field>
          <Field label="واحد">
            <select name="volumeUnit" defaultValue={d.volumeUnit ?? "ML"} className={inputClass}>
              {Object.entries(VOLUME_UNIT_LABEL).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="گروه مخاطب">
            <select name="gender" defaultValue={d.gender ?? ""} className={inputClass}>
              <option value="">مشخص نشده</option>
              {Object.entries(GENDER_LABEL).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="مدت مصرف پس از باز کردن" hint="به ماه (PAO)">
            <input name="paoMonths" type="number" min={0} max={120} defaultValue={d.paoMonths ?? ""} dir="ltr" className={ltr} />
          </Field>
        </div>

        <fieldset>
          <legend className="mb-2 text-sm text-plum-900">مناسب برای نوع پوست</legend>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {Object.entries(SKIN_TYPE_LABEL).map(([k, label]) => (
              <label key={k} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="skinTypes"
                  value={k}
                  defaultChecked={d.skinTypes?.includes(k as SkinType)}
                  className="size-4 accent-plum-700"
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="کشور سازنده">
            <input name="countryOfOrigin" defaultValue={d.countryOfOrigin ?? ""} className={inputClass} />
          </Field>
          <Field label="شماره پروانه بهداشت">
            <input name="healthLicense" defaultValue={d.healthLicense ?? ""} dir="ltr" className={ltr} />
          </Field>
          <Field label="بارکد">
            <input name="barcode" defaultValue={d.barcode ?? ""} dir="ltr" className={ltr} />
          </Field>
        </div>

        <Field label="برچسب‌ها" hint="با ویرگول جدا کنید؛ مثلاً: وگان، بدون پارابن، بدون سولفات">
          <input name="tags" defaultValue={d.tags?.join("، ") ?? ""} className={inputClass} />
        </Field>
      </section>

      <section className="space-y-4 border-b border-blush-200 pb-6">
        <h2 className="text-sm font-bold text-plum-900">ترکیبات، طرز استفاده و هشدارها</h2>
        <Field label="ترکیبات (INCI)" hint="فهرست ترکیبات را همان‌طور که روی بسته‌بندی نوشته شده وارد کنید.">
          <textarea name="ingredients" defaultValue={d.ingredients ?? ""} rows={4} dir="auto" className={inputClass} />
        </Field>
        <Field label="طرز استفاده">
          <textarea name="usage" defaultValue={d.usage ?? ""} rows={4} className={inputClass} />
        </Field>
        <Field label="هشدارها">
          <textarea name="warnings" defaultValue={d.warnings ?? ""} rows={3} className={inputClass} />
        </Field>
      </section>
    </>
  );
}
