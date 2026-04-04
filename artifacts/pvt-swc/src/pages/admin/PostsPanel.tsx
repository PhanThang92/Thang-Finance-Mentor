import React, { useEffect, useState, useCallback } from "react";
import { adminApi, type NewsPost, type NewsCategory, type NewsProduct, type NewsTag } from "@/lib/newsApi";
import { A, s, fmtDate, slugify } from "./shared";

/* Curated fallback pools (mirrors postImage.ts) */
const ADMIN_POOLS: Record<string, string[]> = {
  atlas:           ["/images/fallback-atlas.svg", "/images/fallback-atlas-2.svg", "/images/fallback-atlas-3.svg"],
  "road-to-1m":   ["/images/fallback-road-to-1m.svg", "/images/fallback-road-to-1m-2.svg", "/images/fallback-road-to-1m-3.svg"],
  "tu-duy-dau-tu":["/images/fallback-tu-duy.svg", "/images/fallback-tu-duy-2.svg", "/images/fallback-tu-duy-3.svg"],
  default:        ["/images/fallback-default.svg", "/images/fallback-default-2.svg"],
};

/* Compute preview image for admin editor (postId=0 → first of pool) */
function getAdminPreviewImage(
  featuredImage: string | null | undefined,
  postId: number | null | undefined,
  productId: number | null | undefined,
  categoryId: number | null | undefined,
  prods: NewsProduct[],
  cats: NewsCategory[],
): { src: string; isFallback: boolean; poolSize: number } {
  if (featuredImage?.trim()) return { src: featuredImage.trim(), isFallback: false, poolSize: 1 };
  const seed = postId ?? 0;
  const prod = prods.find((p) => p.id === productId);
  if (prod?.slug === "atlas") {
    const pool = ADMIN_POOLS.atlas;
    return { src: pool[seed % pool.length], isFallback: true, poolSize: pool.length };
  }
  if (prod?.slug === "road-to-1m") {
    const pool = ADMIN_POOLS["road-to-1m"];
    return { src: pool[seed % pool.length], isFallback: true, poolSize: pool.length };
  }
  const cat = cats.find((c) => c.id === categoryId);
  if (cat?.slug === "tu-duy-dau-tu") {
    const pool = ADMIN_POOLS["tu-duy-dau-tu"];
    return { src: pool[seed % pool.length], isFallback: true, poolSize: pool.length };
  }
  const pool = ADMIN_POOLS.default;
  return { src: pool[seed % pool.length], isFallback: true, poolSize: pool.length };
}

const EMPTY: NewsPost & { tagIds: number[] } = {
  id: 0, title: "", slug: "", excerpt: "", content: "", featuredImage: "",
  categoryId: null, productId: null, status: "draft",
  publishedAt: null, authorName: "Phan Văn Thắng",
  seoTitle: "", seoDescription: "", createdAt: "", updatedAt: "", tagIds: [],
};

type PostForm = typeof EMPTY;

