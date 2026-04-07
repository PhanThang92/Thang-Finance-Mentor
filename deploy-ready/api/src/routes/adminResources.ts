/* ─────────────────────────────────────────────────────────────────────────
   Admin resource routes — mounted at /api/admin/resources
   All routes require Bearer admin key.

   File upload:   POST   /upload-file
   List:          GET    /
   Create:        POST   /
   Get one:       GET    /:id
   Update:        PUT    /:id
   Delete:        DELETE /:id
   Analytics:     GET    /:id/analytics
   ───────────────────────────────────────────────────────────────────────── */

import { Router, type Request, type Response, type NextFunction } from "express";
import { randomUUID } from "crypto";
import multer from "multer";
import { storage } from "../lib/storage.js";
import { db, leadMagnetsTable, resourceAccessEventsTable } from "../lib/db/index.js";
import { eq, desc, count, sql } from "drizzle-orm";

const router = Router();

/* ── Admin key guard ──────────────────────────────────────────────── */
const ADMIN_KEY = process.env["ADMIN_KEY"] ?? "swc-admin-2026";
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers["authorization"] ?? "";
  if (auth.replace(/^Bearer\s+/i, "").trim() !== ADMIN_KEY) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}
router.use(requireAdmin);

/* ── File storage managed by storage abstraction (see src/lib/storage.ts) ── */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB
  fileFilter: (_req, file, cb) => {
    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/zip",
      "text/plain",
      "text/csv",
    ];
    cb(null, allowed.includes(file.mimetype));
  },
});

/* ── POST /upload-file ──────────────────────────────────────────── */
router.post("/upload-file", upload.single("file"), async (req: Request, res: Response) => {
  if (!req.file) { res.status(400).json({ error: "Không có tệp được tải lên" }); return; }

  try {
    const originalExt  = req.file.originalname.includes(".") ? `.${req.file.originalname.split(".").pop()!.toLowerCase()}` : "";
    const safeName     = `${randomUUID()}${originalExt}`;
    const publicUrl    = await storage.save(req.file.buffer, `resources/${safeName}`, req.file.mimetype);

    res.json({
      ok:           true,
      url:          publicUrl,
      fileName:     req.file.originalname,
      fileSize:     req.file.size,
      fileMimeType: req.file.mimetype,
    });
  } catch (e) {
    console.error("[admin/resources/upload-file]", e);
    res.status(500).json({ error: "Lỗi khi lưu tệp" });
  }
});

/* ── GET / — list all (any status) ──────────────────────────────── */
router.get("/", async (_req, res) => {
  try {
    const resources = await db
      .select()
      .from(leadMagnetsTable)
      .orderBy(desc(leadMagnetsTable.updatedAt));
    res.json({ resources });
  } catch (e) {
    console.error("[admin/resources/list]", e);
    res.status(500).json({ error: "Có lỗi xảy ra" });
  }
});

/* ── GET /:id — get one ──────────────────────────────────────────── */
router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params["id"]);
    if (!id) { res.status(400).json({ error: "ID không hợp lệ" }); return; }
    const [resource] = await db.select().from(leadMagnetsTable).where(eq(leadMagnetsTable.id, id)).limit(1);
    if (!resource) { res.status(404).json({ error: "Không tìm thấy tài liệu" }); return; }
    res.json({ resource });
  } catch (e) {
    res.status(500).json({ error: "Có lỗi xảy ra" });
  }
});

/* ── POST / — create ────────────────────────────────────────────── */
router.post("/", async (req, res) => {
  try {
    const body = req.body as Partial<typeof leadMagnetsTable.$inferInsert>;
    const now  = new Date();

    const slug = (body.slug ?? "").trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    if (!body.title?.trim()) { res.status(400).json({ error: "Tiêu đề không được để trống" }); return; }
    if (!slug)               { res.status(400).json({ error: "Đường dẫn tĩnh không được để trống" }); return; }

    const [resource] = await db.insert(leadMagnetsTable).values({
      title:           body.title.trim(),
      slug,
      shortDescription: body.shortDescription ?? null,
      fullDescription:  body.fullDescription  ?? null,
      resourceType:    body.resourceType    ?? "file",
      coverImageUrl:   body.coverImageUrl   ?? null,
      coverImageAlt:   body.coverImageAlt   ?? null,
      fileUrl:         body.fileUrl         ?? null,
      fileName:        body.fileName        ?? null,
      fileSize:        body.fileSize        ?? null,
      fileMimeType:    body.fileMimeType    ?? null,
      externalUrl:     body.externalUrl     ?? null,
      thankYouMessage: body.thankYouMessage ?? null,
      buttonLabel:     body.buttonLabel     ?? null,
      status:          body.status          ?? "draft",
      gatingMode:      body.gatingMode      ?? "email_unlock",
      deliveryMode:    body.deliveryMode    ?? "direct",
      featured:        Boolean(body.featured),
      topicSlug:       body.topicSlug       ?? null,
      tags:            body.tags            ?? null,
      ctaTitle:        body.ctaTitle        ?? null,
      ctaDescription:  body.ctaDescription  ?? null,
      seoTitle:        body.seoTitle        ?? null,
      seoDescription:  body.seoDescription  ?? null,
      ogImageUrl:      body.ogImageUrl      ?? null,
      requiresPhone:   Boolean(body.requiresPhone),
      sortOrder:       body.sortOrder       ?? 0,
      createdAt:       now,
      updatedAt:       now,
    }).returning();

    res.status(201).json({ resource });
  } catch (e: unknown) {
    const msg = String(e);
    if (msg.includes("unique")) {
      res.status(409).json({ error: "Đường dẫn tĩnh đã tồn tại" });
    } else {
      console.error("[admin/resources/create]", e);
      res.status(500).json({ error: "Có lỗi xảy ra" });
    }
  }
});

