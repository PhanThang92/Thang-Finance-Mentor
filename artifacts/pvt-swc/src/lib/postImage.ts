import type { NewsPost } from "./newsApi";

/* ── Curated fallback pools, one per content group ────────────────── */
const POOLS = {
  atlas: [
    "/images/fallback-atlas.svg",
    "/images/fallback-atlas-2.svg",
    "/images/fallback-atlas-3.svg",
  ],
  "road-to-1m": [
    "/images/fallback-road-to-1m.svg",
    "/images/fallback-road-to-1m-2.svg",
    "/images/fallback-road-to-1m-3.svg",
  ],
  "tu-duy-dau-tu": [
    "/images/fallback-tu-duy.svg",
    "/images/fallback-tu-duy-2.svg",
    "/images/fallback-tu-duy-3.svg",
  ],
  default: [
    "/images/fallback-default.svg",
    "/images/fallback-default-2.svg",
  ],
} as const;

/** Stable numeric hash of a string (djb2-lite, always ≥ 0) */
function hashStr(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = (((h << 5) + h) + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

/**
 * Pick one image from a pool in a way that is:
 * - deterministic per post (same post → same image, no flicker)
 * - spread across the pool so consecutive posts differ
 */
function pickFromPool(pool: readonly string[], postId?: number | null, slug?: string): string {
  if (pool.length === 1) return pool[0];
  const seed = postId != null ? postId : (slug ? hashStr(slug) : 0);
  return pool[seed % pool.length];
}

/**
 * Returns the best image URL for a post.
 * Priority:
 *   1. post.featuredImage (if set and non-empty)
 *   2. product-based pool   (atlas | road-to-1m)
 *   3. category-based pool  (tu-duy-dau-tu)
 *   4. default pool
 *
 * Within each pool the image is chosen deterministically by post ID / slug,
 * so different posts in the same group show different fallback visuals.
 */
export function getPostImage(
  post: Pick<NewsPost, "id" | "slug" | "featuredImage" | "product" | "category">,
): string {
  if (post.featuredImage) return post.featuredImage;

  const productSlug = post.product?.slug ?? "";
  if (productSlug === "atlas")
    return pickFromPool(POOLS.atlas, post.id, post.slug);
  if (productSlug === "road-to-1m")
    return pickFromPool(POOLS["road-to-1m"], post.id, post.slug);

  const catSlug = post.category?.slug ?? "";
  if (catSlug === "tu-duy-dau-tu")
    return pickFromPool(POOLS["tu-duy-dau-tu"], post.id, post.slug);

  return pickFromPool(POOLS.default, post.id, post.slug);
}

/** Returns true if the image is a generated fallback (not a real photo) */
export function isFallbackImage(post: Pick<NewsPost, "featuredImage">): boolean {
  return !post.featuredImage;
}
