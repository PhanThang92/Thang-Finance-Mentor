import path from "path";
import { generateOgImage } from "../og/ogImageGenerator";
import { randomBytes } from "crypto";
import { Router, type Request, type Response, type NextFunction } from "express";
import multer from "multer";
import sharp from "sharp";
import { storage } from "../lib/storage.js";
import { runImagePipeline } from "../services/imageService.js";
import { db, newsCategoriesTable, newsProductsTable, newsTagsTable, newsPostsTable, newsPostTagsTable, leadsTable, leadNotesTable, siteSettingsTable, articlesTable, videosTable, topicsTable, seriesTable, mediaAssetsTable, analyticsEventsTable, contactWidgetSettingsTable, contactChannelsTable } from "../lib/db/index.js";
import { eq, sql, desc, ilike, or, and, isNotNull, gte, lte, inArray } from "drizzle-orm";

/* ── Upload dirs managed by storage abstraction (see src/lib/storage.ts) ── */

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (/^image\/(jpeg|jpg|png|webp|gif|avif)$/i.test(file.mimetype)) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});

// Image processing is handled by src/services/imageService.ts

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

// ── Slug uniqueness helper ─────────────────────────────────────────────────────
// Drizzle wraps PG errors in QueryError; the actual postgres error is in `cause`
function isSlugConflict(e: unknown): boolean {
  if (e && typeof e === "object") {
    // The PG unique_violation error code is 23505 — check both the error and its cause
    const errObj = e as Record<string, unknown>;
    if (errObj["code"] === "23505") return true;
    const cause = errObj["cause"];
    if (cause && typeof cause === "object" && (cause as Record<string, unknown>)["code"] === "23505") return true;
  }
  // String fallback for non-PG error wrappers
  const msg = String(e).toLowerCase();
  return msg.includes("duplicate key") || (msg.includes("unique constraint") && msg.includes("slug"));
}

// ── System status (no secrets exposed — presence only) ────────────────────────
router.get("/system-status", (_req, res) => {
  const notionOk  = !!(process.env["NOTION_API_KEY"] && process.env["NOTION_DATABASE_ID"]);
  const sheetsOk  = !!(process.env["GOOGLE_CLIENT_EMAIL"] && process.env["GOOGLE_PRIVATE_KEY"] && process.env["GOOGLE_SPREADSHEET_ID"]);
  const resendOk  = !!process.env["RESEND_API_KEY"];
  res.json({
    storage: {
      provider: process.env["STORAGE_PROVIDER"] ?? "local",
    },
    watermark: {
      enabled: process.env["WATERMARK_ENABLED"] !== "false",
    },
    email: {
      configured: resendOk,
      from: resendOk ? (process.env["RESEND_FROM_EMAIL"] ?? null) : null,
    },
    notion: {
      enabled:    process.env["ENABLE_NOTION_SYNC"] === "true",
      configured: notionOk,
    },
    sheets: {
      enabled:    process.env["ENABLE_GOOGLE_SHEETS_SYNC"] === "true",
      configured: sheetsOk,
    },
    adminKey: {
      isDefault: (process.env["ADMIN_KEY"] ?? "swc-admin-2026") === "swc-admin-2026",
    },
  });
});

