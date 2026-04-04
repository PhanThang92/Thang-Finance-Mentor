import type { NewsPost } from "./newsApi";

/* ── Fallback images mapped to context ──────────────────── */
const FALLBACKS = {
  atlas:       "/images/fallback-atlas.svg",
  "road-to-1m": "/images/fallback-road-to-1m.svg",
  "tu-duy-dau-tu": "/images/fallback-tu-duy.svg",
  default:     "/images/fallback-default.svg",
} as const;

/**
 * Returns the best image URL for a post.
 * Priority:
 *   1. post.featuredImage (if set)
 *   2. product-based fallback (atlas → ATLAS image, road-to-1m → Road image)
 *   3. category-based fallback (tu-duy-dau-tu → Tư duy image)
 *   4. general default fallback
 */
export function getPostImage(post: Pick<NewsPost, "featuredImage" | "product" | "category">): string {
  if (post.featuredImage) return post.featuredImage;

  const productSlug = post.product?.slug ?? "";
  if (productSlug === "atlas") return FALLBACKS.atlas;
  if (productSlug === "road-to-1m") return FALLBACKS["road-to-1m"];

  const catSlug = post.category?.slug ?? "";
  if (catSlug === "tu-duy-dau-tu") return FALLBACKS["tu-duy-dau-tu"];

  return FALLBACKS.default;
}

/** Returns true if the image is a generated fallback (not a real photo) */
export function isFallbackImage(post: Pick<NewsPost, "featuredImage">): boolean {
  return !post.featuredImage;
}
