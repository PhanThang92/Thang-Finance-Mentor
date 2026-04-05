import React, { useState, useEffect, useCallback } from "react";
import { adminApi, type EmailCampaign } from "@/lib/newsApi";
import { A, s, fmtDate, fmtDateTime } from "./shared";

/* ─── Constants ─────────────────────────────────────────────────────── */

const CAMPAIGN_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  draft:     { label: "Bản nháp",     color: "#6b7280", bg: "#f9fafb" },
  sent:      { label: "Đã gửi",       color: "#16a34a", bg: "#f0fdf4" },
  scheduled: { label: "Đã lên lịch", color: "#ea580c", bg: "#fff7ed" },
};

const TARGET_TYPES = [
  { value: "all",         label: "Tất cả người đăng ký" },
  { value: "subscribed",  label: "Chỉ đang đăng ký (active)" },
  { value: "stage",       label: "Theo stage" },
  { value: "source",      label: "Theo nguồn" },
  { value: "interest",    label: "Theo quan tâm" },
  { value: "tagged",      label: "Theo thẻ (tags)" },
];

const STAGE_OPTIONS = [
  { value: "new_lead",  label: "Lead mới" },
  { value: "nurturing", label: "Đang nuôi dưỡng" },
  { value: "engaged",   label: "Đang tương tác" },
  { value: "hot_lead",  label: "Lead nóng" },
  { value: "customer",  label: "Khách hàng" },
  { value: "inactive",  label: "Không hoạt động" },
];

const SOURCE_OPTIONS = [
  { value: "homepage",   label: "Trang chủ" },
  { value: "bai-viet",   label: "Bài viết" },
  { value: "cong-dong",  label: "Cộng đồng" },
  { value: "video",      label: "Video" },
  { value: "tai-lieu",   label: "Tài liệu" },
  { value: "lien-he",    label: "Liên hệ" },
];

const INTEREST_OPTIONS = [
  { value: "ky_luat_tai_chinh",    label: "Kỷ luật tài chính" },
  { value: "dau_tu_dai_han",       label: "Đầu tư dài hạn" },
  { value: "swc",                  label: "SWC" },
  { value: "con_duong_1_trieu_do", label: "Con đường 1 triệu đô" },
];

/* ─── Badge ──────────────────────────────────────────────────────────── */
function CampaignBadge({ status }: { status: string }) {
  const m = CAMPAIGN_STATUS[status] ?? { label: status, color: A.textMuted, bg: A.bg };
  return (
    <span style={{ fontSize: "11px", fontWeight: 600, color: m.color, background: m.bg, padding: "2px 8px", borderRadius: "5px", border: `1px solid ${m.color}22` }}>
      {m.label}
    </span>
  );
}

