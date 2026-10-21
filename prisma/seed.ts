/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  { name: "آرایش", slug: "makeup", image: "/images/categories/makeup.jpg" },
  {
    name: "مراقبت بدن",
    slug: "skincare",
    image: "/images/categories/skincare.jpg",
  },
  { name: "عطر", slug: "perfume", image: "/images/categories/perfume.jpg" },
  { name: "مو", slug: "hair", image: "/images/categories/hair.jpg" },
  {
    name: "اکسسوری",
    slug: "accessories",
    image: "/images/categories/accessories.jpg",
  },
  {
    name: "لوازم آرایشی برقی",
    slug: "electric",
    image: "/images/categories/electric.jpg",
  },
  {
    name: "محصولات برند",
    slug: "brands",
    image: "/images/categories/brands.jpg",
  },
];

type Seed = {
  name: string;
  slug: string;
  category: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviewCount: number;
  stock?: number;
  variants?: { color: string; stock: number }[];
};

const products: Seed[] = [
  {
    name: "عطر زنانه میس دیور",
    slug: "miss-dior-edp",
    category: "perfume",
    brand: "Dior",
    price: 2350000,
    originalPrice: 2680000,
    image: "/images/products/miss-dior.jpg",
    rating: 4.8,
    reviewCount: 124,
    stock: 15,
  },
  {
    name: "کرم پودر فیت می میبلین",
    slug: "maybelline-fit-me",
    category: "makeup",
    brand: "Maybelline",
    price: 890000,
    image: "/images/products/fit-me.jpg",
    rating: 4.6,
    reviewCount: 96,
    stock: 40,
  },
  {
    name: "سرم هیالورونیک اسید دوردینری",
    slug: "the-ordinary-ha",
    category: "skincare",
    brand: "The Ordinary",
    price: 1370000,
    originalPrice: 1500000,
    image: "/images/products/ordinary-ha.jpg",
    rating: 4.7,
    reviewCount: 177,
    stock: 30,
  },
  {
    name: "رژ لب دیور Addict",
    slug: "dior-addict-lip",
    category: "makeup",
    brand: "Dior",
    price: 1890000,
    image: "/images/products/dior-addict.jpg",
    rating: 4.8,
    reviewCount: 87,
    variants: [
      { color: "رز", stock: 8 },
      { color: "قرمز", stock: 5 },
      { color: "نود", stock: 10 },
    ],
  },
  {
    name: "مرطوب کننده کلینیک Moisture Surge",
    slug: "clinique-moisture-surge",
    category: "skincare",
    brand: "Clinique",
    price: 1290000,
    originalPrice: 1450000,
    image: "/images/products/clinique.jpg",
    rating: 4.7,
    reviewCount: 92,
    stock: 22,
  },
  {
    name: "پالت سایه هدی بیوتی Obsessions",
    slug: "huda-obsessions",
    category: "makeup",
    brand: "Huda Beauty",
    price: 1920000,
    image: "/images/products/huda-palette.jpg",
    rating: 4.9,
    reviewCount: 145,
    stock: 12,
  },
  {
    name: "ماسک صورت ورقه‌ای",
    slug: "sheet-mask",
    category: "skincare",
    brand: "Generic",
    price: 190000,
    image: "/images/products/sheet-mask.jpg",
    rating: 4.3,
    reviewCount: 30,
    stock: 100,
  },
  {
    name: "رژگونه مایع Rare Beauty",
    slug: "rare-beauty-blush",
    category: "makeup",
    brand: "Rare Beauty",
    price: 1680000,
    image: "/images/products/rare-beauty.jpg",
    rating: 4.8,
    reviewCount: 110,
    stock: 14,
  },
  {
    name: "شامپو مو لورال",
    slug: "loreal-shampoo",
    category: "hair",
    brand: "L'Oréal",
    price: 1080000,
    image: "/images/products/loreal-shampoo.jpg",
    rating: 4.4,
    reviewCount: 45,
    stock: 35,
  },
];

async function main() {
  const catId: Record<string, string> = {};
  for (const c of categories) {
    const row = await prisma.category.upsert({
      where: { slug: c.slug },
      update: c,
      create: c,
    });
    catId[c.slug] = row.id;
  }

  for (const p of products) {
    const { category, variants, ...data } = p;
    const row = await prisma.product.upsert({
      where: { slug: p.slug },
      update: { ...data, categoryId: catId[category] },
      create: { ...data, categoryId: catId[category], status: "ACTIVE" },
    });

    for (const v of variants ?? []) {
      const exists = await prisma.productVariant.findFirst({
        where: { productId: row.id, color: v.color, size: null, number: null },
      });
      if (exists) {
        await prisma.productVariant.update({
          where: { id: exists.id },
          data: { stock: v.stock },
        });
      } else {
        await prisma.productVariant.create({
          data: { productId: row.id, color: v.color, stock: v.stock },
        });
      }
    }
  }
  console.log(`✔ ${categories.length} دسته و ${products.length} محصول ثبت شد`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
