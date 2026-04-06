/**
 * Vite dev-server plugin: OG prerender for social-media bots.
 *
 * When a crawler (Facebook, Zalo, LinkedIn, etc.) hits the Vite dev server,
 * this middleware intercepts the request, fetches page-specific meta from the
 * API, injects OG tags into the HTML template, and returns the enriched HTML.
 *
 * Regular browser requests pass through untouched.
 */

import type { Plugin, ViteDevServer } from "vite";
import type { IncomingMessage, ServerResponse } from "http";
import fs from "fs";
import path from "path";

const BOT_PATTERN =
  /bot|crawl|slurp|spider|facebookexternalhit|facebot|twitterbot|linkedinbot|discordbot|telegrambot|whatsapp|slackbot|applebot|bingpreview|google|yandex|vkshare|zgrab|semrush|ahrefs|skypeuripreview|pinterest|flipboard|opengraph/i;

function isBot(ua: string): boolean {
  return BOT_PATTERN.test(ua);
}

function esc(str: string): string {
  return (str ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/* ── OG image catalogue (must match public/ filenames) ─────────────── */
const OG_DEFAULT = "/og-default.jpg";
const OG_ARTICLE = "/og-article.jpg";
const OG_PRODUCT = "/og-product.jpg";

function absImg(img: string | null | undefined, origin: string, fallback = OG_DEFAULT): string {
  if (!img) return `${origin}${fallback}`;
  if (img.startsWith("http://") || img.startsWith("https://")) return img;
  return `${origin}${img.startsWith("/") ? "" : "/"}${img}`;
}

function clampDesc(s: string, max = 155): string {
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}

async function fetchMeta(urlPath: string, origin: string): Promise<Record<string, string | null>> {
  const API_PORT = process.env.API_PORT ?? process.env.VITE_API_PORT ?? "8080";
  const API_BASE = `http://localhost:${API_PORT}`;

  const DEFAULTS: Record<string, string | null> = {
    title:       "Phan Văn Thắng SWC",
    description: "Hành trình từ kiểm soát dòng tiền đến xây dựng tài sản bền vững. Tư duy tài chính thực chiến, đầu tư có kỷ luật, tích sản dài hạn.",
    image:       `${origin}${OG_DEFAULT}`,
    url:         `${origin}${urlPath}`,
    type:        "website",
    publishedAt: null,
    author:      null,
  };

  /* ── News article ─────────────────────────────────────────────────── */
  const newsMatch = urlPath.match(/^\/tin-tuc\/[^/]+\/([^/?#]+)/);
  if (newsMatch) {
    try {
      const r = await fetch(`${API_BASE}/api/news/posts/${newsMatch[1]}`, { signal: AbortSignal.timeout(4000) });
      if (r.ok) {
        const { post } = await r.json() as { post?: Record<string, string> };
        if (post) {
          const rawDesc  = post.seoDescription ?? post.excerpt ?? "";
          const rawImage = post.featuredImageDisplay ?? post.featuredImage ?? null;
          return {
            title:       post.seoTitle ?? post.title,
            description: clampDesc(rawDesc || DEFAULTS.description!),
            image:       absImg(rawImage, origin, OG_ARTICLE),
            url:         `${origin}${urlPath}`,
            type:        "article",
            publishedAt: post.publishedAt ?? null,
            author:      post.authorName ?? "Phan Văn Thắng",
          };
        }
      }
    } catch { /* fallthrough */ }
    // Path pattern matches but post not found — use article fallback
    return { ...DEFAULTS, image: `${origin}${OG_ARTICLE}`, type: "article" };
  }

  /* ── Knowledge base article ───────────────────────────────────────── */
  const articleMatch = urlPath.match(/^\/bai-viet\/([^/?#]+)/);
  if (articleMatch) {
    try {
      const r = await fetch(`${API_BASE}/api/articles/${articleMatch[1]}`, { signal: AbortSignal.timeout(4000) });
      if (r.ok) {
        const { article } = await r.json() as { article?: Record<string, string> };
        if (article) {
          const rawDesc  = article.seoDescription ?? article.excerpt ?? "";
          const rawImage = article.ogImageUrl ?? article.coverImageUrl ?? null;
          return {
            title:       article.seoTitle ?? article.title,
            description: clampDesc(rawDesc || DEFAULTS.description!),
            image:       absImg(rawImage, origin, OG_ARTICLE),
            url:         `${origin}${urlPath}`,
            type:        "article",
            publishedAt: article.publishDate ?? null,
            author:      "Phan Văn Thắng",
          };
        }
      }
    } catch { /* fallthrough */ }
    return { ...DEFAULTS, image: `${origin}${OG_ARTICLE}`, type: "article" };
  }

  /* ── Product pages ────────────────────────────────────────────────── */
  const PRODUCT_META: Record<string, { title: string; description: string }> = {
    "/san-pham/swc-pass": {
      title:       "SWC Pass — Quyền truy cập có cấu trúc vào hệ sinh thái SWC",
      description: "SWC Pass là lớp truy cập nền tảng vào hệ sinh thái SWC — tài liệu có hệ thống, cộng đồng thực chiến và các lớp giá trị mở rộng.",
    },
    "/san-pham/con-duong-1-trieu-do": {
      title:       "Con đường 1 triệu đô — Lộ trình tích sản bền vững",
      description: "Hành trình thực chiến từ 0 đến tích sản 7 chữ số: kiểm soát dòng tiền, đầu tư có kỷ luật, xây dựng tài sản bền vững từng bước.",
    },
    "/san-pham/atlas": {
      title:       "SWC Atlas — Bản đồ tri thức tài chính cá nhân",
      description: "Hệ thống tri thức tài chính cá nhân được tổ chức có cấu trúc — từ tư duy nền tảng đến chiến lược tích sản thực chiến của Phan Văn Thắng.",
    },
    "/san-pham": {
      title:       "Sản phẩm — Phan Văn Thắng SWC",
      description: "Hệ sinh thái sản phẩm SWC: từ tài liệu nền tảng đến chương trình đồng hành tích sản thực chiến.",
    },
  };

  for (const [prefix, pm] of Object.entries(PRODUCT_META)) {
    if (urlPath === prefix || urlPath.startsWith(prefix + "/")) {
      return { ...DEFAULTS, ...pm, image: `${origin}${OG_PRODUCT}`, url: `${origin}${urlPath}`, type: "website" };
    }
  }

  /* ── Page-specific defaults ───────────────────────────────────────── */
  const PAGE_META: Record<string, { title: string; description: string }> = {
    "/": {
      title:       "Phan Văn Thắng SWC — Tư duy tài chính thực chiến",
      description: "Hành trình từ kiểm soát dòng tiền đến xây dựng tài sản bền vững. Tư duy tài chính thực chiến, đầu tư có kỷ luật, tích sản dài hạn.",
    },
    "/gioi-thieu": {
      title:       "Giới thiệu — Phan Văn Thắng SWC",
      description: "Phan Văn Thắng — người đồng hành thực chiến trên hành trình tài chính cá nhân, đầu tư có kỷ luật và sống có chủ đích.",
    },
    "/lien-he": {
      title:       "Liên hệ — Phan Văn Thắng SWC",
      description: "Kết nối với Phan Văn Thắng SWC. Đặt câu hỏi, nhận tư vấn hoặc tìm hiểu thêm về hành trình đồng hành tài chính.",
    },
    "/cong-dong": {
      title:       "Cộng đồng SWC — Kết nối thực chiến",
      description: "Tham gia cộng đồng SWC — nơi kết nối những người đang xây dựng tài sản bền vững với tư duy thực chiến và kỷ luật dài hạn.",
    },
    "/kien-thuc": {
      title:       "Kho kiến thức — Phan Văn Thắng SWC",
      description: "Thư viện tri thức tài chính cá nhân, đầu tư và tích sản từ Phan Văn Thắng. Nội dung có hệ thống, thực chiến và dài hạn.",
    },
    "/tin-tuc": {
      title:       "Bài viết — Phan Văn Thắng SWC",
      description: "Chia sẻ tư duy đầu tư, tài chính cá nhân và hành trình tích sản dài hạn. Phân tích thực chiến từ Phan Văn Thắng.",
    },
    "/video": {
      title:       "Video — Phan Văn Thắng SWC",
      description: "Thư viện video về tài chính cá nhân, đầu tư và tích sản từ Phan Văn Thắng. Nội dung thực chiến, có hệ thống.",
    },
    "/tai-lieu": {
      title:       "Tài liệu — Phan Văn Thắng SWC",
      description: "Bộ tài liệu nền tảng về tài chính cá nhân, đầu tư và tích sản từ Phan Văn Thắng. Miễn phí và có hệ thống.",
    },
  };

  for (const [prefix, pm] of Object.entries(PAGE_META)) {
    if (urlPath === prefix || urlPath.startsWith(prefix === "/" ? "/#" : prefix + "/") || urlPath.startsWith(prefix + "?")) {
      return { ...DEFAULTS, ...pm, image: `${origin}${OG_DEFAULT}`, url: `${origin}${urlPath}`, type: "website" };
    }
  }

  return { ...DEFAULTS, url: `${origin}${urlPath}` };
}

function injectMeta(html: string, meta: Record<string, string | null>, origin: string): string {
  const { title, description, image, url, type, publishedAt, author } = meta;
  const siteName  = "Phan Văn Thắng SWC";
  const pageTitle = (title ?? "").includes(siteName) ? title : `${title} | ${siteName}`;
  const absImage  = image ?? `${origin}${OG_DEFAULT}`;

  const tags = `
    <title>${esc(pageTitle ?? "")}</title>
    <meta name="description" content="${esc(description ?? "")}" />
    <meta name="robots" content="index, follow" />
    <meta property="og:type"         content="${esc(type ?? "website")}" />
    <meta property="og:site_name"    content="${esc(siteName)}" />
    <meta property="og:locale"       content="vi_VN" />
    <meta property="og:title"        content="${esc(title ?? "")}" />
    <meta property="og:description"  content="${esc(description ?? "")}" />
    <meta property="og:image"        content="${esc(absImage)}" />
    <meta property="og:image:width"  content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:url"          content="${esc(url ?? "")}" />
    ${publishedAt ? `<meta property="article:published_time" content="${esc(publishedAt)}" />` : ""}
    ${author ? `<meta property="article:author" content="${esc(author)}" />` : ""}
    <meta name="twitter:card"        content="summary_large_image" />
    <meta name="twitter:site"        content="@ThangSWC" />
    <meta name="twitter:title"       content="${esc(title ?? "")}" />
    <meta name="twitter:description" content="${esc(description ?? "")}" />
    <meta name="twitter:image"       content="${esc(absImage)}" />
    <link rel="canonical"            href="${esc(url ?? "")}" />`;

  return html
    .replace(/<title>[^<]*<\/title>/, "")
    .replace(/(<meta\s+property="og:[^"]*"[^>]*>)/g, "")
    .replace(/(<meta\s+name="twitter:[^"]*"[^>]*>)/g, "")
    .replace(/(<meta\s+name="description"[^>]*>)/g, "")
    .replace("</head>", `${tags}\n  </head>`);
}

export function ogDevPlugin(): Plugin {
  return {
    name: "og-dev-prerender",
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
        const ua = req.headers["user-agent"] ?? "";
        if (!isBot(ua)) return next();

        const urlPath = (req.url ?? "/").split("?")[0];
        const host    = req.headers["host"] ?? "localhost";
        const origin  = host.startsWith("localhost") ? `http://${host}` : `https://${host}`;

        try {
          const meta         = await fetchMeta(urlPath, origin);
          const template     = await server.transformIndexHtml(urlPath, fs.readFileSync(path.resolve("index.html"), "utf-8"));
          const enrichedHtml = injectMeta(template, meta, origin);

          res.setHeader("Content-Type", "text/html; charset=utf-8");
          res.setHeader("Cache-Control", "no-store");
          res.statusCode = 200;
          res.end(enrichedHtml);
        } catch {
          next();
        }
      });
    },
  };
}
