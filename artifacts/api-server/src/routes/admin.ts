import { Router, type Request, type Response, type NextFunction } from "express";
import { db, newsCategoriesTable, newsProductsTable, newsTagsTable, newsPostsTable, newsPostTagsTable, leadsTable, siteSettingsTable } from "@workspace/db";
import { eq, sql, desc, ilike, or } from "drizzle-orm";

const router = Router();

// ── Auth ──────────────────────────────────────────────────────────────────────
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const adminKey = process.env["ADMIN_KEY"] ?? "swc-admin-2026";
  const auth = req.headers["authorization"] ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (token !== adminKey) { res.status(401).json({ error: "Unauthorized" }); return; }
  next();
}
router.use(requireAdmin);

// ── Dashboard ─────────────────────────────────────────────────────────────────
router.get("/dashboard", async (_req, res) => {
  try {
    const [publishedCount] = await db.select({ count: sql<number>`count(*)::int` }).from(newsPostsTable).where(eq(newsPostsTable.status, "published"));
    const [draftCount]     = await db.select({ count: sql<number>`count(*)::int` }).from(newsPostsTable).where(eq(newsPostsTable.status, "draft"));
    const [productCount]   = await db.select({ count: sql<number>`count(*)::int` }).from(newsProductsTable);
    const [totalLeads]     = await db.select({ count: sql<number>`count(*)::int` }).from(leadsTable);
    const [newLeads]       = await db.select({ count: sql<number>`count(*)::int` }).from(leadsTable).where(eq(leadsTable.status, "moi"));

    const recentPosts = await db.select({
      id: newsPostsTable.id, title: newsPostsTable.title, status: newsPostsTable.status, publishedAt: newsPostsTable.publishedAt, createdAt: newsPostsTable.createdAt,
    }).from(newsPostsTable).orderBy(desc(newsPostsTable.createdAt)).limit(5);

    const recentLeads = await db.select().from(leadsTable).orderBy(desc(leadsTable.createdAt)).limit(5);

    res.json({ publishedCount: publishedCount.count, draftCount: draftCount.count, productCount: productCount.count, totalLeads: totalLeads.count, newLeads: newLeads.count, recentPosts, recentLeads });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

// ── Tags ──────────────────────────────────────────────────────────────────────
router.post("/tags", async (req, res) => {
  try {
    const { name, slug } = req.body;
    const [row] = await db.insert(newsTagsTable).values({ name, slug }).returning();
    res.json({ tag: row });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.put("/tags/:id", async (req, res) => {
  try {
    const { name, slug } = req.body;
    const [row] = await db.update(newsTagsTable).set({ name, slug }).where(eq(newsTagsTable.id, Number(req.params.id))).returning();
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

router.put("/categories/:id", async (req, res) => {
  try {
    const { name, slug, description } = req.body;
    const [row] = await db.update(newsCategoriesTable).set({ name, slug, description }).where(eq(newsCategoriesTable.id, Number(req.params.id))).returning();
    res.json({ category: row });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.delete("/categories/:id", async (req, res) => {
  try {
    await db.delete(newsCategoriesTable).where(eq(newsCategoriesTable.id, Number(req.params.id)));
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

// ── Products ──────────────────────────────────────────────────────────────────
router.post("/products", async (req, res) => {
  try {
    const { name, slug, description } = req.body;
    const [row] = await db.insert(newsProductsTable).values({ name, slug, description }).returning();
    res.json({ product: row });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.put("/products/:id", async (req, res) => {
  try {
    const { name, slug, description } = req.body;
    const [row] = await db.update(newsProductsTable).set({ name, slug, description }).where(eq(newsProductsTable.id, Number(req.params.id))).returning();
    res.json({ product: row });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.delete("/products/:id", async (req, res) => {
  try {
    await db.delete(newsProductsTable).where(eq(newsProductsTable.id, Number(req.params.id)));
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

// ── Posts CRUD ─────────────────────────────────────────────────────────────────
router.get("/posts", async (_req, res) => {
  try {
    const posts = await db.select().from(newsPostsTable).orderBy(desc(newsPostsTable.createdAt));
    res.json({ posts });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.post("/posts", async (req, res) => {
  try {
    const { tagIds, ...body } = req.body;
    const now = new Date();
    const publishedAt = body.status === "published" ? now : (body.publishedAt ? new Date(body.publishedAt) : null);
    const [post] = await db.insert(newsPostsTable).values({ ...body, categoryId: body.categoryId || null, productId: body.productId || null, publishedAt, createdAt: now, updatedAt: now }).returning();
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
    const [post] = await db.update(newsPostsTable).set({ ...body, categoryId: body.categoryId || null, productId: body.productId || null, publishedAt, updatedAt: now }).where(eq(newsPostsTable.id, id)).returning();
    if (Array.isArray(tagIds)) {
      await db.delete(newsPostTagsTable).where(eq(newsPostTagsTable.postId, id));
      if (tagIds.length) await db.insert(newsPostTagsTable).values(tagIds.map((tid: number) => ({ postId: id, tagId: tid }))).onConflictDoNothing();
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

// ── Meta (categories, products, tags for dropdowns) ───────────────────────────
router.get("/meta", async (_req, res) => {
  try {
    const [categories, products, tags] = await Promise.all([
      db.select().from(newsCategoriesTable).orderBy(newsCategoriesTable.name),
      db.select().from(newsProductsTable).orderBy(newsProductsTable.name),
      db.select().from(newsTagsTable).orderBy(newsTagsTable.slug),
    ]);
    res.json({ categories, products, tags });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

// ── Leads ─────────────────────────────────────────────────────────────────────
router.get("/leads", async (req, res) => {
  try {
    const { status, q } = req.query as { status?: string; q?: string };
    let query = db.select().from(leadsTable).$dynamic();
    if (status && status !== "all") query = query.where(eq(leadsTable.status, status));
    if (q) query = query.where(or(ilike(leadsTable.name, `%${q}%`), ilike(leadsTable.email ?? "", `%${q}%`), ilike(leadsTable.phone ?? "", `%${q}%`)));
    const leads = await query.orderBy(desc(leadsTable.createdAt));
    res.json({ leads });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.patch("/leads/:id", async (req, res) => {
  try {
    const { status, notes } = req.body;
    const now = new Date();
    const updateData: Record<string, unknown> = { updatedAt: now };
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    const [lead] = await db.update(leadsTable).set(updateData as never).where(eq(leadsTable.id, Number(req.params.id))).returning();
    res.json({ lead });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.delete("/leads/:id", async (req, res) => {
  try {
    await db.delete(leadsTable).where(eq(leadsTable.id, Number(req.params.id)));
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

// ── Site settings ─────────────────────────────────────────────────────────────
router.get("/settings", async (_req, res) => {
  try {
    const rows = await db.select().from(siteSettingsTable);
    const settings: Record<string, string | null> = {};
    rows.forEach((r) => { settings[r.key] = r.value; });
    res.json({ settings });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.put("/settings", async (req, res) => {
  try {
    const updates = req.body as Record<string, string>;
    const now = new Date();
    for (const [key, value] of Object.entries(updates)) {
      await db.insert(siteSettingsTable).values({ key, value, updatedAt: now }).onConflictDoUpdate({ target: siteSettingsTable.key, set: { value, updatedAt: now } });
    }
    const rows = await db.select().from(siteSettingsTable);
    const settings: Record<string, string | null> = {};
    rows.forEach((r) => { settings[r.key] = r.value; });
    res.json({ settings });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

export default router;
