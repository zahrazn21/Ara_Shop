"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/admin", label: "داشبورد", ready: true },
  { href: "/admin/products", label: "محصولات", ready: true },
  { href: "/admin/categories", label: "دسته‌بندی‌ها", ready: true },
  { href: "/admin/orders", label: "سفارش‌ها", ready: true },
  { href: "/admin/reviews", label: "نظرها", ready: true },
  { href: "/admin/coupons", label: "کوپن‌ها", ready: false },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="منوی مدیریت" className="flex gap-1 overflow-x-auto md:flex-col">
      {ITEMS.map((item) => {
        const active =
          item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        const base = "whitespace-nowrap rounded-lg px-3 py-2 text-sm";

        if (!item.ready)
          return (
            <span key={item.href} className={`${base} cursor-default text-plum-600/50`}>
              {item.label}
            </span>
          );

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`${base} ${
              active ? "bg-blush-100 font-bold text-plum-900" : "text-plum-700 hover:bg-blush-100"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}