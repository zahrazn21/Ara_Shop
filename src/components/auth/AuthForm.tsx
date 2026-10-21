
"use client";

import { useActionState, useRef, useState } from "react";
import { otpAuth, type OtpState } from "@/app/actions/auth";
import { ArrowLeft, ShieldCheck } from "lucide-react";

const inputClass =
  "w-full rounded-xl border border-blush-300 bg-paper px-3 py-3 text-left text-sm text-plum-900 outline-none transition focus:border-plum-700 focus:ring-2 focus:ring-blush-200";

const linkBtn =
  "text-xs font-bold text-plum-700 transition hover:text-plum-900 hover:underline disabled:opacity-60";

function normalizeDigits(value: string) {
  return value
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .replace(/\D/g, "");
}

export default function AuthForm() {
  const [state, action, pending] = useActionState<OtpState, FormData>(
    otpAuth,
    undefined,
  );

  const [phone, setPhone] = useState("");
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  const step = state?.step ?? "phone";

  function updateDigits(index: number, raw: string) {
    const value = normalizeDigits(raw);

    if (!value) {
      setDigits((prev) =>
        prev.map((digit, i) => (i === index ? "" : digit)),
      );
      return;
    }

    const next = [...digits];

    value
      .slice(0, 6 - index)
      .split("")
      .forEach((digit, offset) => {
        next[index + offset] = digit;
      });

    setDigits(next);

    const firstEmpty = next.findIndex((digit) => !digit);

    if (firstEmpty !== -1) {
      inputs.current[firstEmpty]?.focus();
    } else {
      inputs.current[5]?.focus();
    }
  }

  return (
    <form
      action={action}
      dir="rtl"
      className="mx-auto my-12 w-full max-w-md space-y-5 rounded-3xl border border-blush-200 bg-white p-6 shadow-xl shadow-plum-900/5 sm:p-8"
    >
      <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-blush-100 text-plum-700">
        <ShieldCheck size={28} strokeWidth={1.7} />
      </div>

      <div className="text-center">
        <h1 className="text-xl font-black text-plum-900">
          ورود یا ثبت‌نام
        </h1>
        <p className="mt-2 text-sm leading-7 text-plum-600">
          به خانواده ارغوان شاپ خوش آمدید.
        </p>
      </div>

      {step === "phone" && (
        <label className="block text-sm">
          <span className="mb-2 block font-bold text-plum-900">
            شماره موبایل
          </span>

          <input
            name="phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            required
            autoFocus
            dir="ltr"
            placeholder="09123456789"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputClass}
          />
        </label>
      )}

      {step === "code" && (
        <>
          <input
            type="hidden"
            name="phone"
            value={state?.phone ?? phone}
          />

          <input
            type="hidden"
            name="code"
            value={digits.join("")}
          />

          <div className="text-center">
            <p className="text-sm leading-7 text-plum-600">
              کد تأیید ارسال‌شده به شماره
            </p>
            <p dir="ltr" className="mt-1 font-bold text-plum-900">
              {state?.phone}
            </p>
            <p className="mt-4 text-sm text-plum-700">
              کد ۶ رقمی را وارد کنید
            </p>
          </div>

          <div dir="ltr" className="flex justify-center gap-2 sm:gap-3">
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                autoComplete={index === 0 ? "one-time-code" : "off"}
                aria-label={`رقم ${index + 1} کد تأیید`}
                value={digit}
                required={index === 0}
                disabled={pending}
                onChange={(e) => updateDigits(index, e.target.value)}
                onPaste={(e) => {
                  e.preventDefault();
                  updateDigits(
                    index,
                    e.clipboardData.getData("text"),
                  );
                }}
                onKeyDown={(e) => {
                  if (
                    e.key === "Backspace" &&
                    !digit &&
                    index > 0
                  ) {
                    e.preventDefault();
                    setDigits((prev) =>
                      prev.map((d, i) =>
                        i === index - 1 ? "" : d,
                      ),
                    );
                    inputs.current[index - 1]?.focus();
                  }

                  if (e.key === "ArrowLeft" && index < 5) {
                    e.preventDefault();
                    inputs.current[index + 1]?.focus();
                  }

                  if (e.key === "ArrowRight" && index > 0) {
                    e.preventDefault();
                    inputs.current[index - 1]?.focus();
                  }
                }}
                className="h-12 w-10 rounded-xl border border-blush-200 bg-paper text-center text-xl font-bold text-plum-900 outline-none transition focus:border-plum-700 focus:bg-white focus:ring-2 focus:ring-blush-200 disabled:opacity-60 sm:h-14 sm:w-12"
              />
            ))}
          </div>
        </>
      )}

      {step === "username" && (
        <>
          <input
            type="hidden"
            name="phone"
            value={state?.phone ?? ""}
          />
          <input
            type="hidden"
            name="code"
            value={state?.code ?? ""}
          />

          <p className="text-sm leading-7 text-plum-700">
            شماره شما تأیید شد. برای ساخت حساب، یک نام کاربری انتخاب کنید.
          </p>

          <label className="block text-sm">
            <span className="mb-2 block font-bold text-plum-900">
              نام کاربری
            </span>

            <input
              name="username"
              autoComplete="username"
              required
              autoFocus
              minLength={3}
              maxLength={20}
              dir="ltr"
              placeholder="مثلاً sara_92"
              className={inputClass}
            />

            <span className="mt-2 block text-xs leading-6 text-plum-600">
              برای نمایش کنار نظرهای شما؛ حروف انگلیسی، عدد، نقطه و _
            </span>
          </label>
        </>
      )}

      {state?.error && (
        <p
          role="alert"
          className="rounded-xl bg-red-50 p-3 text-xs leading-6 text-red-600"
        >
          {state.error}
        </p>
      )}

      <button
        name="intent"
        value={step === "phone" ? "send" : "verify"}
        disabled={pending || (step === "code" && digits.some((d) => !d))}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-plum-700 py-3.5 text-sm font-bold text-white transition hover:bg-plum-900 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending
          ? "لطفاً صبر کنید..."
          : step === "phone"
            ? "ارسال کد تأیید"
            : step === "code"
              ? "تأیید و ورود"
              : "ساخت حساب و ورود"}

        {!pending && <ArrowLeft size={17} />}
      </button>

      {step !== "phone" && (
        <div className="flex items-center justify-between">
          {step === "code" ? (
            <button
              type="submit"
              name="intent"
              value="send"
              formNoValidate
              disabled={pending}
              className={linkBtn}
            >
              ارسال دوباره کد
            </button>
          ) : (
            <span />
          )}

          <button
            type="submit"
            name="intent"
            value="reset"
            formNoValidate
            disabled={pending}
            className={linkBtn}
            onClick={() => setDigits(Array(6).fill(""))}
          >
            تغییر شماره
          </button>
        </div>
      )}
    </form>
  );
}
