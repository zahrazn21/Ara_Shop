"use server";
import { Prisma, type ProductStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { PRODUCT_STATUS_LABEL } from "@/lib/labels";
import { getCategoryOptions } from "@/lib/admin-queries";
import { deleteUploads, MAX_IMAGES, saveProductImages, UploadError } from "@/lib/upload";

export type EditState = { ok?: boolean; error?: string } | undefined;

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "");

const toInt = (raw: string) => {
  if (raw.trim() === "") return null;
  const n = Number(raw);
  return Number.isInteger(n) ? n : null;
};

function parseBasics(fd: FormData) {
  const name = str(fd, "name").trim();
  const slug = str(fd, "slug").trim().replace(/\s+/g, "-");
  const status = str(fd, "status") as ProductStatus;
  const price = toInt(str(fd, "price"));
  const originalRaw = str(fd, "originalPrice");
  const originalPrice = originalRaw.trim() === "" ? null : toInt(originalRaw);
  const stock = toInt(str(fd, "stock") || "0");

  if (!name) return { error: "نام محصول را وارد کنید." };
  if (!slug) return { error: "اسلاگ را وارد کنید." };
  if (!(status in PRODUCT_STATUS_LABEL)) return { error: "وضعیت نامعتبر است." };
  if (price === null || price < 0) return { error: "قیمت فروش معتبر نیست." };
  if (originalRaw.trim() !== "" && (originalPrice === null || originalPrice <= price))
    return { error: "قیمت قبل از تخفیف باید بیشتر از قیمت فروش باشد (یا خالی بماند)." };
  if (stock === null || stock < 0) return { error: "موجودی معتبر نیست." };

  return {
    data: {
      name,
      slug,
      status,
      price,
      originalPrice,
      stock,
      brand: str(fd, "brand").trim() || null,
      description: str(fd, "description").trim() || null,
      features: str(fd, "features")
        .split("\n")
        .map((f) => f.trim())
        .filter(Boolean),
    },
  };
}

function revalidateShop(...slugs: string[]) {
  revalidatePath("/admin/products");
  revalidatePath("/");
  revalidatePath("/products");
  slugs.forEach((s) => revalidatePath(`/products/${s}`));
}

export async function getProductForEdit(id: string) {
  await requireAdmin();
  const p = await prisma.product.findUnique({
    where: { id },
    select: {
      id: true, name: true, slug: true, price: true, originalPrice: true, brand: true,
      description: true, features: true, status: true, stock: true,
      categoryId: true, sku: true, images: true, specifications: true,
      variants: {
        orderBy: { createdAt: "asc" },
        select: { id: true, color: true, colorHex: true, image: true, size: true, number: true, sku: true, stock: true, priceDiff: true },
      },
    },
  });
  if (!p) return null;
  const categories = await getCategoryOptions();
  return {
    ...p,
    specifications: (p.specifications ?? null) as Record<string, string> | null,
    categories,
  };
}

export async function updateProduct(_: EditState, fd: FormData): Promise<EditState> {
  await requireAdmin();

  const parsed = parseBasics(fd);
  if ("error" in parsed) return { error: parsed.error };
  const { stock, ...basics } = parsed.data;

  const id = str(fd, "id");
  const current = await prisma.product.findUnique({
    where: { id },
    select: { slug: true, images: true, variants: { select: { id: true } } },
  });
  if (!current) return { error: "محصول پیدا نشد." };

  const categoryId = str(fd, "categoryId");
  if (!(await prisma.category.findUnique({ where: { id: categoryId }, select: { id: true } })))
    return { error: "یک دسته‌بندی انتخاب کنید." };

  const v = parseVariants(str(fd, "variants"), basics.price);
  if ("error" in v) return { error: v.error };

  const oldIds = current.variants.map((x) => x.id);
  const sentIds = v.variants.flatMap((x) => (x.id ? [x.id] : []));
  if (sentIds.some((x) => !oldIds.includes(x))) return { error: "اطلاعات تنوع‌ها معتبر نیست." };
  const removeIds = oldIds.filter((x) => !sentIds.includes(x));

  let keep: string[] = [];
  try {
    const raw = JSON.parse(str(fd, "keepImages") || "[]");
    if (Array.isArray(raw)) keep = raw.filter((x): x is string => typeof x === "string");
  } catch {
    return { error: "اطلاعات عکس‌ها معتبر نیست." };
  }
  if (keep.some((u) => !current.images.includes(u))) return { error: "اطلاعات عکس‌ها معتبر نیست." };

  const files = fd.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);
  if (keep.length + files.length === 0) return { error: "حداقل یک عکس لازم است." };
  if (keep.length + files.length > MAX_IMAGES) return { error: `حداکثر ${MAX_IMAGES} عکس مجاز است.` };

  let urls: string[] = [];
  try {
    urls = await saveProductImages(files);
  } catch (e) {
    return { error: e instanceof UploadError ? e.message : "ذخیره‌ی عکس‌ها انجام نشد." };
  }
  const images = [...keep, ...urls];
  const removedImages = current.images.filter((u) => !keep.includes(u));

  const specs = parseSpecs(str(fd, "specifications"));
  const hasVariants = v.variants.length > 0;
  const variantData = withImages(v.variants, images);

  try {
    await prisma.product.update({
      where: { id },
      data: {
        ...basics,
        categoryId,
        sku: str(fd, "sku").trim() || null,
        image: images[0],
        images,
        stock: hasVariants ? 0 : stock,
        specifications: specs ?? Prisma.DbNull,
        variants: {
          ...(removeIds.length && { deleteMany: { id: { in: removeIds } } }),
          update: variantData
            .filter((x) => x.id)
            .map(({ id: vid, ...data }) => ({ where: { id: vid! }, data })),
          create: variantData.filter((x) => !x.id).map(({ id: _id, ...data }) => data),
        },
      },
    });
  } catch (e) {
    await deleteUploads(urls);
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002") return { error: "اسلاگ یا کد SKU تکراری است." };
      if (e.code === "P2003") return { error: "تنوعی که در سفارش یا سبد استفاده شده قابل حذف نیست." };
    }
    return { error: "ذخیره انجام نشد. دوباره تلاش کنید." };
  }

  await deleteUploads(removedImages);
  revalidateShop(current.slug, basics.slug);
  return { ok: true };
}

