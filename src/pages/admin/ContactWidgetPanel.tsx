import React, { useEffect, useState, useCallback } from "react";
import { A, s } from "./shared";

/* ── Types ────────────────────────────────────────────────────────── */
interface WidgetSettings {
  id: number;
  isEnabled: boolean;
  widgetTitle: string | null;
  widgetSubtitle: string | null;
  showLabels: boolean;
  showTooltips: boolean;
  desktopOffsetX: number;
  desktopOffsetY: number;
  mobileOffsetX: number;
  mobileOffsetY: number;
  showOnDesktop: boolean;
  showOnMobile: boolean;
}

interface ContactChannel {
  id: number;
  channelType: string;
  label: string;
  value: string;
  iconKey: string | null;
  tooltipText: string | null;
  isEnabled: boolean;
  displayOrder: number;
  openMode: string;
  showOnDesktop: boolean;
  showOnMobile: boolean;
}

const EMPTY_CHANNEL: Omit<ContactChannel, "id" | "isEnabled" | "displayOrder" | "showOnDesktop" | "showOnMobile"> = {
  channelType: "phone",
  label: "",
  value: "",
  iconKey: null,
  tooltipText: null,
  openMode: "tel",
};

const CHANNEL_TYPES = [
  { value: "phone",    label: "Điện thoại",  defaultMode: "tel" },
  { value: "zalo",     label: "Zalo",         defaultMode: "new_tab" },
  { value: "telegram", label: "Telegram",     defaultMode: "new_tab" },
];

const OPEN_MODES = [
  { value: "tel",      label: "Cuộc gọi (tel:)" },
  { value: "new_tab",  label: "Tab mới" },
  { value: "same_tab", label: "Tab hiện tại" },
];

/* ── Helpers ──────────────────────────────────────────────────────── */
function validateChannel(ch: Partial<ContactChannel>): string | null {
  if (!ch.label?.trim()) return "Nhãn hiển thị là bắt buộc";
  if (!ch.value?.trim()) return "Vui lòng nhập giá trị hợp lệ";
  if (ch.openMode === "tel") {
    if (!/^[\d\s+\-().]+$/.test(ch.value)) return "Số điện thoại không hợp lệ";
  } else {
    try { new URL(ch.value); } catch { return "Liên kết không hợp lệ"; }
  }
  return null;
}

/* ── Input component ──────────────────────────────────────────────── */
function Field({ label, children, note }: { label: string; children: React.ReactNode; note?: string }) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <label style={{ display: "block", fontSize: "11px", fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: A.textMuted, marginBottom: "5px" }}>
        {label}
      </label>
      {children}
      {note && <p style={{ fontSize: "11.5px", color: A.textLight, marginTop: "4px" }}>{note}</p>}
    </div>
  );
}

function Input({ value, onChange, type = "text", placeholder }: { value: string | number; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{ ...s.field, width: "100%" }}
    />
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", userSelect: "none" }}>
      <div
        onClick={() => onChange(!checked)}
        style={{
          width: "36px", height: "20px", borderRadius: "999px",
          background: checked ? A.primary : A.border,
          position: "relative", transition: "background 0.2s ease", flexShrink: 0,
          cursor: "pointer",
        }}
      >
        <div style={{
          position: "absolute", top: "2px",
          left: checked ? "18px" : "2px",
          width: "16px", height: "16px", borderRadius: "50%",
          background: "#fff", transition: "left 0.2s ease",
          boxShadow: "0 1px 4px rgba(0,0,0,0.20)",
        }} />
      </div>
      <span style={{ fontSize: "13px", color: A.text }}>{label}</span>
    </label>
  );
}