export function PostsPanel({ adminKey }: { adminKey: string }) {
  const [posts, setPosts]       = useState<NewsPost[]>([]);
  const [cats, setCats]         = useState<NewsCategory[]>([]);
  const [prods, setProds]       = useState<NewsProduct[]>([]);
  const [tags, setTags]         = useState<NewsTag[]>([]);
  const [loading, setLoading]   = useState(true);
  const [view, setView]         = useState<"list" | "form">("list");
  const [form, setForm]         = useState<PostForm>(EMPTY);
  const [saving, setSaving]     = useState(false);
  const [err, setErr]           = useState("");
  const [filterStatus, setFilter] = useState("all");

  const reload = useCallback(() => {
    setLoading(true);
    Promise.all([adminApi.getPosts(adminKey), adminApi.getMeta(adminKey)]).then(([posts, meta]) => {
      setPosts(posts); setCats(meta.categories); setProds(meta.products); setTags(meta.tags);
    }).finally(() => setLoading(false));
  }, [adminKey]);

  useEffect(() => { reload(); }, [reload]);

  const newPost = () => { setForm(EMPTY); setErr(""); setView("form"); };
  const editPost = (p: NewsPost) => {
    setForm({ ...p, excerpt: p.excerpt ?? "", content: p.content ?? "", featuredImage: p.featuredImage ?? "",
      seoTitle: p.seoTitle ?? "", seoDescription: p.seoDescription ?? "",
      categoryId: p.categoryId, productId: p.productId,
      tagIds: (p.tags ?? []).map((t) => t.id) });
    setErr(""); setView("form");
  };

  const save = async (status: "draft" | "published") => {
    setSaving(true); setErr("");
    try {
      const payload = { ...form, status, categoryId: form.categoryId || null, productId: form.productId || null };
      if (form.id) {
        const updated = await adminApi.updatePost(adminKey, form.id, payload);
        setPosts((prev) => prev.map((p) => p.id === updated.id ? { ...updated, tags: form.tags } : p));
      } else {
        const created = await adminApi.createPost(adminKey, payload);
        setPosts((prev) => [{ ...created, tags: [] }, ...prev]);
      }
      setView("list");
    } catch (e) { setErr(String(e)); }
    finally { setSaving(false); }
  };

  const deletePost = async (id: number) => {
    if (!confirm("Xóa bài viết này?")) return;
    await adminApi.deletePost(adminKey, id).catch(console.error);
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  const toggleTag = (id: number) => setForm((f) => ({ ...f, tagIds: f.tagIds.includes(id) ? f.tagIds.filter((t) => t !== id) : [...f.tagIds, id] }));

  const visible = filterStatus === "all" ? posts : posts.filter((p) => p.status === filterStatus);

  /* ── List view ── */
  if (view === "list") {
    return (
      <div>
        <div style={s.sectionHeader}>
          <h2 style={s.sectionTitle}>Bài viết ({posts.length})</h2>
          <button style={s.btnPrimary} onClick={newPost}>+ Viết bài mới</button>
        </div>

        {/* Filter */}
        <div style={{ display: "flex", gap: "4px", background: "rgba(0,0,0,0.05)", padding: "3px", borderRadius: "8px", width: "fit-content", marginBottom: "1.25rem" }}>
          {[["all", "Tất cả"], ["published", "Đã đăng"], ["draft", "Nháp"]].map(([v, l]) => (
            <button key={v} onClick={() => setFilter(v)} style={{
              padding: "5px 16px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "12.5px", fontWeight: 500,
              background: filterStatus === v ? A.primary : "transparent", color: filterStatus === v ? "#fff" : A.textMuted,
            }}>{l}</button>
          ))}
        </div>

        {loading
          ? <p style={{ fontSize: "13px", color: A.textMuted }}>Đang tải...</p>
          : (
            <div style={{ ...s.card, padding: 0, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr>
                  <th style={s.th}>Tiêu đề</th>
                  <th style={s.th}>Trạng thái</th>
                  <th style={s.th}>Chuyên mục</th>
                  <th style={s.th}>Ngày</th>
                  <th style={s.th}></th>
                </tr></thead>
                <tbody>
                  {visible.map((p) => (
                    <tr key={p.id}>
                      <td style={s.td}><span style={{ fontWeight: 500 }}>{p.title}</span></td>
                      <td style={s.td}>
                        <span style={{
                          fontSize: "10.5px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase",
                          padding: "3px 9px", borderRadius: "5px",
                          background: p.status === "published" ? "rgba(26,120,104,0.10)" : "rgba(0,0,0,0.06)",
                          color: p.status === "published" ? A.primary : A.textMuted,
                        }}>{p.status === "published" ? "Đã đăng" : "Nháp"}</span>
                      </td>
                      <td style={s.td}><span style={{ fontSize: "12.5px", color: A.textMuted }}>{(p as NewsPost & { category?: { name: string } }).category?.name ?? "—"}</span></td>
                      <td style={s.td}><span style={{ fontSize: "12px", color: A.textLight }}>{fmtDate(p.publishedAt ?? p.createdAt)}</span></td>
                      <td style={s.td}>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <button style={s.btnSecondary} onClick={() => editPost(p)}>Sửa</button>
                          <button style={s.btnDanger} onClick={() => deletePost(p.id)}>Xóa</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {visible.length === 0 && (
                    <tr><td colSpan={5} style={{ ...s.td, textAlign: "center", color: A.textLight, padding: "2rem" }}>Không có bài viết nào.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )
        }
      </div>
    );
  }

  /* ── Form view ── */
  return (
    <div>
      <div style={s.sectionHeader}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
          <button style={{ ...s.btnGhost, padding: "4px 10px" }} onClick={() => setView("list")}>← Quay lại</button>
          <h2 style={s.sectionTitle}>{form.id ? "Sửa bài viết" : "Bài viết mới"}</h2>
        </div>
        <div style={{ display: "flex", gap: "0.625rem", alignItems: "center" }}>
          {err && <span style={{ fontSize: "12px", color: A.danger, maxWidth: "280px" }}>{err}</span>}
          <button style={s.btnSecondary} disabled={saving} onClick={() => save("draft")}>{saving ? "..." : "Lưu nháp"}</button>
          <button style={s.btnPrimary}   disabled={saving} onClick={() => save("published")}>{saving ? "Đang lưu..." : "Đăng bài"}</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "1.25rem", alignItems: "start" }}>
        {/* Main */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={s.card}>
            <div style={{ marginBottom: "1rem" }}>
              <label style={s.label}>Tiêu đề</label>
              <input style={{ ...s.field, fontSize: "15px", fontWeight: 600 }} value={form.title}
                onChange={(e) => { setForm((f) => ({ ...f, title: e.target.value, slug: f.id ? f.slug : slugify(e.target.value) })); }} />
            </div>
            <div>
              <label style={s.label}>Slug (URL)</label>
              <input style={s.field} value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} />
            </div>
          </div>

          <div style={s.card}>
            <label style={s.label}>Tóm tắt</label>
            <textarea style={{ ...s.textarea, height: "80px" }} value={form.excerpt ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))} />
          </div>

          <div style={s.card}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <label style={s.label}>Nội dung</label>
              <span style={{ fontSize: "10.5px", color: A.textLight }}>Hỗ trợ: # H2, ## H3, - danh sách, xuống dòng đôi = đoạn mới</span>
            </div>
            <textarea style={{ ...s.textarea, height: "360px", fontFamily: "monospace", fontSize: "13px" }}
              value={form.content ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} />
          </div>

          <div style={s.card}>
            <p style={{ ...s.label, fontSize: "12px", marginBottom: "1rem" }}>SEO</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={s.label}>SEO Title</label>
                <input style={s.field} value={form.seoTitle ?? ""} onChange={(e) => setForm((f) => ({ ...f, seoTitle: e.target.value }))} />
              </div>
              <div>
                <label style={s.label}>SEO Description</label>
                <input style={s.field} value={form.seoDescription ?? ""} onChange={(e) => setForm((f) => ({ ...f, seoDescription: e.target.value }))} />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={s.card}>
            <p style={{ ...s.label, fontSize: "12px", marginBottom: "1rem" }}>Phân loại</p>
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
              <div>
                <label style={s.label}>Tác giả</label>
                <input style={s.field} value={form.authorName} onChange={(e) => setForm((f) => ({ ...f, authorName: e.target.value }))} />
              </div>
            </div>
          </div>

          <div style={s.card}>
            <label style={{ ...s.label, marginBottom: "0.75rem" }}>Tags</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
              {tags.map((t) => {
                const active = form.tagIds.includes(t.id);
                return (
                  <button key={t.id} type="button" onClick={() => toggleTag(t.id)} style={{
                    padding: "4px 11px", borderRadius: "999px", border: "1px solid", cursor: "pointer", fontSize: "12px",
                    borderColor: active ? A.primary : A.border, background: active ? `${A.primary}16` : "transparent",
                    color: active ? A.primary : A.textMuted, fontWeight: active ? 600 : 400,
                  }}>#{t.slug}</button>
                );
              })}
            </div>
          </div>

          <ImageCard
            featuredImage={form.featuredImage}
            postId={form.id}
            productId={form.productId}
            categoryId={form.categoryId}
            prods={prods}
            cats={cats}
            onChange={(v) => setForm((f) => ({ ...f, featuredImage: v }))}
          />
        </div>
      </div>
    </div>
  );
}

/* ── Image card with live preview ──────────────────────────────────── */
function ImageCard({
  featuredImage, postId, productId, categoryId, prods, cats, onChange,
}: {
  featuredImage: string | null | undefined;
  postId: number | null | undefined;
  productId: number | null | undefined;
  categoryId: number | null | undefined;
  prods: NewsProduct[];
  cats: NewsCategory[];
  onChange: (v: string) => void;
}) {
  const { src, isFallback, poolSize } = getAdminPreviewImage(featuredImage, postId, productId, categoryId, prods, cats);
  const [imgErr, setImgErr]  = React.useState(false);

  React.useEffect(() => { setImgErr(false); }, [featuredImage]);

  const fallbackLabel = React.useMemo(() => {
    if (!isFallback) return null;
    const prod = prods.find((p) => p.id === productId);
    if (prod?.slug === "atlas")      return "Ảnh mặc định: ATLAS";
    if (prod?.slug === "road-to-1m") return "Ảnh mặc định: Road to $1M";
    const cat = cats.find((c) => c.id === categoryId);
    if (cat?.slug === "tu-duy-dau-tu") return "Ảnh mặc định: Tư duy đầu tư";
    return "Ảnh mặc định chung";
  }, [isFallback, productId, categoryId, prods, cats]);

  return (
    <div style={s.card}>
      <label style={{ ...s.label, marginBottom: "0.75rem" }}>Ảnh đại diện</label>

      {/* Preview */}
      <div style={{
        aspectRatio: "16/9", borderRadius: "8px", overflow: "hidden", marginBottom: "0.875rem",
        background: isFallback ? "#091e1b" : "#f3f4f6",
        border: `1px solid ${A.border}`,
        position: "relative",
      }}>
        {!imgErr
          ? <img src={src} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} onError={() => setImgErr(true)} />
          : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: "12px", color: A.danger }}>URL ảnh không hợp lệ</span>
            </div>
          )
        }
        {isFallback && (
          <div style={{
            position: "absolute", bottom: "8px", left: "8px",
            background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)",
            borderRadius: "4px", padding: "3px 8px",
            fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em", color: "rgba(255,255,255,0.72)",
          }}>
            {fallbackLabel}
          </div>
        )}
      </div>

      {/* URL input */}
      <input
        style={s.field}
        placeholder="https://... (để trống để dùng ảnh tự động)"
        value={featuredImage ?? ""}
        onChange={(e) => onChange(e.target.value)}
      />

      {featuredImage && (
        <button
          style={{ ...s.btnDanger, marginTop: "0.5rem", fontSize: "11px", padding: "4px 10px" }}
          onClick={() => onChange("")}
        >
          Xóa ảnh
        </button>
      )}

      <p style={{ fontSize: "11px", color: A.textLight, lineHeight: 1.65, marginTop: "0.625rem" }}>
        {isFallback
          ? `Để trống = ảnh tự động (${poolSize} lựa chọn theo nhóm). Mỗi bài chọn khác nhau dựa theo ID.`
          : "Ảnh tuỳ chỉnh đang được sử dụng. Xoá URL để quay lại ảnh tự động."}
      </p>
    </div>
  );
}
