import React, { useState, useEffect } from "react";
import { adminApi, type EmailCampaign } from "@/lib/newsApi";
import { A, s, fmtDate, fmtDateTime } from "./shared";

const CAMPAIGN_STATUS: Record<string, { label: string; color: string }> = {
  draft: { label: "Bản nháp", color: "#6b7280" },
  sent:  { label: "Đã gửi",   color: "#16a34a" },
  scheduled: { label: "Đã lên lịch", color: "#ea580c" },
};

function CampaignBadge({ status }: { status: string }) {
  const m = CAMPAIGN_STATUS[status] ?? { label: status, color: A.textMuted };
  return (
    <span style={{ fontSize: "11px", fontWeight: 600, color: m.color, background: `${m.color}12`, padding: "2px 8px", borderRadius: "5px", border: `1px solid ${m.color}22` }}>
      {m.label}
    </span>
  );
}

/* ── Campaign form (create / edit) ─────────────────────────────────── */
function CampaignForm({
  initial, adminKey, onSaved, onCancel,
}: { initial?: EmailCampaign | null; adminKey: string; onSaved: (c: EmailCampaign) => void; onCancel: () => void }) {
  const [title,       setTitle]       = useState(initial?.title ?? "");
  const [subject,     setSubject]     = useState(initial?.subject ?? "");
  const [previewText, setPreviewText] = useState(initial?.previewText ?? "");
  const [contentBody, setContentBody] = useState(initial?.contentBody ?? "");
  const [targetType,  setTargetType]  = useState(initial?.targetType ?? "all");
  const [saving,      setSaving]      = useState(false);
  const [msg,         setMsg]         = useState("");

  // Test send state
  const [testEmail,   setTestEmail]   = useState("");
  const [testMsg,     setTestMsg]     = useState("");
  const [testSending, setTestSending] = useState(false);

  // Send campaign state
  const [sending,     setSending]     = useState(false);
  const [confirmSend, setConfirmSend] = useState(false);

  const isEdit = !!initial;
  const isSent = initial?.status === "sent";

  const save = async () => {
    if (!title.trim() || !subject.trim()) { setMsg("Vui lòng nhập tiêu đề và tiêu đề email."); return; }
    setSaving(true); setMsg("");
    try {
      let saved: EmailCampaign;
      if (isEdit && initial) {
        saved = await adminApi.updateCampaign(adminKey, initial.id, { title, subject, previewText, contentBody, targetType });
      } else {
        saved = await adminApi.createCampaign(adminKey, { title, subject, previewText, contentBody, targetType });
      }
      onSaved(saved);
      setMsg("Đã lưu bản nháp.");
    } catch (e) { setMsg(String(e)); }
    finally { setSaving(false); }
  };

  const sendTest = async () => {
    if (!testEmail.trim()) return;
    setTestSending(true); setTestMsg("");
    try {
      const r = await adminApi.testCampaign(adminKey, initial!.id, testEmail.trim());
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
    <div style={{ maxWidth: "680px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h2 style={{ ...s.sectionTitle, marginBottom: "4px" }}>{isEdit ? "Chỉnh sửa chiến dịch" : "Tạo chiến dịch mới"}</h2>
          {isEdit && <p style={{ margin: 0, fontSize: "12.5px", color: A.textMuted }}>ID #{initial!.id} · {fmtDate(initial!.createdAt)}</p>}
        </div>
        <button onClick={onCancel} style={s.btnSecondary}>← Quay lại</button>
      </div>

      {isSent && (
        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", padding: "10px 14px", marginBottom: "1.25rem", fontSize: "13px", color: "#15803d" }}>
          Chiến dịch này đã được gửi vào {fmtDateTime(initial!.sentAt)} — {initial!.recipientCount ?? 0} người nhận.
        </div>
      )}

      {/* Form fields */}
      <div style={{ background: "#fff", border: `1px solid ${A.border}`, borderRadius: "10px", padding: "1.5rem", marginBottom: "1rem" }}>
        <div style={{ marginBottom: "1rem" }}>
          <label style={s.label}>Tiêu đề chiến dịch (nội bộ) *</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} style={s.field} placeholder="Ví dụ: Newsletter tháng 4 năm 2026" disabled={isSent} />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label style={s.label}>Tiêu đề email (Subject) *</label>
          <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} style={s.field} placeholder="Tiêu đề email người nhận thấy" disabled={isSent} />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label style={s.label}>Preview text</label>
          <input type="text" value={previewText} onChange={(e) => setPreviewText(e.target.value)} style={s.field} placeholder="Dòng tóm tắt hiển thị dưới tiêu đề (không bắt buộc)" disabled={isSent} />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label style={s.label}>Nội dung email</label>
          <textarea
            value={contentBody} onChange={(e) => setContentBody(e.target.value)}
            style={{ ...s.textarea, height: "220px", fontSize: "13px" }}
            placeholder={"Nội dung email...\n\nNgăn cách đoạn văn bằng dòng trống.\nMỗi đoạn văn sẽ được hiển thị riêng."}
            disabled={isSent}
          />
          <p style={{ margin: "5px 0 0", fontSize: "11px", color: A.textLight }}>Mỗi đoạn văn cách nhau bằng dòng trống. Hệ thống tự tạo HTML branded.</p>
        </div>
        <div style={{ marginBottom: "0" }}>
          <label style={s.label}>Đối tượng nhận</label>
          <select value={targetType} onChange={(e) => setTargetType(e.target.value)} style={s.select} disabled={isSent}>
            <option value="all">Tất cả người đăng ký</option>
            <option value="tagged">Theo thẻ</option>
          </select>
        </div>
      </div>

      {/* Actions */}
      {!isSent && (
        <div style={{ display: "flex", gap: "0.625rem", alignItems: "center", flexWrap: "wrap", marginBottom: "1.25rem" }}>
          <button onClick={save} disabled={saving} style={s.btnPrimary}>{saving ? "Đang lưu..." : "Lưu bản nháp"}</button>

          {isEdit && (
            confirmSend ? (
              <>
                <button onClick={sendCampaign} disabled={sending} style={{ ...s.btnPrimary, background: "#16a34a" }}>{sending ? "Đang gửi..." : `Xác nhận gửi`}</button>
                <button onClick={() => setConfirmSend(false)} style={s.btnSecondary}>Hủy</button>
              </>
            ) : (
              <button onClick={() => setConfirmSend(true)} style={{ ...s.btnSecondary, color: "#16a34a", borderColor: "#16a34a44" }}>Gửi chiến dịch</button>
            )
          )}

          {msg && <span style={{ fontSize: "12.5px", color: msg.startsWith("Đang") || msg.startsWith("Đã") ? A.primary : A.danger }}>{msg}</span>}
        </div>
      )}

      {/* Test send — only available after saving */}
      {isEdit && !isSent && (
        <div style={{ background: "#fff", border: `1px solid ${A.border}`, borderRadius: "10px", padding: "1.25rem" }}>
          <p style={{ ...s.label, marginBottom: "0.75rem" }}>Gửi email thử nghiệm</p>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <input
              type="email" value={testEmail} onChange={(e) => setTestEmail(e.target.value)}
              placeholder="email@example.com"
              style={{ ...s.field, maxWidth: "250px", height: "34px", padding: "0 10px", fontSize: "13px" }}
            />
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

/* ── Main panel ────────────────────────────────────────────────────── */
export function EmailCampaignsPanel({ adminKey }: { adminKey: string }) {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [editing,   setEditing]   = useState<EmailCampaign | null | "new">(null);

  const load = async () => {
    setLoading(true);
    try { setCampaigns(await adminApi.getCampaigns(adminKey)); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, []);

  const onSaved = (c: EmailCampaign) => {
    setCampaigns((prev) => {
      const idx = prev.findIndex((x) => x.id === c.id);
      return idx >= 0 ? prev.map((x, i) => i === idx ? c : x) : [c, ...prev];
    });
    if (editing === "new") setEditing(c);
    else setEditing(c);
  };

  const deleteCampaign = async (id: number) => {
    if (!confirm("Xoá chiến dịch này?")) return;
    try {
      await adminApi.deleteCampaign(adminKey, id);
      setCampaigns((prev) => prev.filter((c) => c.id !== id));
      if (typeof editing === "object" && editing?.id === id) setEditing(null);
    } catch (e) { alert(String(e)); }
  };

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

  return (
    <div>
      <div style={s.sectionHeader}>
        <h2 style={s.sectionTitle}>Chiến dịch email</h2>
        <button onClick={() => setEditing("new")} style={s.btnPrimary}>+ Tạo chiến dịch</button>
      </div>

      {loading ? (
        <p style={{ fontSize: "13px", color: A.textMuted }}>Đang tải...</p>
      ) : campaigns.length === 0 ? (
        <div style={{ background: "#fff", border: `1px solid ${A.border}`, borderRadius: "10px", padding: "2.5rem", textAlign: "center" }}>
          <p style={{ fontSize: "14px", color: A.textMuted, margin: "0 0 1rem" }}>Chưa có chiến dịch nào.</p>
          <button onClick={() => setEditing("new")} style={s.btnPrimary}>Tạo chiến dịch đầu tiên</button>
        </div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: "10px", border: `1px solid ${A.border}`, overflow: "hidden" }}>
          <thead>
            <tr>
              <th style={s.th}>Tiêu đề</th>
              <th style={s.th}>Tiêu đề email</th>
              <th style={s.th}>Trạng thái</th>
              <th style={s.th}>Người nhận</th>
              <th style={s.th}>Ngày gửi</th>
              <th style={s.th}></th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c) => (
              <tr key={c.id} style={{ cursor: "pointer" }} onClick={() => setEditing(c)}>
                <td style={{ ...s.td, fontWeight: 600 }}>{c.title}</td>
                <td style={{ ...s.td, color: A.textMuted, maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.subject}</td>
                <td style={s.td}><CampaignBadge status={c.status} /></td>
                <td style={{ ...s.td, textAlign: "center" }}>{c.recipientCount ?? "—"}</td>
                <td style={{ ...s.td, fontSize: "12px" }}>{c.sentAt ? fmtDate(c.sentAt) : <span style={{ color: A.textLight }}>Chưa gửi</span>}</td>
                <td style={{ ...s.td, textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
                  {c.status === "draft" && (
                    <button onClick={() => deleteCampaign(c.id)} style={s.btnDanger}>Xoá</button>
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
