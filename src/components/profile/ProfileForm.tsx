"use client";
import { useActionState, useState } from "react";
import { updateProfile, type ProfileState } from "@/app/actions/profile";

const inputClass = "w-full rounded-lg border border-blush-300 bg-paper px-3 py-2";

export default function ProfileForm({ username, name }: { username: string; name: string }) {
  const [state, action, pending] = useActionState<ProfileState, FormData>(updateProfile, undefined);
  // مقدارها رو توی state نگه می‌داریم تا با خطا، چیزی که کاربر نوشته پاک نشه
  const [u, setU] = useState(username);
  const [n, setN] = useState(name);

  return (
    <form action={action} className="mt-5 space-y-4 rounded-xl border border-blush-200 bg-white p-4 text-sm">
      <h2 className="font-bold text-plum-900">ویرایش اطلاعات</h2>

      <label className="block">
        <span className="mb-1 block text-plum-900">نام کاربری</span>
        <input
          name="username"
          value={u}
          onChange={(e) => setU(e.target.value)}
          required
          minLength={3}
          maxLength={20}
          dir="ltr"
          autoComplete="username"
          className={`${inputClass} text-left`}
        />
        <span className="mt-1 block text-xs text-plum-600">
          زیر نظرهای شما نمایش داده می‌شود. حروف انگلیسی، عدد، نقطه و _
        </span>
      </label>

      <label className="block">
        <span className="mb-1 block text-plum-900">نام و نام خانوادگی (اختیاری)</span>
        <input
          name="name"
          value={n}
          onChange={(e) => setN(e.target.value)}
          maxLength={60}
          autoComplete="name"
          className={inputClass}
        />
        <span className="mt-1 block text-xs text-plum-600">برای دیگران نمایش داده نمی‌شود.</span>
      </label>

      {state?.error && (
        <p role="alert" className="text-xs text-red-600">
          {state.error}
        </p>
      )}
      {state?.ok && (
        <p role="status" className="text-xs text-green-700">
          تغییرات ذخیره شد.
        </p>
      )}

      <button
        disabled={pending}
        className="rounded-lg bg-plum-700 px-4 py-2 text-white hover:bg-plum-900 disabled:opacity-60"
      >
        {pending ? "در حال ذخیره…" : "ذخیره تغییرات"}
      </button>
    </form>
  );
}