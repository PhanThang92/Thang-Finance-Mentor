import React, { useState, useEffect, useCallback } from "react";
import { adminApi, type EmailSequence, type EmailSequenceStep, type SequenceAnalytics } from "@/lib/newsApi";
import { A, s, fmtDate, fmtDateTime, slugify } from "./shared";

/* ─── Constants ─────────────────────────────────────────────────────── */

const STEP_TYPES: { value: string; label: string; color: string; icon: string }[] = [
  { value: "email",            label: "Gửi email",             color: "#1a7868", icon: "✉" },
  { value: "wait",             label: "Chờ",                   color: "#6b7280", icon: "⏱" },
  { value: "add_tag",          label: "Gắn tag",               color: "#7c3aed", icon: "＋" },
  { value: "remove_tag",       label: "Gỡ tag",                color: "#c13333", icon: "－" },
  { value: "update_field",     label: "Cập nhật trường",       color: "#ea580c", icon: "✎" },
  { value: "end",              label: "Kết thúc chuỗi",        color: "#374151", icon: "■" },
  { value: "move_to_sequence", label: "Chuyển chuỗi khác",     color: "#0ea5e9", icon: "→" },
];

const TRIGGER_TYPES = [
  { value: "on_subscribe",    label: "Khi đăng ký mới" },
  { value: "tag_added",       label: "Khi gắn tag" },
  { value: "form_submitted",  label: "Khi gửi form" },
  { value: "link_clicked",    label: "Khi click link" },
  { value: "manual",          label: "Thủ công" },
  { value: "segment_entered", label: "Khi vào phân khúc" },
];

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  active:   { label: "Đang kích hoạt", color: "#16a34a", bg: "#f0fdf4" },
  paused:   { label: "Tạm dừng",       color: "#ea580c", bg: "#fff7ed" },
  archived: { label: "Đã lưu trữ",     color: "#6b7280", bg: "#f9fafb" },
};

const EXCLUDE_RULE_OPTIONS = [
  { value: "already_customer",  label: "Đã là khách hàng" },
  { value: "already_enrolled",  label: "Đang trong chuỗi này" },
  { value: "already_completed", label: "Đã hoàn thành chuỗi" },
  { value: "unsubscribed",      label: "Đã hủy đăng ký" },
  { value: "bounced",           label: "Email bị trả lại" },
];

const STEP_TYPE_INFO = Object.fromEntries(STEP_TYPES.map((t) => [t.value, t]));

function pct(val: number | null | undefined): string {
  if (val == null) return "—";
  return `${val}%`;
}

/* ─── Badges ────────────────────────────────────────────────────────── */
function SeqStatusBadge({ status }: { status: string }) {
  const m = STATUS_META[status] ?? { label: status, color: A.textMuted, bg: A.bg };
  return (
    <span style={{ fontSize: "11px", fontWeight: 600, color: m.color, background: m.bg, padding: "2px 8px", borderRadius: "5px", border: `1px solid ${m.color}33` }}>
      {m.label}
    </span>
  );
}

function StepTypePill({ type }: { type: string | null }) {
  const m = STEP_TYPE_INFO[type ?? "email"] ?? { label: type ?? "email", color: A.textMuted, icon: "?" };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "11px", fontWeight: 600, color: m.color, background: `${m.color}12`, padding: "2px 8px", borderRadius: "5px", border: `1px solid ${m.color}28` }}>
      <span style={{ fontSize: "10px" }}>{m.icon}</span>{m.label}
    </span>
  );
}

