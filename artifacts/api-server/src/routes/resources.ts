/* ─────────────────────────────────────────────────────────────────────────
   Public resource routes — mounted at /api/resources
     GET  /                — list published resources
     GET  /:slug           — get resource detail (fileUrl hidden if gated)
     POST /:slug/unlock    — validate form + create lead/subscriber + return access
   ───────────────────────────────────────────────────────────────────────── */

import { Router } from "express";
import { randomBytes } from "crypto";
import {
  db, leadMagnetsTable, resourceAccessEventsTable,
  leadsTable, emailSubscribersTable,
} from "@workspace/db";
import { eq, and, asc, desc } from "drizzle-orm";
import { sendResourceEmail } from "../services/resourceEmailService.js";

const router = Router();

const unlockLog = new Map<string, number[]>();
function isRateLimited(key: string): boolean {
  const now = Date.now();
  const hits = (unlockLog.get(key) ?? []).filter((t) => now - t < 3_600_000);
  if (hits.length >= 5) return true;
  hits.push(now);
  unlockLog.set(key, hits);
  return false;
}

/* ── GET / — list published resources ─────────────────────────────── */
router.get("/", async (req, res) => {
  try {
    const featured = req.query["featured"] === "true";
    const topic    = String(req.query["topic"] ?? "").trim();

    const rows = await db
      .select({
        id: leadMagnetsTable.id,
        title: leadMagnetsTable.title,
        slug: leadMagnetsTable.slug,
        shortDescription: leadMagnetsTable.shortDescription,
        resourceType: leadMagnetsTable.resourceType,
        coverImageUrl: leadMagnetsTable.coverImageUrl,
        coverImageAlt: leadMagnetsTable.coverImageAlt,
        gatingMode: leadMagnetsTable.gatingMode,
        deliveryMode: leadMagnetsTable.deliveryMode,
        featured: leadMagnetsTable.featured,
        topicSlug: leadMagnetsTable.topicSlug,
        tags: leadMagnetsTable.tags,
        buttonLabel: leadMagnetsTable.buttonLabel,
        ctaTitle: leadMagnetsTable.ctaTitle,
        ctaDescription: leadMagnetsTable.ctaDescription,
        sortOrder: leadMagnetsTable.sortOrder,
        createdAt: leadMagnetsTable.createdAt,
      })
      .from(leadMagnetsTable)
      .where(eq(leadMagnetsTable.status, "published"))
      .orderBy(desc(leadMagnetsTable.featured), asc(leadMagnetsTable.sortOrder), desc(leadMagnetsTable.createdAt));

    let result = rows;
    if (featured) result = result.filter((r) => r.featured);
    if (topic)    result = result.filter((r) => r.topicSlug === topic);

    res.json({ resources: result });
  } catch (e) {
    console.error("[resources/list]", e);
    res.status(500).json({ error: "Có lỗi xảy ra" });
  }
});

/* ── GET /:slug — resource detail ──────────────────────────────────── */
router.get("/:slug", async (req, res) => {
  try {
    const slug = req.params["slug"]!;

    const [resource] = await db
      .select()
      .from(leadMagnetsTable)
      .where(and(eq(leadMagnetsTable.slug, slug), eq(leadMagnetsTable.status, "published")))
      .limit(1);

    if (!resource) { res.status(404).json({ error: "Không tìm thấy tài liệu" }); return; }

    // Hide file/external URL for gated modes — returned only after unlock
    const pub: typeof resource = { ...resource };
    if (resource.gatingMode !== "public") {
      pub.fileUrl     = null;
      pub.externalUrl = null;
    }

    res.json({ resource: pub });
  } catch (e) {
    console.error("[resources/detail]", e);
    res.status(500).json({ error: "Có lỗi xảy ra" });
  }
});

