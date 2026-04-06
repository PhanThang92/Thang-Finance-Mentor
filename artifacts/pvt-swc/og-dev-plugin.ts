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
  /bot|crawl|slurp|spider|facebookexternalhit|facebot|twitterbot|linkedinbot|discordbot|telegrambot|whatsapp|slackbot|applebot|bingpreview|google|yandex|vkshare|zgrab|semrush|ahrefs/i;

function isBot(ua: string): boolean {
  return BOT_PATTERN.test(ua);
}

function esc(str: string): string {
  return (str ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function absImg(img: string | null | undefined, origin: string): string {
  if (!img) return `${origin}/opengraph.jpg`;
  if (img.startsWith("http://") || img.startsWith("https://")) return img;
  return `${origin}${img.startsWith("/") ? "" : "/"}${img}`;
}

async function fetchMeta(urlPath: string, origin: string): Promise<Record<string, string | null>> {
  const API_PORT = process.env.API_PORT ?? process.env.VITE_API_PORT ?? "8080";
  const API_BASE = `http://localhost:${API_PORT}`;

  const DEFAULTS = {
    title: "Phan Văn Thắng SWC — Tư duy tài chính thực chiến",
    description: "Tư duy tài chính thực chiến, tích sản dài hạn, đầu tư có kỷ luật. Hệ sinh thái tri thức từ Phan Văn Thắng.",
    image: `${origin}/opengraph.jpg`,
    url: `${origin}${urlPath}`,
    type: "website",
    publishedAt: null,
    author: null,
  };

  const newsMatch = urlPath.match(/^\/tin-tuc\/[^/]+\/([^/?#]+)/);
  if (newsMatch) {
    try {
      const r = await fetch(`${API_BASE}/api/news/posts/${newsMatch[1]}`, { signal: AbortSignal.timeout(4000) });
      if (r.ok) {
        const { post } = await r.json();
        if (post) {
          return {
            title: post.seoTitle ?? post.title,
            description: post.seoDescription ?? post.excerpt ?? DEFAULTS.description,
            image: absImg(post.featuredImageDisplay ?? post.featuredImage, origin),
            url: `${origin}${urlPath}`,
            type: "article",
            publishedAt: post.publishedAt ?? null,
            author: post.authorName ?? "Phan Văn Thắng",
          };
        }
      }
    } catch { /* fallthrough */ }
  }

  const articleMatch = urlPath.match(/^\/bai-viet\/([^/?#]+)/);
  if (articleMatch) {
    try {
      const r = await fetch(`${API_BASE}/api/articles/${articleMatch[1]}`, { signal: AbortSignal.timeout(4000) });
      if (r.ok) {
        const { article } = await r.json();
        if (article) {
          return {
            title: article.seoTitle ?? article.title,
            description: article.seoDescription ?? article.excerpt ?? DEFAULTS.description,
            image: absImg(article.ogImageUrl ?? article.coverImageUrl, origin),
            url: `${origin}${urlPath}`,
            type: "article",
            publishedAt: article.publishDate ?? null,
            author: "Phan Văn Thắng",
          };
        }
      }
    } catch { /* fallthrough */ }
  }

  const PAGE_META: Record<string, { title: string; description: string }> = {
    "/":              { title: "Tư duy tài chính thực chiến",    description: "Hành trình từ kiểm soát dòng tiền đến xây dựng tài sản bền vững." },
    "/tin-tuc":       { title: "Tin tức & Bài viết",              description: "Chia sẻ tư duy đầu tư, tài chính cá nhân và hành trình tích sản dài hạn." },
    "/bai-viet":      { title: "Kho kiến thức",                   description: "Thư viện tri thức tài chính cá nhân, đầu tư và tích sản." },
    "/video":         { title: "Video — Phan Văn Thắng SWC",      description: "Thư viện video về tài chính cá nhân và tích sản." },
    "/gioi-thieu":    { title: "Giới thiệu",                      description: "Phan Văn Thắng — người đồng hành thực chiến trên hành trình tài chính cá nhân." },
    "/lien-he":       { title: "Liên hệ",                         description: "Kết nối với Phan Văn Thắng SWC." },
    "/cong-dong":     { title: "Cộng đồng SWC",                   description: "Tham gia cộng đồng SWC — kết nối những người xây dựng tài sản bền vững." },
    "/san-pham/swc-pass":               { title: "SWC Pass", description: "Quyền truy cập có cấu trúc vào hệ sinh thái SWC." },
    "/san-pham/con-duong-1-trieu-do":   { title: "Con đường 1 triệu đô", description: "Lộ trình tích sản bền vững từ Phan Văn Thắng." },
    "/san-pham/atlas":                  { title: "SWC Atlas", description: "Bản đồ tri thức tài chính cá nhân của Phan Văn Thắng." },
  };

  for (const [prefix, pm] of Object.entries(PAGE_META)) {
    if (urlPath === prefix || urlPath.startsWith(prefix + "/") || urlPath.startsWith(prefix + "?")) {
      return { ...DEFAULTS, ...pm, image: `${origin}/opengraph.jpg`, url: `${origin}${urlPath}` };
    }
  }

  return DEFAULTS;
}

function injectMeta(html: string, meta: Record<string, string | null>, origin: string): string {
  const { title, description, image, url, type, publishedAt, author } = meta;
  const siteName  = "Phan Văn Thắng SWC";
  const pageTitle = (title ?? "").includes(siteName) ? title : `${title} | ${siteName}`;
  const absImage  = image ?? `${origin}/opengraph.jpg`;

  const tags = `
    <title>${esc(pageTitle ?? "")}</title>
    <meta name="description" content="${esc(description ?? "")}" />
    <meta property="og:type"         content="${esc(type ?? "website")}" />
    <meta property="og:site_name"    content="${esc(siteName)}" />
    <meta property="og:locale"       content="vi_VN" />
    <meta property="og:title"        content="${esc(title ?? "")}" />
    <meta property="og:description"  content="${esc(description ?? "")}" />
    <meta property="og:image"        content="${esc(absImage)}" />
    <meta property="og:image:width"  content="1280" />
    <meta property="og:image:height" content="720" />
    <meta property="og:url"          content="${esc(url ?? "")}" />
    ${publishedAt ? `<meta property="article:published_time" content="${esc(publishedAt)}" />` : ""}
    ${author ? `<meta property="article:author" content="${esc(author)}" />` : ""}
    <meta name="twitter:card"        content="summary_large_image" />
    <meta name="twitter:site"        content="@ThangSWC" />
    <meta name="twitter:title"       content="${esc(title ?? "")}" />
    <meta name="twitter:description" content="${esc(description ?? "")}" />
    <meta name="twitter:image"       content="${esc(absImage)}" />`;

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
          const meta        = await fetchMeta(urlPath, origin);
          const template    = await server.transformIndexHtml(urlPath, fs.readFileSync(path.resolve("index.html"), "utf-8"));
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
