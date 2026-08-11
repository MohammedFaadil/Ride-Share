import path from "path";

/**
 * Resolves where uploaded files are written to and read from.
 *
 * Deliberately kept OUTSIDE `public/` so it works the same way whether the
 * directory is a plain folder (local dev, ephemeral on most PaaS restarts) or
 * a mounted persistent disk (e.g. a Render Disk mounted at `/var/data/uploads`
 * via the `UPLOAD_DIR` env var — see render.yaml). Files are served back out
 * through `GET /api/files/[...path]` (src/app/api/files/[...path]/route.ts)
 * rather than Next's static `public/` handler, so storage location and serving
 * are fully decoupled — swap this for S3-compatible object storage later
 * without touching any calling code.
 */
export function getUploadDir() {
  // The ignore comment tells Next's build-time file tracer not to treat this
  // as a dynamic glob that pulls the whole project into the server bundle —
  // the actual directory always resolves to either UPLOAD_DIR or ./uploads,
  // never anything trace-worthy.
  return process.env.UPLOAD_DIR
    ? path.resolve(process.env.UPLOAD_DIR)
    : path.join(/*turbopackIgnore: true*/ process.cwd(), "uploads");
}

export function fileUrlFor(filename: string) {
  return `/api/files/${filename}`;
}

const EXTENSION_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

export function mimeTypeForExtension(ext: string) {
  return EXTENSION_MIME[ext.toLowerCase()] ?? "application/octet-stream";
}
