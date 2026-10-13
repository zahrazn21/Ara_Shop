"use client";
import { useState, useTransition } from "react";
import { Check, Trash2, X } from "lucide-react";
import type { ReviewStatus } from "@prisma/client";
import { deleteReview, moderateReview, type ReviewActionState } from "@/app/actions/reviews";
import { inputClass } from "./fields";

export default function ReviewActions({ id, status }: { id: string; status: ReviewStatus }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [note, setNote] = useState("");

  const run = (fn: () => Promise<ReviewActionState>) => {
    setError(null);
    start(async () => {
      const r = await fn();
      if (r?.error) setError(r.error);
      else {
        setRejecting(false);
        setNote("");
      }
    });
  };

  const btn =
    "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {status !== "APPROVED" && (
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => moderateReview(id, "APPROVED"))}
            className={`${btn} bg-green-100 text-green-800 hover:bg-green-200`}
          >
            <Check size={14} /> تأیید
          </button>
        )}
        {status !== "REJECTED" && !rejecting && (
          <button
            type="button"
            disabled={pending}
            onClick={() => setRejecting(true)}
            className={`${btn} bg-amber-100 text-amber-800 hover:bg-amber-200`}
          >
            <X size={14} /> رد
          </button>
        )}
        <button
          type="button"
          disabled={pending}
          onClick={() => window.confirm("این نظر برای همیشه حذف شود؟") && run(() => deleteReview(id))}
          className={`${btn} text-red-600 hover:bg-red-50`}
        >
          <Trash2 size={14} /> حذف
        </button>
        {pending && <span className="text-xs text-plum-600">در حال انجام…</span>}
      </div>

      {rejecting && (
        <div className="space-y-2 rounded-lg bg-blush-100/60 p-3">
          <label className="block text-xs text-plum-900">
            دلیل رد (اختیاری؛ فقط برای مدیران نمایش داده می‌شود)
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              maxLength={1000}
              className={`${inputClass} mt-1`}
            />
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={pending}
              onClick={() => run(() => moderateReview(id, "REJECTED", note))}
              className={`${btn} bg-plum-700 text-white hover:bg-plum-900`}
            >
              ثبت رد
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => setRejecting(false)}
              className={`${btn} text-plum-700 hover:bg-blush-100`}
            >
              انصراف
            </button>
          </div>
        </div>
      )}

      {error && (
        <p role="alert" className="text-xs text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
