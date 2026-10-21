
import type { Metadata } from "next";
import Image from "next/image";
import {
  Clock,
  Mail,
  MapPin,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
  Truck,
  ArrowLeft,
  Heart,
} from "lucide-react";
import { contact } from "@/lib/contact";

export const metadata: Metadata = {
  title: "درباره ما و راه‌های ارتباطی | ارغوان شاپ",
  description:
    "با ارغوان شاپ آشنا شوید؛ همراه شما برای انتخاب محصولات مراقبت از پوست، مو و زیبایی.",
};

const values = [
  {
    icon: ShieldCheck,
    title: "اصالت کالا",
    text: "تلاش می‌کنیم محصولات را از منابع معتبر تهیه کنیم تا با اطمینان بیشتری انتخاب کنید.",
  },
  {
    icon: Sparkles,
    title: "انتخاب آگاهانه",
    text: "با ارائه اطلاعات روشن درباره محصولات، مسیر انتخاب را برای شما ساده‌تر می‌کنیم.",
  },
  {
    icon: Truck,
    title: "ارسال مطمئن",
    text: "سفارش‌های شما با دقت و بسته‌بندی مناسب برای ارسال آماده می‌شوند.",
  },
];

const cardClass =
  "rounded-3xl border border-blush-200 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-plum-900/10";

