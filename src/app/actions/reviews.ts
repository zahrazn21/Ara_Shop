"use server";
import { Prisma, type ReviewStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { REVIEW_STATUS_LABEL } from "@/lib/labels";
import { deleteUploads } from "@/lib/upload";

export type ReviewActionState = { ok?: boolean; error?: string } | undefined;

async function syncProductRating(tx: Prisma.TransactionClient, productId: string) {
  const { _avg, _count } = await tx.review.aggregate({
    where: { productId, status: "APPROVED" },
    _avg: { rating: true },
    _count: { _all: true },
  });
  await tx.product.update({
    where: { id: productId },
    data: {
      rating: _avg.rating ? Math.round(_avg.rating * 10) / 10 : 0,
      reviewCount: _count._all,
    },
  });
}

function revalidateReviews(productSlug: string) {
  revalidatePath("/admin/reviews");
  revalidatePath("/admin");
  revalidatePath(`/products/${productSlug}`);
  revalidatePath("/products");
  revalidatePath("/");
}

const failure = (e: unknown): ReviewActionState =>
  e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025"
    ? { error: "نظر پیدا نشد (شاید قبلاً حذف شده)." }
    : { error: "انجام نشد. دوباره تلاش کنید." };

export async function moderateReview(id: string, status: ReviewStatus, adminNote?: string): Promise<ReviewActionState> {
  await requireAdmin();
  if (!Object.hasOwn(REVIEW_STATUS_LABEL, status)) return { error: "وضعیت نامعتبر است." };

  const note = status === "REJECTED" ? adminNote?.trim().slice(0, 1000) || null : null;

  try {
    const slug = await prisma.$transaction(async (tx) => {
      const review = await tx.review.update({
        where: { id },
        data: { status, adminNote: note },
        select: { productId: true, product: { select: { slug: true } } },
      });
      await syncProductRating(tx, review.productId);
      return review.product.slug;
    });
    revalidateReviews(slug);
    return { ok: true };
  } catch (e) {
    return failure(e);
  }
}

export async function deleteReview(id: string): Promise<ReviewActionState> {
  await requireAdmin();
  try {
    const { slug, imageUrls } = await prisma.$transaction(async (tx) => {
      const review = await tx.review.delete({
        where: { id },
        select: { productId: true, imageUrls: true, product: { select: { slug: true } } },
      });
      await syncProductRating(tx, review.productId);
      return { slug: review.product.slug, imageUrls: review.imageUrls };
    });
    await deleteUploads(imageUrls.filter((u) => u.startsWith("/uploads/reviews/")));
    revalidateReviews(slug);
    return { ok: true };
  } catch (e) {
    return failure(e);
  }
}
