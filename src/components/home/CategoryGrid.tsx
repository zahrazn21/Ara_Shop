import Image from "next/image";
import Link from "next/link";

type Cat = { id: string; name: string; slug: string; image: string | null };

export default function CategoryGrid({ categories }: { categories: Cat[] }) {
  return (
    <section>
      <h2 className="mb-5 text-lg font-bold text-plum-900">دسته‌بندی محصولات</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
        {categories.map((c) => (
          <Link key={c.id} href={`/category/${c.slug}`} className="overflow-hidden rounded-lg border border-blush-200 bg-white text-center text-xs">
            <div className="relative aspect-square bg-blush-100">
              {c.image && <Image src={c.image} alt="" fill sizes="150px" className="object-cover" />}
            </div>
            <p className="py-2.5">{c.name}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
