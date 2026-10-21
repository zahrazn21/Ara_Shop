import { readFile } from "fs/promises";
import path from "path";
import { UPLOAD_ROOT } from "@/lib/upload";

const TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

export async function GET(
  _: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: parts } = await params;
  const file = path.resolve(UPLOAD_ROOT, ...parts);
  const type = TYPES[path.extname(file).toLowerCase()];

  if (!type || !file.startsWith(UPLOAD_ROOT + path.sep)) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const data = await readFile(file);
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": type,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}