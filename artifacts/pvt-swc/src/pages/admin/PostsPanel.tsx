import React, { useEffect, useState, useCallback, useMemo } from "react";
import { adminApi, type NewsPost, type NewsCategory, type NewsProduct, type NewsTag } from "@/lib/newsApi";
import { A, s, fmtDate, slugify } from "./shared";

/* ── Fallback image pools ────────────────────────────────────────── */
const ADMIN_POOLS: Record<string, string[]> = {
  atlas:           ["/images/fallback-atlas.svg", "/images/fallback-atlas-2.svg", "/images/fallback-atlas-3.svg"],
  "road-to-1m":   ["/images/fallback-road-to-1m.svg", "/images/fallback-road-to-1m-2.svg", "/images/fallback-road-to-1m-3.svg"],
  "tu-duy-dau-tu":["/images/fallback-tu-duy.svg", "/images/fallback-tu-duy-2.svg", "/images/fallback-tu-duy-3.svg"],
  default:        ["/images/fallback-default.svg", "/images/fallback-default-2.svg"],
};

function getAdminPreviewImage(
  featuredImage: string | null | undefined,
  featuredImageDisplay: string | null | undefined,
  postId: number | null | undefined,
  productId: number | null | undefined,
  categoryId: number | null | undefined,
  prods: NewsProduct[],
  cats: NewsCategory[],
): { src: string; isFallback: boolean; poolSize: number } {
  const disp = typeof featuredImageDisplay === "string" ? featuredImageDisplay.trim() : "";
  const orig = typeof featuredImage === "string" ? featuredImage.trim() : "";
  if (disp) return { src: disp, isFallback: false, poolSize: 1 };
  if (orig) return { src: orig, isFallback: false, poolSize: 1 };
  const seed = postId ?? 0;
  const prod = prods.find((p) => p.id === productId);
  if (prod?.slug === "atlas") { const pool = ADMIN_POOLS.atlas; return { src: pool[seed % pool.length], isFallback: true, poolSize: pool.length }; }
  if (prod?.slug === "road-to-1m") { const pool = ADMIN_POOLS["road-to-1m"]; return { src: pool[seed % pool.length], isFallback: true, poolSize: pool.length }; }
  const cat = cats.find((c) => c.id === categoryId);
  if (cat?.slug === "tu-duy-dau-tu") { const pool = ADMIN_POOLS["tu-duy-dau-tu"]; return { src: pool[seed % pool.length], isFallback: true, poolSize: pool.length }; }
  const pool = ADMIN_POOLS.default;
  return { src: pool[seed % pool.length], isFallback: true, poolSize: pool.length };
}

/* ── Types ───────────────────────────────────────────────────────── */
const EMPTY: NewsPost & { tagIds: number[] } = {
  id: 0, title: "", slug: "", excerpt: "", content: "", featuredImage: "", featuredImageDisplay: "",
  categoryId: null, productId: null, status: "draft",
  publishedAt: null, authorName: "Phan Văn Thắng",
  seoTitle: "", seoDescription: "",
  isFeatured: false, showOnHomepage: false, showInRelated: true,
  createdAt: "", updatedAt: "", tagIds: [],
};
type PostForm = typeof EMPTY;

/* ── Pill ─────────────────────────────────────────────────────────── */
function StatusPill({ status }: { status: string }) {
  const published = status === "published";
  return (
    <span style={{
      display: "inline-block", whiteSpace: "nowrap",
      fontSize: "10px", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase",
      padding: "2px 8px", borderRadius: "5px",
      background: published ? "rgba(26,120,104,0.10)" : "rgba(0,0,0,0.06)",
      color: published ? A.primary : A.textMuted,
    }}>
      {published ? "Đã đăng" : "Nháp"}
    </span>
  );
}

/* ── Row thumbnail ────────────────────────────────────────────────── */
function RowThumb({ post, prods, cats }: { post: NewsPost; prods: NewsProduct[]; cats: NewsCategory[] }) {
  const { src, isFallback } = getAdminPreviewImage(post.featuredImage, post.featuredImageDisplay, post.id, post.productId, post.categoryId, prods, cats);
  const [err, setErr] = useState(false);
  return (
    <div style={{
      width: "64px", height: "36px", borderRadius: "5px", overflow: "hidden", flexShrink: 0,
      background: isFallback ? "#091e1b" : "#f3f4f6",
      border: `1px solid ${A.border}`,
    }}>
      {!err
        ? <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} onError={() => setErr(true)} />
        : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: "9px", color: A.danger }}>✕</span>
          </div>
      }
    </div>
  );
}

/* ── Tag chips ────────────────────────────────────────────────────── */
function TagChips({ tagIds, allTags }: { tagIds?: number[]; allTags: NewsTag[] }) {
  if (!tagIds?.length) return <span style={{ fontSize: "12px", color: A.textLight }}>—</span>;
  const visible = tagIds.slice(0, 2);
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "3px" }}>
      {visible.map((id) => {
        const t = allTags.find((x) => x.id === id);
        if (!t) return null;
        return (
          <span key={id} style={{ fontSize: "10.5px", color: A.textMuted, background: "rgba(0,0,0,0.05)", borderRadius: "4px", padding: "1px 6px" }}>
            #{t.slug}
          </span>
        );
      })}
      {tagIds.length > 2 && (
        <span style={{ fontSize: "10.5px", color: A.textLight }}>+{tagIds.length - 2}</span>
      )}
    </div>
  );
}