/* ── POST /:slug/unlock ─────────────────────────────────────────────── */
router.post("/:slug/unlock", async (req, res) => {
  try {
    const slug = req.params["slug"]!;
    const { fullName, email, phone, interest, hp, sourcePage, sourceSection } = req.body as Record<string, string>;

    // Honeypot
    if (hp && hp.trim() !== "") {
      res.json({ ok: true, message: "Cảm ơn bạn! Tài liệu đã sẵn sàng." });
      return;
    }

    const trimmedEmail = email?.trim()?.toLowerCase();
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      res.status(400).json({ error: "Email không hợp lệ" }); return;
    }
    if (!fullName?.trim()) {
      res.status(400).json({ error: "Vui lòng nhập họ và tên" }); return;
    }

    if (isRateLimited(trimmedEmail)) {
      res.json({ ok: true, message: "Tài liệu đã được gửi qua email. Vui lòng kiểm tra hộp thư." });
      return;
    }

    const [resource] = await db
      .select()
      .from(leadMagnetsTable)
      .where(and(eq(leadMagnetsTable.slug, slug), eq(leadMagnetsTable.status, "published")))
      .limit(1);

    if (!resource) { res.status(404).json({ error: "Không tìm thấy tài liệu" }); return; }

    const now = new Date();

    // CRM: create or update lead
    let leadId: number | null = null;
    const [existingLead] = await db
      .select({ id: leadsTable.id })
      .from(leadsTable)
      .where(eq(leadsTable.email, trimmedEmail))
      .limit(1);

    if (existingLead) {
      leadId = existingLead.id;
      await db.update(leadsTable).set({
        name: fullName.trim(),
        ...(phone?.trim()   ? { phone: phone.trim() }     : {}),
        ...(interest        ? { interestTopic: interest }  : {}),
        updatedAt: now,
      }).where(eq(leadsTable.id, leadId));
    } else {
      const [newLead] = await db.insert(leadsTable).values({
        name:          fullName.trim(),
        email:         trimmedEmail,
        phone:         phone?.trim() || null,
        sourceType:    sourceSection || "resource",
        sourcePage:    sourcePage    || `/tai-lieu/${slug}`,
        productRef:    resource.topicSlug || null,
        interestTopic: interest || resource.topicSlug || null,
        formType:      "resource-unlock",
        status:        "moi",
        consentStatus: "given",
        createdAt:     now,
        updatedAt:     now,
      }).returning({ id: leadsTable.id });
      if (newLead) leadId = newLead.id;
    }

    // Email subscriber: create or reuse
    let subscriberId: number | null = null;
    let unsubscribeToken: string | undefined;
    const [existingSub] = await db
      .select({ id: emailSubscribersTable.id, unsubscribeToken: emailSubscribersTable.unsubscribeToken })
      .from(emailSubscribersTable)
      .where(eq(emailSubscribersTable.email, trimmedEmail))
      .limit(1);

    if (existingSub) {
      subscriberId     = existingSub.id;
      unsubscribeToken = existingSub.unsubscribeToken;
    } else {
      const token = randomBytes(32).toString("hex");
      const [newSub] = await db.insert(emailSubscribersTable).values({
        email:            trimmedEmail,
        fullName:         fullName.trim(),
        subscriberStatus: "subscribed",
        sourceType:       "resource",
        sourcePage:       sourcePage    || `/tai-lieu/${slug}`,
        sourceSection:    resource.title,
        consentStatus:    "given",
        unsubscribeToken: token,
        linkedLeadId:     leadId,
        subscribedAt:     now,
        createdAt:        now,
        updatedAt:        now,
      }).returning({ id: emailSubscribersTable.id });
      if (newSub) { subscriberId = newSub.id; unsubscribeToken = token; }
    }

    // Log access event
    await db.insert(resourceAccessEventsTable).values({
      resourceId:    resource.id,
      leadId,
      subscriberId,
      fullName:      fullName.trim(),
      email:         trimmedEmail,
      phone:         phone?.trim() || null,
      accessType:    "unlock",
      sourcePage:    sourcePage    || null,
      sourceSection: sourceSection || null,
      createdAt:     now,
    });

    const downloadUrl = resource.fileUrl ?? resource.externalUrl ?? null;
    const shouldEmail  = ["email", "both"].includes(resource.deliveryMode ?? "direct");
    const shouldDirect = ["direct", "both"].includes(resource.deliveryMode ?? "direct");

    if (shouldEmail && downloadUrl) {
      void sendResourceEmail({
        to:       { email: trimmedEmail, fullName: fullName.trim() },
        resource: {
          title:            resource.title,
          downloadUrl,
          fileName:         resource.fileName,
          thankYouMessage:  resource.thankYouMessage,
        },
        unsubscribeToken,
      }).then(async () => {
        await db.insert(resourceAccessEventsTable).values({
          resourceId: resource.id, leadId, subscriberId,
          email: trimmedEmail, accessType: "email_sent", createdAt: new Date(),
        }).catch(() => {});
      });
    }

    res.json({
      ok: true,
      downloadUrl:     shouldDirect ? downloadUrl : null,
      fileName:        resource.fileName,
      thankYouMessage: resource.thankYouMessage,
      message:         shouldEmail
        ? "Tài liệu đã được gửi qua email. Vui lòng kiểm tra hộp thư."
        : "Tài liệu đã sẵn sàng. Nhấn để tải xuống.",
    });
  } catch (e) {
    console.error("[resources/unlock]", e);
    res.status(500).json({ error: "Có lỗi xảy ra. Vui lòng thử lại." });
  }
});

export default router;
