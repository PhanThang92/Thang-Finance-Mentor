import React, { useState, useEffect, useCallback, useRef } from "react";
import { adminApi, type LeadMagnet, type ResourceAnalytics } from "@/lib/newsApi";
import { A, s, fmtDate } from "./shared";

/* ── Constants ────────────────────────────────────────────────────── */
const TYPE_OPTIONS = [
  { value: "file",          label: "Tệp tải xuống" },
  { value: "gated_page",    label: "Nội dung mở khóa" },
  { value: "external_link", label: "Link ngoài" },
];
const GATE_OPTIONS = [
  { value: "public",           label: "Công khai" },
  { value: "email_unlock",     label: "Mở khóa bằng email" },
  { value: "lead_form_unlock", label: "Mở khóa bằng form đầy đủ" },
];
const DELIVERY_OPTIONS = [
  { value: "direct", label: "Tải trực tiếp" },
  { value: "email",  label: "Gửi qua email" },
  { value: "both",   label: "Cả hai" },
];
const STATUS_OPTIONS = [
  { value: "draft",     label: "Bản nháp" },
  { value: "published", label: "Đã xuất bản" },
  { value: "archived",  label: "Lưu trữ" },
];
const STATUS_COLORS: Record<string, string> = {
  draft:     A.textMuted,
  published: "#16a34a",
  archived:  "#9ca3af",
};

const EMPTY_FORM: Partial<LeadMagnet> = {
  title: "", slug: "", shortDescription: "", fullDescription: "",
  resourceType: "file", status: "draft", gatingMode: "email_unlock",
  deliveryMode: "direct", featured: false, requiresPhone: false,
  buttonLabel: "", thankYouMessage: "", ctaTitle: "", ctaDescription: "",
  seoTitle: "", seoDescription: "", coverImageUrl: "", coverImageAlt: "",
  fileUrl: "", fileName: "", externalUrl: "", topicSlug: "",
};

function autoSlug(title: string) {
  return title
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

/* ── Row ──────────────────────────────────────────────────────────── */
function ResourceRow({
  r, selected, onSelect,
}: { r: LeadMagnet; selected: boolean; onSelect: () => void }) {
  const statusColor = STATUS_COLORS[r.status] ?? A.textMuted;
  return (
    <tr
      onClick={onSelect}
      style={{
        cursor: "pointer",
        background: selected ? "rgba(26,120,104,0.06)" : "transparent",
        borderBottom: `1px solid ${A.border}`,
        transition: "background 0.1s",
      }}
    >
      <td style={{ padding: "11px 14px 11px 18px" }}>
        <p style={{ margin: 0, fontSize: "13.5px", fontWeight: 600, color: A.text, lineHeight: 1.35 }}>
          {r.title}
        </p>
        <p style={{ margin: "2px 0 0", fontSize: "11.5px", color: A.textMuted }}>/{r.slug}</p>
      </td>
      <td style={{ padding: "11px 10px", fontSize: "12px", color: A.textMuted, whiteSpace: "nowrap" }}>
        {TYPE_OPTIONS.find((t) => t.value === r.resourceType)?.label ?? r.resourceType}
      </td>
      <td style={{ padding: "11px 10px", whiteSpace: "nowrap" }}>
        <span style={{ fontSize: "12px", fontWeight: 600, color: statusColor }}>
          {STATUS_OPTIONS.find((x) => x.value === r.status)?.label ?? r.status}
        </span>
      </td>
      <td style={{ padding: "11px 10px", fontSize: "12px", color: A.textMuted, whiteSpace: "nowrap" }}>
        {GATE_OPTIONS.find((g) => g.value === r.gatingMode)?.label ?? r.gatingMode}
      </td>
      <td style={{ padding: "11px 10px", textAlign: "center" }}>
        {r.featured && <span style={{ color: A.primary, fontSize: "13px" }}>★</span>}
      </td>
      <td style={{ padding: "11px 14px 11px 10px", fontSize: "11.5px", color: A.textMuted, whiteSpace: "nowrap" }}>
        {fmtDate(r.updatedAt)}
      </td>
    </tr>
  );
}

/* ── Form ─────────────────────────────────────────────────────────── */
function FieldGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "24px" }}>
      <p style={{ ...s.label, marginBottom: "12px", color: A.primary }}>{title}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>{children}</div>
    </div>
  );
}