/* ── Bulk action bar ──────────────────────────────────────────────── */
function BulkBar({
  count, onPublish, onDraft, onDelete, onClear, busy,
}: { count: number; onPublish: () => void; onDraft: () => void; onDelete: () => void; onClear: () => void; busy: boolean }) {
  return (
    <div style={{
      position: "fixed", bottom: "24px", left: "50%", transform: "translateX(-50%)",
      zIndex: 200,
      background: "#1a1a1a", color: "#fff", borderRadius: "10px",
      display: "flex", alignItems: "center", gap: "0.5rem",
      padding: "10px 16px",
      boxShadow: "0 4px 24px rgba(0,0,0,0.22)",
    }}>
      <span style={{ fontSize: "12.5px", fontWeight: 600, marginRight: "0.5rem" }}>
        {count} bài đã chọn
      </span>
      <button onClick={onPublish} disabled={busy} style={{ padding: "5px 14px", borderRadius: "6px", border: "none", cursor: busy ? "not-allowed" : "pointer", fontSize: "12px", fontWeight: 600, background: A.primary, color: "#fff" }}>
        Xuất bản
      </button>
      <button onClick={onDraft} disabled={busy} style={{ padding: "5px 14px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.20)", cursor: busy ? "not-allowed" : "pointer", fontSize: "12px", fontWeight: 500, background: "transparent", color: "#fff" }}>
        Chuyển nháp
      </button>
      <button onClick={onDelete} disabled={busy} style={{ padding: "5px 14px", borderRadius: "6px", border: "1px solid rgba(193,51,51,0.50)", cursor: busy ? "not-allowed" : "pointer", fontSize: "12px", fontWeight: 500, background: "transparent", color: "#f87171" }}>
        Xóa
      </button>
      <button onClick={onClear} disabled={busy} style={{ padding: "5px 10px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "12px", background: "transparent", color: "rgba(255,255,255,0.5)" }}>
        Bỏ chọn
      </button>
    </div>
  );
}

/* ── Main component ───────────────────────────────────────────────── */
export function PostsPanel({ adminKey }: { adminKey: string }) {
  const [posts, setPosts]   = useState<NewsPost[]>([]);
  const [cats, setCats]     = useState<NewsCategory[]>([]);
  const [prods, setProds]   = useState<NewsProduct[]>([]);
  const [tags, setTags]     = useState<NewsTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView]     = useState<"list" | "form">("list");
  const [form, setForm]     = useState<PostForm>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState("");

  /* Filters */
  const [q, setQ]             = useState("");
  const [fStatus, setFStatus] = useState("all");
  const [fCat, setFCat]       = useState("all");
  const [fProd, setFProd]     = useState("all");

  /* Bulk */
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);

  const reload = useCallback(() => {
    setLoading(true);
    Promise.all([adminApi.getPosts(adminKey), adminApi.getMeta(adminKey)]).then(([p, m]) => {
      setPosts(p); setCats(m.categories); setProds(m.products); setTags(m.tags);
    }).finally(() => setLoading(false));
  }, [adminKey]);

  useEffect(() => { reload(); }, [reload]);

  /* ── Filtering ── */
  const visible = useMemo(() => {
    return posts.filter((p) => {
      if (fStatus !== "all" && p.status !== fStatus) return false;
      if (fCat !== "all" && String(p.categoryId) !== fCat) return false;
      if (fProd !== "all" && String(p.productId) !== fProd) return false;
      if (q.trim()) {
        const lq = q.toLowerCase();
        const match = p.title.toLowerCase().includes(lq) || p.slug.toLowerCase().includes(lq) || (p.excerpt ?? "").toLowerCase().includes(lq);
        if (!match) return false;
      }
      return true;
    });
  }, [posts, q, fStatus, fCat, fProd]);

  const isFiltered = q || fStatus !== "all" || fCat !== "all" || fProd !== "all";

  /* ── Markdown editor ref ── */
  const contentRef = React.useRef<HTMLTextAreaElement>(null);

  const insertAtCursor = useCallback((before: string, after = "") => {
    const ta = contentRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const val = ta.value;
    const selected = val.slice(start, end);
    const next = val.slice(0, start) + before + selected + after + val.slice(end);
    setForm((f) => ({ ...f, content: next }));
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  }, []);

  const insertLinePrefix = useCallback((prefix: string) => {
    const ta = contentRef.current;
    if (!ta) return;
    const val = ta.value;
    const start = ta.selectionStart;
    const lineStart = val.lastIndexOf("\n", start - 1) + 1;
    const next = val.slice(0, lineStart) + prefix + val.slice(lineStart);
    setForm((f) => ({ ...f, content: next }));
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(start + prefix.length, start + prefix.length);
    });
  }, []);

  /* ── Actions ── */
  const newPost = () => { setForm(EMPTY); setErr(""); setView("form"); };

  const editPost = (p: NewsPost) => {
    setForm({
      ...p,
      excerpt: p.excerpt ?? "", content: p.content ?? "", featuredImage: p.featuredImage ?? "",
      seoTitle: p.seoTitle ?? "", seoDescription: p.seoDescription ?? "",
      isFeatured: p.isFeatured ?? false, showOnHomepage: p.showOnHomepage ?? false, showInRelated: p.showInRelated ?? true,
      tagIds: (p.tags ?? []).map((t) => t.id),
    });
    setErr(""); setView("form");
  };

  const duplicatePost = async (p: NewsPost) => {
    const payload = {
      title: `Copy — ${p.title}`, slug: slugify(`copy-${p.slug}-${Date.now()}`),
      excerpt: p.excerpt ?? "", content: p.content ?? "",
      featuredImage: p.featuredImage ?? "",
      categoryId: p.categoryId || null, productId: p.productId || null,
      status: "draft" as const,
      authorName: p.authorName ?? "Phan Văn Thắng",
      seoTitle: p.seoTitle ?? "", seoDescription: p.seoDescription ?? "",
      tagIds: (p.tags ?? []).map((t) => t.id),
    };
    try {
      const created = await adminApi.createPost(adminKey, payload);
      setPosts((prev) => [{ ...created, tags: p.tags ?? [] }, ...prev]);
    } catch (e) { alert(String(e)); }
  };

  const toggleStatus = async (p: NewsPost) => {
    const next = p.status === "published" ? "draft" : "published";
    try {
      const updated = await adminApi.updatePost(adminKey, p.id, { ...p, status: next,
        categoryId: p.categoryId || null, productId: p.productId || null,
        tagIds: (p.tags ?? []).map((t) => t.id), });
      setPosts((prev) => prev.map((x) => x.id === updated.id ? { ...updated, tags: p.tags } : x));
    } catch (e) { alert(String(e)); }
  };

  const deletePost = async (id: number) => {
    if (!confirm("Xóa bài viết này? Hành động không thể hoàn tác.")) return;
    await adminApi.deletePost(adminKey, id).catch(console.error);
    setPosts((prev) => prev.filter((p) => p.id !== id));
    setSelected((prev) => { const s = new Set(prev); s.delete(id); return s; });
  };

  const save = async (status: "draft" | "published") => {
    if (!form.title.trim()) { setErr("Tiêu đề là bắt buộc."); return; }
    if (!form.slug.trim())  { setErr("Slug là bắt buộc."); return; }
    setSaving(true); setErr("");
    try {
      const payload = { ...form, status, categoryId: form.categoryId || null, productId: form.productId || null };
      if (form.id) {
        const updated = await adminApi.updatePost(adminKey, form.id, payload);
        setPosts((prev) => prev.map((p) => p.id === updated.id ? { ...updated, tags: (tags.filter((t) => form.tagIds.includes(t.id))) } : p));
      } else {
        const created = await adminApi.createPost(adminKey, payload);
        setPosts((prev) => [{ ...created, tags: tags.filter((t) => form.tagIds.includes(t.id)) }, ...prev]);
      }
      setView("list");
    } catch (e) { setErr(String(e)); }
    finally { setSaving(false); }
  };

  const toggleTag = (id: number) => setForm((f) => ({
    ...f, tagIds: f.tagIds.includes(id) ? f.tagIds.filter((t) => t !== id) : [...f.tagIds, id],
  }));

  /* ── Bulk ── */
  const toggleSelect = (id: number) => setSelected((prev) => {
    const s = new Set(prev);
    if (s.has(id)) s.delete(id); else s.add(id);
    return s;
  });
  const toggleAll = () => {
    if (selected.size === visible.length) setSelected(new Set());
    else setSelected(new Set(visible.map((p) => p.id)));
  };
  const clearSelection = () => setSelected(new Set());

  const bulkSetStatus = async (status: "draft" | "published") => {
    setBulkBusy(true);
    try {
      const targets = posts.filter((p) => selected.has(p.id));
      await Promise.all(targets.map((p) => adminApi.updatePost(adminKey, p.id, {
        ...p, status, categoryId: p.categoryId || null, productId: p.productId || null,
        tagIds: (p.tags ?? []).map((t) => t.id),
      })));
      setPosts((prev) => prev.map((p) => selected.has(p.id) ? { ...p, status } : p));
      clearSelection();
    } catch (e) { alert(String(e)); }
    finally { setBulkBusy(false); }
  };

  const bulkDelete = async () => {
    if (!confirm(`Xóa ${selected.size} bài viết? Hành động không thể hoàn tác.`)) return;
    setBulkBusy(true);
    try {
      await Promise.all([...selected].map((id) => adminApi.deletePost(adminKey, id)));
      setPosts((prev) => prev.filter((p) => !selected.has(p.id)));
      clearSelection();
    } catch (e) { alert(String(e)); }
    finally { setBulkBusy(false); }
  };

  /* ─────────────── LIST VIEW ─────────────── */
  if (view === "list") {
    const allChecked = visible.length > 0 && selected.size === visible.length;
    const someChecked = selected.size > 0 && selected.size < visible.length;

    return (
      <div>
        {/* ── Header ── */}
        <div style={{ marginBottom: "1.25rem" }}>
          <div style={s.sectionHeader}>
            <div>
              <h2 style={{ ...s.sectionTitle, margin: "0 0 2px" }}>Bài viết</h2>
              <p style={{ fontSize: "12.5px", color: A.textMuted, margin: 0 }}>
                Quản lý toàn bộ bài viết trong mục Tin tức
              </p>
            </div>
            <button style={s.btnPrimary} onClick={newPost}>+ Tạo bài mới</button>
          </div>
        </div>

        {/* ── Filters ── */}
        <div style={{
          display: "flex", flexWrap: "wrap", gap: "0.625rem",
          padding: "0.875rem 1rem", marginBottom: "1rem",
          background: "#fff", border: `1px solid ${A.border}`, borderRadius: "9px",
          alignItems: "center",
        }}>
          {/* Keyword search */}
          <div style={{ position: "relative", flex: "1 1 200px", minWidth: "180px" }}>
            <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: A.textLight, fontSize: "13px", pointerEvents: "none" }}>
              🔍
            </span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm tiêu đề, slug, tóm tắt..."
              style={{ ...s.field, paddingLeft: "30px", height: "34px" }}
            />
          </div>

          {/* Status */}
          <select value={fStatus} onChange={(e) => setFStatus(e.target.value)} style={{ ...s.select, height: "34px", minWidth: "140px" }}>
            <option value="all">Tất cả trạng thái</option>
            <option value="published">Đã đăng</option>
            <option value="draft">Nháp</option>
          </select>

          {/* Category */}
          <select value={fCat} onChange={(e) => setFCat(e.target.value)} style={{ ...s.select, height: "34px", minWidth: "150px" }}>
            <option value="all">Tất cả chuyên mục</option>
            {cats.map((c) => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
          </select>

          {/* Product */}
          <select value={fProd} onChange={(e) => setFProd(e.target.value)} style={{ ...s.select, height: "34px", minWidth: "140px" }}>
            <option value="all">Tất cả sản phẩm</option>
            {prods.map((p) => <option key={p.id} value={String(p.id)}>{p.name}</option>)}
          </select>

          {/* Count + reset */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginLeft: "auto" }}>
            <span style={{ fontSize: "12px", color: A.textLight, whiteSpace: "nowrap" }}>
              {visible.length} / {posts.length} bài
            </span>
            {isFiltered && (
              <button
                onClick={() => { setQ(""); setFStatus("all"); setFCat("all"); setFProd("all"); }}
                style={{ fontSize: "11.5px", color: A.primary, background: "none", border: "none", cursor: "pointer", padding: 0, whiteSpace: "nowrap" }}
              >
                Xóa bộ lọc ×
              </button>
            )}
          </div>
        </div>

        {/* ── Table ── */}
        {loading ? (
          <p style={{ fontSize: "13px", color: A.textMuted }}>Đang tải...</p>
        ) : posts.length === 0 ? (
          /* True empty state */
          <div style={{
            ...s.card, textAlign: "center", padding: "4rem 2rem",
            display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem",
          }}>
            <div style={{
              width: "56px", height: "56px", borderRadius: "14px",
              background: `${A.primary}12`, display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "22px", color: A.primary,
            }}>
              ≡
            </div>
            <div>
              <p style={{ fontSize: "15px", fontWeight: 700, color: A.text, margin: "0 0 6px" }}>Chưa có bài viết nào</p>
              <p style={{ fontSize: "13px", color: A.textMuted, margin: 0 }}>Bắt đầu bằng cách tạo bài viết đầu tiên cho mục Tin tức.</p>
            </div>
            <button style={{ ...s.btnPrimary, marginTop: "0.5rem" }} onClick={newPost}>+ Tạo bài viết đầu tiên</button>
          </div>
        ) : visible.length === 0 ? (
          /* Filtered empty state */
          <div style={{ ...s.card, textAlign: "center", padding: "3rem 2rem" }}>
            <p style={{ fontSize: "14px", fontWeight: 600, color: A.text, margin: "0 0 8px" }}>Không có bài viết phù hợp</p>
            <p style={{ fontSize: "13px", color: A.textMuted, margin: "0 0 1rem" }}>Thử thay đổi từ khóa hoặc bộ lọc trạng thái.</p>
            <button
              style={{ ...s.btnSecondary }}
              onClick={() => { setQ(""); setFStatus("all"); setFCat("all"); setFProd("all"); }}
            >
              Xóa bộ lọc
            </button>
          </div>
        ) : (
          <div style={{ ...s.card, padding: 0, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "rgba(0,0,0,0.015)" }}>
                  {/* Checkbox */}
                  <th style={{ ...s.th, width: "40px", padding: "10px 8px 10px 16px" }}>
                    <input
                      type="checkbox"
                      checked={allChecked}
                      ref={(el) => { if (el) el.indeterminate = someChecked; }}
                      onChange={toggleAll}
                      style={{ cursor: "pointer", width: "15px", height: "15px" }}
                    />
                  </th>
                  <th style={{ ...s.th, width: "72px" }}>Ảnh</th>
                  <th style={s.th}>Tiêu đề</th>
                  <th style={{ ...s.th, width: "120px" }}>Chuyên mục</th>
                  <th style={{ ...s.th, width: "110px" }}>Sản phẩm</th>
                  <th style={{ ...s.th, width: "120px" }}>Tags</th>
                  <th style={{ ...s.th, width: "90px" }}>Trạng thái</th>
                  <th style={{ ...s.th, width: "82px" }}>Ngày đăng</th>
                  <th style={{ ...s.th, width: "82px" }}>Cập nhật</th>
                  <th style={{ ...s.th, width: "130px" }}></th>
                </tr>
              </thead>
              <tbody>
                {visible.map((p, i) => (
                  <PostRow
                    key={p.id}
                    post={p}
                    cats={cats}
                    prods={prods}
                    tags={tags}
                    checked={selected.has(p.id)}
                    isLast={i === visible.length - 1}
                    onToggleCheck={() => toggleSelect(p.id)}
                    onEdit={() => editPost(p)}
                    onDuplicate={() => duplicatePost(p)}
                    onToggleStatus={() => toggleStatus(p)}
                    onDelete={() => deletePost(p.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Bulk bar ── */}
        {selected.size > 0 && (
          <BulkBar
            count={selected.size}
            onPublish={() => bulkSetStatus("published")}
            onDraft={() => bulkSetStatus("draft")}
            onDelete={bulkDelete}
            onClear={clearSelection}
            busy={bulkBusy}
          />
        )}
      </div>
    );
  }

  /* ─────────────── FORM VIEW ─────────────── */
  const isEdit = form.id > 0;
  const canPreview = !!form.slug.trim();
  const publishLabel = isEdit ? (form.status === "published" ? "Cập nhật" : "Xuất bản") : "Đăng bài";

  return (
    <div>

      {/* ── Breadcrumb + header ── */}
      <div style={{ marginBottom: "1.25rem" }}>
        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
          <button
            onClick={() => setView("list")}
            style={{ fontSize: "12.5px", color: A.textMuted, background: "none", border: "none", cursor: "pointer", padding: 0 }}
          >
            Bài viết
          </button>
          <span style={{ fontSize: "12px", color: A.textLight }}>/</span>
          <span style={{ fontSize: "12.5px", color: A.text, fontWeight: 500 }}>
            {isEdit ? "Chỉnh sửa" : "Tạo mới"}
          </span>
        </div>

        {/* Title row */}
        <div style={s.sectionHeader}>
          <h2 style={{ ...s.sectionTitle, margin: 0 }}>
            {isEdit ? "Chỉnh sửa bài viết" : "Tạo bài viết mới"}
          </h2>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            {err && (
              <span style={{
                fontSize: "12px", color: A.danger, maxWidth: "260px", padding: "5px 10px",
                background: "rgba(193,51,51,0.07)", borderRadius: "6px",
              }}>
                {err}
              </span>
            )}
            <button style={s.btnSecondary} disabled={saving} onClick={() => save("draft")}>
              {saving ? "..." : "Lưu nháp"}
            </button>
            <a
              href={canPreview ? `/tin-tuc/${form.slug}` : undefined}
              target="_blank"
              rel="noopener"
              onClick={(e) => { if (!canPreview) e.preventDefault(); }}
              style={{
                display: "inline-flex", alignItems: "center", gap: "4px",
                padding: "6px 12px", borderRadius: "6px", border: `1px solid ${A.border}`,
                fontSize: "12.5px", fontWeight: 500, textDecoration: "none",
                color: canPreview ? A.text : A.textLight,
                cursor: canPreview ? "pointer" : "not-allowed",
                background: "transparent",
              }}
              title={canPreview ? "Xem bài trên website (tab mới)" : "Nhập slug trước để xem trước"}
            >
              ↗ Xem trước
            </a>
            <button style={s.btnPrimary} disabled={saving} onClick={() => save("published")}>
              {saving ? "Đang lưu..." : publishLabel}
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 290px", gap: "1.25rem", alignItems: "start" }}>

        {/* ── LEFT column ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

          {/* Basic info */}
          <div style={s.card}>
            <div style={{ marginBottom: "1rem" }}>
              <label style={s.label}>Tiêu đề bài viết <span style={{ color: A.danger }}>*</span></label>
              <input
                style={{ ...s.field, fontSize: "15px", fontWeight: 600, borderColor: err && !form.title.trim() ? A.danger : undefined }}
                value={form.title}
                placeholder="Nhập tiêu đề bài viết..."
                onChange={(e) => {
                  const title = e.target.value;
                  setForm((f) => ({ ...f, title, slug: f.id ? f.slug : slugify(title) }));
                  if (err === "Tiêu đề là bắt buộc.") setErr("");
                }}
              />
              {err === "Tiêu đề là bắt buộc." && (
                <p style={{ fontSize: "11px", color: A.danger, margin: "3px 0 0" }}>Vui lòng nhập tiêu đề bài viết.</p>
              )}
            </div>
            <div>
              <label style={s.label}>Slug URL</label>
              <div style={{ display: "flex", alignItems: "center", gap: "0" }}>
                <span style={{
                  fontSize: "12.5px", color: A.textMuted, background: "rgba(0,0,0,0.04)",
                  border: `1px solid ${A.border}`, borderRight: "none",
                  padding: "7px 10px", borderRadius: "6px 0 0 6px", flexShrink: 0,
                  lineHeight: "1.4",
                }}>
                  /tin-tuc/
                </span>
                <input
                  style={{ ...s.field, borderRadius: "0 6px 6px 0", flex: 1 }}
                  value={form.slug}
                  placeholder="slug-bai-viet"
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                />
              </div>
              <p style={{ fontSize: "11px", color: A.textLight, margin: "3px 0 0" }}>
                URL công khai: <span style={{ fontFamily: "monospace" }}>/tin-tuc/{form.slug || "..."}</span>
              </p>
            </div>
          </div>

          {/* Excerpt */}
          <div style={s.card}>
            <label style={s.label}>Mô tả ngắn</label>
            <textarea
              style={{ ...s.textarea, height: "80px" }}
              value={form.excerpt ?? ""}
              placeholder="Tóm tắt 1–2 câu hiển thị ngoài trang danh sách..."
              onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
            />
            <p style={{ fontSize: "11px", color: A.textLight, margin: "3px 0 0" }}>
              {(form.excerpt ?? "").length} ký tự
            </p>
          </div>

          {/* Content + Markdown toolbar */}
          <div style={s.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
              <label style={s.label}>Nội dung bài viết</label>
            </div>

            {/* Toolbar */}
            <div style={{
              display: "flex", flexWrap: "wrap", gap: "3px",
              padding: "6px 8px", background: "rgba(0,0,0,0.025)",
              border: `1px solid ${A.border}`, borderBottom: "none",
              borderRadius: "6px 6px 0 0",
            }}>
              {[
                { label: "H2",   title: "Tiêu đề H2",    action: () => insertLinePrefix("## ") },
                { label: "H3",   title: "Tiêu đề H3",    action: () => insertLinePrefix("### ") },
                { label: "B",    title: "In đậm",         action: () => insertAtCursor("**", "**"), bold: true },
                { label: "I",    title: "In nghiêng",     action: () => insertAtCursor("_", "_"), italic: true },
                { label: "—",    title: "Divider",        action: () => insertAtCursor("\n---\n") },
                { label: "List", title: "Danh sách",      action: () => insertLinePrefix("- ") },
                { label: "> ",   title: "Trích dẫn",     action: () => insertLinePrefix("> ") },
                { label: "Link", title: "Chèn liên kết",  action: () => insertAtCursor("[", "](https://...)") },
              ].map((btn) => (
                <button
                  key={btn.label}
                  type="button"
                  title={btn.title}
                  onClick={btn.action}
                  style={{
                    padding: "4px 10px", border: `1px solid ${A.border}`, borderRadius: "4px", cursor: "pointer",
                    fontSize: "11.5px", background: "#fff", color: A.text,
                    fontWeight: btn.bold ? 700 : btn.italic ? 400 : 500,
                    fontStyle: btn.italic ? "italic" : "normal",
                    lineHeight: 1,
                  }}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            <textarea
              ref={contentRef}
              style={{
                ...s.textarea,
                height: "440px",
                fontFamily: "monospace", fontSize: "13px", lineHeight: 1.65,
                borderRadius: "0 0 6px 6px",
              }}
              value={form.content ?? ""}
              placeholder={"# Tiêu đề bài\n\nNội dung đoạn đầu...\n\n## Phần 2\n\nNội dung..."}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
            />
            <p style={{ fontSize: "11px", color: A.textLight, margin: "4px 0 0" }}>
              {(form.content ?? "").length} ký tự
              {(form.content ?? "").trim().length > 0 && (
                <> · ~{Math.max(1, Math.round((form.content ?? "").split(/\s+/).filter(Boolean).length / 200))} phút đọc</>
              )}
            </p>
          </div>

          {/* SEO */}
          <div style={s.card}>
            <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: A.textMuted, margin: "0 0 1.125rem" }}>
              SEO
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={s.label}>SEO Title</label>
                <input
                  style={s.field}
                  value={form.seoTitle ?? ""}
                  placeholder={form.title ? `${form.title} — Thắng SWC` : "Tiêu đề hiển thị trên Google..."}
                  onChange={(e) => setForm((f) => ({ ...f, seoTitle: e.target.value }))}
                />
                <p style={{ fontSize: "11px", color: (form.seoTitle ?? "").length > 60 ? "#d97706" : A.textLight, margin: "3px 0 0" }}>
                  {(form.seoTitle ?? "").length} / 60 · Nên dưới 60 ký tự
                </p>
              </div>
              <div>
                <label style={s.label}>SEO Description</label>
                <textarea
                  style={{ ...s.textarea, height: "72px" }}
                  value={form.seoDescription ?? ""}
                  placeholder="Mô tả hiển thị trên kết quả tìm kiếm Google..."
                  onChange={(e) => setForm((f) => ({ ...f, seoDescription: e.target.value }))}
                />
                <p style={{ fontSize: "11px", color: (form.seoDescription ?? "").length > 160 ? "#d97706" : A.textLight, margin: "3px 0 0" }}>
                  {(form.seoDescription ?? "").length} / 160 · Nên dưới 160 ký tự
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT sidebar ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

          {/* Publish / status */}
          <div style={s.card}>
            <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: A.textMuted, margin: "0 0 1rem" }}>
              Xuất bản
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              <div>
                <label style={s.label}>Trạng thái</label>
                <select
                  style={s.select}
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                >
                  <option value="draft">Nháp</option>
                  <option value="published">Đã đăng</option>
                </select>
              </div>
              {form.status === "published" && (
                <div>
                  <label style={s.label}>Ngày đăng</label>
                  <input
                    type="datetime-local"
                    style={{ ...s.field, fontSize: "12px" }}
                    value={form.publishedAt ? form.publishedAt.slice(0, 16) : ""}
                    onChange={(e) => setForm((f) => ({ ...f, publishedAt: e.target.value ? new Date(e.target.value).toISOString() : null }))}
                  />
                </div>
              )}
              <div>
                <label style={s.label}>Tác giả</label>
                <input style={s.field} value={form.authorName} onChange={(e) => setForm((f) => ({ ...f, authorName: e.target.value }))} />
              </div>
              {isEdit && form.updatedAt && (
                <p style={{ fontSize: "11px", color: A.textLight, margin: 0 }}>
                  Cập nhật lần cuối: {fmtDate(form.updatedAt)}
                </p>
              )}
            </div>
          </div>

          {/* Classification */}
          <div style={s.card}>
            <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: A.textMuted, margin: "0 0 1rem" }}>
              Phân loại
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              <div>
                <label style={s.label}>Chuyên mục</label>
                <select style={s.select} value={form.categoryId ?? ""} onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value ? Number(e.target.value) : null }))}>
                  <option value="">Không có</option>
                  {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label style={s.label}>Sản phẩm liên quan</label>
                <select style={s.select} value={form.productId ?? ""} onChange={(e) => setForm((f) => ({ ...f, productId: e.target.value ? Number(e.target.value) : null }))}>
                  <option value="">Không có</option>
                  {prods.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div style={s.card}>
            <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: A.textMuted, margin: "0 0 0.875rem" }}>
              Tags
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
              {tags.map((t) => {
                const active = form.tagIds.includes(t.id);
                return (
                  <button key={t.id} type="button" onClick={() => toggleTag(t.id)} style={{
                    padding: "4px 11px", borderRadius: "999px", border: "1px solid", cursor: "pointer", fontSize: "12px",
                    borderColor: active ? A.primary : A.border,
                    background: active ? `${A.primary}16` : "transparent",
                    color: active ? A.primary : A.textMuted,
                    fontWeight: active ? 600 : 400,
                    transition: "all 0.12s ease",
                  }}>
                    #{t.slug}
                  </button>
                );
              })}
              {tags.length === 0 && (
                <p style={{ fontSize: "12px", color: A.textLight, margin: 0 }}>Chưa có tag. Thêm trong mục Tags.</p>
              )}
            </div>
          </div>

          {/* Featured image */}
          <ImageCard
            featuredImage={form.featuredImage}
            featuredImageDisplay={form.featuredImageDisplay}
            postId={form.id}
            productId={form.productId}
            categoryId={form.categoryId}
            prods={prods}
            cats={cats}
            adminKey={adminKey}
            onChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
          />

          {/* Display options */}
          <div style={s.card}>
            <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: A.textMuted, margin: "0 0 1rem" }}>
              Tuỳ chọn hiển thị
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {[
                { key: "isFeatured",     label: "Bài nổi bật",             hint: "Hiển thị nổi bật trên trang chủ" },
                { key: "showOnHomepage", label: "Hiển thị ở trang chủ",    hint: "Đưa vào danh sách bài viết chọn lọc" },
                { key: "showInRelated",  label: "Hiển thị trong liên quan", hint: "Gợi ý trong phần bài liên quan" },
              ].map(({ key, label, hint }) => {
                const val = form[key as keyof PostForm] as boolean;
                return (
                  <label key={key} style={{ display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={val}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.checked }))}
                      style={{ marginTop: "2px", width: "15px", height: "15px", cursor: "pointer", accentColor: A.primary }}
                    />
                    <div>
                      <p style={{ fontSize: "12.5px", fontWeight: 500, color: A.text, margin: "0 0 1px" }}>{label}</p>
                      <p style={{ fontSize: "11px", color: A.textLight, margin: 0 }}>{hint}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

/* ── Row component ────────────────────────────────────────────────── */
function PostRow({
  post, cats, prods, tags, checked, isLast,
  onToggleCheck, onEdit, onDuplicate, onToggleStatus, onDelete,
}: {
  post: NewsPost; cats: NewsCategory[]; prods: NewsProduct[]; tags: NewsTag[];
  checked: boolean; isLast: boolean;
  onToggleCheck: () => void; onEdit: () => void; onDuplicate: () => void;
  onToggleStatus: () => void; onDelete: () => void;
}) {
  const [hov, setHov] = useState(false);
  const cat  = cats.find((c) => c.id === post.categoryId);
  const prod = prods.find((p) => p.id === post.productId);
  const tagIds = (post.tags ?? []).map((t) => t.id);

  const rowBg = checked ? `${A.primary}06` : hov ? "rgba(0,0,0,0.015)" : "#fff";

  return (
    <tr
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: rowBg,
        borderBottom: isLast ? "none" : `1px solid rgba(0,0,0,0.04)`,
        transition: "background 0.1s ease",
      }}
    >
      {/* Checkbox */}
      <td style={{ ...s.td, padding: "10px 8px 10px 16px", width: "40px" }}>
        <input type="checkbox" checked={checked} onChange={onToggleCheck}
          style={{ cursor: "pointer", width: "15px", height: "15px" }} />
      </td>

      {/* Thumb */}
      <td style={{ ...s.td, width: "72px", padding: "10px 8px" }}>
        <RowThumb post={post} prods={prods} cats={cats} />
      </td>

      {/* Title */}
      <td style={{ ...s.td, maxWidth: "240px" }}>
        <p style={{
          margin: "0 0 3px", fontWeight: 500, fontSize: "13px", color: A.text,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          maxWidth: "230px",
        }}>
          {post.title}
        </p>
        {post.excerpt && (
          <p style={{
            margin: 0, fontSize: "11.5px", color: A.textMuted,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            maxWidth: "230px",
          }}>
            {post.excerpt}
          </p>
        )}
      </td>

      {/* Category */}
      <td style={{ ...s.td, width: "120px" }}>
        <span style={{ fontSize: "12px", color: A.textMuted }}>{cat?.name ?? "—"}</span>
      </td>

      {/* Product */}
      <td style={{ ...s.td, width: "110px" }}>
        {prod ? (
          <span style={{ fontSize: "11.5px", color: A.primary, fontWeight: 500, background: `${A.primary}10`, padding: "2px 7px", borderRadius: "4px" }}>
            {prod.name}
          </span>
        ) : (
          <span style={{ fontSize: "12px", color: A.textLight }}>—</span>
        )}
      </td>

      {/* Tags */}
      <td style={{ ...s.td, width: "120px" }}>
        <TagChips tagIds={tagIds} allTags={tags} />
      </td>

      {/* Status */}
      <td style={{ ...s.td, width: "90px" }}>
        <StatusPill status={post.status} />
      </td>

      {/* Published */}
      <td style={{ ...s.td, width: "82px" }}>
        <span style={{ fontSize: "11.5px", color: A.textLight }}>{post.publishedAt ? fmtDate(post.publishedAt) : "—"}</span>
      </td>

      {/* Updated */}
      <td style={{ ...s.td, width: "82px" }}>
        <span style={{ fontSize: "11.5px", color: A.textLight }}>{fmtDate(post.updatedAt ?? post.createdAt)}</span>
      </td>

      {/* Actions */}
      <td style={{ ...s.td, width: "130px" }}>
        <div style={{ display: "flex", gap: "4px", flexWrap: "nowrap" }}>
          <a
            href={`/tin-tuc/${post.slug}`}
            target="_blank"
            rel="noopener"
            title="Xem bài trên website"
            style={{
              padding: "4px 9px", borderRadius: "5px", border: `1px solid ${A.border}`,
              fontSize: "11.5px", color: A.textMuted, textDecoration: "none",
              background: hov ? "#f9fafb" : "#fff",
            }}
          >
            ↗
          </a>
          <button onClick={onEdit} title="Sửa" style={{ ...s.btnSecondary, padding: "4px 10px", fontSize: "11.5px" }}>Sửa</button>
          <MoreMenu
            onDuplicate={onDuplicate}
            onToggleStatus={onToggleStatus}
            status={post.status}
            onDelete={onDelete}
          />
        </div>
      </td>
    </tr>
  );
}

