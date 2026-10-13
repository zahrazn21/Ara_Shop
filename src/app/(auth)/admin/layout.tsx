import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/session";
import AdminNav from "@/components/admin/AdminNav";
import { logout } from "@/app/actions/auth";

export const metadata: Metadata = {
  title: "پنل مدیریت | ارغوان شاپ",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();

  return (
    <div className="flex min-h-screen flex-col md:flex-row ">
      <aside className=" flex flex-col gap-4 border-b border-blush-200 bg-white p-4 md:w-56 md:shrink-0 md:border-b-0 md:border-l">
        <Link href="/admin" className="font-brand text-xl font-semibold text-plum-900">
          Arghavan Shop
        </Link>

        <AdminNav />

        <div className="mt-auto hidden space-y-2 border-t border-blush-200 pt-4 text-xs md:block">
          <p className="text-plum-600">{user.username}</p>
          <Link href="/" className="block text-plum-700 hover:underline">
            مشاهده فروشگاه
          </Link>
          <form action={logout}>
            <button className="text-plum-700 hover:underline">خروج</button>
          </form>
        </div>
      </aside>

      <main className="min-w-0 flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}