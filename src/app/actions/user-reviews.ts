"use server";
import { Prisma, type ReviewStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { deleteUploads, MAX_REVIEW_IMAGES, saveReviewImages, UploadError } from "@/lib/upload";

export type ReviewFormState = { ok?: boolean; error?: string } | undefined;
export type MyReviewState = { loggedIn: boolean; status: ReviewStatus | null };

const MIN_COMMENT = 10;
const MAX_COMMENT = 1500;
const DAILY_LIMIT = 10;

export async function getMyReviewState(productId: string): Promise<MyReviewState> {
  const user = await getCurrentUser();
  if (!user) return { loggedIn: false, status: null };

  const review = await prisma.review.findFirst({
    where: { userId: user.id, productId: String(productId), status: { in: ["PENDING", "APPROVED"] } },
    select: { status: true },
  });
  return { loggedIn: true, status: review?.status ?? null };
}

export async function submitReview(_: ReviewFormState, fd: FormData): Promise<ReviewFormState> {
  const user = await getCurrentUser();
  if (!user) return { error: "برای ثبت نظر ابتدا وارد حساب کاربری شوید." };

  const productId = String(fd.get("productId") ?? "");
  const rating = Number(fd.get("rating"));
  const comment = String(fd.get("comment") ?? "").trim();

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return { error: "امتیاز خود را انتخاب کنید." };
  if (comment.length < MIN_COMMENT) return { error: `متن نظر باید حداقل ${MIN_COMMENT} حرف باشد.` };
  if (comment.length > MAX_COMMENT) return { error: `متن نظر نباید بیشتر از ${MAX_COMMENT} حرف باشد.` };

  const product = await prisma.product.findFirst({
    where: { id: productId, status: "ACTIVE" },
    select: { id: true },
  });
  if (!product) return { error: "محصول پیدا نشد." };

  const existing = await prisma.review.findFirst({
    where: { userId: user.id, productId: product.id, status: { in: ["PENDING", "APPROVED"] } },
    select: { id: true },
  });
  if (existing) return { error: "شما قبلاً برای این محصول نظر ثبت کرده‌اید." };

  const recent = await prisma.review.count({
    where: { userId: user.id, createdAt: { gt: new Date(Date.now() - 864e5) } },
  });
  if (recent >= DAILY_LIMIT) return { error: "تعداد نظرهای امروز شما به حد مجاز رسیده است." };

  const files = fd.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length > MAX_REVIEW_IMAGES) return { error: `حداکثر ${MAX_REVIEW_IMAGES} عکس مجاز است.` };

  let urls: string[] = [];
  try {
    urls = await saveReviewImages(files);
  } catch (e) {
    return { error: e instanceof UploadError ? e.message : "ذخیره‌ی عکس‌ها انجام نشد." };
  }

  try {
    await prisma.review.create({
      data: { userId: user.id, productId: product.id, rating, comment, imageUrls: urls },
    });
  }  catch (e) {
  await deleteUploads(urls);
  if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002")
    return { error: "شما قبلاً برای این محصول نظر ثبت کرده‌اید." };
  return { error: "ثبت نظر انجام نشد. دوباره تلاش کنید." };
}

  revalidatePath("/admin/reviews");
  revalidatePath("/admin");
  return { ok: true };
}
