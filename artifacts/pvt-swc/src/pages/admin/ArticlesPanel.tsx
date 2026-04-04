import React, { useEffect, useState, useCallback, useMemo } from "react";
import { adminApi, type Article, type Topic, type Series } from "@/lib/newsApi";
import { A, s, fmtDate, slugify } from "./shared";

/* ── Category options ────────────────────────────────────────────────── */
const CATEGORY_OPTIONS = [
  { label: "Tư duy đầu tư", slug: "tu-duy-dau-tu" },
  { label: "Tài chính cá nhân", slug: "tai-chinh-ca-nhan" },
  { label: "Đầu tư dài hạn", slug: "dau-tu-dai-han" },
];

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

/* ── SEO Preview ─────────────────────────────────────────────────────── */
function SeoPreview({ title, description, slug }: { title: string; description: string; slug: string }) {
  if (!title && !description) return null;
  return (
    <div style={{ marginTop: "12px", padding: "12px 14px", background: "#f8f9fa", borderRadius: "7px", border: "1px solid #e8eaed", maxWidth: "480px" }}>
      <p style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.10em", textTransform: "uppercase", color: A.textLight, margin: "0 0 6px" }}>Xem trước SEO</p>
      <p style={{ fontSize: "12px", color: "#1a0dab", margin: "0 0 2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {title || "(tiêu đề trang)"}
      </p>
      <p style={{ fontSize: "11px", color: "#006621", margin: "0 0 2px" }}>thangswc.com/bai-viet/{slug || "…"}</p>
      <p style={{ fontSize: "11.5px", color: "#545454", margin: 0, lineHeight: 1.5 }}>
        {description || "(mô tả SEO)"}
      </p>
    </div>
  );
}

/* ── Section header ──────────────────────────────────────────────────── */
function SectionHeading({ label }: { label: string }) {
  return (
    <h3 style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: A.textMuted, margin: "0 0 1rem" }}>
      {label}
    </h3>
  );
}

/* ── Form type ───────────────────────────────────────────────────────── */
type Form = Partial<Article> & {
  tagsInput: string;
};

const EMPTY: Form = {
  title: "", slug: "", excerpt: "", content: "",
  coverImageUrl: "", coverImageAlt: "",
  category: "", categorySlug: "",
  tagsInput: "",
  publishDate: null, featured: false, status: "draft",
  readingTime: "", topicSlug: "", seriesSlug: "",
  seoTitle: "", seoDescription: "", seoKeywords: "",
  ogTitle: "", ogDescription: "", ogImageUrl: "", canonicalUrl: "", noindex: false,
  showOnHomepage: false, displayOrder: 0,
};

function tagsToString(tags: string[] | null | undefined): string {
  return (tags ?? []).join(", ");
}
function stringToTags(s: string): string[] {
  return s.split(",").map((t) => t.trim()).filter(Boolean);
}

/* ── Image preview ───────────────────────────────────────────────────── */
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
      <button onClick={onClear} style={{ position: "absolute", top: "4px", right: "4px", background: "rgba(0,0,0,0.55)", color: "#fff", border: "none", borderRadius: "4px", padding: "2px 7px", fontSize: "11px", cursor: "pointer" }}>
        Xóa ảnh
      </button>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────────────── */
