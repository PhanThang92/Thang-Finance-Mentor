import React, { useEffect, useState, useCallback, useMemo } from "react";
import { adminApi, type Video, type Topic, type Series } from "@/lib/newsApi";
import { A, s, fmtDate, slugify } from "./shared";
import { ImageUploadField } from "./ImageUploadField";

/* ── Category options ────────────────────────────────────────────────── */
const CATEGORY_OPTIONS = ["Tài chính cá nhân", "Đầu tư dài hạn", "Tư duy tích sản", "Nổi bật", "Series"];

/* ── YouTube helpers ─────────────────────────────────────────────────── */
function isValidYoutubeUrl(url: string): boolean {
  try { const u = new URL(url); return u.hostname.includes("youtube.com") || u.hostname.includes("youtu.be"); }
  catch { return false; }
}
function extractYoutubeId(url: string): string | null {
  try { const u = new URL(url); if (u.hostname.includes("youtu.be")) return u.pathname.slice(1).split("?")[0]; return u.searchParams.get("v"); }
  catch { return null; }
}
function youtubeThumbnail(url: string): string {
  const id = extractYoutubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : "";
}

/* ── Toast ───────────────────────────────────────────────────────────── */
function Toast({ msg, type, onClose }: { msg: string; type: "ok" | "err"; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3200); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 500, background: type === "ok" ? A.primary : A.danger, color: "#fff", borderRadius: "9px", padding: "11px 18px", fontSize: "13px", fontWeight: 500, boxShadow: "0 4px 18px rgba(0,0,0,0.18)" }}>
      {msg}
    </div>
  );
}

