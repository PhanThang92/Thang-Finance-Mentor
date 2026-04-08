import React, { useState, useEffect } from "react";
import { adminApi } from "@/lib/newsApi";
import { A, s } from "./shared";

/* ─── Types ─────────────────────────────────────────────────────────── */
type ProviderSettings = {
  senderName: string; senderEmail: string; replyToEmail: string;
  siteUrl: string; providerType: string; apiKeyConfigured: boolean;
};

type NotifySettings = {
  notify_email_general: string; notify_email_contact: string;
  notify_email_lead: string;    notify_email_product: string;
};

type ConfirmSettings = {
  confirm_enabled:           string;
  confirm_subject_lead:      string; confirm_body_lead:      string;
  confirm_subject_contact:   string; confirm_body_contact:   string;
  confirm_subject_product:   string; confirm_body_product:   string;
  confirm_subject_community: string; confirm_body_community: string;
};

const DEFAULT_NOTIFY: NotifySettings = {
  notify_email_general: "", notify_email_contact: "",
  notify_email_lead: "",    notify_email_product: "",
};

const DEFAULT_CONFIRM: ConfirmSettings = {
  confirm_enabled:           "false",
  confirm_subject_lead:      "Cảm ơn anh/chị đã đăng ký nhận thông tin từ Phan Văn Thắng SWC",
  confirm_body_lead:
    "Thắng đã ghi nhận thông tin đăng ký của anh/chị. Sắp tới Thắng sẽ gửi những tài liệu nền tảng và cập nhật nội dung mới đến anh/chị — phù hợp với mối quan tâm anh/chị đã chọn.\n\nNếu anh/chị có câu hỏi gì, cứ reply thẳng vào email này nhé.",
  confirm_subject_contact:   "Thắng đã nhận được tin nhắn của anh/chị",
  confirm_body_contact:
    "Cảm ơn anh/chị đã liên hệ. Thắng đã nhận được tin nhắn và sẽ phản hồi trong thời gian sớm nhất, thường trong vòng 1–2 ngày làm việc.\n\nNếu cần trao đổi gấp, anh/chị có thể liên hệ qua Zalo hoặc các kênh trên website.",
  confirm_subject_product:   "Cảm ơn anh/chị đã quan tâm đến chương trình của Phan Văn Thắng SWC",
  confirm_body_product:
    "Thắng đã nhận được thông tin của anh/chị và sẽ liên hệ để trao đổi thêm về chương trình phù hợp trong thời gian sớm nhất.\n\nCảm ơn anh/chị đã tin tưởng — Thắng rất vui được đồng hành.",
  confirm_subject_community: "Chào mừng anh/chị đến với cộng đồng Phan Văn Thắng SWC",
  confirm_body_community:
    "Cảm ơn anh/chị đã muốn tham gia cộng đồng. Thắng đã ghi nhận thông tin và sẽ sớm gửi thêm thông tin về cộng đồng, các buổi sinh hoạt và tài liệu dành cho thành viên.\n\nRất vui được đồng hành cùng anh/chị.",
};

/* ─── Confirm form types ─────────────────────────────────────────────── */
const CONFIRM_TABS: { key: "lead" | "contact" | "product" | "community"; label: string; desc: string }[] = [
  { key: "lead",      label: "Đăng ký / Nhận tin",   desc: "Form đăng ký email, nhận tài liệu, homepage..." },
  { key: "contact",   label: "Liên hệ",               desc: "Form liên hệ chung" },
  { key: "product",   label: "Sản phẩm / Tư vấn",    desc: "Form đăng ký tư vấn, quan tâm sản phẩm" },
  { key: "community", label: "Cộng đồng",             desc: "Form tham gia cộng đồng" },
];

/* ─── Small reusable components ─────────────────────────────────────── */
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: "#fff", border: `1px solid ${A.border}`, borderRadius: "10px", padding: "1.25rem 1.5rem", marginBottom: "1.25rem", ...style }}>
      {children}
    </div>
  );
}

function SectionLabel({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <p style={{ ...s.label, marginBottom: sub ? "3px" : "0" }}>{children}</p>
      {sub && <p style={{ fontSize: "12.5px", color: A.textMuted, margin: 0, lineHeight: 1.6 }}>{sub}</p>}
    </div>
  );
}

