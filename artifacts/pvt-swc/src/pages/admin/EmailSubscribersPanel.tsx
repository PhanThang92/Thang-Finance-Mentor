import React, { useState, useEffect, useMemo } from "react";
import { adminApi, type EmailSubscriber } from "@/lib/newsApi";
import { A, s, fmtDate, fmtDateTime } from "./shared";

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  subscribed:   { label: "Đang đăng ký", color: "#16a34a", bg: "#f0fdf4" },
  unsubscribed: { label: "Đã hủy",       color: "#6b7280", bg: "#f9fafb" },
  bounced:      { label: "Bị trả lại",   color: "#c13333", bg: "#fef2f2" },
  paused:       { label: "Tạm dừng",     color: "#ea580c", bg: "#fff7ed" },
};

function StatusBadge({ status }: { status: string }) {
  const m = STATUS_META[status] ?? { label: status, color: A.textMuted, bg: A.bg };
  return (
    <span style={{ fontSize: "11px", fontWeight: 600, color: m.color, background: m.bg, padding: "2px 8px", borderRadius: "5px", border: `1px solid ${m.color}22` }}>
      {m.label}
    </span>
  );
}

/* ── Detail panel ──────────────────────────────────────────────────── */
function SubscriberDetail({
  sub, adminKey, onUpdated, onClose,
}: { sub: EmailSubscriber; adminKey: string; onUpdated: (s: EmailSubscriber) => void; onClose: () => void }) {
  const [statusEdit, setStatusEdit] = useState(sub.subscriberStatus);
  const [nameEdit,   setNameEdit]   = useState(sub.fullName ?? "");
  const [saving,     setSaving]     = useState(false);
  const [msg,        setMsg]        = useState("");

  useEffect(() => {
    setStatusEdit(sub.subscriberStatus);
    setNameEdit(sub.fullName ?? "");
    setMsg("");
  }, [sub.id]);

  const save = async () => {
    setSaving(true); setMsg("");
    try {
      const updated = await adminApi.updateSubscriber(adminKey, sub.id, {
        subscriberStatus: statusEdit, fullName: nameEdit,
      });
      onUpdated(updated);
      setMsg("Đã lưu.");
    } catch (e) { setMsg(String(e)); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "1.125rem 1.375rem 1rem", borderBottom: `1px solid ${A.border}`, flexShrink: 0 }}>
        <div>
          <p style={{ fontSize: "15px", fontWeight: 700, color: A.text, margin: "0 0 5px" }}>{sub.fullName || sub.email}</p>
          <StatusBadge status={sub.subscriberStatus} />
        </div>
        <button onClick={onClose} style={{ width: "28px", height: "28px", borderRadius: "6px", border: "none", background: "rgba(0,0,0,0.05)", cursor: "pointer", color: A.textMuted }}>✕</button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "1.125rem 1.375rem" }}>
        <div style={{ marginBottom: "1rem" }}>
          <p style={{ ...s.label }}>Email</p>
          <p style={{ fontSize: "13px", color: A.text, fontFamily: "monospace", background: A.bg, padding: "6px 10px", borderRadius: "6px", margin: 0 }}>{sub.email}</p>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label style={s.label}>Họ và tên</label>
          <input type="text" value={nameEdit} onChange={(e) => setNameEdit(e.target.value)} style={s.field} placeholder="Họ và tên..." />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <p style={{ ...s.label, marginBottom: "8px" }}>Trạng thái</p>
          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
            {Object.entries(STATUS_META).map(([val, meta]) => (
              <button key={val} onClick={() => setStatusEdit(val)} style={{
                padding: "5px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "12px",
                border: `1px solid ${statusEdit === val ? meta.color : A.border}`,
                background: statusEdit === val ? `${meta.color}12` : "#fff",
                color: statusEdit === val ? meta.color : A.textMuted,
                fontWeight: statusEdit === val ? 600 : 400,
              }}>{meta.label}</button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <p style={{ ...s.label }}>Nguồn đăng ký</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {sub.sourcePage && <p style={{ margin: 0, fontSize: "12.5px", color: A.textMuted, fontFamily: "monospace" }}>{sub.sourcePage}</p>}
            {sub.sourceType && <p style={{ margin: 0, fontSize: "12px", color: A.textLight }}>{sub.sourceType}</p>}
            {sub.sourceSection && <p style={{ margin: 0, fontSize: "12px", color: A.textLight }}>{sub.sourceSection}</p>}
          </div>
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <p style={{ ...s.label }}>Thời gian</p>
          <p style={{ margin: "0 0 4px", fontSize: "13px", color: A.text }}>Đăng ký: {fmtDateTime(sub.subscribedAt)}</p>
          {sub.unsubscribedAt && <p style={{ margin: 0, fontSize: "13px", color: A.textMuted }}>Hủy: {fmtDateTime(sub.unsubscribedAt)}</p>}
          {sub.linkedLeadId && <p style={{ margin: "4px 0 0", fontSize: "12px", color: A.primary }}>Liên kết Lead #{sub.linkedLeadId}</p>}
        </div>

        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <button style={s.btnPrimary} disabled={saving} onClick={save}>{saving ? "Đang lưu..." : "Lưu thay đổi"}</button>
          {msg && <span style={{ fontSize: "12.5px", color: msg.startsWith("Đã") ? A.primary : A.danger }}>{msg}</span>}
        </div>
      </div>
    </div>
  );
}

/* ── Main panel ────────────────────────────────────────────────────── */
export function EmailSubscribersPanel({ adminKey }: { adminKey: string }) {
  const [list,     setList]     = useState<EmailSubscriber[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [q,        setQ]        = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<EmailSubscriber | null>(null);
  const [stats,    setStats]    = useState<{ totalSubscribers: number; activeSubscribers: number; recentSubscribers: number } | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [subs, st] = await Promise.all([
        adminApi.getSubscribers(adminKey, { q: q || undefined, status: statusFilter !== "all" ? statusFilter : undefined }),
        adminApi.getEmailStats(adminKey),
      ]);
      setList(subs);
      setStats(st);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, [statusFilter]);

  const filtered = useMemo(() => {
    if (!q.trim()) return list;
    const lq = q.toLowerCase();
    return list.filter((s) => s.email.includes(lq) || (s.fullName ?? "").toLowerCase().includes(lq));
  }, [list, q]);

  const STATUS_TABS = [
    { value: "all",          label: "Tất cả" },
    { value: "subscribed",   label: "Đang đăng ký" },
    { value: "unsubscribed", label: "Đã hủy" },
    { value: "bounced",      label: "Bị trả lại" },
  ];

  return (
    <div style={{ display: "flex", height: "calc(100vh - 52px)", overflow: "hidden" }}>
      {/* List pane */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, borderRight: selected ? `1px solid ${A.border}` : "none" }}>

        {/* Stats */}
        {stats && (
          <div style={{ display: "flex", gap: "1rem", padding: "1.25rem 1.5rem 0" }}>
            {[
              { label: "Tổng cộng",       value: stats.totalSubscribers },
              { label: "Đang đăng ký",    value: stats.activeSubscribers },
              { label: "Trong 30 ngày",   value: stats.recentSubscribers },
            ].map((s) => (
              <div key={s.label} style={{ background: "#fff", border: `1px solid ${A.border}`, borderRadius: "8px", padding: "10px 16px", minWidth: "100px" }}>
                <p style={{ margin: "0 0 2px", fontSize: "20px", fontWeight: 800, color: A.text }}>{s.value}</p>
                <p style={{ margin: 0, fontSize: "11px", color: A.textLight }}>{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Toolbar */}
        <div style={{ padding: "1rem 1.5rem", display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
          <input
            type="search" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && load()}
            placeholder="Tìm theo email, tên..."
            style={{ ...s.field, maxWidth: "240px", height: "34px", padding: "0 10px", fontSize: "13px" }}
          />
          <button onClick={load} style={{ ...s.btnSecondary, fontSize: "12px", height: "34px" }}>Tìm kiếm</button>
          <div style={{ display: "flex", gap: "3px", marginLeft: "auto" }}>
            {STATUS_TABS.map((tab) => (
              <button key={tab.value} onClick={() => setStatusFilter(tab.value)} style={{
                padding: "5px 11px", borderRadius: "6px", fontSize: "12px", cursor: "pointer", border: "1px solid",
                borderColor: statusFilter === tab.value ? A.primary : A.border,
                background: statusFilter === tab.value ? `${A.primary}10` : "#fff",
                color: statusFilter === tab.value ? A.primary : A.textMuted,
                fontWeight: statusFilter === tab.value ? 600 : 400,
              }}>{tab.label}</button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 1.5rem 1.5rem" }}>
          {loading ? (
            <p style={{ fontSize: "13px", color: A.textMuted, padding: "2rem 0" }}>Đang tải...</p>
          ) : filtered.length === 0 ? (
            <p style={{ fontSize: "13px", color: A.textMuted, padding: "2rem 0", fontStyle: "italic" }}>Không có người đăng ký nào.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={s.th}>Họ và tên</th>
                  <th style={s.th}>Email</th>
                  <th style={s.th}>Trạng thái</th>
                  <th style={s.th}>Nguồn</th>
                  <th style={s.th}>Ngày đăng ký</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((sub) => (
                  <tr
                    key={sub.id}
                    onClick={() => setSelected(sub)}
                    style={{ cursor: "pointer", background: selected?.id === sub.id ? `${A.primary}07` : "transparent" }}
                  >
                    <td style={s.td}>{sub.fullName || <span style={{ color: A.textLight, fontStyle: "italic" }}>—</span>}</td>
                    <td style={{ ...s.td, fontFamily: "monospace", fontSize: "12.5px" }}>{sub.email}</td>
                    <td style={s.td}><StatusBadge status={sub.subscriberStatus} /></td>
                    <td style={{ ...s.td, fontSize: "11.5px", color: A.textMuted }}>{sub.sourcePage || sub.sourceType || "—"}</td>
                    <td style={{ ...s.td, fontSize: "12px" }}>{fmtDate(sub.subscribedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Detail pane */}
      {selected && (
        <div style={{ width: "360px", flexShrink: 0, overflowY: "auto", background: "#fff" }}>
          <SubscriberDetail
            sub={selected}
            adminKey={adminKey}
            onUpdated={(updated) => { setList((l) => l.map((x) => x.id === updated.id ? updated : x)); setSelected(updated); }}
            onClose={() => setSelected(null)}
          />
        </div>
      )}
    </div>
  );
}
