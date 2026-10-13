"use client";
import { useActionState } from "react";
import Link from "next/link";
import { AuthState, login, register } from "@/app/actions/auth";

const FIELDS = {
  username: { label: "نام کاربری", type: "text", autoComplete: "username" },
  email: { label: "ایمیل", type: "email", autoComplete: "email" },
  password: { label: "رمز عبور", type: "password", autoComplete: "current-password" },
} as const;

const MODES = {
  login: {
    action: login,
    title: "ورود به ارغوان شاپ",
    submit: "ورود",
    fields: ["email", "password"],
    alt: { text: "حساب ندارید؟", link: "ثبت‌نام", href: "/register" },
  },
  register: {
    action: register,
    title: "ساخت حساب کاربری",
    submit: "ثبت‌نام",
    fields: ["username", "email", "password"],
    alt: { text: "قبلاً ثبت‌نام کرده‌اید؟", link: "ورود", href: "/login" },
  },
} as const;

export default function AuthForm({ mode }: { mode: keyof typeof MODES }) {
  const m = MODES[mode];
  const [state, formAction, pending] = useActionState<AuthState, FormData>(m.action, undefined);

  return (
    <form
      action={formAction}
      className="mx-auto my-12 w-full max-w-sm space-y-4 rounded-xl border border-blush-200 bg-white p-6"
    >
      <h1 className="text-lg font-bold text-plum-900">{m.title}</h1>

      {m.fields.map((name) => {
        const f = FIELDS[name];
        return (
          <label key={name} className="block text-sm">
            <span className="mb-1 block text-plum-900">{f.label}</span>
            <input
              name={name}
              type={f.type}
              required
              dir="ltr"
              minLength={name === "password" && mode === "register" ? 8 : undefined}
              autoComplete={
                name === "password" && mode === "register" ? "new-password" : f.autoComplete
              }
              className="w-full rounded-lg border border-blush-300 bg-paper px-3 py-2 text-left"
            />
          </label>
        );
      })}

      {state?.error && (
        <p role="alert" className="text-xs text-red-600">
          {state.error}
        </p>
      )}

      <button
        disabled={pending}
        className="w-full rounded-lg bg-plum-700 py-2.5 text-sm text-white hover:bg-plum-900 disabled:opacity-60"
      >
        {pending ? "لطفاً صبر کنید…" : m.submit}
      </button>

      <p className="text-center text-xs text-plum-600">
        {m.alt.text}{" "}
        <Link href={m.alt.href} className="font-bold text-plum-700">
          {m.alt.link}
        </Link>
      </p>
    </form>
  );
}