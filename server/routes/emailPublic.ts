/* ─────────────────────────────────────────────────────────────────────────
   Public email routes:
     POST /api/email/subscribe      — newsletter signup
     GET  /api/email/unsubscribe    — one-click unsubscribe via token
   ───────────────────────────────────────────────────────────────────────── */

import { Router } from "express";
import { randomBytes } from "crypto";
import { db, emailSubscribersTable, emailSequencesTable, emailSequenceStepsTable, emailSequenceEnrollmentsTable, leadsTable } from "../db";
import { eq, and, asc } from "drizzle-orm";
import { sendWelcomeEmail } from "../services/emailService.js";

const router = Router();

// In-memory rate limiter: max 3 signups per email per hour
const signupLog = new Map<string, number[]>();
function isRateLimited(key: string): boolean {
  const now = Date.now();
  const hits = (signupLog.get(key) ?? []).filter((t) => now - t < 3_600_000);
  if (hits.length >= 3) return true;
  hits.push(now);
  signupLog.set(key, hits);
  return false;
}

function randomToken(): string {
  return randomBytes(32).toString("hex");
}

/* ── POST /subscribe ────────────────────────────────────────────────── */
router.post("/subscribe", async (req, res) => {
  try {
    const { email, fullName, sourceType, sourcePage, sourceSection, hp } = req.body;

    // Honeypot — bots fill this; silently succeed without saving
    if (hp && String(hp).trim() !== "") {
      res.json({ ok: true });
      return;
    }

    const trimmedEmail = email?.trim()?.toLowerCase();
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      res.status(400).json({ error: "Email không hợp lệ" });
      return;
    }

    // Rate limit
    if (isRateLimited(trimmedEmail)) {
      res.json({ ok: true }); // silent
      return;
    }

    const now = new Date();

    // Deduplication: check for existing subscriber
    const [existing] = await db
      .select()
      .from(emailSubscribersTable)
      .where(eq(emailSubscribersTable.email, trimmedEmail))
      .limit(1);

    if (existing) {
      if (existing.subscriberStatus === "subscribed") {
        // Already subscribed — idempotent success
        res.json({ ok: true, alreadySubscribed: true });
        return;
      }
      // Re-subscribe
      await db.update(emailSubscribersTable).set({
        subscriberStatus: "subscribed",
        fullName:         fullName?.trim() || existing.fullName,
        sourceType:       sourceType || existing.sourceType,
        sourcePage:       sourcePage || existing.sourcePage,
        sourceSection:    sourceSection || existing.sourceSection,
        consentStatus:    "given",
        subscribedAt:     now,
        unsubscribedAt:   null,
        updatedAt:        now,
      }).where(eq(emailSubscribersTable.id, existing.id));

      // Reload
      const [updated] = await db.select().from(emailSubscribersTable).where(eq(emailSubscribersTable.id, existing.id));
      if (updated) void sendWelcomeEmail(updated);
      void enrollInWelcomeSequences(existing.id, now);

      res.json({ ok: true, resubscribed: true });
      return;
    }

    // Link to CRM lead if same email exists
    let linkedLeadId: number | null = null;
    const [matchingLead] = await db
      .select({ id: leadsTable.id })
      .from(leadsTable)
      .where(eq(leadsTable.email, trimmedEmail))
      .limit(1);
    if (matchingLead) linkedLeadId = matchingLead.id;

    // Create subscriber
    const [subscriber] = await db.insert(emailSubscribersTable).values({
      email:            trimmedEmail,
      fullName:         fullName?.trim() || null,
      subscriberStatus: "subscribed",
      sourceType:       sourceType || null,
      sourcePage:       sourcePage || null,
      sourceSection:    sourceSection || null,
      consentStatus:    "given",
      unsubscribeToken: randomToken(),
      linkedLeadId:     linkedLeadId,
      subscribedAt:     now,
    }).returning();

    if (subscriber) {
      // Send welcome email (fire and forget)
      void sendWelcomeEmail(subscriber);

      // Enroll in any active 'on_subscribe' sequences
      void enrollInWelcomeSequences(subscriber.id, now);
    }

    res.json({ ok: true, id: subscriber?.id });
  } catch (e) {
    console.error("[email/subscribe]", e);
    res.status(500).json({ error: "Có lỗi xảy ra, vui lòng thử lại." });
  }
});