type VariantInput = {
  id: string | null;
  color: string | null; colorHex: string | null; size: string | null; number: string | null;
  sku: string | null; stock: number; priceDiff: number;
  imageIndex: number | null;
};

function withImages(variants: VariantInput[], images: string[]) {
  return variants.map(({ imageIndex, ...rest }) => ({
    ...rest,
    image: imageIndex !== null ? (images[imageIndex] ?? null) : null,
  }));
}

function parseVariants(raw: string, basePrice: number): { error: string } | { variants: VariantInput[] } {
  let list: unknown;
  try {
    list = JSON.parse(raw || "[]");
  } catch {
    return { error: "اطلاعات تنوع‌ها معتبر نیست." };
  }
  if (!Array.isArray(list)) return { error: "اطلاعات تنوع‌ها معتبر نیست." };
  if (list.length > 50) return { error: "حداکثر ۵۰ تنوع مجاز است." };

  const out: VariantInput[] = [];
  const seen = new Set<string>();
  const skus = new Set<string>();

  for (const [i, v] of list.entries()) {
    const n = i + 1;
    const clean = (x: unknown) => (typeof x === "string" && x.trim() ? x.trim() : null);
    const colorHex = clean(v?.colorHex);
    const color = clean(v?.color), size = clean(v?.size), number = clean(v?.number), sku = clean(v?.sku);
    const stock = toInt(String(v?.stock ?? "0"));
    const priceDiff = toInt(String(v?.priceDiff ?? "0") || "0");

    if (!color && !size && !number) return { error: `تنوع ${n}: حداقل یکی از رنگ، سایز یا شماره را پر کنید.` };
    if (stock === null || stock < 0) return { error: `تنوع ${n}: موجودی معتبر نیست.` };
    if (priceDiff === null) return { error: `تنوع ${n}: اختلاف قیمت معتبر نیست.` };
    if (basePrice + priceDiff < 0) return { error: `تنوع ${n}: قیمت نهایی نمی‌تواند منفی باشد.` };

    const key = [color, size, number].join("|");
    if (seen.has(key)) return { error: `تنوع ${n}: ترکیب رنگ/سایز/شماره تکراری است.` };
    seen.add(key);
    if (sku) {
      if (skus.has(sku)) return { error: `تنوع ${n}: کد SKU تکراری است.` };
      skus.add(sku);
    }
    const imageIndex = Number.isInteger(v?.imageIndex) && v.imageIndex >= 0 ? (v.imageIndex as number) : null;
    out.push({ id: clean(v?.id), color, colorHex, size, number, sku, stock, priceDiff, imageIndex });
  }
  return { variants: out };
}

function parseSpecs(raw: string): Record<string, string> | null {
  try {
    const rows = JSON.parse(raw || "[]");
    if (!Array.isArray(rows)) return null;
    const obj: Record<string, string> = {};
    for (const r of rows) {
      const k = typeof r?.key === "string" ? r.key.trim() : "";
      const v = typeof r?.value === "string" ? r.value.trim() : "";
      if (k && v) obj[k] = v;
    }
    return Object.keys(obj).length ? obj : null;
  } catch {
    return null;
  }
}

export async function createProduct(_: EditState, fd: FormData): Promise<EditState> {
  await requireAdmin();

  const parsed = parseBasics(fd);
  if ("error" in parsed) return { error: parsed.error };
  const { stock, ...basics } = parsed.data;

  const categoryId = str(fd, "categoryId");
  if (!(await prisma.category.findUnique({ where: { id: categoryId }, select: { id: true } })))
    return { error: "یک دسته‌بندی انتخاب کنید." };

  const v = parseVariants(str(fd, "variants"), basics.price);
  if ("error" in v) return { error: v.error };

  const files = fd.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) return { error: "حداقل یک عکس انتخاب کنید." };

  if (await prisma.product.findUnique({ where: { slug: basics.slug }, select: { id: true } }))
    return { error: "این اسلاگ قبلاً برای محصول دیگری استفاده شده است." };

  let urls: string[] = [];
  try {
    urls = await saveProductImages(files);
  } catch (e) {
    return { error: e instanceof UploadError ? e.message : "ذخیره‌ی عکس‌ها انجام نشد." };
  }

  const specs = parseSpecs(str(fd, "specifications"));

  try {
    await prisma.product.create({
      data: {
        ...basics,
        categoryId,
        sku: str(fd, "sku").trim() || null,
        image: urls[0],
        images: urls,
        stock: v.variants.length ? 0 : stock,
        ...(specs && { specifications: specs }),
        ...(v.variants.length && {
          variants: { create: withImages(v.variants, urls).map(({ id: _id, ...data }) => data) },
        }),
      },
    });
  } catch (e) {
    await deleteUploads(urls);
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002")
      return { error: "اسلاگ یا کد SKU یکی از تنوع‌ها تکراری است." };
    return { error: "ذخیره انجام نشد. دوباره تلاش کنید." };
  }

  revalidateShop();
  redirect("/admin/products");
}