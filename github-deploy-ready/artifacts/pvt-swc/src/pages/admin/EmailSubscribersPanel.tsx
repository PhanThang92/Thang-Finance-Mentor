import React, { useState, useEffect, useCallback } from "react";
import { adminApi, type EmailSubscriber, type SubscriberEnrollment } from "@/lib/newsApi";
import { A, s, fmtDate, fmtDateTime } from "./shared";

/* ─── Constants ─────────────────────────────────────────────────────── */

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  subscribed:   { label: "Đang đăng ký",  color: "#16a34a", bg: "#f0fdf4" },
  unsubscribed: { label: "Đã hủy",        color: "#6b7280", bg: "#f9fafb" },
  bounced:      { label: "Bị trả lại",    color: "#c13333", bg: "#fef2f2" },
  paused:       { label: "Tạm dừng",      color: "#ea580c", bg: "#fff7ed" },
  suppressed:   { label: "Bị chặn",       color: "#4b5563", bg: "#f3f4f6" },
};

const STAGE_OPTIONS = [
  { value: "new_lead",  label: "Lead mới" },
  { value: "nurturing", label: "Đang nuôi dưỡng" },
  { value: "engaged",   label: "Đang tương tác" },
  { value: "hot_lead",  label: "Lead nóng" },
  { value: "customer",  label: "Khách hàng" },
  { value: "inactive",  label: "Không hoạt động" },
];

const INTEREST_OPTIONS = [
  { value: "ky_luat_tai_chinh",    label: "Kỷ luật tài chính" },
  { value: "dau_tu_dai_han",       label: "Đầu tư dài hạn" },
  { value: "swc",                  label: "SWC" },
  { value: "con_duong_1_trieu_do", label: "Con đường 1 triệu đô" },
  { value: "chua_ro",              label: "Chưa rõ" },
];

const COMMON_TAGS = [
  "newsletter", "lead_magnet", "interest_swc", "interest_1trieudo",
  "clicked_content", "clicked_product", "customer",
  "inactive_60d", "stage_new", "stage_nurture", "stage_engaged", "stage_hot",
];

const ENROLL_STATUS_META: Record<string, { label: string; color: string }> = {
  active:    { label: "Đang chạy",   color: "#16a34a" },
  completed: { label: "Hoàn thành",  color: "#1a7868" },
  cancelled: { label: "Đã hủy",      color: "#6b7280" },
  paused:    { label: "Tạm dừng",    color: "#ea580c" },
};

const EVENT_LABELS: Record<string, string> = {
  sent: "Đã gửi", opened: "Đã mở", clicked: "Đã click",
  bounced: "Bị trả lại", unsubscribed: "Hủy đăng ký",
};
const EVENT_COLORS: Record<string, string> = {
  sent: A.textMuted, opened: "#16a34a", clicked: "#1a7868",
  bounced: "#c13333", unsubscribed: "#6b7280",
};

/* ─── Badges ─────────────────────────────────────────────────────────── */
function StatusBadge({ status }: { status: string }) {
  const m = STATUS_META[status] ?? { label: status, color: A.textMuted, bg: A.bg };
  return (
    <span style={{ fontSize: "11px", fontWeight: 600, color: m.color, background: m.bg, padding: "2px 8px", borderRadius: "5px", border: `1px solid ${m.color}22` }}>
      {m.label}
    </span>
  );
}

function StagePill({ stage }: { stage: string | null }) {
  if (!stage) return null;
  const m = STAGE_OPTIONS.find((o) => o.value === stage);
  return (
    <span style={{ fontSize: "11px", color: "#7c3aed", background: "#f5f3ff", padding: "1px 7px", borderRadius: "4px", border: "1px solid #e9d5ff" }}>
      {m?.label ?? stage}
    </span>
  );
}

