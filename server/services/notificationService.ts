/* ─────────────────────────────────────────────────────────────────────────
   Notification Service — gửi email thông báo khi có form submission mới.

   Flow:
   1. Xác định loại form → lấy email nhận thông báo tương ứng từ DB settings
   2. Build HTML email sạch, dễ đọc
   3. Gửi qua sendEmail() — fire-and-forget, không throw
   4. Trả về { ok, error } để caller cập nhật notifyStatus vào DB
   ───────────────────────────────────────────────────────────────────────── */

import { db, siteSettingsTable } from "../db";
import { inArray } from "drizzle-orm";
import { sendEmail } from "./emailService.js";
import type { Lead } from "../db";

/* ── Default notification recipients ─────────────────────────────────── */
const DEFAULT_EMAIL = "lienhe@phanvanthang.net";

const NOTIFY_KEYS = [
  "notify_email_general",
  "notify_email_contact",
  "notify_email_lead",
  "notify_email_product",
] as const;

type NotifyKey = typeof NOTIFY_KEYS[number];

async function loadNotifySettings(): Promise<Record<NotifyKey, string>> {
  const defaults: Record<NotifyKey, string> = {
    notify_email_general: DEFAULT_EMAIL,
    notify_email_contact: DEFAULT_EMAIL,
    notify_email_lead:    DEFAULT_EMAIL,
    notify_email_product: DEFAULT_EMAIL,
  };
  try {
    const rows = await db
      .select()
      .from(siteSettingsTable)
      .where(inArray(siteSettingsTable.key, [...NOTIFY_KEYS]));
    for (const row of rows) {
      if (NOTIFY_KEYS.includes(row.key as NotifyKey) && row.value?.trim()) {
        defaults[row.key as NotifyKey] = row.value.trim();
      }
    }
  } catch (e) {
    console.error("[notify] Failed to load notification settings from DB:", e);
  }
  return defaults;
}

/* ── Determine recipient based on form type + source ─────────────────── */
function resolveRecipientKey(lead: Lead): NotifyKey {
  const ft = (lead.formType ?? "").toLowerCase();
  const st = (lead.sourceType ?? "").toLowerCase();
  const sp = (lead.sourcePage ?? "").toLowerCase();

  // Product inquiry / consultation
  if (
    ft.includes("consultation") || ft.includes("product") || ft.includes("san-pham") ||
    st.includes("san-pham") || sp.includes("san-pham") ||
    lead.productRef
  ) return "notify_email_product";

  // Newsletter / lead magnet / community
  if (
    ft.includes("email-capture") || ft.includes("newsletter") || ft.includes("community") ||
    st.includes("cong-dong") || sp.includes("cong-dong") ||
    ft.includes("tin-tuc") || sp.includes("tin-tuc")
  ) return "notify_email_lead";

  // Contact form
  if (
    ft.includes("contact") || ft.includes("lien-he") ||
    st.includes("lien-he") || sp.includes("lien-he") ||
    st.includes("contact")
  ) return "notify_email_contact";

  return "notify_email_general";
}

/* ── Subject line by form/source type ────────────────────────────────── */
function buildSubject(lead: Lead): string {
  const key = resolveRecipientKey(lead);
  if (key === "notify_email_product") return `[Quan tâm sản phẩm] ${lead.name}`;
  if (key === "notify_email_lead")    return `[Lead mới] ${lead.name}`;
  if (key === "notify_email_contact") return `[Liên hệ mới] ${lead.name}`;
  return `[Đăng ký mới] ${lead.name}`;
}

