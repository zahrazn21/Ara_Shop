import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Headphones, ShieldCheck, Truck, Lock, Leaf } from "lucide-react";

const features = [
  { icon: ShieldCheck, title: "ضمانت اصالت کالا", text: "همه محصولات اورجینال هستند" },
  { icon: Truck, title: "ارسال سریع", text: "در کمترین زمان ممکن" },
  { icon: Headphones, title: "پشتیبانی ۲۴ ساعته", text: "پاسخگوی سوالات شما هستیم" },
  { icon: Lock, title: "پرداخت امن", text: "با درگاه‌های معتبر" },
];

export default function AboutSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <div className="grid items-center gap-8 lg:grid-cols-[1fr_1.4fr_1.2fr]">
        <ul className="space-y-5 lg:border-l lg:border-blush-200 lg:pl-8">
          {features.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex items-center gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-blush-200 text-plum-700">
                <Icon size={20} />
              </span>
              <div>
                <h3 className="text-sm font-bold text-plum-900">{title}</h3>
                <p className="text-xs text-plum-600">{text}</p>
              </div>
            </li>
          ))}
        </ul>

        <div>
          <p className="flex items-center gap-2 font-brand text-3xl text-plum-700">
            <Leaf size={22} /> Arghavan Shop
          </p>
          <h2 className="mt-2 text-lg font-bold text-plum-900">دنیایی از زیبایی، برای تو</h2>
          <p className="mt-4 text-sm leading-8 text-ink/80">
            ما در ارغوان شاپ با عشق به زیبایی و مراقبت از خودت، بهترین برندهای آرایشی و بهداشتی را از سراسر دنیا برای شما فراهم کرده‌ایم. کیفیت، اصالت و رضایت شما، مهم‌ترین ارزش‌های ما هستند.
          </p>
          <Link href="/about" className="mt-5 inline-flex items-center gap-2 rounded-full bg-plum-700 px-6 py-2.5 text-sm text-white hover:bg-plum-900">
            <ArrowLeft size={14} /> درباره ما بیشتر بدانید
          </Link>
        </div>

        <div className="relative aspect-4/3 overflow-hidden rounded-xl bg-blush-200">
          <Image src="/images/about.jpg" alt="محصولات ارغوان شاپ" fill sizes="(min-width:1024px) 40vw, 100vw" className="object-cover" />
        </div>
      </div>
    </section>
  );
}
