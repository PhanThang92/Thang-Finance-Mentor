import { Router, type Request, type Response, type NextFunction } from "express";
import { db, newsCategoriesTable, newsProductsTable, newsTagsTable, newsPostsTable, newsPostTagsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

// ── Auth middleware ───────────────────────────────────────────────────────────
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const adminKey = process.env["ADMIN_KEY"] ?? "swc-admin-2026";
  const auth = req.headers["authorization"] ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (token !== adminKey) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

router.use(requireAdmin);

// ── Tags ─────────────────────────────────────────────────────────────────────
router.post("/tags", async (req, res) => {
  try {
    const { name, slug } = req.body;
    const [row] = await db.insert(newsTagsTable).values({ name, slug }).returning();
    res.json({ tag: row });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.delete("/tags/:id", async (req, res) => {
  try {
    await db.delete(newsTagsTable).where(eq(newsTagsTable.id, Number(req.params.id)));
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

// ── Categories ────────────────────────────────────────────────────────────────
router.post("/categories", async (req, res) => {
  try {
    const { name, slug, description } = req.body;
    const [row] = await db.insert(newsCategoriesTable).values({ name, slug, description }).returning();
    res.json({ category: row });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

// ── Posts CRUD ─────────────────────────────────────────────────────────────────
router.get("/posts", async (_req, res) => {
  try {
    const posts = await db.select().from(newsPostsTable).orderBy(newsPostsTable.createdAt);
    res.json({ posts });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.post("/posts", async (req, res) => {
  try {
    const { tagIds, ...body } = req.body;
    const now = new Date();
    const publishedAt = body.status === "published" ? now : (body.publishedAt ? new Date(body.publishedAt) : null);
    const [post] = await db
      .insert(newsPostsTable)
      .values({ ...body, categoryId: body.categoryId || null, productId: body.productId || null, publishedAt, createdAt: now, updatedAt: now })
      .returning();

    if (Array.isArray(tagIds) && tagIds.length) {
      await db.insert(newsPostTagsTable).values(tagIds.map((tid: number) => ({ postId: post.id, tagId: tid }))).onConflictDoNothing();
    }
    res.json({ post });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.put("/posts/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { tagIds, ...body } = req.body;
    const now = new Date();
    const publishedAt = body.status === "published" && !body.publishedAt ? now : (body.publishedAt ? new Date(body.publishedAt) : null);
    const [post] = await db
      .update(newsPostsTable)
      .set({ ...body, categoryId: body.categoryId || null, productId: body.productId || null, publishedAt, updatedAt: now })
      .where(eq(newsPostsTable.id, id))
      .returning();

    if (Array.isArray(tagIds)) {
      await db.delete(newsPostTagsTable).where(eq(newsPostTagsTable.postId, id));
      if (tagIds.length) {
        await db.insert(newsPostTagsTable).values(tagIds.map((tid: number) => ({ postId: id, tagId: tid }))).onConflictDoNothing();
      }
    }
    res.json({ post });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.delete("/posts/:id", async (req, res) => {
  try {
    await db.delete(newsPostsTable).where(eq(newsPostsTable.id, Number(req.params.id)));
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

// ── All tags (for form dropdowns) ─────────────────────────────────────────────
router.get("/meta", async (_req, res) => {
  try {
    const [categories, products, tags] = await Promise.all([
      db.select().from(newsCategoriesTable),
      db.select().from(newsProductsTable),
      db.select().from(newsTagsTable),
    ]);
    res.json({ categories, products, tags });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

export default router;
