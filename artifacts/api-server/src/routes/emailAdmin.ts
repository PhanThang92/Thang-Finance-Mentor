/* ─────────────────────────────────────────────────────────────────────────
   Admin email routes — mounted at /admin/email
   All routes require Bearer admin key.

   Subscribers:  GET /subscribers, PATCH /subscribers/:id,
                 GET /subscribers/:id/enrollments,
                 POST /subscribers/:id/enroll
   Campaigns:    GET|POST /campaigns, GET|PUT|DELETE /campaigns/:id,
                 POST /campaigns/:id/send, POST /campaigns/:id/test
                 POST /campaigns/:id/duplicate
                 GET /campaigns/preview-count
   Sequences:    GET|POST /sequences, PUT|DELETE /sequences/:id
                 GET /sequences/:id/analytics
                 POST /sequences/seed
   Steps:        GET|POST /sequences/:id/steps, PUT|DELETE /steps/:id
   Stats:        GET /stats
   Settings:     GET|PUT /settings
   ───────────────────────────────────────────────────────────────────────── */

import { Router, type Request, type Response, type NextFunction } from "express";
import {
  db, emailSubscribersTable, emailCampaignsTable, emailEventsTable,
  emailSequencesTable, emailSequenceStepsTable, emailSequenceEnrollmentsTable,
} from "@workspace/db";
import { eq, desc, ilike, or, and, sql, gte, asc, count, inArray, lte, ne } from "drizzle-orm";
import { sendCampaignToSubscribers, sendTestEmail } from "../services/emailService.js";
import { enrollInSequencesByTags } from "../services/sequenceWorker.js";

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
    const [totalEnrolled] = await db.select({ c: count() }).from(emailSequenceEnrollmentsTable);
    const [activeEnrolled] = await db.select({ c: count() }).from(emailSequenceEnrollmentsTable)
      .where(eq(emailSequenceEnrollmentsTable.status, "active"));

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
      totalEnrolled:     totalEnrolled?.c ?? 0,
      activeEnrolled:    activeEnrolled?.c ?? 0,
      recentCampaigns,
    });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

/* ═══════════════════════════════════════════════════════════════════════
   EMAIL SETTINGS  (GET|PUT /settings)
═══════════════════════════════════════════════════════════════════════ */

router.get("/settings", (_req, res) => {
  res.json({
    senderName:    process.env["RESEND_FROM_NAME"]  ?? "Phan Văn Thắng SWC",
    senderEmail:   process.env["RESEND_FROM_EMAIL"] ?? "",
    replyToEmail:  process.env["RESEND_REPLY_TO"]   ?? "",
    siteUrl:       process.env["SITE_URL"]          ?? "",
    providerType:  process.env["RESEND_API_KEY"] ? "resend" : "none",
    apiKeyConfigured: !!process.env["RESEND_API_KEY"],
  });
});

