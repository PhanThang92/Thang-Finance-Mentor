/* ─────────────────────────────────────────────────────────────────────────
   Email templates for Phan Văn Thắng SWC
   - Email-safe HTML: table layout, inline styles, web-safe fonts
   - Brand colours: primary teal #1a7868
   ───────────────────────────────────────────────────────────────────────── */

const TEAL      = "#1a7868";
const TEAL_DARK = "#156558";
const BG        = "#f5f6f7";
const CARD_BG   = "#ffffff";
const TEXT      = "#1a1a1a";
const TEXT_MUTED= "#6b7280";
const FOOTER_BG = "#f9fafb";
const BORDER    = "rgba(0,0,0,0.07)";

function wrapEmailLayout(opts: {
  subject:       string;
  previewText?:  string | null;
  bodyHtml:      string;
  unsubscribeUrl?: string | null;
  footerNote?:   string;
}): string {
  const { subject, previewText, bodyHtml, unsubscribeUrl, footerNote } = opts;

  const previewSpan = previewText
    ? `<span style="display:none;font-size:1px;line-height:1px;color:${BG};white-space:nowrap;overflow:hidden;mso-hide:all;max-height:0;max-width:0;opacity:0;">${previewText}</span>`
    : "";

  const unsubscribeRow = unsubscribeUrl
    ? `<tr><td align="center" style="padding-top:6px;"><a href="${unsubscribeUrl}" style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#9ca3af;text-decoration:underline;">Hủy đăng ký email</a></td></tr>`
    : "";

  const footerNoteRow = footerNote
    ? `<tr><td align="center" style="padding-bottom:4px;"><p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#9ca3af;">${footerNote}</p></td></tr>`
    : "";

  return `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background-color:${BG};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
${previewSpan}
<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color:${BG};width:100%;">
<tr>
<td align="center" style="padding:32px 16px 48px;">
<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width:580px;width:100%;">

  <!-- Brand header -->
  <tr>
    <td style="background:linear-gradient(135deg,${TEAL_DARK} 0%,${TEAL} 100%);padding:24px 40px 20px;border-radius:12px 12px 0 0;text-align:center;">
      <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;color:rgba(255,255,255,0.5);letter-spacing:0.20em;text-transform:uppercase;">Phan Văn Thắng &middot; SWC</p>
    </td>
  </tr>

  <!-- Body -->
  <tr>
    <td style="background-color:${CARD_BG};border-left:1px solid ${BORDER};border-right:1px solid ${BORDER};padding:36px 40px 32px;">
      ${bodyHtml}
    </td>
  </tr>

  <!-- Footer -->
  <tr>
    <td style="background-color:${FOOTER_BG};border:1px solid ${BORDER};border-top:none;border-radius:0 0 12px 12px;padding:18px 40px 22px;">
      <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center">
            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:${TEXT_MUTED};">Phan Văn Thắng SWC &nbsp;&middot;&nbsp; Hà Nội, Việt Nam</p>
          </td>
        </tr>
        ${footerNoteRow}
        ${unsubscribeRow}
      </table>
    </td>
  </tr>

</table>
</td>
</tr>
</table>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function bodyText(text: string): string {
  return `<p style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${TEXT};line-height:1.75;">${text}</p>`;
}

function bodyHeading(text: string): string {
  return `<p style="margin:0 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:700;color:${TEXT};">${text}</p>`;
}

function ctaButton(label: string, url: string): string {
  return `<table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin:8px 0 24px;">
<tr><td style="border-radius:8px;background-color:${TEAL};">
  <a href="${url}" style="display:inline-block;padding:12px 28px;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:8px;">${label}</a>
</td></tr>
</table>`;
}

function divider(): string {
  return `<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="margin:20px 0;">
<tr><td style="border-top:1px solid ${BORDER};"></td></tr>
</table>`;
}

/* ── Specific templates ────────────────────────────────────────────── */

