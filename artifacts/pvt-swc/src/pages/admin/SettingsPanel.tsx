import React, { useEffect, useState } from "react";
import { adminApi } from "@/lib/newsApi";
import { A, s } from "./shared";

type SettingsTab = "contact" | "social" | "footer" | "seo" | "form";

const TABS: { id: SettingsTab; label: string }[] = [
  { id: "contact", label: "Liên hệ" },
  { id: "social",  label: "Mạng xã hội" },
  { id: "footer",  label: "Footer" },
  { id: "seo",     label: "SEO website" },
  { id: "form",    label: "Form & CTA" },
];

const TAB_FIELDS: Record<SettingsTab, { key: string; label: string; type: string; placeholder?: string }[]> = {
  contact: [
    { key: "contact_email",   label: "Email liên hệ chính",    type: "text",     placeholder: "contact@example.com" },
    { key: "contact_phone",   label: "Số điện thoại",          type: "text",     placeholder: "+84 xxx xxx xxx" },
    { key: "contact_address", label: "Địa chỉ (nếu có)",       type: "text",     placeholder: "TP. Hồ Chí Minh, Việt Nam" },
    { key: "contact_zalo",    label: "Zalo cá nhân",           type: "text",     placeholder: "0xxx..." },
  ],
  social: [
    { key: "social_facebook", label: "Facebook Page / Profile", type: "text", placeholder: "https://facebook.com/..." },
    { key: "social_youtube",  label: "YouTube Channel",        type: "text", placeholder: "https://youtube.com/@..." },
    { key: "social_zalo",     label: "Zalo OA",                type: "text", placeholder: "https://zalo.me/..." },
    { key: "social_tiktok",   label: "TikTok",                 type: "text", placeholder: "https://tiktok.com/@..." },
    { key: "social_linkedin", label: "LinkedIn",               type: "text", placeholder: "https://linkedin.com/in/..." },
  ],
  footer: [
    { key: "footer_tagline",      label: "Tagline footer",          type: "textarea", placeholder: "Xây dựng tài sản dài hạn với tư duy đúng đắn." },
    { key: "footer_company_name", label: "Tên thương hiệu / công ty", type: "text",  placeholder: "Thắng SWC" },
    { key: "footer_copyright",    label: "Dòng copyright",          type: "text",     placeholder: "© 2026 Phan Văn Thắng. All rights reserved." },
    { key: "footer_extra_link_1_label", label: "Link phụ 1 — nhãn", type: "text",   placeholder: "Chính sách bảo mật" },
    { key: "footer_extra_link_1_url",   label: "Link phụ 1 — URL",  type: "text",   placeholder: "/chinh-sach-bao-mat" },
    { key: "footer_extra_link_2_label", label: "Link phụ 2 — nhãn", type: "text",   placeholder: "Điều khoản sử dụng" },
    { key: "footer_extra_link_2_url",   label: "Link phụ 2 — URL",  type: "text",   placeholder: "/dieu-khoan-su-dung" },
  ],
  seo: [
    { key: "site_seo_title",       label: "Site title mặc định",   type: "text",     placeholder: "Phan Văn Thắng SWC — Tư duy tài chính thực chiến" },
    { key: "site_seo_description", label: "Meta description chung", type: "textarea", placeholder: "Chia sẻ kiến thức tài chính, đầu tư và phát triển bản thân..." },
    { key: "site_seo_keywords",    label: "Keywords",               type: "text",     placeholder: "tài chính, đầu tư, tư duy, phát triển bản thân" },
    { key: "site_seo_og_image",    label: "OG Image URL",           type: "text",     placeholder: "https://..." },
    { key: "site_google_analytics", label: "Google Analytics ID",  type: "text",     placeholder: "G-XXXXXXXXXX" },
  ],
  form: [
    { key: "form_cta_title",      label: "Tiêu đề form liên hệ",   type: "text",     placeholder: "Để lại thông tin — tôi sẽ liên hệ bạn" },
    { key: "form_cta_subtitle",   label: "Mô tả dưới tiêu đề",     type: "textarea", placeholder: "Điền thông tin để nhận tư vấn miễn phí..." },
    { key: "form_btn_text",       label: "Text nút gửi",            type: "text",     placeholder: "Gửi thông tin" },
    { key: "form_success_msg",    label: "Thông báo sau khi gửi",   type: "text",     placeholder: "Cảm ơn bạn! Tôi sẽ liên hệ trong 24 giờ." },
    { key: "form_note_text",      label: "Ghi chú nhỏ dưới form",  type: "text",     placeholder: "Miễn phí, không spam, không chia sẻ thông tin." },
  ],
};