export default function AboutPage() {
  const contacts = [
    {
      icon: Phone,
      label: "تلفن ثابت",
      value: contact.phone,
      href: contact.phoneHref,
    },
    {
      icon: Phone,
      label: "شماره موبایل",
      value: contact.mobile,
      href: contact.mobileHref,
    },
    {
      icon: Mail,
      label: "ایمیل",
      value: contact.email,
      href: `mailto:${contact.email}`,
      ltr: true,
    },
    {
      icon: MapPin,
      label: "آدرس",
      value: contact.address,
    },
    {
      icon: Clock,
      label: "ساعات پاسخ‌گویی",
      value: contact.hours,
    },
  ];

  const socials = [
    {
      label: "اینستاگرام",
      href: `https://instagram.com/${contact.instagram}`,
      icon: "instagram",
    },
    {
      label: "تلگرام",
      href: `https://t.me/${contact.telegram}`,
      icon: "telegram",
    },
    {
      label: "واتساپ",
      href: `https://wa.me/${String(contact.whatsapp).replace(/\D/g, "")}`,
      icon: "whatsapp",
    },
  ];

  return (
    <main dir="rtl" className="overflow-hidden bg-paper text-ink">

      <section className="relative isolate">
        <div className="absolute inset-0 -z-10 bg-linear-to-bl from-blush-100 via-paper to-white" />
        <div className="absolute -right-24 -top-24 -z-10 size-80 rounded-full bg-blush-200/50 blur-3xl" />
        <div className="absolute -bottom-20 left-0 -z-10 size-72 rounded-full bg-gold/10 blur-3xl" />

        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 sm:px-8 md:py-20 lg:grid-cols-2 lg:gap-16">
          <div className="order-2 lg:order-1">
            <span className="inline-flex items-center gap-2 rounded-full border border-blush-200 bg-white/80 px-4 py-2 text-sm font-medium text-plum-700 shadow-sm">
              <Heart size={16} className="text-gold" />
              قصه‌ی ارغوان شاپ
            </span>

            <h1 className="mt-6 text-3xl font-black leading-[1.8] tracking-tight text-plum-900 sm:text-4xl lg:text-5xl">
              زیبایی از یک
              <span className="block text-plum-700">
                انتخاب آگاهانه
              </span>
              شروع می‌شود.
            </h1>

            <p className="mt-5 max-w-xl text-sm leading-9 text-ink sm:text-base">
              ارغوان با هدف ارائه محصولات متنوع در زمینه مراقبت از پوست،
              مو، بهداشت و زیبایی شکل گرفته است. ما باور داریم انتخاب
              یک محصول مناسب، پیش از هر چیز به شناخت نیازهای هر فرد
              و دسترسی به اطلاعات درست بستگی دارد.
            </p>

            <p className="mt-3 max-w-xl text-sm leading-9 text-plum-600 sm:text-base">
              به همین دلیل تلاش می‌کنیم در کنار محصولات، اطلاعات و
              راهنمایی لازم را برای انتخابی آگاهانه در اختیار شما
              قرار دهیم. اعتماد و رضایت شما برای ما ارزشمند است و
              دوست داریم تجربه خرید از ارغوان، شروع یک همراهی خوب باشد.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="#contact"
                className="inline-flex items-center gap-2 rounded-full bg-plum-700 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-plum-900/15 transition hover:bg-plum-900"
              >
                ارتباط با ما
                <ArrowLeft size={17} />
              </a>

              <span className="text-sm text-plum-600">
                همراه شما در مسیر مراقبت از خود
                <span className="mr-1 text-gold">✦</span>
              </span>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <div className="relative mx-auto max-w-lg">
              <div className="absolute -inset-4 rounded-[2.5rem] bg-blush-200/60 blur-xl" />

              <div className="relative aspect-[4/4.2] overflow-hidden rounded-4xl border-[6px] border-white shadow-2xl shadow-plum-900/10">
                <Image
                  src="/images/about-beauty.jpg"
                  alt="محصولات مراقبت از پوست و زیبایی"
                  fill
                  priority
                  sizes="(max-width: 1024px) 90vw, 45vw"
                  className="object-cover"
                />
              </div>

              <div className="absolute -bottom-5 right-3 max-w-61.25 rounded-2xl border border-blush-200 bg-white/95 p-4 shadow-lg sm:right-0">
                <div className="flex items-center gap-3">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-blush-100 text-plum-700">
                    <Heart size={21} />
                  </div>
                  <div>
                    <p className="font-bold text-plum-900">
                      با عشق برای شما
                    </p>
                    <p className="mt-1 text-xs leading-6 text-plum-600">
                      انتخاب بهتر، زیبایی بیشتر
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-8 md:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-bold text-plum-700">
            تفاوت ارغوان
          </span>

          <h2 className="mt-3 text-2xl font-black text-plum-900 sm:text-3xl">
            چرا ارغوان شاپ؟
          </h2>

          <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-gold" />

          <p className="mt-4 text-sm leading-8 text-plum-600">
            سه اصل مهم که در مسیر همراهی با شما به آن‌ها توجه می‌کنیم.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {values.map(({ icon: Icon, title, text }) => (
            <article
              key={title}
              className={`${cardClass} group text-right`}
            >
              <div className="flex size-14 items-center justify-center rounded-2xl bg-blush-100 text-plum-700 transition-colors group-hover:bg-blush-200">
                <Icon size={27} strokeWidth={1.7} />
              </div>

              <h3 className="mt-5 text-lg font-extrabold text-plum-900">
                {title}
              </h3>

              <p className="mt-3 text-sm leading-8 text-plum-600">
                {text}
              </p>

              <div className="mt-5 h-px w-full bg-blush-100" />

              <Heart
                size={17}
                className="mt-4 text-gold"
                aria-hidden="true"
              />
            </article>
          ))}
        </div>
      </section>

      <section
        id="contact"
        className="scroll-mt-24 border-t border-blush-200 bg-linear-to-b from-blush-100/70 to-paper py-16 md:py-20"
      >
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div>
            <span className="text-sm font-bold text-plum-700">
              همیشه در کنار شما
            </span>

            <h2 className="mt-3 text-2xl font-black text-plum-900 sm:text-3xl">
              راه‌های ارتباطی
            </h2>

            <div className="mt-4 h-1 w-16 rounded-full bg-gold" />

            <p className="mt-5 text-sm leading-9 text-plum-600">
              برای پرسش درباره محصولات، پیگیری سفارش یا ارسال پیشنهاد،
              از هر راهی که برایتان راحت‌تر است با ما در ارتباط باشید.
              خوشحال می‌شویم صدای شما را بشنویم.
            </p>

            <div className="relative mt-8 overflow-hidden rounded-4xl border border-blush-200 bg-white p-7 shadow-sm sm:p-9">
              <div className="absolute -left-10 -top-10 size-36 rounded-full bg-blush-100 blur-2xl" />

              <div className="relative">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-blush-100 text-plum-700">
                  <Sparkles size={25} />
                </div>

                <h3 className="mt-5 text-xl font-extrabold text-plum-900">
                  همراه شما برای انتخاب بهتر
                </h3>

                <p className="mt-3 text-sm leading-8 text-plum-600">
                  هر انتخاب خوب، با شناخت نیازهای شما آغاز می‌شود.
                  برای دریافت راهنمایی بیشتر با ما در ارتباط باشید.
                </p>

                <div className="mt-6 flex items-center gap-2 text-sm font-bold text-plum-700">
                  با مهر، ارغوان شاپ
                  <Heart size={17} className="text-gold" />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-4xl border border-blush-200 bg-white p-4 shadow-xl shadow-plum-900/5 sm:p-7">
            <div className="space-y-1">
              {contacts.map(({ icon: Icon, label, value, href, ltr }) => (
                <div
                  key={label}
                  className="flex items-start gap-3 border-b border-blush-100 px-2 py-4 last:border-0 sm:gap-4"
                >
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blush-100 text-plum-700">
                    <Icon size={20} strokeWidth={1.8} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-plum-600">{label}</p>

                    {href ? (
                      <a
                        href={href}
                        dir={ltr ? "ltr" : undefined}
                        className={`mt-1 block wrap-break-word text-sm font-bold leading-7 text-plum-900 transition hover:text-plum-700 ${
                          ltr ? "text-left" : ""
                        }`}
                      >
                        {value}
                      </a>
                    ) : (
                      <p className="mt-1 wrap-break-word text-sm font-bold leading-7 text-plum-900">
                        {value}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 border-t border-blush-100 pt-5">
              <p className="mb-4 text-sm font-bold text-plum-900">
                ما را در شبکه‌های اجتماعی دنبال کنید
              </p>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {socials.map(({ label, href, icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-blush-200 bg-paper px-3 py-3 text-sm font-bold text-plum-900 transition hover:border-plum-700 hover:bg-blush-100"
                  >
                    {icon === "instagram" ? (
                      <span
                        aria-hidden="true"
                        className="size-5 bg-current"
                        style={{
                          maskImage: "url(/instagram.svg)",
                          maskSize: "contain",
                          maskRepeat: "no-repeat",
                          maskPosition: "center",
                          WebkitMaskImage: "url(/instagram.svg)",
                          WebkitMaskSize: "contain",
                          WebkitMaskRepeat: "no-repeat",
                          WebkitMaskPosition: "center",
                        }}
                      />
                    ) : icon === "telegram" ? (
                      <Send size={17} />
                    ) : (
                      <Phone size={17} />
                    )}
                    {label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      <footer className="border-t border-blush-200 bg-paper px-4 py-7 text-center">
        <p className="font-black text-plum-900">
          ارغوان شاپ
          <Heart className="mr-2 inline size-4 text-gold" />
        </p>

        <p className="mt-2 text-xs text-plum-600">
          انتخاب بهتر، زیبایی بیشتر
        </p>
      </footer>
    </main>
  );
}
