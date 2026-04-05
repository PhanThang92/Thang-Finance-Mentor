/**
 * Storage abstraction layer
 *
 * Current provider: LOCAL (files written to disk at uploads/)
 * To switch to S3, set STORAGE_PROVIDER=s3 and provide:
 *   AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, AWS_S3_BUCKET, CDN_BASE_URL (optional)
 *
 * The relative path convention (e.g. "disp/abc.webp") is preserved across providers
 * so the database storagePathOriginal / storagePathProcessed columns never need to change.
 */

import path from "path";
import { existsSync, mkdirSync, writeFileSync, unlinkSync } from "fs";

/* ── Types ─────────────────────────────────────────────────────────── */
export interface StorageProvider {
  /** Save buffer at the given relative path. Returns the public URL. */
  save(buffer: Buffer, relativePath: string, mimeType?: string): Promise<string>;
  /** Delete the file at the given relative path. No-op if missing. */
  delete(relativePath: string): Promise<void>;
  /** Resolve a relative path → public URL without writing anything. */
  publicUrl(relativePath: string): string;
}

/* ── Local disk provider (default) ─────────────────────────────────── */
const UPLOADS_DIR = path.join(process.cwd(), "uploads");
const LOCAL_PUBLIC_PREFIX = "/api/uploads";

class LocalStorageProvider implements StorageProvider {
  private uploadsDir: string;

  constructor(uploadsDir: string) {
    this.uploadsDir = uploadsDir;
  }

  async save(buffer: Buffer, relativePath: string): Promise<string> {
    const absPath = path.join(this.uploadsDir, relativePath);
    const dir = path.dirname(absPath);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(absPath, buffer);
    return this.publicUrl(relativePath);
  }

  async delete(relativePath: string): Promise<void> {
    const absPath = path.join(this.uploadsDir, relativePath);
    try {
      if (existsSync(absPath)) unlinkSync(absPath);
    } catch {
      /* ignore missing file */
    }
  }

  publicUrl(relativePath: string): string {
    return `${LOCAL_PUBLIC_PREFIX}/${relativePath.replace(/^\//, "")}`;
  }
}

/* ── S3 provider stub ───────────────────────────────────────────────
 *
 * To activate, set STORAGE_PROVIDER=s3 and install @aws-sdk/client-s3:
 *   pnpm --filter @workspace/api-server add @aws-sdk/client-s3
 *
 * Required env vars:
 *   AWS_ACCESS_KEY_ID
 *   AWS_SECRET_ACCESS_KEY
 *   AWS_REGION           (e.g. ap-southeast-1)
 *   AWS_S3_BUCKET        (your bucket name)
 *   CDN_BASE_URL         (optional — use CloudFront/CDN prefix instead of S3 URL)
 *
 * Uncomment and adapt the implementation below when ready.
 * ─────────────────────────────────────────────────────────────────── */
// import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
//
// class S3StorageProvider implements StorageProvider {
//   private client: S3Client;
//   private bucket: string;
//   private cdnBase: string;
//
//   constructor() {
//     this.client = new S3Client({ region: process.env.AWS_REGION! });
//     this.bucket = process.env.AWS_S3_BUCKET!;
//     this.cdnBase = process.env.CDN_BASE_URL ?? `https://${this.bucket}.s3.amazonaws.com`;
//   }
//
//   async save(buffer: Buffer, relativePath: string, mimeType = "application/octet-stream"): Promise<string> {
//     const key = relativePath.replace(/^\//, "");
//     await this.client.send(new PutObjectCommand({
//       Bucket: this.bucket, Key: key, Body: buffer,
//       ContentType: mimeType, CacheControl: "public, max-age=31536000",
//     }));
//     return this.publicUrl(relativePath);
//   }
//
//   async delete(relativePath: string): Promise<void> {
//     const key = relativePath.replace(/^\//, "");
//     await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
//   }
//
//   publicUrl(relativePath: string): string {
//     return `${this.cdnBase}/${relativePath.replace(/^\//, "")}`;
//   }
// }

/* ── Factory ────────────────────────────────────────────────────────── */
function createStorage(): StorageProvider {
  const provider = (process.env.STORAGE_PROVIDER ?? "local").toLowerCase();

  if (provider === "s3") {
    // Swap to S3StorageProvider() when the stub above is uncommented
    throw new Error(
      "S3 storage provider is not yet activated. " +
      "Uncomment the S3StorageProvider class in src/lib/storage.ts and install @aws-sdk/client-s3."
    );
  }

  return new LocalStorageProvider(UPLOADS_DIR);
}

export const storage = createStorage();
