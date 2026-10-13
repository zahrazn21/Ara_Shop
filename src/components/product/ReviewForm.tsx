"use client";
import Image from "next/image";
import Link from "next/link";
import { startTransition, useActionState, useEffect, useMemo, useRef, useState } from "react";
import { Star, X } from "lucide-react";
import {
  getMyReviewState,
  submitReview,
  type MyReviewState,
  type ReviewFormState,
} from "@/app/actions/user-reviews";
import { toman } from "@/lib/format";

const MAX_IMAGES = 3;
const MAX_BYTES = 3 * 1024 * 1024;
const MAX_COMMENT = 1500;
const ACCEPT = ["image/jpeg", "image/png", "image/webp"];

const box = "rounded-xl border border-blush-200 bg-white px-5 py-4 text-sm";

export default function ReviewForm({ productId }: { productId: string }) {
  const [me, setMe] = useState<MyReviewState | null>(null);
  const [state, formAction, pending] = useActionState<ReviewFormState, FormData>(submitReview, undefined);

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    getMyReviewState(productId)
      .then((r) => !cancelled && setMe(r))
      .catch(() => !cancelled && setMe({ loggedIn: false, status: null }));
    return () => {
      cancelled = true;
    };
  }, [productId]);

  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  useEffect(() => () => previews.forEach(URL.revokeObjectURL), [previews]);

  const syncInput = (list: File[]) => {
    const dt = new DataTransfer();
    list.forEach((f) => dt.items.add(f));
    if (input.current) input.current.files = dt.files;
  };

  const addFiles = (picked: FileList | null) => {
    const incoming = Array.from(picked ?? []);
    const valid = incoming.filter((f) => ACCEPT.includes(f.type) && f.size <= MAX_BYTES);
    if (incoming.some((f) => f.size > MAX_BYTES)) setFileError("حجم هر عکس باید کمتر از ۳ مگابایت باشد.");
    else if (valid.length < incoming.length) setFileError("فقط عکس‌های JPG، PNG و WebP مجاز است.");
    else setFileError(null);
    const next = [...files, ...valid].slice(0, MAX_IMAGES);
    setFiles(next);
    syncInput(next);
  };

  const removeFile = (i: number) => {
    const next = files.filter((_, j) => j !== i);
    setFiles(next);
    syncInput(next);
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(() => formAction(fd));
  };

  if (!me) return <div aria-hidden className="h-24 animate-pulse rounded-xl bg-blush-100/60" />;

  if (!me.loggedIn)
    return (
      <p className={box}>
        برای ثبت نظر ابتدا{" "}
        <Link href="/login" className="font-bold text-plum-700 hover:underline">
          وارد حساب کاربری
        </Link>{" "}
        شوید.
      </p>
    );

  if (state?.ok)
    return (
      <p role="status" className={`${box} bg-green-50 text-green-800`}>
        نظر شما ثبت شد و بعد از تأیید مدیر نمایش داده می‌شود. ممنون از شما!
      </p>
    );

  if (me.status === "PENDING")
    return <p className={`${box} text-plum-700`}>نظر شما برای این محصول ثبت شده و در انتظار تأیید است.</p>;

  if (me.status === "APPROVED") return <p className={`${box} text-plum-700`}>شما قبلاً برای این محصول نظر ثبت کرده‌اید.</p>;

  const shown = hover || rating;

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-blush-200 bg-white p-5">
      <h3 className="text-sm font-bold text-plum-900">دیدگاه خود را بنویسید</h3>
      <input type="hidden" name="productId" value={productId} />

      <fieldset>
        <legend className="mb-2 text-sm text-plum-900">امتیاز شما</legend>
        <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <label
              key={n}
              onMouseEnter={() => setHover(n)}
              className="cursor-pointer rounded p-0.5 focus-within:ring-2 focus-within:ring-plum-700"
            >
              <input
                type="radio"
                name="rating"
                value={n}
                required
                checked={rating === n}
                onChange={() => setRating(n)}
                className="sr-only"
              />
              <Star
                size={28}
                fill={n <= shown ? "currentColor" : "none"}
                className={n <= shown ? "text-gold" : "text-blush-300"}
              />
              <span className="sr-only">{toman(n)} ستاره</span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="block text-sm">
        <span className="mb-1 block text-plum-900">متن نظر</span>
        <textarea
          name="comment"
          required
          minLength={10}
          maxLength={MAX_COMMENT}
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="تجربه‌ی خود از استفاده از این محصول را بنویسید"
          className="w-full rounded-lg border border-blush-300 bg-white px-3 py-2 text-sm"
        />
        <span className="mt-1 block text-left text-xs text-plum-600" dir="ltr">
          {comment.length} / {MAX_COMMENT}
        </span>
      </label>

      <div className="space-y-2">
        <p className="text-sm text-plum-900">عکس (اختیاری)</p>
        <p className="text-xs text-plum-600">حداکثر {toman(MAX_IMAGES)} عکس JPG، PNG یا WebP تا ۳ مگابایت.</p>
        <input
          ref={input}
          name="images"
          type="file"
          accept={ACCEPT.join(",")}
          multiple
          disabled={files.length >= MAX_IMAGES}
          onChange={(e) => addFiles(e.target.files)}
          className="block text-sm file:ml-3 file:rounded-lg file:border-0 file:bg-blush-100 file:px-4 file:py-2 file:text-plum-700"
        />
        {fileError && <p className="text-xs text-red-700">{fileError}</p>}
        {previews.length > 0 && (
          <ul className="flex flex-wrap gap-3 pt-1">
            {previews.map((src, i) => (
              <li key={src} className="relative">
                <Image
                  src={src}
                  alt=""
                  width={64}
                  height={64}
                  unoptimized
                  className="size-16 rounded-lg border border-blush-200 object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  aria-label="حذف عکس"
                  className="absolute -left-2 -top-2 grid size-5 place-items-center rounded-full bg-white shadow ring-1 ring-blush-300"
                >
                  <X size={12} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {state?.error && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <button
        disabled={pending}
        className="rounded-lg bg-plum-700 px-6 py-2.5 text-sm text-white hover:bg-plum-900 disabled:opacity-60"
      >
        {pending ? "در حال ارسال…" : "ثبت نظر"}
      </button>
    </form>
  );
}