export function welcomeEmailHtml(opts: {
  fullName?:       string | null;
  unsubscribeUrl:  string;
  siteUrl?:        string;
}): string {
  const name   = opts.fullName ? (opts.fullName.trim().split(" ").at(-1) ?? opts.fullName) : "bạn";
  const site   = opts.siteUrl ?? "https://phanvanthang.com";

  const bodyHtml = [
    bodyHeading(`Xin chào ${escapeHtml(name)},`),
    bodyText("Cảm ơn bạn đã đăng ký nhận nội dung từ mình. Rất vui khi có bạn ở đây."),
    bodyText(
      "Mình là Phan Văn Thắng — tập trung vào tài chính cá nhân, đầu tư dài hạn và xây dựng tư duy làm giàu bền vững. " +
      "Những chia sẻ từ đây mang tinh thần thực tế, bình tĩnh, và hướng đến giá trị dài hạn."
    ),
    bodyText(
      "Trong thời gian tới, bạn sẽ nhận được những bài viết, phân tích và chia sẻ được chọn lọc kỹ lưỡng. " +
      "Mình chỉ gửi khi có nội dung thực sự đáng đọc — không spam, không nhiễu."
    ),
    ctaButton("Khám phá nội dung", site),
    divider(),
    bodyText("Nếu bạn có bất kỳ câu hỏi nào, chỉ cần trả lời email này."),
    `<p style="margin:24px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${TEXT};line-height:1.75;">Thân mến,<br><strong>Phan Văn Thắng</strong></p>`,
  ].join("\n");

  return wrapEmailLayout({
    subject:     "Chào mừng bạn — Phan Văn Thắng SWC",
    previewText: "Cảm ơn bạn đã đăng ký. Đây là những gì bạn có thể mong đợi từ mình...",
    bodyHtml,
    unsubscribeUrl: opts.unsubscribeUrl,
  });
}

export function campaignEmailHtml(opts: {
  subject:        string;
  previewText?:   string | null;
  contentBody:    string;
  unsubscribeUrl: string;
}): string {
  const paragraphs = opts.contentBody
    .split(/\n\n+/)
    .filter((p) => p.trim())
    .map((p) => bodyText(p.trim().replace(/\n/g, "<br>")))
    .join("\n");

  return wrapEmailLayout({
    subject:        opts.subject,
    previewText:    opts.previewText,
    bodyHtml:       paragraphs,
    unsubscribeUrl: opts.unsubscribeUrl,
  });
}

export function sequenceStepEmailHtml(opts: {
  subject:              string;
  previewText?:         string | null;
  contentBody:          string;
  unsubscribeUrl:       string;
  ctaText?:             string | null;
  ctaUrl?:              string | null;
  ctaSecondaryText?:    string | null;
  ctaSecondaryUrl?:     string | null;
}): string {
  const paragraphs = opts.contentBody
    .split(/\n\n+/)
    .filter((p) => p.trim())
    .map((p) => {
      // Bold: **text**
      const processed = p.trim()
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/\n/g, "<br>");
      return bodyText(processed);
    })
    .join("\n");

  const primaryBtn    = (opts.ctaText?.trim() && opts.ctaUrl?.trim())
    ? ctaButton(opts.ctaText.trim(), opts.ctaUrl.trim())
    : "";
  const secondaryBtn  = (opts.ctaSecondaryText?.trim() && opts.ctaSecondaryUrl?.trim())
    ? `<p style="margin:0 0 20px;"><a href="${opts.ctaSecondaryUrl.trim()}" style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${TEAL};text-decoration:underline;">${opts.ctaSecondaryText.trim()}</a></p>`
    : "";

  const bodyHtml = [paragraphs, primaryBtn, secondaryBtn].filter(Boolean).join("\n");

  return wrapEmailLayout({
    subject:        opts.subject,
    previewText:    opts.previewText,
    bodyHtml,
    unsubscribeUrl: opts.unsubscribeUrl,
  });
}

export function unsubscribePageHtml(opts: {
  success: boolean;
  email?:  string;
  resubscribeUrl?: string;
}): string {
  const msg = opts.success
    ? `<p style="font-size:15px;color:#1a1a1a;margin:0 0 12px;">Bạn đã hủy đăng ký thành công${opts.email ? ` cho địa chỉ <strong>${escapeHtml(opts.email)}</strong>` : ""}.</p>
       <p style="font-size:13px;color:#6b7280;margin:0 0 20px;">Bạn sẽ không nhận được email từ chúng tôi nữa.</p>`
    : `<p style="font-size:15px;color:#c13333;margin:0 0 12px;">Liên kết không hợp lệ hoặc đã hết hạn.</p>`;

  return `<!DOCTYPE html><html lang="vi"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Hủy đăng ký email</title>
<style>body{margin:0;padding:40px 16px;font-family:Arial,Helvetica,sans-serif;background:#f5f6f7;display:flex;align-items:center;justify-content:center;min-height:100vh;box-sizing:border-box;}</style>
</head>
<body>
<div style="max-width:480px;width:100%;background:#fff;border-radius:12px;border:1px solid rgba(0,0,0,0.08);padding:40px;text-align:center;">
  <p style="font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#6b7280;margin:0 0 24px;">Phan Văn Thắng &middot; SWC</p>
  <h1 style="font-size:22px;font-weight:700;color:#1a1a1a;margin:0 0 16px;">Hủy đăng ký</h1>
  ${msg}
  <a href="/" style="display:inline-block;padding:10px 24px;border-radius:8px;background:#1a7868;color:#fff;font-size:13px;font-weight:700;text-decoration:none;">Về trang chủ</a>
</div>
</body></html>`;
}
