/* ─────────────────────────────────────────────────────────────────────────
   Customer Confirmation Service
   Gửi email xác nhận tự động cho khách hàng sau khi họ đăng ký form.

   Flow:
   1. Kiểm tra cài đặt confirm_enabled từ siteSettingsTable
   2. Xác định loại form → lấy subject + body phù hợp
   3. Build HTML email đẹp, có thương hiệu
   4. Gửi qua sendEmail() — fire-and-forget, không throw
   ───────────────────────────────────────────────────────────────────────── */

import { db, siteSettingsTable } from "../db";
import { inArray } from "drizzle-orm";
import { sendEmail } from "./emailService.js";
import type { Lead } from "../db";

/* ── Settings keys ───────────────────────────────────────────────────── */
const CONFIRM_KEYS = [
  "confirm_enabled",
  "confirm_subject_lead",
  "confirm_body_lead",
  "confirm_subject_contact",
  "confirm_body_contact",
  "confirm_subject_product",
  "confirm_body_product",
  "confirm_subject_community",
  "confirm_body_community",
] as const;

type ConfirmKey = typeof CONFIRM_KEYS[number];

/* ── Default content ─────────────────────────────────────────────────── */
const DEFAULTS: Record<ConfirmKey, string> = {
  confirm_enabled:          "false",
  confirm_subject_lead:     "Cảm ơn anh/chị đã đăng ký nhận thông tin từ Phan Văn Thắng SWC",
  confirm_body_lead:
    "Thắng đã ghi nhận thông tin đăng ký của anh/chị. Sắp tới Thắng sẽ gửi những tài liệu nền tảng và cập nhật nội dung mới đến anh/chị — phù hợp với mối quan tâm anh/chị đã chọn.\n\nNếu anh/chị có câu hỏi gì, cứ reply thẳng vào email này nhé.",
  confirm_subject_contact:  "Thắng đã nhận được tin nhắn của anh/chị",
  confirm_body_contact:
    "Cảm ơn anh/chị đã liên hệ. Thắng đã nhận được tin nhắn và sẽ phản hồi trong thời gian sớm nhất, thường trong vòng 1–2 ngày làm việc.\n\nNếu cần trao đổi gấp, anh/chị có thể liên hệ qua Zalo hoặc các kênh trên website.",
  confirm_subject_product:  "Cảm ơn anh/chị đã quan tâm đến chương trình của Phan Văn Thắng SWC",
  confirm_body_product:
    "Thắng đã nhận được thông tin của anh/chị và sẽ liên hệ để trao đổi thêm về chương trình phù hợp trong thời gian sớm nhất.\n\nCảm ơn anh/chị đã tin tưởng — Thắng rất vui được đồng hành.",
  confirm_subject_community: "Chào mừng anh/chị đến với cộng đồng Phan Văn Thắng SWC",
  confirm_body_community:
    "Cảm ơn anh/chị đã muốn tham gia cộng đồng. Thắng đã ghi nhận thông tin và sẽ sớm gửi thêm thông tin về cộng đồng, các buổi sinh hoạt và tài liệu dành cho thành viên.\n\nRất vui được đồng hành cùng anh/chị.",
};

/* ── Load settings ───────────────────────────────────────────────────── */
async function loadConfirmSettings(): Promise<Record<ConfirmKey, string>> {
  const result = { ...DEFAULTS };
  try {
    const rows = await db
      .select()
      .from(siteSettingsTable)
      .where(inArray(siteSettingsTable.key, [...CONFIRM_KEYS]));
    for (const row of rows) {
      if (CONFIRM_KEYS.includes(row.key as ConfirmKey) && row.value != null) {
        result[row.key as ConfirmKey] = row.value;
      }
    }
  } catch (e) {
    console.error("[confirm] Failed to load confirmation settings:", e);
  }
  return result;
}

/* ── Determine form category ─────────────────────────────────────────── */
type FormCategory = "lead" | "contact" | "product" | "community";

function resolveCategory(lead: Lead): FormCategory {
  const ft = (lead.formType ?? "").toLowerCase();
  const st = (lead.sourceType ?? "").toLowerCase();
  const sp = (lead.sourcePage ?? "").toLowerCase();

  if (
    ft.includes("consultation") || ft.includes("product") || ft.includes("san-pham") ||
    st.includes("san-pham") || sp.includes("san-pham") || !!lead.productRef
  ) return "product";

  if (
    ft.includes("community") || st.includes("cong-dong") || sp.includes("cong-dong")
  ) return "community";

  if (
    ft.includes("contact") || ft.includes("lien-he") ||
    st.includes("lien-he") || sp.includes("lien-he")
  ) return "contact";

  return "lead"; // email-capture, newsletter, homepage, etc.
}

