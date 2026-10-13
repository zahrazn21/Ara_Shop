import Link from "next/link";

const hrefs: Record<string, string> = {
  "محصولات": "/products",
  "تماس با ما": "/about#contact",
  "درباره ما": "/about",
};

const cols = [
  { title: "فروشگاه", links: ["محصولات", "برندها", "پرفروش‌ها", "جدیدترین‌ها", "درباره ما"] },
  { title: "راهنما", links: ["نحوه ثبت سفارش", "روش‌های ارسال", "بازگشت کالا", "سوالات متداول"] },
  { title: "پشتیبانی", links: ["تماس با ما", "پشتیبانی آنلاین", "شرایط و قوانین", "حریم خصوصی"] },
];

export default function Footer() {
  return (
    <footer className="bg-plum-900 text-blush-100">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-[1.2fr_repeat(3,1fr)]">
        <div>
          <p className="font-brand text-3xl">Ara Shop</p>
          <p className="mt-2 text-sm opacity-80">همیشه در کنار زیبایی شما</p>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <h4 className="mb-3 font-bold">{c.title}</h4>
            <ul className="space-y-2 text-sm opacity-80">
              {c.links.map((l) => <li key={l}><Link href={hrefs[l] ?? "#"}>{l}</Link></li>)}
            </ul>
          </div>
        ))}
      </div>
      <p className="border-t border-white/10 py-4 text-center text-xs opacity-70">© 2026 Ara Shop. All rights reserved.</p>
    </footer>
  );
}