/* ── Main panel ───────────────────────────────────────────────────── */
export function ContactWidgetPanel({ adminKey }: { adminKey: string }) {
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${adminKey}` };

  const [settings, setSettings]     = useState<WidgetSettings | null>(null);
  const [channels, setChannels]     = useState<ContactChannel[]>([]);
  const [settingsBusy, setSettingsBusy] = useState(false);
  const [settingsMsg,  setSettingsMsg]  = useState("");

  const [showForm,  setShowForm]  = useState(false);
  const [editId,    setEditId]    = useState<number | null>(null);
  const [formData,  setFormData]  = useState<Partial<ContactChannel>>({
    ...EMPTY_CHANNEL, isEnabled: true, displayOrder: 10, showOnDesktop: true, showOnMobile: true,
  });
  const [formError, setFormError] = useState("");
  const [formBusy,  setFormBusy]  = useState(false);

  /* Fetch */
  const load = useCallback(async () => {
    const [ws, chs] = await Promise.all([
      fetch("/api/admin/contact-widget",  { headers }).then((r) => r.json()),
      fetch("/api/admin/contact-channels", { headers }).then((r) => r.json()),
    ]);
    setSettings(ws);
    setChannels(Array.isArray(chs) ? chs : []);
  }, [adminKey]);

  useEffect(() => { load(); }, [load]);

  /* Save settings */
  const saveSettings = async () => {
    if (!settings) return;
    setSettingsBusy(true); setSettingsMsg("");
    try {
      await fetch("/api/admin/contact-widget", {
        method: "PATCH", headers,
        body: JSON.stringify(settings),
      });
      setSettingsMsg("Đã lưu cài đặt.");
    } catch { setSettingsMsg("Lỗi lưu cài đặt."); }
    finally { setSettingsBusy(false); }
  };

  /* Save channel */
  const saveChannel = async () => {
    const err = validateChannel(formData);
    if (err) { setFormError(err); return; }
    setFormBusy(true); setFormError("");
    try {
      if (editId !== null) {
        await fetch(`/api/admin/contact-channels/${editId}`, {
          method: "PATCH", headers, body: JSON.stringify(formData),
        });
      } else {
        await fetch("/api/admin/contact-channels", {
          method: "POST", headers, body: JSON.stringify(formData),
        });
      }
      setShowForm(false); setEditId(null);
      setFormData({ ...EMPTY_CHANNEL, isEnabled: true, displayOrder: 10, showOnDesktop: true, showOnMobile: true });
      await load();
    } catch { setFormError("Lỗi lưu kênh liên hệ."); }
    finally { setFormBusy(false); }
  };

  /* Delete channel */
  const deleteChannel = async (id: number) => {
    if (!confirm("Xóa kênh liên hệ này?")) return;
    await fetch(`/api/admin/contact-channels/${id}`, { method: "DELETE", headers });
    await load();
  };

  /* Toggle channel enabled */
  const toggleChannel = async (ch: ContactChannel) => {
    await fetch(`/api/admin/contact-channels/${ch.id}`, {
      method: "PATCH", headers,
      body: JSON.stringify({ isEnabled: !ch.isEnabled }),
    });
    setChannels((prev) => prev.map((c) => c.id === ch.id ? { ...c, isEnabled: !c.isEnabled } : c));
  };

  /* Edit channel */
  const editChannel = (ch: ContactChannel) => {
    setFormData({ ...ch });
    setEditId(ch.id);
    setShowForm(true);
    setFormError("");
  };

  /* Channel type auto-fill open_mode */
  const handleTypeChange = (type: string) => {
    const def = CHANNEL_TYPES.find((t) => t.value === type);
    setFormData((prev) => ({ ...prev, channelType: type, openMode: def?.defaultMode ?? "new_tab" }));
  };

  if (!settings) {
    return <div style={{ padding: "2rem", color: A.textMuted }}>Đang tải...</div>;
  }

  const upd = (k: keyof WidgetSettings, v: unknown) =>
    setSettings((prev) => prev ? { ...prev, [k]: v } : prev);

  return (
    <div style={{ maxWidth: "860px" }}>

      {/* ── Widget settings ──────────────────────────────────────── */}
      <div style={{ ...s.card, marginBottom: "1.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <div>
            <p style={s.sectionTitle}>Cài đặt liên hệ nổi</p>
            <p style={{ fontSize: "12.5px", color: A.textMuted, margin: 0 }}>Cấu hình widget liên hệ nhanh hiển thị trên website.</p>
          </div>
          <Toggle checked={settings.isEnabled} onChange={(v) => upd("isEnabled", v)} label="Bật widget" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem 2rem" }}>
          <div style={{ gridColumn: "1/-1" }}>
            <Field label="Tiêu đề widget (tuỳ chọn)">
              <Input value={settings.widgetTitle ?? ""} onChange={(v) => upd("widgetTitle", v || null)} placeholder="Liên hệ nhanh" />
            </Field>
          </div>

          <Field label="Khoảng cách phải (desktop)" note={`${settings.desktopOffsetX}px`}>
            <input type="range" min="8" max="80" value={settings.desktopOffsetX}
              onChange={(e) => upd("desktopOffsetX", +e.target.value)} style={{ width: "100%" }} />
          </Field>
          <Field label="Khoảng cách dưới (desktop)" note={`${settings.desktopOffsetY}px`}>
            <input type="range" min="8" max="120" value={settings.desktopOffsetY}
              onChange={(e) => upd("desktopOffsetY", +e.target.value)} style={{ width: "100%" }} />
          </Field>
          <Field label="Khoảng cách phải (mobile)" note={`${settings.mobileOffsetX}px`}>
            <input type="range" min="8" max="60" value={settings.mobileOffsetX}
              onChange={(e) => upd("mobileOffsetX", +e.target.value)} style={{ width: "100%" }} />
          </Field>
          <Field label="Khoảng cách dưới (mobile)" note={`${settings.mobileOffsetY}px`}>
            <input type="range" min="8" max="100" value={settings.mobileOffsetY}
              onChange={(e) => upd("mobileOffsetY", +e.target.value)} style={{ width: "100%" }} />
          </Field>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "1.25rem 2rem", marginBottom: "1.25rem" }}>
          <Toggle checked={settings.showLabels}    onChange={(v) => upd("showLabels", v)}    label="Hiện nhãn kênh" />
          <Toggle checked={settings.showTooltips}  onChange={(v) => upd("showTooltips", v)}  label="Hiện tooltip" />
          <Toggle checked={settings.showOnDesktop} onChange={(v) => upd("showOnDesktop", v)} label="Hiện trên desktop" />
          <Toggle checked={settings.showOnMobile}  onChange={(v) => upd("showOnMobile", v)}  label="Hiện trên mobile" />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <button onClick={saveSettings} disabled={settingsBusy} style={{ ...s.btnPrimary, opacity: settingsBusy ? 0.7 : 1 }}>
            {settingsBusy ? "Đang lưu..." : "Lưu cài đặt"}
          </button>
          {settingsMsg && (
            <span style={{ fontSize: "13px", color: settingsMsg.includes("Lỗi") ? A.danger : A.primary }}>{settingsMsg}</span>
          )}
        </div>
      </div>

      {/* ── Channels ─────────────────────────────────────────────── */}
      <div style={s.card}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
          <div>
            <p style={s.sectionTitle}>Kênh liên hệ</p>
            <p style={{ fontSize: "12.5px", color: A.textMuted, margin: 0 }}>Quản lý các kênh liên hệ hiển thị trên widget.</p>
          </div>
          <button
            onClick={() => { setShowForm(true); setEditId(null); setFormData({ ...EMPTY_CHANNEL, isEnabled: true, displayOrder: channels.length + 1, showOnDesktop: true, showOnMobile: true }); setFormError(""); }}
            style={s.btnPrimary}
          >
            + Thêm kênh mới
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div style={{ background: A.bg, border: `1px solid ${A.border}`, borderRadius: "8px", padding: "1.25rem", marginBottom: "1.25rem" }}>
            <p style={{ fontSize: "13px", fontWeight: 700, color: A.text, marginBottom: "1rem" }}>
              {editId !== null ? "Chỉnh sửa kênh" : "Thêm kênh mới"}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem 1.5rem" }}>
              <Field label="Loại kênh">
                <select value={formData.channelType ?? "phone"} onChange={(e) => handleTypeChange(e.target.value)} style={{ ...s.field, width: "100%" }}>
                  {CHANNEL_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </Field>
              <Field label="Chế độ mở">
                <select value={formData.openMode ?? "tel"} onChange={(e) => setFormData((p) => ({ ...p, openMode: e.target.value }))} style={{ ...s.field, width: "100%" }}>
                  {OPEN_MODES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </Field>
              <Field label="Nhãn hiển thị">
                <Input value={formData.label ?? ""} onChange={(v) => setFormData((p) => ({ ...p, label: v }))} placeholder="Gọi điện" />
              </Field>
              <Field label="Giá trị liên hệ" note={formData.openMode === "tel" ? "Nhập số điện thoại" : "Nhập URL đầy đủ"}>
                <Input value={formData.value ?? ""} onChange={(v) => setFormData((p) => ({ ...p, value: v }))} placeholder={formData.openMode === "tel" ? "0988123456" : "https://zalo.me/..."} />
              </Field>
              <Field label="Tooltip (tuỳ chọn)">
                <Input value={formData.tooltipText ?? ""} onChange={(v) => setFormData((p) => ({ ...p, tooltipText: v || null }))} placeholder="Nhắn tin qua Zalo" />
              </Field>
              <Field label="Thứ tự hiển thị">
                <Input type="number" value={formData.displayOrder ?? 0} onChange={(v) => setFormData((p) => ({ ...p, displayOrder: +v }))} />
              </Field>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem 2rem", margin: "0.75rem 0 1rem" }}>
              <Toggle checked={!!formData.isEnabled}     onChange={(v) => setFormData((p) => ({ ...p, isEnabled: v }))}     label="Bật kênh" />
              <Toggle checked={!!formData.showOnDesktop} onChange={(v) => setFormData((p) => ({ ...p, showOnDesktop: v }))} label="Hiện desktop" />
              <Toggle checked={!!formData.showOnMobile}  onChange={(v) => setFormData((p) => ({ ...p, showOnMobile: v }))}  label="Hiện mobile" />
            </div>
            {formError && <p style={{ fontSize: "12.5px", color: A.danger, marginBottom: "0.75rem" }}>{formError}</p>}
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button onClick={saveChannel} disabled={formBusy} style={{ ...s.btnPrimary, opacity: formBusy ? 0.7 : 1 }}>
                {formBusy ? "Đang lưu..." : "Lưu kênh"}
              </button>
              <button onClick={() => { setShowForm(false); setEditId(null); setFormError(""); }} style={s.btnGhost}>
                Huỷ
              </button>
            </div>
          </div>
        )}

        {/* Channel list */}
        {channels.length === 0 ? (
          <p style={{ fontSize: "13px", color: A.textMuted, textAlign: "center", padding: "2rem 0" }}>Chưa có kênh nào. Thêm kênh đầu tiên.</p>
        ) : (
          <div style={{ border: `1px solid ${A.border}`, borderRadius: "8px", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ background: A.bg }}>
                  {["Thứ tự", "Loại", "Nhãn", "Giá trị", "Desktop", "Mobile", "Bật", ""].map((h) => (
                    <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: A.textLight, borderBottom: `1px solid ${A.border}`, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {channels.map((ch, i) => (
                  <tr key={ch.id} style={{ borderBottom: i < channels.length - 1 ? `1px solid ${A.border}` : "none", background: "#fff" }}>
                    <td style={{ padding: "10px 12px", color: A.textMuted }}>{ch.displayOrder}</td>
                    <td style={{ padding: "10px 12px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "4px", background: A.bg, color: A.text, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        {CHANNEL_TYPES.find((t) => t.value === ch.channelType)?.label ?? ch.channelType}
                      </span>
                    </td>
                    <td style={{ padding: "10px 12px", fontWeight: 500, color: A.text }}>{ch.label}</td>
                    <td style={{ padding: "10px 12px", color: A.textMuted, maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ch.value}</td>
                    <td style={{ padding: "10px 12px" }}>
                      <span style={{ color: ch.showOnDesktop ? A.primary : A.textLight, fontSize: "12px" }}>{ch.showOnDesktop ? "✓" : "—"}</span>
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <span style={{ color: ch.showOnMobile ? A.primary : A.textLight, fontSize: "12px" }}>{ch.showOnMobile ? "✓" : "—"}</span>
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <div onClick={() => toggleChannel(ch)} style={{ cursor: "pointer", display: "inline-block" }}>
                        <div style={{ width: "30px", height: "17px", borderRadius: "999px", background: ch.isEnabled ? A.primary : A.border, position: "relative", transition: "background 0.18s" }}>
                          <div style={{ position: "absolute", top: "2px", left: ch.isEnabled ? "14px" : "2px", width: "13px", height: "13px", borderRadius: "50%", background: "#fff", transition: "left 0.18s", boxShadow: "0 1px 3px rgba(0,0,0,0.18)" }} />
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "10px 12px", whiteSpace: "nowrap" }}>
                      <button onClick={() => editChannel(ch)} style={{ ...s.btnGhost, padding: "4px 10px", fontSize: "12px", marginRight: "6px" }}>Sửa</button>
                      <button onClick={() => deleteChannel(ch.id)} style={{ ...s.btnGhost, padding: "4px 10px", fontSize: "12px", color: A.danger, borderColor: "rgba(193,51,51,0.25)" }}>Xóa</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
