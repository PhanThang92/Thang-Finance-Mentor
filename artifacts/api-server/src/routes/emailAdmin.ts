/* ─────────────────────────────────────────────────────────────────────────
   Admin email routes — mounted at /admin/email
   All routes require Bearer admin key.

   Subscribers:  GET /subscribers, PATCH /subscribers/:id
   Campaigns:    GET|POST /campaigns, GET|PUT|DELETE /campaigns/:id,
                 POST /campaigns/:id/send, POST /campaigns/:id/test
   Sequences:    GET|POST /sequences, PUT|DELETE /sequences/:id
   Steps:        GET|POST /sequences/:id/steps, PUT|DELETE /steps/:id
   Stats:        GET /stats
   ───────────────────────────────────────────────────────────────────────── */

import { Router, type Request, type Response, type NextFunction } from "express";
import {
  db, emailSubscribersTable, emailCampaignsTable, emailEventsTable,
  emailSequencesTable, emailSequenceStepsTable, emailSequenceEnrollmentsTable,
} from "@workspace/db";
import { eq, desc, ilike, or, and, sql, gte, asc, count } from "drizzle-orm";
import { sendCampaignToSubscribers, sendTestEmail } from "../services/emailService.js";

const router = Router();

/* ── Auth ────────────────────────────────────────────────────────────── */
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const adminKey = process.env["ADMIN_KEY"] ?? "swc-admin-2026";
  const auth = req.headers["authorization"] ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (token !== adminKey) { res.status(401).json({ error: "Unauthorized" }); return; }
  next();
}
router.use(requireAdmin);

/* ═══════════════════════════════════════════════════════════════════════
   STATS
═══════════════════════════════════════════════════════════════════════ */

