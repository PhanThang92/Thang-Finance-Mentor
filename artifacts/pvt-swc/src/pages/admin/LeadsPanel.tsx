import React, { useEffect, useState, useCallback } from "react";
import { adminApi, type Lead } from "@/lib/newsApi";
import { A, s, fmtDateTime, LEAD_STATUSES, leadStatusLabel, leadStatusColor } from "./shared";

export function LeadsPanel({ adminKey }: { adminKey: string }) {
  const [leads, setLeads]       = useState<Lead[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState("all");
  const [q, setQ]               = useState("");
  const [selected, setSelected] = useState<Lead | null>(null);
  const [notesEdit, setNotesEdit] = useState("");
  const [statusEdit, setStatusEdit] = useState("");
  const [saving, setSaving]     = useState(false);
  const [msg, setMsg]           = useState("");

  const load = useCallback(() => {
    setLoading(true);
    adminApi.getLeads(adminKey, { status: filter === "all" ? undefined : filter, q: q || undefined })
      .then(setLeads).catch(console.error).finally(() => setLoading(false));
  }, [adminKey, filter, q]);

  useEffect(() => { load(); }, [load]);

  const openLead = (l: Lead) => { setSelected(l); setNotesEdit(l.notes ?? ""); setStatusEdit(l.status); setMsg(""); };
  const closeLead = () => setSelected(null);

  const saveLead = async () => {
    if (!selected) return;
    setSaving(true); setMsg("");
    try {
      const updated = await adminApi.updateLead(adminKey, selected.id, { status: statusEdit, notes: notesEdit });
      setLeads((prev) => prev.map((l) => l.id === updated.id ? updated : l));
      setSelected(updated);
      setMsg("Đã lưu.");
    } catch (e) { setMsg(String(e)); }
    finally { setSaving(false); }
  };

  const deleteLead = async (id: number) => {
    if (!confirm("Xóa lead này?")) return;
    try {
      await adminApi.deleteLead(adminKey, id);
      setLeads((prev) => prev.filter((l) => l.id !== id));
      if (selected?.id === id) setSelected(null);
    } catch (e) { alert(String(e)); }
  };

  return (
    <div style={{ display: "flex", gap: "1.25rem", height: "100%" }}>
      {/* Left: list */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={s.sectionHeader}>
          <h2 style={s.sectionTitle}>Leads ({leads.length})</h2>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
          <input
            placeholder="Tìm tên, email, số điện thoại..."
            value={q} onChange={(e) => setQ(e.target.value)}
            style={{ ...s.field, width: "220px", height: "33px" }}
          />
          <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ ...s.select, width: "150px", height: "33px" }}>
            <option value="all">Tất cả trạng thái</option>
            {LEAD_STATUSES.map((st) => <option key={st.value} value={st.value}>{st.label}</option>)}
          </select>
        </div>

        {loading
          ? <p style={{ fontSize: "13px", color: A.textMuted }}>Đang tải...</p>
          : leads.length === 0
          ? <p style={{ fontSize: "13px", color: A.textLight }}>Không có leads nào.</p>
          : (
            <div style={{ ...s.card, padding: 0, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["Họ tên", "Liên hệ", "Nguồn", "Trạng thái", "Ngày", ""].map((h) => (
                      <th key={h} style={s.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leads.map((l) => (
                    <tr key={l.id} style={{ cursor: "pointer", background: selected?.id === l.id ? "rgba(26,120,104,0.04)" : "transparent" }}
                      onClick={() => openLead(l)}>
                      <td style={s.td}>
                        <p style={{ margin: 0, fontWeight: 500 }}>{l.name}</p>
                      </td>
                      <td style={s.td}>
                        <p style={{ margin: 0, fontSize: "12.5px" }}>{l.phone ?? "—"}</p>
                        <p style={{ margin: 0, fontSize: "11.5px", color: A.textMuted }}>{l.email ?? ""}</p>
                      </td>
                      <td style={s.td}>
                        <span style={{ fontSize: "11.5px", color: A.textMuted }}>{l.sourceType ?? "—"}</span>
                      </td>
                      <td style={s.td}>
                        <span style={{ fontSize: "11px", fontWeight: 600, color: leadStatusColor(l.status), background: `${leadStatusColor(l.status)}15`, padding: "2px 8px", borderRadius: "4px" }}>
                          {leadStatusLabel(l.status)}
                        </span>
                      </td>
                      <td style={s.td}>
                        <span style={{ fontSize: "11.5px", color: A.textMuted }}>{fmtDateTime(l.createdAt)}</span>
                      </td>
                      <td style={s.td}>
                        <button style={s.btnDanger} onClick={(e) => { e.stopPropagation(); deleteLead(l.id); }}>Xóa</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
      </div>

      {/* Right: detail drawer */}
      {selected && (
        <div style={{ width: "320px", flexShrink: 0, ...s.card }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <p style={{ fontWeight: 700, fontSize: "14px", margin: 0 }}>{selected.name}</p>
            <button style={s.btnGhost} onClick={closeLead}>✕</button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.25rem" }}>
            <Row label="Email" value={selected.email} />
            <Row label="Điện thoại" value={selected.phone} />
            <Row label="Nguồn" value={selected.sourceType} />
            <Row label="Trang" value={selected.sourcePage} />
            <Row label="Sản phẩm" value={selected.productRef} />
            <Row label="Ngày" value={fmtDateTime(selected.createdAt)} />
            {selected.message && (
              <div>
                <p style={s.label}>Ghi chú khách hàng</p>
                <p style={{ fontSize: "13px", color: A.text, background: "rgba(0,0,0,0.03)", padding: "8px 10px", borderRadius: "6px", margin: 0 }}>{selected.message}</p>
              </div>
            )}
          </div>

          <div style={{ borderTop: `1px solid ${A.border}`, paddingTop: "1rem", display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            <div>
              <label style={s.label}>Trạng thái</label>
              <select value={statusEdit} onChange={(e) => setStatusEdit(e.target.value)} style={s.select}>
                {LEAD_STATUSES.map((st) => <option key={st.value} value={st.value}>{st.label}</option>)}
              </select>
            </div>
            <div>
              <label style={s.label}>Ghi chú nội bộ</label>
              <textarea value={notesEdit} onChange={(e) => setNotesEdit(e.target.value)} style={{ ...s.textarea, height: "80px" }} placeholder="Ghi chú cho team..." />
            </div>
            {msg && <p style={{ fontSize: "12.5px", color: msg.startsWith("Đã") ? A.primary : A.danger, margin: 0 }}>{msg}</p>}
            <button style={s.btnPrimary} disabled={saving} onClick={saveLead}>{saving ? "Đang lưu..." : "Lưu thay đổi"}</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div>
      <p style={{ fontSize: "10.5px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#999", margin: "0 0 2px" }}>{label}</p>
      <p style={{ fontSize: "13px", color: "#1a1a1a", margin: 0 }}>{value}</p>
    </div>
  );
}