/* ── More menu (…) for row ────────────────────────────────────────── */
function MoreMenu({ onDuplicate, onToggleStatus, status, onDelete }: {
  onDuplicate: () => void; onToggleStatus: () => void; status: string; onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          ...s.btnSecondary, padding: "4px 8px", fontSize: "14px", fontWeight: 700,
          lineHeight: 1, letterSpacing: "0.05em",
        }}
        title="Thêm hành động"
      >
        ···
      </button>
      {open && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 49 }} onClick={() => setOpen(false)} />
          <div style={{
            position: "absolute", right: 0, top: "calc(100% + 4px)", zIndex: 50,
            background: "#fff", border: `1px solid ${A.border}`, borderRadius: "8px",
            boxShadow: "0 6px 24px rgba(0,0,0,0.10)", minWidth: "160px", overflow: "hidden",
          }}>
            <MenuItem label="Nhân bản" onClick={() => { setOpen(false); onDuplicate(); }} />
            <MenuItem label={status === "published" ? "Chuyển nháp" : "Xuất bản ngay"} onClick={() => { setOpen(false); onToggleStatus(); }} />
            <div style={{ height: "1px", background: A.border, margin: "3px 0" }} />
            <MenuItem label="Xóa bài viết" danger onClick={() => { setOpen(false); onDelete(); }} />
          </div>
        </>
      )}
    </div>
  );
}

