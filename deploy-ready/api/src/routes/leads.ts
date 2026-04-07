import { Router } from "express";
import { db, leadsTable } from "../lib/db/index.js";
import { eq } from "drizzle-orm";
import { triggerLeadSync } from "../services/leadSyncService.js";

const router = Router();

// In-memory rate limiter: max 3 submissions per email per hour
const submissionLog = new Map<string, number[]>();
function isRateLimited(key: string): boolean {
  const now = Date.now();
  const hits = (submissionLog.get(key) ?? []).filter((t) => now - t < 3_600_000);
  if (hits.length >= 3) return true;
  hits.push(now);
  submissionLog.set(key, hits);
  return false;
}

// Public lead submission — no auth required
router.post("/", async (req, res) => {
  try {
    const {
      name, email, phone,
      sourceType, sourcePage, sourceSection, productRef,
      message, interestTopic, formType, consentStatus,
      utmSource, utmMedium, utmCampaign, utmTerm, utmContent,
      articleSlug, articleTitle,
      referrer,
      hp, // honeypot — must be empty
    } = req.body;

    // Honeypot: bots fill hidden fields; silently succeed without saving
    if (hp && String(hp).trim() !== "") {
      res.json({ ok: true });
      return;
    }

    if (!name || !String(name).trim()) {
      res.status(400).json({ error: "Họ và tên là bắt buộc" });
      return;
    }

    const trimmedEmail = email?.trim() || null;

    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      res.status(400).json({ error: "Email không hợp lệ" });
      return;
    }

    // Rate limit by email (or fallback to ip)
    const rateKey = trimmedEmail?.toLowerCase() ?? (req.ip ?? "anon");
    if (isRateLimited(rateKey)) {
      // Silent: no error shown to visitor; avoids leaking rate-limit logic
      res.json({ ok: true });
      return;
    }

    // Email deduplication — update existing record if email already known
    if (trimmedEmail) {
      const [existing] = await db
        .select()
        .from(leadsTable)
        .where(eq(leadsTable.email, trimmedEmail))
        .limit(1);

      if (existing) {
        const [updated] = await db.update(leadsTable).set({
          name: String(name).trim(),
          phone:         phone?.trim()    || existing.phone,
          sourceType:    sourceType       || existing.sourceType,
          sourcePage:    sourcePage       || existing.sourcePage,
          sourceSection: sourceSection    || existing.sourceSection,
          productRef:    productRef       || existing.productRef,
          message:       message?.trim()  || existing.message,
          interestTopic: interestTopic    || existing.interestTopic,
          formType:      formType         || existing.formType,
          consentStatus: consentStatus    || existing.consentStatus,
          utmSource:     utmSource        || existing.utmSource,
          utmMedium:     utmMedium        || existing.utmMedium,
          utmCampaign:   utmCampaign      || existing.utmCampaign,
          utmTerm:       utmTerm          || existing.utmTerm,
          utmContent:    utmContent       || existing.utmContent,
          articleSlug:   articleSlug      || existing.articleSlug,
          articleTitle:  articleTitle     || existing.articleTitle,
          referrer:      referrer         || existing.referrer,
          updatedAt: new Date(),
        }).where(eq(leadsTable.id, existing.id)).returning();
        if (updated) triggerLeadSync(updated);
        res.json({ ok: true, id: existing.id });
        return;
      }
    }

    const [lead] = await db.insert(leadsTable).values({
      name:          String(name).trim(),
      email:         trimmedEmail,
      phone:         phone?.trim()   || null,
      sourceType:    sourceType      || null,
      sourcePage:    sourcePage      || null,
      sourceSection: sourceSection   || null,
      productRef:    productRef      || null,
      message:       message?.trim() || null,
      interestTopic: interestTopic   || null,
      formType:      formType        || null,
      consentStatus: consentStatus   || null,
      utmSource:     utmSource       || null,
      utmMedium:     utmMedium       || null,
      utmCampaign:   utmCampaign     || null,
      utmTerm:       utmTerm         || null,
      utmContent:    utmContent      || null,
      articleSlug:   articleSlug     || null,
      articleTitle:  articleTitle    || null,
      referrer:      referrer        || null,
    }).returning();

    triggerLeadSync(lead);
    res.json({ ok: true, id: lead.id });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

export default router;