function Row2({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={s.label}>{label}</label>
      {children}
    </div>
  );
}

function ResourceForm({
  adminKey, initial, mode, onDone, onCancel,
}: {
  adminKey: string;
  initial: Partial<LeadMagnet>;
  mode: "create" | "edit";
  onDone: () => void;
  onCancel: () => void;
}) {
  const [form, setForm]         = useState<Partial<LeadMagnet>>({ ...EMPTY_FORM, ...initial });
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const fileRef = useRef<HTMLInputElement>(null);

  const upd = (patch: Partial<LeadMagnet>) => setForm((f) => ({ ...f, ...patch }));

  const handleTitle = (v: string) => {
    upd({ title: v, ...(!slugTouched ? { slug: autoSlug(v) } : {}) });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const res = await adminApi.uploadResourceFile(adminKey, file);
      upd({ fileUrl: res.url, fileName: res.fileName, fileSize: res.fileSize, fileMimeType: res.fileMimeType });
    } catch (err) {
      setError("Lỗi khi tải tệp: " + String(err).replace("Error: ", ""));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleSave = async (targetStatus?: string) => {
    if (!form.title?.trim()) { setError("Tiêu đề không được để trống"); return; }
    if (!form.slug?.trim())  { setError("Đường dẫn tĩnh không được để trống"); return; }
    setSaving(true);
    setError(null);
    try {
      const payload = { ...form, ...(targetStatus ? { status: targetStatus } : {}) };
      if (mode === "create") {
        await adminApi.createResource(adminKey, payload);
      } else {
        await adminApi.updateResource(adminKey, initial.id!, payload);
      }
      onDone();
    } catch (err) {
      setError(String(err).replace("Error: ", ""));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ padding: "18px 20px", borderBottom: `1px solid ${A.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
        <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: A.text }}>
          {mode === "create" ? "Tạo tài liệu mới" : "Chỉnh sửa tài liệu"}
        </p>
        <button onClick={onCancel} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: A.textMuted, lineHeight: 1 }}>×</button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
        <FieldGroup title="Thông tin cơ bản">
          <Field label="Tiêu đề *">
            <input style={s.field} value={form.title ?? ""} onChange={(e) => handleTitle(e.target.value)} placeholder="VD: Checklist đầu tư dài hạn" />
          </Field>
          <Field label="Đường dẫn tĩnh (slug) *">
            <input
              style={s.field}
              value={form.slug ?? ""}
              onChange={(e) => { setSlugTouched(true); upd({ slug: e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") }); }}
              placeholder="checklist-dau-tu-dai-han"
            />
          </Field>
          <Row2>
            <Field label="Loại tài liệu">
              <select style={s.select} value={form.resourceType ?? "file"} onChange={(e) => upd({ resourceType: e.target.value })}>
                {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Field>
            <Field label="Trạng thái">
              <select style={s.select} value={form.status ?? "draft"} onChange={(e) => upd({ status: e.target.value })}>
                {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Field>
          </Row2>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13.5px", color: A.text }}>
            <input type="checkbox" checked={Boolean(form.featured)} onChange={(e) => upd({ featured: e.target.checked })} />
            Tài liệu nổi bật (hiển thị ở trang chủ)
          </label>
        </FieldGroup>

        <FieldGroup title="Nội dung">
          <Field label="Mô tả ngắn">
            <textarea style={{ ...s.textarea, minHeight: "70px" }} value={form.shortDescription ?? ""} onChange={(e) => upd({ shortDescription: e.target.value })} placeholder="Mô tả ngắn gọn về tài liệu này..." />
          </Field>
          <Field label="Mô tả chi tiết">
            <textarea style={{ ...s.textarea, minHeight: "120px" }} value={form.fullDescription ?? ""} onChange={(e) => upd({ fullDescription: e.target.value })} placeholder="Nội dung chi tiết, danh sách lợi ích, hướng dẫn sử dụng..." />
          </Field>
        </FieldGroup>

        <FieldGroup title="Hình ảnh bìa">
          <Field label="URL ảnh bìa">
            <input style={s.field} value={form.coverImageUrl ?? ""} onChange={(e) => upd({ coverImageUrl: e.target.value })} placeholder="/api/uploads/disp/xxx.webp" />
          </Field>
          <Field label="Alt ảnh bìa">
            <input style={s.field} value={form.coverImageAlt ?? ""} onChange={(e) => upd({ coverImageAlt: e.target.value })} placeholder="Mô tả ảnh bìa" />
          </Field>
        </FieldGroup>

        <FieldGroup title="Tệp / Liên kết">
          {/* File upload */}
          <Field label="Tải tệp lên (PDF, DOCX, XLSX, v.v.)">
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.csv,.txt,.zip"
                onChange={handleFileUpload}
                style={{ fontSize: "13px", color: A.text }}
              />
              {uploading && <p style={{ margin: 0, fontSize: "12px", color: A.primary }}>Đang tải lên...</p>}
              {form.fileUrl && (
                <p style={{ margin: 0, fontSize: "12px", color: A.textMuted }}>
                  ✓ <a href={form.fileUrl} target="_blank" rel="noopener noreferrer" style={{ color: A.primary }}>{form.fileName ?? form.fileUrl}</a>
                  {form.fileSize ? ` (${(form.fileSize / 1024).toFixed(0)} KB)` : ""}
                </p>
              )}
            </div>
          </Field>
          <Field label="Hoặc dán URL tệp trực tiếp">
            <input style={s.field} value={form.fileUrl ?? ""} onChange={(e) => upd({ fileUrl: e.target.value })} placeholder="/api/uploads/resources/uuid.pdf" />
          </Field>
          <Row2>
            <Field label="Tên tệp (hiển thị)">
              <input style={s.field} value={form.fileName ?? ""} onChange={(e) => upd({ fileName: e.target.value })} placeholder="checklist.pdf" />
            </Field>
            <Field label="Link ngoài (nếu không dùng tệp)">
              <input style={s.field} value={form.externalUrl ?? ""} onChange={(e) => upd({ externalUrl: e.target.value })} placeholder="https://..." />
            </Field>
          </Row2>
        </FieldGroup>

        <FieldGroup title="Hình thức mở khóa & nhận tài liệu">
          <Row2>
            <Field label="Hình thức mở khóa">
              <select style={s.select} value={form.gatingMode ?? "email_unlock"} onChange={(e) => upd({ gatingMode: e.target.value })}>
                {GATE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Field>
            <Field label="Hình thức nhận tài liệu">
              <select style={s.select} value={form.deliveryMode ?? "direct"} onChange={(e) => upd({ deliveryMode: e.target.value })}>
                {DELIVERY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Field>
          </Row2>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13.5px", color: A.text }}>
            <input type="checkbox" checked={Boolean(form.requiresPhone)} onChange={(e) => upd({ requiresPhone: e.target.checked })} />
            Yêu cầu số điện thoại (chỉ áp dụng cho form đầy đủ)
          </label>
        </FieldGroup>

        <FieldGroup title="CTA & Nội dung cảm ơn">
          <Row2>
            <Field label="Tiêu đề CTA">
              <input style={s.field} value={form.ctaTitle ?? ""} onChange={(e) => upd({ ctaTitle: e.target.value })} placeholder="Nhận checklist miễn phí" />
            </Field>
            <Field label="Nhãn nút">
              <input style={s.field} value={form.buttonLabel ?? ""} onChange={(e) => upd({ buttonLabel: e.target.value })} placeholder="Mở khóa tài liệu" />
            </Field>
          </Row2>
          <Field label="Mô tả CTA">
            <textarea style={{ ...s.textarea, minHeight: "60px" }} value={form.ctaDescription ?? ""} onChange={(e) => upd({ ctaDescription: e.target.value })} placeholder="Mô tả ngắn xuất hiện trong block CTA..." />
          </Field>
          <Field label="Lời cảm ơn sau khi mở khóa">
            <textarea style={{ ...s.textarea, minHeight: "70px" }} value={form.thankYouMessage ?? ""} onChange={(e) => upd({ thankYouMessage: e.target.value })} placeholder="Cảm ơn anh/chị. Tài liệu đã sẵn sàng..." />
          </Field>
        </FieldGroup>

        <FieldGroup title="SEO & Chủ đề">
          <Row2>
            <Field label="Tiêu đề SEO">
              <input style={s.field} value={form.seoTitle ?? ""} onChange={(e) => upd({ seoTitle: e.target.value })} placeholder="Tiêu đề cho Google" />
            </Field>
            <Field label="Chủ đề (slug)">
              <input style={s.field} value={form.topicSlug ?? ""} onChange={(e) => upd({ topicSlug: e.target.value })} placeholder="tu-duy-dau-tu" />
            </Field>
          </Row2>
          <Field label="Mô tả SEO">
            <textarea style={{ ...s.textarea, minHeight: "60px" }} value={form.seoDescription ?? ""} onChange={(e) => upd({ seoDescription: e.target.value })} />
          </Field>
          <Row2>
            <Field label="Thứ tự hiển thị">
              <input style={s.field} type="number" value={form.sortOrder ?? 0} onChange={(e) => upd({ sortOrder: Number(e.target.value) })} />
            </Field>
            <Field label="OG Image URL">
              <input style={s.field} value={form.ogImageUrl ?? ""} onChange={(e) => upd({ ogImageUrl: e.target.value })} />
            </Field>
          </Row2>
        </FieldGroup>

        {error && (
          <div style={{ padding: "10px 14px", background: "rgba(193,51,51,0.08)", borderRadius: "7px", marginBottom: "12px" }}>
            <p style={{ margin: 0, fontSize: "13px", color: A.danger }}>{error}</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: "14px 20px", borderTop: `1px solid ${A.border}`, display: "flex", gap: "8px", flexShrink: 0 }}>
        <button
          onClick={() => handleSave("draft")}
          disabled={saving}
          style={{ ...btnBase, background: A.bg, color: A.text, border: `1px solid ${A.border}` }}
        >
          Lưu bản nháp
        </button>
        <button
          onClick={() => handleSave("published")}
          disabled={saving}
          style={{ ...btnBase, background: A.primary, color: "#fff", flex: 1 }}
        >
          {saving ? "Đang lưu..." : (mode === "create" ? "Xuất bản" : "Cập nhật & Xuất bản")}
        </button>
        {mode === "edit" && (
          <button
            onClick={() => handleSave()}
            disabled={saving}
            style={{ ...btnBase, background: A.bg, color: A.text, border: `1px solid ${A.border}` }}
          >
            Lưu
          </button>
        )}
      </div>
    </div>
  );
}

const btnBase: React.CSSProperties = {
  padding: "9px 16px", borderRadius: "7px", border: "none",
  cursor: "pointer", fontSize: "13px", fontWeight: 600,
  transition: "opacity 0.15s",
};

/* ── Stats Panel ──────────────────────────────────────────────────── */
function StatsPanel({ resource, analytics, loading }: { resource: LeadMagnet; analytics: ResourceAnalytics | null; loading: boolean }) {
  const ACCESS_LABELS: Record<string, string> = {
    page_view: "Xem trang", unlock: "Mở khóa", download: "Tải xuống",
    email_sent: "Email đã gửi", form_submit: "Gửi form",
  };

  const statBox = (label: string, value: string | number) => (
    <div style={{ background: A.bg, borderRadius: "9px", padding: "16px 18px", flex: 1, minWidth: "80px" }}>
      <p style={{ margin: "0 0 4px", fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: A.textMuted }}>{label}</p>
      <p style={{ margin: 0, fontSize: "22px", fontWeight: 700, color: A.text }}>{loading ? "—" : value}</p>
    </div>
  );

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "18px 20px", borderBottom: `1px solid ${A.border}`, flexShrink: 0 }}>
        <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: A.text }}>Thống kê: {resource.title}</p>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "24px" }}>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {statBox("Lượt xem", analytics?.totalPageViews ?? 0)}
          {statBox("Mở khóa", analytics?.totalUnlocks ?? 0)}
          {statBox("Tải xuống", analytics?.totalDownloads ?? 0)}
          {statBox("Email gửi", analytics?.totalEmailSent ?? 0)}
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {statBox("Tỷ lệ chuyển đổi", `${analytics?.conversionRate ?? 0}%`)}
          {statBox("Email duy nhất", analytics?.uniqueEmails ?? 0)}
        </div>

        {analytics && analytics.topSources.length > 0 && (
          <div>
            <p style={{ ...s.label, marginBottom: "10px" }}>Nguồn hiệu quả</p>
            {analytics.topSources.map((src, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: `1px solid ${A.border}` }}>
                <p style={{ margin: 0, fontSize: "12.5px", color: A.textMuted, wordBreak: "break-all" }}>{src.sourcePage ?? "(trực tiếp)"}</p>
                <span style={{ fontSize: "13px", fontWeight: 700, color: A.text, flexShrink: 0, marginLeft: "12px" }}>{src.c}</span>
              </div>
            ))}
          </div>
        )}

        {analytics && analytics.recent.length > 0 && (
          <div>
            <p style={{ ...s.label, marginBottom: "10px" }}>Hoạt động gần đây</p>
            {analytics.recent.map((ev, i) => (
              <div key={i} style={{ padding: "8px 0", borderBottom: `1px solid ${A.border}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
                  <span style={{ fontSize: "12px", fontWeight: 600, color: A.primary }}>
                    {ACCESS_LABELS[ev.accessType] ?? ev.accessType}
                  </span>
                  <span style={{ fontSize: "11px", color: A.textMuted }}>{fmtDate(ev.createdAt)}</span>
                </div>
                {ev.email && <p style={{ margin: 0, fontSize: "12px", color: A.textMuted }}>{ev.fullName ?? ""} · {ev.email}</p>}
              </div>
            ))}
          </div>
        )}

        {analytics && analytics.recent.length === 0 && (
          <p style={{ color: A.textMuted, fontSize: "13px" }}>Chưa có hoạt động nào.</p>
        )}
      </div>
    </div>
  );
}

