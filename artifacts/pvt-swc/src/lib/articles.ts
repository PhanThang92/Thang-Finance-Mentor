/**
 * articles.ts — Content access layer for Articles
 *
 * All public article data is fetched from the API server (/api/content/articles).
 * These functions are the single entry-point for article data on the frontend.
 * The underlying source is the `articles` PostgreSQL table.
 *
 * Upgrade path: swap the fetch base URL or add auth headers here when needed.
 * Fallback: on fetch failure, an empty array / null is returned so the UI
 * never breaks — it shows the "Nội dung đang được cập nhật" empty state.
 */

/* ── Shared type ── */
export interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  coverImageUrl: string | null;
  coverImageAlt: string | null;
  coverThumbnailUrl: string | null;
  category: string | null;
  categorySlug: string | null;
  tags: string[] | null;
  publishDate: string | null;
  featured: boolean;
  status: string;
  readingTime: string | null;
  topicSlug: string | null;
  seriesSlug: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImageUrl: string | null;
  canonicalUrl: string | null;
  noindex: boolean;
  showOnHomepage: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ArticleListResponse {
  articles: Article[];
}

export interface ArticleDetailResponse {
  article: Article;
  related: Article[];
}

/* ── Base URL helper ── */
function apiUrl(path: string) {
  return `/api/content${path}`;
}

/* ── Fetch helpers ── */

/**
 * Fetch all published articles, newest first.
 * Optionally filter by category slug or keyword.
 */
export async function getPublishedArticles(opts?: {
  category?: string;
  q?: string;
  limit?: number;
}): Promise<Article[]> {
  try {
    const params = new URLSearchParams({ status: "published" });
    if (opts?.category) params.set("category", opts.category);
    if (opts?.q) params.set("q", opts.q);
    if (opts?.limit) params.set("limit", String(opts.limit));
    const res = await fetch(apiUrl(`/articles?${params}`));
    if (!res.ok) return [];
    const data: ArticleListResponse = await res.json();
    return data.articles ?? [];
  } catch {
    return [];
  }
}

/**
 * Fetch featured published articles (featured = true).
 * Falls back to the latest published articles if none are marked featured.
 */
export async function getFeaturedArticles(count = 3): Promise<Article[]> {
  try {
    const params = new URLSearchParams({ status: "published", featured: "true", limit: String(count) });
    const res = await fetch(apiUrl(`/articles?${params}`));
    if (!res.ok) return [];
    const data: ArticleListResponse = await res.json();
    if (data.articles.length > 0) return data.articles.slice(0, count);

    // fallback: latest published
    return getPublishedArticles({ limit: count });
  } catch {
    return [];
  }
}

/**
 * Fetch a single published article by slug.
 * Returns null if not found.
 */
export async function getArticleBySlug(slug: string): Promise<ArticleDetailResponse | null> {
  try {
    const res = await fetch(apiUrl(`/articles/${encodeURIComponent(slug)}`));
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Search published articles by keyword.
 */
export async function searchArticles(q: string, limit = 20): Promise<Article[]> {
  return getPublishedArticles({ q, limit });
}

/* ── Formatting helpers ── */

/** Format a publish_date string to Vietnamese date (e.g. "10 tháng 1, 2024"). */
export function formatArticleDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("vi-VN", { day: "numeric", month: "long", year: "numeric" });
}

/** Short format: "10/01/2024" */
export function formatArticleDateShort(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("vi-VN");
}
