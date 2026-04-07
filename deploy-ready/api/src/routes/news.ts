import { Router } from "express";
import { db, newsCategoriesTable, newsProductsTable, newsTagsTable, newsPostsTable, newsPostTagsTable } from "../lib/db/index.js";
import { eq, desc, and, or, ilike, inArray, sql } from "drizzle-orm";

const router = Router();

// ── helpers ──────────────────────────────────────────────────────────────────
async function enrichPosts(posts: typeof newsPostsTable.$inferSelect[]) {
  if (posts.length === 0) return [];
  const postIds = posts.map((p) => p.id);

  const categories = await db.select().from(newsCategoriesTable);
  const products = await db.select().from(newsProductsTable);

  const postTags = await db
    .select({ postId: newsPostTagsTable.postId, tagId: newsPostTagsTable.tagId, tagName: newsTagsTable.name, tagSlug: newsTagsTable.slug })
    .from(newsPostTagsTable)
    .innerJoin(newsTagsTable, eq(newsPostTagsTable.tagId, newsTagsTable.id))
    .where(inArray(newsPostTagsTable.postId, postIds));

  const catMap = Object.fromEntries(categories.map((c) => [c.id, c]));
  const prodMap = Object.fromEntries(products.map((p) => [p.id, p]));
  const tagsByPost: Record<number, { id: number; name: string; slug: string }[]> = {};
  for (const pt of postTags) {
    if (!tagsByPost[pt.postId]) tagsByPost[pt.postId] = [];
    tagsByPost[pt.postId].push({ id: pt.tagId, name: pt.tagName, slug: pt.tagSlug });
  }

  return posts.map((p) => ({
    ...p,
    category: p.categoryId ? catMap[p.categoryId] ?? null : null,
    product: p.productId ? prodMap[p.productId] ?? null : null,
    tags: tagsByPost[p.id] ?? [],
  }));
}

// GET /api/news/categories
router.get("/categories", async (_req, res) => {
  try {
    const rows = await db.select().from(newsCategoriesTable).orderBy(newsCategoriesTable.id);
    res.json({ categories: rows });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// GET /api/news/products
router.get("/products", async (_req, res) => {
  try {
    const rows = await db.select().from(newsProductsTable).orderBy(newsProductsTable.id);
    res.json({ products: rows });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// GET /api/news/tags
router.get("/tags", async (_req, res) => {
  try {
    const rows = await db.select().from(newsTagsTable).orderBy(newsTagsTable.name);
    res.json({ tags: rows });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// GET /api/news/posts?category=&product=&tag=&q=&status=published
router.get("/posts", async (req, res) => {
  try {
    const { category, product, tag, q, status } = req.query as Record<string, string>;
    const conditions = [];

    const statusFilter = status || "published";
    if (statusFilter !== "all") {
      conditions.push(eq(newsPostsTable.status, statusFilter));
    }

    if (category) {
      const cat = await db.select({ id: newsCategoriesTable.id }).from(newsCategoriesTable).where(eq(newsCategoriesTable.slug, category)).limit(1);
      if (cat.length) conditions.push(eq(newsPostsTable.categoryId, cat[0].id));
      else { res.json({ posts: [] }); return; }
    }

    if (product) {
      const prod = await db.select({ id: newsProductsTable.id }).from(newsProductsTable).where(eq(newsProductsTable.slug, product)).limit(1);
      if (prod.length) conditions.push(eq(newsPostsTable.productId, prod[0].id));
      else { res.json({ posts: [] }); return; }
    }

    if (tag) {
      const tagRow = await db.select({ id: newsTagsTable.id }).from(newsTagsTable).where(eq(newsTagsTable.slug, tag)).limit(1);
      if (!tagRow.length) { res.json({ posts: [] }); return; }
      const taggedPostIds = await db
        .select({ postId: newsPostTagsTable.postId })
        .from(newsPostTagsTable)
        .where(eq(newsPostTagsTable.tagId, tagRow[0].id));
      if (!taggedPostIds.length) { res.json({ posts: [] }); return; }
      conditions.push(inArray(newsPostsTable.id, taggedPostIds.map((r) => r.postId)));
    }

    if (q) {
      conditions.push(or(ilike(newsPostsTable.title, `%${q}%`), ilike(newsPostsTable.excerpt, `%${q}%`))!);
    }

    const posts = await db
      .select()
      .from(newsPostsTable)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(newsPostsTable.publishedAt));

    const enriched = await enrichPosts(posts);
    res.json({ posts: enriched });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// GET /api/news/posts/:slug
router.get("/posts/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const rows = await db.select().from(newsPostsTable).where(eq(newsPostsTable.slug, slug)).limit(1);
    if (!rows.length) { res.status(404).json({ error: "Not found" }); return; }
    const [enriched] = await enrichPosts(rows);

    // related: same category, exclude current
    const related = enriched.category
      ? await enrichPosts(
          await db
            .select()
            .from(newsPostsTable)
            .where(and(eq(newsPostsTable.categoryId, enriched.category.id), eq(newsPostsTable.status, "published"), sql`${newsPostsTable.id} != ${enriched.id}`))
            .orderBy(desc(newsPostsTable.publishedAt))
            .limit(3)
        )
      : [];

    res.json({ post: enriched, related });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

export default router;