/* ── Status pill ─────────────────────────────────────────────────────── */
function StatusPill({ status }: { status: string }) {
  const pub = status === "published";
  return (
    <span style={{ display: "inline-block", whiteSpace: "nowrap", fontSize: "10px", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", padding: "2px 8px", borderRadius: "5px", background: pub ? "rgba(26,120,104,0.10)" : "rgba(0,0,0,0.06)", color: pub ? A.primary : A.textMuted }}>
      {pub ? "Đã đăng" : "Nháp"}
    </span>
  );
}

/* ── SEO Preview ─────────────────────────────────────────────────────── */
function SeoPreview({ title, description, slug }: { title: string; description: string; slug: string }) {
  if (!title && !description) return null;
  return (
    <div style={{ marginTop: "12px", padding: "12px 14px", background: "#f8f9fa", borderRadius: "7px", border: "1px solid #e8eaed", maxWidth: "480px" }}>
      <p style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.10em", textTransform: "uppercase", color: A.textLight, margin: "0 0 6px" }}>Xem trước SEO</p>
      <p style={{ fontSize: "12px", color: "#1a0dab", margin: "0 0 2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title || "(tiêu đề trang)"}</p>
      <p style={{ fontSize: "11px", color: "#006621", margin: "0 0 2px" }}>thangswc.com/video/{slug || "…"}</p>
      <p style={{ fontSize: "11.5px", color: "#545454", margin: 0, lineHeight: 1.5 }}>{description || "(mô tả SEO)"}</p>
    </div>
  );
}

/* ── Form type ───────────────────────────────────────────────────────── */
type Form = Partial<Video> & { categoriesInput: string };

const EMPTY: Form = {
  title: "", slug: "", excerpt: "",
  youtubeUrl: "", youtubeVideoId: "", thumbnailUrl: "", thumbnailAlt: "", thumbnailSmallUrl: "",
  duration: "", publishDate: null,
  featured: false, isFeaturedVideo: false, status: "draft",
  topicSlug: "", seriesSlug: "",
  categoriesInput: "",
  seoTitle: "", seoDescription: "", seoKeywords: "",
  ogTitle: "", ogDescription: "", ogImageUrl: "", canonicalUrl: "", noindex: false,
  showOnHomepage: false, displayOrder: 0,
};

function catsToString(cats: string[] | null | undefined) { return (cats ?? []).join(", "); }
function stringToCats(s: string) { return s.split(",").map((c) => c.trim()).filter(Boolean); }

/* ── Main component ──────────────────────────────────────────────────── */
export function VideosPanel({ adminKey }: { adminKey: string }) {
  const [videos, setVideos]     = useState<Video[]>([]);
  const [topics, setTopics]     = useState<Topic[]>([]);
  const [series, setSeries]     = useState<Series[]>([]);
  const [loading, setLoading]   = useState(true);
  const [view, setView]         = useState<"list" | "form">("list");
  const [originalSlug, setOriginalSlug] = useState("");
  const [form, setForm]         = useState<Form>(EMPTY);
  const [saving, setSaving]     = useState(false);
  const [err, setErr]           = useState("");
  const [toast, setToast]       = useState<{ msg: string; type: "ok" | "err" } | null>(null);
  const [showSeo, setShowSeo]   = useState(false);
  const [ytErr, setYtErr]       = useState("");
  const [ogGenerating, setOgGenerating] = useState(false);

  const [q, setQ]               = useState("");
  const [fStatus, setFStatus]   = useState("all");
  const [fFeatured, setFFeatured] = useState("all");
  const [fHomepage, setFHomepage] = useState("all");

  const showToast = useCallback((msg: string, type: "ok" | "err" = "ok") => setToast({ msg, type }), []);

  const generateOg = useCallback(async () => {
    if (!form.id) return;
    setOgGenerating(true);
    try {
      const result = await adminApi.generateVideoOg(adminKey, form.id);
      setForm((prev) => ({ ...prev, generatedOgImageUrl: result.generatedOgImageUrl, ogImageGenerated: true }));
      showToast("Đã tạo ảnh chia sẻ thành công.");
    } catch {
      showToast("Không thể tạo ảnh chia sẻ, vui lòng thử lại.", "err");
    } finally {
      setOgGenerating(false);
    }
  }, [form.id, adminKey, showToast]);

  const reload = useCallback(() => {
    setLoading(true);
    Promise.all([
      adminApi.getVideos(adminKey),
      adminApi.getContentMeta(adminKey),
    ]).then(([vids, meta]) => {
      setVideos(vids);
      setTopics(meta.topics);
      setSeries(meta.series);
    }).catch(console.error).finally(() => setLoading(false));
  }, [adminKey]);

  useEffect(() => { reload(); }, [reload]);

  const visible = useMemo(() => videos.filter((v) => {
    if (fStatus !== "all" && v.status !== fStatus) return false;
    if (fFeatured === "featured" && !v.featured) return false;
    if (fHomepage === "homepage" && !v.showOnHomepage) return false;
    if (q.trim()) {
      const lq = q.toLowerCase();
      return v.title.toLowerCase().includes(lq) || v.slug.toLowerCase().includes(lq) || (v.excerpt ?? "").toLowerCase().includes(lq);
    }
    return true;
  }), [videos, q, fStatus, fFeatured, fHomepage]);

  const isFiltered = q || fStatus !== "all" || fFeatured !== "all" || fHomepage !== "all";

  const newVideo = () => { setForm({ ...EMPTY }); setOriginalSlug(""); setErr(""); setYtErr(""); setShowSeo(false); setView("form"); };
  const editVideo = (v: Video) => {
    setForm({ ...v, categoriesInput: catsToString(v.categories) });
    setOriginalSlug(v.slug); setErr(""); setYtErr(""); setShowSeo(false); setView("form");
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

  const handleYoutubeUrlChange = (url: string) => {
    setYtErr("");
    setForm((f) => {
      const updates: Partial<Form> = { youtubeUrl: url };
      if (url && isValidYoutubeUrl(url)) {
        const autoThumb = youtubeThumbnail(url);
        if (autoThumb && !f.thumbnailUrl) updates.thumbnailUrl = autoThumb;
      } else if (url) {
        setYtErr("Link YouTube không hợp lệ.");
      }
      return { ...f, ...updates };
    });
  };

  const toggleCategory = (cat: string) => {
    setForm((f) => {
      const current = stringToCats(f.categoriesInput ?? "");
      const next = current.includes(cat) ? current.filter((c) => c !== cat) : [...current, cat];
      return { ...f, categoriesInput: next.join(", ") };
    });
  };

  const save = async (status: "draft" | "published") => {
    if (!form.title?.trim()) { setErr("Vui lòng nhập tiêu đề."); return; }
    if (!form.slug?.trim())  { setErr("Vui lòng nhập đường dẫn tĩnh."); return; }
    if (!form.youtubeUrl?.trim()) { setErr("Vui lòng nhập link YouTube."); return; }
    if (!isValidYoutubeUrl(form.youtubeUrl ?? "")) { setErr("Link YouTube không hợp lệ."); return; }

    setSaving(true); setErr("");
    const categories = stringToCats(form.categoriesInput ?? "");
    const payload: Partial<Video> = { ...form, status, categories };
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

  const setField = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  /* ─── LIST VIEW ─── */
  if (view === "list") {
    return (
      <div>
        <div style={s.sectionHeader}>
          <div>
            <h2 style={{ ...s.sectionTitle, margin: "0 0 2px" }}>Kiến thức — Video</h2>
            <p style={{ fontSize: "12.5px", color: A.textMuted, margin: 0 }}>Quản lý video trong mục Kiến thức</p>
          </div>
          <button style={s.btnPrimary} onClick={newVideo}>+ Thêm video mới</button>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.625rem", padding: "0.875rem 1rem", marginBottom: "1rem", background: "#fff", border: `1px solid ${A.border}`, borderRadius: "9px", alignItems: "center" }}>
          <div style={{ position: "relative", flex: "1 1 200px", minWidth: "180px" }}>
            <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: A.textLight, pointerEvents: "none" }}>⌕</span>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm kiếm video..." style={{ ...s.field, paddingLeft: "28px", height: "34px" }} />
          </div>
          <select value={fStatus} onChange={(e) => setFStatus(e.target.value)} style={{ ...s.select, height: "34px", minWidth: "140px" }}>
            <option value="all">Tất cả trạng thái</option>
            <option value="published">Đã xuất bản</option>
            <option value="draft">Bản nháp</option>
          </select>
          <select value={fFeatured} onChange={(e) => setFFeatured(e.target.value)} style={{ ...s.select, height: "34px", minWidth: "120px" }}>
            <option value="all">Tất cả</option>
            <option value="featured">Nổi bật</option>
          </select>
          <select value={fHomepage} onChange={(e) => setFHomepage(e.target.value)} style={{ ...s.select, height: "34px", minWidth: "150px" }}>
            <option value="all">Tất cả hiển thị</option>
            <option value="homepage">Hiển thị trang chủ</option>
          </select>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginLeft: "auto" }}>
            <span style={{ fontSize: "12px", color: A.textLight }}>{visible.length} / {videos.length} video</span>
            {isFiltered && (
              <button onClick={() => { setQ(""); setFStatus("all"); setFFeatured("all"); setFHomepage("all"); }} style={{ fontSize: "11.5px", color: A.primary, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                Xóa bộ lọc ×
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <p style={{ fontSize: "13px", color: A.textMuted }}>Đang tải...</p>
        ) : videos.length === 0 ? (
          <div style={{ ...s.card, textAlign: "center", padding: "4rem 2rem" }}>
            <p style={{ fontSize: "15px", fontWeight: 700, color: A.text, margin: "0 0 6px" }}>Chưa có video nào</p>
            <p style={{ fontSize: "13px", color: A.textMuted, margin: "0 0 1.5rem" }}>Thêm video đầu tiên để bắt đầu xây dựng nội dung.</p>
            <button style={s.btnPrimary} onClick={newVideo}>+ Thêm video đầu tiên</button>
          </div>
        ) : visible.length === 0 ? (
          <div style={{ ...s.card, textAlign: "center", padding: "3rem 2rem" }}>
            <p style={{ fontSize: "14px", fontWeight: 600, color: A.text, margin: "0 0 8px" }}>Không có video phù hợp</p>
            <button style={s.btnSecondary} onClick={() => { setQ(""); setFStatus("all"); setFFeatured("all"); setFHomepage("all"); }}>Xóa bộ lọc</button>
          </div>
        ) : (
          <div style={{ ...s.card, padding: 0, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "rgba(0,0,0,0.015)" }}>
                  <th style={s.th}>Video</th>
                  <th style={{ ...s.th, width: "110px" }}>Chủ đề</th>
                  <th style={{ ...s.th, width: "80px" }}>Ngày đăng</th>
                  <th style={{ ...s.th, width: "90px" }}>Trạng thái</th>
                  <th style={{ ...s.th, width: "60px", textAlign: "center" }}>Nổi bật</th>
                  <th style={{ ...s.th, width: "60px", textAlign: "center" }}>Trang chủ</th>
                  <th style={{ ...s.th, width: "180px" }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((v, i) => {
                  const thumb = v.thumbnailUrl || (v.youtubeVideoId ? `https://img.youtube.com/vi/${v.youtubeVideoId}/default.jpg` : "");
                  const ytLink = v.youtubeUrl;
                  const topicLabel = topics.find((t) => t.slug === v.topicSlug)?.title ?? v.topicSlug ?? "—";
                  return (
                    <tr key={v.id} style={{ background: i % 2 === 0 ? "#fff" : "rgba(0,0,0,0.012)" }}>
                      <td style={s.td}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                          {thumb && (
                            <img src={thumb} alt="" style={{ width: "56px", height: "36px", objectFit: "cover", borderRadius: "5px", flexShrink: 0, border: `1px solid ${A.border}` }} />
                          )}
                          <div>
                            <p style={{ fontSize: "13px", fontWeight: 600, color: A.text, margin: "0 0 2px", maxWidth: "280px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{v.title}</p>
                            <p style={{ fontSize: "11px", color: A.textLight, margin: 0, fontFamily: "monospace" }}>/{v.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td style={s.td}><span style={{ fontSize: "12px", color: A.textMuted }}>{topicLabel}</span></td>
                      <td style={s.td}><span style={{ fontSize: "12px", color: A.textLight, whiteSpace: "nowrap" }}>{fmtDate(v.publishDate)}</span></td>
                      <td style={s.td}><StatusPill status={v.status} /></td>
                      <td style={{ ...s.td, textAlign: "center" }}>
                        <button onClick={() => toggleFeatured(v)} title={v.featured ? "Bỏ nổi bật" : "Bật nổi bật"}
                          style={{ background: "none", border: "none", cursor: "pointer", fontSize: "15px", lineHeight: 1, color: v.featured ? "#d97706" : A.border }}>★</button>
                      </td>
                      <td style={{ ...s.td, textAlign: "center" }}>
                        <span title={v.showOnHomepage ? "Hiển thị trang chủ" : "Không hiển thị trang chủ"}
                          style={{ fontSize: "13px", color: v.showOnHomepage ? A.primary : A.border }}>
                          {v.showOnHomepage ? "◉" : "○"}
                        </span>
                      </td>
                      <td style={{ ...s.td, whiteSpace: "nowrap" }}>
                        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                          <button onClick={() => editVideo(v)} style={{ ...s.btnGhost, fontSize: "11.5px", padding: "4px 10px" }}>Sửa</button>
                          {v.status === "published" && (
                            <a href={`/video/${v.slug}`} target="_blank" rel="noopener noreferrer"
                              style={{ ...s.btnGhost, fontSize: "11.5px", padding: "4px 10px", textDecoration: "none", color: A.primary }}>
                              Xem video
                            </a>
                          )}
                          <button onClick={() => toggleStatus(v)} style={{ ...s.btnGhost, fontSize: "11.5px", padding: "4px 10px", color: v.status === "published" ? A.textMuted : A.primary }}>
                            {v.status === "published" ? "Nháp" : "Đăng"}
                          </button>
                          {ytLink && (
                            <a href={ytLink} target="_blank" rel="noopener noreferrer" style={{ ...s.btnGhost, fontSize: "11.5px", padding: "4px 10px", color: "#dc2626", textDecoration: "none" }}>YT</a>
                          )}
                          <button onClick={() => deleteVideo(v.id!)} style={{ ...s.btnGhost, fontSize: "11.5px", padding: "4px 10px", color: A.danger }}>Xóa</button>
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
  const activeCats = stringToCats(form.categoriesInput ?? "");
  const seoTitlePreview = form.seoTitle || form.title || "";
  const seoDescPreview  = form.seoDescription || form.excerpt || "";

  return (
    <div style={{ maxWidth: "820px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem", fontSize: "13px", color: A.textMuted }}>
        <button onClick={() => setView("list")} style={{ background: "none", border: "none", cursor: "pointer", color: A.primary, padding: 0, fontSize: "13px" }}>Video</button>
        <span>›</span>
        <span>{isEdit ? "Chỉnh sửa" : "Thêm mới"}</span>
      </div>

      <div style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ ...s.sectionTitle, margin: "0 0 4px" }}>{isEdit ? "Chỉnh sửa video" : "Thêm video mới"}</h2>
          {isEdit && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <p style={{ fontSize: "12px", color: A.textLight, margin: 0 }}>ID: {form.id}</p>
              {form.status === "published" && form.slug && (
                <a href={`/video/${form.slug}`} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: "12px", color: A.primary, textDecoration: "none", fontWeight: 500 }}>
                  Xem video ↗
                </a>
              )}
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: "0.625rem" }}>
          <button onClick={() => save("published")} disabled={saving} style={{ ...s.btnPrimary, opacity: saving ? 0.6 : 1 }}>{saving ? "Đang lưu..." : publishLabel}</button>
          <button onClick={() => save("draft")} disabled={saving} style={{ ...s.btnSecondary, opacity: saving ? 0.6 : 1 }}>Lưu nháp</button>
          <button onClick={() => setView("list")} disabled={saving} style={{ ...s.btnGhost, color: A.textMuted }}>Hủy</button>
        </div>
      </div>

      {err && <div style={s.error}>{err}</div>}

      {isEdit && originalSlug && form.status === "published" && form.slug !== originalSlug && (
        <div style={{ marginBottom: "1rem", padding: "10px 14px", background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: "8px", fontSize: "12.5px", color: "#92400e", lineHeight: 1.6 }}>
          <strong>Lưu ý:</strong> Bạn đang thay đổi đường dẫn của một video đã xuất bản. Điều này có thể làm hỏng liên kết đang được chia sẻ và ảnh hưởng đến SEO. Đường dẫn cũ: <code style={{ fontFamily: "monospace", background: "rgba(0,0,0,0.06)", padding: "1px 5px", borderRadius: "3px" }}>/{originalSlug}</code>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

        {/* 1. Thông tin chính */}
        <div style={s.card}>
          <h3 style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: A.textMuted, margin: "0 0 1rem" }}>Thông tin chính</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            <div>
              <label style={s.label}>Tiêu đề *</label>
              <input value={form.title ?? ""} onChange={(e) => {
                const title = e.target.value;
                setForm((f) => ({ ...f, title, slug: f.id ? f.slug : slugify(title) }));
              }} placeholder="Tiêu đề video..." style={s.field} />
            </div>
            <div>
              <label style={s.label}>Đường dẫn tĩnh *</label>
              <div style={{ display: "flex", gap: "8px" }}>
                <input value={form.slug ?? ""} onChange={(e) => setField("slug", slugify(e.target.value))} placeholder="ten-video" style={{ ...s.field, fontFamily: "monospace", fontSize: "12.5px", flex: 1 }} />
                <button type="button" onClick={() => setField("slug", slugify(form.title ?? ""))} style={{ ...s.btnSecondary, padding: "7px 12px", fontSize: "11.5px", whiteSpace: "nowrap" }}>Tự tạo</button>
              </div>
            </div>
            <div>
              <label style={s.label}>Mô tả ngắn</label>
              <textarea value={form.excerpt ?? ""} onChange={(e) => setField("excerpt", e.target.value)} rows={3} placeholder="Mô tả ngắn về video..." style={s.textarea} />
            </div>
          </div>
        </div>

        {/* 2. Liên kết & Thumbnail */}
        <div style={s.card}>
          <h3 style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: A.textMuted, margin: "0 0 1rem" }}>Liên kết & Thumbnail</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            <div>
              <label style={s.label}>Link YouTube *</label>
              <input value={form.youtubeUrl ?? ""} onChange={(e) => handleYoutubeUrlChange(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." style={{ ...s.field, borderColor: ytErr ? A.danger : undefined }} />
              {ytErr && <p style={{ fontSize: "11.5px", color: A.danger, margin: "4px 0 0" }}>{ytErr}</p>}
              {form.youtubeUrl && isValidYoutubeUrl(form.youtubeUrl) && (
                <p style={{ fontSize: "11.5px", color: A.primary, margin: "4px 0 0" }}>
                  Video ID: <code style={{ background: "rgba(26,120,104,0.08)", padding: "1px 5px", borderRadius: "3px" }}>{extractYoutubeId(form.youtubeUrl)}</code>
                </p>
              )}
            </div>
            <div>
              <label style={s.label}>Ảnh thumbnail (16:9 · watermark tự động)</label>
              <ImageUploadField
                adminKey={adminKey}
                value={form.thumbnailUrl ?? ""}
                thumbnailValue={form.thumbnailSmallUrl ?? ""}
                context="videos"
                onUpload={(result) => setForm((f) => ({ ...f, thumbnailUrl: result.display, thumbnailSmallUrl: result.thumbnail }))}
                onClear={() => setForm((f) => ({ ...f, thumbnailUrl: "", thumbnailSmallUrl: "" }))}
              />
              {form.youtubeUrl && isValidYoutubeUrl(form.youtubeUrl) && !form.thumbnailUrl && (
                <button
                  type="button"
                  onClick={() => setField("thumbnailUrl", youtubeThumbnail(form.youtubeUrl ?? ""))}
                  style={{ ...s.btnSecondary, fontSize: "11.5px", padding: "5px 12px", marginTop: "8px" }}
                >
                  Dùng thumbnail YouTube thay thế
                </button>
              )}
            </div>
            <div>
              <label style={s.label}>Alt thumbnail</label>
              <input value={form.thumbnailAlt ?? ""} onChange={(e) => setField("thumbnailAlt", e.target.value)} placeholder="Mô tả thumbnail..." style={s.field} />
            </div>
            <div>
              <label style={s.label}>Thời lượng</label>
              <input value={form.duration ?? ""} onChange={(e) => setField("duration", e.target.value)} placeholder="12:34" style={{ ...s.field, maxWidth: "160px" }} />
            </div>
          </div>
        </div>

        {/* 3. Phân loại */}
        <div style={s.card}>
          <h3 style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: A.textMuted, margin: "0 0 1rem" }}>Phân loại</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem" }}>
            <div>
              <label style={s.label}>Chủ đề</label>
              <select value={form.topicSlug ?? ""} onChange={(e) => setField("topicSlug", e.target.value)} style={s.select}>
                <option value="">— Chọn chủ đề —</option>
                {topics.map((t) => <option key={t.slug} value={t.slug}>{t.title}</option>)}
                {topics.length === 0 && <option disabled value="">Chưa có chủ đề</option>}
              </select>
            </div>
            <div>
              <label style={s.label}>Series</label>
              <select value={form.seriesSlug ?? ""} onChange={(e) => setField("seriesSlug", e.target.value)} style={s.select}>
                <option value="">— Chọn series —</option>
                {series.map((sr) => <option key={sr.slug} value={sr.slug}>{sr.title}</option>)}
                {series.length === 0 && <option disabled value="">Chưa có series</option>}
              </select>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={s.label}>Danh mục</label>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "6px" }}>
                {CATEGORY_OPTIONS.map((cat) => (
                  <button key={cat} type="button" onClick={() => toggleCategory(cat)} style={{
                    padding: "4px 12px", borderRadius: "999px", border: `1px solid ${activeCats.includes(cat) ? A.primary : A.border}`,
                    background: activeCats.includes(cat) ? `${A.primary}12` : "transparent",
                    color: activeCats.includes(cat) ? A.primary : A.textMuted,
                    fontSize: "12px", fontWeight: activeCats.includes(cat) ? 600 : 400, cursor: "pointer",
                  }}>
                    {cat}
                  </button>
                ))}
              </div>
              <input value={form.categoriesInput ?? ""} onChange={(e) => setField("categoriesInput", e.target.value)} placeholder="Hoặc nhập thủ công, phân cách bằng dấu phẩy..." style={s.field} />
            </div>
            <div>
              <label style={s.label}>Ngày đăng</label>
              <input type="date"
                value={form.publishDate ? new Date(form.publishDate).toISOString().slice(0, 10) : ""}
                onChange={(e) => setField("publishDate", e.target.value ? new Date(e.target.value).toISOString() : null)}
                style={s.field} />
            </div>
          </div>
        </div>

        {/* 4. Hiển thị */}
        <div style={s.card}>
          <h3 style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: A.textMuted, margin: "0 0 1rem" }}>Hiển thị & Xuất bản</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem", marginBottom: "0.875rem" }}>
            <div>
              <label style={s.label}>Trạng thái</label>
              <select value={form.status ?? "draft"} onChange={(e) => setField("status", e.target.value)} style={s.select}>
                <option value="draft">Bản nháp</option>
                <option value="published">Đã xuất bản</option>
              </select>
            </div>
            <div>
              <label style={s.label}>Thứ tự nổi bật</label>
              <input type="number" value={form.displayOrder ?? 0} onChange={(e) => setField("displayOrder", Number(e.target.value))} min={0} style={s.field} />
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", userSelect: "none" }}>
              <input type="checkbox" checked={form.featured ?? false} onChange={(e) => setField("featured", e.target.checked)} style={{ width: "15px", height: "15px", cursor: "pointer" }} />
              <span style={{ fontSize: "13px", color: A.text, fontWeight: 500 }}>Video nổi bật</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", userSelect: "none" }}>
              <input type="checkbox" checked={form.isFeaturedVideo ?? false} onChange={(e) => setField("isFeaturedVideo", e.target.checked)} style={{ width: "15px", height: "15px", cursor: "pointer" }} />
              <span style={{ fontSize: "13px", color: A.text, fontWeight: 500 }}>Video được chọn nổi bật (hiển thị trên trang chủ)</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", userSelect: "none" }}>
              <input type="checkbox" checked={form.showOnHomepage ?? false} onChange={(e) => setField("showOnHomepage", e.target.checked)} style={{ width: "15px", height: "15px", cursor: "pointer" }} />
              <span style={{ fontSize: "13px", color: A.text, fontWeight: 500 }}>Hiển thị ở trang chủ</span>
            </label>
          </div>
        </div>

        {/* 5. SEO (collapsible) */}
        <div style={s.card}>
          <button type="button" onClick={() => setShowSeo((v) => !v)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: A.textMuted }}>SEO & Chia sẻ</span>
            <span style={{ fontSize: "12px", color: A.textLight, transform: showSeo ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▼</span>
          </button>

          {showSeo && (
            <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              <div style={{ background: "rgba(26,120,104,0.05)", borderRadius: "7px", padding: "9px 13px", fontSize: "12px", color: A.textMuted, lineHeight: 1.6 }}>
                Nếu để trống, tiêu đề SEO sẽ dùng tiêu đề video và mô tả SEO sẽ dùng mô tả ngắn.
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem" }}>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={s.label}>Tiêu đề SEO</label>
                  <input value={form.seoTitle ?? ""} onChange={(e) => setField("seoTitle", e.target.value)} placeholder={form.title || ""} style={s.field} maxLength={70} />
                  <p style={{ fontSize: "10.5px", color: A.textLight, margin: "4px 0 0" }}>{(form.seoTitle ?? "").length}/70 ký tự</p>
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={s.label}>Mô tả SEO</label>
                  <textarea value={form.seoDescription ?? ""} onChange={(e) => setField("seoDescription", e.target.value)} rows={3} placeholder={form.excerpt || ""} style={s.textarea} maxLength={160} />
                  <p style={{ fontSize: "10.5px", color: A.textLight, margin: "4px 0 0" }}>{(form.seoDescription ?? "").length}/160 ký tự</p>
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={s.label}>Từ khóa SEO</label>
                  <input value={form.seoKeywords ?? ""} onChange={(e) => setField("seoKeywords", e.target.value)} placeholder="đầu tư, tài chính cá nhân..." style={s.field} />
                </div>
              </div>
              <SeoPreview title={seoTitlePreview} description={seoDescPreview} slug={form.slug ?? ""} />
              <div style={{ borderTop: `1px solid ${A.border}`, paddingTop: "0.875rem" }}>
                <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: A.textLight, margin: "0 0 0.75rem" }}>Open Graph (Mạng xã hội)</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem" }}>
                  <div>
                    <label style={s.label}>Tiêu đề Open Graph</label>
                    <input value={form.ogTitle ?? ""} onChange={(e) => setField("ogTitle", e.target.value)} placeholder={form.seoTitle || form.title || ""} style={s.field} />
                  </div>
                  <div>
                    <label style={s.label}>Ảnh chia sẻ tùy chỉnh (ghi đè ảnh tự động)</label>
                    <input value={form.ogImageUrl ?? ""} onChange={(e) => setField("ogImageUrl", e.target.value)} placeholder="https://... (để trống để dùng ảnh tự động)" style={s.field} />
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={s.label}>Mô tả Open Graph</label>
                    <textarea value={form.ogDescription ?? ""} onChange={(e) => setField("ogDescription", e.target.value)} rows={2} placeholder={form.seoDescription || form.excerpt || ""} style={s.textarea} />
                  </div>
                  <div>
                    <label style={s.label}>Canonical URL</label>
                    <input value={form.canonicalUrl ?? ""} onChange={(e) => setField("canonicalUrl", e.target.value)} placeholder="https://thangswc.com/video/..." style={s.field} />
                  </div>
                </div>
              </div>

              {/* OG image generation */}
              <div style={{ borderTop: `1px solid ${A.border}`, paddingTop: "0.875rem" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                  <div>
                    <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: A.textLight, margin: 0 }}>Ảnh chia sẻ tự động</p>
                    <p style={{ fontSize: "11.5px", color: A.textMuted, margin: "3px 0 0" }}>Tạo ảnh thương hiệu 1200×630 từ tiêu đề video.</p>
                  </div>
                  {form.id ? (
                    <button
                      type="button"
                      onClick={generateOg}
                      disabled={ogGenerating}
                      style={{ ...s.btnSecondary, fontSize: "12px", padding: "7px 14px", opacity: ogGenerating ? 0.6 : 1, whiteSpace: "nowrap", flexShrink: 0 }}
                    >
                      {ogGenerating ? "Đang tạo..." : form.ogImageGenerated ? "Tạo lại ảnh chia sẻ" : "Tạo ảnh chia sẻ"}
                    </button>
                  ) : (
                    <span style={{ fontSize: "11.5px", color: A.textMuted, fontStyle: "italic" }}>Lưu video trước khi tạo ảnh.</span>
                  )}
                </div>
                {form.generatedOgImageUrl ? (
                  <div style={{ border: `1px solid ${A.border}`, borderRadius: "8px", overflow: "hidden", background: "#f5f6f7" }}>
                    <div style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: A.textMuted, padding: "7px 12px", borderBottom: `1px solid ${A.border}`, background: "#fff" }}>
                      Xem trước ảnh chia sẻ
                    </div>
                    <div style={{ aspectRatio: "1200/630", maxHeight: "220px", overflow: "hidden" }}>
                      <img src={form.generatedOgImageUrl} alt="OG preview" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    </div>
                    <div style={{ padding: "7px 12px", fontSize: "11px", color: A.textMuted, display: "flex", gap: "10px", alignItems: "center" }}>
                      <span>URL:</span>
                      <code style={{ fontSize: "10.5px", background: "#f0f0f0", padding: "2px 6px", borderRadius: "4px", wordBreak: "break-all" }}>{form.generatedOgImageUrl}</code>
                    </div>
                  </div>
                ) : (
                  <div style={{ border: `1px dashed ${A.border}`, borderRadius: "8px", padding: "24px", textAlign: "center", color: A.textMuted, fontSize: "13px" }}>
                    Chưa có ảnh chia sẻ tự động.
                  </div>
                )}
              </div>

              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", userSelect: "none" }}>
                <input type="checkbox" checked={form.noindex ?? false} onChange={(e) => setField("noindex", e.target.checked)} style={{ width: "15px", height: "15px", cursor: "pointer" }} />
                <span style={{ fontSize: "13px", color: A.text, fontWeight: 500 }}>Không lập chỉ mục (noindex)</span>
              </label>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", paddingBottom: "2rem" }}>
          <button onClick={() => save("published")} disabled={saving} style={{ ...s.btnPrimary, opacity: saving ? 0.6 : 1 }}>{saving ? "Đang lưu..." : publishLabel}</button>
          <button onClick={() => save("draft")} disabled={saving} style={{ ...s.btnSecondary, opacity: saving ? 0.6 : 1 }}>Lưu bản nháp</button>
          <button onClick={() => setView("list")} disabled={saving} style={{ ...s.btnGhost, color: A.textMuted }}>Hủy</button>
        </div>
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
