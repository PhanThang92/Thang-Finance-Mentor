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
// Resolves <project_root>/uploads/ regardless of how Passenger/Node starts the app.
//
// Three strategies tried in order:
//   1. import.meta.url  — URL of the running bundle (dist/index.mjs)
//   2. process.argv[1]  — path of the startup script (loader.mjs or dist/index.mjs)
//   3. process.cwd()    — last resort
//
// For strategies 1 & 2: if the resolved dir ends in /dist (i.e. we're inside
// the build output), go up one level to reach the project root where uploads/ lives.
//
// Always override by setting env var UPLOAD_DIR to an absolute path.

// strip trailing /dist or /dist/ to get the project root
function _stripDist(dir: string): string {
  return /[/\\]dist[/\\]?$/.test(dir) ? path.resolve(dir, "..") : dir;
}

function _resolveProjectRoot(): string {
  const candidates: { label: string; dir: string }[] = [];

  // Strategy 1: globalThis.__dirname — set by esbuild banner at bundle load time
  // banner: globalThis.__dirname = path.dirname(fileURLToPath(import.meta.url))
  // This is the most reliable source because it's set once, explicitly, at the
  // top of dist/index.mjs before any module code executes.
  const gd = (globalThis as Record<string, unknown>)["__dirname"];
  if (typeof gd === "string" && gd) {
    candidates.push({ label: "globalThis.__dirname", dir: gd });
  }

  // Strategy 2: import.meta.url
  try {
    candidates.push({ label: "import.meta.url", dir: path.dirname(fileURLToPath(import.meta.url)) });
  } catch { /* ignore */ }

  // Strategy 3: process.argv[1] (startup script — loader.mjs or dist/index.mjs)
  if (process.argv[1]) {
    candidates.push({ label: "process.argv[1]", dir: path.dirname(path.resolve(process.argv[1])) });
  }

  // Strategy 4: process.cwd() — last resort
  candidates.push({ label: "process.cwd()", dir: process.cwd() });

  // Log all candidates for Plesk diagnostic
  for (const c of candidates) {
    console.log(`[storage:diag] ${c.label} → ${c.dir} → root: ${_stripDist(c.dir)}`);
  }

  // Use first strategy that resolves to a dir containing uploads/ or can create it
  // (prefer one not ending in /dist to avoid writing inside build output)
  for (const c of candidates) {
    const root = _stripDist(c.dir);
    const candidate = path.join(root, "uploads");
    // If uploads/ already exists there, definitely use it
    try {
      if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) {
        console.log(`[storage:diag] selected by fs.existsSync: ${c.label}`);
        return root;
      }
    } catch { /* ignore */ }
  }

  // No uploads/ found — fall back to first candidate that stripped /dist
  const first = candidates[0];
  if (first) return _stripDist(first.dir);
  return process.cwd();
}

const _projectRoot = _resolveProjectRoot();

export const UPLOAD_DIR: string =
  process.env["UPLOAD_DIR"] ?? path.join(_projectRoot, "uploads");

console.log(`[storage] UPLOAD_DIR = ${UPLOAD_DIR}`);

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
