"use client";
import { useState } from "react";
import Image from "next/image";

export default function ProductGallery({
  images,
  name,
  selectedImage,
  selectionKey,
}: {
  images: string[];
  name: string;
  selectedImage?: string | null;
  selectionKey?: number;
}) {
  const [active, setActive] = useState(0);
  const [prevKey, setPrevKey] = useState(selectionKey);
  if (selectionKey !== prevKey) {
    setPrevKey(selectionKey);
    const i = selectedImage ? images.indexOf(selectedImage) : -1;
    if (i >= 0) setActive(i);
  }

  return (
    <div>
      <div className="relative mx-auto aspect-square w-full max-w-md max-h-fit  overflow-hidden rounded-xl border border-blush-200 bg-white ">
        <Image
          src={images[active]}
          alt={name}
          fill
          priority
          sizes="(min-width: 1024px) 448px, 100vw"
          className="object-contain"
        />
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex justify-center gap-2">
          {images.map((src, i) => (
            <button
              key={src}
              onClick={() => setActive(i)}
              aria-label={`تصویر ${i + 1}`}
              aria-current={i === active}
              className={`relative size-16 overflow-hidden rounded-lg border bg-white ${
                i === active ? "border-plum-700" : "border-blush-200"
              }`}
            >
              <Image src={src} alt="" fill sizes="64px" className="object-contain" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}