/* ─── Detail panel ───────────────────────────────────────────────────── */
function SubscriberDetail({
  sub, adminKey, onUpdated, onClose,
}: { sub: EmailSubscriber; adminKey: string; onUpdated: (s: EmailSubscriber) => void; onClose: () => void }) {
  const [statusEdit,    setStatusEdit]    = useState(sub.subscriberStatus);
  const [nameEdit,      setNameEdit]      = useState(sub.fullName ?? "");
  const [firstNameEdit, setFirstNameEdit] = useState(sub.firstName ?? "");
  const [stageEdit,     setStageEdit]     = useState(sub.stage ?? "");
  const [interestEdit,  setInterestEdit]  = useState(sub.interestPrimary ?? "");
  const [tagsEdit,      setTagsEdit]      = useState<string[]>((sub.tags as string[]) ?? []);
  const [saving,        setSaving]        = useState(false);
  const [msg,           setMsg]           = useState("");
  const [activeTab,     setActiveTab]     = useState<"info" | "enrollments" | "activity">("info");
  const [enrollments,   setEnrollments]   = useState<SubscriberEnrollment[]>([]);
  const [activity,      setActivity]      = useState<{ id: number; eventType: string; createdAt: string; seqTitle: string | null }[]>([]);
  const [loadingEnroll, setLoadingEnroll] = useState(false);
  const [loadingAct,    setLoadingAct]    = useState(false);
  const [allSequences,  setAllSequences]  = useState<{ id: number; title: string }[]>([]);
  const [enrollSeqId,   setEnrollSeqId]   = useState("");
  const [enrolling,     setEnrolling]     = useState(false);
  const [enrollMsg,     setEnrollMsg]     = useState("");

  useEffect(() => {
    setStatusEdit(sub.subscriberStatus);
    setNameEdit(sub.fullName ?? "");
    setFirstNameEdit(sub.firstName ?? "");
    setStageEdit(sub.stage ?? "");
    setInterestEdit(sub.interestPrimary ?? "");
    setTagsEdit((sub.tags as string[]) ?? []);
    setMsg("");
  }, [sub.id]);

  useEffect(() => {
    if (activeTab === "enrollments") {
      setLoadingEnroll(true);
      Promise.all([
        adminApi.getSubscriberEnrollments(adminKey, sub.id),
        adminApi.getSequences(adminKey),
      ]).then(([enr, seqs]) => {
        setEnrollments(enr);
        setAllSequences(seqs);
      }).catch(() => {}).finally(() => setLoadingEnroll(false));
    }
    if (activeTab === "activity") {
      setLoadingAct(true);
      adminApi.getSubscriberActivity(adminKey, sub.id)
        .then(setActivity).catch(() => {}).finally(() => setLoadingAct(false));
    }
  }, [activeTab, adminKey, sub.id]);

  const save = async () => {
    setSaving(true); setMsg("");
    try {
      const updated = await adminApi.updateSubscriber(adminKey, sub.id, {
        subscriberStatus: statusEdit,
        fullName: nameEdit,
        firstName: firstNameEdit,
        stage: stageEdit || null,
        interestPrimary: interestEdit || null,
        tags: tagsEdit,
      } as Parameters<typeof adminApi.updateSubscriber>[2]);
      onUpdated(updated);
      setMsg("Đã lưu.");
    } catch (e) { setMsg(String(e)); }
    finally { setSaving(false); }
  };

  const toggleTag = (tag: string) => {
    setTagsEdit((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  };

  const handleEnroll = async () => {
    if (!enrollSeqId) return;
    setEnrolling(true); setEnrollMsg("");
    try {
      await adminApi.enrollSubscriber(adminKey, sub.id, Number(enrollSeqId));
      setEnrollMsg("Đã đăng ký vào chuỗi.");
      const updated = await adminApi.getSubscriberEnrollments(adminKey, sub.id);
      setEnrollments(updated);
      setEnrollSeqId("");
    } catch (e) { setEnrollMsg(String(e)); }
    finally { setEnrolling(false); }
  };

  const tabBtn = (id: "info" | "enrollments" | "activity", label: string) => (
    <button onClick={() => setActiveTab(id)} style={{
      padding: "5px 12px", borderRadius: "6px", border: "none", cursor: "pointer",
      fontSize: "12px", fontWeight: activeTab === id ? 600 : 400,
      background: activeTab === id ? A.primary : "transparent",
      color: activeTab === id ? "#fff" : A.textMuted,
    }}>{label}</button>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "1.125rem 1.375rem 0.875rem", borderBottom: `1px solid ${A.border}`, flexShrink: 0 }}>
        <div>
          <p style={{ fontSize: "15px", fontWeight: 700, color: A.text, margin: "0 0 4px" }}>{sub.fullName || sub.email}</p>
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <StatusBadge status={sub.subscriberStatus} />
            <StagePill stage={sub.stage} />
          </div>
        </div>
        <button onClick={onClose} style={{ width: "28px", height: "28px", borderRadius: "6px", border: "none", background: "rgba(0,0,0,0.05)", cursor: "pointer", color: A.textMuted }}>✕</button>
      </div>

      <div style={{ display: "flex", gap: "4px", padding: "8px 1.375rem", background: A.bg, flexShrink: 0 }}>
        {tabBtn("info", "Thông tin")}
        {tabBtn("enrollments", "Chuỗi")}
        {tabBtn("activity", "Hoạt động")}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "1rem 1.375rem" }}>
        {activeTab === "info" && (
          <>
            <div style={{ marginBottom: "0.875rem" }}>
              <p style={s.label}>Email</p>
              <p style={{ fontSize: "13px", color: A.text, fontFamily: "monospace", background: A.bg, padding: "6px 10px", borderRadius: "6px", margin: 0 }}>{sub.email}</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "0.875rem" }}>
              <div>
                <label style={s.label}>Họ và tên</label>
                <input value={nameEdit} onChange={(e) => setNameEdit(e.target.value)} style={s.field} />
              </div>
              <div>
                <label style={s.label}>Tên (first name)</label>
                <input value={firstNameEdit} onChange={(e) => setFirstNameEdit(e.target.value)} style={s.field} />
              </div>
            </div>
            <div style={{ marginBottom: "0.875rem" }}>
              <label style={s.label}>Trạng thái</label>
              <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                {Object.entries(STATUS_META).map(([val, meta]) => (
                  <button key={val} onClick={() => setStatusEdit(val)} style={{
                    padding: "4px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "12px",
                    border: `1px solid ${statusEdit === val ? meta.color : A.border}`,
                    background: statusEdit === val ? `${meta.color}12` : "#fff",
                    color: statusEdit === val ? meta.color : A.textMuted,
                    fontWeight: statusEdit === val ? 600 : 400,
                  }}>{meta.label}</button>
                ))}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "0.875rem" }}>
              <div>
                <label style={s.label}>Stage</label>
                <select value={stageEdit} onChange={(e) => setStageEdit(e.target.value)} style={s.select}>
                  <option value="">— Chưa xác định —</option>
                  {STAGE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label style={s.label}>Quan tâm chính</label>
                <select value={interestEdit} onChange={(e) => setInterestEdit(e.target.value)} style={s.select}>
                  <option value="">— Chưa xác định —</option>
                  {INTEREST_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label style={s.label}>Tags</label>
              <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", marginTop: "4px" }}>
                {COMMON_TAGS.map((tag) => (
                  <button key={tag} onClick={() => toggleTag(tag)} style={{
                    padding: "3px 8px", borderRadius: "5px", cursor: "pointer", fontSize: "11.5px",
                    border: `1px solid ${tagsEdit.includes(tag) ? A.primary : A.border}`,
                    background: tagsEdit.includes(tag) ? `${A.primary}12` : "#fff",
                    color: tagsEdit.includes(tag) ? A.primary : A.textMuted,
                    fontWeight: tagsEdit.includes(tag) ? 600 : 400,
                  }}>{tag}</button>
                ))}
              </div>
            </div>
            <div style={{ background: A.bg, borderRadius: "7px", padding: "10px 12px", marginBottom: "1rem", fontSize: "12px", color: A.textMuted, lineHeight: "1.7" }}>
              <p style={{ margin: 0 }}>Nguồn: <strong>{sub.sourceType ?? "—"}</strong>{sub.sourcePage ? ` · ${sub.sourcePage}` : ""}</p>
              <p style={{ margin: 0 }}>Đăng ký: {fmtDate(sub.subscribedAt)}</p>
              {sub.lastEmailSentAt && <p style={{ margin: 0 }}>Gửi gần nhất: {fmtDateTime(sub.lastEmailSentAt)}</p>}
              {sub.lastOpenedAt    && <p style={{ margin: 0 }}>Mở gần nhất: {fmtDateTime(sub.lastOpenedAt)}</p>}
              {sub.lastClickedAt  && <p style={{ margin: 0 }}>Click gần nhất: {fmtDateTime(sub.lastClickedAt)}</p>}
            </div>
            {msg && <div style={msg.startsWith("Đã") ? s.success : s.error}>{msg}</div>}
            <button onClick={save} disabled={saving} style={s.btnPrimary}>
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </>
        )}

        {activeTab === "enrollments" && (
          <div>
            <div style={{ background: A.bg, borderRadius: "8px", padding: "12px", marginBottom: "1rem" }}>
              <p style={{ ...s.label, marginBottom: "8px" }}>Đăng ký thủ công vào chuỗi</p>
              <div style={{ display: "flex", gap: "8px" }}>
                <select value={enrollSeqId} onChange={(e) => setEnrollSeqId(e.target.value)} style={{ ...s.select, flex: 1 }}>
                  <option value="">-- Chọn chuỗi --</option>
                  {allSequences.map((sq) => (
                    <option key={sq.id} value={String(sq.id)}>{sq.title}</option>
                  ))}
                </select>
                <button onClick={handleEnroll} disabled={!enrollSeqId || enrolling} style={s.btnPrimary}>
                  {enrolling ? "..." : "Đăng ký"}
                </button>
              </div>
              {enrollMsg && <p style={{ fontSize: "12px", color: enrollMsg.includes("Đã") ? A.primary : A.danger, margin: "6px 0 0" }}>{enrollMsg}</p>}
            </div>
            {loadingEnroll ? (
              <p style={{ color: A.textMuted, fontSize: "13px" }}>Đang tải...</p>
            ) : enrollments.length === 0 ? (
              <p style={{ color: A.textMuted, fontSize: "13px" }}>Chưa đăng ký vào chuỗi nào.</p>
            ) : enrollments.map((en) => {
              const em = ENROLL_STATUS_META[en.status] ?? { label: en.status, color: A.textMuted };
              return (
                <div key={en.enrollmentId} style={{ background: A.bgCard, border: `1px solid ${A.border}`, borderRadius: "7px", padding: "10px 12px", marginBottom: "7px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: A.text, margin: "0 0 2px" }}>{en.seqTitle ?? `Chuỗi #${en.sequenceId}`}</p>
                    <span style={{ fontSize: "11px", fontWeight: 600, color: em.color }}>{em.label}</span>
                  </div>
                  <p style={{ fontSize: "11.5px", color: A.textMuted, margin: 0 }}>
                    Bước {en.currentStep} · Đăng ký {fmtDate(en.enrolledAt)}
                    {en.nextSendAt && en.status === "active" ? ` · Gửi tiếp: ${fmtDateTime(en.nextSendAt)}` : ""}
                    {en.completedAt ? ` · Hoàn thành ${fmtDate(en.completedAt)}` : ""}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "activity" && (
          <div>
            {loadingAct ? (
              <p style={{ color: A.textMuted, fontSize: "13px" }}>Đang tải...</p>
            ) : activity.length === 0 ? (
              <p style={{ color: A.textMuted, fontSize: "13px" }}>Chưa có hoạt động email nào.</p>
            ) : activity.map((ev) => (
              <div key={ev.id} style={{ display: "flex", gap: "10px", alignItems: "flex-start", marginBottom: "8px", paddingBottom: "8px", borderBottom: `1px solid ${A.border}` }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: EVENT_COLORS[ev.eventType] ?? A.textMuted, flexShrink: 0, marginTop: "5px" }} />
                <div>
                  <p style={{ fontSize: "12.5px", fontWeight: 500, color: A.text, margin: "0 0 1px" }}>
                    {EVENT_LABELS[ev.eventType] ?? ev.eventType}
                    {ev.seqTitle && <span style={{ fontWeight: 400, color: A.textMuted }}> · {ev.seqTitle}</span>}
                  </p>
                  <p style={{ fontSize: "11px", color: A.textMuted, margin: 0 }}>{fmtDateTime(ev.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Main panel ─────────────────────────────────────────────────────── */
export function EmailSubscribersPanel({ adminKey }: { adminKey: string }) {
  const [subscribers, setSubscribers] = useState<EmailSubscriber[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");
  const [selected,    setSelected]    = useState<EmailSubscriber | null>(null);
  const [q,           setQ]           = useState("");
  const [statusFilter,setStatusFilter]= useState("all");
  const [stageFilter, setStageFilter] = useState("all");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const subs = await adminApi.getSubscribers(adminKey, {
        q:      q || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        stage:  stageFilter  !== "all" ? stageFilter  : undefined,
      });
      setSubscribers(subs);
    } catch (e) { setError(String(e)); }
    finally { setLoading(false); }
  }, [adminKey, q, statusFilter, stageFilter]);

  useEffect(() => {
    const t = setTimeout(() => void load(), q ? 350 : 0);
    return () => clearTimeout(t);
  }, [load, q]);

  const exportCsv = () => {
    const headers = ["id", "email", "fullName", "stage", "status", "subscribedAt", "sourceType", "tags"];
    const rows = subscribers.map((s) => [
      s.id, s.email, s.fullName ?? "", s.stage ?? "", s.subscriberStatus,
      s.subscribedAt ?? "", s.sourceType ?? "", ((s.tags as string[]) ?? []).join(";"),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }));
    Object.assign(document.createElement("a"), { href: url, download: "subscribers.csv" }).click();
    URL.revokeObjectURL(url);
  };

  const active   = subscribers.filter((s) => s.subscriberStatus === "subscribed").length;
  const unsubbed = subscribers.filter((s) => s.subscriberStatus === "unsubscribed").length;

  return (
    <div style={{ display: "flex", height: "100%", gap: 0 }}>
      {/* List */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "1.25rem 1.375rem 0.875rem", borderBottom: `1px solid ${A.border}`, flexShrink: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.875rem" }}>
            <div>
              <h2 style={s.sectionTitle}>Người đăng ký</h2>
              <p style={{ fontSize: "12px", color: A.textMuted, margin: "3px 0 0" }}>
                {subscribers.length} người · {active} đang đăng ký · {unsubbed} đã hủy
              </p>
            </div>
            <button onClick={exportCsv} style={s.btnSecondary}>Xuất CSV</button>
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm email, tên..." style={{ ...s.field, maxWidth: "200px" }} />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ ...s.select, maxWidth: "150px" }}>
              <option value="all">Tất cả TT</option>
              {Object.entries(STATUS_META).map(([v, m]) => <option key={v} value={v}>{m.label}</option>)}
            </select>
            <select value={stageFilter} onChange={(e) => setStageFilter(e.target.value)} style={{ ...s.select, maxWidth: "160px" }}>
              <option value="all">Tất cả stage</option>
              {STAGE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {error && <div style={{ ...s.error, margin: "1rem" }}>{error}</div>}
          {loading && <p style={{ color: A.textMuted, fontSize: "13px", padding: "1rem" }}>Đang tải...</p>}
          {!loading && subscribers.length === 0 && (
            <div style={{ padding: "3rem", textAlign: "center" }}>
              <p style={{ fontSize: "14px", color: A.textMuted }}>Không tìm thấy người đăng ký nào.</p>
            </div>
          )}
          {!loading && subscribers.length > 0 && (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={s.th}>Email</th>
                  <th style={s.th}>Trạng thái</th>
                  <th style={s.th}>Stage</th>
                  <th style={s.th}>Tags</th>
                  <th style={s.th}>Đăng ký</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((sub) => (
                  <tr key={sub.id} onClick={() => setSelected(sub)} style={{ cursor: "pointer", background: selected?.id === sub.id ? `${A.primary}06` : undefined }}>
                    <td style={s.td}>
                      <p style={{ fontWeight: 500, margin: "0 0 1px", fontSize: "13px" }}>{sub.email}</p>
                      {sub.fullName && <p style={{ margin: 0, fontSize: "11.5px", color: A.textMuted }}>{sub.fullName}</p>}
                    </td>
                    <td style={s.td}><StatusBadge status={sub.subscriberStatus} /></td>
                    <td style={s.td}><StagePill stage={sub.stage} /></td>
                    <td style={s.td}>
                      <div style={{ display: "flex", gap: "3px", flexWrap: "wrap", maxWidth: "160px" }}>
                        {((sub.tags as string[]) ?? []).slice(0, 3).map((tag) => (
                          <span key={tag} style={{ fontSize: "10.5px", color: A.textMuted, background: A.bg, padding: "1px 5px", borderRadius: "3px" }}>{tag}</span>
                        ))}
                        {((sub.tags as string[]) ?? []).length > 3 && (
                          <span style={{ fontSize: "10.5px", color: A.textMuted }}>+{((sub.tags as string[]) ?? []).length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td style={s.td}><span style={{ fontSize: "12px", color: A.textMuted }}>{fmtDate(sub.subscribedAt)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Detail */}
      {selected && (
        <div style={{ width: "400px", flexShrink: 0, borderLeft: `1px solid ${A.border}`, background: A.bgCard, display: "flex", flexDirection: "column" }}>
          <SubscriberDetail
            sub={selected} adminKey={adminKey}
            onUpdated={(updated) => {
              setSelected(updated);
              setSubscribers((prev) => prev.map((s) => s.id === updated.id ? updated : s));
            }}
            onClose={() => setSelected(null)}
          />
        </div>
      )}
    </div>
  );
}
