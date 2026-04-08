import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import express, { type Express, type Request, type Response } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { UPLOAD_DIR } from "./lib/storage";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);

const allowedOrigins = process.env.ALLOWED_ORIGINS;
app.use(
  cors({
    origin: allowedOrigins
      ? allowedOrigins.split(",").map((o) => o.trim())
      : true,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Serve uploaded files from local filesystem ────────────────────────────
app.use(
  "/api/uploads",
  express.static(UPLOAD_DIR, {
    maxAge:       "7d",
    etag:         true,
    lastModified: true,
    index:        false,
    setHeaders(res) {
      res.setHeader("Cache-Control", "public, max-age=604800, stale-while-revalidate=86400");
    },
  })
);

app.get("/api/uploads", (_req, res) => {
  res.redirect("/api/admin/media/disk");
});

app.use("/api", router);

// ── Production SPA serving ─────────────────────────────────────────────────
// Phục vụ frontend build (dist/public/) kèm SPA catch-all và OG meta cho bot.
// Hoạt động khi chạy qua Passenger (Plesk/CloudLinux) — toàn bộ traffic đi
// qua một Express process duy nhất, không cần server.mjs riêng.

// fileURLToPath(import.meta.url) = đường dẫn tuyệt đối của dist/index.mjs
// → DIST_DIR = dist/ → DIST_PUBLIC = dist/public/
// Đáng tin cậy hơn process.cwd() khi Passenger thay đổi working directory
const _DIST_DIR   = path.dirname(fileURLToPath(import.meta.url));
const DIST_PUBLIC = process.env.DIST_PUBLIC_DIR ?? path.join(_DIST_DIR, "public");

// Serve static assets (JS, CSS, images…) với cache dài hạn
app.use(
  express.static(DIST_PUBLIC, {
    maxAge:       "1y",
    etag:         true,
    lastModified: true,
    index:        false,
  })
);

// ── Social-bot detection ───────────────────────────────────────────────────
const BOT_RE =
  /bot|crawl|slurp|spider|facebookexternalhit|facebot|twitterbot|linkedinbot|discordbot|telegrambot|whatsapp|slackbot|skypeuripreview|applebot|bingpreview|google|yandex|baidu|duckduckbot|embedly|outbrain|pinterest|flipboard|nuzzel|opengraph|vkshare|zgrab|semrush|ahrefs|mj12bot|screaming/i;

function isBot(ua: string): boolean {
  return BOT_RE.test(ua);
}

// ── HTML escape ────────────────────────────────────────────────────────────
function esc(str: string): string {
  return (str ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// ── OG meta injection ──────────────────────────────────────────────────────
const SITE_NAME    = "Phan Văn Thắng SWC";
const SITE_DESC    = "Hành trình từ kiểm soát dòng tiền đến xây dựng tài sản bền vững. Tư duy tài chính thực chiến, đầu tư có kỷ luật, tích sản dài hạn.";
const OG_DEFAULT   = "/og-default.jpg";
const OG_ARTICLE   = "/og-article.jpg";
const OG_PRODUCT   = "/og-product.jpg";

function absImg(img: string | null | undefined, origin: string, fallback = OG_DEFAULT): string {
  if (!img) return `${origin}${fallback}`;
  if (img.startsWith("http://") || img.startsWith("https://")) return img;
  return `${origin}${img.startsWith("/") ? "" : "/"}${img}`;
}

interface OgMeta {
  title?: string;
  description?: string;
  image?: string | null;
  url?: string;
  type?: string;
  publishedAt?: string | null;
  author?: string | null;
  structuredData?: object | null;
}

function injectMeta(template: string, meta: OgMeta, origin: string): string {
  const {
    title       = SITE_NAME,
    description = SITE_DESC,
    image       = OG_DEFAULT,
    url         = origin,
    type        = "website",
    publishedAt = null,
    author      = null,
    structuredData = null,
  } = meta;

  const absImage  = absImg(image, origin);
  const pageTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;

  const tags = `
    <title>${esc(pageTitle)}</title>
    <meta name="description" content="${esc(description)}" />
    <meta name="robots" content="index, follow" />
    <meta property="og:type"         content="${esc(type)}" />
    <meta property="og:site_name"    content="${esc(SITE_NAME)}" />
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
    .replace("</head>", `${tags}\n  </head>`);
}

// ── Per-route OG meta lookup ───────────────────────────────────────────────
async function fetchOgMeta(urlPath: string, origin: string): Promise<OgMeta> {
  const defaults: OgMeta = {
    title: SITE_NAME, description: SITE_DESC, image: OG_DEFAULT, url: `${origin}${urlPath}`, type: "website",
  };

  // /tin-tuc/<category>/<slug>
  const newsMatch = urlPath.match(/^\/tin-tuc\/[^/]+\/([^/?#]+)/);
  if (newsMatch) {
    const slug = newsMatch[1];
    try {
      const r = await fetch(`${origin}/api/news/posts/${slug}`, { signal: AbortSignal.timeout(3000) });
      if (r.ok) {
        const { post } = await r.json() as { post?: Record<string, string> };
        if (post) {
          const title    = post["seoTitle"] ?? post["title"];
          const rawDesc  = post["seoDescription"] ?? post["excerpt"] ?? "";
          const desc     = rawDesc.length > 155 ? rawDesc.slice(0, 152) + "…" : (rawDesc || SITE_DESC);
          const rawImage = post["featuredImageDisplay"] ?? post["featuredImage"] ?? null;
          return {
            title, description: desc, image: rawImage || OG_ARTICLE,
            url: `${origin}${urlPath}`, type: "article",
            publishedAt: post["publishedAt"],
            author: post["authorName"] ?? "Phan Văn Thắng",
            structuredData: {
              "@context": "https://schema.org", "@type": "NewsArticle",
              headline: title, description: desc,
              image: absImg(rawImage, origin, OG_ARTICLE),
              datePublished: post["publishedAt"] ?? post["createdAt"],
              dateModified:  post["updatedAt"]   ?? post["publishedAt"] ?? post["createdAt"],
              author: { "@type": "Person", name: post["authorName"] ?? "Phan Văn Thắng", url: origin },
              publisher: { "@type": "Organization", name: SITE_NAME, url: origin },
              mainEntityOfPage: { "@type": "WebPage", "@id": `${origin}${urlPath}` },
            },
          };
        }
      }
    } catch { /* timeout / network error — dùng defaults */ }
    return { ...defaults, image: OG_ARTICLE, type: "article", url: `${origin}${urlPath}` };
  }

  // /bai-viet/<slug>
  const articleMatch = urlPath.match(/^\/bai-viet\/([^/?#]+)/);
  if (articleMatch) {
    const slug = articleMatch[1];
    try {
      const r = await fetch(`${origin}/api/articles/${slug}`, { signal: AbortSignal.timeout(3000) });
      if (r.ok) {
        const { article } = await r.json() as { article?: Record<string, string> };
        if (article) {
          const title   = article["seoTitle"] ?? article["title"];
          const rawDesc = article["seoDescription"] ?? article["excerpt"] ?? "";
          const desc    = rawDesc.length > 155 ? rawDesc.slice(0, 152) + "…" : (rawDesc || SITE_DESC);
          return {
            title, description: desc, image: article["ogImageUrl"] ?? article["coverImageUrl"] ?? OG_ARTICLE,
            url: `${origin}${urlPath}`, type: "article",
            publishedAt: article["publishDate"], author: "Phan Văn Thắng",
          };
        }
      }
    } catch { /* timeout */ }
    return { ...defaults, image: OG_ARTICLE, type: "article", url: `${origin}${urlPath}` };
  }

  // /san-pham/*
  const PRODUCT_META: Record<string, { title: string; description: string }> = {
    "/san-pham/swc-pass":             { title: "SWC Pass — Quyền truy cập có cấu trúc vào hệ sinh thái SWC",      description: "SWC Pass là lớp truy cập nền tảng vào hệ sinh thái SWC — tài liệu có hệ thống, cộng đồng thực chiến và các lớp giá trị mở rộng." },
    "/san-pham/con-duong-1-trieu-do": { title: "Con đường 1 triệu đô — Lộ trình tích sản bền vững",               description: "Hành trình thực chiến từ 0 đến tích sản 7 chữ số: kiểm soát dòng tiền, đầu tư có kỷ luật, xây dựng tài sản bền vững từng bước." },
    "/san-pham/atlas":                { title: "SWC Atlas — Bản đồ tri thức tài chính cá nhân",                   description: "Hệ thống tri thức tài chính cá nhân được tổ chức có cấu trúc — từ tư duy nền tảng đến chiến lược tích sản thực chiến của Phan Văn Thắng." },
  };
  for (const [prefix, pm] of Object.entries(PRODUCT_META)) {
    if (urlPath.startsWith(prefix))
      return { ...pm, image: OG_PRODUCT, url: `${origin}${urlPath}`, type: "website" };
  }

  // Các trang cố định
  const PAGE_META: Record<string, { title: string; description: string }> = {
    "/":          { title: `${SITE_NAME} — Tư duy tài chính thực chiến`,                   description: SITE_DESC },
    "/gioi-thieu":{ title: `Giới thiệu — ${SITE_NAME}`,                                    description: "Phan Văn Thắng — người đồng hành thực chiến trên hành trình tài chính cá nhân, đầu tư có kỷ luật và sống có chủ đích." },
    "/lien-he":   { title: `Liên hệ — ${SITE_NAME}`,                                       description: "Kết nối với Phan Văn Thắng SWC. Đặt câu hỏi, nhận tư vấn hoặc tìm hiểu thêm về hành trình đồng hành tài chính." },
    "/cong-dong": { title: `Cộng đồng SWC — Kết nối thực chiến`,                           description: "Tham gia cộng đồng SWC — nơi kết nối những người đang xây dựng tài sản bền vững với tư duy thực chiến và kỷ luật dài hạn." },
    "/kien-thuc": { title: `Kho kiến thức — ${SITE_NAME}`,                                 description: "Thư viện tri thức tài chính cá nhân, đầu tư và tích sản từ Phan Văn Thắng. Nội dung có hệ thống, thực chiến và dài hạn." },
    "/tin-tuc":   { title: `Bài viết — ${SITE_NAME}`,                                      description: "Chia sẻ tư duy đầu tư, tài chính cá nhân và hành trình tích sản dài hạn. Phân tích thực chiến từ Phan Văn Thắng." },
    "/video":     { title: `Video — ${SITE_NAME}`,                                          description: "Thư viện video về tài chính cá nhân, đầu tư và tích sản từ Phan Văn Thắng. Nội dung thực chiến, có hệ thống." },
    "/san-pham":  { title: `Sản phẩm — ${SITE_NAME}`,                                      description: "Hệ sinh thái sản phẩm SWC: từ tài liệu nền tảng đến chương trình đồng hành tích sản thực chiến." },
  };
  for (const [prefix, pm] of Object.entries(PAGE_META)) {
    if (urlPath === prefix || (prefix !== "/" && urlPath.startsWith(prefix)))
      return { ...pm, image: OG_DEFAULT, url: `${origin}${urlPath}`, type: "website" };
  }

  return defaults;
}

// ── SPA catch-all ──────────────────────────────────────────────────────────
app.get(/.*/, async (req: Request, res: Response) => {
  const indexPath = path.join(DIST_PUBLIC, "index.html");

  let template: string;
  try {
    template = fs.readFileSync(indexPath, "utf-8");
  } catch {
    res.status(503).send("Build not found. Run `npm run build` first.");
    return;
  }

  const ua     = (req.headers["user-agent"] ?? "") as string;
  const proto  = (req.headers["x-forwarded-proto"] as string) ?? req.protocol ?? "https";
  const host   = (req.headers["x-forwarded-host"] as string) ?? req.headers.host ?? process.env.SITE_URL?.replace(/^https?:\/\//, "") ?? "phanvanthang.net";
  const origin = `${proto}://${host}`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");

  if (isBot(ua)) {
    try {
      const urlPath = req.path;
      const meta    = await fetchOgMeta(urlPath, origin);
      const html    = injectMeta(template, meta, origin);
      res.setHeader("Cache-Control", "no-store");
      res.send(html);
      return;
    } catch {
      // fallthrough to plain index.html
    }
  }

  res.setHeader("Cache-Control", "no-cache");
  res.send(template);
});

export default app;