/* ── PUT /:id — update ──────────────────────────────────────────── */
router.put("/:id", async (req, res) => {
  try {
    const id   = Number(req.params["id"]);
    const body = req.body as Partial<typeof leadMagnetsTable.$inferInsert>;
    const now  = new Date();

    const patch: Record<string, unknown> = { updatedAt: now };

    const strFields = [
      "title", "slug", "shortDescription", "fullDescription", "resourceType",
      "coverImageUrl", "coverImageAlt", "fileUrl", "fileName", "fileMimeType",
      "externalUrl", "thankYouMessage", "buttonLabel", "status", "gatingMode",
      "deliveryMode", "topicSlug", "ctaTitle", "ctaDescription",
      "seoTitle", "seoDescription", "ogImageUrl",
    ] as const;
    for (const f of strFields) if (f in body) patch[f] = body[f] ?? null;

    if ("fileSize"     in body) patch.fileSize     = body.fileSize     ?? null;
    if ("sortOrder"    in body) patch.sortOrder    = body.sortOrder    ?? 0;
    if ("featured"     in body) patch.featured     = Boolean(body.featured);
    if ("requiresPhone"in body) patch.requiresPhone= Boolean(body.requiresPhone);
    if ("tags"         in body) patch.tags         = body.tags         ?? null;

    // Slugify if slug is being updated
    if (patch.slug) patch.slug = String(patch.slug).trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    await db.update(leadMagnetsTable).set(patch as Parameters<typeof db.update>[0]["set"]).where(eq(leadMagnetsTable.id, id));

    const [updated] = await db.select().from(leadMagnetsTable).where(eq(leadMagnetsTable.id, id)).limit(1);
    res.json({ resource: updated });
  } catch (e: unknown) {
    const msg = String(e);
    if (msg.includes("unique")) {
      res.status(409).json({ error: "Đường dẫn tĩnh đã tồn tại" });
    } else {
      console.error("[admin/resources/update]", e);
      res.status(500).json({ error: "Có lỗi xảy ra" });
    }
  }
});

/* ── DELETE /:id ─────────────────────────────────────────────────── */
router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params["id"]);
    const [resource] = await db.select({ fileUrl: leadMagnetsTable.fileUrl }).from(leadMagnetsTable).where(eq(leadMagnetsTable.id, id)).limit(1);

    await db.delete(leadMagnetsTable).where(eq(leadMagnetsTable.id, id));

    // Try to clean up stored file via storage abstraction
    if (resource?.fileUrl) {
      const match = resource.fileUrl.match(/\/api\/uploads\/(resources\/.+)$/);
      if (match?.[1]) await storage.delete(match[1]).catch(() => {});
    }

    res.json({ ok: true });
  } catch (e) {
    console.error("[admin/resources/delete]", e);
    res.status(500).json({ error: "Có lỗi xảy ra" });
  }
});

/* ── GET /:id/analytics ─────────────────────────────────────────── */
router.get("/:id/analytics", async (req, res) => {
  try {
    const id = Number(req.params["id"]);

    const [pageViews] = await db
      .select({ c: count() })
      .from(resourceAccessEventsTable)
      .where(eq(resourceAccessEventsTable.resourceId, id));
    // Using sql`` for conditional counts
    const eventRows = await db
      .select({ accessType: resourceAccessEventsTable.accessType, c: count() })
      .from(resourceAccessEventsTable)
      .where(eq(resourceAccessEventsTable.resourceId, id))
      .groupBy(resourceAccessEventsTable.accessType);

    const counts: Record<string, number> = {};
    for (const row of eventRows) counts[row.accessType] = Number(row.c);

    // Unique emails
    const [uniqueEmails] = await db.execute<{ c: string }>(
      sql`SELECT COUNT(DISTINCT email) AS c FROM resource_access_events WHERE resource_id = ${id} AND email IS NOT NULL`
    );

    // Recent 10 events
    const recent = await db
      .select({ accessType: resourceAccessEventsTable.accessType, fullName: resourceAccessEventsTable.fullName, email: resourceAccessEventsTable.email, sourcePage: resourceAccessEventsTable.sourcePage, createdAt: resourceAccessEventsTable.createdAt })
      .from(resourceAccessEventsTable)
      .where(eq(resourceAccessEventsTable.resourceId, id))
      .orderBy(desc(resourceAccessEventsTable.createdAt))
      .limit(10);

    // Top sources
    const topSources = await db
      .select({ sourcePage: resourceAccessEventsTable.sourcePage, c: count() })
      .from(resourceAccessEventsTable)
      .where(eq(resourceAccessEventsTable.resourceId, id))
      .groupBy(resourceAccessEventsTable.sourcePage)
      .orderBy(desc(count()))
      .limit(5);

    const totalUnlocks   = counts["unlock"]     ?? 0;
    const totalDownloads = counts["download"]   ?? 0;
    const totalEmailSent = counts["email_sent"] ?? 0;
    const totalPageViews = counts["page_view"]  ?? 0;
    const conversionRate = totalPageViews > 0
      ? Math.round((totalUnlocks / totalPageViews) * 100)
      : 0;

    res.json({
      totalPageViews, totalUnlocks, totalDownloads, totalEmailSent,
      conversionRate,
      uniqueEmails:  Number((uniqueEmails as { c?: string } | undefined)?.c ?? 0),
      recent,
      topSources,
    });
  } catch (e) {
    console.error("[admin/resources/analytics]", e);
    res.status(500).json({ error: "Có lỗi xảy ra" });
  }
});

export default router;
