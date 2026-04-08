/**
 * Production prerender server for pvt-swc SPA.
 *
 * For regular browser requests → serves static index.html (SPA).
 * For social-media bot requests → injects dynamic OG meta tags into index.html before serving.
 *
 * This replaces `vite preview` as the production server so that crawlers
 * (Facebook, Zalo, LinkedIn, etc.) receive pre-populated Open Graph metadata.
 */

import { config as dotenvConfig } from "dotenv";
import http from "http";
import fs   from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env from project root
dotenvConfig({ path: path.resolve(__dirname, ".env") });
// Fallback: .env in current working directory
dotenvConfig({ path: path.resolve(process.cwd(), ".env") });

const PORT     = Number(process.env.WEB_PORT ?? process.env.PORT ?? 3000);
const API_PORT = Number(process.env.API_PORT ?? 8080);
const API_BASE = `http://localhost:${API_PORT}`;
const DIST_DIR = path.join(__dirname, "dist/public");

/* ── Social-bot User-Agent detection ─────────────────────────────── */
const BOT_PATTERN = /bot|crawl|slurp|spider|facebookexternalhit|facebot|twitterbot|linkedinbot|discordbot|telegrambot|whatsapp|slackbot|skypeuripreview|applebot|bingpreview|google|yandex|baidu|duckduckbot|embedly|outbrain|pinterest|flipboard|nuzzel|opengraph|vkshare|w3c_validator|zgrab|semrush|ahrefs|mj12bot|screaming/i;

function isBot(userAgent) {
  return BOT_PATTERN.test(userAgent ?? "");
}

/* ── MIME types ───────────────────────────────────────────────────── */
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js":   "application/javascript",
  ".mjs":  "application/javascript",
  ".css":  "text/css",
  ".json": "application/json",
  ".png":  "image/png",
  ".jpg":  "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg":  "image/svg+xml",
  ".ico":  "image/x-icon",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2":"font/woff2",
  ".ttf":  "font/ttf",
  ".mp4":  "video/mp4",
  ".webm": "video/webm",
};

/* ── Static file server ───────────────────────────────────────────── */
function serveStatic(res, filePath) {
  try {
    const ext  = path.extname(filePath).toLowerCase();
    const mime = MIME[ext] ?? "application/octet-stream";
    const data = fs.readFileSync(filePath);
    res.writeHead(200, { "Content-Type": mime, "Cache-Control": "public, max-age=86400" });
    res.end(data);
    return true;
  } catch {
    return false;
  }
}

/* ── Load index.html template ─────────────────────────────────────── */
function loadTemplate() {
  const p = path.join(DIST_DIR, "index.html");
  try { return fs.readFileSync(p, "utf-8"); } catch { return null; }
}