export function ArticlesPanel({ adminKey }: { adminKey: string }) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [topics, setTopics]     = useState<Topic[]>([]);
  const [series, setSeries]     = useState<Series[]>([]);
  const [loading, setLoading]   = useState(true);
  const [view, setView]         = useState<"list" | "form">("list");
  const [form, setForm]         = useState<Form>(EMPTY);
  const [saving, setSaving]     = useState(false);
  const [err, setErr]           = useState("");
  const [toast, setToast]       = useState<{ msg: string; type: "ok" | "err" } | null>(null);
  const [showSeo, setShowSeo]   = useState(false);

  const [q, setQ]               = useState("");
  const [fStatus, setFStatus]   = useState("all");
  const [fFeatured, setFFeatured] = useState("all");
  const [fHomepage, setFHomepage] = useState("all");

  const showToast = useCallback((msg: string, type: "ok" | "err" = "ok") => setToast({ msg, type }), []);

  const reload = useCallback(() => {
    setLoading(true);
    Promise.all([
      adminApi.getArticles(adminKey),
      adminApi.getContentMeta(adminKey),
    ]).then(([arts, meta]) => {
      setArticles(arts);
      setTopics(meta.topics);
      setSeries(meta.series);
    }).catch(console.error).finally(() => setLoading(false));
  }, [adminKey]);

  useEffect(() => { reload(); }, [reload]);

  const visible = useMemo(() => articles.filter((a) => {
    if (fStatus !== "all" && a.status !== fStatus) return false;
    if (fFeatured === "featured" && !a.featured) return false;
    if (fHomepage === "homepage" && !a.showOnHomepage) return false;
    if (q.trim()) {
      const lq = q.toLowerCase();
      return a.title.toLowerCase().includes(lq) || a.slug.toLowerCase().includes(lq) || (a.excerpt ?? "").toLowerCase().includes(lq);
    }
    return true;
  }), [articles, q, fStatus, fFeatured, fHomepage]);

  const isFiltered = q || fStatus !== "all" || fFeatured !== "all" || fHomepage !== "all";

  const newArticle = () => { setForm({ ...EMPTY }); setErr(""); setShowSeo(false); setView("form"); };
  const editArticle = (a: Article) => {
    setForm({ ...a, tagsInput: tagsToString(a.tags) });
    setErr(""); setShowSeo(false); setView("form");
  };

  const deleteArticle = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bài viết này?\nHành động này không thể hoàn tác.")) return;
    try {
      await adminApi.deleteArticle(adminKey, id);
      setArticles((prev) => prev.filter((a) => a.id !== id));
      showToast("Đã xóa thành công.");
    } catch (e) { showToast(String(e), "err"); }
  };

  const toggleStatus = async (a: Article) => {
    const next = a.status === "published" ? "draft" : "published";
    try {
      const updated = await adminApi.updateArticle(adminKey, a.id, { ...a, status: next, tags: a.tags });
      setArticles((prev) => prev.map((x) => x.id === updated.id ? updated : x));
      showToast(next === "published" ? "Đã xuất bản bài viết." : "Đã chuyển về nháp.");
    } catch (e) { showToast(String(e), "err"); }
  };

  const toggleFeatured = async (a: Article) => {
    try {
      const updated = await adminApi.updateArticle(adminKey, a.id, { ...a, featured: !a.featured, tags: a.tags });
      setArticles((prev) => prev.map((x) => x.id === updated.id ? updated : x));
      showToast(!a.featured ? "Đã đặt nổi bật." : "Đã bỏ nổi bật.");
    } catch (e) { showToast(String(e), "err"); }
  };

  const save = async (status: "draft" | "published") => {
    if (!form.title?.trim()) { setErr("Vui lòng nhập tiêu đề."); return; }
    if (!form.slug?.trim())  { setErr("Vui lòng nhập đường dẫn tĩnh."); return; }
    if (status === "published" && !form.content?.trim()) { setErr("Nội dung là bắt buộc khi xuất bản."); return; }

    setSaving(true); setErr("");
    const tags = stringToTags(form.tagsInput ?? "");
    const payload: Partial<Article> = { ...form, status, tags };
    delete (payload as Record<string, unknown>).tagsInput;

    try {
      if (form.id) {
        const updated = await adminApi.updateArticle(adminKey, form.id, payload);
        setArticles((prev) => prev.map((a) => a.id === updated.id ? updated : a));
        showToast(status === "published" ? "Đã cập nhật và xuất bản." : "Đã lưu bản nháp.");
      } else {
        const created = await adminApi.createArticle(adminKey, payload);
        setArticles((prev) => [created, ...prev]);
        showToast(status === "published" ? "Đã xuất bản bài viết." : "Đã lưu bản nháp.");
      }
      setView("list");
    } catch (e) { setErr(String(e)); }
    finally { setSaving(false); }
  };

  const setField = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  const handleTitleChange = (title: string) => {
    setForm((f) => ({ ...f, title, slug: f.id ? f.slug : slugify(title) }));
  };

  const handleCategoryChange = (slug: string) => {
    const opt = CATEGORY_OPTIONS.find((o) => o.slug === slug);
    setForm((f) => ({ ...f, categorySlug: slug, category: opt?.label ?? slug }));
  };

  /* ─── LIST VIEW ─── */
  if (view === "list") {
    return (
      <div>
        <div style={s.sectionHeader}>
          <div>
            <h2 style={{ ...s.sectionTitle, margin: "0 0 2px" }}>Kiến thức — Bài viết</h2>
            <p style={{ fontSize: "12.5px", color: A.textMuted, margin: 0 }}>Quản lý bài viết trong mục Kiến thức</p>
          </div>
          <button style={s.btnPrimary} onClick={newArticle}>+ Tạo bài viết mới</button>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.625rem", padding: "0.875rem 1rem", marginBottom: "1rem", background: "#fff", border: `1px solid ${A.border}`, borderRadius: "9px", alignItems: "center" }}>
          <div style={{ position: "relative", flex: "1 1 200px", minWidth: "180px" }}>
            <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: A.textLight, fontSize: "13px", pointerEvents: "none" }}>⌕</span>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm kiếm bài viết..." style={{ ...s.field, paddingLeft: "28px", height: "34px" }} />
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
            <span style={{ fontSize: "12px", color: A.textLight, whiteSpace: "nowrap" }}>{visible.length} / {articles.length} bài</span>
            {isFiltered && (
              <button onClick={() => { setQ(""); setFStatus("all"); setFFeatured("all"); setFHomepage("all"); }} style={{ fontSize: "11.5px", color: A.primary, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                Xóa bộ lọc ×
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <p style={{ fontSize: "13px", color: A.textMuted }}>Đang tải...</p>
        ) : articles.length === 0 ? (
          <div style={{ ...s.card, textAlign: "center", padding: "4rem 2rem" }}>
            <p style={{ fontSize: "15px", fontWeight: 700, color: A.text, margin: "0 0 6px" }}>Chưa có bài viết nào</p>
            <p style={{ fontSize: "13px", color: A.textMuted, margin: "0 0 1.5rem" }}>Tạo bài viết đầu tiên để bắt đầu xây dựng nội dung.</p>
            <button style={s.btnPrimary} onClick={newArticle}>+ Tạo bài viết đầu tiên</button>
          </div>
        ) : visible.length === 0 ? (
          <div style={{ ...s.card, textAlign: "center", padding: "3rem 2rem" }}>
            <p style={{ fontSize: "14px", fontWeight: 600, color: A.text, margin: "0 0 8px" }}>Không có bài viết phù hợp</p>
            <button style={s.btnSecondary} onClick={() => { setQ(""); setFStatus("all"); setFFeatured("all"); setFHomepage("all"); }}>Xóa bộ lọc</button>
          </div>
        ) : (
          <div style={{ ...s.card, padding: 0, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "rgba(0,0,0,0.015)" }}>
                  <th style={s.th}>Tiêu đề</th>
                  <th style={{ ...s.th, width: "110px" }}>Chủ đề</th>
                  <th style={{ ...s.th, width: "90px" }}>Ngày đăng</th>
                  <th style={{ ...s.th, width: "90px" }}>Trạng thái</th>
                  <th style={{ ...s.th, width: "60px", textAlign: "center" }}>Nổi bật</th>
                  <th style={{ ...s.th, width: "60px", textAlign: "center" }}>Trang chủ</th>
                  <th style={{ ...s.th, width: "170px" }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((a, i) => {
                  const topicLabel = topics.find((t) => t.slug === a.topicSlug)?.title ?? a.topicSlug ?? "—";
                  return (
                    <tr key={a.id} style={{ background: i % 2 === 0 ? "#fff" : "rgba(0,0,0,0.012)" }}>
                      <td style={s.td}>
                        <p style={{ fontSize: "13px", fontWeight: 600, color: A.text, margin: "0 0 2px", maxWidth: "360px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.title}</p>
                        <p style={{ fontSize: "11px", color: A.textLight, margin: 0, fontFamily: "monospace" }}>/{a.slug}</p>
                      </td>
                      <td style={s.td}><span style={{ fontSize: "12px", color: A.textMuted }}>{topicLabel}</span></td>
                      <td style={s.td}><span style={{ fontSize: "12px", color: A.textLight, whiteSpace: "nowrap" }}>{fmtDate(a.publishDate)}</span></td>
                      <td style={s.td}><StatusPill status={a.status} /></td>
                      <td style={{ ...s.td, textAlign: "center" }}>
                        <button onClick={() => toggleFeatured(a)} title={a.featured ? "Bỏ nổi bật" : "Bật nổi bật"}
                          style={{ background: "none", border: "none", cursor: "pointer", fontSize: "15px", lineHeight: 1, color: a.featured ? "#d97706" : A.border }}>★</button>
                      </td>
                      <td style={{ ...s.td, textAlign: "center" }}>
                        <span title={a.showOnHomepage ? "Hiển thị trang chủ" : "Không hiển thị trang chủ"}
                          style={{ fontSize: "13px", color: a.showOnHomepage ? A.primary : A.border }}>
                          {a.showOnHomepage ? "◉" : "○"}
                        </span>
                      </td>
                      <td style={{ ...s.td, whiteSpace: "nowrap" }}>
                        <div style={{ display: "flex", gap: "4px" }}>
                          <button onClick={() => editArticle(a)} style={{ ...s.btnGhost, fontSize: "11.5px", padding: "4px 10px" }}>Sửa</button>
                          <button onClick={() => toggleStatus(a)} style={{ ...s.btnGhost, fontSize: "11.5px", padding: "4px 10px", color: a.status === "published" ? A.textMuted : A.primary }}>
                            {a.status === "published" ? "Nháp" : "Đăng"}
                          </button>
                          <button onClick={() => deleteArticle(a.id!)} style={{ ...s.btnGhost, fontSize: "11.5px", padding: "4px 10px", color: A.danger }}>Xóa</button>
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
  const publishLabel = isEdit ? (form.status === "published" ? "Cập nhật bài viết" : "Xuất bản") : "Xuất bản";
  const seoTitlePreview = form.seoTitle || form.title || "";
  const seoDescPreview  = form.seoDescription || form.excerpt || "";

  return (
    <div style={{ maxWidth: "820px" }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem", fontSize: "13px", color: A.textMuted }}>
        <button onClick={() => setView("list")} style={{ background: "none", border: "none", cursor: "pointer", color: A.primary, padding: 0, fontSize: "13px" }}>Bài viết</button>
        <span>›</span>
        <span>{isEdit ? "Chỉnh sửa" : "Tạo mới"}</span>
      </div>

      <div style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ ...s.sectionTitle, margin: "0 0 4px" }}>{isEdit ? "Chỉnh sửa bài viết" : "Tạo bài viết mới"}</h2>
          {isEdit && <p style={{ fontSize: "12px", color: A.textLight, margin: 0 }}>ID: {form.id}</p>}
        </div>
        <div style={{ display: "flex", gap: "0.625rem" }}>
          <button onClick={() => save("published")} disabled={saving} style={{ ...s.btnPrimary, opacity: saving ? 0.6 : 1 }}>
            {saving ? "Đang lưu..." : publishLabel}
          </button>
          <button onClick={() => save("draft")} disabled={saving} style={{ ...s.btnSecondary, opacity: saving ? 0.6 : 1 }}>Lưu nháp</button>
          <button onClick={() => setView("list")} disabled={saving} style={{ ...s.btnGhost, color: A.textMuted }}>Hủy</button>
        </div>
      </div>

      {err && <div style={s.error}>{err}</div>}

      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

        {/* 1. Thông tin chính */}
        <div style={s.card}>
          <SectionHeading label="Thông tin chính" />
          <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            <div>
              <label style={s.label}>Tiêu đề *</label>
              <input value={form.title ?? ""} onChange={(e) => handleTitleChange(e.target.value)} placeholder="Nhập tiêu đề bài viết..." style={s.field} />
            </div>
            <div>
              <label style={s.label}>Đường dẫn tĩnh (Slug) *</label>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <input value={form.slug ?? ""} onChange={(e) => setField("slug", slugify(e.target.value))} placeholder="duong-dan-bai-viet" style={{ ...s.field, fontFamily: "monospace", fontSize: "12.5px", flex: 1 }} />
                <button type="button" onClick={() => setField("slug", slugify(form.title ?? ""))} style={{ ...s.btnSecondary, padding: "7px 12px", whiteSpace: "nowrap", fontSize: "11.5px" }}>
                  Tự tạo
                </button>
              </div>
            </div>
            <div>
              <label style={s.label}>Mô tả ngắn</label>
              <textarea value={form.excerpt ?? ""} onChange={(e) => setField("excerpt", e.target.value)} rows={3} placeholder="Tóm tắt ngắn về bài viết..." style={s.textarea} />
            </div>
          </div>
        </div>

        {/* 2. Nội dung */}
        <div style={s.card}>
          <SectionHeading label="Nội dung" />
          <textarea value={form.content ?? ""} onChange={(e) => setField("content", e.target.value)} rows={18} placeholder="Viết nội dung bài viết tại đây... (hỗ trợ Markdown)" style={{ ...s.textarea, fontFamily: "monospace", fontSize: "13px" }} />
        </div>

        {/* 3. Ảnh bìa */}
        <div style={s.card}>
          <SectionHeading label="Ảnh bìa" />
          <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            <div>
              <label style={s.label}>URL ảnh bìa</label>
              <input value={form.coverImageUrl ?? ""} onChange={(e) => setField("coverImageUrl", e.target.value)} placeholder="https://..." style={s.field} />
              <ImagePreview url={form.coverImageUrl ?? ""} onClear={() => setField("coverImageUrl", "")} />
            </div>
            <div>
              <label style={s.label}>Alt ảnh bìa</label>
              <input value={form.coverImageAlt ?? ""} onChange={(e) => setField("coverImageAlt", e.target.value)} placeholder="Mô tả ảnh..." style={s.field} />
            </div>
          </div>
        </div>

        {/* 4. Phân loại */}
        <div style={s.card}>
          <SectionHeading label="Phân loại" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem" }}>
            <div>
              <label style={s.label}>Danh mục</label>
              <select value={form.categorySlug ?? ""} onChange={(e) => handleCategoryChange(e.target.value)} style={s.select}>
                <option value="">— Chọn danh mục —</option>
                {CATEGORY_OPTIONS.map((o) => <option key={o.slug} value={o.slug}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label style={s.label}>Thời gian đọc</label>
              <input value={form.readingTime ?? ""} onChange={(e) => setField("readingTime", e.target.value)} placeholder="5 phút" style={s.field} />
            </div>
            <div>
              <label style={s.label}>Chủ đề</label>
              <select value={form.topicSlug ?? ""} onChange={(e) => setField("topicSlug", e.target.value)} style={s.select}>
                <option value="">— Chọn chủ đề —</option>
                {topics.map((t) => <option key={t.slug} value={t.slug}>{t.title}</option>)}
                {topics.length === 0 && <option disabled value="">Chưa có chủ đề (tạo trong mục Chủ đề)</option>}
              </select>
            </div>
            <div>
              <label style={s.label}>Series</label>
              <select value={form.seriesSlug ?? ""} onChange={(e) => setField("seriesSlug", e.target.value)} style={s.select}>
                <option value="">— Chọn series —</option>
                {series.map((sr) => <option key={sr.slug} value={sr.slug}>{sr.title}</option>)}
                {series.length === 0 && <option disabled value="">Chưa có series (tạo trong mục Series)</option>}
              </select>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={s.label}>Thẻ tag (phân cách bằng dấu phẩy)</label>
              <input value={form.tagsInput ?? ""} onChange={(e) => setField("tagsInput", e.target.value)} placeholder="đầu tư, tài chính, tích sản" style={s.field} />
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

        {/* 5. Hiển thị */}
        <div style={s.card}>
          <SectionHeading label="Hiển thị & Xuất bản" />
          <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem" }}>
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
                <span style={{ fontSize: "13px", color: A.text, fontWeight: 500 }}>Bài viết nổi bật</span>
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", userSelect: "none" }}>
                <input type="checkbox" checked={form.showOnHomepage ?? false} onChange={(e) => setField("showOnHomepage", e.target.checked)} style={{ width: "15px", height: "15px", cursor: "pointer" }} />
                <span style={{ fontSize: "13px", color: A.text, fontWeight: 500 }}>Hiển thị ở trang chủ</span>
              </label>
            </div>
          </div>
        </div>

        {/* 6. SEO (collapsible) */}
        <div style={s.card}>
          <button
            type="button"
            onClick={() => setShowSeo((v) => !v)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}
          >
            <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: A.textMuted }}>SEO & Chia sẻ</span>
            <span style={{ fontSize: "12px", color: A.textLight, transform: showSeo ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▼</span>
          </button>

          {showSeo && (
            <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              <div style={{ background: "rgba(26,120,104,0.05)", borderRadius: "7px", padding: "9px 13px", fontSize: "12px", color: A.textMuted, lineHeight: 1.6 }}>
                Nếu để trống, tiêu đề SEO sẽ dùng tiêu đề bài viết và mô tả SEO sẽ dùng mô tả ngắn.
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem" }}>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={s.label}>Tiêu đề SEO</label>
                  <input value={form.seoTitle ?? ""} onChange={(e) => setField("seoTitle", e.target.value)} placeholder={form.title || "Tiêu đề hiển thị trên Google..."} style={s.field} maxLength={70} />
                  <p style={{ fontSize: "10.5px", color: A.textLight, margin: "4px 0 0" }}>{(form.seoTitle ?? "").length}/70 ký tự</p>
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={s.label}>Mô tả SEO</label>
                  <textarea value={form.seoDescription ?? ""} onChange={(e) => setField("seoDescription", e.target.value)} rows={3} placeholder={form.excerpt || "Mô tả hiển thị trên Google..."} style={s.textarea} maxLength={160} />
                  <p style={{ fontSize: "10.5px", color: A.textLight, margin: "4px 0 0" }}>{(form.seoDescription ?? "").length}/160 ký tự</p>
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={s.label}>Từ khóa SEO</label>
                  <input value={form.seoKeywords ?? ""} onChange={(e) => setField("seoKeywords", e.target.value)} placeholder="đầu tư, tài chính cá nhân, tích sản..." style={s.field} />
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
                    <label style={s.label}>Ảnh chia sẻ (OG Image URL)</label>
                    <input value={form.ogImageUrl ?? ""} onChange={(e) => setField("ogImageUrl", e.target.value)} placeholder="https://..." style={s.field} />
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={s.label}>Mô tả Open Graph</label>
                    <textarea value={form.ogDescription ?? ""} onChange={(e) => setField("ogDescription", e.target.value)} rows={2} placeholder={form.seoDescription || form.excerpt || ""} style={s.textarea} />
                  </div>
                  <div>
                    <label style={s.label}>Canonical URL</label>
                    <input value={form.canonicalUrl ?? ""} onChange={(e) => setField("canonicalUrl", e.target.value)} placeholder="https://thangswc.com/bai-viet/..." style={s.field} />
                  </div>
                </div>
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
          <button onClick={() => save("published")} disabled={saving} style={{ ...s.btnPrimary, opacity: saving ? 0.6 : 1 }}>
            {saving ? "Đang lưu..." : publishLabel}
          </button>
          <button onClick={() => save("draft")} disabled={saving} style={{ ...s.btnSecondary, opacity: saving ? 0.6 : 1 }}>Lưu bản nháp</button>
          <button onClick={() => setView("list")} disabled={saving} style={{ ...s.btnGhost, color: A.textMuted }}>Hủy</button>
        </div>
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
