import React, { useEffect, useState, useCallback, useMemo } from "react";
import { adminApi, type Series } from "@/lib/newsApi";
import { A, s, slugify } from "./shared";

/* ── Toast ─────────────────────────────────────────────────────────────── */
function Toast({ msg, type, onClose }: { msg: string; type: "ok" | "err"; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3200); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 500, background: type === "ok" ? A.primary : A.danger, color: "#fff", borderRadius: "9px", padding: "11px 18px", fontSize: "13px", fontWeight: 500, boxShadow: "0 4px 18px rgba(0,0,0,0.18)" }}>
      {msg}
    </div>
  );
}

/* ── Type chip ─────────────────────────────────────────────────────────── */
function TypeChip({ type }: { type: string }) {
  const color = type === "article" ? "#2563eb" : type === "video" ? "#7c3aed" : A.primary;
  const label = type === "article" ? "Bài viết" : type === "video" ? "Video" : "Hỗn hợp";
  return (
    <span style={{ display: "inline-block", fontSize: "10px", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", padding: "2px 8px", borderRadius: "5px", background: `${color}15`, color }}>
      {label}
    </span>
  );
}

/* ── Status chip ─────────────────────────────────────────────────────── */
function StatusChip({ status }: { status: string }) {
  const active = status === "active";
  return (
    <span style={{ display: "inline-block", fontSize: "10px", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", padding: "2px 8px", borderRadius: "5px", background: active ? "rgba(26,120,104,0.10)" : "rgba(0,0,0,0.06)", color: active ? A.primary : A.textMuted }}>
      {active ? "Hoạt động" : "Ẩn"}
    </span>
  );
}

/* ── Form type ─────────────────────────────────────────────────────────── */
type Form = Partial<Series>;

const EMPTY: Form = {
  title: "", slug: "", description: "", shortDescription: "",
  coverImageUrl: "", coverImageAlt: "",
  type: "mixed", featured: false, displayOrder: 0, status: "active",
  seoTitle: "", seoDescription: "",
};

/* ── Image preview ─────────────────────────────────────────────────────── */
function ImagePreview({ url, onClear }: { url: string; onClear: () => void }) {
  const [err, setErr] = useState(false);
  useEffect(() => { setErr(false); }, [url]);
  if (!url) return null;
  return (
    <div style={{ marginTop: "8px", position: "relative", display: "inline-block" }}>
      {!err ? (
        <img src={url} alt="" onError={() => setErr(true)}
          style={{ maxWidth: "240px", maxHeight: "135px", objectFit: "cover", borderRadius: "7px", border: `1px solid ${A.border}`, display: "block" }} />
      ) : (
        <div style={{ width: "240px", height: "60px", borderRadius: "7px", border: `1px solid ${A.border}`, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: "11px", color: A.danger }}>URL ảnh không hợp lệ</span>
        </div>
      )}
      <button onClick={onClear} style={{ position: "absolute", top: "4px", right: "4px", background: "rgba(0,0,0,0.55)", color: "#fff", border: "none", borderRadius: "4px", padding: "2px 7px", fontSize: "11px", cursor: "pointer" }}>Xóa ảnh</button>
    </div>
  );
}

/* ── Main component ────────────────────────────────────────────────────── */
export function SeriesPanel({ adminKey }: { adminKey: string }) {
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [loading, setLoading]       = useState(true);
  const [view, setView]             = useState<"list" | "form">("list");
  const [form, setForm]             = useState<Form>(EMPTY);
  const [saving, setSaving]         = useState(false);
  const [err, setErr]               = useState("");
  const [toast, setToast]           = useState<{ msg: string; type: "ok" | "err" } | null>(null);
  const [q, setQ]                   = useState("");
  const [fStatus, setFStatus]       = useState("all");
  const [fType, setFType]           = useState("all");

  const showToast = useCallback((msg: string, type: "ok" | "err" = "ok") => setToast({ msg, type }), []);

  const reload = useCallback(() => {
    setLoading(true);
    adminApi.getSeries(adminKey).then(setSeriesList).catch(console.error).finally(() => setLoading(false));
  }, [adminKey]);

  useEffect(() => { reload(); }, [reload]);

  const visible = useMemo(() => seriesList.filter((sr) => {
    if (fStatus !== "all" && sr.status !== fStatus) return false;
    if (fType !== "all" && sr.type !== fType) return false;
    if (q.trim()) {
      const lq = q.toLowerCase();
      return sr.title.toLowerCase().includes(lq) || sr.slug.toLowerCase().includes(lq);
    }
    return true;
  }), [seriesList, q, fStatus, fType]);

  const newSeries = () => { setForm({ ...EMPTY }); setErr(""); setView("form"); };
  const editSeries = (sr: Series) => { setForm({ ...sr }); setErr(""); setView("form"); };

  const deleteSeries = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa series này?\nHành động này không thể hoàn tác.")) return;
    try {
      await adminApi.deleteSeries(adminKey, id);
      setSeriesList((prev) => prev.filter((sr) => sr.id !== id));
      showToast("Đã xóa thành công.");
    } catch (e) { showToast(String(e), "err"); }
  };

  const toggleFeatured = async (sr: Series) => {
    try {
      const updated = await adminApi.updateSeries(adminKey, sr.id, { ...sr, featured: !sr.featured });
      setSeriesList((prev) => prev.map((x) => x.id === updated.id ? updated : x));
      showToast(!sr.featured ? "Đã đặt nổi bật." : "Đã bỏ nổi bật.");
    } catch (e) { showToast(String(e), "err"); }
  };

  const save = async () => {
    if (!form.title?.trim()) { setErr("Vui lòng nhập tên series."); return; }
    if (!form.slug?.trim())  { setErr("Vui lòng nhập đường dẫn tĩnh."); return; }
    setSaving(true); setErr("");
    try {
      if (form.id) {
        const updated = await adminApi.updateSeries(adminKey, form.id, form);
        setSeriesList((prev) => prev.map((sr) => sr.id === updated.id ? updated : sr));
        showToast("Đã cập nhật series.");
      } else {
        const created = await adminApi.createSeries(adminKey, form);
        setSeriesList((prev) => [created, ...prev]);
        showToast("Đã tạo series mới.");
      }
      setView("list");
    } catch (e) { setErr(String(e)); }
    finally { setSaving(false); }
  };

  const setField = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  /* ─── LIST VIEW ─── */
  if (view === "list") {
    return (
      <div>
        <div style={s.sectionHeader}>
          <div>
            <h2 style={{ ...s.sectionTitle, margin: "0 0 2px" }}>Quản lý series</h2>
            <p style={{ fontSize: "12.5px", color: A.textMuted, margin: 0 }}>Tạo và quản lý các series nội dung</p>
          </div>
          <button style={s.btnPrimary} onClick={newSeries}>+ Tạo series mới</button>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.625rem", padding: "0.875rem 1rem", marginBottom: "1rem", background: "#fff", border: `1px solid ${A.border}`, borderRadius: "9px", alignItems: "center" }}>
          <div style={{ position: "relative", flex: "1 1 200px", minWidth: "180px" }}>
            <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: A.textLight, pointerEvents: "none" }}>⌕</span>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm kiếm series..." style={{ ...s.field, paddingLeft: "28px", height: "34px" }} />
          </div>
          <select value={fType} onChange={(e) => setFType(e.target.value)} style={{ ...s.select, height: "34px", minWidth: "130px" }}>
            <option value="all">Tất cả loại</option>
            <option value="article">Bài viết</option>
            <option value="video">Video</option>
            <option value="mixed">Hỗn hợp</option>
          </select>
          <select value={fStatus} onChange={(e) => setFStatus(e.target.value)} style={{ ...s.select, height: "34px", minWidth: "140px" }}>
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="hidden">Ẩn</option>
          </select>
          <span style={{ fontSize: "12px", color: A.textLight, marginLeft: "auto" }}>{visible.length} / {seriesList.length} series</span>
        </div>

        {loading ? (
          <p style={{ fontSize: "13px", color: A.textMuted }}>Đang tải...</p>
        ) : seriesList.length === 0 ? (
          <div style={{ ...s.card, textAlign: "center", padding: "4rem 2rem" }}>
            <p style={{ fontSize: "15px", fontWeight: 700, color: A.text, margin: "0 0 6px" }}>Chưa có series nào</p>
            <p style={{ fontSize: "13px", color: A.textMuted, margin: "0 0 1.5rem" }}>Tạo series đầu tiên để gộp nội dung liên quan.</p>
            <button style={s.btnPrimary} onClick={newSeries}>+ Tạo series đầu tiên</button>
          </div>
        ) : visible.length === 0 ? (
          <div style={{ ...s.card, textAlign: "center", padding: "3rem 2rem" }}>
            <p style={{ fontSize: "14px", fontWeight: 600, color: A.text, margin: "0 0 8px" }}>Không có kết quả phù hợp</p>
            <button style={s.btnSecondary} onClick={() => { setQ(""); setFStatus("all"); setFType("all"); }}>Xóa bộ lọc</button>
          </div>
        ) : (
          <div style={{ ...s.card, padding: 0, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "rgba(0,0,0,0.015)" }}>
                  <th style={s.th}>Tên series</th>
                  <th style={{ ...s.th, width: "90px" }}>Loại</th>
                  <th style={{ ...s.th, width: "100px" }}>Trạng thái</th>
                  <th style={{ ...s.th, width: "70px", textAlign: "center" }}>Nổi bật</th>
                  <th style={{ ...s.th, width: "70px", textAlign: "center" }}>Thứ tự</th>
                  <th style={{ ...s.th, width: "130px" }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((sr, i) => (
                  <tr key={sr.id} style={{ background: i % 2 === 0 ? "#fff" : "rgba(0,0,0,0.012)" }}>
                    <td style={s.td}>
                      <p style={{ fontSize: "13px", fontWeight: 600, color: A.text, margin: "0 0 2px" }}>{sr.title}</p>
                      <p style={{ fontSize: "11px", color: A.textLight, margin: 0, fontFamily: "monospace" }}>/{sr.slug}</p>
                    </td>
                    <td style={s.td}><TypeChip type={sr.type} /></td>
                    <td style={s.td}><StatusChip status={sr.status} /></td>
                    <td style={{ ...s.td, textAlign: "center" }}>
                      <button onClick={() => toggleFeatured(sr)} title={sr.featured ? "Bỏ nổi bật" : "Bật nổi bật"}
                        style={{ background: "none", border: "none", cursor: "pointer", fontSize: "15px", lineHeight: 1, color: sr.featured ? "#d97706" : A.border }}>★</button>
                    </td>
                    <td style={{ ...s.td, textAlign: "center" }}><span style={{ fontSize: "12px", color: A.textMuted }}>{sr.displayOrder}</span></td>
                    <td style={{ ...s.td, whiteSpace: "nowrap" }}>
                      <div style={{ display: "flex", gap: "4px" }}>
                        <button onClick={() => editSeries(sr)} style={{ ...s.btnGhost, fontSize: "11.5px", padding: "4px 10px" }}>Sửa</button>
                        <button onClick={() => deleteSeries(sr.id)} style={{ ...s.btnGhost, fontSize: "11.5px", padding: "4px 10px", color: A.danger }}>Xóa</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    );
  }

  /* ─── FORM VIEW ─── */
  const isEdit = !!form.id;
  return (
    <div style={{ maxWidth: "720px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem", fontSize: "13px", color: A.textMuted }}>
        <button onClick={() => setView("list")} style={{ background: "none", border: "none", cursor: "pointer", color: A.primary, padding: 0, fontSize: "13px" }}>Series</button>
        <span>›</span>
        <span>{isEdit ? "Chỉnh sửa" : "Tạo mới"}</span>
      </div>

      <div style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h2 style={{ ...s.sectionTitle, margin: 0 }}>{isEdit ? "Chỉnh sửa series" : "Tạo series mới"}</h2>
        <div style={{ display: "flex", gap: "0.625rem" }}>
          <button onClick={save} disabled={saving} style={{ ...s.btnPrimary, opacity: saving ? 0.6 : 1 }}>{saving ? "Đang lưu..." : "Lưu series"}</button>
          <button onClick={() => setView("list")} disabled={saving} style={{ ...s.btnGhost, color: A.textMuted }}>Hủy</button>
        </div>
      </div>

      {err && <div style={s.error}>{err}</div>}

      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

        {/* Thông tin chính */}
        <div style={s.card}>
          <h3 style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: A.textMuted, margin: "0 0 1rem" }}>Thông tin chính</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            <div>
              <label style={s.label}>Tên series *</label>
              <input value={form.title ?? ""} onChange={(e) => {
                const title = e.target.value;
                setForm((f) => ({ ...f, title, slug: f.id ? f.slug : slugify(title) }));
              }} placeholder="Tên series..." style={s.field} />
            </div>
            <div>
              <label style={s.label}>Đường dẫn tĩnh *</label>
              <div style={{ display: "flex", gap: "8px" }}>
                <input value={form.slug ?? ""} onChange={(e) => setField("slug", slugify(e.target.value))} placeholder="ten-series" style={{ ...s.field, fontFamily: "monospace", fontSize: "12.5px", flex: 1 }} />
                <button type="button" onClick={() => setField("slug", slugify(form.title ?? ""))} style={{ ...s.btnSecondary, padding: "7px 12px", fontSize: "11.5px", whiteSpace: "nowrap" }}>Tự tạo</button>
              </div>
            </div>
            <div>
              <label style={s.label}>Mô tả ngắn</label>
              <input value={form.shortDescription ?? ""} onChange={(e) => setField("shortDescription", e.target.value)} placeholder="Mô tả ngắn gọn..." style={s.field} />
            </div>
            <div>
              <label style={s.label}>Mô tả</label>
              <textarea value={form.description ?? ""} onChange={(e) => setField("description", e.target.value)} rows={4} placeholder="Mô tả chi tiết về series này..." style={s.textarea} />
            </div>
          </div>
        </div>

        {/* Ảnh bìa */}
        <div style={s.card}>
          <h3 style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: A.textMuted, margin: "0 0 1rem" }}>Ảnh bìa</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            <div>
              <label style={s.label}>URL ảnh bìa</label>
              <input value={form.coverImageUrl ?? ""} onChange={(e) => setField("coverImageUrl", e.target.value)} placeholder="https://..." style={s.field} />
              <ImagePreview url={form.coverImageUrl ?? ""} onClear={() => setField("coverImageUrl", "")} />
            </div>
            <div>
              <label style={s.label}>Alt ảnh bìa</label>
              <input value={form.coverImageAlt ?? ""} onChange={(e) => setField("coverImageAlt", e.target.value)} placeholder="Mô tả ảnh bìa..." style={s.field} />
            </div>
          </div>
        </div>

        {/* Cài đặt */}
        <div style={s.card}>
          <h3 style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: A.textMuted, margin: "0 0 1rem" }}>Hiển thị & Loại</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem" }}>
            <div>
              <label style={s.label}>Loại series</label>
              <select value={form.type ?? "mixed"} onChange={(e) => setField("type", e.target.value)} style={s.select}>
                <option value="article">Bài viết</option>
                <option value="video">Video</option>
                <option value="mixed">Hỗn hợp</option>
              </select>
            </div>
            <div>
              <label style={s.label}>Trạng thái</label>
              <select value={form.status ?? "active"} onChange={(e) => setField("status", e.target.value)} style={s.select}>
                <option value="active">Hoạt động</option>
                <option value="hidden">Ẩn</option>
              </select>
            </div>
            <div>
              <label style={s.label}>Thứ tự hiển thị</label>
              <input type="number" value={form.displayOrder ?? 0} onChange={(e) => setField("displayOrder", Number(e.target.value))} min={0} style={s.field} />
            </div>
          </div>
          <div style={{ marginTop: "0.875rem" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", userSelect: "none" }}>
              <input type="checkbox" checked={form.featured ?? false} onChange={(e) => setField("featured", e.target.checked)} style={{ width: "15px", height: "15px", cursor: "pointer" }} />
              <span style={{ fontSize: "13px", color: A.text, fontWeight: 500 }}>Series nổi bật</span>
            </label>
          </div>
        </div>

        {/* SEO */}
        <div style={s.card}>
          <h3 style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: A.textMuted, margin: "0 0 1rem" }}>SEO</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            <div>
              <label style={s.label}>Tiêu đề SEO</label>
              <input value={form.seoTitle ?? ""} onChange={(e) => setField("seoTitle", e.target.value)} placeholder={form.title || ""} style={s.field} maxLength={70} />
            </div>
            <div>
              <label style={s.label}>Mô tả SEO</label>
              <textarea value={form.seoDescription ?? ""} onChange={(e) => setField("seoDescription", e.target.value)} rows={3} placeholder={form.description || ""} style={s.textarea} maxLength={160} />
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", paddingBottom: "2rem" }}>
          <button onClick={save} disabled={saving} style={{ ...s.btnPrimary, opacity: saving ? 0.6 : 1 }}>{saving ? "Đang lưu..." : "Lưu series"}</button>
          <button onClick={() => setView("list")} disabled={saving} style={{ ...s.btnGhost, color: A.textMuted }}>Hủy</button>
        </div>
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