/* ─── Step form ──────────────────────────────────────────────────────── */
function StepForm({
  initial, sequenceId, adminKey, allSequences, onSaved, onCancel,
}: {
  initial?: EmailSequenceStep | null;
  sequenceId: number;
  adminKey: string;
  allSequences: EmailSequence[];
  onSaved: (step: EmailSequenceStep) => void;
  onCancel: () => void;
}) {
  const [stepType,       setStepType]       = useState(initial?.stepType ?? "email");
  const [delayDays,      setDelayDays]      = useState(String(initial?.delayDays ?? 0));
  const [subject,        setSubject]        = useState(initial?.subject ?? "");
  const [previewText,    setPreviewText]    = useState(initial?.previewText ?? "");
  const [contentBody,    setContentBody]    = useState(initial?.contentBody ?? "");
  const [senderName,     setSenderName]     = useState(initial?.senderName ?? "");
  const [senderEmail,    setSenderEmail]    = useState(initial?.senderEmail ?? "");
  const [ctaText,        setCtaText]        = useState(initial?.ctaText ?? "");
  const [ctaUrl,         setCtaUrl]         = useState(initial?.ctaUrl ?? "");
  const [ctaSecText,     setCtaSecText]     = useState(initial?.ctaSecondaryText ?? "");
  const [ctaSecUrl,      setCtaSecUrl]      = useState(initial?.ctaSecondaryUrl ?? "");
  const [tagName,        setTagName]        = useState(initial?.tagName ?? "");
  const [updateField,    setUpdateField]    = useState(initial?.updateField ?? "");
  const [updateValue,    setUpdateValue]    = useState(initial?.updateValue ?? "");
  const [targetSeqId,    setTargetSeqId]    = useState(String(initial?.targetSequenceId ?? ""));
  const [saving,  setSaving]  = useState(false);
  const [msg,     setMsg]     = useState("");

  const save = async () => {
    if (stepType === "email" && !subject.trim()) { setMsg("Tiêu đề email là bắt buộc."); return; }
    if ((stepType === "add_tag" || stepType === "remove_tag") && !tagName.trim()) { setMsg("Tên tag là bắt buộc."); return; }
    setSaving(true); setMsg("");
    try {
      const payload: Partial<EmailSequenceStep> = {
        stepType,
        delayDays: Number(delayDays) || 0,
        subject: stepType === "email" ? subject.trim() : "",
        previewText:  previewText.trim()  || null,
        contentBody:  contentBody.trim()  || null,
        senderName:   senderName.trim()   || null,
        senderEmail:  senderEmail.trim()  || null,
        ctaText:      ctaText.trim()      || null,
        ctaUrl:       ctaUrl.trim()       || null,
        ctaSecondaryText: ctaSecText.trim() || null,
        ctaSecondaryUrl:  ctaSecUrl.trim()  || null,
        tagName:      tagName.trim()      || null,
        updateField:  updateField.trim()  || null,
        updateValue:  updateValue.trim()  || null,
        targetSequenceId: targetSeqId ? Number(targetSeqId) : null,
      };
      let saved: EmailSequenceStep;
      if (initial) {
        saved = await adminApi.updateSequenceStep(adminKey, initial.id, payload);
      } else {
        saved = await adminApi.createSequenceStep(adminKey, sequenceId, payload);
      }
      onSaved(saved);
    } catch (e) { setMsg(String(e)); }
    finally { setSaving(false); }
  };

  const isEmail = stepType === "email";
  const isWait  = stepType === "wait";
  const isTag   = stepType === "add_tag" || stepType === "remove_tag";
  const isField = stepType === "update_field";
  const isMove  = stepType === "move_to_sequence";
  const isEnd   = stepType === "end";

  return (
    <div style={{ background: A.bg, border: `1px solid ${A.border}`, borderRadius: "9px", padding: "1.125rem", marginTop: "0.5rem" }}>
      {/* Step type selector */}
      <div style={{ marginBottom: "1rem" }}>
        <label style={s.label}>Loại bước</label>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {STEP_TYPES.map((t) => (
            <button key={t.value} onClick={() => setStepType(t.value)} style={{
              padding: "5px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "12px",
              border: `1px solid ${stepType === t.value ? t.color : A.border}`,
              background: stepType === t.value ? `${t.color}12` : "#fff",
              color: stepType === t.value ? t.color : A.textMuted,
              fontWeight: stepType === t.value ? 600 : 400,
              display: "flex", alignItems: "center", gap: "4px",
            }}>
              <span style={{ fontSize: "10px" }}>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Delay (not for instant steps) */}
      {!isEnd && (
        <div style={{ marginBottom: "0.875rem", display: "flex", alignItems: "center", gap: "8px" }}>
          <div>
            <label style={s.label}>Trì hoãn trước bước này</label>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <input type="number" value={delayDays} onChange={(e) => setDelayDays(e.target.value)} min="0" max="365" style={{ ...s.field, maxWidth: "70px" }} />
              <span style={{ fontSize: "13px", color: A.textMuted }}>ngày</span>
              {Number(delayDays) === 0 && !isTag && !isField && !isMove &&
                <span style={{ fontSize: "11px", color: "#ea580c" }}>Gửi ngay</span>}
            </div>
          </div>
        </div>
      )}

      {/* Email fields */}
      {isEmail && (
        <>
          <div style={{ marginBottom: "0.75rem" }}>
            <label style={s.label}>Tiêu đề email *</label>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} style={s.field} placeholder="Tiêu đề email..." />
          </div>
          <div style={{ marginBottom: "0.75rem" }}>
            <label style={s.label}>Preview text</label>
            <input value={previewText} onChange={(e) => setPreviewText(e.target.value)} style={s.field} placeholder="Dòng tóm tắt..." />
          </div>
          <div style={{ marginBottom: "0.75rem" }}>
            <label style={s.label}>Nội dung email <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>— dùng **in đậm**, {"{{first_name}}"}</span></label>
            <textarea value={contentBody} onChange={(e) => setContentBody(e.target.value)} style={{ ...s.textarea, height: "160px", fontSize: "13px" }} placeholder={"{{first_name}},\n\nNội dung email...\n\nPhan Văn Thắng"} />
          </div>

          {/* Sender overrides (collapsed by default) */}
          <details style={{ marginBottom: "0.75rem" }}>
            <summary style={{ fontSize: "11.5px", color: A.textMuted, cursor: "pointer", marginBottom: "8px" }}>Tùy chỉnh người gửi (tùy chọn)</summary>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "8px" }}>
              <div>
                <label style={s.label}>Tên người gửi</label>
                <input value={senderName} onChange={(e) => setSenderName(e.target.value)} style={s.field} placeholder="Phan Văn Thắng" />
              </div>
              <div>
                <label style={s.label}>Email gửi</label>
                <input value={senderEmail} onChange={(e) => setSenderEmail(e.target.value)} style={s.field} placeholder="thang@..." />
              </div>
            </div>
          </details>

          {/* CTA */}
          <details style={{ marginBottom: "0.875rem" }}>
            <summary style={{ fontSize: "11.5px", color: A.textMuted, cursor: "pointer", marginBottom: "8px" }}>Nút CTA (tùy chọn)</summary>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "8px", marginTop: "8px" }}>
              <div>
                <label style={s.label}>Nhãn nút chính</label>
                <input value={ctaText} onChange={(e) => setCtaText(e.target.value)} style={s.field} placeholder="Xem thêm" />
              </div>
              <div>
                <label style={s.label}>URL nút chính</label>
                <input value={ctaUrl} onChange={(e) => setCtaUrl(e.target.value)} style={s.field} placeholder="https://..." />
              </div>
              <div>
                <label style={s.label}>Nhãn nút phụ</label>
                <input value={ctaSecText} onChange={(e) => setCtaSecText(e.target.value)} style={s.field} placeholder="Link khác..." />
              </div>
              <div>
                <label style={s.label}>URL nút phụ</label>
                <input value={ctaSecUrl} onChange={(e) => setCtaSecUrl(e.target.value)} style={s.field} placeholder="https://..." />
              </div>
            </div>
          </details>
        </>
      )}

      {/* Tag step */}
      {isTag && (
        <div style={{ marginBottom: "0.875rem" }}>
          <label style={s.label}>Tên tag *</label>
          <input value={tagName} onChange={(e) => setTagName(e.target.value)} style={s.field} placeholder="newsletter, interest_swc, ..." />
        </div>
      )}

      {/* Update field */}
      {isField && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "0.875rem" }}>
          <div>
            <label style={s.label}>Trường cần cập nhật</label>
            <select value={updateField} onChange={(e) => setUpdateField(e.target.value)} style={s.select}>
              <option value="">-- Chọn trường --</option>
              <option value="stage">Stage</option>
              <option value="interestPrimary">Interest</option>
              <option value="sourceType">Source</option>
            </select>
          </div>
          <div>
            <label style={s.label}>Giá trị mới</label>
            <input value={updateValue} onChange={(e) => setUpdateValue(e.target.value)} style={s.field} placeholder="Giá trị..." />
          </div>
        </div>
      )}

      {/* Move to sequence */}
      {isMove && (
        <div style={{ marginBottom: "0.875rem" }}>
          <label style={s.label}>Chuỗi đích</label>
          <select value={targetSeqId} onChange={(e) => setTargetSeqId(e.target.value)} style={s.select}>
            <option value="">-- Chọn chuỗi --</option>
            {allSequences.filter((s) => s.id !== sequenceId).map((s) => (
              <option key={s.id} value={String(s.id)}>{s.title}</option>
            ))}
          </select>
        </div>
      )}

      {isEnd && (
        <p style={{ fontSize: "13px", color: A.textMuted, marginBottom: "0.875rem" }}>Khi đến bước này, enrollment sẽ được đánh dấu hoàn thành.</p>
      )}

      {isWait && (
        <p style={{ fontSize: "13px", color: A.textMuted, marginBottom: "0.875rem" }}>Bước chờ — không gửi gì, chỉ tạo khoảng thời gian trễ trước bước tiếp theo.</p>
      )}

      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
        <button onClick={save} disabled={saving} style={{ ...s.btnPrimary, fontSize: "12.5px" }}>
          {saving ? "Đang lưu..." : initial ? "Cập nhật bước" : "Thêm bước"}
        </button>
        <button onClick={onCancel} style={s.btnSecondary}>Hủy</button>
        {msg && <span style={{ fontSize: "12px", color: A.danger }}>{msg}</span>}
      </div>
    </div>
  );
}

