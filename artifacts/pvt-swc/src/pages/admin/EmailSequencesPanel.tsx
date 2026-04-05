import React, { useState, useEffect } from "react";
import { adminApi, type EmailSequence, type EmailSequenceStep } from "@/lib/newsApi";
import { A, s, fmtDate } from "./shared";

function SeqStatusBadge({ status }: { status: string }) {
  const active = status === "active";
  return (
    <span style={{ fontSize: "11px", fontWeight: 600, color: active ? "#16a34a" : "#6b7280", background: active ? "#f0fdf4" : "#f9fafb", padding: "2px 8px", borderRadius: "5px", border: `1px solid ${active ? "#86efac" : "#e5e7eb"}` }}>
      {active ? "Đang kích hoạt" : "Tạm dừng"}
    </span>
  );
}

const TRIGGER_LABELS: Record<string, string> = {
  on_subscribe: "Khi đăng ký mới",
  manual:       "Thủ công",
};

/* ── Step form ─────────────────────────────────────────────────────── */
function StepForm({
  initial, sequenceId, adminKey, onSaved, onCancel,
}: { initial?: EmailSequenceStep | null; sequenceId: number; adminKey: string; onSaved: (s: EmailSequenceStep) => void; onCancel: () => void }) {
  const [subject,     setSubject]     = useState(initial?.subject ?? "");
  const [previewText, setPreviewText] = useState(initial?.previewText ?? "");
  const [contentBody, setContentBody] = useState(initial?.contentBody ?? "");
  const [delayDays,   setDelayDays]   = useState(String(initial?.delayDays ?? 0));
  const [saving,      setSaving]      = useState(false);
  const [msg,         setMsg]         = useState("");

  const save = async () => {
    if (!subject.trim()) { setMsg("Tiêu đề email là bắt buộc."); return; }
    setSaving(true); setMsg("");
    try {
      let saved: EmailSequenceStep;
      if (initial) {
        saved = await adminApi.updateSequenceStep(adminKey, initial.id, { subject, previewText, contentBody, delayDays: Number(delayDays) });
      } else {
        saved = await adminApi.createSequenceStep(adminKey, sequenceId, { subject, previewText, contentBody, delayDays: Number(delayDays) });
      }
      onSaved(saved);
    } catch (e) { setMsg(String(e)); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ background: A.bg, border: `1px solid ${A.border}`, borderRadius: "9px", padding: "1.125rem", marginTop: "0.75rem" }}>
      <div style={{ marginBottom: "0.875rem" }}>
        <label style={s.label}>Tiêu đề email *</label>
        <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} style={s.field} placeholder="Tiêu đề email số này..." />
      </div>
      <div style={{ marginBottom: "0.875rem" }}>
        <label style={s.label}>Preview text</label>
        <input type="text" value={previewText} onChange={(e) => setPreviewText(e.target.value)} style={s.field} placeholder="Dòng tóm tắt ngắn..." />
      </div>
      <div style={{ marginBottom: "0.875rem" }}>
        <label style={s.label}>Nội dung email</label>
        <textarea value={contentBody} onChange={(e) => setContentBody(e.target.value)} style={{ ...s.textarea, height: "140px", fontSize: "13px" }} placeholder={"Nội dung email...\n\nNgăn cách đoạn văn bằng dòng trống."} />
      </div>
      <div style={{ marginBottom: "1rem" }}>
        <label style={s.label}>Trì hoãn gửi (ngày sau bước trước)</label>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <input type="number" value={delayDays} onChange={(e) => setDelayDays(e.target.value)} min="0" max="365" style={{ ...s.field, maxWidth: "80px" }} />
          <span style={{ fontSize: "13px", color: A.textMuted }}>ngày</span>
          {Number(delayDays) === 0 && <span style={{ fontSize: "11.5px", color: "#ea580c" }}>Gửi ngay khi đăng ký</span>}
        </div>
      </div>
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
        <button onClick={save} disabled={saving} style={{ ...s.btnPrimary, fontSize: "12.5px" }}>{saving ? "Đang lưu..." : "Lưu email"}</button>
        <button onClick={onCancel} style={s.btnSecondary}>Hủy</button>
        {msg && <span style={{ fontSize: "12px", color: A.danger }}>{msg}</span>}
      </div>
    </div>
  );
}