function tabBtn(active: boolean): React.CSSProperties {
  return {
    padding: "7px 18px", borderRadius: "7px", border: "none", cursor: "pointer",
    fontSize: "13px", fontWeight: active ? 600 : 400,
    background: active ? "#fff" : "transparent",
    color: active ? A.text : A.textMuted,
    boxShadow: active ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
    transition: "all 0.14s ease",
  };
}

export function SettingsPanel({ adminKey }: { adminKey: string }) {
  const [tab, setTab]           = useState<SettingsTab>("contact");
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [msg, setMsg]           = useState("");

  useEffect(() => {
    adminApi.getSettings(adminKey).then((data) => {
      const coerced: Record<string, string> = {};
      Object.entries(data).forEach(([k, v]) => { coerced[k] = v ?? ""; });
      setSettings(coerced);
    }).finally(() => setLoading(false));
  }, [adminKey]);

  const set = (key: string, value: string) => setSettings((prev) => ({ ...prev, [key]: value }));

  const save = async () => {
    setSaving(true); setMsg("");
    try {
      const updated = await adminApi.updateSettings(adminKey, settings);
      const coerced: Record<string, string> = {};
      Object.entries(updated).forEach(([k, v]) => { coerced[k] = v ?? ""; });
      setSettings(coerced);
      setMsg("Đã lưu cài đặt.");
    } catch (e) { setMsg(String(e)); }
    finally { setSaving(false); }
  };

  if (loading) return <p style={{ fontSize: "13px", color: A.textMuted }}>Đang tải...</p>;

  const fields = TAB_FIELDS[tab];

  return (
    <div>
      <div style={s.sectionHeader}>
        <h2 style={s.sectionTitle}>Cài đặt website</h2>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {msg && <span style={{ fontSize: "12.5px", color: msg.startsWith("Đã") ? A.primary : A.danger }}>{msg}</span>}
          <button style={s.btnPrimary} disabled={saving} onClick={save}>{saving ? "Đang lưu..." : "Lưu tất cả"}</button>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{
        display: "flex", gap: "2px", background: "rgba(0,0,0,0.05)",
        padding: "3px", borderRadius: "9px", marginBottom: "1.5rem",
        width: "fit-content",
      }}>
        {TABS.map(({ id, label }) => (
          <button key={id} style={tabBtn(tab === id)} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>

      {/* Fields */}
      <div style={s.card}>
        <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: A.textMuted, margin: "0 0 1.25rem" }}>
          {TABS.find((t) => t.id === tab)?.label}
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
          {fields.map((f) => (
            <div key={f.key}>
              <label style={s.label}>{f.label}</label>
              {f.type === "textarea" ? (
                <textarea
                  style={{ ...s.textarea, height: "80px" }}
                  value={settings[f.key] ?? ""}
                  placeholder={f.placeholder}
                  onChange={(e) => set(f.key, e.target.value)}
                />
              ) : (
                <input
                  style={s.field}
                  type="text"
                  value={settings[f.key] ?? ""}
                  placeholder={f.placeholder}
                  onChange={(e) => set(f.key, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Menu hint */}
      {tab === "footer" && (
        <div style={{ marginTop: "1rem", padding: "1rem 1.25rem", background: "rgba(26,120,104,0.05)", border: "1px solid rgba(26,120,104,0.15)", borderRadius: "8px" }}>
          <p style={{ fontSize: "12.5px", color: A.primary, margin: "0 0 0.25rem", fontWeight: 600 }}>Menu điều hướng</p>
          <p style={{ fontSize: "12px", color: A.textMuted, margin: 0, lineHeight: 1.65 }}>
            Menu chính hiện được quản lý trong file code <code style={{ background: A.bg, padding: "1px 4px", borderRadius: "4px" }}>Navbar.tsx</code>. 
            Để thay đổi menu, chỉnh sửa trực tiếp trong code hoặc liên hệ dev.
          </p>
        </div>
      )}
    </div>
  );
}
