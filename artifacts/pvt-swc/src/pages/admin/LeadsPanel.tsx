import React, { useState, useEffect, useCallback, useMemo } from "react";
import { adminApi, type Lead, type LeadNote } from "@/lib/newsApi";
import { A, s, fmtDate, fmtDateTime, LEAD_STATUSES, leadStatusLabel, leadStatusColor } from "./shared";

/* ── Source helpers ──────────────────────────────────────────────── */
const SOURCE_OPTIONS = [
  { value: "all",       label: "Tất cả nguồn" },
  { value: "cong-dong", label: "Cộng đồng" },
  { value: "road-to-1m",label: "Road to $1M" },
  { value: "atlas",     label: "ATLAS" },
  { value: "tin-tuc",   label: "Tin tức" },
  { value: "lien-he",   label: "Liên hệ chung" },
];

const PRODUCT_OPTIONS = [
  { value: "all",       label: "Tất cả sản phẩm" },
  { value: "road-to-1m",label: "Road to $1M / SWC PASS" },
  { value: "atlas",     label: "ATLAS" },
];

function sourceLabel(v: string | null) {
  if (!v) return "—";
  if (v.includes("cong-dong")) return "Cộng đồng";
  if (v.includes("road") || v.includes("1m")) return "Road to $1M";
  if (v.includes("atlas")) return "ATLAS";
  if (v.includes("tin-tuc")) return "Tin tức";
  if (v.includes("hero") || v.includes("lien-he") || v.includes("contact")) return "Liên hệ";
  return v;
}

function matchesSource(lead: Lead, filter: string) {
  if (filter === "all") return true;
  const st = (lead.sourceType ?? "").toLowerCase();
  const sp = (lead.sourcePage ?? "").toLowerCase();
  const pr = (lead.productRef ?? "").toLowerCase();
  if (filter === "cong-dong") return st.includes("cong-dong");
  if (filter === "road-to-1m") return st.includes("road") || sp.includes("road") || pr.includes("road") || pr.includes("swcpass") || pr.includes("swc-pass") || pr.includes("1m");
  if (filter === "atlas") return st.includes("atlas") || sp.includes("atlas") || pr.includes("atlas");
  if (filter === "tin-tuc") return sp.includes("tin-tuc");
  if (filter === "lien-he") return st.includes("hero") || st.includes("lien-he") || st.includes("contact") || (!st && !sp);
  return true;
}

function matchesProduct(lead: Lead, filter: string) {
  if (filter === "all") return true;
  const pr = (lead.productRef ?? "").toLowerCase();
  if (filter === "road-to-1m") return pr.includes("road") || pr.includes("swcpass") || pr.includes("swc-pass") || pr.includes("1m");
  if (filter === "atlas") return pr.includes("atlas");
  return true;
}

