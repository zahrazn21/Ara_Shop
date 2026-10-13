"use client";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

export default function ReviewImages({ images }: { images: string[] }) {
  const [open, setOpen] = useState<number | null>(null);

  const close = useCallback(() => setOpen(null), []);
  const next = useCallback(
    (step: number) => setOpen((i) => (i === null ? i : (i + step + images.length) % images.length)),
    [images.length],
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") next(1);
      if (e.key === "ArrowRight") next(-1);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden"; 
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, close, next]);

  return (
    <>
      <ul className="mt-3 flex flex-wrap gap-2">
        {images.map((src, i) => (
          <li key={src}>
            <button
              type="button"
              onClick={() => setOpen(i)}
              aria-label={`نمایش تصویر ${i + 1}`}
              className="block cursor-zoom-in overflow-hidden rounded-lg"
            >
              <Image width={500} height={400} src={src} alt="" className="size-16 rounded-lg border border-blush-200 object-cover" />
            </button>
          </li>
        ))}
      </ul>

      {open !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="تصویر نظر"
          onClick={close}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
        >
          <button
            type="button"
            onClick={close}
            aria-label="بستن"
            className="absolute top-4 right-4 flex size-10 items-center justify-center rounded-full bg-white/90 text-xl text-plum-900"
          >
            ×
          </button>

          {images.length > 1 && (
            <>
              <button
                type="button"
                aria-label="تصویر بعدی"
                onClick={(e) => {
                  e.stopPropagation();
                  next(1);
                }}
                className="absolute left-4 flex size-10 items-center justify-center rounded-full bg-white/90 text-xl text-plum-900"
              >
                ‹
              </button>
              <button
                type="button"
                aria-label="تصویر قبلی"
                onClick={(e) => {
                  e.stopPropagation();
                  next(-1);
                }}
                className="absolute right-4 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl text-plum-900"
              >
                ›
              </button>
            </>
          )}

          <Image
            width={500}
            height={600}
            src={images[open]}
            alt=""
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] max-w-full rounded-lg object-contain"
          />
        </div>
      )}
    </>
  );
}