/* ── Sequence detail ───────────────────────────────────────────────── */
function SequenceDetail({
  seq, adminKey, onUpdated, onBack,
}: { seq: EmailSequence; adminKey: string; onUpdated: (s: EmailSequence) => void; onBack: () => void }) {
  const [steps,       setSteps]       = useState<EmailSequenceStep[]>([]);
  const [loadingSteps, setLoadingSteps] = useState(true);
  const [editingSeq,  setEditingSeq]  = useState(false);
  const [title,       setTitle]       = useState(seq.title);
  const [description, setDescription] = useState(seq.description ?? "");
  const [status,      setStatus]      = useState(seq.status);
  const [saving,      setSaving]      = useState(false);
  const [msg,         setMsg]         = useState("");

  const [addingStep, setAddingStep]   = useState(false);
  const [editStep,   setEditStep]     = useState<EmailSequenceStep | null>(null);

  const loadSteps = async () => {
    setLoadingSteps(true);
    try { setSteps(await adminApi.getSequenceSteps(adminKey, seq.id)); }
    catch (e) { console.error(e); }
    finally { setLoadingSteps(false); }
  };

  useEffect(() => { void loadSteps(); }, [seq.id]);

  const saveSeq = async () => {
    setSaving(true); setMsg("");
    try {
      const updated = await adminApi.updateSequence(adminKey, seq.id, { title, description, status });
      onUpdated(updated);
      setMsg("Đã lưu.");
      setEditingSeq(false);
    } catch (e) { setMsg(String(e)); }
    finally { setSaving(false); }
  };

  const deleteStep = async (stepId: number) => {
    if (!confirm("Xoá bước email này?")) return;
    try {
      await adminApi.deleteSequenceStep(adminKey, stepId);
      setSteps((prev) => prev.filter((s) => s.id !== stepId));
    } catch (e) { alert(String(e)); }
  };

  const onStepSaved = (saved: EmailSequenceStep) => {
    setSteps((prev) => {
      const idx = prev.findIndex((x) => x.id === saved.id);
      return idx >= 0 ? prev.map((x, i) => i === idx ? saved : x) : [...prev, saved].sort((a, b) => a.stepOrder - b.stepOrder);
    });
    setAddingStep(false);
    setEditStep(null);
  };

  return (
    <div style={{ maxWidth: "700px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
        <button onClick={onBack} style={s.btnSecondary}>← Quay lại</button>
        <h2 style={{ ...s.sectionTitle, margin: 0 }}>{seq.title}</h2>
        <SeqStatusBadge status={seq.status} />
      </div>

      {/* Sequence meta */}
      <div style={{ background: "#fff", border: `1px solid ${A.border}`, borderRadius: "10px", padding: "1.25rem", marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: editingSeq ? "1rem" : 0 }}>
          <div>
            <p style={{ margin: "0 0 4px", fontSize: "11px", fontWeight: 600, color: A.textLight, letterSpacing: "0.1em", textTransform: "uppercase" }}>Chi tiết chuỗi</p>
            {!editingSeq && (
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "6px" }}>
                <p style={{ margin: 0, fontSize: "13px", color: A.textMuted }}>Kích hoạt: <strong style={{ color: A.text }}>{TRIGGER_LABELS[seq.triggerType ?? ""] ?? seq.triggerType}</strong></p>
                {seq.description && <p style={{ margin: 0, fontSize: "13px", color: A.textMuted, lineHeight: 1.55 }}>{seq.description}</p>}
              </div>
            )}
          </div>
          {!editingSeq && <button onClick={() => setEditingSeq(true)} style={{ ...s.btnSecondary, fontSize: "12px" }}>Chỉnh sửa</button>}
        </div>

        {editingSeq && (
          <div>
            <div style={{ marginBottom: "0.75rem" }}>
              <label style={s.label}>Tên chuỗi</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} style={s.field} />
            </div>
            <div style={{ marginBottom: "0.75rem" }}>
              <label style={s.label}>Mô tả</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} style={{ ...s.textarea, height: "60px" }} />
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label style={s.label}>Trạng thái</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ ...s.select, maxWidth: "180px" }}>
                <option value="active">Đang kích hoạt</option>
                <option value="paused">Tạm dừng</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <button onClick={saveSeq} disabled={saving} style={{ ...s.btnPrimary, fontSize: "12.5px" }}>{saving ? "Đang lưu..." : "Lưu"}</button>
              <button onClick={() => setEditingSeq(false)} style={s.btnSecondary}>Hủy</button>
              {msg && <span style={{ fontSize: "12px", color: msg.startsWith("Đã") ? A.primary : A.danger }}>{msg}</span>}
            </div>
          </div>
        )}
      </div>

      {/* Steps */}
      <div style={{ background: "#fff", border: `1px solid ${A.border}`, borderRadius: "10px", padding: "1.25rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: A.text }}>Các email trong chuỗi ({steps.length})</p>
          {!addingStep && !editStep && (
            <button onClick={() => setAddingStep(true)} style={{ ...s.btnPrimary, fontSize: "12px", padding: "6px 14px" }}>+ Thêm email</button>
          )}
        </div>

        {loadingSteps ? (
          <p style={{ fontSize: "13px", color: A.textMuted }}>Đang tải...</p>
        ) : steps.length === 0 && !addingStep ? (
          <p style={{ fontSize: "13px", color: A.textLight, fontStyle: "italic" }}>Chưa có email nào trong chuỗi này.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
            {steps.map((step, idx) => (
              <div key={step.id}>
                {editStep?.id === step.id ? (
                  <StepForm initial={step} sequenceId={seq.id} adminKey={adminKey} onSaved={onStepSaved} onCancel={() => setEditStep(null)} />
                ) : (
                  <div style={{ padding: "10px 12px", borderRadius: "8px", border: `1px solid ${A.border}`, background: A.bg, display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                    <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: A.primary, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, flexShrink: 0 }}>
                      {idx + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: "0 0 2px", fontSize: "13.5px", fontWeight: 600, color: A.text }}>{step.subject}</p>
                      <p style={{ margin: 0, fontSize: "11.5px", color: A.textMuted }}>
                        {step.delayDays === 0 ? "Gửi ngay khi đăng ký" : `Gửi sau ${step.delayDays} ngày`}
                        {!step.isActive && <span style={{ marginLeft: "8px", color: "#ea580c" }}>· Tắt</span>}
                      </p>
                      {step.contentBody && (
                        <p style={{ margin: "4px 0 0", fontSize: "12px", color: A.textLight, lineHeight: 1.5, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>
                          {step.contentBody}
                        </p>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
                      <button onClick={() => { setEditStep(step); setAddingStep(false); }} style={{ ...s.btnGhost, fontSize: "11px" }}>Sửa</button>
                      <button onClick={() => deleteStep(step.id)} style={{ ...s.btnDanger, padding: "4px 10px", fontSize: "11px" }}>Xoá</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {addingStep && (
          <StepForm sequenceId={seq.id} adminKey={adminKey} onSaved={onStepSaved} onCancel={() => setAddingStep(false)} />
        )}
      </div>
    </div>
  );
}

/* ── Main panel ────────────────────────────────────────────────────── */
export function EmailSequencesPanel({ adminKey }: { adminKey: string }) {
  const [sequences, setSequences] = useState<EmailSequence[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [selected,  setSelected]  = useState<EmailSequence | null>(null);
  const [creating,  setCreating]  = useState(false);

  // Create form state
  const [newTitle,   setNewTitle]   = useState("");
  const [newDesc,    setNewDesc]    = useState("");
  const [newTrigger, setNewTrigger] = useState("on_subscribe");
  const [newSaving,  setNewSaving]  = useState(false);
  const [newMsg,     setNewMsg]     = useState("");

  const load = async () => {
    setLoading(true);
    try { setSequences(await adminApi.getSequences(adminKey)); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, []);

  const createSeq = async () => {
    if (!newTitle.trim()) { setNewMsg("Tên chuỗi là bắt buộc."); return; }
    setNewSaving(true); setNewMsg("");
    try {
      const created = await adminApi.createSequence(adminKey, { title: newTitle, description: newDesc, triggerType: newTrigger });
      setSequences((prev) => [created, ...prev]);
      setCreating(false);
      setSelected(created);
      setNewTitle(""); setNewDesc(""); setNewTrigger("on_subscribe");
    } catch (e) { setNewMsg(String(e)); }
    finally { setNewSaving(false); }
  };

  const deleteSeq = async (id: number) => {
    if (!confirm("Xoá chuỗi email này và tất cả bước email trong đó?")) return;
    try {
      await adminApi.deleteSequence(adminKey, id);
      setSequences((prev) => prev.filter((s) => s.id !== id));
      if (selected?.id === id) setSelected(null);
    } catch (e) { alert(String(e)); }
  };

  if (selected) {
    return (
      <SequenceDetail
        seq={selected}
        adminKey={adminKey}
        onUpdated={(updated) => { setSequences((prev) => prev.map((s) => s.id === updated.id ? updated : s)); setSelected(updated); }}
        onBack={() => setSelected(null)}
      />
    );
  }

  return (
    <div>
      <div style={s.sectionHeader}>
        <h2 style={s.sectionTitle}>Chuỗi email tự động</h2>
        <button onClick={() => setCreating(!creating)} style={s.btnPrimary}>+ Tạo chuỗi</button>
      </div>

      {/* Create form */}
      {creating && (
        <div style={{ background: "#fff", border: `1px solid ${A.border}`, borderRadius: "10px", padding: "1.25rem", marginBottom: "1.25rem" }}>
          <p style={{ ...s.label, marginBottom: "1rem" }}>Chuỗi email mới</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxWidth: "500px" }}>
            <div>
              <label style={s.label}>Tên chuỗi *</label>
              <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} style={s.field} placeholder="Ví dụ: Chuỗi chào mừng người đăng ký mới" />
            </div>
            <div>
              <label style={s.label}>Mô tả</label>
              <textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} style={{ ...s.textarea, height: "60px" }} placeholder="Mô tả ngắn về mục tiêu của chuỗi này..." />
            </div>
            <div>
              <label style={s.label}>Kích hoạt khi</label>
              <select value={newTrigger} onChange={(e) => setNewTrigger(e.target.value)} style={{ ...s.select, maxWidth: "250px" }}>
                <option value="on_subscribe">Người dùng đăng ký mới</option>
                <option value="manual">Thủ công</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <button onClick={createSeq} disabled={newSaving} style={{ ...s.btnPrimary, fontSize: "12.5px" }}>{newSaving ? "Đang tạo..." : "Tạo chuỗi"}</button>
              <button onClick={() => setCreating(false)} style={s.btnSecondary}>Hủy</button>
              {newMsg && <span style={{ fontSize: "12px", color: A.danger }}>{newMsg}</span>}
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <p style={{ fontSize: "13px", color: A.textMuted }}>Đang tải...</p>
      ) : sequences.length === 0 ? (
        <div style={{ background: "#fff", border: `1px solid ${A.border}`, borderRadius: "10px", padding: "2.5rem", textAlign: "center" }}>
          <p style={{ fontSize: "14px", color: A.textMuted, margin: "0 0 1rem" }}>Chưa có chuỗi email nào.</p>
          <p style={{ fontSize: "13px", color: A.textLight, margin: "0 0 1.25rem", lineHeight: 1.65 }}>
            Tạo chuỗi email tự động để nuôi dưỡng mối quan hệ với người đăng ký — từ email chào mừng đến những chia sẻ định kỳ.
          </p>
          <button onClick={() => setCreating(true)} style={s.btnPrimary}>Tạo chuỗi đầu tiên</button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {sequences.map((seq) => (
            <div key={seq.id} style={{ background: "#fff", border: `1px solid ${A.border}`, borderRadius: "10px", padding: "1.125rem 1.25rem", display: "flex", alignItems: "center", gap: "1rem", cursor: "pointer" }} onClick={() => setSelected(seq)}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: A.text }}>{seq.title}</p>
                  <SeqStatusBadge status={seq.status} />
                </div>
                <p style={{ margin: 0, fontSize: "12px", color: A.textMuted }}>
                  {TRIGGER_LABELS[seq.triggerType ?? ""] ?? seq.triggerType}
                  {seq.description && <span style={{ marginLeft: "10px", color: A.textLight }}>· {seq.description}</span>}
                </p>
              </div>
              <div style={{ display: "flex", gap: "6px", flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                <button onClick={() => setSelected(seq)} style={{ ...s.btnSecondary, fontSize: "12px" }}>Xem chi tiết</button>
                <button onClick={() => deleteSeq(seq.id)} style={{ ...s.btnDanger, padding: "5px 10px", fontSize: "11px" }}>Xoá</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
