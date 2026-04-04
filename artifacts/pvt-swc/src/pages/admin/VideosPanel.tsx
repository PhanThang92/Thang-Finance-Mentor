import React, { useEffect, useState, useCallback, useMemo } from "react";
import { adminApi, type Video } from "@/lib/newsApi";
import { A, s, fmtDate, slugify } from "./shared";

/* ── Video category options ──────────────────────────────────────────── */
const CATEGORY_OPTIONS = [
  "Tài chính cá nhân",
  "Đầu tư dài hạn",
  "Tư duy tích sản",
  "Nổi bật",
  "Series",
];

/* ── YouTube URL validation ──────────────────────────────────────────── */
function isValidYoutubeUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.hostname.includes("youtube.com") || u.hostname.includes("youtu.be");
  } catch { return false; }
}

function extractYoutubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1).split("?")[0];
    return u.searchParams.get("v");
  } catch { return null; }
}

function youtubeThumbnail(url: string): string {
  const id = extractYoutubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : "";
}

/* ── Toast ───────────────────────────────────────────────────────────── */
function Toast({ msg, type, onClose }: { msg: string; type: "ok" | "err"; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3200); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{
      position: "fixed", bottom: "24px", right: "24px", zIndex: 500,
      background: type === "ok" ? A.primary : A.danger, color: "#fff",
      borderRadius: "9px", padding: "11px 18px", fontSize: "13px", fontWeight: 500,
      boxShadow: "0 4px 18px rgba(0,0,0,0.18)",
    }}>
      {msg}
    </div>
  );
}

/* ── Status pill ─────────────────────────────────────────────────────── */
function StatusPill({ status }: { status: string }) {
  const pub = status === "published";
  return (
    <span style={{
      display: "inline-block", whiteSpace: "nowrap",
      fontSize: "10px", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase",
      padding: "2px 8px", borderRadius: "5px",
      background: pub ? "rgba(26,120,104,0.10)" : "rgba(0,0,0,0.06)",
      color: pub ? A.primary : A.textMuted,
    }}>
      {pub ? "Đã đăng" : "Nháp"}
    </span>
  );
}

/* ── Empty video form ────────────────────────────────────────────────── */
const EMPTY: Partial<Video> & { categoriesInput: string } = {
  title: "", slug: "", excerpt: "",
  youtubeUrl: "", youtubeVideoId: null,
  thumbnailUrl: "", thumbnailAlt: "", thumbnailGradient: "",
  duration: "",
  publishDate: null, featured: false, isFeaturedVideo: false, status: "draft",
  topicSlug: "", seriesSlug: "",
  categoriesInput: "",
};
type Form = typeof EMPTY;