/* ── POST /settings/test — send a test email ──────────────────────── */
router.post("/settings/test", async (req, res) => {
  try {
    const { toEmail } = req.body;
    if (!toEmail?.trim()) { res.status(400).json({ error: "Email là bắt buộc." }); return; }
    const result = await sendTestEmail({
      to: toEmail.trim(),
      subject: "Email thử nghiệm từ SWC Admin",
      contentBody: "Xin chào! Email này được gửi để kiểm tra cấu hình email của bạn. Nếu bạn nhận được email này, hệ thống gửi email đang hoạt động bình thường.",
    });
    res.json(result);
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

/* ═══════════════════════════════════════════════════════════════════════
   SUBSCRIBERS
═══════════════════════════════════════════════════════════════════════ */

router.get("/subscribers", async (req, res) => {
  try {
    const { q, status, stage, interest, source } = req.query as Record<string, string>;
    const conditions = [];
    if (status && status !== "all") conditions.push(eq(emailSubscribersTable.subscriberStatus, status));
    if (stage  && stage  !== "all") conditions.push(eq(emailSubscribersTable.stage, stage));
    if (interest && interest !== "all") conditions.push(eq(emailSubscribersTable.interestPrimary, interest));
    if (source && source !== "all") conditions.push(eq(emailSubscribersTable.sourceType, source));
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
      .limit(500);
    res.json({ subscribers });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.patch("/subscribers/:id", async (req, res) => {
  try {
    const id = Number(req.params["id"]);
    const { subscriberStatus, fullName, firstName, tags, stage, interestPrimary, sourceType } = req.body;
    const now = new Date();
    const update: Record<string, unknown> = { updatedAt: now };
    if (subscriberStatus !== undefined) {
      update["subscriberStatus"] = subscriberStatus;
      if (subscriberStatus === "unsubscribed") update["unsubscribedAt"] = now;
      if (subscriberStatus === "subscribed")   { update["unsubscribedAt"] = null; update["subscribedAt"] = now; }
    }
    if (fullName       !== undefined) update["fullName"]       = fullName || null;
    if (firstName      !== undefined) update["firstName"]      = firstName || null;
    if (tags           !== undefined) update["tags"]           = tags;
    if (stage          !== undefined) update["stage"]          = stage || null;
    if (interestPrimary !== undefined) update["interestPrimary"] = interestPrimary || null;
    if (sourceType     !== undefined) update["sourceType"]     = sourceType || null;
    const [updated] = await db.update(emailSubscribersTable)
      .set(update as any)
      .where(eq(emailSubscribersTable.id, id)).returning();
    res.json({ subscriber: updated });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

/* GET /subscribers/:id/enrollments — list sequence enrollments for this subscriber */
router.get("/subscribers/:id/enrollments", async (req, res) => {
  try {
    const id = Number(req.params["id"]);
    const enrollments = await db
      .select({
        enrollmentId: emailSequenceEnrollmentsTable.id,
        sequenceId:   emailSequenceEnrollmentsTable.sequenceId,
        seqTitle:     emailSequencesTable.title,
        status:       emailSequenceEnrollmentsTable.status,
        currentStep:  emailSequenceEnrollmentsTable.currentStep,
        nextSendAt:   emailSequenceEnrollmentsTable.nextSendAt,
        enrolledAt:   emailSequenceEnrollmentsTable.enrolledAt,
        completedAt:  emailSequenceEnrollmentsTable.completedAt,
      })
      .from(emailSequenceEnrollmentsTable)
      .leftJoin(emailSequencesTable, eq(emailSequenceEnrollmentsTable.sequenceId, emailSequencesTable.id))
      .where(eq(emailSequenceEnrollmentsTable.subscriberId, id))
      .orderBy(desc(emailSequenceEnrollmentsTable.enrolledAt));
    res.json({ enrollments });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

/* POST /subscribers/:id/enroll — manually enroll in a sequence */
router.post("/subscribers/:id/enroll", async (req, res) => {
  try {
    const subscriberId = Number(req.params["id"]);
    const { sequenceId, force } = req.body;
    if (!sequenceId) { res.status(400).json({ error: "sequenceId là bắt buộc." }); return; }

    const [subscriber] = await db.select().from(emailSubscribersTable).where(eq(emailSubscribersTable.id, subscriberId)).limit(1);
    if (!subscriber) { res.status(404).json({ error: "Không tìm thấy subscriber." }); return; }

    if (!force) {
      const [existing] = await db.select({ id: emailSequenceEnrollmentsTable.id, status: emailSequenceEnrollmentsTable.status })
        .from(emailSequenceEnrollmentsTable)
        .where(and(
          eq(emailSequenceEnrollmentsTable.subscriberId, subscriberId),
          eq(emailSequenceEnrollmentsTable.sequenceId, Number(sequenceId)),
        )).limit(1);
      if (existing && existing.status === "active") {
        res.status(400).json({ error: "Subscriber đã được đăng ký vào chuỗi này." });
        return;
      }
    }

    const [firstStep] = await db
      .select({ stepOrder: emailSequenceStepsTable.stepOrder, delayDays: emailSequenceStepsTable.delayDays })
      .from(emailSequenceStepsTable)
      .where(and(
        eq(emailSequenceStepsTable.sequenceId, Number(sequenceId)),
        eq(emailSequenceStepsTable.isActive, true),
      ))
      .orderBy(asc(emailSequenceStepsTable.stepOrder))
      .limit(1);

    const now = new Date();
    const nextSendAt = firstStep ? new Date(now.getTime() + firstStep.delayDays * 86_400_000) : now;

    const [enrollment] = await db.insert(emailSequenceEnrollmentsTable).values({
      subscriberId,
      sequenceId:  Number(sequenceId),
      currentStep: firstStep?.stepOrder ?? 1,
      status:      "active",
      nextSendAt,
      enrolledAt:  now,
    }).onConflictDoNothing().returning();

    res.json({ ok: true, enrollment });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

/* GET /subscribers/:id/activity — recent email events */
router.get("/subscribers/:id/activity", async (req, res) => {
  try {
    const id = Number(req.params["id"]);
    const events = await db
      .select({
        id: emailEventsTable.id,
        eventType: emailEventsTable.eventType,
        createdAt: emailEventsTable.createdAt,
        eventMetadata: emailEventsTable.eventMetadata,
        sequenceId: emailEventsTable.sequenceId,
        stepId: emailEventsTable.stepId,
        seqTitle: emailSequencesTable.title,
      })
      .from(emailEventsTable)
      .leftJoin(emailSequencesTable, eq(emailEventsTable.sequenceId, emailSequencesTable.id))
      .where(eq(emailEventsTable.subscriberId, id))
      .orderBy(desc(emailEventsTable.createdAt))
      .limit(50);
    res.json({ events });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

/* ═══════════════════════════════════════════════════════════════════════
   CAMPAIGNS
═══════════════════════════════════════════════════════════════════════ */

/* GET /campaigns/preview-count — count recipients for given targeting */
router.get("/campaigns/preview-count", async (req, res) => {
  try {
    const { targetType, targetTags, targetStage, targetSource, targetInterest } = req.query as Record<string, string>;

    let query = db.select({ c: count() })
      .from(emailSubscribersTable)
      .where(eq(emailSubscribersTable.subscriberStatus, "subscribed"))
      .$dynamic();

    if (targetType === "stage" && targetStage) {
      query = query.where(and(eq(emailSubscribersTable.subscriberStatus, "subscribed"), eq(emailSubscribersTable.stage, targetStage)));
    } else if (targetType === "source" && targetSource) {
      query = query.where(and(eq(emailSubscribersTable.subscriberStatus, "subscribed"), eq(emailSubscribersTable.sourceType, targetSource)));
    } else if (targetType === "interest" && targetInterest) {
      query = query.where(and(eq(emailSubscribersTable.subscriberStatus, "subscribed"), eq(emailSubscribersTable.interestPrimary, targetInterest)));
    }
    // For tagged: we can't easily filter JSONB array in Drizzle without raw SQL; return total for now
    const [result] = await query;
    res.json({ count: result?.c ?? 0 });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

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
    const { title, subject, previewText, campaignType, contentBody, targetType, targetTags, targetStage, targetSource, targetInterest } = req.body;
    if (!title?.trim() || !subject?.trim()) { res.status(400).json({ error: "Tiêu đề và tiêu đề email là bắt buộc." }); return; }
    const [campaign] = await db.insert(emailCampaignsTable).values({
      title: title.trim(), subject: subject.trim(),
      previewText: previewText?.trim() || null,
      campaignType: campaignType || "newsletter",
      contentBody: contentBody?.trim() || null,
      targetType: targetType || "all",
      targetTags: targetTags || null,
      targetStage: targetStage || null,
      targetSource: targetSource || null,
      targetInterest: targetInterest || null,
      status: "draft",
    }).returning();
    res.json({ campaign });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.put("/campaigns/:id", async (req, res) => {
  try {
    const id = Number(req.params["id"]);
    const { title, subject, previewText, contentBody, targetType, targetTags, targetStage, targetSource, targetInterest, campaignType } = req.body;
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
      targetStage: targetStage ?? existing.targetStage,
      targetSource: targetSource ?? existing.targetSource,
      targetInterest: targetInterest ?? existing.targetInterest,
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

/* POST /campaigns/:id/duplicate */
router.post("/campaigns/:id/duplicate", async (req, res) => {
  try {
    const [original] = await db.select().from(emailCampaignsTable).where(eq(emailCampaignsTable.id, Number(req.params["id"]))).limit(1);
    if (!original) { res.status(404).json({ error: "Not found" }); return; }
    const [copy] = await db.insert(emailCampaignsTable).values({
      title: `${original.title} (bản sao)`,
      subject: original.subject,
      previewText: original.previewText,
      campaignType: original.campaignType,
      contentBody: original.contentBody,
      targetType: original.targetType,
      targetTags: original.targetTags,
      targetStage: original.targetStage,
      targetSource: original.targetSource,
      targetInterest: original.targetInterest,
      status: "draft",
    }).returning();
    res.json({ campaign: copy });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

/* POST /campaigns/:id/send */
router.post("/campaigns/:id/send", async (req, res) => {
  try {
    const id = Number(req.params["id"]);
    const [campaign] = await db.select().from(emailCampaignsTable).where(eq(emailCampaignsTable.id, id)).limit(1);
    if (!campaign) { res.status(404).json({ error: "Not found" }); return; }
    if (campaign.status === "sent") { res.status(400).json({ error: "Chiến dịch này đã được gửi rồi." }); return; }
    if (!campaign.contentBody?.trim()) { res.status(400).json({ error: "Nội dung email chưa được nhập." }); return; }

    // Resolve recipients based on targeting
    let conditions: Parameters<typeof and>[0][] = [eq(emailSubscribersTable.subscriberStatus, "subscribed")];
    if (campaign.targetType === "stage" && campaign.targetStage)
      conditions.push(eq(emailSubscribersTable.stage, campaign.targetStage));
    if (campaign.targetType === "source" && campaign.targetSource)
      conditions.push(eq(emailSubscribersTable.sourceType, campaign.targetSource));
    if (campaign.targetType === "interest" && campaign.targetInterest)
      conditions.push(eq(emailSubscribersTable.interestPrimary, campaign.targetInterest));

    const subscribers = await db.select().from(emailSubscribersTable)
      .where(and(...conditions));

    if (subscribers.length === 0) {
      res.status(400).json({ error: "Không có người đăng ký nào phù hợp để gửi." });
      return;
    }

    const now = new Date();
    await db.update(emailCampaignsTable).set({
      status: "sent", sentAt: now, recipientCount: subscribers.length, updatedAt: now,
    }).where(eq(emailCampaignsTable.id, id));

    res.json({ ok: true, recipientCount: subscribers.length });

    void sendCampaignToSubscribers(campaign, subscribers).then(async ({ sent, failed }) => {
      console.log(`[campaign ${id}] Sent: ${sent}, Failed: ${failed}`);
      if (sent > 0) {
        await db.insert(emailEventsTable).values(
          subscribers.map((s) => ({ subscriberId: s.id, campaignId: id, eventType: "sent" })),
        ).catch(console.error);
      }
      await db.update(emailCampaignsTable).set({ recipientCount: sent }).where(eq(emailCampaignsTable.id, id)).catch(console.error);
    });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

/* POST /campaigns/:id/test */
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

router.get("/sequences", async (req, res) => {
  try {
    const { status, trigger } = req.query as Record<string, string>;
    const conditions = [];
    if (status && status !== "all") conditions.push(eq(emailSequencesTable.status, status));
    if (trigger && trigger !== "all") conditions.push(eq(emailSequencesTable.triggerType, trigger));

    const sequences = await db.select().from(emailSequencesTable)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(emailSequencesTable.createdAt));

    // Enrich with counts
    const enriched = await Promise.all(sequences.map(async (seq) => {
      const [totalEnrolled]   = await db.select({ c: count() }).from(emailSequenceEnrollmentsTable).where(eq(emailSequenceEnrollmentsTable.sequenceId, seq.id));
      const [activeEnrolled]  = await db.select({ c: count() }).from(emailSequenceEnrollmentsTable).where(and(eq(emailSequenceEnrollmentsTable.sequenceId, seq.id), eq(emailSequenceEnrollmentsTable.status, "active")));
      const [completedCount]  = await db.select({ c: count() }).from(emailSequenceEnrollmentsTable).where(and(eq(emailSequenceEnrollmentsTable.sequenceId, seq.id), eq(emailSequenceEnrollmentsTable.status, "completed")));
      const [stepCount]       = await db.select({ c: count() }).from(emailSequenceStepsTable).where(and(eq(emailSequenceStepsTable.sequenceId, seq.id), eq(emailSequenceStepsTable.isActive, true)));
      const [sentCount]       = await db.select({ c: count() }).from(emailEventsTable).where(and(eq(emailEventsTable.sequenceId, seq.id), eq(emailEventsTable.eventType, "sent")));
      const [openCount]       = await db.select({ c: count() }).from(emailEventsTable).where(and(eq(emailEventsTable.sequenceId, seq.id), eq(emailEventsTable.eventType, "opened")));
      const [clickCount]      = await db.select({ c: count() }).from(emailEventsTable).where(and(eq(emailEventsTable.sequenceId, seq.id), eq(emailEventsTable.eventType, "clicked")));
      const sent = sentCount?.c ?? 0;
      return {
        ...seq,
        enrolledCount:  totalEnrolled?.c  ?? 0,
        activeCount:    activeEnrolled?.c ?? 0,
        completedCount: completedCount?.c ?? 0,
        stepCount:      stepCount?.c      ?? 0,
        openRate:  sent > 0 ? Math.round(((openCount?.c ?? 0) / sent) * 100) : null,
        clickRate: sent > 0 ? Math.round(((clickCount?.c ?? 0) / sent) * 100) : null,
      };
    }));

    res.json({ sequences: enriched });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

/* GET /sequences/:id/analytics */
router.get("/sequences/:id/analytics", async (req, res) => {
  try {
    const seqId = Number(req.params["id"]);

    const [enrolled]  = await db.select({ c: count() }).from(emailSequenceEnrollmentsTable).where(eq(emailSequenceEnrollmentsTable.sequenceId, seqId));
    const [active]    = await db.select({ c: count() }).from(emailSequenceEnrollmentsTable).where(and(eq(emailSequenceEnrollmentsTable.sequenceId, seqId), eq(emailSequenceEnrollmentsTable.status, "active")));
    const [completed] = await db.select({ c: count() }).from(emailSequenceEnrollmentsTable).where(and(eq(emailSequenceEnrollmentsTable.sequenceId, seqId), eq(emailSequenceEnrollmentsTable.status, "completed")));
    const [cancelled] = await db.select({ c: count() }).from(emailSequenceEnrollmentsTable).where(and(eq(emailSequenceEnrollmentsTable.sequenceId, seqId), eq(emailSequenceEnrollmentsTable.status, "cancelled")));
    const [totalSent] = await db.select({ c: count() }).from(emailEventsTable).where(and(eq(emailEventsTable.sequenceId, seqId), eq(emailEventsTable.eventType, "sent")));
    const [totalOpen] = await db.select({ c: count() }).from(emailEventsTable).where(and(eq(emailEventsTable.sequenceId, seqId), eq(emailEventsTable.eventType, "opened")));
    const [totalClick]= await db.select({ c: count() }).from(emailEventsTable).where(and(eq(emailEventsTable.sequenceId, seqId), eq(emailEventsTable.eventType, "clicked")));

    // Per-step analytics
    const steps = await db.select().from(emailSequenceStepsTable)
      .where(eq(emailSequenceStepsTable.sequenceId, seqId))
      .orderBy(asc(emailSequenceStepsTable.stepOrder));

    const stepAnalytics = await Promise.all(steps.map(async (step) => {
      const [s] = await db.select({ c: count() }).from(emailEventsTable).where(and(eq(emailEventsTable.stepId, step.id), eq(emailEventsTable.eventType, "sent")));
      const [o] = await db.select({ c: count() }).from(emailEventsTable).where(and(eq(emailEventsTable.stepId, step.id), eq(emailEventsTable.eventType, "opened")));
      const [c] = await db.select({ c: count() }).from(emailEventsTable).where(and(eq(emailEventsTable.stepId, step.id), eq(emailEventsTable.eventType, "clicked")));
      const sent = s?.c ?? 0;
      return {
        stepId: step.id,
        stepOrder: step.stepOrder,
        stepType: step.stepType,
        subject: step.subject,
        delayDays: step.delayDays,
        sent,
        opened: o?.c ?? 0,
        clicked: c?.c ?? 0,
        openRate:  sent > 0 ? Math.round(((o?.c ?? 0) / sent) * 100) : null,
        clickRate: sent > 0 ? Math.round(((c?.c ?? 0) / sent) * 100) : null,
      };
    }));

    const sent = totalSent?.c ?? 0;
    res.json({
      enrolled:  enrolled?.c  ?? 0,
      active:    active?.c    ?? 0,
      completed: completed?.c ?? 0,
      exited:    cancelled?.c ?? 0,
      sent,
      opened:    totalOpen?.c  ?? 0,
      clicked:   totalClick?.c ?? 0,
      openRate:  sent > 0 ? Math.round(((totalOpen?.c  ?? 0) / sent) * 100) : null,
      clickRate: sent > 0 ? Math.round(((totalClick?.c ?? 0) / sent) * 100) : null,
      steps: stepAnalytics,
    });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.post("/sequences", async (req, res) => {
  try {
    const { title, slug, description, triggerType, triggerTags, triggerConfig, excludeRules, goal, status } = req.body;
    if (!title?.trim()) { res.status(400).json({ error: "Tên chuỗi là bắt buộc." }); return; }
    const [sequence] = await db.insert(emailSequencesTable).values({
      title: title.trim(),
      slug: slug?.trim() || null,
      description: description?.trim() || null,
      triggerType: triggerType || "on_subscribe",
      triggerTags: triggerTags || null,
      triggerConfig: triggerConfig || null,
      excludeRules: excludeRules || null,
      goal: goal?.trim() || null,
      status: status || "active",
    }).returning();
    res.json({ sequence });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.put("/sequences/:id", async (req, res) => {
  try {
    const id = Number(req.params["id"]);
    const { title, slug, description, triggerType, triggerTags, triggerConfig, excludeRules, goal, status } = req.body;
    const [updated] = await db.update(emailSequencesTable).set({
      title:         title?.trim()       || undefined,
      slug:          slug?.trim()        ?? undefined,
      description:   description?.trim() ?? null,
      triggerType:   triggerType         || undefined,
      triggerTags:   triggerTags         ?? undefined,
      triggerConfig: triggerConfig       ?? undefined,
      excludeRules:  excludeRules        ?? undefined,
      goal:          goal?.trim()        ?? null,
      status:        status              || undefined,
      updatedAt:     new Date(),
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

/* POST /sequences/seed — seed default templates */
router.post("/sequences/seed", async (req, res) => {
  try {
    const inserted: { slug: string }[] = [];
    const skipped:  { slug: string }[] = [];

    const templates = getDefaultSequenceTemplates();
    for (const tmpl of templates) {
      const [existing] = await db.select({ id: emailSequencesTable.id })
        .from(emailSequencesTable).where(eq(emailSequencesTable.slug, tmpl.slug)).limit(1);
      if (existing) { skipped.push({ slug: tmpl.slug }); continue; }

      const [seq] = await db.insert(emailSequencesTable).values({
        title: tmpl.title, slug: tmpl.slug,
        description: tmpl.description,
        triggerType: tmpl.triggerType,
        triggerTags: tmpl.triggerTags,
        goal: tmpl.goal,
        status: "active",
      }).returning();

      if (seq) {
        let order = 1;
        for (const step of tmpl.steps) {
          await db.insert(emailSequenceStepsTable).values({
            sequenceId: seq.id,
            stepOrder: order++,
            stepType: step.stepType ?? "email",
            delayDays: step.delayDays ?? 0,
            subject: step.subject ?? "",
            previewText: step.previewText ?? null,
            contentBody: step.contentBody ?? null,
            ctaText: step.ctaText ?? null,
            ctaUrl: step.ctaUrl ?? null,
            tagName: step.tagName ?? null,
            isActive: true,
          });
        }
        inserted.push({ slug: tmpl.slug });
      }
    }

    res.json({ ok: true, inserted, skipped });
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
    const {
      stepType, subject, previewText, contentBody, delayDays, stepOrder,
      senderName, senderEmail, ctaText, ctaUrl, ctaSecondaryText, ctaSecondaryUrl,
      tagName, updateField, updateValue, targetSequenceId,
    } = req.body;

    const type = stepType || "email";
    if (type === "email" && !subject?.trim()) {
      res.status(400).json({ error: "Tiêu đề email là bắt buộc." }); return;
    }

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
      stepType: type,
      subject: (type === "email" ? subject?.trim() : "") ?? "",
      previewText:     previewText?.trim()     || null,
      contentBody:     contentBody?.trim()     || null,
      delayDays:       Number(delayDays)       || 0,
      stepOrder:       order,
      senderName:      senderName?.trim()      || null,
      senderEmail:     senderEmail?.trim()     || null,
      ctaText:         ctaText?.trim()         || null,
      ctaUrl:          ctaUrl?.trim()          || null,
      ctaSecondaryText: ctaSecondaryText?.trim() || null,
      ctaSecondaryUrl: ctaSecondaryUrl?.trim() || null,
      tagName:         tagName?.trim()         || null,
      updateField:     updateField?.trim()     || null,
      updateValue:     updateValue?.trim()     || null,
      targetSequenceId: targetSequenceId ? Number(targetSequenceId) : null,
      isActive:        true,
    }).returning();
    res.json({ step });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.put("/steps/:id", async (req, res) => {
  try {
    const id = Number(req.params["id"]);
    const {
      stepType, subject, previewText, contentBody, delayDays, isActive, stepOrder,
      senderName, senderEmail, ctaText, ctaUrl, ctaSecondaryText, ctaSecondaryUrl,
      tagName, updateField, updateValue, targetSequenceId,
    } = req.body;
    const [updated] = await db.update(emailSequenceStepsTable).set({
      stepType:      stepType                    || undefined,
      subject:       subject?.trim()             ?? undefined,
      previewText:   previewText?.trim()         ?? null,
      contentBody:   contentBody?.trim()         ?? null,
      delayDays:     delayDays !== undefined ? Number(delayDays) : undefined,
      isActive:      isActive  !== undefined ? Boolean(isActive) : undefined,
      stepOrder:     stepOrder !== undefined ? Number(stepOrder) : undefined,
      senderName:    senderName?.trim()          ?? null,
      senderEmail:   senderEmail?.trim()         ?? null,
      ctaText:       ctaText?.trim()             ?? null,
      ctaUrl:        ctaUrl?.trim()              ?? null,
      ctaSecondaryText: ctaSecondaryText?.trim() ?? null,
      ctaSecondaryUrl:  ctaSecondaryUrl?.trim()  ?? null,
      tagName:       tagName?.trim()             ?? null,
      updateField:   updateField?.trim()         ?? null,
      updateValue:   updateValue?.trim()         ?? null,
      targetSequenceId: targetSequenceId !== undefined ? (targetSequenceId ? Number(targetSequenceId) : null) : undefined,
      updatedAt:     new Date(),
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

/* ═══════════════════════════════════════════════════════════════════════
   DEFAULT SEQUENCE TEMPLATES
═══════════════════════════════════════════════════════════════════════ */

type StepTemplate = {
  stepType?: string;
  delayDays?: number;
  subject?: string;
  previewText?: string;
  contentBody?: string;
  ctaText?: string;
  ctaUrl?: string;
  tagName?: string;
};

function getDefaultSequenceTemplates() {
  return [
    {
      title: "Chào mừng — 7 Sai lầm tài sản",
      slug: "chao-mung-7-sai-lam-tai-san",
      description: "Chuỗi chào mừng sau khi đăng ký, giao 7 bài học về sai lầm tài sản và hướng dẫn bước tiếp theo.",
      triggerType: "on_subscribe",
      triggerTags: ["newsletter", "lead_magnet"],
      goal: "Giáo dục + soft-sell Con đường 1 triệu đô",
      steps: [
        {
          stepType: "email", delayDays: 0,
          subject: "Chào mừng bạn — Tài liệu 7 sai lầm đang đợi",
          previewText: "Cảm ơn bạn đã tin tưởng. Đây là tài liệu bạn đã yêu cầu.",
          contentBody: "Xin chào {{first_name}},\n\nCảm ơn bạn đã đăng ký nhận nội dung từ tôi.\n\nBạn đã yêu cầu tài liệu \"7 Sai lầm khiến người Việt làm việc mãi không tích lũy được tài sản\". Đây là link tải về:\n\n[Nhấn vào đây để nhận tài liệu]\n\nTrong tuần tới, tôi sẽ gửi cho bạn những nội dung thiết thực về tư duy tài chính và đầu tư dài hạn.\n\nPhan Văn Thắng",
          ctaText: "Tải tài liệu ngay",
          ctaUrl: "https://phanvanthang.com/tai-lieu",
        },
        { stepType: "wait", delayDays: 1, subject: "" },
        {
          stepType: "email", delayDays: 0,
          subject: "Tại sao người ta làm mãi mà không giàu?",
          previewText: "Không phải vì lười, không phải vì kém. Mà vì một lý do khác.",
          contentBody: "{{first_name}},\n\nNhiều người làm việc chăm chỉ trong nhiều năm — nhưng nhìn lại, tài sản gần như không tăng.\n\nKhông phải vì họ lười. Cũng không phải vì họ kém.\n\nMà vì họ chưa phân biệt được: **Thu nhập ≠ Tài sản**.\n\nThu nhập là dòng tiền vào. Tài sản là thứ sinh ra dòng tiền — kể cả khi bạn không làm gì.\n\nNgày mai tôi sẽ chia sẻ về 3 giai đoạn tài chính mà mọi người đều đi qua.",
        },
        { stepType: "wait", delayDays: 2, subject: "" },
        {
          stepType: "email", delayDays: 0,
          subject: "3 giai đoạn tài chính: An toàn – Tự chủ – Tự do",
          previewText: "Bạn đang ở giai đoạn nào?",
          contentBody: "{{first_name}},\n\nHầu hết mọi người đều trải qua 3 giai đoạn tài chính:\n\n**1. An toàn** — Có đủ tiền cho các nhu cầu cơ bản.\n**2. Tự chủ** — Không phụ thuộc vào một nguồn thu nhập duy nhất.\n**3. Tự do** — Tài sản sinh ra đủ tiền để sống mà không cần làm việc.\n\nPhần lớn người Việt dừng lại ở giai đoạn 1 — không phải vì không muốn tiến, mà vì không có hệ thống.\n\nBạn đang ở đâu trong hành trình này?",
        },
        { stepType: "wait", delayDays: 2, subject: "" },
        {
          stepType: "email", delayDays: 0,
          subject: "Thu nhập không phải tài sản — đây là sự khác biệt",
          previewText: "Một điều đơn giản nhưng thay đổi cách nhìn của nhiều người.",
          contentBody: "{{first_name}},\n\nNhiều người nhầm lẫn: thu nhập cao = giàu.\n\nNhưng thực tế không phải vậy. Có người kiếm 50 triệu/tháng nhưng tài sản gần như bằng 0 vì chi tiêu hết.\n\nTài sản thực sự là: bất động sản sinh dòng tiền, cổ phiếu, doanh nghiệp, kỹ năng đặc thù.\n\nKỷ luật tài chính không có nghĩa là keo kiệt — mà là **trả cho bản thân mình trước**.\n\nMuốn tìm hiểu thêm, bạn có thể đọc thêm trong thư viện nội dung của tôi.",
          ctaText: "Đọc thêm",
          ctaUrl: "https://phanvanthang.com/bai-viet",
        },
        { stepType: "wait", delayDays: 2, subject: "" },
        {
          stepType: "email", delayDays: 0,
          subject: "Bước tiếp theo: Thư viện nội dung + Con đường 1 triệu đô",
          previewText: "Cảm ơn bạn đã đồng hành trong tuần qua.",
          contentBody: "{{first_name}},\n\nSau một tuần chia sẻ, tôi muốn giới thiệu với bạn 2 tài nguyên:\n\n**1. Thư viện nội dung** — Nơi tập hợp toàn bộ bài viết, video, và tài liệu miễn phí về tư duy tài chính.\n\n**2. Con đường 1 triệu đô** — Chương trình học có hướng dẫn, giúp bạn xây dựng hệ thống tài chính cá nhân từ đầu.\n\nNếu bạn muốn tìm hiểu về chương trình, hãy nhấn vào link bên dưới.",
          ctaText: "Tìm hiểu Con đường 1 triệu đô",
          ctaUrl: "https://phanvanthang.com/san-pham",
        },
        { stepType: "add_tag", delayDays: 0, subject: "", tagName: "stage_nurture" },
      ],
    },
    {
      title: "Con đường 1 triệu đô — Soft Sell",
      slug: "con-duong-1-trieu-do-soft-sell",
      description: "Chuỗi nuôi dưỡng dành cho người quan tâm chương trình Con đường 1 triệu đô.",
      triggerType: "tag_added",
      triggerTags: ["interest_1trieudo"],
      goal: "Chuyển đổi sang khách hàng Con đường 1 triệu đô",
      steps: [
        {
          stepType: "email", delayDays: 0,
          subject: "Vấn đề mà 95% người Việt gặp phải với tiền",
          previewText: "Không phải thiếu tiền. Mà là thiếu hệ thống.",
          contentBody: "{{first_name}},\n\nBạn có nhận ra điều này không:\n\nNhiều người Việt chăm chỉ, thông minh, có thu nhập tốt — nhưng sau 5-10 năm đi làm, tài sản vẫn gần như không có gì đáng kể.\n\nVấn đề không phải là thiếu cơ hội. Cũng không phải thiếu thông tin.\n\nVấn đề là **thiếu hệ thống** — một hệ thống giúp tiền hoạt động thay cho bạn.\n\nTôi sẽ chia sẻ thêm trong vài ngày tới.",
        },
        { stepType: "wait", delayDays: 1, subject: "" },
        {
          stepType: "email", delayDays: 0,
          subject: "Không phải thiếu cơ hội — bạn thiếu hệ thống",
          previewText: "Sự thật mà ít người chịu thừa nhận.",
          contentBody: "{{first_name}},\n\nNhiều người tin rằng: \"Nếu tôi có vốn nhiều hơn thì sẽ đầu tư được.\"\n\nNhưng thực ra: Người không có hệ thống với 10 triệu — cũng sẽ mất định hướng với 100 triệu.\n\nHệ thống tài chính cá nhân bao gồm:\n- Biết mình đang ở đâu (baseline)\n- Biết mình muốn đến đâu (mục tiêu cụ thể)\n- Biết cách di chuyển từ A đến B (kế hoạch)\n- Có kỷ luật để thực hiện (thói quen)\n\nĐây là điều tôi đã xây dựng trong suốt nhiều năm — và giờ tôi muốn chia sẻ với bạn.",
        },
        { stepType: "wait", delayDays: 2, subject: "" },
        {
          stepType: "email", delayDays: 0,
          subject: "Kỷ luật không phải là ý chí — đây là cách đúng",
          previewText: "Bạn không cần ý chí phi thường để xây dựng tài sản.",
          contentBody: "{{first_name}},\n\nMọi người thường nghĩ: kỷ luật tài chính = phải có ý chí thép.\n\nNhưng khoa học hành vi cho thấy điều khác: **hệ thống tốt > ý chí tốt**.\n\nKhi bạn thiết kế môi trường đúng — tự động tiết kiệm, tự động đầu tư — bạn không cần phụ thuộc vào cảm xúc từng ngày.\n\nĐây là một trong những nguyên tắc cốt lõi của Con đường 1 triệu đô.",
        },
        { stepType: "wait", delayDays: 2, subject: "" },
        {
          stepType: "email", delayDays: 0,
          subject: "Con đường 1 triệu đô — Chương trình học có hướng dẫn",
          previewText: "Đây là chương trình tôi đã xây dựng trong nhiều năm.",
          contentBody: "{{first_name}},\n\nSau nhiều năm học hỏi, thực chiến và chia sẻ — tôi đã tổng hợp lại thành chương trình học có cấu trúc:\n\n**Con đường 1 triệu đô**\n\nBao gồm:\n- Xây dựng nền tảng tài chính cá nhân\n- Kỷ luật chi tiêu và tiết kiệm\n- Đầu tư dài hạn thông minh\n- Tư duy tài sản và thu nhập thụ động\n\nHướng dẫn từng bước, có cộng đồng hỗ trợ.",
          ctaText: "Xem chi tiết chương trình",
          ctaUrl: "https://phanvanthang.com/san-pham",
        },
        { stepType: "wait", delayDays: 2, subject: "" },
        {
          stepType: "email", delayDays: 0,
          subject: "Chương trình này phù hợp với bạn không?",
          previewText: "Hãy tự hỏi những câu hỏi này.",
          contentBody: "{{first_name}},\n\nTrước khi quyết định, hãy tự hỏi:\n\n✓ Bạn có muốn xây dựng tài sản có hệ thống không?\n✓ Bạn sẵn sàng học và thực hành trong 6-12 tháng?\n✓ Bạn muốn có cộng đồng cùng hành trình?\n\nNếu có — Con đường 1 triệu đô có thể phù hợp với bạn.\n\n**Không phù hợp nếu:** Bạn muốn làm giàu nhanh, muốn bí quyết đầu tư \"hot\", hoặc không sẵn sàng thay đổi thói quen.",
          ctaText: "Tìm hiểu thêm",
          ctaUrl: "https://phanvanthang.com/san-pham",
        },
        { stepType: "wait", delayDays: 2, subject: "" },
        {
          stepType: "email", delayDays: 0,
          subject: "Một lời mời nhẹ nhàng",
          previewText: "Không áp lực. Chỉ khi bạn thực sự sẵn sàng.",
          contentBody: "{{first_name}},\n\nTôi biết bạn đang cân nhắc.\n\nKhông có gì phải vội. Quyết định tài chính quan trọng cần thời gian suy nghĩ.\n\nNếu bạn muốn nói chuyện trực tiếp trước khi quyết định — bạn có thể liên hệ với tôi qua form bên dưới.\n\nDù bạn quyết định thế nào — tôi vẫn sẽ tiếp tục chia sẻ nội dung giá trị với bạn.",
          ctaText: "Liên hệ tư vấn",
          ctaUrl: "https://phanvanthang.com/lien-he",
        },
        { stepType: "add_tag", delayDays: 0, subject: "", tagName: "stage_hot" },
      ],
    },
    {
      title: "Tái kết nối — 60 ngày không tương tác",
      slug: "tai-ket-noi-60-ngay",
      description: "Chuỗi tái kết nối với người đăng ký không mở email trong 60 ngày.",
      triggerType: "manual",
      triggerTags: ["inactive_60d"],
      goal: "Tái kích hoạt hoặc xác nhận hủy đăng ký",
      steps: [
        {
          stepType: "email", delayDays: 0,
          subject: "Bạn vẫn còn muốn nhận nội dung từ tôi không?",
          previewText: "Không sao cả nếu câu trả lời là không.",
          contentBody: "{{first_name}},\n\nTôi nhận ra bạn đã không mở email của tôi trong một thời gian.\n\nHoàn toàn bình thường — cuộc sống bận rộn, ưu tiên thay đổi.\n\nTôi chỉ muốn hỏi thẳng: **Bạn vẫn còn muốn nhận nội dung từ tôi không?**\n\nNếu có — nhấn vào nút bên dưới để xác nhận. Tôi sẽ tiếp tục gửi nội dung giá trị.\n\nNếu không — không sao cả. Bạn có thể hủy đăng ký bất cứ lúc nào.",
          ctaText: "Có, tôi vẫn muốn nhận",
          ctaUrl: "https://phanvanthang.com/xac-nhan-dang-ky",
        },
        { stepType: "wait", delayDays: 5, subject: "" },
        {
          stepType: "email", delayDays: 0,
          subject: "Email cuối — tôi sẽ tạm dừng nếu không nhận phản hồi",
          previewText: "Không muốn làm phiền bạn nếu bạn không còn quan tâm.",
          contentBody: "{{first_name}},\n\nĐây là email cuối tôi muốn gửi.\n\nNếu bạn không phản hồi, tôi sẽ tạm dừng gửi email — để tôn trọng thời gian và hộp thư của bạn.\n\nNếu bạn muốn quay lại — bất kỳ lúc nào cũng được. Bạn có thể đăng ký lại trên website.\n\nCảm ơn bạn vì thời gian đã đồng hành.",
          ctaText: "Tôi muốn tiếp tục nhận",
          ctaUrl: "https://phanvanthang.com/xac-nhan-dang-ky",
        },
        { stepType: "add_tag", delayDays: 0, subject: "", tagName: "inactive_60d" },
        { stepType: "end", delayDays: 0, subject: "" },
      ],
    },
  ];
}

export default router;