/* ── HTML escape ─────────────────────────────────────────────────────── */
function esc(v: string | null | undefined): string {
  return (v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/* ── Build confirmation HTML ─────────────────────────────────────────── */
function buildConfirmationHtml(lead: Lead, body: string, siteUrl: string): string {
  const firstName = lead.name.split(" ").pop() ?? lead.name; // lấy tên cuối (Việt Nam)

  // Convert newlines to <br> paragraphs
  const bodyHtml = body
    .split(/\n{2,}/)
    .map((para) => `<p style="margin:0 0 14px;font-size:14.5px;line-height:1.82;color:#2d2d2d">${esc(para.trim()).replace(/\n/g, "<br>")}</p>`)
    .join("");

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Email xác nhận</title>
</head>
<body style="margin:0;padding:0;background:#f0f4f3;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Be Vietnam Pro',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f3;padding:32px 16px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #d8e5e2;max-width:560px">

        <!-- Header -->
        <tr>
          <td style="background:#1a7868;padding:22px 32px">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <p style="margin:0;font-size:15px;font-weight:700;color:#ffffff;letter-spacing:0.01em">
                    Phan Văn Thắng SWC
                  </p>
                  <p style="margin:3px 0 0;font-size:11.5px;color:rgba(255,255,255,0.68)">
                    Tư duy tài chính đúng — Tích sản dài hạn
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px 32px 8px">
            <p style="margin:0 0 22px;font-size:17px;font-weight:600;color:#1a1a1a;letter-spacing:-0.01em">
              Xin chào ${esc(firstName)},
            </p>
            ${bodyHtml}
          </td>
        </tr>

        <!-- Signature -->
        <tr>
          <td style="padding:8px 32px 28px">
            <p style="margin:0 0 4px;font-size:13.5px;color:#555">Trân trọng,</p>
            <p style="margin:0;font-size:14px;font-weight:600;color:#1a7868">Phan Văn Thắng</p>
            <p style="margin:2px 0 0;font-size:12px;color:#888">
              <a href="${esc(siteUrl)}" style="color:#1a7868;text-decoration:none">${esc(siteUrl.replace(/^https?:\/\//, ""))}</a>
            </p>
          </td>
        </tr>

        <!-- Divider -->
        <tr>
          <td style="padding:0 32px">
            <div style="height:1px;background:#e8eeec"></div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:18px 32px 24px;background:#f8faf9">
            <p style="margin:0;font-size:11.5px;color:#aaa;line-height:1.7">
              Anh/chị nhận email này vì đã để lại thông tin trên
              <a href="${esc(siteUrl)}" style="color:#1a7868;text-decoration:none">${esc(siteUrl.replace(/^https?:\/\//, ""))}</a>.
              Đây là email gửi tự động — anh/chị có thể reply trực tiếp nếu cần trao đổi thêm.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/* ── Main export ─────────────────────────────────────────────────────── */
export async function sendCustomerConfirmation(
  lead: Lead,
): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  // Must have a valid email
  if (!lead.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) {
    return { ok: true, skipped: true };
  }

  try {
    const settings = await loadConfirmSettings();

    // Check if enabled
    if (settings.confirm_enabled !== "true") {
      return { ok: true, skipped: true };
    }

    const category  = resolveCategory(lead);
    const subject   = settings[`confirm_subject_${category}`] || settings.confirm_subject_lead;
    const body      = settings[`confirm_body_${category}`]   || settings.confirm_body_lead;
    const siteUrl   = process.env["SITE_URL"] ?? "https://phanvanthang.net";

    const html = buildConfirmationHtml(lead, body, siteUrl);

    const result = await sendEmail({
      to:      lead.email,
      subject,
      html,
    });

    if (result.ok) {
      console.info(`[confirm] Confirmation sent to ${lead.email} (lead #${lead.id}, category: ${category})`);
    } else {
      console.warn(`[confirm] Confirmation failed for lead #${lead.id}: ${result.error}`);
    }

    return result;
  } catch (e) {
    const msg = String(e);
    console.error(`[confirm] Unexpected error for lead #${lead.id}:`, e);
    return { ok: false, error: msg };
  }
}

export { CONFIRM_KEYS, DEFAULTS as CONFIRM_DEFAULTS };
export type { ConfirmKey, FormCategory };
