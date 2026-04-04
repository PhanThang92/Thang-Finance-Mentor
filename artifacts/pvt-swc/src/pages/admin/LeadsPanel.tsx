import React, { useEffect, useState, useCallback } from "react";
import { adminApi, type Lead } from "@/lib/newsApi";
import { A, s, fmtDateTime, LEAD_STATUSES, leadStatusLabel, leadStatusColor } from "./shared";

/* ── Lead detail view ───────────────────────────────────────────── */
function LeadDetail({
  lead,
  adminKey,
  onUpdated,
  onClose,
}: {
  lead: Lead;
  adminKey: string;
  onUpdated: (l: Lead) => void;
  onClose: () => void;
}) {
  const [notesEdit, setNotesEdit] = useState(lead.notes ?? "");
  const [statusEdit, setStatusEdit] = useState(lead.status);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    setNotesEdit(lead.notes ?? "");
    setStatusEdit(lead.status);
    setMsg("");
  }, [lead.id]);

  const save = async () => {
    setSaving(true); setMsg("");
    try {
      const updated = await adminApi.updateLead(adminKey, lead.id, { status: statusEdit, notes: notesEdit });
      onUpdated(updated);
      setMsg("Đã lưu.");
    } catch (e) { setMsg(String(e)); }
    finally { setSaving(false); }
  };

  const statusChanged = statusEdit !== lead.status;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        padding: "1.25rem 1.5rem 1rem", borderBottom: `1px solid ${A.border}`,
      }}>
        <div>
          <p style={{ fontSize: "16px", fontWeight: 700, color: A.text, margin: "0 0 4px" }}>{lead.name}</p>
          <span style={{
            fontSize: "10px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
            padding: "2px 8px", borderRadius: "4px",
            background: `${leadStatusColor(lead.status)}18`,
            color: leadStatusColor(lead.status),
          }}>
            {leadStatusLabel(lead.status)}
          </span>
        </div>
        <button style={s.btnGhost} onClick={onClose}>✕</button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "1.25rem 1.5rem" }}>

        {/* Contact info */}
        <Section label="Thông tin liên hệ">
          <Row label="Họ tên" value={lead.name} />
          <Row label="Điện thoại" value={lead.phone} mono />
          <Row label="Email" value={lead.email} mono />
        </Section>

        {/* Source info */}
        <Section label="Nguồn">
          <Row label="Loại nguồn" value={lead.sourceType} />
          <Row label="Trang" value={lead.sourcePage} />
          <Row label="Sản phẩm quan tâm" value={lead.productRef} highlight />
        </Section>

        {/* Message */}
        {lead.message && (
          <Section label="Lời nhắn">
            <div style={{
              fontSize: "13px", color: A.text, background: "rgba(0,0,0,0.025)",
              padding: "10px 12px", borderRadius: "7px", lineHeight: 1.65,
              border: `1px solid ${A.border}`,
            }}>
              {lead.message}
            </div>
          </Section>
        )}

        {/* Timeline */}
        <Section label="Lịch sử">
          <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
            <TimelineItem
              date={fmtDateTime(lead.createdAt)}
              label="Lead đăng ký"
              color={A.primary}
            />
            {lead.status !== "moi" && (
              <TimelineItem
                date="—"
                label={`Chuyển sang: ${leadStatusLabel(lead.status)}`}
                color={leadStatusColor(lead.status)}
              />
            )}
          </div>
        </Section>

        {/* Status control */}
        <Section label="Cập nhật trạng thái">
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {LEAD_STATUSES.map((st) => (
              <button
                key={st.value}
                onClick={() => setStatusEdit(st.value)}
                style={{
                  padding: "6px 14px", borderRadius: "7px", border: `1px solid ${statusEdit === st.value ? leadStatusColor(st.value) : A.border}`,
                  cursor: "pointer", fontSize: "12.5px", fontWeight: statusEdit === st.value ? 600 : 400,
                  background: statusEdit === st.value ? `${leadStatusColor(st.value)}12` : "#fff",
                  color: statusEdit === st.value ? leadStatusColor(st.value) : A.textMuted,
                  transition: "all 0.12s ease",
                }}
              >
                {st.label}
              </button>
            ))}
          </div>
          {statusChanged && (
            <p style={{ fontSize: "11.5px", color: A.textMuted, margin: "6px 0 0" }}>
              Đã thay đổi từ "{leadStatusLabel(lead.status)}" → nhấn Lưu để cập nhật.
            </p>
          )}
        </Section>

        {/* Internal notes */}
        <Section label="Ghi chú nội bộ">
          <textarea
            value={notesEdit}
            onChange={(e) => setNotesEdit(e.target.value)}
            style={{ ...s.textarea, height: "100px" }}
            placeholder="Ghi chú nội bộ cho team (không hiển thị cho khách)..."
          />
        </Section>

        {/* Save */}
        <div style={{ display: "flex", gap: "0.625rem", alignItems: "center" }}>
          <button style={s.btnPrimary} disabled={saving} onClick={save}>{saving ? "Đang lưu..." : "Lưu thay đổi"}</button>
          {msg && <span style={{ fontSize: "12.5px", color: msg.startsWith("Đã") ? A.primary : A.danger }}>{msg}</span>}
        </div>
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "1.25rem" }}>
      <p style={{ fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: A.textLight, margin: "0 0 0.625rem" }}>
        {label}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {children}
      </div>
    </div>
  );
}