router.get("/stats", async (_req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86_400_000);

    const [totalSubs]    = await db.select({ c: count() }).from(emailSubscribersTable);
    const [activeSubs]   = await db.select({ c: count() }).from(emailSubscribersTable)
      .where(eq(emailSubscribersTable.subscriberStatus, "subscribed"));
    const [recentSubs]   = await db.select({ c: count() }).from(emailSubscribersTable)
      .where(gte(emailSubscribersTable.subscribedAt, thirtyDaysAgo));
    const [totalCampaigns] = await db.select({ c: count() }).from(emailCampaignsTable);
    const [sentCampaigns]  = await db.select({ c: count() }).from(emailCampaignsTable)
      .where(eq(emailCampaignsTable.status, "sent"));
    const [totalSent]    = await db.select({ c: count() }).from(emailEventsTable)
      .where(eq(emailEventsTable.eventType, "sent"));
    const [activeSeqs]   = await db.select({ c: count() }).from(emailSequencesTable)
      .where(eq(emailSequencesTable.status, "active"));

    const recentCampaigns = await db
      .select({ id: emailCampaignsTable.id, title: emailCampaignsTable.title, status: emailCampaignsTable.status, sentAt: emailCampaignsTable.sentAt, recipientCount: emailCampaignsTable.recipientCount })
      .from(emailCampaignsTable)
      .orderBy(desc(emailCampaignsTable.updatedAt))
      .limit(5);

    res.json({
      totalSubscribers:  totalSubs?.c  ?? 0,
      activeSubscribers: activeSubs?.c ?? 0,
      recentSubscribers: recentSubs?.c ?? 0,
      totalCampaigns:    totalCampaigns?.c ?? 0,
      sentCampaigns:     sentCampaigns?.c  ?? 0,
      totalEmailsSent:   totalSent?.c  ?? 0,
      activeSequences:   activeSeqs?.c ?? 0,
      recentCampaigns,
    });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

/* ═══════════════════════════════════════════════════════════════════════
   SUBSCRIBERS
═══════════════════════════════════════════════════════════════════════ */

router.get("/subscribers", async (req, res) => {
  try {
    const { q, status } = req.query as Record<string, string>;
    const conditions = [];
    if (status && status !== "all") conditions.push(eq(emailSubscribersTable.subscriberStatus, status));
    if (q?.trim()) {
      conditions.push(or(
        ilike(emailSubscribersTable.email, `%${q.trim()}%`),
        ilike(emailSubscribersTable.fullName, `%${q.trim()}%`),
      ));
    }
    const subscribers = await db
      .select()
      .from(emailSubscribersTable)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(emailSubscribersTable.subscribedAt))
      .limit(200);
    res.json({ subscribers });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.patch("/subscribers/:id", async (req, res) => {
  try {
    const id = Number(req.params["id"]);
    const { subscriberStatus, fullName, tags } = req.body;
    const now = new Date();
    const update: Record<string, unknown> = { updatedAt: now };
    if (subscriberStatus !== undefined) {
      update["subscriberStatus"] = subscriberStatus;
      if (subscriberStatus === "unsubscribed") update["unsubscribedAt"] = now;
      if (subscriberStatus === "subscribed")   { update["unsubscribedAt"] = null; update["subscribedAt"] = now; }
    }
    if (fullName !== undefined) update["fullName"] = fullName || null;
    if (tags !== undefined)     update["tags"] = tags;
    const [updated] = await db.update(emailSubscribersTable).set(update as Parameters<typeof db.update>[0]).where(eq(emailSubscribersTable.id, id)).returning();
    res.json({ subscriber: updated });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

/* ═══════════════════════════════════════════════════════════════════════
   CAMPAIGNS
═══════════════════════════════════════════════════════════════════════ */

router.get("/campaigns", async (_req, res) => {
  try {
    const campaigns = await db.select().from(emailCampaignsTable).orderBy(desc(emailCampaignsTable.updatedAt));
    res.json({ campaigns });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.get("/campaigns/:id", async (req, res) => {
  try {
    const [campaign] = await db.select().from(emailCampaignsTable).where(eq(emailCampaignsTable.id, Number(req.params["id"]))).limit(1);
    if (!campaign) { res.status(404).json({ error: "Not found" }); return; }
    res.json({ campaign });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.post("/campaigns", async (req, res) => {
  try {
    const { title, subject, previewText, campaignType, contentBody, targetType, targetTags } = req.body;
    if (!title?.trim() || !subject?.trim()) { res.status(400).json({ error: "Tiêu đề và tiêu đề email là bắt buộc." }); return; }
    const [campaign] = await db.insert(emailCampaignsTable).values({
      title: title.trim(), subject: subject.trim(),
      previewText: previewText?.trim() || null,
      campaignType: campaignType || "newsletter",
      contentBody: contentBody?.trim() || null,
      targetType: targetType || "all",
      targetTags: targetTags || null,
      status: "draft",
    }).returning();
    res.json({ campaign });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.put("/campaigns/:id", async (req, res) => {
  try {
    const id = Number(req.params["id"]);
    const { title, subject, previewText, contentBody, targetType, targetTags, campaignType } = req.body;
    const [existing] = await db.select().from(emailCampaignsTable).where(eq(emailCampaignsTable.id, id)).limit(1);
    if (!existing) { res.status(404).json({ error: "Not found" }); return; }
    if (existing.status === "sent") { res.status(400).json({ error: "Không thể chỉnh sửa chiến dịch đã gửi." }); return; }
    const [updated] = await db.update(emailCampaignsTable).set({
      title: title?.trim() || existing.title,
      subject: subject?.trim() || existing.subject,
      previewText: previewText?.trim() || null,
      contentBody: contentBody?.trim() || null,
      targetType: targetType || existing.targetType,
      targetTags: targetTags ?? existing.targetTags,
      campaignType: campaignType || existing.campaignType,
      updatedAt: new Date(),
    }).where(eq(emailCampaignsTable.id, id)).returning();
    res.json({ campaign: updated });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.delete("/campaigns/:id", async (req, res) => {
  try {
    const id = Number(req.params["id"]);
    const [existing] = await db.select({ status: emailCampaignsTable.status }).from(emailCampaignsTable).where(eq(emailCampaignsTable.id, id)).limit(1);
    if (!existing) { res.status(404).json({ error: "Not found" }); return; }
    if (existing.status === "sent") { res.status(400).json({ error: "Không thể xoá chiến dịch đã gửi." }); return; }
    await db.delete(emailCampaignsTable).where(eq(emailCampaignsTable.id, id));
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

/* POST /campaigns/:id/send — broadcast to subscribers */
router.post("/campaigns/:id/send", async (req, res) => {
  try {
    const id = Number(req.params["id"]);
    const [campaign] = await db.select().from(emailCampaignsTable).where(eq(emailCampaignsTable.id, id)).limit(1);
    if (!campaign) { res.status(404).json({ error: "Not found" }); return; }
    if (campaign.status === "sent") { res.status(400).json({ error: "Chiến dịch này đã được gửi rồi." }); return; }
    if (!campaign.contentBody?.trim()) { res.status(400).json({ error: "Nội dung email chưa được nhập." }); return; }

    // Resolve recipients
    let subscriberQuery = db.select().from(emailSubscribersTable)
      .where(eq(emailSubscribersTable.subscriberStatus, "subscribed"))
      .$dynamic();

    const subscribers = await subscriberQuery;

    if (subscribers.length === 0) {
      res.status(400).json({ error: "Không có người đăng ký nào để gửi." });
      return;
    }

    // Mark as sent immediately to prevent double-sends
    const now = new Date();
    await db.update(emailCampaignsTable).set({
      status: "sent", sentAt: now, recipientCount: subscribers.length, updatedAt: now,
    }).where(eq(emailCampaignsTable.id, id));

    // Send (async, after response)
    res.json({ ok: true, recipientCount: subscribers.length });

    // Fire and forget — track events
    void sendCampaignToSubscribers(campaign, subscribers).then(async ({ sent, failed }) => {
      console.log(`[campaign ${id}] Sent: ${sent}, Failed: ${failed}`);
      // Batch insert events
      if (sent > 0) {
        await db.insert(emailEventsTable).values(
          subscribers.map((s) => ({ subscriberId: s.id, campaignId: id, eventType: "sent" })),
        ).catch(console.error);
      }
      // Update final count
      await db.update(emailCampaignsTable).set({ recipientCount: sent }).where(eq(emailCampaignsTable.id, id)).catch(console.error);
    });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

/* POST /campaigns/:id/test — send test email */
router.post("/campaigns/:id/test", async (req, res) => {
  try {
    const id = Number(req.params["id"]);
    const { testEmail } = req.body;
    if (!testEmail?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testEmail.trim())) {
      res.status(400).json({ error: "Email không hợp lệ." });
      return;
    }
    const [campaign] = await db.select().from(emailCampaignsTable).where(eq(emailCampaignsTable.id, id)).limit(1);
    if (!campaign) { res.status(404).json({ error: "Not found" }); return; }
    const result = await sendTestEmail({
      to: testEmail.trim(),
      subject: campaign.subject,
      contentBody: campaign.contentBody ?? "",
    });
    res.json(result);
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

/* ═══════════════════════════════════════════════════════════════════════
   SEQUENCES
═══════════════════════════════════════════════════════════════════════ */

router.get("/sequences", async (_req, res) => {
  try {
    const sequences = await db.select().from(emailSequencesTable).orderBy(desc(emailSequencesTable.createdAt));
    res.json({ sequences });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.post("/sequences", async (req, res) => {
  try {
    const { title, description, triggerType, status } = req.body;
    if (!title?.trim()) { res.status(400).json({ error: "Tên chuỗi là bắt buộc." }); return; }
    const [sequence] = await db.insert(emailSequencesTable).values({
      title: title.trim(),
      description: description?.trim() || null,
      triggerType: triggerType || "on_subscribe",
      status: status || "active",
    }).returning();
    res.json({ sequence });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.put("/sequences/:id", async (req, res) => {
  try {
    const id = Number(req.params["id"]);
    const { title, description, triggerType, status } = req.body;
    const [updated] = await db.update(emailSequencesTable).set({
      title:       title?.trim()       || undefined,
      description: description?.trim() || null,
      triggerType: triggerType         || undefined,
      status:      status              || undefined,
      updatedAt:   new Date(),
    }).where(eq(emailSequencesTable.id, id)).returning();
    res.json({ sequence: updated });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.delete("/sequences/:id", async (req, res) => {
  try {
    await db.delete(emailSequencesTable).where(eq(emailSequencesTable.id, Number(req.params["id"])));
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

/* ═══════════════════════════════════════════════════════════════════════
   SEQUENCE STEPS
═══════════════════════════════════════════════════════════════════════ */

router.get("/sequences/:id/steps", async (req, res) => {
  try {
    const steps = await db.select().from(emailSequenceStepsTable)
      .where(eq(emailSequenceStepsTable.sequenceId, Number(req.params["id"])))
      .orderBy(asc(emailSequenceStepsTable.stepOrder));
    res.json({ steps });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.post("/sequences/:id/steps", async (req, res) => {
  try {
    const sequenceId = Number(req.params["id"]);
    const { subject, previewText, contentBody, delayDays, stepOrder } = req.body;
    if (!subject?.trim()) { res.status(400).json({ error: "Tiêu đề email là bắt buộc." }); return; }

    // Auto-assign stepOrder if not provided
    let order = Number(stepOrder) || 0;
    if (!order) {
      const [last] = await db.select({ o: emailSequenceStepsTable.stepOrder })
        .from(emailSequenceStepsTable)
        .where(eq(emailSequenceStepsTable.sequenceId, sequenceId))
        .orderBy(desc(emailSequenceStepsTable.stepOrder))
        .limit(1);
      order = (last?.o ?? 0) + 1;
    }

    const [step] = await db.insert(emailSequenceStepsTable).values({
      sequenceId,
      subject:     subject.trim(),
      previewText: previewText?.trim() || null,
      contentBody: contentBody?.trim() || null,
      delayDays:   Number(delayDays) || 0,
      stepOrder:   order,
      isActive:    true,
    }).returning();
    res.json({ step });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.put("/steps/:id", async (req, res) => {
  try {
    const id = Number(req.params["id"]);
    const { subject, previewText, contentBody, delayDays, isActive, stepOrder } = req.body;
    const [updated] = await db.update(emailSequenceStepsTable).set({
      subject:     subject?.trim()       || undefined,
      previewText: previewText?.trim()   || null,
      contentBody: contentBody?.trim()   || null,
      delayDays:   delayDays !== undefined ? Number(delayDays) : undefined,
      isActive:    isActive !== undefined ? Boolean(isActive) : undefined,
      stepOrder:   stepOrder !== undefined ? Number(stepOrder) : undefined,
      updatedAt:   new Date(),
    }).where(eq(emailSequenceStepsTable.id, id)).returning();
    res.json({ step: updated });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.delete("/steps/:id", async (req, res) => {
  try {
    await db.delete(emailSequenceStepsTable).where(eq(emailSequenceStepsTable.id, Number(req.params["id"])));
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

export default router;
