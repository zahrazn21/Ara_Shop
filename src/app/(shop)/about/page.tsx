import type { Metadata } from "next";
import {
  Clock,
  Mail,
  MailBadge,
  MapPin,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import { contact } from "@/lib/contact";
import Image from "next/image";

export const metadata: Metadata = {
  title: "درباره ما و راه‌های ارتباطی | ارغوان شاپ",
  description:
    "با ارغوان شاپ بیشتر آشنا شوید و از راه‌های ارتباطی با ما مطلع شوید.",
};

const values = [
  {
    icon: ShieldCheck,
    title: "اصالت کالا",
    text: "همه‌ی محصولات را از منابع معتبر تهیه می‌کنیم.",
  },
  {
    icon: Sparkles,
    title: "انتخاب آگاهانه",
    text: "با توضیحات روشن و تنوع‌های واضح، انتخاب برایتان ساده می‌شود.",
  },
  {
    icon: Truck,
    title: "ارسال سریع",
    text: "سفارش‌ها با بسته‌بندی مطمئن و در کوتاه‌ترین زمان ارسال می‌شوند.",
  },
];

const items = [
  { icon: Phone, label: "تلفن", value: contact.phone, href: contact.phoneHref },
  {
    icon: Phone,
    label: "موبایل",
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
  { icon: MapPin, label: "آدرس", value: contact.address },
  { icon: Clock, label: "ساعت پاسخگویی", value: contact.hours },
];

const cardCls = "rounded-2xl border border-blush-200 bg-white p-5";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold text-plum-900">درباره‌ی ارغوان شاپ</h1>
      <p className="mt-4 max-w-3xl leading-8 text-plum-600">
        ارغوان با هدف ارائه محصولات متنوع در زمینه مراقبت از پوست مو بهداشت و
        زیبایی شکل گرفته است . ما باور داریم انتخاب یک محصول مناسب قبل از هر چیز
        به شناخت نیازهای هر فرد و داشتن اطلاعات درست درباره محصول بستگی دارد ؛
        به همین دلیل تلاش می‌کنیم در کنار محصولات مشاوره و راهنمایی برای انتخاب
        آگاهانه تر رو در اختیار شما قرار بدیم . ✨ برای ما اعتماد و رضایت شما
        دارای اهمیت زیادی بوده و دوست داریم تجربه خرید از ارغوان فقط به ثبت یک
        سفارش محدود نشود بلکه شروع یک انتخاب مطمئن و یک همراهی خوب باشد🌷 همراه
        شما خواهیم بود برای انتخاب بهتر در مسیر مراقبت از خود و پررنگ کردن
        زیبایی های شما🤍
      </p>

      {/* <ul className="mt-8 grid gap-4 sm:grid-cols-3">
        {values.map(({ icon: Icon, title, text }) => (
          <li key={title} className={cardCls}>
            <Icon className="size-6 text-gold" aria-hidden />
            <h2 className="mt-3 font-bold text-plum-900">{title}</h2>
            <p className="mt-1 text-sm leading-7 text-plum-600">{text}</p>
          </li>
        ))}
      </ul> */}

      <section id="contact" className="mt-12 scroll-mt-24">
        <h2 className="text-xl font-bold text-plum-900">راه‌های ارتباطی</h2>
        <p className="mt-2 text-sm text-plum-600">
          برای سؤال، پیگیری سفارش یا پیشنهاد، از هر راهی که راحت‌ترید با ما در
          تماس باشید.
        </p>

        <ul className="mt-5 grid gap-4 sm:grid-cols-2">
          {items.map(({ icon: Icon, label, value, href, ltr }) => (
            <li key={label} className={`${cardCls} flex items-start gap-3`}>
              <Icon
                className="mt-0.5 size-5 shrink-0 text-plum-700"
                aria-hidden
              />
              <div>
                <p className="text-xs text-plum-600">{label}</p>
                {href ? (
                  <a
                    href={href}
                    dir={ltr ? "ltr" : undefined}
                    className="font-bold text-plum-900 hover:text-plum-700"
                  >
                    {value}
                  </a>
                ) : (
                  <p className="font-bold text-plum-900">{value}</p>
                )}
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={`https://instagram.com/${contact.instagram}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-blush-200 bg-white px-5 py-2.5 text-sm font-bold text-plum-900 hover:border-plum-700"
          >
            <span
              role="img"
              aria-label="اینستاگرام"
              className="inline-block size-6 bg-plum-900"
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
            اینستاگرام
          </a>
          <a
            href={`https://t.me/${contact.telegram}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-blush-200 bg-white px-5 py-2.5 text-sm font-bold text-plum-900 hover:border-plum-700"
          >
            <Send className="size-4" aria-hidden /> تلگرام
          </a>
          <a
            href={`https://t.me/${contact.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-blush-200 bg-white px-5 py-2.5 text-sm font-bold text-plum-900 hover:border-plum-700"
          >
            <span
              role="img"
              aria-label="واتساپ"
              className="inline-block size-6 bg-plum-900"
              style={{
                maskImage: "url(/whatsapp.svg)",
                maskSize: "contain",
                maskRepeat: "no-repeat",
                maskPosition: "center",
                WebkitMaskImage: "url(/whatsapp.svg)",
                WebkitMaskSize: "contain",
                WebkitMaskRepeat: "no-repeat",
                WebkitMaskPosition: "center",
              }}
            />
            واتساپ
          </a>
        </div>
      </section>
    </div>
  );
}
