import { NextRequest } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { getCurrentUser } from "@/lib/auth";
import { apiOk, handleRoute, HttpError } from "@/lib/api";
import { getUploadDir, fileUrlFor } from "@/lib/storage";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 8 * 1024 * 1024; // 8MB

/**
 * Demo upload endpoint — writes to disk (see src/lib/storage.ts for where).
 * Suitable for prototype/small deployments; swap for an S3-compatible object
 * storage service (with signed URLs) before scaling to multiple instances.
 */
export async function POST(req: NextRequest) {
  return handleRoute(async () => {
    const user = await getCurrentUser();
    if (!user) throw new HttpError("Please log in", 401);

    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) throw new HttpError("No file provided", 422);
    if (!ALLOWED_TYPES.includes(file.type)) throw new HttpError("Only JPG, PNG, WEBP, or GIF images are allowed", 422);
    if (file.size > MAX_SIZE) throw new HttpError("File must be smaller than 8MB", 422);

    const ext = file.type.split("/")[1];
    const filename = `${randomUUID()}.${ext}`;
    const uploadDir = getUploadDir();
    await mkdir(uploadDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    const destination = path.join(/*turbopackIgnore: true*/ uploadDir, filename);
    await writeFile(destination, buffer);

    return apiOk({ url: fileUrlFor(filename) });
  });
}
