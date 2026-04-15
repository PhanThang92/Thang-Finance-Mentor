/**
 * Storage abstraction — Local file system provider
 *
 * Files are written to  <UPLOAD_DIR>/<relativePath>
 * and served publicly at  /api/uploads/<relativePath>
 *
 * UPLOAD_DIR defaults to  <project_root>/uploads/
 *
 * Path is resolved relative to the compiled server file (dist/index.mjs),
 * NOT process.cwd(). This keeps uploads OUTSIDE of dist/ at all times,
 * so `npm run build` (which wipes dist/public/) never destroys uploaded files.
 *
 * Directory layout:
 *   <project_root>/
 *     dist/          ← wiped on build — NEVER store user data here
 *       index.mjs    ← compiled server (import.meta.url points here)
 *       public/      ← compiled frontend (emptyOutDir: true)
 *     uploads/       ← user-uploaded files, safe from build wipes
 *
 * Override with env var:  UPLOAD_DIR=/absolute/custom/path
 */

import fs   from "fs";
import path from "path";
import { fileURLToPath } from "url";

/* ── Types ─────────────────────────────────────────────────────────── */
export interface StorageProvider {
  save(buffer: Buffer, relativePath: string, mimeType?: string): Promise<string>;
  delete(relativePath: string): Promise<void>;
  publicUrl(relativePath: string): string;
}

/* ── Upload directory ───────────────────────────────────────────────── */
// Resolve from the compiled server file's location, not process.cwd().
// In production:  dist/index.mjs → _serverDir = dist/ → uploads = <root>/uploads/
// In development: same — build.mjs compiles server to dist/ before starting.
const _serverDir = path.dirname(fileURLToPath(import.meta.url));

export const UPLOAD_DIR: string =
  process.env["UPLOAD_DIR"] ?? path.resolve(_serverDir, "..", "uploads");

/* ── MIME type helper ───────────────────────────────────────────────── */
export function mimeTypeForPath(filePath: string): string {
  const ext = filePath.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "webp") return "image/webp";
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  if (ext === "png")  return "image/png";
  if (ext === "svg")  return "image/svg+xml";
  if (ext === "gif")  return "image/gif";
  if (ext === "avif") return "image/avif";
  if (ext === "pdf")  return "application/pdf";
  return "application/octet-stream";
}

/* ── Local FileSystem provider ──────────────────────────────────────── */
class LocalStorageProvider implements StorageProvider {
  private root: string;

  constructor(root: string) {
    this.root = root;
    fs.mkdirSync(path.join(root, "orig"),  { recursive: true });
    fs.mkdirSync(path.join(root, "disp"),  { recursive: true });
    fs.mkdirSync(path.join(root, "thumb"), { recursive: true });
  }

  async save(buffer: Buffer, relativePath: string): Promise<string> {
    const dest = path.join(this.root, relativePath.replace(/^\//, ""));
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, buffer);
    return this.publicUrl(relativePath);
  }

  async delete(relativePath: string): Promise<void> {
    const dest = path.join(this.root, relativePath.replace(/^\//, ""));
    try { fs.unlinkSync(dest); } catch { /* already gone */ }
  }

  publicUrl(relativePath: string): string {
    return `/api/uploads/${relativePath.replace(/^\//, "")}`;
  }
}

export const storage: StorageProvider = new LocalStorageProvider(UPLOAD_DIR);

/* ── Directory helpers (used by admin media routes) ─────────────────── */

export interface DiskFileEntry {
  relativePath: string;
  publicUrl:    string;
  sizeBytes:    number;
  modifiedAt:   string;
  mimeType:     string;
}

/** Recursively list all files under UPLOAD_DIR */
export function listUploadFiles(): DiskFileEntry[] {
  const entries: DiskFileEntry[] = [];
  function walk(dir: string) {
    if (!fs.existsSync(dir)) return;
    for (const name of fs.readdirSync(dir)) {
      const full = path.join(dir, name);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) { walk(full); continue; }
      const rel = path.relative(UPLOAD_DIR, full).replace(/\\/g, "/");
      entries.push({
        relativePath: rel,
        publicUrl:    `/api/uploads/${rel}`,
        sizeBytes:    stat.size,
        modifiedAt:   stat.mtime.toISOString(),
        mimeType:     mimeTypeForPath(name),
      });
    }
  }
  walk(UPLOAD_DIR);
  return entries.sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt));
}

/** Compute total disk usage */
export function uploadDiskStats(): { totalBytes: number; fileCount: number } {
  const files = listUploadFiles();
  return {
    totalBytes: files.reduce((s, f) => s + f.sizeBytes, 0),
    fileCount:  files.length,
  };
}
