"use server";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { deleteUploads, saveCategoryImage, UploadError } from "@/lib/upload";

export type CategoryState = { ok?: boolean; error?: string } | undefined;

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();

function parseBasics(fd: FormData) {
  const name = str(fd, "name").replace(/\s+/g, " ");
  const slug = str(fd, "slug").toLowerCase().replace(/\s+/g, "-");
  const parentId = str(fd, "parentId") || null;

  if (name.length < 2 || name.length > 60) return { error: "نام دسته‌بندی باید ۲ تا ۶۰ حرف باشد." };
  if (!/^[\p{L}\p{N}\u200c-]{2,60}$/u.test(slug))
    return { error: "اسلاگ باید ۲ تا ۶۰ کاراکتر باشد و فقط شامل حروف، عدد و - باشد." };
  return { data: { name, slug, parentId } };
}

async function checkParent(parentId: string | null, selfId?: string): Promise<string | null> {
  if (!parentId) return null;
  if (parentId === selfId) return "یک دسته‌بندی نمی‌تواند زیرمجموعه‌ی خودش باشد.";

  const parent = await prisma.category.findUnique({ where: { id: parentId }, select: { parentId: true } });
  if (!parent) return "دسته‌بندی والد پیدا نشد.";
  if (parent.parentId) return "والد انتخاب‌شده خودش زیرمجموعه است. فقط یک سطح زیرمجموعه مجاز است.";

  if (selfId && (await prisma.category.count({ where: { parentId: selfId } })) > 0)
    return "این دسته‌بندی زیرمجموعه دارد و نمی‌تواند خودش زیرمجموعه‌ی دسته‌ی دیگری شود.";
  return null;
}

function revalidateAll(id?: string) {
  revalidatePath("/", "layout"); 
  revalidatePath("/admin/categories");
  if (id) revalidatePath(`/admin/categories/${id}`);
}

const SLUG_TAKEN = "این اسلاگ قبلاً برای دسته‌بندی دیگری استفاده شده است.";

export async function createCategory(_: CategoryState, fd: FormData): Promise<CategoryState> {
  await requireAdmin();

  const parsed = parseBasics(fd);
  if ("error" in parsed) return { error: parsed.error };

  const parentError = await checkParent(parsed.data.parentId);
  if (parentError) return { error: parentError };

  if (await prisma.category.findUnique({ where: { slug: parsed.data.slug }, select: { id: true } }))
    return { error: SLUG_TAKEN };

  let image: string | null = null;
  const file = fd.get("image");
  if (file instanceof File && file.size > 0) {
    try {
      image = await saveCategoryImage(file);
    } catch (e) {
      return { error: e instanceof UploadError ? e.message : "ذخیره‌ی عکس انجام نشد." };
    }
  }

  try {
    await prisma.category.create({ data: { ...parsed.data, image } });
  } catch (e) {
    if (image) await deleteUploads([image]);
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") return { error: SLUG_TAKEN };
    return { error: "ذخیره انجام نشد. دوباره تلاش کنید." };
  }

  revalidateAll();
  redirect("/admin/categories");
}

export async function updateCategory(_: CategoryState, fd: FormData): Promise<CategoryState> {
  await requireAdmin();

  const id = str(fd, "id");
  const current = await prisma.category.findUnique({ where: { id }, select: { image: true } });
  if (!current) return { error: "دسته‌بندی پیدا نشد." };

  const parsed = parseBasics(fd);
  if ("error" in parsed) return { error: parsed.error };

  const parentError = await checkParent(parsed.data.parentId, id);
  if (parentError) return { error: parentError };

  if (await prisma.category.findFirst({ where: { slug: parsed.data.slug, NOT: { id } }, select: { id: true } }))
    return { error: SLUG_TAKEN };

  let newImage: string | null = null;
  const file = fd.get("image");
  if (file instanceof File && file.size > 0) {
    try {
      newImage = await saveCategoryImage(file);
    } catch (e) {
      return { error: e instanceof UploadError ? e.message : "ذخیره‌ی عکس انجام نشد." };
    }
  }
  const image = newImage ?? (fd.get("removeImage") === "on" ? null : current.image);

  try {
    await prisma.category.update({ where: { id }, data: { ...parsed.data, image } });
  } catch (e) {
    if (newImage) await deleteUploads([newImage]);
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") return { error: SLUG_TAKEN };
    return { error: "ذخیره انجام نشد. دوباره تلاش کنید." };
  }

  if (current.image && current.image !== image && current.image.startsWith("/uploads/"))
    await deleteUploads([current.image]);

  revalidateAll(id);
  return { ok: true };
}

export async function deleteCategory(id: string): Promise<CategoryState> {
  await requireAdmin();

  const c = await prisma.category.findUnique({
    where: { id },
    select: { image: true, _count: { select: { products: true, children: true } } },
  });
  if (!c) return { error: "دسته‌بندی پیدا نشد." };
  if (c._count.children > 0)
    return { error: `این دسته‌بندی ${c._count.children} زیرمجموعه دارد. اول آن‌ها را حذف یا منتقل کنید.` };
  if (c._count.products > 0)
    return { error: `${c._count.products} محصول در این دسته‌بندی هست. اول محصولات را به دسته‌ی دیگری ببرید.` };

  try {
    await prisma.category.delete({ where: { id } });
  } catch {
    return { error: "حذف انجام نشد. دوباره تلاش کنید." };
  }

  if (c.image?.startsWith("/uploads/")) await deleteUploads([c.image]);
  revalidateAll();
  return { ok: true };
}