/* ── GET /unsubscribe?token=... ─────────────────────────────────────── */
router.get("/unsubscribe", async (req, res) => {
  const token = String(req.query["token"] ?? "").trim();

  if (!token) {
    res.status(400).json({ ok: false, error: "Token không hợp lệ" });
    return;
  }

  try {
    const [subscriber] = await db
      .select()
      .from(emailSubscribersTable)
      .where(eq(emailSubscribersTable.unsubscribeToken, token))
      .limit(1);

    if (!subscriber) {
      res.status(404).json({ ok: false, error: "Liên kết không hợp lệ hoặc đã hết hạn." });
      return;
    }

    if (subscriber.subscriberStatus === "unsubscribed") {
      res.json({ ok: true, email: subscriber.email, alreadyUnsubscribed: true });
      return;
    }

    const now = new Date();

    await db.update(emailSubscribersTable).set({
      subscriberStatus: "unsubscribed",
      unsubscribedAt:   now,
      updatedAt:        now,
    }).where(eq(emailSubscribersTable.id, subscriber.id));

    // Cancel all active sequence enrollments
    await db.update(emailSequenceEnrollmentsTable).set({ status: "cancelled" })
      .where(and(
        eq(emailSequenceEnrollmentsTable.subscriberId, subscriber.id),
        eq(emailSequenceEnrollmentsTable.status, "active"),
      ));

    res.json({ ok: true, email: subscriber.email });
  } catch (e) {
    console.error("[email/unsubscribe]", e);
    res.status(500).json({ ok: false, error: "Có lỗi xảy ra. Vui lòng thử lại." });
  }
});

/* ── Sequence enrollment helper ─────────────────────────────────────── */
async function enrollInWelcomeSequences(subscriberId: number, now: Date): Promise<void> {
  try {
    // Find all active 'on_subscribe' sequences
    const sequences = await db
      .select()
      .from(emailSequencesTable)
      .where(and(
        eq(emailSequencesTable.status, "active"),
        eq(emailSequencesTable.triggerType, "on_subscribe"),
      ));

    for (const seq of sequences) {
      // Find the first step
      const [firstStep] = await db
        .select()
        .from(emailSequenceStepsTable)
        .where(and(
          eq(emailSequenceStepsTable.sequenceId, seq.id),
          eq(emailSequenceStepsTable.isActive, true),
        ))
        .orderBy(asc(emailSequenceStepsTable.stepOrder))
        .limit(1);

      if (!firstStep) continue;

      // Check not already enrolled
      const [existingEnrollment] = await db
        .select({ id: emailSequenceEnrollmentsTable.id })
        .from(emailSequenceEnrollmentsTable)
        .where(and(
          eq(emailSequenceEnrollmentsTable.subscriberId, subscriberId),
          eq(emailSequenceEnrollmentsTable.sequenceId, seq.id),
        ))
        .limit(1);

      if (existingEnrollment) continue;

      // Enroll; nextSendAt is based on firstStep.delayDays
      const nextSendAt = new Date(now.getTime() + firstStep.delayDays * 86_400_000);

      await db.insert(emailSequenceEnrollmentsTable).values({
        subscriberId,
        sequenceId:  seq.id,
        currentStep: firstStep.stepOrder,
        status:      "active",
        nextSendAt,
        enrolledAt:  now,
      });
    }
  } catch (e) {
    console.error("[enrollInWelcomeSequences]", e);
  }
}

export default router;
