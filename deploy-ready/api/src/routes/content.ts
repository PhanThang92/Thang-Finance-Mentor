import { Router } from "express";
import { db, articlesTable, videosTable } from "../lib/db/index.js";
import { eq, desc, and, or, ilike, sql } from "drizzle-orm";

const router = Router();

/* ══════════════════════════════════════════════
   /api/content — Articles and Videos
   Powers the Kiến thức hub pages.
   All public routes return published content only
   unless ?status=all is passed (for future admin).
══════════════════════════════════════════════ */

// ── ARTICLES ─────────────────────────────────────────────────────────────────

// GET /api/content/articles
// Query params: ?q=, ?category=, ?featured=true, ?status=published, ?limit=20
router.get("/articles", async (req, res) => {
  try {
    const { q, category, featured, status, limit } = req.query as Record<string, string>;
    const limitN = parseInt(limit ?? "50", 10) || 50;
    const statusFilter = status ?? "published";
    const conditions = [];

    if (statusFilter !== "all") {
      conditions.push(eq(articlesTable.status, statusFilter));
    }
    if (category) {
      conditions.push(eq(articlesTable.categorySlug, category));
    }
    if (featured === "true") {
      conditions.push(eq(articlesTable.featured, true));
    }
    if (q) {
      conditions.push(
        or(
          ilike(articlesTable.title, `%${q}%`),
          ilike(articlesTable.excerpt, `%${q}%`)
        )!
      );
    }

    const articles = await db
      .select()
      .from(articlesTable)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(articlesTable.publishDate))
      .limit(limitN);

    res.json({ articles });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// GET /api/content/articles/:slug
router.get("/articles/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const rows = await db
      .select()
      .from(articlesTable)
      .where(and(eq(articlesTable.slug, slug), eq(articlesTable.status, "published")))
      .limit(1);

    if (!rows.length) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    // related: same category, exclude current article
    const article = rows[0];
    const related = article.categorySlug
      ? await db
          .select()
          .from(articlesTable)
          .where(
            and(
              eq(articlesTable.categorySlug, article.categorySlug),
              eq(articlesTable.status, "published"),
              sql`${articlesTable.id} != ${article.id}`
            )
          )
          .orderBy(desc(articlesTable.publishDate))
          .limit(3)
      : [];

    res.json({ article, related });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// ── VIDEOS ───────────────────────────────────────────────────────────────────

// GET /api/content/videos
// Query params: ?q=, ?category=, ?featured=true, ?is_featured_video=true, ?status=published, ?limit=20
router.get("/videos", async (req, res) => {
  try {
    const { q, category, featured, is_featured_video, status, limit } = req.query as Record<string, string>;
    const limitN = parseInt(limit ?? "50", 10) || 50;
    const statusFilter = status ?? "published";
    const conditions = [];

    if (statusFilter !== "all") {
      conditions.push(eq(videosTable.status, statusFilter));
    }
    if (category) {
      conditions.push(sql`${videosTable.categories} @> ARRAY[${category}]::text[]`);
    }
    if (featured === "true") {
      conditions.push(eq(videosTable.featured, true));
    }
    if (is_featured_video === "true") {
      conditions.push(eq(videosTable.isFeaturedVideo, true));
    }
    if (q) {
      conditions.push(
        or(
          ilike(videosTable.title, `%${q}%`),
          ilike(videosTable.excerpt, `%${q}%`)
        )!
      );
    }

    const videos = await db
      .select()
      .from(videosTable)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(videosTable.publishDate))
      .limit(limitN);

    res.json({ videos });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// GET /api/content/videos/:slug
router.get("/videos/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const rows = await db
      .select()
      .from(videosTable)
      .where(and(eq(videosTable.slug, slug), eq(videosTable.status, "published")))
      .limit(1);

    if (!rows.length) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    res.json({ video: rows[0] });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

export default router;
