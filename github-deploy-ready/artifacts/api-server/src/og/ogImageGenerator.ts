import path from "path";
import { existsSync, mkdirSync } from "fs";
import sharp from "sharp";

/* ══════════════════════════════════════════════
   OG IMAGE GENERATOR
   Server-side branded social share image (1200×630 PNG)
   Uses sharp + SVG compositing — no browser required.
══════════════════════════════════════════════ */

const UPLOADS_DIR = path.join(process.cwd(), "uploads");
const OG_DIR      = path.join(UPLOADS_DIR, "og-images");

const W = 1200;
const H = 630;

/* ── Brand palette ─────────────────────────────────────────────────── */
const BG         = "#0e3d35";
const ACCENT     = "#22917f";
const TITLE_CLR  = "#ffffff";
const LABEL_CLR  = "#9ed8c9";
const BADGE_BG   = "rgba(34,145,127,0.28)";
const BADGE_TEXT = "#4dd9bf";
const DIVIDER    = "rgba(255,255,255,0.14)";
const BRAND_CLR  = "rgba(255,255,255,0.72)";
const TAG_CLR    = "rgba(255,255,255,0.38)";

/* ── Typography — system-safe stack (no inner quotes to keep SVG valid) */
const FONT = "Liberation Sans, Helvetica Neue, Arial, sans-serif";

/* ── Content type labels ──────────────────────────────────────────── */
const LABELS: Record<OgContentType, string> = {
  article: "BÀI VIẾT",
  video:   "VIDEO",
};

export type OgContentType = "article" | "video";

export interface OgImageParams {
  title:       string;
  category?:   string | null;
  contentType: OgContentType;
  slug:        string;
}

export interface OgImageResult {
  filePath:  string;
  publicUrl: string;
  filename:  string;
}

/* ── Word wrap for Vietnamese/Latin text ─────────────────────────── */
function wrapText(text: string, maxChars: number, maxLines: number): string[] {
  const words   = text.trim().split(/\s+/);
  const lines: string[] = [];
  let current   = "";

  for (let i = 0; i < words.length; i++) {
    const word      = words[i]!;
    const candidate = current ? `${current} ${word}` : word;

    if (candidate.length > maxChars && current) {
      lines.push(current);
      if (lines.length >= maxLines) {
        // Last allowed line: consume remaining, truncate with ellipsis if needed
        const remaining = words.slice(i).join(" ");
        const lastLine  = remaining.length > maxChars
          ? remaining.slice(0, maxChars - 1).replace(/\s\S*$/, "") + "…"
          : remaining;
        lines[maxLines - 1] = lastLine;
        return lines;
      }
      current = word;
    } else {
      current = candidate;
    }
  }

  if (current) lines.push(current);
  return lines.slice(0, maxLines);
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* ── SVG template ─────────────────────────────────────────────────── */
function buildSvg(params: {
  title:       string;
  category?:   string | null;
  contentType: OgContentType;
}): string {
  const label      = LABELS[params.contentType];
  const titleLines = wrapText(params.title, 30, 3);

  const TITLE_SIZE    = 50;
  const LINE_H        = 68;
  const TITLE_START_Y = 210;
  const PAD_L         = 88;
  const PAD_R         = 88;

  const badgeWidth = label.length * 9.8 + 36;

  const titleEls = titleLines
    .map((line, i) => {
      const y = TITLE_START_Y + i * LINE_H;
      return `<text x="${PAD_L}" y="${y}"
        font-family="${FONT}"
        font-size="${TITLE_SIZE}"
        font-weight="700"
        fill="${TITLE_CLR}"
        xml:space="preserve">${escapeXml(line)}</text>`;
    })
    .join("\n  ");

  const categoryY = TITLE_START_Y + titleLines.length * LINE_H + 26;
  const categoryEl = params.category
    ? `<text x="${PAD_L}" y="${categoryY}"
        font-family="${FONT}"
        font-size="21"
        font-weight="500"
        fill="${LABEL_CLR}">${escapeXml(params.category)}</text>`
    : "";

  /* decorative right-side arcs */
  const arcs = [240, 180, 120].map((r, i) =>
    `<circle cx="${W - PAD_R + 20}" cy="80" r="${r}"
      fill="none" stroke="${ACCENT}" stroke-width="${1 - i * 0.25}"
      opacity="${0.10 - i * 0.02}"/>`
  ).join("\n  ");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">

  <!-- Background -->
  <rect width="${W}" height="${H}" fill="${BG}"/>

  <!-- Subtle grid texture -->
  <defs>
    <pattern id="g" width="44" height="44" patternUnits="userSpaceOnUse">
      <path d="M44 0L0 0 0 44" fill="none" stroke="white" stroke-width="0.4"/>
    </pattern>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#g)" opacity="0.028"/>

  <!-- Decorative arcs top-right -->
  ${arcs}

  <!-- Bottom gradient fade -->
  <defs>
    <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="60%" stop-color="${BG}" stop-opacity="0"/>
      <stop offset="100%" stop-color="#071f1b" stop-opacity="0.55"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#fade)"/>

  <!-- Left accent bar -->
  <rect x="0" y="0" width="7" height="${H}" fill="${ACCENT}"/>

  <!-- Content type badge -->
  <rect x="${PAD_L}" y="66" width="${badgeWidth}" height="28" rx="5" fill="${BADGE_BG}"/>
  <text x="${PAD_L + badgeWidth / 2}" y="85"
    font-family="${FONT}"
    font-size="11"
    font-weight="700"
    fill="${BADGE_TEXT}"
    text-anchor="middle"
    letter-spacing="2.2">${escapeXml(label)}</text>

  <!-- Title -->
  ${titleEls}

  <!-- Category / topic -->
  ${categoryEl}

  <!-- Horizontal divider -->
  <rect x="${PAD_L}" y="554" width="${W - PAD_L - PAD_R}" height="1" fill="${DIVIDER}"/>

  <!-- Brand accent dot -->
  <rect x="${PAD_L}" y="569" width="4" height="28" rx="2" fill="${ACCENT}"/>

  <!-- Brand name -->
  <text x="${PAD_L + 13}" y="588"
    font-family="${FONT}"
    font-size="14"
    font-weight="700"
    fill="${BRAND_CLR}"
    letter-spacing="1.8">PHAN VĂN THẮNG SWC</text>

  <!-- Tagline -->
  <text x="${W - PAD_R}" y="588"
    font-family="${FONT}"
    font-size="13"
    fill="${TAG_CLR}"
    text-anchor="end"
    letter-spacing="0.4">Đầu tư · Tư duy · Bền vững</text>

</svg>`;
}

/* ── Public API ───────────────────────────────────────────────────── */
export async function generateOgImage(params: OgImageParams): Promise<OgImageResult> {
  const typeDir = path.join(OG_DIR, `${params.contentType}s`);
  if (!existsSync(typeDir)) mkdirSync(typeDir, { recursive: true });

  const timestamp = Date.now();
  const safeSlug  = params.slug
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 50)
    .replace(/-$/, "");

  const filename  = `${safeSlug}-${timestamp}.png`;
  const filePath  = path.join(typeDir, filename);
  const publicUrl = `/api/uploads/og-images/${params.contentType}s/${filename}`;

  const svg = buildSvg({
    title:       params.title,
    category:    params.category,
    contentType: params.contentType,
  });

  await sharp(Buffer.from(svg))
    .png({ compressionLevel: 8 })
    .toFile(filePath);

  return { filePath, publicUrl, filename };
}