/* ── HTML escape ──────────────────────────────────────────────────── */
function esc(str) {
  return (str ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/* ── OG image catalogue ───────────────────────────────────────────── */
const OG_DEFAULT  = "/og-default.jpg";
const OG_ARTICLE  = "/og-article.jpg";
const OG_PRODUCT  = "/og-product.jpg";

/* ── Build absolute image URL ─────────────────────────────────────── */
function absImg(img, origin, fallback = OG_DEFAULT) {
  if (!img) return `${origin}${fallback}`;
  if (img.startsWith("http://") || img.startsWith("https://")) return img;
  return `${origin}${img.startsWith("/") ? "" : "/"}${img}`;
}

/* ── Inject OG meta tags into HTML template ───────────────────────── */
function injectMeta(template, meta, origin) {
  const {
    title       = "Phan Văn Thắng SWC — Tư duy tài chính thực chiến",
    description = "Hành trình từ kiểm soát dòng tiền đến xây dựng tài sản bền vững. Tư duy tài chính thực chiến, đầu tư có kỷ luật, tích sản dài hạn.",
    image       = OG_DEFAULT,
    url         = origin,
    type        = "website",
    publishedAt = null,
    author      = null,
    structuredData = null,
  } = meta;

  const siteName   = "Phan Văn Thắng SWC";
  const absImage   = absImg(image, origin, OG_DEFAULT);
  const pageTitle  = title.includes(siteName) ? title : `${title} | ${siteName}`;

  const ogTags = `
    <title>${esc(pageTitle)}</title>
    <meta name="description" content="${esc(description)}" />
    <meta name="robots" content="index, follow" />
    <meta property="og:type"         content="${esc(type)}" />
    <meta property="og:site_name"    content="${esc(siteName)}" />
    <meta property="og:locale"       content="vi_VN" />
    <meta property="og:title"        content="${esc(title)}" />
    <meta property="og:description"  content="${esc(description)}" />
    <meta property="og:image"        content="${esc(absImage)}" />
    <meta property="og:image:width"  content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:url"          content="${esc(url)}" />
    ${publishedAt ? `<meta property="article:published_time" content="${esc(publishedAt)}" />` : ""}
    ${author      ? `<meta property="article:author"         content="${esc(author)}" />` : ""}
    <meta name="twitter:card"        content="summary_large_image" />
    <meta name="twitter:site"        content="@ThangSWC" />
    <meta name="twitter:title"       content="${esc(title)}" />
    <meta name="twitter:description" content="${esc(description)}" />
    <meta name="twitter:image"       content="${esc(absImage)}" />
    <link rel="canonical"            href="${esc(url)}" />
    ${structuredData ? `<script type="application/ld+json">${JSON.stringify(structuredData)}</script>` : ""}`;

  return template
    .replace(/<title>[^<]*<\/title>/, "")
    .replace(/<meta\s+property="og:[^"]*"[^>]*>/g, "")
    .replace(/<meta\s+name="twitter:[^"]*"[^>]*>/g, "")
    .replace(/<meta\s+name="description"[^>]*>/g, "")
    .replace("</head>", `${ogTags}\n  </head>`);
}

/* ── Fetch page meta for a given URL path ─────────────────────────── */
async function fetchMeta(urlPath, origin) {
  const SITE_DEFAULTS = {
    title:       "Phan Văn Thắng SWC",
    description: "Hành trình từ kiểm soát dòng tiền đến xây dựng tài sản bền vững. Tư duy tài chính thực chiến, đầu tư có kỷ luật, tích sản dài hạn.",
    image:       OG_DEFAULT,
    url:         origin,
    type:        "website",
  };

  const newsMatch = urlPath.match(/^\/tin-tuc\/[^/]+\/([^/?#]+)/);
  if (newsMatch) {
    const slug = newsMatch[1];
    try {
      const r = await fetch(`${API_BASE}/api/news/posts/${slug}`, { signal: AbortSignal.timeout(4000) });
      if (r.ok) {
        const { post } = await r.json();
        if (post) {
          const title    = post.seoTitle ?? post.title;
          const rawDesc  = post.seoDescription ?? post.excerpt ?? "";
          const desc     = rawDesc.length > 155 ? rawDesc.slice(0, 152) + "…" : (rawDesc || SITE_DEFAULTS.description);
          const rawImage = post.featuredImageDisplay ?? post.featuredImage ?? null;
          const image    = rawImage || OG_ARTICLE;
          const absImage = absImg(image, origin, OG_ARTICLE);
          return {
            title, description: desc, image, url: `${origin}${urlPath}`, type: "article",
            publishedAt: post.publishedAt, author: post.authorName ?? "Phan Văn Thắng",
            structuredData: {
              "@context": "https://schema.org", "@type": "NewsArticle",
              "headline": title, "description": desc, "image": absImage,
              "datePublished": post.publishedAt ?? post.createdAt,
              "dateModified":  post.updatedAt ?? post.publishedAt ?? post.createdAt,
              "author": { "@type": "Person", "name": post.authorName ?? "Phan Văn Thắng", "url": origin },
              "publisher": { "@type": "Organization", "name": "Phan Văn Thắng SWC", "url": origin },
              "mainEntityOfPage": { "@type": "WebPage", "@id": `${origin}${urlPath}` },
            },
          };
        }
      }
    } catch { /* fallthrough */ }
    return { ...SITE_DEFAULTS, image: OG_ARTICLE, type: "article", url: `${origin}${urlPath}` };
  }

  const articleMatch = urlPath.match(/^\/bai-viet\/([^/?#]+)/);
  if (articleMatch) {
    const slug = articleMatch[1];
    try {
      const r = await fetch(`${API_BASE}/api/articles/${slug}`, { signal: AbortSignal.timeout(4000) });
      if (r.ok) {
        const { article } = await r.json();
        if (article) {
          const title   = article.seoTitle ?? article.title;
          const rawDesc = article.seoDescription ?? article.excerpt ?? "";
          const desc    = rawDesc.length > 155 ? rawDesc.slice(0, 152) + "…" : (rawDesc || SITE_DEFAULTS.description);
          const image   = article.ogImageUrl ?? article.coverImageUrl ?? OG_ARTICLE;
          return { title, description: desc, image, url: `${origin}${urlPath}`, type: "article", publishedAt: article.publishDate, author: "Phan Văn Thắng" };
        }
      }
    } catch { /* fallthrough */ }
    return { ...SITE_DEFAULTS, image: OG_ARTICLE, type: "article", url: `${origin}${urlPath}` };
  }

  const PRODUCT_META = {
    "/san-pham/swc-pass": { title: "SWC Pass — Quyền truy cập có cấu trúc vào hệ sinh thái SWC", description: "SWC Pass là lớp truy cập nền tảng vào hệ sinh thái SWC — tài liệu có hệ thống, cộng đồng thực chiến và các lớp giá trị mở rộng." },
    "/san-pham/con-duong-1-trieu-do": { title: "Con đường 1 triệu đô — Lộ trình tích sản bền vững", description: "Hành trình thực chiến từ 0 đến tích sản 7 chữ số: kiểm soát dòng tiền, đầu tư có kỷ luật, xây dựng tài sản bền vững từng bước." },
    "/san-pham/atlas": { title: "SWC Atlas — Bản đồ tri thức tài chính cá nhân", description: "Hệ thống tri thức tài chính cá nhân được tổ chức có cấu trúc — từ tư duy nền tảng đến chiến lược tích sản thực chiến của Phan Văn Thắng." },
  };
  for (const [prefix, pm] of Object.entries(PRODUCT_META)) {
    if (urlPath.startsWith(prefix)) return { ...pm, image: OG_PRODUCT, url: `${origin}${urlPath}`, type: "website" };
  }

  const PAGE_META = {
    "/": { title: "Phan Văn Thắng SWC — Tư duy tài chính thực chiến", description: "Hành trình từ kiểm soát dòng tiền đến xây dựng tài sản bền vững. Tư duy tài chính thực chiến, đầu tư có kỷ luật, tích sản dài hạn." },
    "/gioi-thieu": { title: "Giới thiệu — Phan Văn Thắng SWC", description: "Phan Văn Thắng — người đồng hành thực chiến trên hành trình tài chính cá nhân, đầu tư có kỷ luật và sống có chủ đích." },
    "/lien-he": { title: "Liên hệ — Phan Văn Thắng SWC", description: "Kết nối với Phan Văn Thắng SWC. Đặt câu hỏi, nhận tư vấn hoặc tìm hiểu thêm về hành trình đồng hành tài chính." },
    "/cong-dong": { title: "Cộng đồng SWC — Kết nối thực chiến", description: "Tham gia cộng đồng SWC — nơi kết nối những người đang xây dựng tài sản bền vững với tư duy thực chiến và kỷ luật dài hạn." },
    "/kien-thuc": { title: "Kho kiến thức — Phan Văn Thắng SWC", description: "Thư viện tri thức tài chính cá nhân, đầu tư và tích sản từ Phan Văn Thắng. Nội dung có hệ thống, thực chiến và dài hạn." },
    "/tin-tuc": { title: "Bài viết — Phan Văn Thắng SWC", description: "Chia sẻ tư duy đầu tư, tài chính cá nhân và hành trình tích sản dài hạn. Phân tích thực chiến từ Phan Văn Thắng." },
    "/video": { title: "Video — Phan Văn Thắng SWC", description: "Thư viện video về tài chính cá nhân, đầu tư và tích sản từ Phan Văn Thắng. Nội dung thực chiến, có hệ thống." },
    "/san-pham": { title: "Sản phẩm — Phan Văn Thắng SWC", description: "Hệ sinh thái sản phẩm SWC: từ tài liệu nền tảng đến chương trình đồng hành tích sản thực chiến." },
  };
  for (const [prefix, pm] of Object.entries(PAGE_META)) {
    if (urlPath === prefix || urlPath.startsWith(prefix === "/" ? "/#" : prefix)) {
      return { ...pm, image: OG_DEFAULT, url: `${origin}${urlPath}`, type: "website" };
    }
  }

  return { ...SITE_DEFAULTS, url: `${origin}${urlPath}` };
}

/* ── HTTP server ──────────────────────────────────────────────────── */
const server = http.createServer(async (req, res) => {
  const urlPath = req.url?.split("?")[0] ?? "/";

  if (urlPath !== "/" && path.extname(urlPath)) {
    const filePath = path.join(DIST_DIR, urlPath);
    if (serveStatic(res, filePath)) return;
  }

  const template = loadTemplate();
  if (!template) {
    res.writeHead(503, { "Content-Type": "text/plain" });
    res.end("Build not found. Run `pnpm build` first.");
    return;
  }

  const ua     = req.headers["user-agent"] ?? "";
  const origin = `https://${req.headers.host ?? "phanvanthang.net"}`;

  if (isBot(ua)) {
    try {
      const meta = await fetchMeta(urlPath, origin);
      const html = injectMeta(template, meta, origin);
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
      res.end(html);
    } catch {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(template);
    }
    return;
  }

  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache" });
  res.end(template);
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`[pvt-swc] Production server listening on port ${PORT}`);
  console.log(`[pvt-swc] Serving from ${DIST_DIR}`);
  console.log(`[pvt-swc] API target: ${API_BASE}`);
});
