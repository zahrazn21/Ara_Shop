import { prisma } from "./prisma";
import { requireAdmin } from "./session";

export async function getAdminCategories() {
  await requireAdmin();
  return prisma.category.findMany({
    where: { parentId: null },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      image: true,
      _count: { select: { products: true } },
      children: {
        orderBy: { name: "asc" },
        select: { id: true, name: true, slug: true, image: true, _count: { select: { products: true } } },
      },
    },
  });
}

export async function getAdminCategory(id: string) {
  await requireAdmin();
  return prisma.category.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      slug: true,
      image: true,
      parentId: true,
      _count: { select: { children: true } },
    },
  });
}

// فقط دسته‌های اصلی می‌توانند «والد» باشند
export async function getParentOptions(excludeId?: string) {
  await requireAdmin();
  return prisma.category.findMany({
    where: { parentId: null, ...(excludeId && { id: { not: excludeId } }) },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}