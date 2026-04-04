import React, { useEffect, useState } from "react";
import { adminApi } from "@/lib/newsApi";
import { A, s } from "./shared";

const FIELDS = [
  {
    group: "Hero section",
    key: "hero",
    fields: [
      { key: "community_hero_title",    label: "Tiêu đề hero",    type: "text",     placeholder: "Tham gia cộng đồng Thắng SWC" },
      { key: "community_hero_subtitle", label: "Mô tả hero",      type: "textarea", placeholder: "Mô tả giá trị khi tham gia cộng đồng..." },
      { key: "community_hero_badge",    label: "Badge / nhãn phụ",type: "text",     placeholder: "Ví dụ: Hơn 5.000 thành viên" },
    ],
  },
  {
    group: "Kênh & liên kết",
    key: "links",
    fields: [
      { key: "community_link_facebook",  label: "Facebook Group",  type: "text", placeholder: "https://facebook.com/groups/..." },
      { key: "community_link_zalo",      label: "Zalo Group",      type: "text", placeholder: "https://zalo.me/g/..." },
      { key: "community_link_youtube",   label: "YouTube Channel", type: "text", placeholder: "https://youtube.com/@..." },
      { key: "community_link_telegram",  label: "Telegram (nếu có)", type: "text", placeholder: "https://t.me/..." },
    ],
  },
  {
    group: "CTA / Form đăng ký",
    key: "cta",
    fields: [
      { key: "community_cta_title",      label: "Tiêu đề CTA",     type: "text",     placeholder: "Bắt đầu hành trình của bạn" },
      { key: "community_cta_subtitle",   label: "Mô tả CTA",       type: "textarea", placeholder: "Điền thông tin để nhận hỗ trợ..." },
      { key: "community_cta_btn_text",   label: "Text nút CTA",    type: "text",     placeholder: "Tham gia ngay" },
      { key: "community_form_enabled",   label: "Hiện form đăng ký (true/false)", type: "text", placeholder: "true" },
      { key: "community_form_note",      label: "Ghi chú dưới form", type: "text",   placeholder: "Miễn phí, không spam." },
    ],
  },
  {
    group: "Lợi ích tham gia",
    key: "benefits",
    fields: [
      { key: "community_benefit_1", label: "Lợi ích 1", type: "text", placeholder: "Tiếp cận kiến thức tài chính thực chiến" },
      { key: "community_benefit_2", label: "Lợi ích 2", type: "text", placeholder: "Cộng đồng hỗ trợ tích cực 24/7" },
      { key: "community_benefit_3", label: "Lợi ích 3", type: "text", placeholder: "Cập nhật nội dung mới hàng tuần" },
      { key: "community_benefit_4", label: "Lợi ích 4", type: "text", placeholder: "Ưu đãi độc quyền cho thành viên" },
    ],
  },
];

export function CommunityPanel({ adminKey }: { adminKey: string }) {
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
      setMsg("Đã lưu cài đặt cộng đồng.");
    } catch (e) { setMsg(String(e)); }
    finally { setSaving(false); }
  };

  if (loading) return <p style={{ fontSize: "13px", color: A.textMuted }}>Đang tải...</p>;

  return (
    <div>
      <div style={s.sectionHeader}>
        <h2 style={s.sectionTitle}>Cộng đồng</h2>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {msg && <span style={{ fontSize: "12.5px", color: msg.startsWith("Đã") ? A.primary : A.danger }}>{msg}</span>}
          <button style={s.btnPrimary} disabled={saving} onClick={save}>{saving ? "Đang lưu..." : "Lưu tất cả"}</button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {FIELDS.map((group) => (
          <div key={group.key} style={s.card}>
            <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: A.textMuted, margin: "0 0 1.25rem" }}>
              {group.group}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem" }}>
              {group.fields.map((f) => (
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
        ))}

        <div style={{ padding: "1rem 1.25rem", background: "rgba(26,120,104,0.05)", border: "1px solid rgba(26,120,104,0.15)", borderRadius: "8px" }}>
          <p style={{ fontSize: "12.5px", color: A.primary, margin: "0 0 0.25rem", fontWeight: 600 }}>Lưu ý</p>
          <p style={{ fontSize: "12px", color: A.textMuted, margin: 0, lineHeight: 1.65 }}>
            Các thay đổi sẽ phản ánh ngay trên trang cộng đồng sau khi nhấn Lưu. Các trường để trống sẽ giữ nguyên giá trị mặc định trong code.
          </p>
        </div>
      </div>
    </div>
  );
}