function MenuItem({ label, onClick, danger }: { label: string; onClick: () => void; danger?: boolean }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: "100%", textAlign: "left", padding: "8px 14px", border: "none", cursor: "pointer",
        fontSize: "12.5px", fontWeight: danger ? 500 : 400,
        background: hov ? (danger ? "rgba(193,51,51,0.06)" : "rgba(0,0,0,0.03)") : "#fff",
        color: danger ? A.danger : A.text,
        display: "block",
      }}
    >
      {label}
    </button>
  );
}

/* ── ImageCard ────────────────────────────────────────────────────── */
function ImageCard({
  featuredImage, featuredImageDisplay,
  postId, productId, categoryId, prods, cats, adminKey, onChange,
}: {
  featuredImage: string | null | undefined;
  featuredImageDisplay: string | null | undefined;
  postId: number | null | undefined;
  productId: number | null | undefined;
  categoryId: number | null | undefined;
  prods: NewsProduct[];
  cats: NewsCategory[];
  adminKey: string;
  onChange: (patch: { featuredImage?: string | null; featuredImageDisplay?: string | null }) => void;
}) {
  const { src, isFallback, poolSize } = getAdminPreviewImage(
    featuredImage, featuredImageDisplay, postId, productId, categoryId, prods, cats,
  );
  const [imgErr,     setImgErr]     = React.useState(false);
  const [uploading,  setUploading]  = React.useState(false);
  const [uploadMsg,  setUploadMsg]  = React.useState("");
  const fileRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => { setImgErr(false); }, [featuredImage, featuredImageDisplay]);

  const hasCustom = !!(
    (typeof featuredImageDisplay === "string" && featuredImageDisplay.trim()) ||
    (typeof featuredImage === "string" && featuredImage.trim())
  );

  const uploadContext = React.useMemo(() => {
    const prod = prods.find((p) => p.id === productId);
    if (prod?.slug === "atlas")      return "atlas";
    if (prod?.slug === "road-to-1m") return "road-to-1m";
    const cat = cats.find((c) => c.id === categoryId);
    if (cat?.slug === "tu-duy-dau-tu") return "tu-duy-dau-tu";
    return "default";
  }, [productId, categoryId, prods, cats]);

  const fallbackLabel = React.useMemo(() => {
    if (!isFallback) return null;
    if (uploadContext === "atlas")          return "Mặc định: ATLAS";
    if (uploadContext === "road-to-1m")     return "Mặc định: Road to $1M";
    if (uploadContext === "tu-duy-dau-tu")  return "Mặc định: Tư duy đầu tư";
    return "Mặc định chung";
  }, [isFallback, uploadContext]);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!fileRef.current) return;
    fileRef.current.value = "";
    if (!file) return;
    setUploading(true); setUploadMsg("");
    try {
      const { original, display } = await adminApi.uploadImage(adminKey, file, uploadContext);
      onChange({ featuredImage: original, featuredImageDisplay: display });
      setUploadMsg("Ảnh đã được xử lý và tải lên.");
    } catch (err) {
      setUploadMsg(`Lỗi: ${String(err)}`);
    } finally { setUploading(false); }
  };

  const clearImage = () => {
    onChange({ featuredImage: "", featuredImageDisplay: "" });
    setUploadMsg("");
  };

  const isUploadedDisplay = !!(typeof featuredImageDisplay === "string" && featuredImageDisplay.trim());

  return (
    <div style={s.card}>
      <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: A.textMuted, margin: "0 0 0.875rem" }}>
        Ảnh đại diện
      </p>

      {/* Preview */}
      <div style={{
        aspectRatio: "16/9", borderRadius: "7px", overflow: "hidden", marginBottom: "0.875rem",
        background: isFallback ? "#091e1b" : "#f3f4f6",
        border: `1px solid ${A.border}`, position: "relative",
      }}>
        {uploading ? (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "0.5rem", background: "rgba(0,0,0,0.05)" }}>
            <div style={{ width: "32px", height: "32px", border: `3px solid ${A.primary}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <span style={{ fontSize: "12px", color: A.textMuted }}>Đang xử lý ảnh...</span>
          </div>
        ) : !imgErr ? (
          <img src={src} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} onError={() => setImgErr(true)} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: "12px", color: A.danger }}>URL ảnh không hợp lệ</span>
          </div>
        )}

        {/* Badges */}
        {!uploading && isFallback && (
          <div style={{ position: "absolute", bottom: "7px", left: "7px", background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)", borderRadius: "4px", padding: "2px 7px", fontSize: "9.5px", fontWeight: 600, color: "rgba(255,255,255,0.72)" }}>
            {fallbackLabel}
          </div>
        )}
        {!uploading && isUploadedDisplay && (
          <div style={{ position: "absolute", top: "7px", right: "7px", background: `${A.primary}cc`, borderRadius: "4px", padding: "2px 8px", fontSize: "9px", fontWeight: 700, letterSpacing: "0.08em", color: "#fff" }}>
            ĐÃ XỬ LÝ
          </div>
        )}
      </div>

      {/* Actions row */}
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center", marginBottom: "0.75rem" }}>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
        <button
          style={{ ...s.btnSecondary, padding: "7px 14px", fontSize: "12.5px" }}
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
        >
          {uploading ? "Đang tải..." : hasCustom ? "Thay ảnh" : "Tải ảnh lên"}
        </button>
        {hasCustom && (
          <button style={{ ...s.btnDanger, fontSize: "11.5px", padding: "6px 12px" }} onClick={clearImage}>
            Xóa ảnh
          </button>
        )}
        {uploadMsg && (
          <span style={{ fontSize: "11px", color: uploadMsg.startsWith("Lỗi") ? A.danger : A.primary }}>
            {uploadMsg}
          </span>
        )}
      </div>

      {/* Manual URL fallback */}
      <div style={{ marginBottom: "0.5rem" }}>
        <label style={{ ...s.label, fontSize: "10.5px" }}>Hoặc dán URL ảnh trực tiếp</label>
        <input
          style={{ ...s.field, fontSize: "12.5px" }}
          placeholder="https://... (để trống = ảnh tự động)"
          value={featuredImage ?? ""}
          onChange={(e) => onChange({ featuredImage: e.target.value, featuredImageDisplay: null })}
        />
      </div>

      <p style={{ fontSize: "10.5px", color: A.textLight, lineHeight: 1.65, margin: 0 }}>
        {isFallback
          ? `Nếu không tải ảnh lên, hệ thống tự dùng ảnh mặc định phù hợp theo chuyên mục hoặc sản phẩm liên quan (${poolSize} lựa chọn).`
          : isUploadedDisplay
            ? "Ảnh đã được tối ưu hóa và gắn watermark tự động. Bấm Thay ảnh để đổi."
            : "Ảnh URL tùy chỉnh. Xóa để dùng ảnh tự động."}
      </p>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
