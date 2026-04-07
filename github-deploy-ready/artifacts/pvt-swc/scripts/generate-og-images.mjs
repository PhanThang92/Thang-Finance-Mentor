/**
 * Generate branded OG/share preview images.
 *
 * Usage:  node artifacts/pvt-swc/scripts/generate-og-images.mjs
 *
 * Outputs (in artifacts/pvt-swc/public/):
 *   og-default.png   — homepage + general pages
 *   og-article.png   — article pages without a featured image
 *   og-product.png   — product pages without a custom cover
 *
 * Requires: sharp (installed in artifacts/api-server/node_modules)
 */

import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __dirname  = path.dirname(fileURLToPath(import.meta.url));
const require    = createRequire(import.meta.url);

// Load sharp from api-server's node_modules
const sharp = require(
  path.resolve(__dirname, "../../api-server/node_modules/sharp")
);

const PUBLIC_DIR = path.resolve(__dirname, "../public");
const LOGO_PATH  = path.join(PUBLIC_DIR, "logos", "swc-logo-white.png");
const ICON_PATH  = path.join(PUBLIC_DIR, "logos", "swc-icon-white.png");

const W = 1200;
const H = 630;

/* ── Colours ─────────────────────────────────────────────────────── */
const C = {
  bg0:        "#0B312C",   // dark teal (top-left)
  bg1:        "#051A17",   // near-black (bottom-right)
  accent:     "#1E8A72",   // brand teal (bars / labels)
  accentDim:  "#155F50",   // slightly dimmer teal
  accentFaint:"#1A7065",   // faint teal for grid lines
  white:      "#FFFFFF",
  textSub:    "#7ABFAA",   // muted teal for tagline
  textDim:    "#3D8070",   // very muted for footnotes
  tagBg:      "#142F2C",   // pill background
};

