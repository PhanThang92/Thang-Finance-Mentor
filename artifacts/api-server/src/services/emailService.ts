/* ─────────────────────────────────────────────────────────────────────────
   Email service — wraps Resend SDK for the SWC personal brand site.

   Configuration (environment variables):
     RESEND_API_KEY      — required to send emails; if unset, sending is skipped
     RESEND_FROM_EMAIL   — "From" address (must be verified in Resend dashboard)
     RESEND_FROM_NAME    — Display name for the sender

   Architecture:
     - All send operations are fire-and-forget safe (log errors, never throw)
     - sendEmail() is the base primitive; higher-level functions wrap it
   ───────────────────────────────────────────────────────────────────────── */

import { Resend } from "resend";
import {
  welcomeEmailHtml,
  campaignEmailHtml,
  sequenceStepEmailHtml,
} from "./emailTemplates.js";
import type { EmailSubscriber, EmailCampaign, EmailSequenceStep } from "@workspace/db";

/* ── Provider setup ─────────────────────────────────────────────────── */

const RESEND_API_KEY    = process.env["RESEND_API_KEY"];
const RESEND_FROM_EMAIL = process.env["RESEND_FROM_EMAIL"] ?? "noreply@updates.phanvanthang.com";
const RESEND_FROM_NAME  = process.env["RESEND_FROM_NAME"]  ?? "Phan Văn Thắng SWC";
const SITE_URL          = process.env["SITE_URL"]          ?? "https://phanvanthang.com";
const UNSUBSCRIBE_BASE  = `${SITE_URL}/huy-dang-ky`;

let resend: Resend | null = null;

if (RESEND_API_KEY) {
  resend = new Resend(RESEND_API_KEY);
} else {
  console.warn("[email] RESEND_API_KEY not configured — email sending is disabled. Set the env var to enable.");
}

/* ── Base send function ─────────────────────────────────────────────── */

export async function sendEmail(opts: {
  to:       string;
  subject:  string;
  html:     string;
  replyTo?: string;
}): Promise<{ ok: boolean; id?: string; error?: string }> {
  if (!resend) {
    console.log(`[email] (disabled) Would send to ${opts.to}: "${opts.subject}"`);
    return { ok: true };
  }

  try {
    const result = await resend.emails.send({
      from:     `${RESEND_FROM_NAME} <${RESEND_FROM_EMAIL}>`,
      to:       opts.to,
      subject:  opts.subject,
      html:     opts.html,
      replyTo:  opts.replyTo,
    });
    if (result.error) {
      console.error("[email] send error:", result.error);
      return { ok: false, error: String(result.error) };
    }
    return { ok: true, id: result.data?.id };
  } catch (e) {
    console.error("[email] send exception:", e);
    return { ok: false, error: String(e) };
  }
}

/* ── Subscriber unsubscribe URL helper ──────────────────────────────── */

export function unsubscribeUrl(token: string): string {
  return `${UNSUBSCRIBE_BASE}?token=${encodeURIComponent(token)}`;
}

/* ── Welcome email ─────────────────────────────────────────────────── */

export async function sendWelcomeEmail(subscriber: EmailSubscriber): Promise<void> {
  const html = welcomeEmailHtml({
    fullName:       subscriber.fullName,
    unsubscribeUrl: unsubscribeUrl(subscriber.unsubscribeToken),
    siteUrl:        SITE_URL,
  });

  await sendEmail({
    to:      subscriber.email,
    subject: "Chào mừng bạn — Phan Văn Thắng SWC",
    html,
  });
}

/* ── Campaign broadcast ────────────────────────────────────────────── */

export async function sendCampaignToSubscribers(
  campaign: EmailCampaign,
  subscribers: EmailSubscriber[],
  onProgress?: (sent: number, total: number) => void,
): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;

  for (const sub of subscribers) {
    const html = campaignEmailHtml({
      subject:        campaign.subject,
      previewText:    campaign.previewText,
      contentBody:    campaign.contentBody ?? "",
      unsubscribeUrl: unsubscribeUrl(sub.unsubscribeToken),
    });

    const result = await sendEmail({ to: sub.email, subject: campaign.subject, html });
    if (result.ok) { sent++; } else { failed++; }

    onProgress?.(sent, subscribers.length);

    // Gentle rate control: 100ms between sends to stay within Resend limits
    if (sent + failed < subscribers.length) {
      await new Promise((r) => setTimeout(r, 100));
    }
  }

  return { sent, failed };
}

/* ── Sequence step email ────────────────────────────────────────────── */

export async function sendSequenceStepToSubscriber(
  subscriber: EmailSubscriber,
  step: EmailSequenceStep,
): Promise<{ ok: boolean }> {
  const html = sequenceStepEmailHtml({
    subject:        step.subject,
    previewText:    step.previewText,
    contentBody:    step.contentBody ?? "",
    unsubscribeUrl: unsubscribeUrl(subscriber.unsubscribeToken),
  });

  const result = await sendEmail({ to: subscriber.email, subject: step.subject, html });
  return { ok: result.ok };
}

/* ── Test email ─────────────────────────────────────────────────────── */

export async function sendTestEmail(opts: {
  to:          string;
  subject:     string;
  contentBody: string;
}): Promise<{ ok: boolean; error?: string }> {
  const html = campaignEmailHtml({
    subject:        `[TEST] ${opts.subject}`,
    previewText:    "Đây là email thử nghiệm từ admin.",
    contentBody:    opts.contentBody,
    unsubscribeUrl: null,
  });

  return sendEmail({ to: opts.to, subject: `[TEST] ${opts.subject}`, html });
}
