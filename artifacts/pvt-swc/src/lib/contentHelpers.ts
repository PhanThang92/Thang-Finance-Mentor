/* ══════════════════════════════════════════════
   CONTENT HELPERS
   Lightweight service layer for filtering,
   sorting, and querying content collections.
   Upgrade path: replace local imports with
   API / database fetch calls while keeping
   the same function signatures.
══════════════════════════════════════════════ */

export { getFeaturedVideo, getHomepageVideos, getVideosByCategory, searchVideos } from "@/content/videosData";
export { getFeaturedSeries, getSeriesBySlug }                                     from "@/content/seriesData";
export { getFeaturedArticles, getLatestArticles, getArticleBySlug }               from "@/content/articlesData";
export { getFeaturedNews, getLatestNews }                                          from "@/content/newsData";

/** Format a ISO date string to Vietnamese short date (DD/MM/YYYY). */
export function formatDateVN(isoDate: string): string {
  try {
    const d = new Date(isoDate);
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  } catch {
    return isoDate;
  }
}

/** Estimate reading time from content length. */
export function estimateReadingTime(content: string, wpm = 200): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wpm));
}
