import React, { useState, useEffect } from "react";
import { adminApi } from "@/lib/newsApi";
import { A, s } from "./shared";

type Settings = {
  senderName: string;
  senderEmail: string;
  replyToEmail: string;
  siteUrl: string;
  providerType: string;
  apiKeyConfigured: boolean;
};

type NotifySettings = {
  notify_email_general: string;
  notify_email_contact: string;
  notify_email_lead: string;
  notify_email_product: string;
};

const DEFAULT_NOTIFY: NotifySettings = {
  notify_email_general: "",
  notify_email_contact: "",
  notify_email_lead: "",
  notify_email_product: "",
};

export function EmailSettingsPanel({ adminKey }: { adminKey: string }) {
  const [settings,      setSettings]      = useState<Settings | null>(null);
  const [loading,       setLoading]       = useState(true);
  const [saving,        setSaving]        = useState(false);
  const [msg,           setMsg]           = useState("");
  const [testEmail,     setTestEmail]     = useState("");
  const [testSending,   setTestSending]   = useState(false);
  const [testMsg,       setTestMsg]       = useState("");

  // Notification recipients
  const [notify,        setNotify]        = useState<NotifySettings>(DEFAULT_NOTIFY);
  const [notifyLoading, setNotifyLoading] = useState(true);
  const [notifySaving,  setNotifySaving]  = useState(false);
  const [notifyMsg,     setNotifyMsg]     = useState("");

  useEffect(() => {
    setLoading(true);
    adminApi.getEmailSettings(adminKey)
      .then(setSettings)
      .catch((e) => setMsg(String(e)))
      .finally(() => setLoading(false));

    setNotifyLoading(true);
    adminApi.getSettings(adminKey)
      .then((allSettings) => {
        setNotify({
          notify_email_general: allSettings["notify_email_general"] ?? "",
          notify_email_contact: allSettings["notify_email_contact"] ?? "",
          notify_email_lead:    allSettings["notify_email_lead"]    ?? "",
          notify_email_product: allSettings["notify_email_product"] ?? "",
        });
      })
      .catch(() => {})
      .finally(() => setNotifyLoading(false));
  }, [adminKey]);

  const save = async () => {
    if (!settings) return;
    setSaving(true); setMsg("");
    try {
      setMsg("Cài đặt email được cấu hình qua biến môi trường (RESEND_API_KEY, SENDER_NAME, SENDER_EMAIL...).");
    } finally { setSaving(false); }
  };

  const saveNotify = async () => {
    setNotifySaving(true); setNotifyMsg("");
    try {
      await adminApi.updateSettings(adminKey, {
        notify_email_general: notify.notify_email_general.trim(),
        notify_email_contact: notify.notify_email_contact.trim(),
        notify_email_lead:    notify.notify_email_lead.trim(),
        notify_email_product: notify.notify_email_product.trim(),
      });
      setNotifyMsg("Đã lưu địa chỉ email thông báo.");
    } catch (e) {
      setNotifyMsg("Lỗi: " + String(e));
    } finally { setNotifySaving(false); }
  };

  const sendTest = async () => {
    if (!testEmail.trim()) { setTestMsg("Vui lòng nhập email."); return; }
    setTestSending(true); setTestMsg("");
    try {
      const r = await adminApi.sendTestEmailSettings(adminKey, testEmail.trim());
      setTestMsg(r.ok ? "Email thử nghiệm đã được gửi thành công." : `Lỗi: ${r.error ?? "unknown"}`);
    } catch (e) { setTestMsg(String(e)); }
    finally { setTestSending(false); }
  };

  if (loading) return <p style={{ color: A.textMuted, fontSize: "13px" }}>Đang tải...</p>;

  const infoRow = (label: string, value: string | boolean | undefined | null) => (
    <div style={{ display: "flex", gap: "12px", padding: "10px 0", borderBottom: `1px solid ${A.border}` }}>
      <span style={{ fontSize: "12px", fontWeight: 600, color: A.textMuted, minWidth: "180px", flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: "13px", color: A.text, fontFamily: typeof value === "string" && value.includes("@") ? "monospace" : undefined }}>
        {typeof value === "boolean"
          ? (value
              ? <span style={{ color: "#16a34a", fontWeight: 600 }}>Đã cấu hình</span>
              : <span style={{ color: "#ea580c", fontWeight: 600 }}>Chưa cấu hình</span>)
          : (value || <span style={{ color: A.textLight }}>—</span>)
        }
      </span>
    </div>
  );

  const notifyField = (
    key: keyof NotifySettings,
    label: string,
    description: string,
  ) => (
    <div style={{ marginBottom: "1rem" }}>
      <label style={s.label}>{label}</label>
      <p style={{ fontSize: "11.5px", color: A.textLight, margin: "0 0 5px" }}>{description}</p>
      <input
        type="email"
        value={notify[key]}
        onChange={(e) => setNotify((prev) => ({ ...prev, [key]: e.target.value }))}
        placeholder="email@domain.com"
        style={{ ...s.field, fontFamily: "monospace", fontSize: "13px" }}
      />
    </div>
  );

  return (
    <div style={{ maxWidth: "620px" }}>
      <div style={s.sectionHeader}>
        <div>
          <h2 style={s.sectionTitle}>Cài đặt email</h2>
          <p style={{ fontSize: "13px", color: A.textMuted, margin: "4px 0 0" }}>Cấu hình người gửi, nhà cung cấp và kiểm tra kết nối.</p>
        </div>
      </div>

      {msg && <div style={s.success}>{msg}</div>}

      {/* Provider info */}
      <div style={{ background: "#fff", border: `1px solid ${A.border}`, borderRadius: "10px", padding: "1.25rem 1.5rem", marginBottom: "1.25rem" }}>
        <p style={{ ...s.label, marginBottom: "0.875rem" }}>Nhà cung cấp & Cấu hình</p>
        {settings && (
          <>
            {infoRow("Nhà cung cấp",   settings.providerType === "resend" ? "Resend" : settings.providerType)}
            {infoRow("API Key",         settings.apiKeyConfigured)}
            {infoRow("Tên người gửi",  settings.senderName)}
            {infoRow("Email người gửi",settings.senderEmail)}
            {infoRow("Reply-to",       settings.replyToEmail)}
            {infoRow("URL trang web",  settings.siteUrl)}
          </>
        )}
        <div style={{ marginTop: "1rem", background: A.bg, borderRadius: "7px", padding: "10px 13px" }}>
          <p style={{ fontSize: "12px", color: A.textMuted, margin: "0 0 4px", fontWeight: 600 }}>Cách cấu hình</p>
          <p style={{ fontSize: "12px", color: A.textMuted, margin: 0, lineHeight: 1.65 }}>
            Thiết lập các biến môi trường trong Replit Secrets:
          </p>
          <ul style={{ margin: "6px 0 0", paddingLeft: "18px", fontSize: "12px", color: A.textMuted, lineHeight: 1.75 }}>
            <li><code style={{ fontFamily: "monospace", background: "rgba(0,0,0,0.05)", padding: "1px 5px", borderRadius: "3px" }}>RESEND_API_KEY</code> — API key của Resend.com</li>
            <li><code style={{ fontFamily: "monospace", background: "rgba(0,0,0,0.05)", padding: "1px 5px", borderRadius: "3px" }}>SENDER_NAME</code> — Tên người gửi (mặc định: Phan Văn Thắng)</li>
            <li><code style={{ fontFamily: "monospace", background: "rgba(0,0,0,0.05)", padding: "1px 5px", borderRadius: "3px" }}>SENDER_EMAIL</code> — Email người gửi</li>
            <li><code style={{ fontFamily: "monospace", background: "rgba(0,0,0,0.05)", padding: "1px 5px", borderRadius: "3px" }}>REPLY_TO_EMAIL</code> — Email reply-to</li>
            <li><code style={{ fontFamily: "monospace", background: "rgba(0,0,0,0.05)", padding: "1px 5px", borderRadius: "3px" }}>SITE_URL</code> — URL public của trang web</li>
          </ul>
        </div>
      </div>

      {/* Notification recipients */}
      <div style={{ background: "#fff", border: `1px solid ${A.border}`, borderRadius: "10px", padding: "1.25rem 1.5rem", marginBottom: "1.25rem" }}>
        <p style={{ ...s.label, marginBottom: "0.25rem" }}>Email thông báo admin</p>
        <p style={{ fontSize: "12.5px", color: A.textMuted, margin: "0 0 1.125rem", lineHeight: 1.65 }}>
          Mỗi khi có form mới được gửi từ website, hệ thống sẽ tự động gửi email thông báo đến địa chỉ tương ứng.
          Để trống nếu muốn dùng email chung.
        </p>

        {notifyLoading ? (
          <p style={{ fontSize: "13px", color: A.textMuted }}>Đang tải...</p>
        ) : (
          <>
            {notifyField(
              "notify_email_general",
              "Email chung (mặc định)",
              "Nhận tất cả thông báo nếu loại form không khớp danh mục nào bên dưới.",
            )}
            {notifyField(
              "notify_email_contact",
              "Email form Liên hệ",
              "Nhận thông báo khi có form loại 'Liên hệ / lien-he'.",
            )}
            {notifyField(
              "notify_email_lead",
              "Email form Đăng ký / Newsletter",
              "Nhận thông báo khi có form loại 'Đăng ký email', 'Newsletter', 'Cộng đồng'.",
            )}
            {notifyField(
              "notify_email_product",
              "Email form Sản phẩm / Tư vấn",
              "Nhận thông báo khi có form loại 'Sản phẩm', 'Tư vấn'.",
            )}

            {notifyMsg && (
              <div style={{
                marginTop: "0.75rem", padding: "9px 13px", borderRadius: "7px",
                background: notifyMsg.includes("Đã lưu") ? "rgba(26,120,104,0.07)" : "rgba(193,51,51,0.07)",
                border: notifyMsg.includes("Đã lưu") ? "1px solid rgba(26,120,104,0.22)" : "1px solid rgba(193,51,51,0.22)",
                fontSize: "13px",
                color: notifyMsg.includes("Đã lưu") ? A.primary : A.danger,
              }}>
                {notifyMsg}
              </div>
            )}

            <button
              onClick={saveNotify}
              disabled={notifySaving}
              style={{ ...s.btnPrimary, marginTop: "1rem", fontSize: "12.5px" }}
            >
              {notifySaving ? "Đang lưu..." : "Lưu email thông báo"}
            </button>
          </>
        )}
      </div>

      {/* Test send */}
      <div style={{ background: "#fff", border: `1px solid ${A.border}`, borderRadius: "10px", padding: "1.25rem 1.5rem", marginBottom: "1.25rem" }}>
        <p style={{ ...s.label, marginBottom: "0.875rem" }}>Kiểm tra kết nối — gửi email thử nghiệm</p>
        <div style={{ display: "flex", gap: "0.625rem", alignItems: "center", flexWrap: "wrap" }}>
          <input
            type="email" value={testEmail} onChange={(e) => setTestEmail(e.target.value)}
            placeholder="Nhập email nhận thử..."
            style={{ ...s.field, maxWidth: "260px", height: "36px", padding: "0 11px", fontSize: "13px" }}
          />
          <button
            onClick={sendTest} disabled={testSending || !settings?.apiKeyConfigured}
            title={!settings?.apiKeyConfigured ? "Cần cấu hình RESEND_API_KEY trước" : undefined}
            style={{
              ...s.btnPrimary, fontSize: "12.5px",
              opacity: !settings?.apiKeyConfigured ? 0.5 : 1,
              cursor: !settings?.apiKeyConfigured ? "not-allowed" : "pointer",
            }}
          >
            {testSending ? "Đang gửi..." : "Gửi email thử"}
          </button>
        </div>
        {!settings?.apiKeyConfigured && (
          <p style={{ fontSize: "12px", color: "#ea580c", margin: "8px 0 0" }}>
            Chưa cấu hình RESEND_API_KEY — email sẽ không được gửi thực tế.
          </p>
        )}
        {testMsg && (
          <div style={{
            marginTop: "0.75rem", padding: "9px 13px", borderRadius: "7px",
            background: testMsg.includes("thành công") ? "rgba(26,120,104,0.07)" : "rgba(193,51,51,0.07)",
            border: testMsg.includes("thành công") ? "1px solid rgba(26,120,104,0.22)" : "1px solid rgba(193,51,51,0.22)",
            fontSize: "13px",
            color: testMsg.includes("thành công") ? A.primary : A.danger,
          }}>
            {testMsg}
          </div>
        )}
      </div>

      {/* Email deliverability tips */}
      <div style={{ background: A.bg, border: `1px solid ${A.border}`, borderRadius: "10px", padding: "1.25rem 1.5rem" }}>
        <p style={{ ...s.label, marginBottom: "0.75rem" }}>Ghi chú về khả năng giao email</p>
        <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "12.5px", color: A.textMuted, lineHeight: 1.8 }}>
          <li>Sử dụng tên miền email riêng (ví dụ: thang@phanvanthang.com) thay vì Gmail/Outlook để tăng uy tín.</li>
          <li>Cấu hình SPF, DKIM và DMARC cho tên miền gửi email để tránh bị đánh dấu spam.</li>
          <li>Resend.com yêu cầu xác minh tên miền trước khi gửi email thực tế.</li>
          <li>Tỷ lệ mở email trung bình trong ngành là 20-30%. Dưới 15% cần xem lại subject line.</li>
          <li>Không gửi quá 1-2 email/tuần để tránh hủy đăng ký hàng loạt.</li>
        </ul>
      </div>
    </div>
  );
}
