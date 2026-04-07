/**
 * imageService.ts
 * Centralized image processing pipeline for all article/media uploads.
 *
 * Pipeline per upload:
 *   original  →  orig/{id}.ext          (raw, untouched)
 *   display   →  disp/{id}.webp         (1600×900, watermarked, quality 87) ← "large"
 *   medium    →  disp/{id}_medium.webp  (1280×720, watermarked, quality 84)
 *   thumbnail →  thumb/{id}_thumb.webp  (800×450,  cover-crop,  quality 82)
 *
 * Watermark text is context-driven and stored in the DB so it can differ
 * per article section (atlas, road-to-1m, tu-duy-dau-tu, default brand).
 *
 * To change watermark defaults, edit watermarkText() below.
 * To disable watermarks globally, set WATERMARK_ENABLED=false env var.
 */

import sharp from "sharp";

/* ── Watermark configuration ──────────────────────────────────────────────── */

/**
 * Returns the watermark string for a given upload context.
 * Context values come from the admin upload form (req.body.context).
 */
export function watermarkTextForContext(context: string): string {
  switch (context) {
    case "atlas":          return "THẮNG SWC · ATLAS";
    case "road-to-1m":     return "THẮNG SWC · ROAD TO $1M";
    case "tu-duy-dau-tu":
    case "article":
    case "finance":        return "THẮNG SWC · TÀI CHÍNH";
    default:               return "THẮNG SWC";
  }
}

/**
 * Builds a transparent SVG watermark badge with the given text.
 * Renders as a subtle semi-opaque pill in the bottom-right corner.
 */
function buildWatermarkSvg(text: string, imageWidth: number): Buffer {
  // Scale watermark width proportionally; clamp between 200 and 360px.
  const W   = Math.max(200, Math.min(360, Math.round(imageWidth * 0.19)));
  const H   = Math.round(W * 0.1);
  const pad = 4;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <rect x="0" y="0" width="${W}" height="${H}" fill="rgba(0,0,0,0.22)" rx="3" ry="3"/>
    <text x="${W - pad}" y="${H - Math.round(H * 0.28)}"
      font-family="'Helvetica Neue',Arial,sans-serif"
      font-size="${Math.round(H * 0.37)}" font-weight="700" letter-spacing="1.8"
      fill="rgba(255,255,255,0.72)" text-anchor="end">${text}</text>
  </svg>`;
  return Buffer.from(svg);
}

/* ── Image dimensions ─────────────────────────────────────────────────────── */

const DISPLAY_W = 1600;
const DISPLAY_H = 900;

const MEDIUM_W  = 1280;
const MEDIUM_H  = 720;

const THUMB_W   = 800;
const THUMB_H   = 450;

const MARGIN    = 20; // px from edge for watermark placement

/* ── Processing functions ─────────────────────────────────────────────────── */

/**
 * Generate the full-size display version (large).
 * Resizes to 1600×900, applies watermark, encodes as WebP.
 * Applied to: article hero images, featured images, video thumbnails.
 */
export async function generateDisplay(
  buffer: Buffer,
  wmText: string,
): Promise<Buffer> {
  const watermarkEnabled = (process.env.WATERMARK_ENABLED ?? "true") !== "false";
  const base = sharp(buffer)
    .rotate()                                              // auto-fix EXIF orientation
    .resize(DISPLAY_W, DISPLAY_H, { fit: "cover", position: "centre" });

  if (!watermarkEnabled) {
    return base.webp({ quality: 87 }).toBuffer();
  }

  const wmSvg  = buildWatermarkSvg(wmText, DISPLAY_W);
  const wmLeft = DISPLAY_W - wmSvg.length > 0 ? DISPLAY_W - (wmSvg.toString().match(/width="(\d+)"/)?.[1] ? Number(wmSvg.toString().match(/width="(\d+)"/)?.[1]) : 300) - MARGIN : MARGIN;
  const wmTop  = DISPLAY_H - 30 - MARGIN;

  // Re-derive wm width from SVG string
  const svgWidth = Number(wmSvg.toString().match(/width="(\d+)"/)?.[1] ?? 300);

  return base
    .composite([{ input: wmSvg, left: DISPLAY_W - svgWidth - MARGIN, top: wmTop, blend: "over" }])
    .webp({ quality: 87 })
    .toBuffer();
}

/**
 * Generate the medium version.
 * Resizes to 1280×720, applies watermark, encodes as WebP.
 * Applied to: listing pages, OG images, related article cards.
 */
export async function generateMedium(
  buffer: Buffer,
  wmText: string,
): Promise<Buffer> {
  const watermarkEnabled = (process.env.WATERMARK_ENABLED ?? "true") !== "false";
  const base = sharp(buffer)
    .rotate()
    .resize(MEDIUM_W, MEDIUM_H, { fit: "cover", position: "centre" });

  if (!watermarkEnabled) {
    return base.webp({ quality: 84 }).toBuffer();
  }

  const wmSvg    = buildWatermarkSvg(wmText, MEDIUM_W);
  const svgWidth = Number(wmSvg.toString().match(/width="(\d+)"/)?.[1] ?? 240);
  const wmTop    = MEDIUM_H - 30 - MARGIN;

  return base
    .composite([{ input: wmSvg, left: MEDIUM_W - svgWidth - MARGIN, top: wmTop, blend: "over" }])
    .webp({ quality: 84 })
    .toBuffer();
}

/**
 * Generate the thumbnail version.
 * Resizes to 800×450, NO watermark (too small to read), encodes as WebP.
 * Applied to: article cards, admin previews, RSS feeds.
 */
export async function generateThumbnail(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .rotate()
    .resize(THUMB_W, THUMB_H, { fit: "cover", position: "centre" })
    .webp({ quality: 82 })
    .toBuffer();
}

/**
 * Full pipeline: original → display (large) → medium → thumbnail.
 * Returns all three processed buffers plus the watermark text used.
 */
export async function runImagePipeline(
  originalBuffer: Buffer,
  context: string,
): Promise<{
  display:   Buffer;
  medium:    Buffer;
  thumbnail: Buffer;
  watermarkText: string;
}> {
  const wmText   = watermarkTextForContext(context);
  const [display, medium, thumbnail] = await Promise.all([
    generateDisplay(originalBuffer, wmText),
    generateMedium(originalBuffer, wmText),
    generateThumbnail(originalBuffer),
  ]);
  return { display, medium, thumbnail, watermarkText: wmText };
}