function exportCsv(leads: Lead[]) {
  const headers = ["ID", "Họ tên", "Email", "Điện thoại", "Nguồn", "Trang nguồn", "Sản phẩm", "Lời nhắn", "Trạng thái", "Ghi chú", "Ngày gửi"];
  const rows = leads.map((l) => [
    l.id,
    `"${l.name}"`,
    l.email ?? "",
    l.phone ?? "",
    l.sourceType ?? "",
    l.sourcePage ?? "",
    l.productRef ?? "",
    `"${(l.message ?? "").replace(/"/g, "''")}"`,
    leadStatusLabel(l.status),
    `"${(l.notes ?? "").replace(/"/g, "''")}"`,
    new Date(l.createdAt).toLocaleString("vi-VN"),
  ]);
  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ── Lead row ────────────────────────────────────────────────────── */
function LeadRow({
  lead, isSelected, isLast, savingStatus,
  onSelect, onQuickStatus, onDelete,
}: {
  lead: Lead; isSelected: boolean; isLast: boolean; savingStatus: boolean;
  onSelect: () => void; onQuickStatus: (s: string) => void; onDelete: () => void;
}) {
  const [hov, setHov] = useState(false);
  const isNew = lead.status === "moi";
  const rowBg = isSelected ? `${A.primary}07` : hov ? "rgba(0,0,0,0.016)" : "#fff";

  return (
    <tr
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={onSelect}
      style={{
        background: rowBg,
        borderBottom: isLast ? "none" : `1px solid rgba(0,0,0,0.04)`,
        cursor: "pointer",
        transition: "background 0.1s ease",
        borderLeft: isNew ? "3px solid #2563eb" : isSelected ? `3px solid ${A.primary}` : "3px solid transparent",
      }}
    >
      {/* Họ tên */}
      <td style={{ ...s.td, paddingLeft: "10px", maxWidth: "170px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
          <div style={{
            width: "30px", height: "30px", borderRadius: "50%", flexShrink: 0,
            background: `linear-gradient(135deg, ${leadStatusColor(lead.status)}25, ${leadStatusColor(lead.status)}10)`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: leadStatusColor(lead.status) }}>
              {lead.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{
              margin: "0 0 2px", fontWeight: 600, fontSize: "13px", color: A.text,
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "120px",
            }}>
              {lead.name}
            </p>
            {isNew && (
              <span style={{
                fontSize: "9px", fontWeight: 700, letterSpacing: "0.07em",
                background: "#2563eb", color: "#fff", padding: "1px 5px", borderRadius: "3px",
              }}>
                MỚI
              </span>
            )}
          </div>
        </div>
      </td>

      {/* Liên hệ */}
      <td style={{ ...s.td, maxWidth: "160px" }}>
        {lead.phone && (
          <p style={{ margin: "0 0 2px", fontSize: "12.5px", fontFamily: "monospace", color: A.text }}>
            {lead.phone}
          </p>
        )}
        {lead.email && (
          <p style={{
            margin: 0, fontSize: "11.5px", color: A.textMuted,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "150px",
          }}>
            {lead.email}
          </p>
        )}
        {!lead.phone && !lead.email && (
          <span style={{ fontSize: "12px", color: A.textLight }}>—</span>
        )}
      </td>

      {/* Nguồn */}
      <td style={{ ...s.td, width: "110px" }}>
        <span style={{ fontSize: "12px", color: A.textMuted }}>{sourceLabel(lead.sourceType)}</span>
      </td>

      {/* Sản phẩm */}
      <td style={{ ...s.td, width: "130px" }}>
        {lead.productRef ? (
          <span style={{
            fontSize: "11.5px", fontWeight: 500, color: A.primary,
            background: `${A.primary}10`, padding: "2px 7px", borderRadius: "4px",
            display: "inline-block", maxWidth: "120px",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>
            {lead.productRef}
          </span>
        ) : (
          <span style={{ fontSize: "12px", color: A.textLight }}>—</span>
        )}
      </td>

      {/* Mối quan tâm */}
      <td style={{ ...s.td, maxWidth: "160px" }}>
        <p style={{
          margin: 0, fontSize: "12px", color: A.textMuted, lineHeight: 1.4,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {lead.message ? lead.message.slice(0, 55) + (lead.message.length > 55 ? "…" : "") : "—"}
        </p>
      </td>

      {/* Trạng thái */}
      <td style={{ ...s.td, width: "145px" }} onClick={(e) => e.stopPropagation()}>
        <select
          value={lead.status}
          disabled={savingStatus}
          onChange={(e) => { e.stopPropagation(); onQuickStatus(e.target.value); }}
          style={{
            fontSize: "12px", padding: "4px 8px", borderRadius: "5px", cursor: "pointer",
            border: `1px solid ${leadStatusColor(lead.status)}45`,
            background: `${leadStatusColor(lead.status)}11`,
            color: leadStatusColor(lead.status),
            fontWeight: 500, outline: "none",
          }}
        >
          {LEAD_STATUSES.map((st) => (
            <option key={st.value} value={st.value}>{st.label}</option>
          ))}
        </select>
        {savingStatus && (
          <span style={{ fontSize: "10px", color: A.textLight, marginLeft: "5px" }}>...</span>
        )}
      </td>

      {/* Ngày gửi */}
      <td style={{ ...s.td, width: "95px" }}>
        <span style={{ fontSize: "11.5px", color: A.textMuted }}>{fmtDate(lead.createdAt)}</span>
      </td>

      {/* Hành động */}
      <td style={{ ...s.td, width: "70px" }} onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onDelete}
          title="Xoá lead này"
          style={{
            padding: "4px 9px", borderRadius: "5px", border: "1px solid rgba(193,51,51,0.22)",
            cursor: "pointer", fontSize: "11px", color: A.danger, background: "transparent",
          }}
        >
          Xoá
        </button>
      </td>
    </tr>
  );
}

/* ── Empty state ─────────────────────────────────────────────────── */
function EmptyState({ hasLeads }: { hasLeads: boolean }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: "5rem 2rem", textAlign: "center",
    }}>
      <div style={{
        width: "52px", height: "52px", borderRadius: "50%",
        background: "rgba(0,0,0,0.045)", display: "flex", alignItems: "center",
        justifyContent: "center", marginBottom: "1.25rem",
      }}>
        <span style={{ fontSize: "22px", opacity: 0.25 }}>◉</span>
      </div>
      {hasLeads ? (
        <>
          <p style={{ fontSize: "14px", fontWeight: 600, color: A.text, margin: "0 0 6px" }}>
            Không tìm thấy leads nào
          </p>
          <p style={{ fontSize: "13px", color: A.textMuted, margin: 0 }}>
            Thử thay đổi bộ lọc hoặc từ khoá tìm kiếm.
          </p>
        </>
      ) : (
        <>
          <p style={{ fontSize: "14px", fontWeight: 600, color: A.text, margin: "0 0 8px" }}>
            Chưa có leads nào
          </p>
          <p style={{ fontSize: "13px", color: A.textMuted, margin: "0 0 6px", maxWidth: "340px", lineHeight: 1.6 }}>
            Khi khách hàng điền thông tin trên website, dữ liệu sẽ tự động xuất hiện tại đây.
          </p>
          <p style={{ fontSize: "12px", color: A.textLight, margin: 0 }}>
            Form xuất hiện ở trang Cộng đồng, trang Sản phẩm và trang chủ.
          </p>
        </>
      )}
    </div>
  );
}

const NOTE_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  internal: { label: "Nội bộ",  color: A.textMuted },
  call:     { label: "Gọi điện", color: "#7c3aed" },
  email:    { label: "Email",    color: "#0284c7" },
  meeting:  { label: "Gặp mặt", color: "#15803d" },
};

function NoteItem({ note, onDelete }: { note: LeadNote; onDelete: () => void }) {
  const meta = NOTE_TYPE_LABELS[note.noteType ?? "internal"] ?? NOTE_TYPE_LABELS.internal;
  return (
    <div style={{
      padding: "9px 11px", borderRadius: "7px", border: `1px solid ${A.border}`,
      background: "#fff", display: "flex", gap: "0.5rem",
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", gap: "6px", alignItems: "center", marginBottom: "4px" }}>
          <span style={{ fontSize: "10px", fontWeight: 700, color: meta.color, letterSpacing: "0.06em" }}>{meta.label}</span>
          <span style={{ fontSize: "10.5px", color: A.textLight }}>{fmtDateTime(note.createdAt)}</span>
        </div>
        <p style={{ margin: 0, fontSize: "13px", color: A.text, lineHeight: 1.55 }}>{note.note}</p>
      </div>
      <button
        onClick={onDelete}
        style={{ flexShrink: 0, padding: "2px 7px", borderRadius: "5px", border: "1px solid rgba(193,51,51,0.22)", cursor: "pointer", fontSize: "11px", color: A.danger, background: "transparent" }}
      >
        Xoá
      </button>
    </div>
  );
}

/* ── Lead detail panel ───────────────────────────────────────────── */
function LeadDetail({
  lead, adminKey, onUpdated, onClose,
}: {
  lead: Lead; adminKey: string; onUpdated: (l: Lead) => void; onClose: () => void;
}) {
  const [notesEdit, setNotesEdit]       = useState(lead.notes ?? "");
  const [statusEdit, setStatusEdit]     = useState(lead.status);
  const [interestEdit, setInterestEdit] = useState(lead.interestTopic ?? "");
  const [followUpAt, setFollowUpAt]     = useState(lead.nextFollowUpAt ? lead.nextFollowUpAt.slice(0, 10) : "");
  const [saving, setSaving]             = useState(false);
  const [msg, setMsg]                   = useState("");

  const [notesList, setNotesList]       = useState<LeadNote[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [newNote, setNewNote]           = useState("");
  const [newNoteType, setNewNoteType]   = useState("internal");
  const [addingNote, setAddingNote]     = useState(false);

  useEffect(() => {
    setNotesEdit(lead.notes ?? "");
    setStatusEdit(lead.status);
    setInterestEdit(lead.interestTopic ?? "");
    setFollowUpAt(lead.nextFollowUpAt ? lead.nextFollowUpAt.slice(0, 10) : "");
    setMsg(""); setNewNote("");
    setNotesLoading(true);
    adminApi.getLeadNotes(adminKey, lead.id)
      .then(setNotesList).catch(console.error).finally(() => setNotesLoading(false));
  }, [lead.id, adminKey]);

  const save = async () => {
    setSaving(true); setMsg("");
    try {
      const updated = await adminApi.updateLead(adminKey, lead.id, {
        status: statusEdit, notes: notesEdit,
        interestTopic: interestEdit || null,
        nextFollowUpAt: followUpAt ? new Date(followUpAt).toISOString() : null,
      });
      onUpdated(updated);
      setMsg("Đã lưu.");
    } catch (e) { setMsg(String(e)); }
    finally { setSaving(false); }
  };

  const markContacted = async () => {
    try {
      const updated = await adminApi.updateLead(adminKey, lead.id, {
        status: "da-lien-he", lastContactedAt: new Date().toISOString(),
      });
      onUpdated(updated); setStatusEdit("da-lien-he");
      setMsg("Đã đánh dấu liên hệ.");
    } catch (e) { setMsg(String(e)); }
  };

  const addNote = async () => {
    if (!newNote.trim()) return;
    setAddingNote(true);
    try {
      const created = await adminApi.addLeadNote(adminKey, lead.id, newNote, newNoteType);
      setNotesList((prev) => [created, ...prev]);
      setNewNote("");
      if (newNoteType !== "internal") {
        const updated = await adminApi.updateLead(adminKey, lead.id, { lastContactedAt: new Date().toISOString() });
        onUpdated(updated);
      }
    } catch (e) { setMsg(String(e)); }
    finally { setAddingNote(false); }
  };

  const deleteNote = async (noteId: number) => {
    if (!confirm("Xoá ghi chú này?")) return;
    try {
      await adminApi.deleteLeadNote(adminKey, noteId);
      setNotesList((prev) => prev.filter((n) => n.id !== noteId));
    } catch (e) { alert(String(e)); }
  };

  const statusChanged = statusEdit !== lead.status;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>

      {/* Panel header */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        padding: "1.125rem 1.375rem 1rem", borderBottom: `1px solid ${A.border}`,
        flexShrink: 0,
      }}>
        <div>
          <p style={{ fontSize: "15.5px", fontWeight: 700, color: A.text, margin: "0 0 5px" }}>{lead.name}</p>
          <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
            <StatusBadge status={lead.status} />
            {lead.nextFollowUpAt && new Date(lead.nextFollowUpAt) > new Date() && (
              <span style={{ fontSize: "10px", fontWeight: 600, background: "#fff7ed", color: "#ea580c", padding: "2px 7px", borderRadius: "4px", border: "1px solid #fed7aa" }}>
                Theo dõi: {fmtDate(lead.nextFollowUpAt)}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          style={{ width: "28px", height: "28px", borderRadius: "6px", border: "none", background: "rgba(0,0,0,0.05)", cursor: "pointer", fontSize: "14px", color: A.textMuted, display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          ✕
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "1.125rem 1.375rem" }}>

        {/* Contact info */}
        <DetailSection label="Thông tin liên hệ">
          <DetailRow label="Họ tên" value={lead.name} />
          <DetailRow label="Điện thoại" value={lead.phone} mono />
          <DetailRow label="Email" value={lead.email} mono />
        </DetailSection>

        {/* Source */}
        <DetailSection label="Nguồn tiếp cận">
          <DetailRow label="Loại nguồn" value={sourceLabel(lead.sourceType)} />
          <DetailRow label="Trang nguồn" value={lead.sourcePage} mono />
          <DetailRow label="Loại form" value={lead.formType} />
          <DetailRow label="Sản phẩm" value={lead.productRef} highlight />
        </DetailSection>

        {/* Message */}
        {lead.message && (
          <DetailSection label="Lời nhắn">
            <div style={{ fontSize: "13px", color: A.text, background: "rgba(0,0,0,0.025)", padding: "10px 12px", borderRadius: "7px", lineHeight: 1.65, border: `1px solid ${A.border}` }}>
              {lead.message}
            </div>
          </DetailSection>
        )}

        {/* Interest topic (editable) */}
        <DetailSection label="Chủ đề quan tâm">
          <input
            type="text" value={interestEdit}
            onChange={(e) => setInterestEdit(e.target.value)}
            style={{ ...s.field, fontSize: "13px" }}
            placeholder="Ví dụ: đầu tư dài hạn, tài chính cá nhân..."
          />
        </DetailSection>

        {/* Dates & follow-up */}
        <DetailSection label="Thời gian & Theo dõi">
          <DetailRow label="Đăng ký" value={fmtDateTime(lead.createdAt)} />
          {lead.lastContactedAt && <DetailRow label="Liên hệ gần nhất" value={fmtDateTime(lead.lastContactedAt)} />}
          <div>
            <span style={{ fontSize: "11px", color: A.textLight, display: "block", marginBottom: "4px" }}>Theo dõi tiếp theo</span>
            <input
              type="date" value={followUpAt}
              onChange={(e) => setFollowUpAt(e.target.value)}
              style={{ ...s.field, fontSize: "13px", maxWidth: "180px" }}
            />
          </div>
        </DetailSection>

        {/* Status */}
        <DetailSection label="Cập nhật trạng thái">
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
            {LEAD_STATUSES.map((st) => (
              <button key={st.value} onClick={() => setStatusEdit(st.value)} style={{
                padding: "5px 11px", borderRadius: "6px", cursor: "pointer", fontSize: "12px",
                border: `1px solid ${statusEdit === st.value ? leadStatusColor(st.value) : A.border}`,
                background: statusEdit === st.value ? `${leadStatusColor(st.value)}12` : "#fff",
                color: statusEdit === st.value ? leadStatusColor(st.value) : A.textMuted,
                fontWeight: statusEdit === st.value ? 600 : 400, transition: "all 0.12s ease",
              }}>
                {st.label}
              </button>
            ))}
          </div>
          {statusChanged && (
            <p style={{ fontSize: "11.5px", color: A.textMuted, margin: "7px 0 0" }}>
              "{leadStatusLabel(lead.status)}" → "{leadStatusLabel(statusEdit)}" — nhấn Lưu để áp dụng.
            </p>
          )}
        </DetailSection>

        {/* Internal notes (quick field) */}
        <DetailSection label="Ghi chú nhanh">
          <textarea
            value={notesEdit} onChange={(e) => setNotesEdit(e.target.value)}
            style={{ ...s.textarea, height: "65px", fontSize: "13px" }}
            placeholder="Ghi chú riêng, không hiển thị cho khách..."
          />
        </DetailSection>

        {/* Actions + Save */}
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.75rem", flexWrap: "wrap" }}>
          <button style={s.btnPrimary} disabled={saving} onClick={save}>
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
          <button
            onClick={markContacted}
            style={{ ...s.btnSecondary, fontSize: "12px", color: "#7c3aed", borderColor: "#7c3aed44" }}
          >
            Đánh dấu đã liên hệ
          </button>
          {msg && (
            <span style={{ fontSize: "12.5px", color: msg.startsWith("Đã") ? A.primary : A.danger }}>{msg}</span>
          )}
        </div>

        {/* Divider */}
        <div style={{ height: "1px", background: A.border, margin: "0.75rem 0 1.375rem" }} />

        {/* Notes history */}
        <DetailSection label="Ghi chú & Lịch sử liên hệ">
          {/* Add note */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1rem" }}>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
              <select
                value={newNoteType} onChange={(e) => setNewNoteType(e.target.value)}
                style={{ ...s.select, width: "100px", fontSize: "12px", flexShrink: 0 }}
              >
                <option value="internal">Nội bộ</option>
                <option value="call">Gọi điện</option>
                <option value="email">Email</option>
                <option value="meeting">Gặp mặt</option>
              </select>
              <textarea
                value={newNote} onChange={(e) => setNewNote(e.target.value)}
                style={{ ...s.textarea, height: "55px", fontSize: "12.5px", flex: 1, resize: "none" }}
                placeholder="Nội dung ghi chú hoặc cập nhật lịch sử..."
              />
            </div>
            <button
              onClick={addNote} disabled={addingNote || !newNote.trim()}
              style={{ ...s.btnSecondary, alignSelf: "flex-start", fontSize: "12px" }}
            >
              {addingNote ? "Đang thêm..." : "+ Thêm ghi chú"}
            </button>
          </div>

          {/* Notes list */}
          {notesLoading ? (
            <p style={{ fontSize: "12px", color: A.textLight }}>Đang tải...</p>
          ) : notesList.length === 0 ? (
            <p style={{ fontSize: "12px", color: A.textLight, fontStyle: "italic" }}>Chưa có ghi chú nào.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem", paddingBottom: "1rem" }}>
              {notesList.map((n) => <NoteItem key={n.id} note={n} onDelete={() => deleteNote(n.id)} />)}
            </div>
          )}
        </DetailSection>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const color = leadStatusColor(status);
  return (
    <span style={{
      display: "inline-block",
      fontSize: "10px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
      padding: "2px 8px", borderRadius: "4px",
      background: `${color}18`, color,
    }}>
      {leadStatusLabel(status)}
    </span>
  );
}

function DetailSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "1.25rem" }}>
      <p style={{
        fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.12em",
        textTransform: "uppercase", color: A.textLight, margin: "0 0 0.625rem",
      }}>
        {label}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {children}
      </div>
    </div>
  );
}

function DetailRow({ label, value, mono, highlight }: {
  label: string; value?: string | null; mono?: boolean; highlight?: boolean;
}) {
  if (!value) return null;
  return (
    <div style={{ display: "flex", gap: "0.75rem", alignItems: "baseline" }}>
      <span style={{ fontSize: "11px", color: A.textLight, flexShrink: 0, width: "92px" }}>{label}</span>
      <span style={{
        fontSize: "13px",
        color: highlight ? A.primary : A.text,
        fontFamily: mono ? "monospace" : "inherit",
        fontWeight: highlight ? 600 : 400,
        wordBreak: "break-all",
      }}>
        {value}
      </span>
    </div>
  );
}

/* ── Main panel ─────────────────────────────────────────────────── */
export function LeadsPanel({ adminKey }: { adminKey: string }) {
  const [leads, setLeads]         = useState<Lead[]>([]);
  const [loading, setLoading]     = useState(true);
  const [q, setQ]                 = useState("");
  const [fStatus, setFStatus]     = useState("all");
  const [fSource, setFSource]     = useState("all");
  const [fProduct, setFProduct]   = useState("all");
  const [selected, setSelected]   = useState<Lead | null>(null);
  const [savingId, setSavingId]   = useState<number | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    adminApi.getLeads(adminKey)
      .then(setLeads).catch(console.error).finally(() => setLoading(false));
  }, [adminKey]);

  useEffect(() => { load(); }, [load]);

  /* Client-side filtering (source + product) */
  const filtered = useMemo(() => {
    let list = leads;
    if (q.trim()) {
      const lq = q.trim().toLowerCase();
      list = list.filter((l) =>
        l.name.toLowerCase().includes(lq) ||
        (l.email ?? "").toLowerCase().includes(lq) ||
        (l.phone ?? "").includes(lq) ||
        (l.productRef ?? "").toLowerCase().includes(lq)
      );
    }
    if (fStatus !== "all") list = list.filter((l) => l.status === fStatus);
    if (fSource !== "all") list = list.filter((l) => matchesSource(l, fSource));
    if (fProduct !== "all") list = list.filter((l) => matchesProduct(l, fProduct));
    return list;
  }, [leads, q, fStatus, fSource, fProduct]);

  /* Counts per status (from all leads) */
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: leads.length };
    LEAD_STATUSES.forEach((st) => { c[st.value] = leads.filter((l) => l.status === st.value).length; });
    return c;
  }, [leads]);

  const newCount = counts["moi"] ?? 0;

  const onUpdated = (updated: Lead) => {
    setLeads((prev) => prev.map((l) => l.id === updated.id ? updated : l));
    setSelected(updated);
  };

  const quickChangeStatus = async (lead: Lead, newStatus: string) => {
    setSavingId(lead.id);
    try {
      const updated = await adminApi.updateLead(adminKey, lead.id, { status: newStatus });
      onUpdated(updated);
    } catch (e) { alert(String(e)); }
    finally { setSavingId(null); }
  };

  const deleteLead = async (id: number) => {
    if (!confirm("Xoá lead này? Hành động không thể hoàn tác.")) return;
    try {
      await adminApi.deleteLead(adminKey, id);
      setLeads((prev) => prev.filter((l) => l.id !== id));
      if (selected?.id === id) setSelected(null);
    } catch (e) { alert(String(e)); }
  };

  const toggleSelected = (lead: Lead) => {
    setSelected((prev) => prev?.id === lead.id ? null : lead);
  };

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      height: "calc(100vh - 52px - 3.5rem)",
      marginTop: "-1.75rem", marginLeft: "-2rem", marginRight: "-2rem",
      background: A.bg,
    }}>

      {/* ── PAGE HEADER ── */}
      <div style={{ background: "#fff", borderBottom: `1px solid ${A.border}`, flexShrink: 0 }}>
        <div style={{ padding: "1.25rem 2rem 0" }}>

          {/* Title row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                <h2 style={{ fontSize: "17px", fontWeight: 700, color: A.text, margin: 0 }}>Leads</h2>
                {newCount > 0 && (
                  <span style={{
                    fontSize: "11px", fontWeight: 700, background: "#2563eb", color: "#fff",
                    padding: "2px 9px", borderRadius: "999px", letterSpacing: "0.03em",
                  }}>
                    {newCount} mới
                  </span>
                )}
              </div>
              <p style={{ fontSize: "13px", color: A.textMuted, margin: 0 }}>
                Quản lý toàn bộ người để lại thông tin trên website
              </p>
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button style={s.btnSecondary} onClick={load}>Làm mới</button>
              <button
                style={s.btnSecondary}
                onClick={() => exportCsv(filtered)}
                title={`Xuất ${filtered.length} leads ra file CSV`}
              >
                ↓ Xuất dữ liệu
              </button>
            </div>
          </div>

          {/* Status tab strip */}
          <div style={{
            display: "flex", gap: 0, marginLeft: "-2rem", marginRight: "-2rem",
            paddingLeft: "2rem", borderTop: `1px solid ${A.border}`,
            overflowX: "auto",
          }}>
            {[{ value: "all", label: "Tất cả" }, ...LEAD_STATUSES].map((st) => {
              const c = counts[st.value] ?? 0;
              const active = fStatus === st.value;
              return (
                <button
                  key={st.value}
                  onClick={() => setFStatus(st.value)}
                  style={{
                    padding: "9px 16px", border: "none", background: "none", cursor: "pointer",
                    fontSize: "12.5px", fontWeight: active ? 600 : 400,
                    color: active ? A.primary : A.textMuted,
                    borderBottom: active ? `2px solid ${A.primary}` : "2px solid transparent",
                    transition: "all 0.12s ease", whiteSpace: "nowrap", flexShrink: 0,
                  }}
                >
                  {st.label}{" "}
                  <span style={{ fontSize: "11px", color: active ? A.primary : A.textLight, fontWeight: 400 }}>
                    ({c})
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── BODY: Table + Detail pane ── */}
      <div style={{ flex: 1, display: "flex", minHeight: 0 }}>

        {/* TABLE COLUMN */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", background: "#fff" }}>

          {/* Filter bar */}
          <div style={{
            padding: "0.75rem 1.5rem",
            borderBottom: `1px solid ${A.border}`,
            display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center",
          }}>
            <input
              placeholder="Tìm tên, email, số điện thoại..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              style={{ ...s.field, width: "220px", height: "34px" }}
            />
            <select
              value={fSource}
              onChange={(e) => setFSource(e.target.value)}
              style={{ ...s.select, width: "165px", height: "34px" }}
            >
              {SOURCE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <select
              value={fProduct}
              onChange={(e) => setFProduct(e.target.value)}
              style={{ ...s.select, width: "185px", height: "34px" }}
            >
              {PRODUCT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            {/* Clear filters */}
            {(q || fStatus !== "all" || fSource !== "all" || fProduct !== "all") && (
              <button
                style={{ ...s.btnGhost, fontSize: "12px", padding: "5px 11px", color: A.textMuted }}
                onClick={() => { setQ(""); setFStatus("all"); setFSource("all"); setFProduct("all"); }}
              >
                Xoá bộ lọc
              </button>
            )}

            <span style={{ fontSize: "12px", color: A.textLight, marginLeft: "auto" }}>
              {filtered.length === leads.length
                ? `${leads.length} leads`
                : `${filtered.length} / ${leads.length} leads`}
            </span>
          </div>

          {/* Table */}
          <div style={{ flex: 1, overflowY: "auto", overflowX: "auto" }}>
            {loading ? (
              <p style={{ fontSize: "13px", color: A.textMuted, padding: "1.5rem" }}>Đang tải...</p>
            ) : filtered.length === 0 ? (
              <EmptyState hasLeads={leads.length > 0} />
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "760px" }}>
                <thead>
                  <tr style={{ background: "#fafafa", position: "sticky", top: 0, zIndex: 1 }}>
                    <th style={{ ...s.th, paddingLeft: "10px" }}>Họ tên</th>
                    <th style={s.th}>Liên hệ</th>
                    <th style={s.th}>Nguồn</th>
                    <th style={s.th}>Sản phẩm</th>
                    <th style={s.th}>Mối quan tâm</th>
                    <th style={s.th}>Trạng thái</th>
                    <th style={s.th}>Ngày gửi</th>
                    <th style={{ ...s.th, width: "70px" }}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((lead, idx) => (
                    <LeadRow
                      key={lead.id}
                      lead={lead}
                      isSelected={selected?.id === lead.id}
                      isLast={idx === filtered.length - 1}
                      savingStatus={savingId === lead.id}
                      onSelect={() => toggleSelected(lead)}
                      onQuickStatus={(status) => quickChangeStatus(lead, status)}
                      onDelete={() => deleteLead(lead.id)}
                    />
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* DETAIL PANEL */}
        {selected ? (
          <div style={{
            width: "390px", flexShrink: 0,
            borderLeft: `1px solid ${A.border}`,
            background: "#fff",
            display: "flex", flexDirection: "column",
          }}>
            <LeadDetail
              lead={selected}
              adminKey={adminKey}
              onUpdated={onUpdated}
              onClose={() => setSelected(null)}
            />
          </div>
        ) : (
          <div style={{
            width: "320px", flexShrink: 0,
            borderLeft: `1px solid ${A.border}`,
            background: A.bg,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            gap: "0.5rem", color: A.textLight,
          }}>
            <span style={{ fontSize: "28px", opacity: 0.2 }}>◉</span>
            <p style={{ fontSize: "12.5px", margin: 0, textAlign: "center", lineHeight: 1.5 }}>
              Nhấn vào một dòng<br />để xem chi tiết
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