/* ── Build SVG background string ─────────────────────────────────── */
function makeSvg({ labelText = null, headline, tagline, body, footer }) {
  const labelPill = labelText ? `
    <!-- Label pill -->
    <rect x="64" y="148" rx="5" ry="5" width="${labelText.length * 8.5 + 26}" height="26"
      fill="${C.tagBg}" stroke="${C.accent}" stroke-width="1" stroke-opacity="0.55"/>
    <text x="77" y="165" font-family="Liberation Sans,Arial,sans-serif"
      font-size="11" font-weight="700" letter-spacing="3.5" fill="${C.textSub}">${labelText}</text>
  ` : "";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">
      <stop offset="0%"   stop-color="${C.bg0}"/>
      <stop offset="100%" stop-color="${C.bg1}"/>
    </linearGradient>

    <!-- Subtle radial highlight (top-left) -->
    <radialGradient id="glow" cx="20%" cy="30%" r="60%">
      <stop offset="0%"   stop-color="${C.accent}" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="${C.accent}" stop-opacity="0"/>
    </radialGradient>

    <!-- Horizontal accent fade (bottom rule) -->
    <linearGradient id="hFade" x1="0" y1="0" x2="1" y2="0" gradientUnits="objectBoundingBox">
      <stop offset="0%"   stop-color="${C.accent}" stop-opacity="0.55"/>
      <stop offset="60%"  stop-color="${C.accent}" stop-opacity="0.10"/>
      <stop offset="100%" stop-color="${C.accent}" stop-opacity="0"/>
    </linearGradient>

    <!-- Dot pattern fill -->
    <pattern id="dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
      <circle cx="1" cy="1" r="1" fill="${C.accentFaint}" opacity="0.18"/>
    </pattern>
  </defs>

  <!-- Base gradient fill -->
  <rect width="${W}" height="${H}" fill="url(#bg)"/>

  <!-- Glow overlay -->
  <rect width="${W}" height="${H}" fill="url(#glow)"/>

  <!-- Dot texture (right half only, fades naturally with opacity) -->
  <rect x="${W * 0.45}" y="0" width="${W * 0.55}" height="${H}" fill="url(#dots)" opacity="0.6"/>

  <!-- Left accent bar -->
  <rect x="0" y="0" width="5" height="${H}" fill="${C.accent}"/>

  <!-- Bottom accent rule -->
  <rect x="0" y="${H - 2}" width="${W}" height="2" fill="url(#hFade)"/>

  <!-- Decorative rings (bottom-right) -->
  <circle cx="${W - 80}" cy="${H + 60}" r="260" fill="none" stroke="${C.accent}" stroke-width="1" opacity="0.08"/>
  <circle cx="${W - 80}" cy="${H + 60}" r="190" fill="none" stroke="${C.accent}" stroke-width="1" opacity="0.07"/>
  <circle cx="${W - 80}" cy="${H + 60}" r="120" fill="none" stroke="${C.accent}" stroke-width="1" opacity="0.06"/>

  ${labelPill}

  <!-- Headline -->
  <text x="64" y="${labelText ? 262 : 242}"
    font-family="Liberation Sans,Arial,sans-serif"
    font-size="${labelText ? 68 : 72}"
    font-weight="700"
    fill="${C.white}"
    opacity="0.97">${headline}</text>

  <!-- Tagline -->
  <text x="64" y="${labelText ? 322 : 308}"
    font-family="Liberation Sans,Arial,sans-serif"
    font-size="26"
    font-weight="400"
    fill="${C.textSub}"
    opacity="0.88">${tagline}</text>

  <!-- Body text -->
  <text x="64" y="${labelText ? 370 : 358}"
    font-family="Liberation Sans,Arial,sans-serif"
    font-size="17"
    font-weight="400"
    fill="${C.textDim}"
    opacity="0.85">${body}</text>

  <!-- Divider line above footer -->
  <rect x="64" y="${H - 68}" width="120" height="1" fill="${C.accent}" opacity="0.35"/>

  <!-- Footer -->
  <text x="64" y="${H - 44}"
    font-family="Liberation Sans,Arial,sans-serif"
    font-size="13"
    font-weight="400"
    letter-spacing="0.5"
    fill="${C.textDim}"
    opacity="0.80">${footer}</text>
</svg>`;
}

/* ── Resize logo for overlay ─────────────────────────────────────── */
async function logoOverlay(targetWidth = 190) {
  const meta   = await sharp(LOGO_PATH).metadata();
  const ratio  = meta.height / meta.width;
  const h      = Math.round(targetWidth * ratio);
  const buf    = await sharp(LOGO_PATH)
    .resize(targetWidth, h)
    .png()
    .toBuffer();
  return {
    input:  buf,
    top:    52,
    left:   64,
    blend:  "over",
  };
}

/* ── Render one image ─────────────────────────────────────────────── */
async function render(svgString, outputPath, logoW = 190) {
  const svgBuf = Buffer.from(svgString, "utf-8");
  const logo   = await logoOverlay(logoW);

  await sharp(svgBuf)
    .png()
    .composite([logo])
    .jpeg({ quality: 93, mozjpeg: true })
    .toFile(outputPath);

  console.log(`  ✓  ${path.basename(outputPath)}`);
}

/* ── Image definitions ───────────────────────────────────────────── */
async function main() {
  console.log("\nGenerating OG images…\n");

  /* 1. og-default — homepage + general pages */
  await render(
    makeSvg({
      labelText: null,
      headline:  "Phan Văn Thắng SWC",
      tagline:   "Tư duy tài chính thực chiến.",
      body:      "Tích sản dài hạn · Đầu tư có kỷ luật · Hệ sinh thái tri thức",
      footer:    "phanvanthangswc.com",
    }),
    path.join(PUBLIC_DIR, "og-default.jpg")
  );

  /* 2. og-article — articles without a featured image */
  await render(
    makeSvg({
      labelText: "BÀI VIẾT",
      headline:  "Phan Văn Thắng SWC",
      tagline:   "Kho tri thức tài chính cá nhân, đầu tư",
      body:      "Chia sẻ thực chiến về tích sản dài hạn, tư duy tiền bạc và đầu tư có kỷ luật.",
      footer:    "phanvanthangswc.com  ·  Bài viết",
    }),
    path.join(PUBLIC_DIR, "og-article.jpg")
  );

  /* 3. og-product — product pages without custom cover */
  await render(
    makeSvg({
      labelText: "SẢN PHẨM",
      headline:  "Phan Văn Thắng SWC",
      tagline:   "Tri thức. Cộng đồng. Đồng hành.",
      body:      "Hệ sinh thái sản phẩm SWC — xây dựng cho hành trình tích sản thực chiến.",
      footer:    "phanvanthangswc.com  ·  Sản phẩm",
    }),
    path.join(PUBLIC_DIR, "og-product.jpg")
  );

  console.log("\nDone.\n");
}

main().catch((e) => { console.error(e); process.exit(1); });
