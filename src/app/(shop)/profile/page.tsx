import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { logout } from "@/app/actions/auth";
import ProfileForm from "@/components/profile/ProfileForm";

export const metadata: Metadata = {
  title: "حساب کاربری | ارغوان شاپ",
  robots: { index: false },
};

const ROLE_LABEL = { ADMIN: "مدیر", USER: "کاربر" } as const;

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const rows = [
    { label: "نام کاربری", value: user.username },
    { label: "شماره موبایل", value: user.phone ?? "—", ltr: true },
    { label: "نقش", value: ROLE_LABEL[user.role] },
  ];

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="mb-4 text-lg font-bold text-plum-900">حساب کاربری</h1>

      <dl className="divide-y divide-blush-200 rounded-xl border border-blush-200 bg-white text-sm">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between gap-4 px-4 py-3">
            <dt className="text-plum-600">{r.label}</dt>
            <dd dir={r.ltr ? "ltr" : undefined}>{r.value}</dd>
          </div>
        ))}
      </dl>
            <ProfileForm username={user.username} name={user.name ?? ""} />

      <div className="mt-5 flex flex-wrap items-center gap-3">
        {user.role === "ADMIN" && (
          <Link
            href="/admin"
            className="rounded-lg bg-plum-700 px-4 py-2 text-sm text-white hover:bg-plum-900"
          >
            ورود به پنل مدیریت
          </Link>
        )}
        <form action={logout}>
          <button className="rounded-lg border border-blush-300 px-4 py-2 text-sm text-plum-700 hover:bg-blush-100">
            خروج از حساب
          </button>
          
        </form>
                <Link
          href="/orders"
          className="rounded-lg border border-blush-300 px-4 py-2 text-sm text-plum-700 hover:bg-blush-100"
        >
          سفارش‌های من
        </Link>
      </div>
    </div>
  );
}