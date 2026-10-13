"use client";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronDown,
  ChevronLeft,
  Search,
  ShoppingBag,
  User,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useCartCount } from "@/hooks/use-cart-count";

const nav = [
  { href: "/", label: "خانه" },
  { href: "/products", label: "فروشگاه" },
  { href: "/categories", label: "محصولات" },
  { href: "/about", label: "درباره ما" },
];

type HeaderProps = {
  categories: {
    id: string;
    name: string;
    slug: string;
    image: string | null;
  }[];
};

const navLink =
  "relative py-1 transition-colors hover:text-plum-700 after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-center after:scale-x-0 after:bg-gold after:transition-transform hover:after:scale-x-100";

export default function Header({ categories }: HeaderProps) {
  const count = useCartCount();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setIsOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  return (
    <header className="sticky top-0 z-30">
      <div className="flex justify-between bg-plum-600 px-6 py-1.5 text-xs text-white">
        <span>تخفیف‌های ویژه | اصالت کالا | پشتیبانی ۲۴ ساعته</span>
        <span>ارسال رایگان برای سفارش‌های بالای ۸۰۰ هزار تومان</span>
      </div>

      <div className="border-b border-blush-200 bg-paper/95 backdrop-blur">
        <div className="relative mx-auto flex max-w-7xl items-center gap-8 px-4 py-4">
          <Link href="/" className="font-brand text-3xl text-plum-700">
            Arghavan Shop
          </Link>

          <nav className="hidden gap-7 text-sm md:flex">
            {nav.map((n) =>
              n.label === "محصولات" ? (
                <div key={n.href} ref={menuRef}>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls="categories-menu"
                    onClick={() => setIsOpen((o) => !o)}
                    className={`flex items-center gap-1 py-1 transition-colors hover:text-plum-700 ${isOpen ? "text-plum-700" : ""}`}
                  >
                    {n.label}
                    <ChevronDown
                      size={15}
                      className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  <div
                    id="categories-menu"
                    className={`absolute inset-x-4 top-full z-30 origin-top transition-all duration-200 ease-out ${
                      isOpen
                        ? "visible translate-y-0 scale-100 opacity-100"
                        : "pointer-events-none invisible -translate-y-2 scale-[0.98] opacity-0"
                    }`}
                  >
                    <div className="mt-1 overflow-hidden rounded-2xl border border-blush-200 border-t-2 border-t-gold bg-white shadow-xl shadow-plum-900/10">
                      <div className="grid grid-cols-2 gap-1 p-4 lg:grid-cols-4">
                        {categories.map((c) => (
                          <Link
                            key={c.id}
                            href={`/category/${c.slug}`}
                            onClick={() => setIsOpen(false)}
                            className="group flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-blush-100"
                          >
                            <span className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-blush-200">
                              {c.image ? (
                                <Image
                                  src={c.image}
                                  alt=""
                                  fill
                                  sizes="56px"
                                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                              ) : (
                                <span className="grid h-full place-items-center font-bold text-plum-700">
                                  {c.name[0]}
                                </span>
                              )}
                            </span>
                            <span className="text-sm text-ink transition-colors group-hover:text-plum-700">
                              {c.name}
                            </span>
                            <ChevronLeft
                              size={14}
                              className="ms-auto translate-x-1 text-plum-600 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100"
                            />
                          </Link>
                        ))}
                      </div>

                      <div className="flex items-center justify-between border-t border-blush-200 bg-blush-100/60 px-5 py-3 text-xs">
                        <span className="text-plum-600">
                          {categories.length} دسته‌بندی
                        </span>
                        <Link
                          href="/products"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-1 font-bold text-plum-700 hover:text-plum-900"
                        >
                          مشاهده همه محصولات <ArrowLeft size={14} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <Link key={n.href} href={n.href} className={navLink}>
                  {n.label}
                </Link>
              ),
            )}
          </nav>

          <form
            action="/search"
            className="mr-auto hidden max-w-xs flex-1 items-center rounded-full border border-blush-300 bg-blush-100 px-4 py-2 md:flex"
          >
            <input
              name="q"
              placeholder="جستجوی محصولات، برندها و دسته‌ها..."
              className="w-full bg-transparent text-xs outline-none!"
            />
            <button type="submit" aria-label="جستجو" className="outline-none">
              <Search size={16} />
            </button>
          </form>

          <div className="mr-auto flex gap-4 md:mr-0">
            <Link href="/cart" aria-label="سبد خرید" className="relative">
              <ShoppingBag size={20} />
              {count > 0 && (
                <span className="absolute -top-2 -right-2 grid size-4 place-items-center rounded-full bg-plum-700 text-[10px] text-white">
                  {count}
                </span>
              )}
            </Link>
            <Link href="/profile" aria-label="حساب کاربری">
              <User size={20} />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