function SaveMsg({ msg }: { msg: string }) {
  if (!msg) return null;
  const ok = msg.startsWith("Đã lưu") || msg.startsWith("Cài đặt");
  return (
    <div style={{
      marginTop: "0.75rem", padding: "9px 13px", borderRadius: "7px", fontSize: "13px",
      background: ok ? "rgba(26,120,104,0.07)" : "rgba(193,51,51,0.07)",
      border: `1px solid ${ok ? "rgba(26,120,104,0.22)" : "rgba(193,51,51,0.22)"}`,
      color: ok ? A.primary : A.danger,
    }}>{msg}</div>
  );
}

/* ═══ Main component ═════════════════════════════════════════════════ */
export function EmailSettingsPanel({ adminKey }: { adminKey: string }) {
  /* Provider */
  const [provider,     setProvider]     = useState<ProviderSettings | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [testEmail,    setTestEmail]    = useState("");
  const [testSending,  setTestSending]  = useState(false);
  const [testMsg,      setTestMsg]      = useState("");

  /* Notification recipients */
  const [notify,       setNotify]       = useState<NotifySettings>(DEFAULT_NOTIFY);
  const [notifyLoading,setNotifyLoading]= useState(true);
  const [notifySaving, setNotifySaving] = useState(false);
  const [notifyMsg,    setNotifyMsg]    = useState("");

  /* Confirmation emails */
  const [confirm,      setConfirm]      = useState<ConfirmSettings>(DEFAULT_CONFIRM);
  const [confirmLoading, setConfirmLoading] = useState(true);
  const [confirmSaving,  setConfirmSaving]  = useState(false);
  const [confirmMsg,   setConfirmMsg]   = useState("");
  const [activeTab,    setActiveTab]    = useState<"lead"|"contact"|"product"|"community">("lead");

  /* ── Load all settings ─────────────────────────────────────────── */
  useEffect(() => {
    setLoading(true);
    adminApi.getEmailSettings(adminKey)
      .then(setProvider)
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));

    setNotifyLoading(true);
    setConfirmLoading(true);
    adminApi.getSettings(adminKey)
      .then((all) => {
        setNotify({
          notify_email_general: all["notify_email_general"] ?? "",
          notify_email_contact: all["notify_email_contact"] ?? "",
          notify_email_lead:    all["notify_email_lead"]    ?? "",
          notify_email_product: all["notify_email_product"] ?? "",
        });
        setConfirm({
          confirm_enabled:           all["confirm_enabled"]           ?? DEFAULT_CONFIRM.confirm_enabled,
          confirm_subject_lead:      all["confirm_subject_lead"]      ?? DEFAULT_CONFIRM.confirm_subject_lead,
          confirm_body_lead:         all["confirm_body_lead"]         ?? DEFAULT_CONFIRM.confirm_body_lead,
          confirm_subject_contact:   all["confirm_subject_contact"]   ?? DEFAULT_CONFIRM.confirm_subject_contact,
          confirm_body_contact:      all["confirm_body_contact"]      ?? DEFAULT_CONFIRM.confirm_body_contact,
          confirm_subject_product:   all["confirm_subject_product"]   ?? DEFAULT_CONFIRM.confirm_subject_product,
          confirm_body_product:      all["confirm_body_product"]      ?? DEFAULT_CONFIRM.confirm_body_product,
          confirm_subject_community: all["confirm_subject_community"] ?? DEFAULT_CONFIRM.confirm_subject_community,
          confirm_body_community:    all["confirm_body_community"]    ?? DEFAULT_CONFIRM.confirm_body_community,
        });
      })
      .catch(() => {})
      .finally(() => { setNotifyLoading(false); setConfirmLoading(false); });
  }, [adminKey]);

  /* ── Save handlers ──────────────────────────────────────────────── */
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
    } catch (e) { setNotifyMsg("Lỗi: " + String(e)); }
    finally { setNotifySaving(false); }
  };

  const saveConfirm = async () => {
    setConfirmSaving(true); setConfirmMsg("");
    try {
      await adminApi.updateSettings(adminKey, confirm as Record<string, string>);
      setConfirmMsg("Đã lưu cài đặt email xác nhận.");
    } catch (e) { setConfirmMsg("Lỗi: " + String(e)); }
    finally { setConfirmSaving(false); }
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

  /* ── Provider info row ──────────────────────────────────────────── */
  const InfoRow = ({ label, value }: { label: string; value: string | boolean | null | undefined }) => (
    <div style={{ display: "flex", gap: "12px", padding: "10px 0", borderBottom: `1px solid ${A.border}` }}>
      <span style={{ fontSize: "12px", fontWeight: 600, color: A.textMuted, minWidth: "180px", flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: "13px", color: A.text, fontFamily: typeof value === "string" && value.includes("@") ? "monospace" : undefined }}>
        {typeof value === "boolean"
          ? value ? <span style={{ color: "#16a34a", fontWeight: 600 }}>Đã cấu hình</span>
                  : <span style={{ color: "#ea580c", fontWeight: 600 }}>Chưa cấu hình</span>
          : value || <span style={{ color: A.textLight }}>—</span>}
      </span>
    </div>
  );

  /* ── Notify field ───────────────────────────────────────────────── */
  const notifyField = (key: keyof NotifySettings, label: string, desc: string) => (
    <div style={{ marginBottom: "1rem" }}>
      <label style={s.label}>{label}</label>
      <p style={{ fontSize: "11.5px", color: A.textLight, margin: "0 0 5px", lineHeight: 1.6 }}>{desc}</p>
      <input
        type="email"
        value={notify[key]}
        onChange={(e) => setNotify((p) => ({ ...p, [key]: e.target.value }))}
        placeholder="email@domain.com"
        style={{ ...s.field, fontFamily: "monospace", fontSize: "13px" }}
      />
    </div>
  );

  /* ── Confirm tab content ─────────────────────────────────────────── */
  const subjectKey = `confirm_subject_${activeTab}` as keyof ConfirmSettings;
  const bodyKey    = `confirm_body_${activeTab}`    as keyof ConfirmSettings;
  const isEnabled  = confirm.confirm_enabled === "true";

  if (loading) return <p style={{ color: A.textMuted, fontSize: "13px" }}>Đang tải...</p>;

  return (
    <div style={{ maxWidth: "660px" }}>
      <div style={s.sectionHeader}>
        <div>
          <h2 style={s.sectionTitle}>Cài đặt email</h2>
          <p style={{ fontSize: "13px", color: A.textMuted, margin: "4px 0 0" }}>
            Cấu hình người gửi, email thông báo admin và email xác nhận tự động cho khách.
          </p>
        </div>
      </div>

      {/* ── 1. Provider ─────────────────────────────────────────────── */}
      <Card>
        <SectionLabel sub="Thông tin được đọc từ biến môi trường — chỉ đọc.">Nhà cung cấp & Cấu hình</SectionLabel>
        {provider && (
          <>
            <InfoRow label="Nhà cung cấp"   value={provider.providerType === "resend" ? "Resend" : provider.providerType} />
            <InfoRow label="API Key"         value={provider.apiKeyConfigured} />
            <InfoRow label="Tên người gửi"  value={provider.senderName} />
            <InfoRow label="Email người gửi" value={provider.senderEmail} />
            <InfoRow label="Reply-to"        value={provider.replyToEmail} />
            <InfoRow label="URL trang web"   value={provider.siteUrl} />
          </>
        )}
        <div style={{ marginTop: "1rem", background: A.bg, borderRadius: "7px", padding: "10px 13px" }}>
          <p style={{ fontSize: "12px", color: A.textMuted, margin: "0 0 6px", fontWeight: 600 }}>Biến môi trường cần thiết</p>
          {(["RESEND_API_KEY","SENDER_NAME","SENDER_EMAIL","REPLY_TO_EMAIL","SITE_URL"] as const).map((v) => (
            <p key={v} style={{ margin: "2px 0", fontSize: "12px", color: A.textMuted }}>
              <code style={{ fontFamily: "monospace", background: "rgba(0,0,0,0.05)", padding: "1px 5px", borderRadius: "3px" }}>{v}</code>
            </p>
          ))}
        </div>
      </Card>

      {/* ── 2. Email thông báo admin ─────────────────────────────────── */}
      <Card>
        <SectionLabel sub="Mỗi khi có form mới, hệ thống tự gửi thông báo đến địa chỉ tương ứng. Để trống = dùng email chung.">
          Email thông báo cho Admin
        </SectionLabel>
        {notifyLoading ? (
          <p style={{ fontSize: "13px", color: A.textMuted }}>Đang tải...</p>
        ) : (
          <>
            {notifyField("notify_email_general", "Email chung (mặc định)", "Nhận thông báo nếu loại form không khớp danh mục nào.")}
            {notifyField("notify_email_contact",  "Form Liên hệ",          "Nhận thông báo khi có form liên hệ / lien-he.")}
            {notifyField("notify_email_lead",     "Form Đăng ký / Nhận tin","Nhận thông báo khi có form đăng ký email, newsletter.")}
            {notifyField("notify_email_product",  "Form Sản phẩm / Tư vấn","Nhận thông báo khi có form sản phẩm / tư vấn.")}
            <SaveMsg msg={notifyMsg} />
            <button onClick={saveNotify} disabled={notifySaving} style={{ ...s.btnPrimary, marginTop: "0.875rem", fontSize: "12.5px" }}>
              {notifySaving ? "Đang lưu..." : "Lưu email thông báo"}
            </button>
          </>
        )}
      </Card>

      {/* ── 3. Email xác nhận tự động cho khách ─────────────────────── */}
      <Card>
        <SectionLabel sub="Khi khách đăng ký form có nhập email, hệ thống tự gửi email xác nhận cảm ơn cho họ.">
          Email xác nhận tự động cho khách hàng
        </SectionLabel>

        {confirmLoading ? (
          <p style={{ fontSize: "13px", color: A.textMuted }}>Đang tải...</p>
        ) : (
          <>
            {/* Toggle enable */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1.25rem", padding: "12px 14px", borderRadius: "8px", background: isEnabled ? "rgba(26,120,104,0.06)" : A.bg, border: `1px solid ${isEnabled ? "rgba(26,120,104,0.22)" : A.border}` }}>
              <button
                onClick={() => setConfirm((p) => ({ ...p, confirm_enabled: p.confirm_enabled === "true" ? "false" : "true" }))}
                style={{
                  flexShrink: 0, width: "40px", height: "22px", borderRadius: "11px", border: "none", cursor: "pointer",
                  background: isEnabled ? A.primary : "#d1d5db",
                  position: "relative", transition: "background 0.2s ease",
                }}
                aria-label="Bật/tắt email xác nhận"
              >
                <span style={{
                  position: "absolute", top: "3px", left: isEnabled ? "21px" : "3px",
                  width: "16px", height: "16px", borderRadius: "50%", background: "#fff",
                  transition: "left 0.2s ease", display: "block",
                }} />
              </button>
              <div>
                <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: isEnabled ? A.primary : A.text }}>
                  {isEnabled ? "Đang bật — email xác nhận sẽ được gửi" : "Đang tắt — không gửi email xác nhận"}
                </p>
                <p style={{ margin: "2px 0 0", fontSize: "11.5px", color: A.textMuted }}>
                  Chỉ gửi cho khách hàng có nhập địa chỉ email hợp lệ.
                </p>
              </div>
            </div>

            {/* Form type tabs */}
            <div style={{ borderBottom: `1px solid ${A.border}`, marginBottom: "1.25rem", display: "flex", gap: 0 }}>
              {CONFIRM_TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    padding: "7px 14px", border: "none", cursor: "pointer", fontSize: "12.5px",
                    background: "transparent", fontWeight: activeTab === tab.key ? 600 : 400,
                    color: activeTab === tab.key ? A.primary : A.textMuted,
                    borderBottom: activeTab === tab.key ? `2px solid ${A.primary}` : "2px solid transparent",
                    marginBottom: "-1px", transition: "all 0.15s",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab description */}
            <p style={{ fontSize: "12px", color: A.textLight, margin: "0 0 1rem", lineHeight: 1.6 }}>
              {CONFIRM_TABS.find((t) => t.key === activeTab)?.desc}
            </p>

            {/* Subject */}
            <div style={{ marginBottom: "1rem" }}>
              <label style={s.label}>Tiêu đề email (Subject)</label>
              <input
                type="text"
                value={confirm[subjectKey]}
                onChange={(e) => setConfirm((p) => ({ ...p, [subjectKey]: e.target.value }))}
                placeholder="Tiêu đề email gửi cho khách..."
                style={{ ...s.field, fontSize: "13px" }}
              />
            </div>

            {/* Body */}
            <div style={{ marginBottom: "0.75rem" }}>
              <label style={s.label}>Nội dung email</label>
              <p style={{ fontSize: "11.5px", color: A.textLight, margin: "0 0 5px", lineHeight: 1.6 }}>
                Đoạn văn này sẽ được chèn vào giữa phần chào hỏi và chữ ký. Xuống dòng 2 lần để tạo đoạn mới.
              </p>
              <textarea
                value={confirm[bodyKey]}
                onChange={(e) => setConfirm((p) => ({ ...p, [bodyKey]: e.target.value }))}
                rows={6}
                placeholder="Nội dung nội dung email cảm ơn..."
                style={{ ...s.textarea, fontSize: "13px", lineHeight: 1.75 }}
              />
            </div>

            {/* Preview box */}
            <div style={{ background: A.bg, borderRadius: "7px", padding: "12px 14px", marginBottom: "0.875rem" }}>
              <p style={{ fontSize: "11px", fontWeight: 600, color: A.textMuted, margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Xem trước cấu trúc</p>
              <p style={{ fontSize: "12px", color: A.textMuted, margin: "2px 0", lineHeight: 1.7, fontStyle: "italic" }}>
                Xin chào [Tên khách], → <em style={{ color: A.text }}>{confirm[bodyKey].split("\n")[0].slice(0, 60)}{confirm[bodyKey].split("\n")[0].length > 60 ? "..." : ""}</em> → Trân trọng, Phan Văn Thắng
              </p>
            </div>

            <SaveMsg msg={confirmMsg} />
            <div style={{ display: "flex", gap: "0.625rem", alignItems: "center", marginTop: "0.875rem" }}>
              <button onClick={saveConfirm} disabled={confirmSaving} style={{ ...s.btnPrimary, fontSize: "12.5px" }}>
                {confirmSaving ? "Đang lưu..." : "Lưu cài đặt xác nhận"}
              </button>
              <span style={{ fontSize: "11.5px", color: A.textLight }}>Áp dụng cho tất cả 4 loại form</span>
            </div>
          </>
        )}
      </Card>

      {/* ── 4. Test send ─────────────────────────────────────────────── */}
      <Card>
        <SectionLabel>Kiểm tra kết nối — gửi email thử nghiệm</SectionLabel>
        <div style={{ display: "flex", gap: "0.625rem", alignItems: "center", flexWrap: "wrap" }}>
          <input
            type="email" value={testEmail} onChange={(e) => setTestEmail(e.target.value)}
            placeholder="Nhập email nhận thử..."
            style={{ ...s.field, maxWidth: "260px", height: "36px", padding: "0 11px", fontSize: "13px" }}
          />
          <button
            onClick={sendTest} disabled={testSending || !provider?.apiKeyConfigured}
            title={!provider?.apiKeyConfigured ? "Cần cấu hình RESEND_API_KEY trước" : undefined}
            style={{
              ...s.btnPrimary, fontSize: "12.5px",
              opacity: !provider?.apiKeyConfigured ? 0.5 : 1,
              cursor: !provider?.apiKeyConfigured ? "not-allowed" : "pointer",
            }}
          >
            {testSending ? "Đang gửi..." : "Gửi email thử"}
          </button>
        </div>
        {!provider?.apiKeyConfigured && (
          <p style={{ fontSize: "12px", color: "#ea580c", margin: "8px 0 0" }}>
            Chưa cấu hình RESEND_API_KEY — email sẽ không được gửi thực tế.
          </p>
        )}
        <SaveMsg msg={testMsg} />
      </Card>

      {/* ── 5. Deliverability tips ───────────────────────────────────── */}
      <div style={{ background: A.bg, border: `1px solid ${A.border}`, borderRadius: "10px", padding: "1.25rem 1.5rem" }}>
        <p style={{ ...s.label, marginBottom: "0.75rem" }}>Ghi chú về khả năng giao email</p>
        <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "12.5px", color: A.textMuted, lineHeight: 1.9 }}>
          <li>Sử dụng tên miền email riêng (ví dụ: thang@phanvanthang.com) thay vì Gmail/Outlook.</li>
          <li>Cấu hình SPF, DKIM và DMARC cho tên miền gửi email để tránh bị đánh dấu spam.</li>
          <li>Resend.com yêu cầu xác minh tên miền trước khi gửi email thực tế.</li>
          <li>Email xác nhận nên ngắn gọn, đúng tông — không quảng cáo ngay trong email đầu tiên.</li>
          <li>Không gửi quá 1–2 email/tuần để tránh hủy đăng ký hàng loạt.</li>
        </ul>
      </div>
    </div>
  );
}
