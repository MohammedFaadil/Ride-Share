import { readFile, stat } from "fs/promises";
import path from "path";
import { getUploadDir, mimeTypeForExtension } from "@/lib/storage";

export async function GET(_req: Request, ctx: RouteContext<"/api/files/[...path]">) {
  const { path: segments } = await ctx.params;
  const uploadDir = getUploadDir();

  // Resolve against the upload directory and refuse anything that escapes it
  // (e.g. "../../etc/passwd") — standard path-traversal guard for user-influenced paths.
  const resolved = path.resolve(uploadDir, ...segments);
  if (!resolved.startsWith(path.resolve(uploadDir) + path.sep) && resolved !== path.resolve(uploadDir)) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const info = await stat(resolved);
    if (!info.isFile()) return new Response("Not found", { status: 404 });

    const buffer = await readFile(resolved);
    const ext = path.extname(resolved).slice(1);

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": mimeTypeForExtension(ext),
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Length": String(buffer.length),
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