/* ─── Analytics tab ─────────────────────────────────────────────────── */
function SequenceAnalyticsTab({ seqId, adminKey }: { seqId: number; adminKey: string }) {
  const [data, setData] = useState<SequenceAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    setLoading(true);
    adminApi.getSequenceAnalytics(adminKey, seqId)
      .then(setData).catch((e) => setErr(String(e))).finally(() => setLoading(false));
  }, [seqId, adminKey]);

  if (loading) return <p style={{ color: A.textMuted, padding: "1rem", fontSize: "13px" }}>Đang tải...</p>;
  if (err)     return <p style={{ color: A.danger, padding: "1rem", fontSize: "13px" }}>{err}</p>;
  if (!data)   return null;

  const statCard = (label: string, value: number | string) => (
    <div style={{ background: A.bgCard, border: `1px solid ${A.border}`, borderRadius: "8px", padding: "14px 16px", textAlign: "center" as const }}>
      <p style={{ fontSize: "22px", fontWeight: 700, color: A.text, margin: "0 0 2px" }}>{value}</p>
      <p style={{ fontSize: "11px", color: A.textMuted, margin: 0 }}>{label}</p>
    </div>
  );

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginBottom: "1.25rem" }}>
        {statCard("Đã đăng ký", data.enrolled)}
        {statCard("Đang chạy",  data.active)}
        {statCard("Hoàn thành", data.completed)}
        {statCard("Đã thoát",   data.exited)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "1.5rem" }}>
        {statCard("Đã gửi", data.sent)}
        {statCard("Tỷ lệ mở", pct(data.openRate))}
        {statCard("Tỷ lệ click", pct(data.clickRate))}
      </div>

      {data.steps.length > 0 && (
        <div>
          <p style={{ ...s.sectionTitle, fontSize: "13px", marginBottom: "10px" }}>Chi tiết từng bước</p>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={s.th}>#</th>
                <th style={s.th}>Loại</th>
                <th style={s.th}>Tiêu đề</th>
                <th style={s.th}>Đã gửi</th>
                <th style={s.th}>Mở</th>
                <th style={s.th}>Click</th>
              </tr>
            </thead>
            <tbody>
              {data.steps.map((step) => (
                <tr key={step.stepId}>
                  <td style={s.td}>{step.stepOrder}</td>
                  <td style={s.td}><StepTypePill type={step.stepType} /></td>
                  <td style={s.td}>{step.subject || <span style={{ color: A.textMuted }}>—</span>}</td>
                  <td style={s.td}>{step.sent}</td>
                  <td style={s.td}>{pct(step.openRate)}</td>
                  <td style={s.td}>{pct(step.clickRate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ─── Sequence detail panel ─────────────────────────────────────────── */
function SequenceDetail({
  seq, adminKey, onUpdated, onBack,
}: { seq: EmailSequence; adminKey: string; onUpdated: (s: EmailSequence) => void; onBack: () => void }) {
  const [steps,        setSteps]        = useState<EmailSequenceStep[]>([]);
  const [allSequences, setAllSequences] = useState<EmailSequence[]>([]);
  const [loadingSteps, setLoadingSteps] = useState(true);
  const [addingStep,   setAddingStep]   = useState(false);
  const [editingStep,  setEditingStep]  = useState<EmailSequenceStep | null>(null);
  const [deletingStep, setDeletingStep] = useState<number | null>(null);
  const [activeTab,    setActiveTab]    = useState<"steps" | "config" | "analytics">("steps");
  const [msg,          setMsg]          = useState("");

  // Edit sequence fields
  const [title,       setTitle]       = useState(seq.title);
  const [slug,        setSlug]        = useState(seq.slug ?? "");
  const [description, setDescription] = useState(seq.description ?? "");
  const [triggerType, setTriggerType] = useState(seq.triggerType ?? "on_subscribe");
  const [triggerTagsRaw, setTriggerTagsRaw] = useState((seq.triggerTags ?? []).join(", "));
  const [excludeRules,   setExcludeRules]   = useState<string[]>((seq.excludeRules as string[]) ?? []);
  const [goal,        setGoal]        = useState(seq.goal ?? "");
  const [status,      setStatus]      = useState(seq.status);
  const [savingInfo,  setSavingInfo]  = useState(false);

  const loadSteps = useCallback(async () => {
    setLoadingSteps(true);
    try {
      const loaded = await adminApi.getSequenceSteps(adminKey, seq.id);
      setSteps(loaded);
    } finally { setLoadingSteps(false); }
  }, [adminKey, seq.id]);

  useEffect(() => {
    void loadSteps();
    adminApi.getSequences(adminKey).then(setAllSequences).catch(() => {});
  }, [loadSteps, adminKey]);

  const saveInfo = async () => {
    setSavingInfo(true); setMsg("");
    try {
      const updated = await adminApi.updateSequence(adminKey, seq.id, {
        title: title.trim(),
        slug: slug.trim() || undefined,
        description: description.trim() || undefined,
        triggerType,
        triggerTags: triggerTagsRaw.split(",").map((t) => t.trim()).filter(Boolean),
        excludeRules,
        goal: goal.trim() || undefined,
        status,
      });
      onUpdated(updated);
      setMsg("Đã lưu.");
    } catch (e) { setMsg(String(e)); }
    finally { setSavingInfo(false); }
  };

  const handleStepSaved = (step: EmailSequenceStep) => {
    if (addingStep) {
      setSteps((prev) => [...prev, step].sort((a, b) => a.stepOrder - b.stepOrder));
      setAddingStep(false);
    } else {
      setSteps((prev) => prev.map((s) => s.id === step.id ? step : s));
      setEditingStep(null);
    }
  };

  const handleDeleteStep = async (stepId: number) => {
    if (!window.confirm("Xoá bước này?")) return;
    setDeletingStep(stepId);
    try {
      await adminApi.deleteSequenceStep(adminKey, stepId);
      setSteps((prev) => prev.filter((s) => s.id !== stepId));
    } finally { setDeletingStep(null); }
  };

  const tabBtn = (id: "steps" | "config" | "analytics", label: string) => (
    <button onClick={() => setActiveTab(id)} style={{
      padding: "7px 14px", borderRadius: "6px", border: "none", cursor: "pointer",
      fontSize: "12.5px", fontWeight: activeTab === id ? 600 : 400,
      background: activeTab === id ? A.primary : "transparent",
      color: activeTab === id ? "#fff" : A.textMuted,
    }}>{label}</button>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1.25rem" }}>
        <button onClick={onBack} style={s.btnSecondary}>← Danh sách</button>
        <div style={{ flex: 1 }}>
          <h2 style={{ ...s.sectionTitle, marginBottom: "3px" }}>{seq.title}</h2>
          <SeqStatusBadge status={seq.status} />
        </div>
      </div>

      {/* Tab nav */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "1.25rem", background: A.bg, borderRadius: "8px", padding: "4px", width: "fit-content" }}>
        {tabBtn("steps", `Các bước (${steps.length})`)}
        {tabBtn("config", "Cấu hình")}
        {tabBtn("analytics", "Phân tích")}
      </div>

      {/* Steps tab */}
      {activeTab === "steps" && (
        <div>
          {loadingSteps ? (
            <p style={{ color: A.textMuted, fontSize: "13px" }}>Đang tải...</p>
          ) : (
            <>
              {steps.length === 0 && !addingStep && (
                <div style={{ textAlign: "center", padding: "2.5rem", background: A.bg, borderRadius: "10px", border: `1px dashed ${A.border}` }}>
                  <p style={{ fontSize: "14px", color: A.textMuted, margin: "0 0 12px" }}>Chuỗi này chưa có bước nào.</p>
                  <button onClick={() => setAddingStep(true)} style={s.btnPrimary}>+ Thêm bước đầu tiên</button>
                </div>
              )}
              {steps.map((step) => (
                <div key={step.id} style={{ background: A.bgCard, border: `1px solid ${A.border}`, borderRadius: "8px", padding: "12px 14px", marginBottom: "8px" }}>
                  {editingStep?.id === step.id ? (
                    <StepForm
                      initial={step} sequenceId={seq.id} adminKey={adminKey} allSequences={allSequences}
                      onSaved={handleStepSaved} onCancel={() => setEditingStep(null)}
                    />
                  ) : (
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                      <div style={{ minWidth: "24px", height: "24px", borderRadius: "50%", background: A.bg, border: `1px solid ${A.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: A.textMuted, flexShrink: 0, marginTop: "1px" }}>
                        {step.stepOrder}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                          <StepTypePill type={step.stepType} />
                          {step.delayDays > 0 && <span style={{ fontSize: "11px", color: A.textMuted }}>⏱ {step.delayDays} ngày</span>}
                          {!step.isActive && <span style={{ fontSize: "11px", color: A.textMuted, background: A.bg, padding: "1px 6px", borderRadius: "4px" }}>Tắt</span>}
                        </div>
                        {step.stepType === "email" && (
                          <p style={{ fontSize: "13px", fontWeight: 500, color: A.text, margin: "0 0 2px" }}>{step.subject || "—"}</p>
                        )}
                        {(step.stepType === "add_tag" || step.stepType === "remove_tag") && (
                          <p style={{ fontSize: "13px", color: A.textMuted, margin: 0 }}>Tag: <strong>{step.tagName}</strong></p>
                        )}
                        {step.stepType === "update_field" && (
                          <p style={{ fontSize: "13px", color: A.textMuted, margin: 0 }}>{step.updateField} → {step.updateValue}</p>
                        )}
                        {step.contentBody && step.stepType === "email" && (
                          <p style={{ fontSize: "12px", color: A.textMuted, margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "400px" }}>
                            {step.contentBody.slice(0, 80)}...
                          </p>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
                        <button onClick={() => setEditingStep(step)} style={s.btnGhost}>Sửa</button>
                        <button onClick={() => handleDeleteStep(step.id)} disabled={deletingStep === step.id} style={{ ...s.btnGhost, color: A.danger }}>
                          {deletingStep === step.id ? "..." : "Xoá"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {addingStep && (
                <StepForm
                  sequenceId={seq.id} adminKey={adminKey} allSequences={allSequences}
                  onSaved={handleStepSaved} onCancel={() => setAddingStep(false)}
                />
              )}
              {steps.length > 0 && !addingStep && (
                <button onClick={() => setAddingStep(true)} style={{ ...s.btnSecondary, marginTop: "8px" }}>+ Thêm bước</button>
              )}
            </>
          )}
        </div>
      )}

      {/* Config tab */}
      {activeTab === "config" && (
        <div style={{ maxWidth: "600px" }}>
          {msg && <div style={msg.startsWith("Đã") ? s.success : s.error}>{msg}</div>}

          <div style={{ marginBottom: "1rem" }}>
            <label style={s.label}>Tên chuỗi *</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} style={s.field} />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label style={s.label}>Slug</label>
            <input value={slug} onChange={(e) => setSlug(e.target.value)} style={s.field} placeholder="ten-chuoi-email" />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label style={s.label}>Mô tả</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} style={{ ...s.textarea, height: "70px" }} />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label style={s.label}>Mục tiêu</label>
            <input value={goal} onChange={(e) => setGoal(e.target.value)} style={s.field} placeholder="Ví dụ: Chuyển đổi sang khách hàng..." />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "1rem" }}>
            <div>
              <label style={s.label}>Điều kiện bắt đầu</label>
              <select value={triggerType} onChange={(e) => setTriggerType(e.target.value)} style={s.select}>
                {TRIGGER_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label style={s.label}>Trạng thái</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} style={s.select}>
                <option value="active">Đang kích hoạt</option>
                <option value="paused">Tạm dừng</option>
                <option value="archived">Lưu trữ</option>
              </select>
            </div>
          </div>

          {(triggerType === "tag_added" || triggerType === "on_subscribe") && (
            <div style={{ marginBottom: "1rem" }}>
              <label style={s.label}>Tags kích hoạt (phân cách bằng dấu phẩy)</label>
              <input value={triggerTagsRaw} onChange={(e) => setTriggerTagsRaw(e.target.value)} style={s.field} placeholder="newsletter, lead_magnet, ..." />
            </div>
          )}

          <div style={{ marginBottom: "1.25rem" }}>
            <label style={s.label}>Điều kiện loại trừ</label>
            <div style={{ display: "flex", flexDirection: "column" as const, gap: "6px", marginTop: "4px" }}>
              {EXCLUDE_RULE_OPTIONS.map((rule) => (
                <label key={rule.value} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", color: A.text }}>
                  <input type="checkbox" checked={excludeRules.includes(rule.value)}
                    onChange={(e) => setExcludeRules(e.target.checked ? [...excludeRules, rule.value] : excludeRules.filter((r) => r !== rule.value))} />
                  {rule.label}
                </label>
              ))}
            </div>
          </div>

          <button onClick={saveInfo} disabled={savingInfo} style={s.btnPrimary}>
            {savingInfo ? "Đang lưu..." : "Lưu cấu hình"}
          </button>
        </div>
      )}

      {/* Analytics tab */}
      {activeTab === "analytics" && <SequenceAnalyticsTab seqId={seq.id} adminKey={adminKey} />}
    </div>
  );
}

/* ─── Sequence form (create) ──────────────────────────────────────────── */
function CreateSequenceForm({ adminKey, onCreated, onCancel }: { adminKey: string; onCreated: (s: EmailSequence) => void; onCancel: () => void }) {
  const [title,       setTitle]       = useState("");
  const [description, setDescription] = useState("");
  const [triggerType, setTriggerType] = useState("on_subscribe");
  const [goal,        setGoal]        = useState("");
  const [saving,      setSaving]      = useState(false);
  const [msg,         setMsg]         = useState("");

  const save = async () => {
    if (!title.trim()) { setMsg("Tên chuỗi là bắt buộc."); return; }
    setSaving(true); setMsg("");
    try {
      const seq = await adminApi.createSequence(adminKey, {
        title: title.trim(),
        slug: slugify(title.trim()),
        description: description.trim() || undefined,
        triggerType, goal: goal.trim() || undefined, status: "active",
      });
      onCreated(seq);
    } catch (e) { setMsg(String(e)); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ ...s.card, maxWidth: "520px", marginBottom: "1.5rem" }}>
      <h3 style={{ ...s.sectionTitle, marginBottom: "1rem" }}>Tạo chuỗi mới</h3>
      {msg && <div style={s.error}>{msg}</div>}
      <div style={{ marginBottom: "0.875rem" }}>
        <label style={s.label}>Tên chuỗi *</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} style={s.field} placeholder="Ví dụ: Chào mừng — 7 sai lầm tài sản" />
      </div>
      <div style={{ marginBottom: "0.875rem" }}>
        <label style={s.label}>Mô tả ngắn</label>
        <input value={description} onChange={(e) => setDescription(e.target.value)} style={s.field} placeholder="Mô tả ngắn về chuỗi..." />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "0.875rem" }}>
        <div>
          <label style={s.label}>Điều kiện bắt đầu</label>
          <select value={triggerType} onChange={(e) => setTriggerType(e.target.value)} style={s.select}>
            {TRIGGER_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <label style={s.label}>Mục tiêu</label>
          <input value={goal} onChange={(e) => setGoal(e.target.value)} style={s.field} placeholder="Ví dụ: Chuyển đổi..." />
        </div>
      </div>
      <div style={{ display: "flex", gap: "8px" }}>
        <button onClick={save} disabled={saving} style={s.btnPrimary}>{saving ? "Đang tạo..." : "Tạo chuỗi"}</button>
        <button onClick={onCancel} style={s.btnSecondary}>Hủy</button>
      </div>
    </div>
  );
}

/* ─── Main panel ─────────────────────────────────────────────────────── */
export function EmailSequencesPanel({ adminKey }: { adminKey: string }) {
  const [sequences,    setSequences]    = useState<EmailSequence[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");
  const [selected,     setSelected]     = useState<EmailSequence | null>(null);
  const [creating,     setCreating]     = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterTrigger,setFilterTrigger]= useState("all");
  const [search,       setSearch]       = useState("");
  const [seeding,      setSeeding]      = useState(false);
  const [seedMsg,      setSeedMsg]      = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const params: { status?: string; trigger?: string } = {};
      if (filterStatus  !== "all") params.status  = filterStatus;
      if (filterTrigger !== "all") params.trigger  = filterTrigger;
      const seqs = await adminApi.getSequences(adminKey, params);
      setSequences(seqs);
    } catch (e) { setError(String(e)); }
    finally { setLoading(false); }
  }, [adminKey, filterStatus, filterTrigger]);

  useEffect(() => { void load(); }, [load]);

  const handleDelete = async (seq: EmailSequence) => {
    if (!window.confirm(`Xoá chuỗi "${seq.title}"? Tất cả bước và dữ liệu sẽ bị xoá.`)) return;
    try {
      await adminApi.deleteSequence(adminKey, seq.id);
      setSequences((prev) => prev.filter((s) => s.id !== seq.id));
      if (selected?.id === seq.id) setSelected(null);
    } catch (e) { alert(String(e)); }
  };

  const handleToggleStatus = async (seq: EmailSequence) => {
    const newStatus = seq.status === "active" ? "paused" : "active";
    try {
      const updated = await adminApi.updateSequence(adminKey, seq.id, { status: newStatus });
      setSequences((prev) => prev.map((s) => s.id === seq.id ? { ...s, ...updated } : s));
    } catch (e) { alert(String(e)); }
  };

  const handleSeed = async () => {
    setSeeding(true); setSeedMsg("");
    try {
      const result = await adminApi.seedSequences(adminKey);
      setSeedMsg(`Đã tạo ${result.inserted.length} chuỗi mẫu${result.skipped.length > 0 ? `, bỏ qua ${result.skipped.length} đã tồn tại.` : "."}`);
      await load();
    } catch (e) { setSeedMsg(String(e)); }
    finally { setSeeding(false); }
  };

  const filtered = sequences.filter((s) => {
    if (!search.trim()) return true;
    return s.title.toLowerCase().includes(search.toLowerCase());
  });

  // --- Detail view ---
  if (selected) {
    return (
      <SequenceDetail
        seq={selected} adminKey={adminKey}
        onUpdated={(updated) => {
          setSelected(updated);
          setSequences((prev) => prev.map((s) => s.id === updated.id ? { ...s, ...updated } : s));
        }}
        onBack={() => setSelected(null)}
      />
    );
  }

  return (
    <div>
      <div style={s.sectionHeader}>
        <div>
          <h2 style={s.sectionTitle}>Chuỗi email tự động</h2>
          <p style={{ fontSize: "13px", color: A.textMuted, margin: "3px 0 0" }}>
            {sequences.length} chuỗi · {sequences.filter((s) => s.status === "active").length} đang kích hoạt
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={handleSeed} disabled={seeding} style={s.btnSecondary}>
            {seeding ? "Đang tạo..." : "Tạo mẫu mặc định"}
          </button>
          <button onClick={() => { setCreating(true); setError(""); }} style={s.btnPrimary}>+ Tạo chuỗi</button>
        </div>
      </div>

      {seedMsg && <div style={seedMsg.includes("Đã tạo") ? s.success : s.error}>{seedMsg}</div>}

      {creating && (
        <CreateSequenceForm
          adminKey={adminKey}
          onCreated={(seq) => { setSequences((prev) => [seq, ...prev]); setCreating(false); setSelected(seq); }}
          onCancel={() => setCreating(false)}
        />
      )}

      {/* Filters */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "1rem", flexWrap: "wrap" }}>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm chuỗi..." style={{ ...s.field, maxWidth: "220px" }} />
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); }} style={{ ...s.select, maxWidth: "160px" }}>
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang kích hoạt</option>
          <option value="paused">Tạm dừng</option>
          <option value="archived">Lưu trữ</option>
        </select>
        <select value={filterTrigger} onChange={(e) => setFilterTrigger(e.target.value)} style={{ ...s.select, maxWidth: "190px" }}>
          <option value="all">Tất cả điều kiện</option>
          {TRIGGER_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>

      {error && <div style={s.error}>{error}</div>}
      {loading && <p style={{ color: A.textMuted, fontSize: "13px" }}>Đang tải...</p>}

      {!loading && filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "3rem", background: A.bg, borderRadius: "12px", border: `1px dashed ${A.border}` }}>
          <p style={{ fontSize: "15px", fontWeight: 600, color: A.text, margin: "0 0 6px" }}>Chưa có chuỗi email nào</p>
          <p style={{ fontSize: "13px", color: A.textMuted, margin: "0 0 20px" }}>Tạo chuỗi đầu tiên hoặc dùng mẫu có sẵn.</p>
          <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
            <button onClick={handleSeed} disabled={seeding} style={s.btnSecondary}>{seeding ? "Đang tạo..." : "Dùng mẫu mặc định"}</button>
            <button onClick={() => setCreating(true)} style={s.btnPrimary}>+ Tạo chuỗi mới</button>
          </div>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div>
          {filtered.map((seq) => (
            <div key={seq.id} style={{ background: A.bgCard, border: `1px solid ${A.border}`, borderRadius: "10px", padding: "14px 16px", marginBottom: "8px", cursor: "pointer" }}
              onClick={() => setSelected(seq)}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <p style={{ fontSize: "14px", fontWeight: 600, color: A.text, margin: 0 }}>{seq.title}</p>
                    <SeqStatusBadge status={seq.status} />
                  </div>
                  {seq.description && <p style={{ fontSize: "12.5px", color: A.textMuted, margin: "0 0 6px" }}>{seq.description}</p>}
                  <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "11.5px", color: A.textMuted }}>{TRIGGER_TYPES.find((t) => t.value === seq.triggerType)?.label ?? seq.triggerType}</span>
                    <span style={{ fontSize: "11.5px", color: A.textMuted }}>{seq.stepCount ?? 0} bước</span>
                    <span style={{ fontSize: "11.5px", color: A.textMuted }}>{seq.enrolledCount ?? 0} đăng ký</span>
                    <span style={{ fontSize: "11.5px", color: A.textMuted }}>{seq.completedCount ?? 0} hoàn thành</span>
                    {seq.openRate != null && <span style={{ fontSize: "11.5px", color: A.textMuted }}>Mở: {seq.openRate}%</span>}
                    {seq.clickRate != null && <span style={{ fontSize: "11.5px", color: A.textMuted }}>Click: {seq.clickRate}%</span>}
                    <span style={{ fontSize: "11.5px", color: A.textMuted }}>Cập nhật {fmtDate(seq.updatedAt)}</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "4px", flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => handleToggleStatus(seq)} style={s.btnGhost}>
                    {seq.status === "active" ? "Tạm dừng" : "Kích hoạt"}
                  </button>
                  <button onClick={() => handleDelete(seq)} style={{ ...s.btnGhost, color: A.danger }}>Xoá</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
