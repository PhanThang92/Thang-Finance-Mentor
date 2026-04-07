/**
 * Storage abstraction layer
 *
 * Current provider: REPLIT_OBJECT_STORAGE (files written to GCS via @replit/object-storage)
 * Objects are stored at `uploads/<relativePath>` and served via the /api/uploads proxy in app.ts.
 *
 * The relative path convention (e.g. "disp/abc.webp") is preserved across providers
 * so the database featured_image / featured_image_display columns never need to change.
 */

import { Client } from "@replit/object-storage";

/* ── Types ─────────────────────────────────────────────────────────── */
export interface StorageProvider {
  /** Save buffer at the given relative path. Returns the public URL. */
  save(buffer: Buffer, relativePath: string, mimeType?: string): Promise<string>;
  /** Delete the file at the given relative path. No-op if missing. */
  delete(relativePath: string): Promise<void>;
  /** Resolve a relative path → public URL without writing anything. */
  publicUrl(relativePath: string): string;
}

/* ── MIME type helper ───────────────────────────────────────────────── */
export function mimeTypeForPath(filePath: string): string {
  const ext = filePath.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "webp") return "image/webp";
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  if (ext === "png") return "image/png";
  if (ext === "svg") return "image/svg+xml";
  if (ext === "gif") return "image/gif";
  return "application/octet-stream";
}

/* ── Replit Object Storage provider ────────────────────────────────── */
const objClient = new Client({ bucketId: process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID });

const OBJECT_PREFIX = "uploads";
const PUBLIC_PREFIX = "/api/uploads";

class ReplitObjectStorageProvider implements StorageProvider {
  async save(buffer: Buffer, relativePath: string, mimeType?: string): Promise<string> {
    const objectName = `${OBJECT_PREFIX}/${relativePath.replace(/^\//, "")}`;
    const result = await objClient.uploadFromBytes(objectName, buffer, {
      contentType: mimeType ?? mimeTypeForPath(relativePath),
    });
    if (!result.ok) {
      throw new Error(`Object storage save failed: ${result.error?.message ?? "unknown"}`);
    }
    return this.publicUrl(relativePath);
  }

  async delete(relativePath: string): Promise<void> {
    const objectName = `${OBJECT_PREFIX}/${relativePath.replace(/^\//, "")}`;
    await objClient.delete(objectName, { ignoreNotFound: true });
  }

  publicUrl(relativePath: string): string {
    return `${PUBLIC_PREFIX}/${relativePath.replace(/^\//, "")}`;
  }
}

export const storage: StorageProvider = new ReplitObjectStorageProvider();

/* Export the raw client so app.ts can use it for the proxy middleware */
export { objClient, OBJECT_PREFIX };
