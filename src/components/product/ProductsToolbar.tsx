"use client";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { ChevronDown, LayoutGrid, List } from "lucide-react";
import { toman } from "@/lib/format";

const sortOptions = [
  { value: "popular", label: "پرفروش‌ترین" },
  { value: "newest", label: "جدیدترین" },
  { value: "cheap", label: "ارزان‌ترین" },
  { value: "expensive", label: "گران‌ترین" },
];

export default function ProductsToolbar({ title = "محصولات", total }: { title?: string; total: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [pending, startTransition] = useTransition();

  const sort = sp.get("sort") ?? "popular";
  const view = sp.get("view") === "list" ? "list" : "grid";

  const update = (key: string, value: string) => {
    const params = new URLSearchParams(sp.toString());
    params.set(key, value);
    if (key !== "view") params.delete("page");
    startTransition(() => router.push(`${pathname}?${params}`, { scroll: false }));
  };

  const viewBtn = (v: "grid" | "list", Icon: typeof LayoutGrid, label: string) => (
    <button
      type="button"
      onClick={() => update("view", v)}
      aria-label={label}
      aria-pressed={view === v}
      className={`grid size-10 place-items-center rounded-lg border transition-colors ${
        view === v ? "border-plum-700 bg-plum-700 text-white" : "border-blush-200 bg-white text-plum-600 hover:bg-blush-100"
      }`}
    >
      <Icon size={18} />
    </button>
  );
  
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-plum-900">{title}</h1>
        <span className="rounded-full bg-blush-200 px-3 py-1 text-xs text-plum-700">{toman(total)} محصول</span>
      </div>

      <div className={`flex items-center gap-3 ${pending ? "opacity-60" : ""}`}>
        <div className="flex gap-2">
          {viewBtn("grid", LayoutGrid, "نمایش شبکه‌ای")}
          {viewBtn("list", List, "نمایش لیستی")}
        </div>

        <label className="flex items-center overflow-hidden rounded-lg border border-blush-200 bg-white text-xs">
          <span className="px-4 py-2.5 text-plum-600">مرتب‌سازی بر اساس</span>
          <span className="relative border-r border-blush-200">
            <select
              value={sort}
              onChange={(e) => update("sort", e.target.value)}
              className="h-full cursor-pointer appearance-none bg-transparent py-2.5 pr-4 pl-9 text-plum-900 outline-none"
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-plum-600" />
          </span>
        </label>
      </div>
    </div>
  );
}