function Row({ label, value, mono, highlight }: { label: string; value?: string | null; mono?: boolean; highlight?: boolean }) {
  if (!value) return null;
  return (
    <div style={{ display: "flex", gap: "0.75rem", alignItems: "baseline" }}>
      <span style={{ fontSize: "11px", color: A.textLight, flexShrink: 0, width: "96px" }}>{label}</span>
      <span style={{
        fontSize: "13px",
        color: highlight ? A.primary : A.text,
        fontFamily: mono ? "monospace" : "inherit",
        fontWeight: highlight ? 600 : 400,
      }}>
        {value}
      </span>
    </div>
  );
}

function TimelineItem({ date, label, color }: { date: string; label: string; color: string }) {
  return (
    <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
      <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: color, marginTop: "5px", flexShrink: 0 }} />
      <div>
        <p style={{ fontSize: "12.5px", fontWeight: 500, color: A.text, margin: "0 0 1px" }}>{label}</p>
        <p style={{ fontSize: "11px", color: A.textLight, margin: 0 }}>{date}</p>
      </div>
    </div>
  );
}

/* ── Main panel ─────────────────────────────────────────────────── */
export function LeadsPanel({ adminKey }: { adminKey: string }) {
  const [leads, setLeads]       = useState<Lead[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState("all");
  const [q, setQ]               = useState("");
  const [selected, setSelected] = useState<Lead | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    adminApi.getLeads(adminKey, { status: filter === "all" ? undefined : filter, q: q || undefined })
      .then(setLeads).catch(console.error).finally(() => setLoading(false));
  }, [adminKey, filter, q]);

  useEffect(() => { load(); }, [load]);

  const openLead = (l: Lead) => setSelected(l);
  const closeLead = () => setSelected(null);

  const onUpdated = (updated: Lead) => {
    setLeads((prev) => prev.map((l) => l.id === updated.id ? updated : l));
    setSelected(updated);
  };

  const deleteLead = async (id: number) => {
    if (!confirm("Xóa lead này?")) return;
    try {
      await adminApi.deleteLead(adminKey, id);
      setLeads((prev) => prev.filter((l) => l.id !== id));
      if (selected?.id === id) setSelected(null);
    } catch (e) { alert(String(e)); }
  };

  /* Count by status */
  const counts: Record<string, number> = { all: leads.length };
  LEAD_STATUSES.forEach((st) => { counts[st.value] = leads.filter((l) => l.status === st.value).length; });

  return (
    <div style={{ display: "flex", gap: 0, height: "calc(100vh - 52px - 3.5rem)", minHeight: "500px", marginTop: "-1.75rem", marginLeft: "-2rem", marginRight: "-2rem" }}>

      {/* ── Left: list pane ─────────────────────────────────────────── */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", borderRight: `1px solid ${A.border}`, background: "#fff" }}>

        {/* Header */}
        <div style={{ padding: "1.25rem 1.5rem 1rem", borderBottom: `1px solid ${A.border}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.875rem" }}>
            <h2 style={{ ...s.sectionTitle, margin: 0 }}>Leads ({leads.length})</h2>
            <button style={s.btnSecondary} onClick={load}>Làm mới</button>
          </div>
          {/* Filters */}
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <input
              placeholder="Tìm tên, email, số điện thoại..."
              value={q} onChange={(e) => setQ(e.target.value)}
              style={{ ...s.field, width: "210px", height: "33px" }}
            />
            <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ ...s.select, width: "160px", height: "33px" }}>
              <option value="all">Tất cả ({leads.length})</option>
              {LEAD_STATUSES.map((st) => (
                <option key={st.value} value={st.value}>{st.label} ({counts[st.value] ?? 0})</option>
              ))}
            </select>
          </div>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {loading ? (
            <p style={{ fontSize: "13px", color: A.textMuted, padding: "1.25rem 1.5rem" }}>Đang tải...</p>
          ) : leads.length === 0 ? (
            <p style={{ fontSize: "13px", color: A.textLight, padding: "1.25rem 1.5rem" }}>Không có leads nào.</p>
          ) : (
            leads.map((l) => (
              <div
                key={l.id}
                onClick={() => openLead(l)}
                style={{
                  padding: "0.875rem 1.5rem",
                  borderBottom: `1px solid rgba(0,0,0,0.04)`,
                  cursor: "pointer",
                  background: selected?.id === l.id ? `${A.primary}06` : "transparent",
                  borderLeft: selected?.id === l.id ? `3px solid ${A.primary}` : "3px solid transparent",
                  transition: "background 0.1s ease",
                  display: "flex", alignItems: "center", gap: "0.875rem",
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: "36px", height: "36px", borderRadius: "50%",
                  background: `linear-gradient(135deg, ${leadStatusColor(l.status)}30, ${leadStatusColor(l.status)}10)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: leadStatusColor(l.status) }}>
                    {l.name.charAt(0).toUpperCase()}
                  </span>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: A.text, margin: "0 0 3px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{l.name}</p>
                    <span style={{
                      fontSize: "9.5px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", flexShrink: 0,
                      padding: "2px 6px", borderRadius: "4px",
                      background: `${leadStatusColor(l.status)}18`, color: leadStatusColor(l.status),
                    }}>
                      {leadStatusLabel(l.status)}
                    </span>
                  </div>
                  <p style={{ fontSize: "11.5px", color: A.textMuted, margin: 0 }}>
                    {l.phone ?? l.email ?? "—"}
                    {l.productRef && <span style={{ marginLeft: "6px", color: A.textLight }}>· {l.productRef}</span>}
                  </p>
                </div>

                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <p style={{ fontSize: "10.5px", color: A.textLight, margin: "0 0 4px" }}>{fmtDateTime(l.createdAt)}</p>
                  <button
                    style={{ ...s.btnDanger, fontSize: "11px", padding: "2px 8px" }}
                    onClick={(e) => { e.stopPropagation(); deleteLead(l.id); }}
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Right: detail pane ──────────────────────────────────────── */}
      {selected ? (
        <div style={{ width: "380px", flexShrink: 0, display: "flex", flexDirection: "column", background: "#fff" }}>
          <LeadDetail
            lead={selected}
            adminKey={adminKey}
            onUpdated={onUpdated}
            onClose={closeLead}
          />
        </div>
      ) : (
        <div style={{
          width: "380px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
          color: A.textLight, fontSize: "13px", background: A.bg,
          flexDirection: "column", gap: "0.5rem",
        }}>
          <span style={{ fontSize: "24px", opacity: 0.3 }}>◉</span>
          <p style={{ margin: 0 }}>Chọn một lead để xem chi tiết</p>
        </div>
      )}
    </div>
  );
}
