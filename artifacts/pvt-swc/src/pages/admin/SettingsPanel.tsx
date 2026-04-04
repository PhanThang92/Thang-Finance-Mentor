import React, { useEffect, useState } from "react";
import { adminApi } from "@/lib/newsApi";
import { A, s } from "./shared";

const SETTING_GROUPS = [
  {
    key: "website",
    label: "Thông tin website",
    fields: [
      { key: "contact_email",  label: "Email liên hệ",  type: "text" },
      { key: "contact_phone",  label: "Số điện thoại",  type: "text" },
      { key: "footer_tagline", label: "Tagline footer",  type: "textarea" },
    ],
  },
  {
    key: "social",
    label: "Mạng xã hội",
    fields: [
      { key: "social_facebook", label: "Facebook URL",  type: "text" },
      { key: "social_youtube",  label: "YouTube URL",   type: "text" },
      { key: "social_zalo",     label: "Zalo URL / OA", type: "text" },
    ],
  },
  {
    key: "community",
    label: "Cộng đồng",
    fields: [
      { key: "community_cta_title",    label: "CTA Title",    type: "text" },
      { key: "community_cta_subtitle", label: "CTA Subtitle", type: "textarea" },
    ],
  },
];

export function SettingsPanel({ adminKey }: { adminKey: string }) {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [msg, setMsg]           = useState("");

  useEffect(() => {
    adminApi.getSettings(adminKey)
      .then((data) => {
        const coerced: Record<string, string> = {};
        Object.entries(data).forEach(([k, v]) => { coerced[k] = v ?? ""; });
        setSettings(coerced);
      })
      .finally(() => setLoading(false));
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

  return (
    <div>
      <div style={s.sectionHeader}>
        <h2 style={s.sectionTitle}>Cài đặt website</h2>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {msg && <span style={{ fontSize: "12.5px", color: msg.startsWith("Đã") ? A.primary : A.danger }}>{msg}</span>}
          <button style={s.btnPrimary} disabled={saving} onClick={save}>{saving ? "Đang lưu..." : "Lưu tất cả"}</button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {SETTING_GROUPS.map((group) => (
          <div key={group.key} style={s.card}>
            <p style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: A.textMuted, margin: "0 0 1.25rem" }}>
              {group.label}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem" }}>
              {group.fields.map((f) => (
                <div key={f.key}>
                  <label style={s.label}>{f.label}</label>
                  {f.type === "textarea"
                    ? <textarea style={{ ...s.textarea, height: "72px" }} value={settings[f.key] ?? ""} onChange={(e) => set(f.key, e.target.value)} />
                    : <input style={s.field} type="text" value={settings[f.key] ?? ""} onChange={(e) => set(f.key, e.target.value)} />
                  }
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
