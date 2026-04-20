/* Resource email delivery — sends a resource download link via Resend.
   Falls back to console-log when RESEND_API_KEY is not configured.   */

import { Resend } from "resend";

const RESEND_KEY  = process.env["RESEND_API_KEY"]  ?? "";
const FROM_EMAIL  = process.env["RESEND_FROM_EMAIL"] ?? "noreply@phanvanthang.net";
const FROM_NAME   = process.env["RESEND_FROM_NAME"]  ?? "Thắng SWC";
const SITE_URL    = process.env["SITE_URL"]           ?? "https://phanvanthang.net";

const resend = RESEND_KEY ? new Resend(RESEND_KEY) : null;

interface ResourceDeliveryOpts {
  to: { email: string; fullName?: string | null };
  resource: {
    title: string;
    downloadUrl: string;
    fileName?: string | null;
    thankYouMessage?: string | null;
  };
  unsubscribeToken?: string;
}

export async function sendResourceEmail(opts: ResourceDeliveryOpts): Promise<void> {
  const { to, resource } = opts;
  const subject = `Tài liệu "${resource.title}" — sẵn sàng để tải`;
  const html = buildResourceEmailHtml(opts);

  if (!resend) {
    console.log(`[resourceEmail] RESEND not configured. Would send "${subject}" to ${to.email}`);
    return;
  }

  try {
    await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to:   [to.email],
      subject,
      html,
    });
  } catch (e) {
    console.error("[resourceEmail] Failed to send:", e);
  }
}

function buildResourceEmailHtml(opts: ResourceDeliveryOpts): string {
  const { to, resource, unsubscribeToken } = opts;
  const greeting = to.fullName ? `Xin chào ${to.fullName},` : "Xin chào,";
  const downloadLabel = resource.fileName ? `Tải xuống: ${resource.fileName}` : "Tải xuống tài liệu";
  const thankYou = resource.thankYouMessage
    ?? "Cảm ơn anh/chị đã quan tâm. Tài liệu này được tạo ra với mong muốn cung cấp nền tảng thực sự hữu ích — không phải lý thuyết rỗng.";
  const unsubLink = unsubscribeToken
    ? `${SITE_URL}/huy-dang-ky?token=${encodeURIComponent(unsubscribeToken)}`
    : `${SITE_URL}/huy-dang-ky`;

  return `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${resource.title}</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f4;font-family:'Be Vietnam Pro',ui-sans-serif,system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f4;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:580px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
        <tr>
          <td style="background:#0f766e;padding:28px 36px;">
            <p style="margin:0;font-size:12px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:rgba(255,255,255,0.65);">Phan Văn Thắng SWC</p>
            <h1 style="margin:8px 0 0;font-size:20px;font-weight:700;color:#ffffff;line-height:1.3;letter-spacing:-0.01em;">${resource.title}</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 36px;">
            <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7;">${greeting}</p>
            <p style="margin:0 0 28px;font-size:15px;color:#374151;line-height:1.75;">${thankYou}</p>
            <table cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
              <tr>
                <td style="background:#0f766e;border-radius:8px;">
                  <a href="${resource.downloadUrl}" style="display:inline-block;padding:14px 28px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:0.01em;">${downloadLabel}</a>
                </td>
              </tr>
            </table>
            <p style="margin:0 0 8px;font-size:13px;color:#6b7280;line-height:1.65;">Nếu nút không hoạt động, sao chép đường dẫn sau vào trình duyệt:</p>
            <p style="margin:0;font-size:12px;color:#9ca3af;word-break:break-all;">${resource.downloadUrl}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 36px;border-top:1px solid #f3f4f6;">
            <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;">
              Anh/chị nhận email này vì đã yêu cầu tài liệu trên website.
              Nếu không phải anh/chị, vui lòng bỏ qua email này.
              <br/>
              <a href="${unsubLink}" style="color:#9ca3af;">Huỷ đăng ký</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