/* ─── Audience targeting section ────────────────────────────────────── */
function AudienceSection({
  targetType, setTargetType,
  targetStage, setTargetStage,
  targetSource, setTargetSource,
  targetInterest, setTargetInterest,
  targetTagsRaw, setTargetTagsRaw,
  previewCount, previewLoading,
  disabled,
}: {
  targetType: string; setTargetType: (v: string) => void;
  targetStage: string; setTargetStage: (v: string) => void;
  targetSource: string; setTargetSource: (v: string) => void;
  targetInterest: string; setTargetInterest: (v: string) => void;
  targetTagsRaw: string; setTargetTagsRaw: (v: string) => void;
  previewCount: number | null; previewLoading: boolean;
  disabled?: boolean;
}) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
        <label style={s.label}>Đối tượng nhận</label>
        {previewLoading ? (
          <span style={{ fontSize: "11px", color: A.textMuted }}>Đang tính...</span>
        ) : previewCount !== null ? (
          <span style={{ fontSize: "11.5px", fontWeight: 600, color: A.primary, background: `${A.primary}0F`, padding: "2px 8px", borderRadius: "5px" }}>
            ~{previewCount} người nhận
          </span>
        ) : null}
      </div>
      <select value={targetType} onChange={(e) => setTargetType(e.target.value)} style={s.select} disabled={disabled}>
        {TARGET_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
      </select>
      {targetType === "stage" && (
        <div style={{ marginTop: "8px" }}>
          <label style={s.label}>Stage</label>
          <select value={targetStage} onChange={(e) => setTargetStage(e.target.value)} style={s.select} disabled={disabled}>
            <option value="">-- Chọn stage --</option>
            {STAGE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      )}
      {targetType === "source" && (
        <div style={{ marginTop: "8px" }}>
          <label style={s.label}>Nguồn</label>
          <select value={targetSource} onChange={(e) => setTargetSource(e.target.value)} style={s.select} disabled={disabled}>
            <option value="">-- Chọn nguồn --</option>
            {SOURCE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      )}
      {targetType === "interest" && (
        <div style={{ marginTop: "8px" }}>
          <label style={s.label}>Quan tâm</label>
          <select value={targetInterest} onChange={(e) => setTargetInterest(e.target.value)} style={s.select} disabled={disabled}>
            <option value="">-- Chọn chủ đề --</option>
            {INTEREST_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      )}
      {targetType === "tagged" && (
        <div style={{ marginTop: "8px" }}>
          <label style={s.label}>Tags (phân cách bằng dấu phẩy)</label>
          <input value={targetTagsRaw} onChange={(e) => setTargetTagsRaw(e.target.value)} style={s.field} placeholder="newsletter, stage_hot, ..." disabled={disabled} />
        </div>
      )}
    </div>
  );
}

/* ─── Campaign form ─────────────────────────────────────────────────── */
function CampaignForm({
  initial, adminKey, onSaved, onCancel,
}: { initial?: EmailCampaign | null; adminKey: string; onSaved: (c: EmailCampaign) => void; onCancel: () => void }) {
  const [title,          setTitle]          = useState(initial?.title ?? "");
  const [subject,        setSubject]        = useState(initial?.subject ?? "");
  const [previewText,    setPreviewText]    = useState(initial?.previewText ?? "");
  const [contentBody,    setContentBody]    = useState(initial?.contentBody ?? "");
  const [targetType,     setTargetType]     = useState(initial?.targetType ?? "all");
  const [targetStage,    setTargetStage]    = useState(initial?.targetStage ?? "");
  const [targetSource,   setTargetSource]   = useState(initial?.targetSource ?? "");
  const [targetInterest, setTargetInterest] = useState(initial?.targetInterest ?? "");
  const [targetTagsRaw,  setTargetTagsRaw]  = useState((initial?.targetTags ?? []).join(", "));

  const [saving,       setSaving]       = useState(false);
  const [msg,          setMsg]          = useState("");
  const [testEmail,    setTestEmail]    = useState("");
  const [testMsg,      setTestMsg]      = useState("");
  const [testSending,  setTestSending]  = useState(false);
  const [sending,      setSending]      = useState(false);
  const [confirmSend,  setConfirmSend]  = useState(false);
  const [previewCount, setPreviewCount] = useState<number | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const isEdit = !!initial;
  const isSent = initial?.status === "sent";

  // Preview count debounce
  useEffect(() => {
    if (isSent || !adminKey) return;
    setPreviewLoading(true);
    const t = setTimeout(async () => {
      try {
        const count = await adminApi.getCampaignPreviewCount(adminKey, {
          targetType,
          targetStage:    targetType === "stage"    ? targetStage    : undefined,
          targetSource:   targetType === "source"   ? targetSource   : undefined,
          targetInterest: targetType === "interest" ? targetInterest : undefined,
        });
        setPreviewCount(count);
      } catch { setPreviewCount(null); }
      finally { setPreviewLoading(false); }
    }, 600);
    return () => clearTimeout(t);
  }, [targetType, targetStage, targetSource, targetInterest, adminKey, isSent]);

  const buildPayload = () => ({
    title: title.trim(),
    subject: subject.trim(),
    previewText: previewText.trim() || null,
    contentBody: contentBody.trim() || null,
    targetType,
    targetStage:    targetType === "stage"    ? (targetStage    || null) : null,
    targetSource:   targetType === "source"   ? (targetSource   || null) : null,
    targetInterest: targetType === "interest" ? (targetInterest || null) : null,
    targetTags:     targetType === "tagged"   ? targetTagsRaw.split(",").map((t) => t.trim()).filter(Boolean) : null,
  });

  const save = async () => {
    if (!title.trim() || !subject.trim()) { setMsg("Vui lòng nhập tiêu đề nội bộ và tiêu đề email."); return; }
    setSaving(true); setMsg("");
    try {
      let saved: EmailCampaign;
      if (isEdit && initial) {
        saved = await adminApi.updateCampaign(adminKey, initial.id, buildPayload());
      } else {
        saved = await adminApi.createCampaign(adminKey, buildPayload());
      }
      onSaved(saved);
      setMsg("Đã lưu bản nháp.");
    } catch (e) { setMsg(String(e)); }
    finally { setSaving(false); }
  };

  const sendTest = async () => {
    if (!testEmail.trim() || !initial) return;
    setTestSending(true); setTestMsg("");
    try {
      const r = await adminApi.testCampaign(adminKey, initial.id, testEmail.trim());
      setTestMsg(r.ok ? "Email thử nghiệm đã được gửi." : `Lỗi: ${r.error ?? "unknown"}`);
    } catch (e) { setTestMsg(String(e)); }
    finally { setTestSending(false); }
  };

  const sendCampaign = async () => {
    if (!initial) return;
    setSending(true); setMsg("");
    try {
      const r = await adminApi.sendCampaign(adminKey, initial.id);
      if (r.ok) {
        setMsg(`Đang gửi đến ${r.recipientCount ?? "?"} người đăng ký.`);
        onSaved({ ...initial, status: "sent" });
      } else {
        setMsg(r.error ?? "Không thể gửi.");
      }
    } catch (e) { setMsg(String(e)); }
    finally { setSending(false); setConfirmSend(false); }
  };

  return (
    <div style={{ maxWidth: "720px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h2 style={{ ...s.sectionTitle, marginBottom: "4px" }}>{isEdit ? "Chỉnh sửa chiến dịch" : "Tạo chiến dịch mới"}</h2>
          {isEdit && <p style={{ margin: 0, fontSize: "12.5px", color: A.textMuted }}>ID #{initial!.id} · {fmtDate(initial!.createdAt)}</p>}
        </div>
        <button onClick={onCancel} style={s.btnSecondary}>← Quay lại</button>
      </div>

      {isSent && (
        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", padding: "10px 14px", marginBottom: "1.25rem", fontSize: "13px", color: "#15803d" }}>
          Chiến dịch đã gửi vào {fmtDateTime(initial!.sentAt)} — {initial!.recipientCount ?? 0} người nhận.
        </div>
      )}

      {/* Content card */}
      <div style={{ background: "#fff", border: `1px solid ${A.border}`, borderRadius: "10px", padding: "1.5rem", marginBottom: "1rem" }}>
        <p style={{ ...s.label, marginBottom: "1rem", letterSpacing: 0, textTransform: "none", fontSize: "12px", fontWeight: 600 }}>Nội dung email</p>
        <div style={{ marginBottom: "1rem" }}>
          <label style={s.label}>Tiêu đề chiến dịch (nội bộ) *</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} style={s.field} placeholder="Ví dụ: Newsletter tháng 4 — 2026" disabled={isSent} />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label style={s.label}>Tiêu đề email (Subject) *</label>
          <input value={subject} onChange={(e) => setSubject(e.target.value)} style={s.field} placeholder="Tiêu đề người nhận thấy" disabled={isSent} />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label style={s.label}>Preview text</label>
          <input value={previewText} onChange={(e) => setPreviewText(e.target.value)} style={s.field} placeholder="Dòng tóm tắt (không bắt buộc)" disabled={isSent} />
        </div>
        <div>
          <label style={s.label}>Nội dung email</label>
          <textarea
            value={contentBody} onChange={(e) => setContentBody(e.target.value)}
            style={{ ...s.textarea, height: "220px", fontSize: "13px" }}
            placeholder={"Nội dung email...\n\nNgăn cách đoạn văn bằng dòng trống.\nMỗi đoạn văn sẽ được hiển thị riêng biệt."}
            disabled={isSent}
          />
          <p style={{ margin: "4px 0 0", fontSize: "11px", color: A.textLight }}>Mỗi đoạn cách nhau bằng dòng trống. Hệ thống tự tạo HTML branded.</p>
        </div>
      </div>

      {/* Audience card */}
      <div style={{ background: "#fff", border: `1px solid ${A.border}`, borderRadius: "10px", padding: "1.5rem", marginBottom: "1rem" }}>
        <p style={{ ...s.label, marginBottom: "1rem", letterSpacing: 0, textTransform: "none", fontSize: "12px", fontWeight: 600 }}>Đối tượng nhận</p>
        <AudienceSection
          targetType={targetType} setTargetType={setTargetType}
          targetStage={targetStage} setTargetStage={setTargetStage}
          targetSource={targetSource} setTargetSource={setTargetSource}
          targetInterest={targetInterest} setTargetInterest={setTargetInterest}
          targetTagsRaw={targetTagsRaw} setTargetTagsRaw={setTargetTagsRaw}
          previewCount={previewCount} previewLoading={previewLoading}
          disabled={isSent}
        />
      </div>

      {/* Actions */}
      {!isSent && (
        <div style={{ display: "flex", gap: "0.625rem", alignItems: "center", flexWrap: "wrap", marginBottom: "1.25rem" }}>
          <button onClick={save} disabled={saving} style={s.btnPrimary}>{saving ? "Đang lưu..." : "Lưu bản nháp"}</button>
          {isEdit && (
            confirmSend ? (
              <>
                <button onClick={sendCampaign} disabled={sending} style={{ ...s.btnPrimary, background: "#16a34a" }}>
                  {sending ? "Đang gửi..." : `Xác nhận gửi ${previewCount != null ? `(${previewCount} người)` : ""}`}
                </button>
                <button onClick={() => setConfirmSend(false)} style={s.btnSecondary}>Hủy</button>
              </>
            ) : (
              <button onClick={() => setConfirmSend(true)} style={{ ...s.btnSecondary, color: "#16a34a", borderColor: "#16a34a44" }}>
                Gửi chiến dịch {previewCount != null ? `(~${previewCount})` : ""}
              </button>
            )
          )}
          {msg && <span style={{ fontSize: "12.5px", color: msg.startsWith("Đang") || msg.startsWith("Đã") ? A.primary : A.danger }}>{msg}</span>}
        </div>
      )}

      {/* Test send */}
      {isEdit && !isSent && (
        <div style={{ background: "#fff", border: `1px solid ${A.border}`, borderRadius: "10px", padding: "1.25rem" }}>
          <p style={{ ...s.label, marginBottom: "0.75rem" }}>Gửi email thử nghiệm</p>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <input type="email" value={testEmail} onChange={(e) => setTestEmail(e.target.value)} placeholder="email@example.com"
              style={{ ...s.field, maxWidth: "250px", height: "34px", padding: "0 10px", fontSize: "13px" }} />
            <button onClick={sendTest} disabled={testSending} style={{ ...s.btnSecondary, fontSize: "12px" }}>
              {testSending ? "Đang gửi..." : "Gửi thử"}
            </button>
            {testMsg && <span style={{ fontSize: "12px", color: testMsg.startsWith("Email") ? A.primary : A.danger }}>{testMsg}</span>}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Main panel ─────────────────────────────────────────────────────── */
export function EmailCampaignsPanel({ adminKey }: { adminKey: string }) {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [editing,   setEditing]   = useState<EmailCampaign | null | "new">(null);
  const [search,    setSearch]    = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [duplicating,  setDuplicating]  = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { setCampaigns(await adminApi.getCampaigns(adminKey)); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [adminKey]);

  useEffect(() => { void load(); }, [load]);

  const onSaved = (c: EmailCampaign) => {
    setCampaigns((prev) => {
      const idx = prev.findIndex((x) => x.id === c.id);
      return idx >= 0 ? prev.map((x, i) => i === idx ? c : x) : [c, ...prev];
    });
    setEditing(c);
  };

  const deleteCampaign = async (id: number) => {
    if (!window.confirm("Xoá chiến dịch này?")) return;
    try {
      await adminApi.deleteCampaign(adminKey, id);
      setCampaigns((prev) => prev.filter((c) => c.id !== id));
      if (typeof editing === "object" && editing?.id === id) setEditing(null);
    } catch (e) { alert(String(e)); }
  };

  const duplicateCampaign = async (id: number) => {
    setDuplicating(id);
    try {
      const dup = await adminApi.duplicateCampaign(adminKey, id);
      setCampaigns((prev) => [dup, ...prev]);
      setEditing(dup);
    } catch (e) { alert(String(e)); }
    finally { setDuplicating(null); }
  };

  const filtered = campaigns.filter((c) => {
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    if (search.trim() && !c.title.toLowerCase().includes(search.toLowerCase()) && !c.subject.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (editing !== null) {
    return (
      <CampaignForm
        initial={editing === "new" ? null : editing}
        adminKey={adminKey}
        onSaved={onSaved}
        onCancel={() => setEditing(null)}
      />
    );
  }

  const sent  = campaigns.filter((c) => c.status === "sent").length;
  const draft = campaigns.filter((c) => c.status === "draft").length;

  return (
    <div>
      <div style={s.sectionHeader}>
        <div>
          <h2 style={s.sectionTitle}>Chiến dịch email</h2>
          <p style={{ fontSize: "12px", color: A.textMuted, margin: "3px 0 0" }}>
            {campaigns.length} chiến dịch · {sent} đã gửi · {draft} bản nháp
          </p>
        </div>
        <button onClick={() => setEditing("new")} style={s.btnPrimary}>+ Tạo chiến dịch</button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "1rem", flexWrap: "wrap" }}>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm chiến dịch..." style={{ ...s.field, maxWidth: "220px" }} />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ ...s.select, maxWidth: "160px" }}>
          <option value="all">Tất cả trạng thái</option>
          {Object.entries(CAMPAIGN_STATUS).map(([v, m]) => <option key={v} value={v}>{m.label}</option>)}
        </select>
      </div>

      {loading ? (
        <p style={{ fontSize: "13px", color: A.textMuted }}>Đang tải...</p>
      ) : campaigns.length === 0 ? (
        <div style={{ background: "#fff", border: `1px solid ${A.border}`, borderRadius: "10px", padding: "2.5rem", textAlign: "center" }}>
          <p style={{ fontSize: "14px", color: A.textMuted, margin: "0 0 1rem" }}>Chưa có chiến dịch nào.</p>
          <button onClick={() => setEditing("new")} style={s.btnPrimary}>Tạo chiến dịch đầu tiên</button>
        </div>
      ) : filtered.length === 0 ? (
        <p style={{ fontSize: "13px", color: A.textMuted }}>Không tìm thấy chiến dịch nào phù hợp.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: "10px", border: `1px solid ${A.border}`, overflow: "hidden" }}>
          <thead>
            <tr>
              <th style={s.th}>Tiêu đề</th>
              <th style={s.th}>Subject</th>
              <th style={s.th}>Đối tượng</th>
              <th style={s.th}>Trạng thái</th>
              <th style={s.th}>Người nhận</th>
              <th style={s.th}>Ngày gửi</th>
              <th style={s.th}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} style={{ cursor: "pointer" }} onClick={() => setEditing(c)}>
                <td style={{ ...s.td, fontWeight: 600, maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.title}</td>
                <td style={{ ...s.td, color: A.textMuted, maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.subject}</td>
                <td style={s.td}>
                  <span style={{ fontSize: "11.5px", color: A.textMuted }}>
                    {TARGET_TYPES.find((t) => t.value === c.targetType)?.label ?? c.targetType ?? "all"}
                    {c.targetStage && ` · ${STAGE_OPTIONS.find((o) => o.value === c.targetStage)?.label ?? c.targetStage}`}
                  </span>
                </td>
                <td style={s.td}><CampaignBadge status={c.status} /></td>
                <td style={{ ...s.td, textAlign: "center" }}>{c.recipientCount ?? "—"}</td>
                <td style={{ ...s.td, fontSize: "12px" }}>
                  {c.sentAt ? fmtDate(c.sentAt) : <span style={{ color: A.textLight }}>Chưa gửi</span>}
                </td>
                <td style={{ ...s.td, textAlign: "right", whiteSpace: "nowrap" }} onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => duplicateCampaign(c.id)}
                    disabled={duplicating === c.id}
                    title="Nhân bản chiến dịch"
                    style={{ ...s.btnGhost, fontSize: "11.5px", marginRight: "4px" }}
                  >
                    {duplicating === c.id ? "..." : "Nhân bản"}
                  </button>
                  {c.status === "draft" && (
                    <button onClick={() => deleteCampaign(c.id)} style={{ ...s.btnGhost, color: A.danger, fontSize: "11.5px" }}>Xoá</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