/* ── Main component ──────────────────────────────────────────────────── */
export function VideosPanel({ adminKey }: { adminKey: string }) {
  const [videos, setVideos]   = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView]       = useState<"list" | "form">("list");
  const [form, setForm]       = useState<Form>({ ...EMPTY });
  const [saving, setSaving]   = useState(false);
  const [err, setErr]         = useState("");
  const [toast, setToast]     = useState<{ msg: string; type: "ok" | "err" } | null>(null);
  const [thumbPreview, setThumbPreview] = useState("");

  const [q, setQ]               = useState("");
  const [fStatus, setFStatus]   = useState("all");
  const [fFeatured, setFFeatured] = useState("all");

  const showToast = useCallback((msg: string, type: "ok" | "err" = "ok") => setToast({ msg, type }), []);

  const reload = useCallback(() => {
    setLoading(true);
    adminApi.getVideos(adminKey).then(setVideos).catch(console.error).finally(() => setLoading(false));
  }, [adminKey]);

  useEffect(() => { reload(); }, [reload]);

  const visible = useMemo(() => videos.filter((v) => {
    if (fStatus !== "all" && v.status !== fStatus) return false;
    if (fFeatured === "featured" && !v.featured) return false;
    if (q.trim()) {
      const lq = q.toLowerCase();
      return v.title.toLowerCase().includes(lq) || v.slug.toLowerCase().includes(lq) || (v.excerpt ?? "").toLowerCase().includes(lq);
    }
    return true;
  }), [videos, q, fStatus, fFeatured]);

  const isFiltered = q || fStatus !== "all" || fFeatured !== "all";

  const newVideo = () => {
    setForm({ ...EMPTY }); setErr(""); setThumbPreview(""); setView("form");
  };

  const editVideo = (v: Video) => {
    const categoriesInput = (v.categories ?? []).join(", ");
    setForm({ ...v, categoriesInput });
    setThumbPreview(v.thumbnailUrl ?? "");
    setErr(""); setView("form");
  };

  const deleteVideo = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa video này?\nHành động này không thể hoàn tác.")) return;
    try {
      await adminApi.deleteVideo(adminKey, id);
      setVideos((prev) => prev.filter((v) => v.id !== id));
      showToast("Đã xóa thành công.");
    } catch (e) { showToast(String(e), "err"); }
  };

  const toggleStatus = async (v: Video) => {
    const next = v.status === "published" ? "draft" : "published";
    try {
      const updated = await adminApi.updateVideo(adminKey, v.id, { ...v, status: next, categories: v.categories });
      setVideos((prev) => prev.map((x) => x.id === updated.id ? updated : x));
      showToast(next === "published" ? "Đã xuất bản video." : "Đã chuyển về nháp.");
    } catch (e) { showToast(String(e), "err"); }
  };

  const toggleFeatured = async (v: Video) => {
    try {
      const updated = await adminApi.updateVideo(adminKey, v.id, { ...v, featured: !v.featured, categories: v.categories });
      setVideos((prev) => prev.map((x) => x.id === updated.id ? updated : x));
      showToast(!v.featured ? "Đã đặt nổi bật." : "Đã bỏ nổi bật.");
    } catch (e) { showToast(String(e), "err"); }
  };

  const setField = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  const handleTitleChange = (title: string) => {
    setForm((f) => ({ ...f, title, slug: f.id ? f.slug : slugify(title) }));
  };

  const handleYoutubeUrlChange = (url: string) => {
    setForm((f) => {
      const id = extractYoutubeId(url);
      const thumb = id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : f.thumbnailUrl;
      return { ...f, youtubeUrl: url, youtubeVideoId: id, thumbnailUrl: thumb ?? "" };
    });
    setThumbPreview(extractYoutubeId(url) ? youtubeThumbnail(url) : "");
  };

  const save = async (status: "draft" | "published") => {
    if (!form.title?.trim()) { setErr("Tiêu đề là bắt buộc."); return; }
    if (!form.slug?.trim())  { setErr("Đường dẫn tĩnh là bắt buộc."); return; }
    if (!form.youtubeUrl?.trim()) { setErr("Link YouTube là bắt buộc."); return; }
    if (!isValidYoutubeUrl(form.youtubeUrl ?? "")) { setErr("Link YouTube không hợp lệ."); return; }

    setSaving(true); setErr("");
    const categories = (form.categoriesInput ?? "").split(",").map((c) => c.trim()).filter(Boolean);
    const youtubeVideoId = extractYoutubeId(form.youtubeUrl ?? "") ?? form.youtubeVideoId ?? null;
    const payload: Partial<Video> = { ...form, status, categories, youtubeVideoId };
    delete (payload as Record<string, unknown>).categoriesInput;

    try {
      if (form.id) {
        const updated = await adminApi.updateVideo(adminKey, form.id, payload);
        setVideos((prev) => prev.map((v) => v.id === updated.id ? updated : v));
        showToast(status === "published" ? "Đã cập nhật và xuất bản." : "Đã lưu bản nháp.");
      } else {
        const created = await adminApi.createVideo(adminKey, payload);
        setVideos((prev) => [created, ...prev]);
        showToast(status === "published" ? "Đã xuất bản video." : "Đã lưu bản nháp.");
      }
      setView("list");
    } catch (e) { setErr(String(e)); }
    finally { setSaving(false); }
  };

  /* ─── LIST VIEW ─── */
  if (view === "list") {
    return (
      <div>
        <div style={{ marginBottom: "1.25rem" }}>
          <div style={s.sectionHeader}>
            <div>
              <h2 style={{ ...s.sectionTitle, margin: "0 0 2px" }}>Kiến thức — Video</h2>
              <p style={{ fontSize: "12.5px", color: A.textMuted, margin: 0 }}>
                Quản lý video trong mục Kiến thức · Video
              </p>
            </div>
            <button style={s.btnPrimary} onClick={newVideo}>+ Tạo video mới</button>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.625rem", padding: "0.875rem 1rem", marginBottom: "1rem", background: "#fff", border: `1px solid ${A.border}`, borderRadius: "9px", alignItems: "center" }}>
          <div style={{ position: "relative", flex: "1 1 200px", minWidth: "180px" }}>
            <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: A.textLight, fontSize: "13px", pointerEvents: "none" }}>🔍</span>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm kiếm video..." style={{ ...s.field, paddingLeft: "30px", height: "34px" }} />
          </div>
          <select value={fStatus} onChange={(e) => setFStatus(e.target.value)} style={{ ...s.select, height: "34px", minWidth: "140px" }}>
            <option value="all">Tất cả</option>
            <option value="published">Đã xuất bản</option>
            <option value="draft">Bản nháp</option>
          </select>
          <select value={fFeatured} onChange={(e) => setFFeatured(e.target.value)} style={{ ...s.select, height: "34px", minWidth: "120px" }}>
            <option value="all">Tất cả</option>
            <option value="featured">Nổi bật</option>
          </select>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginLeft: "auto" }}>
            <span style={{ fontSize: "12px", color: A.textLight, whiteSpace: "nowrap" }}>{visible.length} / {videos.length} video</span>
            {isFiltered && (
              <button onClick={() => { setQ(""); setFStatus("all"); setFFeatured("all"); }} style={{ fontSize: "11.5px", color: A.primary, background: "none", border: "none", cursor: "pointer", padding: 0, whiteSpace: "nowrap" }}>
                Xóa bộ lọc ×
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <p style={{ fontSize: "13px", color: A.textMuted }}>Đang tải...</p>
        ) : videos.length === 0 ? (
          <div style={{ ...s.card, textAlign: "center", padding: "4rem 2rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "14px", background: `${A.primary}12`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", color: A.primary }}>▶</div>
            <div>
              <p style={{ fontSize: "15px", fontWeight: 700, color: A.text, margin: "0 0 6px" }}>Chưa có video nào</p>
              <p style={{ fontSize: "13px", color: A.textMuted, margin: 0 }}>Thêm video YouTube đầu tiên để bắt đầu.</p>
            </div>
            <button style={{ ...s.btnPrimary, marginTop: "0.5rem" }} onClick={newVideo}>+ Tạo video đầu tiên</button>
          </div>
        ) : visible.length === 0 ? (
          <div style={{ ...s.card, textAlign: "center", padding: "3rem 2rem" }}>
            <p style={{ fontSize: "14px", fontWeight: 600, color: A.text, margin: "0 0 8px" }}>Không có video phù hợp</p>
            <button style={s.btnSecondary} onClick={() => { setQ(""); setFStatus("all"); setFFeatured("all"); }}>Xóa bộ lọc</button>
          </div>
        ) : (
          <div style={{ ...s.card, padding: 0, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "rgba(0,0,0,0.015)" }}>
                  <th style={{ ...s.th, width: "64px" }}>Thumb</th>
                  <th style={s.th}>Tiêu đề</th>
                  <th style={{ ...s.th, width: "80px" }}>Thời lượng</th>
                  <th style={{ ...s.th, width: "90px" }}>Ngày đăng</th>
                  <th style={{ ...s.th, width: "90px" }}>Trạng thái</th>
                  <th style={{ ...s.th, width: "70px" }}>Nổi bật</th>
                  <th style={{ ...s.th, width: "170px" }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((v, i) => {
                  const thumb = v.thumbnailUrl || (v.youtubeVideoId ? `https://img.youtube.com/vi/${v.youtubeVideoId}/hqdefault.jpg` : "");
                  return (
                    <tr key={v.id} style={{ background: i % 2 === 0 ? "#fff" : "rgba(0,0,0,0.012)" }}>
                      <td style={{ ...s.td, padding: "8px 12px" }}>
                        <div style={{ width: "60px", height: "34px", borderRadius: "5px", overflow: "hidden", background: "#091e1b", border: `1px solid ${A.border}`, flexShrink: 0 }}>
                          {thumb && <img src={thumb} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />}
                        </div>
                      </td>
                      <td style={s.td}>
                        <div>
                          <p style={{ fontSize: "13px", fontWeight: 600, color: A.text, margin: "0 0 2px", maxWidth: "380px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {v.title}
                          </p>
                          <p style={{ fontSize: "11px", color: A.textLight, margin: 0, fontFamily: "monospace" }}>/{v.slug}</p>
                        </div>
                      </td>
                      <td style={s.td}>
                        <span style={{ fontSize: "12px", color: A.textMuted }}>{v.duration ?? "—"}</span>
                      </td>
                      <td style={s.td}>
                        <span style={{ fontSize: "12px", color: A.textLight, whiteSpace: "nowrap" }}>{fmtDate(v.publishDate)}</span>
                      </td>
                      <td style={s.td}><StatusPill status={v.status} /></td>
                      <td style={{ ...s.td, textAlign: "center" }}>
                        <button
                          onClick={() => toggleFeatured(v)}
                          title={v.featured ? "Bỏ nổi bật" : "Bật nổi bật"}
                          style={{ background: "none", border: "none", cursor: "pointer", fontSize: "15px", lineHeight: 1, color: v.featured ? "#d97706" : A.border }}
                        >
                          ★
                        </button>
                      </td>
                      <td style={{ ...s.td, whiteSpace: "nowrap" }}>
                        <div style={{ display: "flex", gap: "4px", flexWrap: "nowrap" }}>
                          <button onClick={() => editVideo(v)} style={{ ...s.btnGhost, fontSize: "11.5px", padding: "4px 10px" }}>Sửa</button>
                          <button onClick={() => toggleStatus(v)} style={{ ...s.btnGhost, fontSize: "11.5px", padding: "4px 10px", color: v.status === "published" ? A.textMuted : A.primary }}>
                            {v.status === "published" ? "Nháp" : "Đăng"}
                          </button>
                          {v.youtubeUrl && (
                            <a href={v.youtubeUrl} target="_blank" rel="noopener noreferrer" style={{ ...s.btnGhost, fontSize: "11.5px", padding: "4px 10px", textDecoration: "none", display: "inline-block", color: "#dc2626" }}>
                              YT
                            </a>
                          )}
                          <button onClick={() => deleteVideo(v.id)} style={{ ...s.btnGhost, fontSize: "11.5px", padding: "4px 10px", color: A.danger }}>Xóa</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
  const publishLabel = isEdit ? (form.status === "published" ? "Cập nhật video" : "Xuất bản") : "Xuất bản";
  const ytId = form.youtubeUrl ? extractYoutubeId(form.youtubeUrl) : null;
  const previewThumb = thumbPreview || (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : "");

  return (
    <div style={{ maxWidth: "800px" }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem", fontSize: "13px", color: A.textMuted }}>
        <button onClick={() => setView("list")} style={{ background: "none", border: "none", cursor: "pointer", color: A.primary, padding: 0, fontSize: "13px" }}>
          Video
        </button>
        <span>›</span>
        <span>{isEdit ? "Chỉnh sửa" : "Tạo mới"}</span>
      </div>

      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ ...s.sectionTitle, margin: "0 0 4px" }}>{isEdit ? "Chỉnh sửa video" : "Tạo video mới"}</h2>
        {isEdit && <p style={{ fontSize: "12px", color: A.textLight, margin: 0 }}>ID: {form.id}</p>}
      </div>

      {err && <div style={s.error}>{err}</div>}

      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

        {/* Basic info */}
        <div style={s.card}>
          <h3 style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: A.textMuted, margin: "0 0 1rem" }}>Thông tin chính</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            <div>
              <label style={s.label}>Tiêu đề *</label>
              <input value={form.title ?? ""} onChange={(e) => handleTitleChange(e.target.value)} placeholder="Nhập tiêu đề video..." style={s.field} />
            </div>
            <div>
              <label style={s.label}>Đường dẫn tĩnh (Slug) *</label>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <input value={form.slug ?? ""} onChange={(e) => setField("slug", slugify(e.target.value))} placeholder="duong-dan-video" style={{ ...s.field, fontFamily: "monospace", fontSize: "12.5px", flex: 1 }} />
                <button type="button" onClick={() => setField("slug", slugify(form.title ?? ""))} style={{ ...s.btnSecondary, padding: "7px 12px", whiteSpace: "nowrap", fontSize: "11.5px" }}>
                  Tự tạo từ tiêu đề
                </button>
              </div>
            </div>
            <div>
              <label style={s.label}>Mô tả ngắn</label>
              <textarea value={form.excerpt ?? ""} onChange={(e) => setField("excerpt", e.target.value)} rows={3} placeholder="Tóm tắt nội dung video..." style={s.textarea} />
            </div>
          </div>
        </div>

        {/* YouTube */}
        <div style={s.card}>
          <h3 style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: A.textMuted, margin: "0 0 1rem" }}>YouTube</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            <div>
              <label style={s.label}>Link YouTube *</label>
              <input
                value={form.youtubeUrl ?? ""}
                onChange={(e) => handleYoutubeUrlChange(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                style={{ ...s.field, fontFamily: "monospace", fontSize: "13px" }}
              />
              {form.youtubeUrl && !isValidYoutubeUrl(form.youtubeUrl) && (
                <p style={{ fontSize: "11px", color: A.danger, margin: "4px 0 0" }}>Link YouTube không hợp lệ.</p>
              )}
              {ytId && <p style={{ fontSize: "11px", color: A.primary, margin: "4px 0 0" }}>Video ID: {ytId}</p>}
            </div>

            {/* Thumbnail preview */}
            {previewThumb && (
              <div>
                <label style={{ ...s.label, marginBottom: "6px" }}>Xem trước thumbnail</label>
                <img src={previewThumb} alt="" style={{ maxWidth: "240px", borderRadius: "7px", border: `1px solid ${A.border}`, display: "block" }} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
              </div>
            )}

            <div>
              <label style={s.label}>Ảnh thumbnail (URL tùy chỉnh)</label>
              <input
                value={form.thumbnailUrl ?? ""}
                onChange={(e) => { setField("thumbnailUrl", e.target.value); setThumbPreview(e.target.value); }}
                placeholder="Để trống để dùng thumbnail YouTube tự động"
                style={s.field}
              />
            </div>
            <div>
              <label style={s.label}>Alt thumbnail</label>
              <input value={form.thumbnailAlt ?? ""} onChange={(e) => setField("thumbnailAlt", e.target.value)} placeholder="Mô tả ảnh..." style={s.field} />
            </div>
          </div>
        </div>

        {/* Meta */}
        <div style={s.card}>
          <h3 style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: A.textMuted, margin: "0 0 1rem" }}>Phân loại & Meta</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem" }}>
            <div>
              <label style={s.label}>Thời lượng</label>
              <input value={form.duration ?? ""} onChange={(e) => setField("duration", e.target.value)} placeholder="12:34" style={s.field} />
            </div>
            <div>
              <label style={s.label}>Ngày đăng</label>
              <input
                type="date"
                value={form.publishDate ? new Date(form.publishDate).toISOString().slice(0, 10) : ""}
                onChange={(e) => setField("publishDate", e.target.value ? new Date(e.target.value).toISOString() : null)}
                style={s.field}
              />
            </div>
            <div>
              <label style={s.label}>Chủ đề (slug)</label>
              <input value={form.topicSlug ?? ""} onChange={(e) => setField("topicSlug", e.target.value)} placeholder="ten-chu-de" style={s.field} />
            </div>
            <div>
              <label style={s.label}>Series (slug)</label>
              <input value={form.seriesSlug ?? ""} onChange={(e) => setField("seriesSlug", e.target.value)} placeholder="ten-series" style={s.field} />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={s.label}>Danh mục (phân cách bằng dấu phẩy)</label>
              <input
                value={form.categoriesInput ?? ""}
                onChange={(e) => setField("categoriesInput", e.target.value)}
                placeholder={CATEGORY_OPTIONS.slice(0, 3).join(", ")}
                style={s.field}
              />
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "6px" }}>
                {CATEGORY_OPTIONS.map((cat) => {
                  const cats = (form.categoriesInput ?? "").split(",").map((c) => c.trim()).filter(Boolean);
                  const active = cats.includes(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        const next = active ? cats.filter((c) => c !== cat) : [...cats, cat];
                        setField("categoriesInput", next.join(", "));
                      }}
                      style={{
                        padding: "3px 10px", borderRadius: "5px", border: `1px solid ${active ? A.primary : A.border}`,
                        background: active ? `${A.primary}12` : "transparent",
                        color: active ? A.primary : A.textMuted,
                        fontSize: "11.5px", cursor: "pointer",
                      }}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Publish settings */}
        <div style={s.card}>
          <h3 style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: A.textMuted, margin: "0 0 1rem" }}>Xuất bản</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            <div>
              <label style={s.label}>Trạng thái</label>
              <select value={form.status ?? "draft"} onChange={(e) => setField("status", e.target.value)} style={{ ...s.select, maxWidth: "200px" }}>
                <option value="draft">Bản nháp</option>
                <option value="published">Đã xuất bản</option>
              </select>
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", userSelect: "none" }}>
              <input type="checkbox" checked={form.featured ?? false} onChange={(e) => setField("featured", e.target.checked)} style={{ width: "15px", height: "15px", cursor: "pointer" }} />
              <span style={{ fontSize: "13px", color: A.text, fontWeight: 500 }}>Video nổi bật (hiển thị trong lưới)</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", userSelect: "none" }}>
              <input type="checkbox" checked={form.isFeaturedVideo ?? false} onChange={(e) => setField("isFeaturedVideo", e.target.checked)} style={{ width: "15px", height: "15px", cursor: "pointer" }} />
              <span style={{ fontSize: "13px", color: A.text, fontWeight: 500 }}>Video được chọn nổi bật (hero card, trang chủ)</span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", paddingBottom: "2rem" }}>
          <button onClick={() => save("published")} disabled={saving} style={{ ...s.btnPrimary, opacity: saving ? 0.6 : 1 }}>
            {saving ? "Đang lưu..." : publishLabel}
          </button>
          <button onClick={() => save("draft")} disabled={saving} style={{ ...s.btnSecondary, opacity: saving ? 0.6 : 1 }}>
            Lưu bản nháp
          </button>
          <button onClick={() => setView("list")} disabled={saving} style={{ ...s.btnGhost, color: A.textMuted }}>
            Hủy
          </button>
        </div>
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
