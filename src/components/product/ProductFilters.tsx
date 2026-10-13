"use client";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { ChevronDown, X } from "lucide-react";
import { toman } from "@/lib/format";

type Cat = { id: string; name: string; slug: string };
type Bounds = { min: number; max: number };

const STEP = 10000;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details open className="group border-b border-blush-200 py-5 last:border-0">
      <summary className="flex cursor-pointer list-none items-center justify-between font-bold text-plum-900 [&::-webkit-details-marker]:hidden">
        {title}
        <ChevronDown size={16} className="text-plum-600 transition-transform group-open:rotate-180" />
      </summary>
      <div className="mt-4">{children}</div>
    </details>
  );
}

const thumb =
  "[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-plum-700 [&::-webkit-slider-thumb]:shadow " +
  "[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-plum-700";

function PriceRange({ bounds, initial, onCommit }: {
  bounds: Bounds; initial: [number, number]; onCommit: (min: number, max: number) => void;
}) {
  const [[lo, hi], setRange] = useState(initial);
  const span = Math.max(bounds.max - bounds.min, 1);
  const pct = (v: number) => ((v - bounds.min) / span) * 100;
  const commit = () => onCommit(lo, hi);

  const input = (value: number, onChange: (v: number) => void, label: string) => (
    <input
      type="range" min={bounds.min} max={bounds.max} step={STEP} value={value} aria-label={label}
      onChange={(e) => onChange(Number(e.target.value))}
      onPointerUp={commit} onKeyUp={commit}
      className={`pointer-events-none absolute inset-0 h-5 w-full appearance-none bg-transparent outline-none [&::-moz-range-track]:bg-transparent [&::-webkit-slider-runnable-track]:bg-transparent ${thumb}`}
    />
  );

  return (
    <div>
      <div className="relative mx-1 h-5">
        <div className="absolute top-1/2 h-1 w-full -translate-y-1/2 rounded bg-blush-200" />
        <div className="absolute top-1/2 h-1 -translate-y-1/2 rounded bg-plum-700"
          style={{ right: `${pct(lo)}%`, left: `${100 - pct(hi)}%` }} />
        {input(lo, (v) => setRange([Math.min(v, hi - STEP), hi]), "حداقل قیمت")}
        {input(hi, (v) => setRange([lo, Math.max(v, lo + STEP)]), "حداکثر قیمت")}
      </div>
      <div className="mt-4 flex justify-between text-[11px] text-plum-600">
        <span>از {toman(lo)} تومان</span>
        <span>تا {toman(hi)} تومان</span>
      </div>
    </div>
  );
}

export default function ProductsFilter({
  categories,
  priceBounds,
  hideCategories = false,
}: {
  categories: Cat[];
  priceBounds: Bounds;
  hideCategories?: boolean; 
}) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [pending, startTransition] = useTransition();

  const category = sp.get("category") ?? "";
  const inStock = sp.get("inStock") === "1";
  const minPrice = Number(sp.get("minPrice")) || priceBounds.min;
  const maxPrice = Number(sp.get("maxPrice")) || priceBounds.max;
  const hasFilters = (!hideCategories && !!category) || inStock || sp.has("minPrice") || sp.has("maxPrice");

  const update = (changes: Record<string, string | null>) => {
    const params = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(changes)) v === null ? params.delete(k) : params.set(k, v);
    params.delete("page");
    startTransition(() => router.push(`${pathname}?${params}`, { scroll: false }));
  };

  const clearAll = () => update({ category: null, inStock: null, minPrice: null, maxPrice: null });

  return (
    <aside className={`rounded-2xl w-64 h-fit sticky top-25 duration-700 border border-blush-200 bg-white px-5 transition-opacity ${pending ? "opacity-60" : ""}`}>
      {hasFilters && (
        <button onClick={clearAll} className="mt-4 flex items-center gap-1 text-xs text-plum-700 hover:underline">
          <X size={12} /> حذف همه‌ی فیلترها
        </button>
      )}

      {!hideCategories && (
        <Section title="دسته‌بندی‌ها">
          <ul className="space-y-3 text-sm">
            {categories.map((c) => (
              <li key={c.id}>
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="radio" name="category" checked={category === c.slug}
                    onChange={() => update({ category: c.slug })}
                    className="size-4 accent-plum-700"
                  />
                  {c.name}
                </label>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section title="محدوده قیمت">
        <PriceRange
          key={`${minPrice}-${maxPrice}`}
          bounds={priceBounds}
          initial={[minPrice, maxPrice]}
          onCommit={(lo, hi) =>
            update({
              minPrice: lo <= priceBounds.min ? null : String(lo),
              maxPrice: hi >= priceBounds.max ? null : String(hi),
            })
          }
        />
      </Section>

      <Section title="موجودی در انبار">
        <label className="flex cursor-pointer items-center gap-3 text-sm">
          <input
            type="checkbox" checked={inStock}
            onChange={(e) => update({ inStock: e.target.checked ? "1" : null })}
            className="size-4 accent-plum-700"
          />
          فقط کالاهای موجود
        </label>
      </Section>
    </aside>
  );
}