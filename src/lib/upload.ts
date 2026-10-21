import { mkdir, unlink, writeFile } from "fs/promises";
import { randomUUID } from "crypto";
import path from "path";

export const MAX_IMAGES = 6;
export const MAX_IMAGE_BYTES = 3 * 1024 * 1024; 

export const UPLOAD_ROOT = path.resolve(process.env.UPLOAD_DIR ?? "uploads");
const DIR = path.join(UPLOAD_ROOT, "products");
const EXT = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" } as const;

export class UploadError extends Error {}

function sniff(b: Buffer): keyof typeof EXT | null {
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])))
    return "image/png";
  if (b.subarray(0, 4).toString("ascii") === "RIFF" && b.subarray(8, 12).toString("ascii") === "WEBP")
    return "image/webp";
  return null;
}

export const MAX_REVIEW_IMAGES = 3;
const REVIEW_DIR = path.join(UPLOAD_ROOT, "reviews");

async function saveImages(files: File[], dir: string, urlBase: string, max: number): Promise<string[]> {
  if (files.length > max) throw new UploadError(`حداکثر ${max} عکس مجاز است.`);
  await mkdir(dir, { recursive: true });

  const saved: string[] = [];
  try {
    for (const f of files) {
      if (f.size > MAX_IMAGE_BYTES) throw new UploadError("حجم هر عکس باید کمتر از ۳ مگابایت باشد.");
      const buf = Buffer.from(await f.arrayBuffer());
      const type = sniff(buf);
      if (!type) throw new UploadError("فقط عکس‌های JPG، PNG و WebP مجاز است.");
      const name = `${randomUUID()}.${EXT[type]}`;
      await writeFile(path.join(dir, name), buf);
      saved.push(`${urlBase}/${name}`);
    }
  } catch (e) {
    await deleteUploads(saved);
    throw e;
  }
  return saved;
}

export const saveProductImages = (files: File[]) => saveImages(files, DIR, "/uploads/products", MAX_IMAGES);

export const saveReviewImages = (files: File[]) =>
  saveImages(files, REVIEW_DIR, "/uploads/reviews", MAX_REVIEW_IMAGES);

const CATEGORY_DIR = path.join(UPLOAD_ROOT, "categories");

export async function saveCategoryImage(file: File): Promise<string> {
  const [url] = await saveImages([file], CATEGORY_DIR, "/uploads/categories", 1);
  return url;
}

export async function deleteUploads(urls: string[]) {
  await Promise.all(
    urls.map((u) =>
      unlink(path.join(UPLOAD_ROOT, u.replace(/^\/uploads\//, ""))).catch(() => {}),
    ),
  );
}