// ── Dashboard ─────────────────────────────────────────────────────────────────
router.get("/dashboard", async (_req, res) => {
  try {
    const [publishedCount] = await db.select({ count: sql<number>`count(*)::int` }).from(newsPostsTable).where(eq(newsPostsTable.status, "published"));
    const [draftCount]     = await db.select({ count: sql<number>`count(*)::int` }).from(newsPostsTable).where(eq(newsPostsTable.status, "draft"));
    const [productCount]   = await db.select({ count: sql<number>`count(*)::int` }).from(newsProductsTable);
    const [totalLeads]     = await db.select({ count: sql<number>`count(*)::int` }).from(leadsTable);
    const [newLeads]       = await db.select({ count: sql<number>`count(*)::int` }).from(leadsTable).where(eq(leadsTable.status, "moi"));
    const [articlesPublished] = await db.select({ count: sql<number>`count(*)::int` }).from(articlesTable).where(eq(articlesTable.status, "published"));
    const [articlesDraft]     = await db.select({ count: sql<number>`count(*)::int` }).from(articlesTable).where(eq(articlesTable.status, "draft"));
    const [videosPublished]   = await db.select({ count: sql<number>`count(*)::int` }).from(videosTable).where(eq(videosTable.status, "published"));
    const [videosDraft]       = await db.select({ count: sql<number>`count(*)::int` }).from(videosTable).where(eq(videosTable.status, "draft"));
    const [topicsCount]       = await db.select({ count: sql<number>`count(*)::int` }).from(topicsTable);
    const [seriesCount]       = await db.select({ count: sql<number>`count(*)::int` }).from(seriesTable);

    const recentPosts = await db.select({
      id: newsPostsTable.id,
      title: newsPostsTable.title,
      status: newsPostsTable.status,
      publishedAt: newsPostsTable.publishedAt,
      createdAt: newsPostsTable.createdAt,
      updatedAt: newsPostsTable.updatedAt,
      categoryName: newsCategoriesTable.name,
    })
      .from(newsPostsTable)
      .leftJoin(newsCategoriesTable, eq(newsPostsTable.categoryId, newsCategoriesTable.id))
      .orderBy(desc(newsPostsTable.updatedAt))
      .limit(5);

    const recentLeads = await db.select().from(leadsTable).orderBy(desc(leadsTable.createdAt)).limit(5);
    const [syncErrors] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(leadsTable)
      .where(isNotNull(leadsTable.syncError));

    res.json({
      publishedCount: publishedCount.count, draftCount: draftCount.count,
      productCount: productCount.count, totalLeads: totalLeads.count, newLeads: newLeads.count,
      recentPosts, recentLeads,
      articlesPublished: articlesPublished.count, articlesDraft: articlesDraft.count,
      videosPublished: videosPublished.count, videosDraft: videosDraft.count,
      topicsCount: topicsCount.count, seriesCount: seriesCount.count,
      syncErrors: syncErrors.count,
    });
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

/* Attach tag objects to an array of posts via a single batch join query.
   This is the root-cause fix for the tag data-loss bug:
   the previous plain SELECT returned posts with tags=undefined, causing
   editPost() to set tagIds=[] → backend destroyed all junction rows on save. */
async function enrichAdminPosts(posts: (typeof newsPostsTable.$inferSelect)[]) {
  if (posts.length === 0) return [];
  const postIds = posts.map((p) => p.id);
  const postTags = await db
    .select({
      postId: newsPostTagsTable.postId,
      tagId:  newsPostTagsTable.tagId,
      tagName: newsTagsTable.name,
      tagSlug: newsTagsTable.slug,
    })
    .from(newsPostTagsTable)
    .innerJoin(newsTagsTable, eq(newsPostTagsTable.tagId, newsTagsTable.id))
    .where(inArray(newsPostTagsTable.postId, postIds));

  const tagsByPost: Record<number, { id: number; name: string; slug: string }[]> = {};
  for (const pt of postTags) {
    if (!tagsByPost[pt.postId]) tagsByPost[pt.postId] = [];
    tagsByPost[pt.postId].push({ id: pt.tagId, name: pt.tagName, slug: pt.tagSlug });
  }
  return posts.map((p) => ({ ...p, tags: tagsByPost[p.id] ?? [] }));
}

router.get("/posts", async (_req, res) => {
  try {
    const posts = await db.select().from(newsPostsTable).orderBy(desc(newsPostsTable.createdAt));
    const enriched = await enrichAdminPosts(posts);
    res.json({ posts: enriched });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

/* Pick only the columns that belong to news_posts (strips joined fields: category, product, tags) */
function pickPostFields(body: Record<string, unknown>) {
  return {
    title:                body.title                as string | undefined,
    slug:                 body.slug                 as string | undefined,
    excerpt:              body.excerpt              as string | null | undefined,
    content:              body.content              as string | null | undefined,
    featuredImage:        body.featuredImage        as string | null | undefined,
    featuredImageDisplay: body.featuredImageDisplay as string | null | undefined,
    categoryId:     body.categoryId     ? Number(body.categoryId) : null,
    productId:      body.productId      ? Number(body.productId)  : null,
    status:         body.status         as string | undefined,
    authorName:     body.authorName     as string | undefined,
    seoTitle:       body.seoTitle       as string | null | undefined,
    seoDescription: body.seoDescription as string | null | undefined,
    isFeatured:     typeof body.isFeatured    === "boolean" ? body.isFeatured    : undefined,
    showOnHomepage: typeof body.showOnHomepage === "boolean" ? body.showOnHomepage : undefined,
    showInRelated:  typeof body.showInRelated  === "boolean" ? body.showInRelated  : undefined,
  };
}

// ── Image Upload ───────────────────────────────────────────────────────────────
router.post("/upload-image", upload.single("image"), async (req: Request, res: Response) => {
  try {
    if (!req.file) { res.status(400).json({ error: "No image file provided" }); return; }
    const context = (req.body.context as string | undefined) ?? "default";
    const id      = randomBytes(12).toString("hex");
    const ext     = req.file.originalname.split(".").pop()?.toLowerCase() ?? "jpg";

    const origName   = `${id}.${ext}`;
    const dispName   = `${id}.webp`;
    const mediumName = `${id}_medium.webp`;
    const thumbName  = `${id}_thumb.webp`;

    // Run all processing variants in parallel
    const { display, medium, thumbnail, watermarkText: wmText } =
      await runImagePipeline(req.file.buffer, context);

    // Persist all files via storage abstraction (local or S3)
    const [origUrl, dispUrl, mediumUrl, thumbUrl] = await Promise.all([
      storage.save(req.file.buffer, `orig/${origName}`,           req.file.mimetype),
      storage.save(display,          `disp/${dispName}`,           "image/webp"),
      storage.save(medium,           `disp/${mediumName}`,         "image/webp"),
      storage.save(thumbnail,        `thumb/${thumbName}`,         "image/webp"),
    ]);

    const dispMeta       = await sharp(display).metadata();
    const contentTypeVal = (req.body.contentType as string | undefined) ?? "shared";
    const usageCtxVal    = (req.body.usageContext as string | undefined) ?? "cover";
    const altTextVal     = (req.body.altText as string | undefined) ?? null;
    const titleVal       = (req.body.title as string | undefined) ?? null;

    const [mediaAsset] = await db.insert(mediaAssetsTable).values({
      title:                titleVal,
      filename:             dispName,
      originalFilename:     req.file.originalname,
      mimeType:             "image/webp",
      sizeBytes:            display.length,
      width:                dispMeta.width ?? null,
      height:               dispMeta.height ?? null,
      storageProvider:      process.env.STORAGE_PROVIDER ?? "local",
      storagePathOriginal:  `orig/${origName}`,
      storagePathProcessed: `disp/${dispName}`,
      storagePathMedium:    `disp/${mediumName}`,
      storagePathThumbnail: `thumb/${thumbName}`,
      publicUrl:            dispUrl,
      mediumUrl,
      thumbnailUrl:         thumbUrl,
      altText:              altTextVal,
      watermarkEnabled:     true,
      watermarkText:        wmText,
      contentType:          contentTypeVal,
      usageContext:         usageCtxVal,
    }).returning();

    res.json({
      original:  origUrl,
      display:   dispUrl,
      medium:    mediumUrl,
      thumbnail: thumbUrl,
      assetId:   mediaAsset?.id ?? null,
    });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.post("/posts", async (req, res) => {
  try {
    const { tagIds, id: _id, ...body } = req.body;
    const fields = pickPostFields(body);
    const now = new Date();
    const publishedAt = fields.status === "published" ? now : (body.publishedAt ? new Date(body.publishedAt as string) : null);
    const [post] = await db.insert(newsPostsTable).values({ ...fields, publishedAt, createdAt: now, updatedAt: now }).returning();
    if (Array.isArray(tagIds) && tagIds.length) {
      await db.insert(newsPostTagsTable).values(tagIds.map((tid: number) => ({ postId: post.id, tagId: tid }))).onConflictDoNothing();
    }
    res.json({ post });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.put("/posts/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { tagIds, id: _id, ...body } = req.body;
    const fields = pickPostFields(body);
    const now = new Date();
    const publishedAt = fields.status === "published" && !body.publishedAt ? now : (body.publishedAt ? new Date(body.publishedAt as string) : null);
    const [post] = await db.update(newsPostsTable).set({ ...fields, publishedAt, updatedAt: now }).where(eq(newsPostsTable.id, id)).returning();
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
    const { status, notes, interestTopic, formType, leadStage, tags, lastContactedAt, nextFollowUpAt, assignedTo, score } = req.body;
    const now = new Date();
    const updateData: Record<string, unknown> = { updatedAt: now };
    if (status          !== undefined) updateData.status          = status;
    if (notes           !== undefined) updateData.notes           = notes;
    if (interestTopic   !== undefined) updateData.interestTopic   = interestTopic;
    if (formType        !== undefined) updateData.formType        = formType;
    if (leadStage       !== undefined) updateData.leadStage       = leadStage;
    if (tags            !== undefined) updateData.tags            = tags;
    if (lastContactedAt !== undefined) updateData.lastContactedAt = lastContactedAt ? new Date(lastContactedAt) : null;
    if (nextFollowUpAt  !== undefined) updateData.nextFollowUpAt  = nextFollowUpAt  ? new Date(nextFollowUpAt)  : null;
    if (assignedTo      !== undefined) updateData.assignedTo      = assignedTo || null;
    if (score           !== undefined) updateData.score           = Number(score);
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

// ── Lead notes ────────────────────────────────────────────────────────────────
router.get("/leads/:id/notes", async (req, res) => {
  try {
    const notes = await db.select().from(leadNotesTable)
      .where(eq(leadNotesTable.leadId, Number(req.params.id)))
      .orderBy(desc(leadNotesTable.createdAt));
    res.json({ notes });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.post("/leads/:id/notes", async (req, res) => {
  try {
    const { note, noteType } = req.body;
    if (!note || !String(note).trim()) { res.status(400).json({ error: "Nội dung ghi chú không được để trống" }); return; }
    const [created] = await db.insert(leadNotesTable).values({
      leadId: Number(req.params.id),
      note: String(note).trim(),
      noteType: noteType || "internal",
    }).returning();
    // Also update the lead's lastContactedAt if noteType is "call" or "email"
    if (noteType === "call" || noteType === "email" || noteType === "meeting") {
      await db.update(leadsTable).set({ lastContactedAt: new Date(), updatedAt: new Date() })
        .where(eq(leadsTable.id, Number(req.params.id)));
    }
    res.json({ note: created });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.delete("/leads/notes/:noteId", async (req, res) => {
  try {
    await db.delete(leadNotesTable).where(eq(leadNotesTable.id, Number(req.params.noteId)));
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

// ── Articles CRUD ──────────────────────────────────────────────────────────────

function pickArticleFields(body: Record<string, unknown>) {
  return {
    title:          body.title         as string | undefined,
    slug:           body.slug          as string | undefined,
    excerpt:        body.excerpt       as string | null | undefined,
    content:        body.content       as string | null | undefined,
    coverImageUrl:      body.coverImageUrl      as string | null | undefined,
    coverImageAlt:      body.coverImageAlt      as string | null | undefined,
    coverThumbnailUrl:  body.coverThumbnailUrl  as string | null | undefined,
    category:       body.category      as string | null | undefined,
    categorySlug:   body.categorySlug  as string | null | undefined,
    tags:           Array.isArray(body.tags) ? (body.tags as string[]) : (body.tags ? [body.tags as string] : null),
    featured:       typeof body.featured === "boolean" ? body.featured : undefined,
    status:         body.status        as string | undefined,
    readingTime:    body.readingTime   as string | null | undefined,
    topicSlug:      body.topicSlug     as string | null | undefined,
    seriesSlug:     body.seriesSlug    as string | null | undefined,
    /* SEO */
    seoTitle:       body.seoTitle        as string | null | undefined,
    seoDescription: body.seoDescription  as string | null | undefined,
    seoKeywords:    body.seoKeywords     as string | null | undefined,
    ogTitle:        body.ogTitle         as string | null | undefined,
    ogDescription:  body.ogDescription   as string | null | undefined,
    ogImageUrl:     body.ogImageUrl      as string | null | undefined,
    canonicalUrl:   body.canonicalUrl    as string | null | undefined,
    noindex:        typeof body.noindex  === "boolean" ? body.noindex  : undefined,
    /* Homepage */
    showOnHomepage: typeof body.showOnHomepage === "boolean" ? body.showOnHomepage : undefined,
    displayOrder:   typeof body.displayOrder   === "number"  ? body.displayOrder   : undefined,
  };
}

router.get("/articles", async (_req, res) => {
  try {
    const articles = await db.select().from(articlesTable).orderBy(desc(articlesTable.updatedAt));
    res.json({ articles });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.get("/articles/:id", async (req, res) => {
  try {
    const rows = await db.select().from(articlesTable).where(eq(articlesTable.id, Number(req.params.id))).limit(1);
    if (!rows.length) { res.status(404).json({ error: "Not found" }); return; }
    res.json({ article: rows[0] });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.post("/articles", async (req, res) => {
  try {
    const { id: _id, createdAt: _c, updatedAt: _u, ...body } = req.body;
    const now = new Date();
    const publishDate = body.publishDate ? new Date(body.publishDate as string) : (body.status === "published" ? now : null);
    const [article] = await db.insert(articlesTable).values({
      ...pickArticleFields(body),
      publishDate,
      createdAt: now, updatedAt: now,
    }).returning();
    res.json({ article });
  } catch (e) {
    if (isSlugConflict(e)) { res.status(409).json({ error: `Đường dẫn tĩnh "${String((req.body as Record<string, unknown>).slug)}" đã tồn tại. Vui lòng chọn đường dẫn khác.` }); return; }
    res.status(500).json({ error: String(e) });
  }
});

router.put("/articles/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { id: _id, createdAt: _c, updatedAt: _u, ...body } = req.body;
    const now = new Date();
    const publishDate = body.publishDate ? new Date(body.publishDate as string) : null;
    const [article] = await db.update(articlesTable).set({
      ...pickArticleFields(body),
      publishDate,
      updatedAt: now,
    }).where(eq(articlesTable.id, id)).returning();
    if (!article) { res.status(404).json({ error: "Not found" }); return; }
    res.json({ article });
  } catch (e) {
    if (isSlugConflict(e)) { res.status(409).json({ error: `Đường dẫn tĩnh "${String((req.body as Record<string, unknown>).slug)}" đã tồn tại. Vui lòng chọn đường dẫn khác.` }); return; }
    res.status(500).json({ error: String(e) });
  }
});

router.delete("/articles/:id", async (req, res) => {
  try {
    await db.delete(articlesTable).where(eq(articlesTable.id, Number(req.params.id)));
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

// ── Article OG image generation ────────────────────────────────────────────────
router.post("/articles/:id/generate-og", async (req, res) => {
  try {
    const id   = Number(req.params.id);
    const rows = await db.select().from(articlesTable).where(eq(articlesTable.id, id)).limit(1);
    if (!rows.length) { res.status(404).json({ error: "Not found" }); return; }
    const a = rows[0]!;

    const { publicUrl } = await generateOgImage({
      title:       a.seoTitle || a.title,
      category:    a.category,
      contentType: "article",
      slug:        a.slug,
    });

    const now = new Date();
    await db.update(articlesTable).set({
      generatedOgImageUrl: publicUrl,
      ogImageGenerated:    true,
      ogImageUpdatedAt:    now,
      updatedAt:           now,
    }).where(eq(articlesTable.id, id));

    res.json({ ok: true, generatedOgImageUrl: publicUrl });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

// ── Videos CRUD ────────────────────────────────────────────────────────────────

function pickVideoFields(body: Record<string, unknown>) {
  return {
    title:             body.title             as string | undefined,
    slug:              body.slug              as string | undefined,
    excerpt:           body.excerpt           as string | null | undefined,
    youtubeUrl:        body.youtubeUrl        as string | undefined,
    youtubeVideoId:    body.youtubeVideoId    as string | null | undefined,
    thumbnailUrl:      body.thumbnailUrl      as string | null | undefined,
    thumbnailAlt:      body.thumbnailAlt      as string | null | undefined,
    thumbnailSmallUrl: body.thumbnailSmallUrl as string | null | undefined,
    thumbnailGradient: body.thumbnailGradient as string | null | undefined,
    duration:          body.duration          as string | null | undefined,
    featured:          typeof body.featured         === "boolean" ? body.featured         : undefined,
    isFeaturedVideo:   typeof body.isFeaturedVideo  === "boolean" ? body.isFeaturedVideo  : undefined,
    status:            body.status            as string | undefined,
    topicSlug:         body.topicSlug         as string | null | undefined,
    seriesSlug:        body.seriesSlug        as string | null | undefined,
    categories:        Array.isArray(body.categories) ? (body.categories as string[]) : (body.categories ? [body.categories as string] : null),
    /* SEO */
    seoTitle:          body.seoTitle       as string | null | undefined,
    seoDescription:    body.seoDescription as string | null | undefined,
    seoKeywords:       body.seoKeywords    as string | null | undefined,
    ogTitle:           body.ogTitle        as string | null | undefined,
    ogDescription:     body.ogDescription  as string | null | undefined,
    ogImageUrl:        body.ogImageUrl     as string | null | undefined,
    canonicalUrl:      body.canonicalUrl   as string | null | undefined,
    noindex:           typeof body.noindex  === "boolean" ? body.noindex  : undefined,
    /* Homepage */
    showOnHomepage:    typeof body.showOnHomepage === "boolean" ? body.showOnHomepage : undefined,
    displayOrder:      typeof body.displayOrder   === "number"  ? body.displayOrder   : undefined,
  };
}

// ── Content Meta (topics + series dropdowns for article/video forms) ────────
router.get("/content-meta", async (_req, res) => {
  try {
    const [topics, series] = await Promise.all([
      db.select().from(topicsTable).where(eq(topicsTable.status, "active")).orderBy(topicsTable.displayOrder, topicsTable.title),
      db.select().from(seriesTable).where(eq(seriesTable.status, "active")).orderBy(seriesTable.displayOrder, seriesTable.title),
    ]);
    res.json({ topics, series });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

function extractYoutubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1).split("?")[0];
    return u.searchParams.get("v");
  } catch { return null; }
}

router.get("/videos", async (_req, res) => {
  try {
    const videos = await db.select().from(videosTable).orderBy(desc(videosTable.updatedAt));
    res.json({ videos });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.get("/videos/:id", async (req, res) => {
  try {
    const rows = await db.select().from(videosTable).where(eq(videosTable.id, Number(req.params.id))).limit(1);
    if (!rows.length) { res.status(404).json({ error: "Not found" }); return; }
    res.json({ video: rows[0] });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.post("/videos", async (req, res) => {
  try {
    const { id: _id, createdAt: _c, updatedAt: _u, ...body } = req.body;
    const now = new Date();
    const publishDate = body.publishDate ? new Date(body.publishDate as string) : (body.status === "published" ? now : null);
    const youtubeVideoId = body.youtubeUrl ? (extractYoutubeId(body.youtubeUrl as string) ?? (body.youtubeVideoId as string | null | undefined)) : (body.youtubeVideoId as string | null | undefined);
    const [video] = await db.insert(videosTable).values({
      ...pickVideoFields(body),
      youtubeVideoId,
      publishDate,
      createdAt: now, updatedAt: now,
    }).returning();
    res.json({ video });
  } catch (e) {
    if (isSlugConflict(e)) { res.status(409).json({ error: `Đường dẫn tĩnh "${String((req.body as Record<string, unknown>).slug)}" đã tồn tại. Vui lòng chọn đường dẫn khác.` }); return; }
    res.status(500).json({ error: String(e) });
  }
});

router.put("/videos/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { id: _id, createdAt: _c, updatedAt: _u, ...body } = req.body;
    const now = new Date();
    const publishDate = body.publishDate ? new Date(body.publishDate as string) : null;
    const youtubeVideoId = body.youtubeUrl ? (extractYoutubeId(body.youtubeUrl as string) ?? (body.youtubeVideoId as string | null | undefined)) : (body.youtubeVideoId as string | null | undefined);
    const [video] = await db.update(videosTable).set({
      ...pickVideoFields(body),
      youtubeVideoId,
      publishDate,
      updatedAt: now,
    }).where(eq(videosTable.id, id)).returning();
    if (!video) { res.status(404).json({ error: "Not found" }); return; }
    res.json({ video });
  } catch (e) {
    if (isSlugConflict(e)) { res.status(409).json({ error: `Đường dẫn tĩnh "${String((req.body as Record<string, unknown>).slug)}" đã tồn tại. Vui lòng chọn đường dẫn khác.` }); return; }
    res.status(500).json({ error: String(e) });
  }
});

router.delete("/videos/:id", async (req, res) => {
  try {
    await db.delete(videosTable).where(eq(videosTable.id, Number(req.params.id)));
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

// ── Video OG image generation ──────────────────────────────────────────────────
router.post("/videos/:id/generate-og", async (req, res) => {
  try {
    const id   = Number(req.params.id);
    const rows = await db.select().from(videosTable).where(eq(videosTable.id, id)).limit(1);
    if (!rows.length) { res.status(404).json({ error: "Not found" }); return; }
    const v = rows[0]!;

    const category = Array.isArray(v.categories) && v.categories.length > 0
      ? v.categories[0]!
      : (v.topicSlug ? v.topicSlug.replace(/-/g, " ") : null);

    const { publicUrl } = await generateOgImage({
      title:       v.seoTitle || v.title,
      category,
      contentType: "video",
      slug:        v.slug,
    });

    const now = new Date();
    await db.update(videosTable).set({
      generatedOgImageUrl: publicUrl,
      ogImageGenerated:    true,
      ogImageUpdatedAt:    now,
      updatedAt:           now,
    }).where(eq(videosTable.id, id));

    res.json({ ok: true, generatedOgImageUrl: publicUrl });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

// ── Topics CRUD ─────────────────────────────────────────────────────────────

function pickTopicFields(body: Record<string, unknown>) {
  return {
    title:            body.title            as string | undefined,
    slug:             body.slug             as string | undefined,
    description:      body.description      as string | null | undefined,
    shortDescription: body.shortDescription as string | null | undefined,
    iconKey:          body.iconKey          as string | null | undefined,
    featured:         typeof body.featured      === "boolean" ? body.featured      : undefined,
    displayOrder:     typeof body.displayOrder  === "number"  ? body.displayOrder  : undefined,
    status:           body.status           as string | undefined,
    seoTitle:         body.seoTitle         as string | null | undefined,
    seoDescription:   body.seoDescription   as string | null | undefined,
  };
}

router.get("/topics", async (_req, res) => {
  try {
    const topics = await db.select().from(topicsTable).orderBy(topicsTable.displayOrder, topicsTable.title);
    res.json({ topics });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.get("/topics/:id", async (req, res) => {
  try {
    const rows = await db.select().from(topicsTable).where(eq(topicsTable.id, Number(req.params.id))).limit(1);
    if (!rows.length) { res.status(404).json({ error: "Not found" }); return; }
    res.json({ topic: rows[0] });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.post("/topics", async (req, res) => {
  try {
    const { id: _id, createdAt: _c, updatedAt: _u, ...body } = req.body;
    const now = new Date();
    const [topic] = await db.insert(topicsTable).values({
      ...pickTopicFields(body) as never,
      createdAt: now, updatedAt: now,
    }).returning();
    res.json({ topic });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.put("/topics/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { id: _id, createdAt: _c, updatedAt: _u, ...body } = req.body;
    const now = new Date();
    const [topic] = await db.update(topicsTable).set({
      ...pickTopicFields(body) as never,
      updatedAt: now,
    }).where(eq(topicsTable.id, id)).returning();
    if (!topic) { res.status(404).json({ error: "Not found" }); return; }
    res.json({ topic });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.delete("/topics/:id", async (req, res) => {
  try {
    await db.delete(topicsTable).where(eq(topicsTable.id, Number(req.params.id)));
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

// ── Series CRUD ─────────────────────────────────────────────────────────────

function pickSeriesFields(body: Record<string, unknown>) {
  return {
    title:            body.title            as string | undefined,
    slug:             body.slug             as string | undefined,
    description:      body.description      as string | null | undefined,
    shortDescription: body.shortDescription as string | null | undefined,
    coverImageUrl:    body.coverImageUrl    as string | null | undefined,
    coverImageAlt:    body.coverImageAlt    as string | null | undefined,
    type:             body.type             as string | undefined,
    featured:         typeof body.featured      === "boolean" ? body.featured      : undefined,
    displayOrder:     typeof body.displayOrder  === "number"  ? body.displayOrder  : undefined,
    status:           body.status           as string | undefined,
    seoTitle:         body.seoTitle         as string | null | undefined,
    seoDescription:   body.seoDescription   as string | null | undefined,
  };
}

router.get("/series", async (_req, res) => {
  try {
    const series = await db.select().from(seriesTable).orderBy(seriesTable.displayOrder, seriesTable.title);
    res.json({ series });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.get("/series/:id", async (req, res) => {
  try {
    const rows = await db.select().from(seriesTable).where(eq(seriesTable.id, Number(req.params.id))).limit(1);
    if (!rows.length) { res.status(404).json({ error: "Not found" }); return; }
    res.json({ series: rows[0] });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.post("/series", async (req, res) => {
  try {
    const { id: _id, createdAt: _c, updatedAt: _u, ...body } = req.body;
    const now = new Date();
    const [series] = await db.insert(seriesTable).values({
      ...pickSeriesFields(body) as never,
      createdAt: now, updatedAt: now,
    }).returning();
    res.json({ series });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.put("/series/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { id: _id, createdAt: _c, updatedAt: _u, ...body } = req.body;
    const now = new Date();
    const [series] = await db.update(seriesTable).set({
      ...pickSeriesFields(body) as never,
      updatedAt: now,
    }).where(eq(seriesTable.id, id)).returning();
    if (!series) { res.status(404).json({ error: "Not found" }); return; }
    res.json({ series });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.delete("/series/:id", async (req, res) => {
  try {
    await db.delete(seriesTable).where(eq(seriesTable.id, Number(req.params.id)));
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

// ── Media Assets ──────────────────────────────────────────────────────────────

router.get("/media", async (req, res) => {
  try {
    const q    = typeof req.query.q           === "string" ? req.query.q           : undefined;
    const ct   = typeof req.query.contentType === "string" ? req.query.contentType : undefined;
    const sort = typeof req.query.sort        === "string" ? req.query.sort        : "newest";

    const whereClause = q && ct && ct !== "all"
      ? and(
          eq(mediaAssetsTable.contentType, ct),
          or(ilike(mediaAssetsTable.filename, `%${q}%`), ilike(mediaAssetsTable.altText, `%${q}%`)),
        )
      : ct && ct !== "all"
      ? eq(mediaAssetsTable.contentType, ct)
      : q
      ? or(ilike(mediaAssetsTable.filename, `%${q}%`), ilike(mediaAssetsTable.altText, `%${q}%`))
      : undefined;

    const orderCol = sort === "oldest" ? mediaAssetsTable.createdAt
      : sort === "name"                ? mediaAssetsTable.filename
      : sort === "size"                ? desc(mediaAssetsTable.sizeBytes)
      :                                  desc(mediaAssetsTable.createdAt);

    const assets = await db.select().from(mediaAssetsTable)
      .where(whereClause)
      .orderBy(orderCol)
      .limit(200);

    res.json({ assets });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.get("/media/:id", async (req, res) => {
  try {
    const rows = await db.select().from(mediaAssetsTable)
      .where(eq(mediaAssetsTable.id, Number(req.params.id))).limit(1);
    if (!rows.length) { res.status(404).json({ error: "Not found" }); return; }
    res.json({ asset: rows[0] });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.put("/media/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const body = req.body as {
      title?: string | null; altText?: string | null;
      tags?: string[] | null; contentType?: string; usageContext?: string;
    };
    const patch: Record<string, unknown> = { updatedAt: new Date() };
    if ("title"       in body) patch.title       = body.title;
    if ("altText"     in body) patch.altText      = body.altText;
    if ("tags"        in body) patch.tags         = body.tags;
    if ("contentType" in body) patch.contentType  = body.contentType;
    if ("usageContext" in body) patch.usageContext = body.usageContext;

    const [asset] = await db.update(mediaAssetsTable)
      .set(patch as never)
      .where(eq(mediaAssetsTable.id, id))
      .returning();
    if (!asset) { res.status(404).json({ error: "Not found" }); return; }
    res.json({ asset });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.delete("/media/:id", async (req, res) => {
  try {
    const id   = Number(req.params.id);
    const rows = await db.select().from(mediaAssetsTable)
      .where(eq(mediaAssetsTable.id, id)).limit(1);
    if (!rows.length) { res.status(404).json({ error: "Not found" }); return; }
    const asset = rows[0];

    if (!req.query.force) {
      const artUsage = await db
        .select({ id: articlesTable.id, title: articlesTable.title })
        .from(articlesTable)
        .where(or(
          eq(articlesTable.coverImageUrl,    asset.publicUrl),
          eq(articlesTable.coverThumbnailUrl, asset.publicUrl),
        ));
      const vidUsage = await db
        .select({ id: videosTable.id, title: videosTable.title })
        .from(videosTable)
        .where(or(
          eq(videosTable.thumbnailUrl,      asset.publicUrl),
          eq(videosTable.thumbnailSmallUrl, asset.publicUrl),
        ));

      if (artUsage.length + vidUsage.length > 0) {
        res.status(409).json({
          error: "Ảnh này đang được sử dụng trong nội dung khác.",
          usages: { articles: artUsage, videos: vidUsage },
        });
        return;
      }
    }

    await db.delete(mediaAssetsTable).where(eq(mediaAssetsTable.id, id));
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

/* ── Analytics ────────────────────────────────────────────────────────── */
router.get("/analytics", async (req, res) => {
  try {
    const days = Math.min(Math.max(Number(req.query.days ?? 30), 1), 365);
    const from = req.query.from
      ? new Date(String(req.query.from))
      : new Date(Date.now() - days * 86_400_000);
    const to   = req.query.to ? new Date(String(req.query.to)) : new Date();

    const [agg] = await db.select({
      totalArticleViews:  sql<number>`SUM(CASE WHEN event_type = 'article_view'  THEN 1 ELSE 0 END)::int`,
      totalArticleClicks: sql<number>`SUM(CASE WHEN event_type = 'article_click' THEN 1 ELSE 0 END)::int`,
      totalVideoClicks:   sql<number>`SUM(CASE WHEN event_type = 'video_click'   THEN 1 ELSE 0 END)::int`,
      totalCtaClicks:     sql<number>`SUM(CASE WHEN event_type = 'cta_click'     THEN 1 ELSE 0 END)::int`,
      uniqueVisitors:     sql<number>`COUNT(DISTINCT CASE WHEN visitor_id IS NOT NULL THEN visitor_id END)::int`,
    }).from(analyticsEventsTable)
      .where(and(gte(analyticsEventsTable.createdAt, from), lte(analyticsEventsTable.createdAt, to)));

    const rawArticles = await db.select({
      slug:   analyticsEventsTable.entitySlug,
      views:  sql<number>`SUM(CASE WHEN event_type = 'article_view'  THEN 1 ELSE 0 END)::int`,
      clicks: sql<number>`SUM(CASE WHEN event_type = 'article_click' THEN 1 ELSE 0 END)::int`,
      total:  sql<number>`COUNT(*)::int`,
    }).from(analyticsEventsTable)
      .where(and(
        eq(analyticsEventsTable.entityType, "article"),
        isNotNull(analyticsEventsTable.entitySlug),
        gte(analyticsEventsTable.createdAt, from),
        lte(analyticsEventsTable.createdAt, to),
      ))
      .groupBy(analyticsEventsTable.entitySlug)
      .orderBy(desc(sql`COUNT(*)`))
      .limit(20);

    const rawVideos = await db.select({
      slug:   analyticsEventsTable.entitySlug,
      clicks: sql<number>`COUNT(*)::int`,
    }).from(analyticsEventsTable)
      .where(and(
        eq(analyticsEventsTable.eventType, "video_click"),
        isNotNull(analyticsEventsTable.entitySlug),
        gte(analyticsEventsTable.createdAt, from),
        lte(analyticsEventsTable.createdAt, to),
      ))
      .groupBy(analyticsEventsTable.entitySlug)
      .orderBy(desc(sql`COUNT(*)`))
      .limit(20);

    const topCtas = await db.select({
      label:  analyticsEventsTable.eventLabel,
      clicks: sql<number>`COUNT(*)::int`,
    }).from(analyticsEventsTable)
      .where(and(
        eq(analyticsEventsTable.eventType, "cta_click"),
        isNotNull(analyticsEventsTable.eventLabel),
        gte(analyticsEventsTable.createdAt, from),
        lte(analyticsEventsTable.createdAt, to),
      ))
      .groupBy(analyticsEventsTable.eventLabel)
      .orderBy(desc(sql`COUNT(*)`))
      .limit(20);

    const rawTopics = await db.select({
      slug:   analyticsEventsTable.entitySlug,
      clicks: sql<number>`COUNT(*)::int`,
    }).from(analyticsEventsTable)
      .where(and(
        eq(analyticsEventsTable.eventType, "topic_click"),
        isNotNull(analyticsEventsTable.entitySlug),
        gte(analyticsEventsTable.createdAt, from),
        lte(analyticsEventsTable.createdAt, to),
      ))
      .groupBy(analyticsEventsTable.entitySlug)
      .orderBy(desc(sql`COUNT(*)`))
      .limit(10);

    // ── Title resolution via bulk IN lookups ──
    const articleSlugs = rawArticles.map((r) => r.slug).filter(Boolean) as string[];
    const videoSlugs   = rawVideos.map((r) => r.slug).filter(Boolean) as string[];
    const topicSlugs   = rawTopics.map((r) => r.slug).filter(Boolean) as string[];

    const [kbTitles, newsTitles, videoTitles, topicTitles] = await Promise.all([
      articleSlugs.length
        ? db.select({ slug: articlesTable.slug, title: articlesTable.title }).from(articlesTable)
            .where(sql`slug = ANY(${sql.raw("ARRAY[" + articleSlugs.map((s) => `'${s.replace(/'/g, "''")}'`).join(",") + "]")})`).limit(20)
        : Promise.resolve([] as { slug: string; title: string }[]),
      articleSlugs.length
        ? db.select({ slug: newsPostsTable.slug, title: newsPostsTable.title }).from(newsPostsTable)
            .where(sql`slug = ANY(${sql.raw("ARRAY[" + articleSlugs.map((s) => `'${s.replace(/'/g, "''")}'`).join(",") + "]")})`).limit(20)
        : Promise.resolve([] as { slug: string; title: string }[]),
      videoSlugs.length
        ? db.select({ slug: videosTable.slug, title: videosTable.title }).from(videosTable)
            .where(sql`slug = ANY(${sql.raw("ARRAY[" + videoSlugs.map((s) => `'${s.replace(/'/g, "''")}'`).join(",") + "]")})`).limit(20)
        : Promise.resolve([] as { slug: string; title: string }[]),
      topicSlugs.length
        ? db.select({ slug: topicsTable.slug, title: topicsTable.title }).from(topicsTable)
            .where(sql`slug = ANY(${sql.raw("ARRAY[" + topicSlugs.map((s) => `'${s.replace(/'/g, "''")}'`).join(",") + "]")})`).limit(10)
        : Promise.resolve([] as { slug: string; title: string }[]),
    ]);

    const articleTitleMap = new Map<string, string>();
    for (const r of kbTitles)  articleTitleMap.set(r.slug, r.title);
    for (const r of newsTitles) if (!articleTitleMap.has(r.slug)) articleTitleMap.set(r.slug, r.title);
    const videoTitleMap = new Map(videoTitles.map((r) => [r.slug, r.title]));
    const topicTitleMap = new Map(topicTitles.map((r) => [r.slug, r.title]));

    const topArticles = rawArticles.map((r) => ({
      slug:   r.slug,
      title:  r.slug ? (articleTitleMap.get(r.slug) ?? null) : null,
      views:  r.views  ?? 0,
      clicks: r.clicks ?? 0,
      total:  r.total  ?? 0,
    }));
    const topVideos = rawVideos.map((r) => ({
      slug:   r.slug,
      title:  r.slug ? (videoTitleMap.get(r.slug) ?? null) : null,
      clicks: r.clicks ?? 0,
    }));
    const topTopics = rawTopics.map((r) => ({
      slug:   r.slug,
      title:  r.slug ? (topicTitleMap.get(r.slug) ?? null) : null,
      clicks: r.clicks ?? 0,
    }));

    const trend = await db.select({
      date:          sql<string>`DATE_TRUNC('day', created_at)::date::text`,
      articleViews:  sql<number>`SUM(CASE WHEN event_type = 'article_view'  THEN 1 ELSE 0 END)::int`,
      articleClicks: sql<number>`SUM(CASE WHEN event_type = 'article_click' THEN 1 ELSE 0 END)::int`,
      videoClicks:   sql<number>`SUM(CASE WHEN event_type = 'video_click'   THEN 1 ELSE 0 END)::int`,
      ctaClicks:     sql<number>`SUM(CASE WHEN event_type = 'cta_click'     THEN 1 ELSE 0 END)::int`,
    }).from(analyticsEventsTable)
      .where(and(gte(analyticsEventsTable.createdAt, from), lte(analyticsEventsTable.createdAt, to)))
      .groupBy(sql`DATE_TRUNC('day', created_at)`)
      .orderBy(sql`DATE_TRUNC('day', created_at) ASC`)
      .limit(120);

    res.json({
      summary: {
        totalArticleViews:  agg?.totalArticleViews  ?? 0,
        totalArticleClicks: agg?.totalArticleClicks ?? 0,
        totalVideoClicks:   agg?.totalVideoClicks   ?? 0,
        totalCtaClicks:     agg?.totalCtaClicks     ?? 0,
        uniqueVisitors:     agg?.uniqueVisitors     ?? 0,
      },
      topArticles: topArticles.map((r) => ({ slug: r.slug, title: r.title, views: r.views ?? 0, clicks: r.clicks ?? 0, total: r.total ?? 0 })),
      topVideos:   topVideos.map((r)   => ({ slug: r.slug, title: r.title, clicks: r.clicks ?? 0 })),
      topCtas:     topCtas.map((r)     => ({ label: r.label, clicks: r.clicks ?? 0 })),
      topTopics:   topTopics.map((r)   => ({ slug: r.slug, title: r.title, clicks: r.clicks ?? 0 })),
      trend:       trend.map((r)       => ({
        date:          r.date,
        articleViews:  r.articleViews  ?? 0,
        articleClicks: r.articleClicks ?? 0,
        videoClicks:   r.videoClicks   ?? 0,
        ctaClicks:     r.ctaClicks     ?? 0,
      })),
    });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

/* ══════════════════════════════════════════════════════════════════
   CONTACT WIDGET SETTINGS
══════════════════════════════════════════════════════════════════ */

router.get("/contact-widget", requireAdmin, async (_req, res) => {
  try {
    const [row] = await db.select().from(contactWidgetSettingsTable).limit(1);
    if (!row) {
      // Auto-create default row
      const [created] = await db.insert(contactWidgetSettingsTable).values({}).returning();
      res.json(created);
    } else {
      res.json(row);
    }
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.patch("/contact-widget", requireAdmin, async (req, res) => {
  try {
    const {
      isEnabled, widgetTitle, widgetSubtitle, showLabels, showTooltips,
      desktopOffsetX, desktopOffsetY, mobileOffsetX, mobileOffsetY,
      showOnDesktop, showOnMobile, defaultOpen, themeVariant,
    } = req.body as Record<string, unknown>;

    const [existing] = await db.select().from(contactWidgetSettingsTable).limit(1);
    if (!existing) {
      const [row] = await db.insert(contactWidgetSettingsTable).values({}).returning();
      res.json(row);
      return;
    }

    const update: Record<string, unknown> = { updatedAt: new Date() };
    if (typeof isEnabled      === "boolean")  update.isEnabled      = isEnabled;
    if (typeof showLabels     === "boolean")  update.showLabels     = showLabels;
    if (typeof showTooltips   === "boolean")  update.showTooltips   = showTooltips;
    if (typeof showOnDesktop  === "boolean")  update.showOnDesktop  = showOnDesktop;
    if (typeof showOnMobile   === "boolean")  update.showOnMobile   = showOnMobile;
    if (typeof defaultOpen    === "boolean")  update.defaultOpen    = defaultOpen;
    if (widgetTitle   !== undefined)          update.widgetTitle    = widgetTitle   || null;
    if (widgetSubtitle !== undefined)         update.widgetSubtitle = widgetSubtitle || null;
    if (themeVariant  !== undefined)          update.themeVariant   = themeVariant  || null;
    if (typeof desktopOffsetX === "number")   update.desktopOffsetX = desktopOffsetX;
    if (typeof desktopOffsetY === "number")   update.desktopOffsetY = desktopOffsetY;
    if (typeof mobileOffsetX  === "number")   update.mobileOffsetX  = mobileOffsetX;
    if (typeof mobileOffsetY  === "number")   update.mobileOffsetY  = mobileOffsetY;

    const [updated] = await db.update(contactWidgetSettingsTable)
      .set(update)
      .where(eq(contactWidgetSettingsTable.id, existing.id))
      .returning();
    res.json(updated);
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

/* ══════════════════════════════════════════════════════════════════
   CONTACT CHANNELS
══════════════════════════════════════════════════════════════════ */

router.get("/contact-channels", requireAdmin, async (_req, res) => {
  try {
    const rows = await db.select().from(contactChannelsTable)
      .orderBy(contactChannelsTable.displayOrder);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.post("/contact-channels", requireAdmin, async (req, res) => {
  try {
    const {
      channelType, label, value, iconKey, tooltipText,
      isEnabled, displayOrder, openMode, showOnDesktop, showOnMobile,
    } = req.body as Record<string, unknown>;

    if (!channelType || !label || !value) {
      res.status(400).json({ error: "channelType, label, and value are required" });
      return;
    }
    const [row] = await db.insert(contactChannelsTable).values({
      channelType:   String(channelType),
      label:         String(label),
      value:         String(value),
      iconKey:       typeof iconKey   === "string" ? iconKey   : null,
      tooltipText:   typeof tooltipText === "string" ? tooltipText : null,
      isEnabled:     typeof isEnabled  === "boolean" ? isEnabled  : true,
      displayOrder:  typeof displayOrder === "number" ? displayOrder : 0,
      openMode:      typeof openMode   === "string" ? openMode   : "new_tab",
      showOnDesktop: typeof showOnDesktop === "boolean" ? showOnDesktop : true,
      showOnMobile:  typeof showOnMobile  === "boolean" ? showOnMobile  : true,
    }).returning();
    res.json(row);
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.patch("/contact-channels/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const {
      channelType, label, value, iconKey, tooltipText,
      isEnabled, displayOrder, openMode, showOnDesktop, showOnMobile,
    } = req.body as Record<string, unknown>;

    const update: Record<string, unknown> = { updatedAt: new Date() };
    if (typeof channelType   === "string")  update.channelType   = channelType;
    if (typeof label         === "string")  update.label         = label;
    if (typeof value         === "string")  update.value         = value;
    if (iconKey    !== undefined)           update.iconKey       = iconKey    || null;
    if (tooltipText !== undefined)          update.tooltipText   = tooltipText || null;
    if (typeof isEnabled     === "boolean") update.isEnabled     = isEnabled;
    if (typeof displayOrder  === "number")  update.displayOrder  = displayOrder;
    if (typeof openMode      === "string")  update.openMode      = openMode;
    if (typeof showOnDesktop === "boolean") update.showOnDesktop = showOnDesktop;
    if (typeof showOnMobile  === "boolean") update.showOnMobile  = showOnMobile;

    const [updated] = await db.update(contactChannelsTable)
      .set(update)
      .where(eq(contactChannelsTable.id, id))
      .returning();
    if (!updated) { res.status(404).json({ error: "Not found" }); return; }
    res.json(updated);
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.delete("/contact-channels/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    await db.delete(contactChannelsTable).where(eq(contactChannelsTable.id, id));
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

export default router;