/* ── HTML email template ──────────────────────────────────────────────── */
function esc(v: string | null | undefined): string {
  return (v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function buildNotificationHtml(lead: Lead, adminUrl: string): string {
  const formLabel =
    lead.formType === "consultation" ? "Tư vấn / sản phẩm" :
    lead.formType === "email-capture" ? "Đăng ký email" :
    lead.formType === "community" ? "Tham gia cộng đồng" :
    lead.formType === "contact" ? "Liên hệ" :
    (lead.formType ?? "Chung");

  const submittedAt = new Date(lead.createdAt).toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  const row = (label: string, value: string | null | undefined, mono = false) =>
    value
      ? `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;font-size:13px;color:#666;white-space:nowrap;vertical-align:top">${label}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;font-size:13px;color:#1a1a1a;${mono ? "font-family:monospace" : ""}">${esc(value)}</td>
        </tr>`
      : "";

  return `<!DOCTYPE html>
<html lang="vi">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 16px">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:10px;overflow:hidden;border:1px solid #e5e7eb">
        <!-- Header -->
        <tr>
          <td style="background:#1a7868;padding:20px 28px">
            <p style="margin:0;font-size:15px;font-weight:700;color:#fff">Phan Văn Thắng SWC</p>
            <p style="margin:4px 0 0;font-size:12px;color:rgba(255,255,255,0.75)">Thông báo form mới — ${esc(formLabel)}</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:24px 28px 16px">
            <p style="margin:0 0 16px;font-size:15px;font-weight:600;color:#1a1a1a">
              Có một form mới được gửi từ website
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #f0f0f0;border-radius:7px;overflow:hidden">
              ${row("Loại form",        formLabel)}
              ${row("Họ và tên",       lead.name)}
              ${row("Email",           lead.email, true)}
              ${row("Điện thoại",      lead.phone)}
              ${row("Lời nhắn",        lead.message)}
              ${row("Sản phẩm",        lead.productRef)}
              ${row("Chủ đề quan tâm", lead.interestTopic)}
              ${row("Trang nguồn",     lead.sourcePage)}
              ${row("Thời gian",       submittedAt)}
            </table>
          </td>
        </tr>
        <!-- CTA -->
        ${adminUrl ? `
        <tr>
          <td style="padding:4px 28px 24px">
            <a href="${esc(adminUrl)}"
               style="display:inline-block;padding:10px 20px;background:#1a7868;color:#fff;border-radius:6px;font-size:13px;font-weight:600;text-decoration:none">
              Xem trong Admin
            </a>
          </td>
        </tr>` : ""}
        <!-- Footer -->
        <tr>
          <td style="padding:16px 28px;border-top:1px solid #f0f0f0;background:#fafafa">
            <p style="margin:0;font-size:11.5px;color:#999">
              Email này được gửi tự động từ hệ thống quản lý Phan Văn Thắng SWC.
              Không trả lời email này — đây là địa chỉ gửi tự động.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/* ── Main export: send lead notification ─────────────────────────────── */
export async function sendLeadNotification(
  lead: Lead,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const settings   = await loadNotifySettings();
    const key        = resolveRecipientKey(lead);
    const recipient  = settings[key] || settings.notify_email_general || DEFAULT_EMAIL;

    // Basic email validation — skip if malformed
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) {
      console.warn(`[notify] Invalid notification recipient "${recipient}" — skipping`);
      return { ok: false, error: `Invalid recipient: ${recipient}` };
    }

    const siteUrl  = process.env["SITE_URL"] ?? "https://phanvanthang.net";
    const adminUrl = `${siteUrl}/admin`;
    const html     = buildNotificationHtml(lead, adminUrl);
    const subject  = buildSubject(lead);
    const replyTo  = process.env["RESEND_REPLY_TO"] ?? process.env["RESEND_FROM_EMAIL"] ?? undefined;

    const result = await sendEmail({ to: recipient, subject, html, replyTo });

    if (result.ok) {
      console.info(`[notify] Notification sent to ${recipient} for lead #${lead.id} (${key})`);
    } else {
      console.warn(`[notify] Notification failed for lead #${lead.id}: ${result.error}`);
    }

    return result;
  } catch (e) {
    const msg = String(e);
    console.error(`[notify] Unexpected error for lead #${lead.id}:`, e);
    return { ok: false, error: msg };
  }
}

/* ── Export key list for admin settings endpoint ─────────────────────── */
export { NOTIFY_KEYS, DEFAULT_EMAIL };
export type { NotifyKey };
