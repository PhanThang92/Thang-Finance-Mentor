/**
 * videos.ts — Content access layer for Videos
 *
 * All public video data is fetched from the API server (/api/content/videos).
 * These functions are the single entry-point for video data on the frontend.
 * The underlying source is the `videos` PostgreSQL table.
 *
 * Upgrade path: swap the fetch base URL or add auth headers here when needed.
 * Fallback: on fetch failure, empty arrays are returned so the UI never breaks.
 */

/* ── Shared type ── */
export interface Video {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  youtubeUrl: string;
  youtubeVideoId: string | null;
  thumbnailUrl: string | null;
  thumbnailAlt: string | null;
  thumbnailGradient: string | null;
  duration: string | null;
  publishDate: string | null;
  featured: boolean;
  isFeaturedVideo: boolean;
  status: string;
  topicSlug: string | null;
  seriesSlug: string | null;
  categories: string[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface VideoListResponse {
  videos: Video[];
}

/* ── Default thumbnail gradient ── */
const DEFAULT_GRADIENT = "linear-gradient(145deg, #0c2622 0%, #124540 55%, #1a6258 100%)";

export function videoGradient(v: Video): string {
  return v.thumbnailGradient ?? DEFAULT_GRADIENT;
}

/* ── Base URL helper ── */
function apiUrl(path: string) {
  return `/api/content${path}`;
}

/* ── Fetch helpers ── */

/**
 * Fetch all published videos, newest first.
 * Optionally filter by category or keyword.
 */
export async function getPublishedVideos(opts?: {
  category?: string;
  q?: string;
  limit?: number;
}): Promise<Video[]> {
  try {
    const params = new URLSearchParams({ status: "published" });
    if (opts?.category) params.set("category", opts.category);
    if (opts?.q) params.set("q", opts.q);
    if (opts?.limit) params.set("limit", String(opts.limit));
    const res = await fetch(apiUrl(`/videos?${params}`));
    if (!res.ok) return [];
    const data: VideoListResponse = await res.json();
    return data.videos ?? [];
  } catch {
    return [];
  }
}

/**
 * Fetch the single featured homepage video (is_featured_video = true).
 * Falls back to the latest featured video, then the latest published video.
 */
export async function getFeaturedVideo(): Promise<Video | null> {
  try {
    const params = new URLSearchParams({ status: "published", is_featured_video: "true", limit: "1" });
    const res = await fetch(apiUrl(`/videos?${params}`));
    if (!res.ok) return null;
    const data: VideoListResponse = await res.json();
    if (data.videos.length > 0) return data.videos[0];

    // fallback 1: featured = true
    const featured = await getPublishedVideos({ limit: 1 });
    if (featured.length > 0) return featured[0];
    return null;
  } catch {
    return null;
  }
}

/**
 * Fetch published videos for the homepage YouTube section (not the main featured one).
 */
export async function getHomepageVideos(count = 3): Promise<Video[]> {
  try {
    const all = await getPublishedVideos({ limit: 10 });
    return all.filter((v) => !v.isFeaturedVideo).slice(0, count);
  } catch {
    return [];
  }
}

/**
 * Fetch published videos filtered by category slug.
 * Pass "featured" to get featured videos; pass "all" or undefined for all.
 */
export async function getVideosByCategory(category?: string): Promise<Video[]> {
  if (!category || category === "all") {
    return getPublishedVideos();
  }
  if (category === "featured") {
    return getPublishedVideos({ category: "featured" });
  }
  return getPublishedVideos({ category });
}

/**
 * Search published videos by keyword.
 */
export async function searchVideos(q: string, limit = 20): Promise<Video[]> {
  return getPublishedVideos({ q, limit });
}

/**
 * Fetch a single published video by slug.
 */
export async function getVideoBySlug(slug: string): Promise<Video | null> {
  try {
    const res = await fetch(apiUrl(`/videos/${encodeURIComponent(slug)}`));
    if (!res.ok) return null;
    const data = await res.json();
    return data.video ?? null;
  } catch {
    return null;
  }
}

/* ── Formatting helpers ── */

export function formatVideoDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("vi-VN", { day: "numeric", month: "long", year: "numeric" });
}
