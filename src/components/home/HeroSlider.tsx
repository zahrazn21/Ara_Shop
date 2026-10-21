"use client";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSlider } from "@/hooks/use-slider";

const slides = [
  {
    id: 1,
    dir: "right",
    title: "زیبایی، یک سبک زندگی است.",
    text: "با بهترین محصولات آرایشی و مراقبتی همیشه درخشان باش!",
    img: "/images/hero/5.png",
    href: "/products",
  },
  {
    id: 2,
    dir: "right",
    title: "عطرهای اصل، با ماندگاری بالا",
    text: "انتخاب‌های برتر برای هر سلیقه",
    img: "/images/hero/4.png",
    href: "/category/perfume",
  },
  {
    id: 3,
    dir: "center",
    title: "پوست و مویی شاداب‌تر از همیشه",
    text: "مراقبت روزانه با برندهای معتبر",
    img: "/images/hero/3.png",
    href: "/category/skincare",
  },
];

export default function HeroSlider() {
  const { index, next, prev, goTo, pause, resume } = useSlider(slides.length);
  return (
    <section
      className="relative h-72 overflow-hidden bg-blush-200 md:h-104"
      onMouseEnter={pause}
      onMouseLeave={resume}
      aria-roledescription="carousel"
    >
      {slides.map((s, i) => (
        <div
          key={s.id}
          className={`absolute inset-0 transition-opacity duration-700 ${i === index ? "opacity-100" : "pointer-events-none opacity-0"}`}
          aria-hidden={i !== index}
        >
          <Image
            src={s.img}
            alt=""
            fill
            priority={i === 0}
            sizes="100vw"
            className="object-cover"
          />

          <div
            className={`relative mx-auto flex h-full max-w-7xl items-center px-10 ${
              s.dir === "center"
                ? "justify-center text-center"
                : "justify-start text-right"
            }`}
          >
            <div className="max-w-md">
              <h1 className="text-3xl font-bold leading-snug text-plum-900 md:text-5xl">
                {s.title}
              </h1>

              <p className="mt-4 text-plum-700">{s.text}</p>

              <Link
                href={s.href}
                className="mt-6 inline-block rounded-full bg-plum-700 px-6 py-2.5 text-sm text-white hover:bg-plum-900"
              >
                مشاهده محصولات
              </Link>
            </div>
          </div>
        </div>
      ))}
      <button
        onClick={next}
        aria-label="قبلی"
        className="absolute top-1/2 right-4 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-white/70"
      >
        <ChevronRight size={18} />
      </button>
      <button
        onClick={prev}
        aria-label="بعدی"
        className="absolute top-1/2 left-4 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-white/70"
      >
        <ChevronLeft size={18} />
      </button>
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {slides.map((s, i) => (
          <button
            key={s.id}
            onClick={() => goTo(i)}
            aria-label={`اسلاید ${i + 1}`}
            className={`size-2 rounded-full ${i === index ? "bg-white" : "bg-white/50"}`}
          />
        ))}
      </div>
    </section>
  );
}
