import React, { useCallback, useEffect, useState } from "react";
import { adminApi, type MediaAsset, type MediaUsages } from "@/lib/newsApi";
import { ImageUploadField } from "./ImageUploadField";
import { A } from "./shared";

/* ── Constants ─────────────────────────────────────────────────────────── */
const FILTER_OPTS = [
  { value: "all",     label: "Tất cả" },
  { value: "article", label: "Ảnh bài viết" },
  { value: "video",   label: "Ảnh video" },
  { value: "topic",   label: "Ảnh chủ đề" },
  { value: "series",  label: "Ảnh series" },
  { value: "shared",  label: "Dùng chung" },
];

const SORT_OPTS = [
  { value: "newest", label: "Mới nhất" },
  { value: "oldest", label: "Cũ nhất" },
  { value: "name",   label: "Tên A-Z" },
  { value: "size",   label: "Dung lượng lớn nhất" },
];

const CT_LABEL: Record<string, string> = {
  article: "Bài viết", video: "Video", topic: "Chủ đề",
  series: "Series", shared: "Dùng chung", other: "Khác",
};

/* ── Helpers ─────────────────────────────────────────────────────────── */
function fmtSize(b: number | null | undefined) {
  if (!b) return "—";
  return b < 1024 * 1024 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`;
}
function fmtDate(iso: string) {
  const d = new Date(iso);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

/* ══════════════════════════════════════════════════════════════════════
   Main Panel
══════════════════════════════════════════════════════════════════════ */
export function MediaPanel({ adminKey }: { adminKey: string }) {
  const [assets,     setAssets]     = useState<MediaAsset[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [inputQ,     setInputQ]     = useState("");
  const [q,          setQ]          = useState("");
  const [ct,         setCt]         = useState("all");
  const [sort,       setSort]       = useState("newest");
  const [selected,   setSelected]   = useState<MediaAsset | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [toast,      setToast]      = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2200); };

  const load = useCallback(() => {
    setLoading(true);
    adminApi.getMedia(adminKey, { q: q || undefined, contentType: ct !== "all" ? ct : undefined, sort })
      .then(setAssets).catch(() => {}).finally(() => setLoading(false));
  }, [adminKey, q, ct, sort]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { const t = setTimeout(() => setQ(inputQ.trim()), 350); return () => clearTimeout(t); }, [inputQ]);

  const copyUrl = (url: string) =>
    navigator.clipboard.writeText(window.location.origin + url).then(() => showToast("Đã sao chép URL"));

  return (
    <div style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", marginBottom: "1.5rem" }}>
        <div>
          <h2 style={{ fontSize: "20px", fontWeight: 800, color: A.text, margin: "0 0 4px" }}>Thư viện ảnh</h2>
          <p style={{ fontSize: "13px", color: A.textMuted, margin: 0 }}>
            Quản lý, tìm kiếm và tái sử dụng hình ảnh trong toàn bộ hệ thống nội dung.
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
          <button onClick={() => load()} style={{ height: "36px", padding: "0 14px", borderRadius: "7px", border: `1px solid ${A.border}`, background: "#fff", color: A.textMuted, fontSize: "12.5px", cursor: "pointer" }}>
            Làm mới
          </button>
          <button onClick={() => setShowUpload(true)} style={{ height: "36px", padding: "0 16px", borderRadius: "7px", border: "none", background: A.primary, color: "#fff", fontSize: "12.5px", fontWeight: 600, cursor: "pointer" }}>
            Tải ảnh mới
          </button>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap" }}>
        <input value={inputQ} onChange={(e) => setInputQ(e.target.value)} placeholder="Tìm ảnh theo tên, alt text..."
          style={{ width: "220px", height: "36px", padding: "0 12px", border: `1px solid ${A.border}`, borderRadius: "7px", fontSize: "13px", outline: "none", background: "#fff" }} />
        <div style={{ display: "flex", gap: "4px", flex: 1, flexWrap: "wrap" }}>
          {FILTER_OPTS.map((opt) => (
            <button key={opt.value} onClick={() => setCt(opt.value)} style={{
              padding: "5px 11px", borderRadius: "6px",
              border: `1px solid ${ct === opt.value ? A.primary : A.border}`,
              background: ct === opt.value ? `${A.primary}12` : "#fff",
              color: ct === opt.value ? A.primary : A.textMuted,
              fontSize: "12px", fontWeight: ct === opt.value ? 600 : 400, cursor: "pointer", whiteSpace: "nowrap",
            }}>{opt.label}</button>
          ))}
        </div>
        <select value={sort} onChange={(e) => setSort(e.target.value)}
          style={{ height: "36px", padding: "0 10px", border: `1px solid ${A.border}`, borderRadius: "7px", fontSize: "12.5px", outline: "none", background: "#fff", color: A.text, cursor: "pointer" }}>
          {SORT_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {!loading && (
        <p style={{ fontSize: "12px", color: A.textLight, margin: "0 0 1rem" }}>
          {assets.length} ảnh{q ? ` phù hợp với "${q}"` : ""}
        </p>
      )}

      {/* Grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem 0", color: A.textMuted }}>Đang tải thư viện...</div>
      ) : assets.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem 0", background: "#fff", borderRadius: "12px", border: `1px solid ${A.border}` }}>
          <p style={{ fontSize: "28px", margin: "0 0 10px", opacity: 0.25 }}>⊟</p>
          <p style={{ fontSize: "14px", fontWeight: 600, color: A.text, margin: "0 0 6px" }}>Chưa có ảnh nào</p>
          <p style={{ fontSize: "12.5px", color: A.textMuted, margin: "0 0 1.25rem" }}>
            {q ? "Không tìm thấy ảnh phù hợp." : "Bắt đầu bằng cách tải ảnh đầu tiên."}
          </p>
          {!q && <button onClick={() => setShowUpload(true)} style={{ padding: "8px 20px", borderRadius: "7px", border: "none", background: A.primary, color: "#fff", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>Tải ảnh mới</button>}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(185px, 1fr))", gap: "14px" }}>
          {assets.map((asset) => (
            <MediaCard key={asset.id} asset={asset}
              onSelect={() => setSelected(asset)}
              onCopyUrl={() => copyUrl(asset.publicUrl)} />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <DetailModal adminKey={adminKey} asset={selected} onClose={() => setSelected(null)}
          onUpdated={(u) => { setSelected(u); setAssets((p) => p.map((a) => (a.id === u.id ? u : a))); }}
          onDeleted={() => { setAssets((p) => p.filter((a) => a.id !== selected.id)); setSelected(null); showToast("Đã xóa ảnh"); }}
          onCopyUrl={copyUrl} />
      )}

      {/* Upload Modal */}
      {showUpload && (
        <UploadModal adminKey={adminKey}
          onClose={() => setShowUpload(false)}
          onDone={() => { setShowUpload(false); load(); showToast("Ảnh đã được lưu vào thư viện"); }} />
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 3000, background: "#1e2533", color: "#fff", fontSize: "13px", fontWeight: 500, padding: "10px 18px", borderRadius: "8px", boxShadow: "0 4px 16px rgba(0,0,0,0.22)" }}>
          {toast}
        </div>
      )}
    </div>
  );
}

/* ── MediaCard ───────────────────────────────────────────────────────── */
function MediaCard({ asset, onSelect, onCopyUrl }: { asset: MediaAsset; onSelect: () => void; onCopyUrl: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ background: "#fff", borderRadius: "10px", border: `1px solid ${hover ? A.primary : A.border}`, overflow: "hidden", cursor: "pointer", transition: "border-color 0.12s, box-shadow 0.12s", boxShadow: hover ? `0 4px 14px ${A.primary}18` : "none" }}>
      <div style={{ position: "relative", paddingTop: "56.25%", background: A.bg, overflow: "hidden" }} onClick={onSelect}>
        <img src={asset.thumbnailUrl ?? asset.publicUrl} alt={asset.altText ?? ""} loading="lazy"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        {asset.watermarkEnabled && (
          <span style={{ position: "absolute", top: 6, left: 6, background: "rgba(0,0,0,0.55)", color: "rgba(255,255,255,0.85)", fontSize: "9px", fontWeight: 700, letterSpacing: "0.06em", padding: "2px 6px", borderRadius: "4px" }}>WM</span>
        )}
        <span style={{ position: "absolute", top: 6, right: 6, background: "rgba(0,0,0,0.48)", color: "#fff", fontSize: "9.5px", fontWeight: 600, padding: "2px 7px", borderRadius: "4px" }}>
          {CT_LABEL[asset.contentType] ?? asset.contentType}
        </span>
        {hover && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.26)", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
            <button onClick={onSelect} style={{ padding: "5px 10px", borderRadius: "6px", background: "rgba(255,255,255,0.92)", border: "none", fontSize: "11.5px", fontWeight: 600, cursor: "pointer", color: A.text }}>Chi tiết</button>
            <button onClick={(e) => { e.stopPropagation(); onCopyUrl(); }} style={{ padding: "5px 10px", borderRadius: "6px", background: "rgba(255,255,255,0.92)", border: "none", fontSize: "11.5px", fontWeight: 600, cursor: "pointer", color: A.text }}>Sao chép URL</button>
          </div>
        )}
      </div>
      <div style={{ padding: "8px 10px 9px" }} onClick={onSelect}>
        <p style={{ margin: "0 0 3px", fontSize: "12.5px", color: A.text, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {asset.title || asset.filename}
        </p>
        <div style={{ display: "flex", gap: "6px" }}>
          <span style={{ fontSize: "11px", color: A.textLight }}>{fmtSize(asset.sizeBytes)}</span>
          {asset.width && <span style={{ fontSize: "11px", color: A.textLight }}>{asset.width}×{asset.height}</span>}
          <span style={{ fontSize: "11px", color: A.textLight, marginLeft: "auto" }}>{fmtDate(asset.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}

/* ── Detail Modal ────────────────────────────────────────────────────── */
function DetailModal({
  adminKey, asset, onClose, onUpdated, onDeleted, onCopyUrl,
}: {
  adminKey: string; asset: MediaAsset;
  onClose: () => void; onUpdated: (a: MediaAsset) => void;
  onDeleted: () => void; onCopyUrl: (url: string) => void;
}) {
  const [editing,   setEditing]   = useState(false);
  const [editTitle, setEditTitle] = useState(asset.title ?? "");
  const [editAlt,   setEditAlt]   = useState(asset.altText ?? "");
  const [saving,    setSaving]    = useState(false);
  const [delPhase,  setDelPhase]  = useState<"idle" | "confirm" | "warn" | "saving">("idle");
  const [usages,    setUsages]    = useState<MediaUsages | null>(null);
  const [errMsg,    setErrMsg]    = useState("");

  useEffect(() => {
    setEditTitle(asset.title ?? "");
    setEditAlt(asset.altText ?? "");
    setEditing(false); setDelPhase("idle"); setErrMsg(""); setUsages(null);
  }, [asset.id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await adminApi.updateMediaAsset(adminKey, asset.id, { title: editTitle.trim() || null, altText: editAlt.trim() || null });
      onUpdated(updated); setEditing(false);
    } catch (e) { setErrMsg(String(e)); } finally { setSaving(false); }
  };

  const handleDelete = async (force = false) => {
    setDelPhase("saving");
    try {
      const resp = await adminApi.deleteMediaAsset(adminKey, asset.id, force);
      if ("usages" in resp && resp.usages) { setUsages(resp.usages as MediaUsages); setDelPhase("warn"); return; }
      onDeleted();
    } catch (e) { setErrMsg(String(e)); setDelPhase("idle"); }
  };

  const LabelRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div style={{ display: "flex", gap: "10px", padding: "8px 0", borderBottom: `1px solid ${A.border}` }}>
      <span style={{ fontSize: "12px", color: A.textMuted, width: "130px", flexShrink: 0, paddingTop: "2px" }}>{label}</span>
      <span style={{ fontSize: "13px", color: A.text, flex: 1, wordBreak: "break-all" }}>{children}</span>
    </div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1500, background: "rgba(0,0,0,0.48)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: "#fff", borderRadius: "14px", width: "100%", maxWidth: "780px", maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 24px 64px rgba(0,0,0,0.18)", overflow: "hidden" }}>

        {/* Header */}
        <div style={{ padding: "1rem 1.25rem", borderBottom: `1px solid ${A.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <p style={{ fontSize: "15px", fontWeight: 700, color: A.text, margin: 0 }}>Chi tiết ảnh</p>
          <button onClick={onClose} style={{ width: "28px", height: "28px", borderRadius: "6px", border: `1px solid ${A.border}`, background: "none", cursor: "pointer", fontSize: "17px", color: A.textMuted, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {/* Preview */}
          <div style={{ position: "relative", paddingTop: "42.1875%", background: "#f1f3f5", flexShrink: 0 }}>
            <img src={asset.publicUrl} alt={asset.altText ?? ""} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain" }} />
          </div>

          <div style={{ padding: "1.25rem" }}>
            {errMsg && <p style={{ fontSize: "12.5px", color: A.danger, background: "rgba(193,51,51,0.06)", border: `1px solid rgba(193,51,51,0.20)`, borderRadius: "7px", padding: "8px 12px", margin: "0 0 1rem" }}>{errMsg}</p>}

            {/* Actions row */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "1.25rem", flexWrap: "wrap" }}>
              <button onClick={() => onCopyUrl(asset.publicUrl)} style={{ padding: "6px 13px", borderRadius: "6px", border: `1px solid ${A.border}`, background: "#fff", fontSize: "12.5px", cursor: "pointer", color: A.text }}>Sao chép URL ảnh</button>
              {asset.thumbnailUrl && <button onClick={() => onCopyUrl(asset.thumbnailUrl!)} style={{ padding: "6px 13px", borderRadius: "6px", border: `1px solid ${A.border}`, background: "#fff", fontSize: "12.5px", cursor: "pointer", color: A.text }}>Sao chép URL thumbnail</button>}
              <a href={asset.publicUrl} target="_blank" rel="noopener" style={{ padding: "6px 13px", borderRadius: "6px", border: `1px solid ${A.border}`, background: "#fff", fontSize: "12.5px", cursor: "pointer", color: A.text, textDecoration: "none" }}>Mở ảnh</a>
              {!editing && <button onClick={() => setEditing(true)} style={{ padding: "6px 13px", borderRadius: "6px", border: `1px solid ${A.border}`, background: "#fff", fontSize: "12.5px", cursor: "pointer", color: A.text }}>Chỉnh sửa</button>}
              {delPhase === "idle" && <button onClick={() => setDelPhase("confirm")} style={{ padding: "6px 13px", borderRadius: "6px", border: `1px solid rgba(193,51,51,0.30)`, background: "transparent", fontSize: "12.5px", cursor: "pointer", color: A.danger, marginLeft: "auto" }}>Xóa ảnh</button>}
            </div>

            {/* Edit fields */}
            {editing && (
              <div style={{ background: A.bg, borderRadius: "8px", padding: "1rem", marginBottom: "1rem" }}>
                <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: A.textMuted, margin: "0 0 0.875rem" }}>Chỉnh sửa thông tin</p>
                <div style={{ marginBottom: "10px" }}>
                  <label style={{ fontSize: "11.5px", fontWeight: 600, color: A.textMuted, display: "block", marginBottom: "5px" }}>Tiêu đề ảnh</label>
                  <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Tiêu đề ảnh (tùy chọn)"
                    style={{ width: "100%", padding: "7px 10px", border: `1px solid ${A.border}`, borderRadius: "6px", fontSize: "13px", outline: "none", boxSizing: "border-box" }} />
                </div>
                <div style={{ marginBottom: "12px" }}>
                  <label style={{ fontSize: "11.5px", fontWeight: 600, color: A.textMuted, display: "block", marginBottom: "5px" }}>Văn bản thay thế (alt text)</label>
                  <input value={editAlt} onChange={(e) => setEditAlt(e.target.value)} placeholder="Mô tả ngắn về ảnh"
                    style={{ width: "100%", padding: "7px 10px", border: `1px solid ${A.border}`, borderRadius: "6px", fontSize: "13px", outline: "none", boxSizing: "border-box" }} />
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={handleSave} disabled={saving} style={{ padding: "7px 16px", borderRadius: "6px", border: "none", background: A.primary, color: "#fff", fontSize: "12.5px", fontWeight: 600, cursor: "pointer", opacity: saving ? 0.7 : 1 }}>
                    {saving ? "Đang lưu..." : "Lưu thông tin"}
                  </button>
                  <button onClick={() => { setEditing(false); setEditTitle(asset.title ?? ""); setEditAlt(asset.altText ?? ""); }} style={{ padding: "7px 14px", borderRadius: "6px", border: `1px solid ${A.border}`, background: "#fff", fontSize: "12.5px", cursor: "pointer", color: A.textMuted }}>Hủy</button>
                </div>
              </div>
            )}

            {/* Metadata */}
            <div>
              <LabelRow label="Tên ảnh">{asset.title || <span style={{ color: A.textLight }}>Chưa đặt tên</span>}</LabelRow>
              <LabelRow label="Tên tệp">{asset.filename}</LabelRow>
              {asset.originalFilename && <LabelRow label="Tệp gốc">{asset.originalFilename}</LabelRow>}
              <LabelRow label="Kích thước">{asset.width && asset.height ? `${asset.width} × ${asset.height} px` : "—"}</LabelRow>
              <LabelRow label="Dung lượng">{fmtSize(asset.sizeBytes)}</LabelRow>
              <LabelRow label="Loại nội dung">{CT_LABEL[asset.contentType] ?? asset.contentType}</LabelRow>
              <LabelRow label="Văn bản alt">{asset.altText || <span style={{ color: A.textLight }}>Chưa có</span>}</LabelRow>
              <LabelRow label="Watermark">{asset.watermarkEnabled ? `Có — ${asset.watermarkText ?? "THẮNG SWC"}` : "Không"}</LabelRow>
              <LabelRow label="Đường dẫn ảnh"><span style={{ fontFamily: "monospace", fontSize: "12px" }}>{asset.publicUrl}</span></LabelRow>
              {asset.thumbnailUrl && <LabelRow label="Đường dẫn thumbnail"><span style={{ fontFamily: "monospace", fontSize: "12px" }}>{asset.thumbnailUrl}</span></LabelRow>}
              <LabelRow label="Ngày tải lên">{fmtDate(asset.createdAt)}</LabelRow>
            </div>

            {/* Delete confirmation */}
            {delPhase === "confirm" && (
              <div style={{ marginTop: "1rem", background: "rgba(193,51,51,0.05)", border: `1px solid rgba(193,51,51,0.20)`, borderRadius: "8px", padding: "1rem" }}>
                <p style={{ fontSize: "13.5px", fontWeight: 600, color: A.danger, margin: "0 0 4px" }}>Bạn có chắc chắn muốn xóa ảnh này?</p>
                <p style={{ fontSize: "12.5px", color: A.textMuted, margin: "0 0 1rem" }}>Hành động này không thể hoàn tác.</p>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={() => handleDelete(false)} disabled={delPhase === "saving" as unknown as boolean} style={{ padding: "7px 16px", borderRadius: "6px", border: "none", background: A.danger, color: "#fff", fontSize: "12.5px", fontWeight: 600, cursor: "pointer" }}>Xóa ảnh</button>
                  <button onClick={() => setDelPhase("idle")} style={{ padding: "7px 14px", borderRadius: "6px", border: `1px solid ${A.border}`, background: "#fff", fontSize: "12.5px", cursor: "pointer", color: A.textMuted }}>Hủy</button>
                </div>
              </div>
            )}

            {/* Usage warning */}
            {delPhase === "warn" && usages && (
              <div style={{ marginTop: "1rem", background: "rgba(193,51,51,0.05)", border: `1px solid rgba(193,51,51,0.20)`, borderRadius: "8px", padding: "1rem" }}>
                <p style={{ fontSize: "13.5px", fontWeight: 600, color: A.danger, margin: "0 0 8px" }}>Ảnh này đang được sử dụng trong nội dung khác</p>
                {usages.articles.length > 0 && <p style={{ fontSize: "12.5px", color: A.text, margin: "0 0 4px" }}>Bài viết: {usages.articles.map((a) => a.title).join(", ")}</p>}
                {usages.videos.length > 0 && <p style={{ fontSize: "12.5px", color: A.text, margin: "0 0 4px" }}>Video: {usages.videos.map((v) => v.title).join(", ")}</p>}
                <p style={{ fontSize: "12px", color: A.textMuted, margin: "8px 0 1rem" }}>Xóa cưỡng bức sẽ để lại đường dẫn ảnh bị hỏng trong nội dung.</p>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={() => handleDelete(true)} style={{ padding: "7px 16px", borderRadius: "6px", border: "none", background: A.danger, color: "#fff", fontSize: "12.5px", fontWeight: 600, cursor: "pointer" }}>Vẫn xóa</button>
                  <button onClick={() => setDelPhase("idle")} style={{ padding: "7px 14px", borderRadius: "6px", border: `1px solid ${A.border}`, background: "#fff", fontSize: "12.5px", cursor: "pointer", color: A.textMuted }}>Hủy</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Upload Modal ────────────────────────────────────────────────────── */
function UploadModal({ adminKey, onClose, onDone }: { adminKey: string; onClose: () => void; onDone: () => void }) {
  const [display, setDisplay] = useState("");
  const [thumb,   setThumb]   = useState("");
  const uploaded = !!display;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1500, background: "rgba(0,0,0,0.48)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: "#fff", borderRadius: "14px", width: "100%", maxWidth: "440px", boxShadow: "0 24px 64px rgba(0,0,0,0.18)", overflow: "hidden" }}>
        <div style={{ padding: "1.125rem 1.5rem", borderBottom: `1px solid ${A.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p style={{ fontSize: "15px", fontWeight: 700, color: A.text, margin: 0 }}>Tải ảnh mới vào thư viện</p>
          <button onClick={onClose} style={{ width: "28px", height: "28px", borderRadius: "6px", border: `1px solid ${A.border}`, background: "none", cursor: "pointer", fontSize: "17px", color: A.textMuted, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
        </div>
        <div style={{ padding: "1.5rem" }}>
          {uploaded ? (
            <div style={{ textAlign: "center" }}>
              <img src={thumb || display} alt="" style={{ width: "100%", maxWidth: "240px", aspectRatio: "16/9", objectFit: "cover", borderRadius: "8px", border: `1px solid ${A.border}`, display: "block", margin: "0 auto 1rem" }} />
              <p style={{ fontSize: "13px", color: A.primary, fontWeight: 600, margin: "0 0 1.25rem" }}>Ảnh đã được lưu vào thư viện.</p>
              <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                <button onClick={() => { setDisplay(""); setThumb(""); }} style={{ padding: "7px 16px", borderRadius: "6px", border: `1px solid ${A.border}`, background: "#fff", fontSize: "13px", cursor: "pointer", color: A.text }}>Tải ảnh khác</button>
                <button onClick={onDone} style={{ padding: "7px 16px", borderRadius: "6px", border: "none", background: A.primary, color: "#fff", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>Hoàn tất</button>
              </div>
            </div>
          ) : (
            <ImageUploadField adminKey={adminKey} value={display} thumbnailValue={thumb} context="shared"
              onUpload={({ display: d, thumbnail: t }) => { setDisplay(d); setThumb(t); }}
              onClear={() => { setDisplay(""); setThumb(""); }} />
          )}
        </div>
      </div>
    </div>
  );
}