/* ── Main Panel ───────────────────────────────────────────────────── */
export function ResourcesPanel({ adminKey }: { adminKey: string }) {
  const [resources, setResources] = useState<LeadMagnet[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);
  const [success,   setSuccess]   = useState<string | null>(null);

  const [search,       setSearch]       = useState("");
  const [typeFilter,   setTypeFilter]   = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [selected,     setSelected]     = useState<LeadMagnet | null>(null);
  const [mode,         setMode]         = useState<"idle" | "create" | "edit" | "stats">("idle");

  const [analytics,    setAnalytics]    = useState<ResourceAnalytics | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await adminApi.getResources(adminKey);
      setResources(list);
    } catch (e) {
      setError("Không thể tải danh sách tài liệu");
    } finally {
      setLoading(false);
    }
  }, [adminKey]);

  useEffect(() => { load(); }, [load]);

  const handleSelectRow = (r: LeadMagnet) => {
    if (selected?.id === r.id && mode === "edit") {
      setSelected(null); setMode("idle");
    } else {
      setSelected(r);
      setMode("edit");
      setAnalytics(null);
    }
  };

  const handleViewStats = async (r: LeadMagnet) => {
    setSelected(r);
    setMode("stats");
    setLoadingStats(true);
    try {
      const data = await adminApi.getResourceAnalytics(adminKey, r.id);
      setAnalytics(data);
    } catch {}
    finally { setLoadingStats(false); }
  };

  const handleDelete = async (r: LeadMagnet) => {
    if (!confirm(`Xóa tài liệu "${r.title}"?`)) return;
    try {
      await adminApi.deleteResource(adminKey, r.id);
      if (selected?.id === r.id) { setSelected(null); setMode("idle"); }
      await load();
      setSuccess("Đã xóa tài liệu."); setTimeout(() => setSuccess(null), 3000);
    } catch (e) {
      setError(String(e).replace("Error: ", ""));
    }
  };

  const handleDone = async () => {
    await load();
    setSelected(null);
    setMode("idle");
    setSuccess("Đã lưu tài liệu."); setTimeout(() => setSuccess(null), 3000);
  };

  const filtered = resources.filter((r) => {
    if (search       && !r.title.toLowerCase().includes(search.toLowerCase()) && !r.slug.includes(search.toLowerCase())) return false;
    if (typeFilter   && r.resourceType !== typeFilter)   return false;
    if (statusFilter && r.status       !== statusFilter) return false;
    return true;
  });

  const showRight = mode !== "idle";
  const leftWidth = showRight ? "45%" : "100%";

  return (
    <div style={{ display: "flex", height: "100%", background: A.bg, overflow: "hidden" }}>
      {/* LEFT: list */}
      <div style={{ width: leftWidth, transition: "width 0.2s", display: "flex", flexDirection: "column", borderRight: showRight ? `1px solid ${A.border}` : "none" }}>
        {/* Toolbar */}
        <div style={{ padding: "14px 18px", background: A.bgCard, borderBottom: `1px solid ${A.border}`, flexShrink: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <input
              style={{ ...s.field, flex: 1 }}
              placeholder="Tìm kiếm tài liệu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              onClick={() => { setSelected(null); setMode("create"); }}
              style={{ ...btnBase, background: A.primary, color: "#fff", whiteSpace: "nowrap" }}
            >
              + Tạo mới
            </button>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <select style={{ ...s.select, flex: 1 }} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="">Tất cả loại</option>
              {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select style={{ ...s.select, flex: 1 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">Tất cả trạng thái</option>
              {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {/* Feedback */}
        {(error || success) && (
          <div style={{ padding: "8px 18px", background: error ? "rgba(193,51,51,0.08)" : "rgba(22,163,74,0.08)", flexShrink: 0 }}>
            <p style={{ margin: 0, fontSize: "12.5px", color: error ? A.danger : "#16a34a" }}>{error ?? success}</p>
          </div>
        )}

        {/* Table */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {loading ? (
            <p style={{ padding: "28px", color: A.textMuted, fontSize: "13px" }}>Đang tải...</p>
          ) : filtered.length === 0 ? (
            <p style={{ padding: "28px", color: A.textMuted, fontSize: "13px" }}>
              {resources.length === 0 ? "Chưa có tài liệu nào. Nhấn \"+ Tạo mới\" để bắt đầu." : "Không tìm thấy kết quả."}
            </p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: A.bg }}>
                  <th style={th}>Tiêu đề</th>
                  <th style={th}>Loại</th>
                  <th style={th}>Trạng thái</th>
                  <th style={th}>Mở khóa</th>
                  <th style={{ ...th, textAlign: "center" }}>★</th>
                  <th style={th}>Cập nhật</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => handleSelectRow(r)}
                    style={{
                      cursor: "pointer",
                      background: selected?.id === r.id ? "rgba(26,120,104,0.06)" : "transparent",
                      borderBottom: `1px solid ${A.border}`,
                    }}
                  >
                    <td style={{ padding: "10px 14px 10px 18px" }}>
                      <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: A.text }}>{r.title}</p>
                      <p style={{ margin: "2px 0 0", fontSize: "11px", color: A.textMuted }}>/{r.slug}</p>
                    </td>
                    <td style={{ padding: "10px 8px", fontSize: "11.5px", color: A.textMuted }}>
                      {TYPE_OPTIONS.find((t) => t.value === r.resourceType)?.label ?? r.resourceType}
                    </td>
                    <td style={{ padding: "10px 8px" }}>
                      <span style={{ fontSize: "11.5px", fontWeight: 600, color: STATUS_COLORS[r.status] ?? A.textMuted }}>
                        {STATUS_OPTIONS.find((x) => x.value === r.status)?.label ?? r.status}
                      </span>
                    </td>
                    <td style={{ padding: "10px 8px", fontSize: "11.5px", color: A.textMuted }}>
                      {GATE_OPTIONS.find((g) => g.value === r.gatingMode)?.label?.replace(" bằng ", " ")}
                    </td>
                    <td style={{ padding: "10px 8px", textAlign: "center" }}>
                      {r.featured && <span style={{ color: A.primary }}>★</span>}
                    </td>
                    <td style={{ padding: "10px 14px 10px 8px", fontSize: "11px", color: A.textMuted }}>{fmtDate(r.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Row actions on hover — shown below table for selected row */}
        {selected && (
          <div style={{ padding: "10px 18px", borderTop: `1px solid ${A.border}`, background: A.bgCard, display: "flex", gap: "8px", flexShrink: 0 }}>
            <button
              onClick={() => handleViewStats(selected)}
              style={{ ...btnBase, background: A.bg, color: A.text, border: `1px solid ${A.border}`, fontSize: "12px" }}
            >
              Thống kê
            </button>
            <button
              onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/tai-lieu/${selected.slug}`); setSuccess("Đã sao chép liên kết!"); setTimeout(() => setSuccess(null), 2000); }}
              style={{ ...btnBase, background: A.bg, color: A.text, border: `1px solid ${A.border}`, fontSize: "12px" }}
            >
              Sao chép link
            </button>
            <a
              href={`/tai-lieu/${selected.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ ...btnBase, background: A.bg, color: A.text, border: `1px solid ${A.border}`, fontSize: "12px", textDecoration: "none" }}
            >
              Xem
            </a>
            <button
              onClick={() => handleDelete(selected)}
              style={{ ...btnBase, background: "rgba(193,51,51,0.08)", color: A.danger, border: "none", fontSize: "12px", marginLeft: "auto" }}
            >
              Xóa
            </button>
          </div>
        )}
      </div>

      {/* RIGHT: form or stats */}
      {showRight && (
        <div style={{ flex: 1, minWidth: 0, background: A.bgCard, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {mode === "create" && (
            <ResourceForm
              adminKey={adminKey}
              initial={EMPTY_FORM}
              mode="create"
              onDone={handleDone}
              onCancel={() => setMode("idle")}
            />
          )}
          {mode === "edit" && selected && (
            <ResourceForm
              key={selected.id}
              adminKey={adminKey}
              initial={selected}
              mode="edit"
              onDone={handleDone}
              onCancel={() => { setSelected(null); setMode("idle"); }}
            />
          )}
          {mode === "stats" && selected && (
            <StatsPanel resource={selected} analytics={analytics} loading={loadingStats} />
          )}
        </div>
      )}
    </div>
  );
}

const th: React.CSSProperties = {
  padding: "8px 8px 8px 18px",
  fontSize: "10.5px",
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: A.textMuted,
  textAlign: "left",
  borderBottom: `1px solid ${A.border}`,
};
