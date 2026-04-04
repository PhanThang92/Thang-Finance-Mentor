import React, { useState, useEffect } from "react";
import { adminApi, type NewsPost, type NewsCategory, type NewsProduct, type NewsTag } from "@/lib/newsApi";

/* ── styles ───────────────────────────────────────────────────────── */
const field: React.CSSProperties = {
  width: "100%", padding: "8px 12px", borderRadius: "7px", fontSize: "13px",
  border: "1px solid hsl(var(--border) / 0.80)", background: "transparent",
  color: "hsl(var(--foreground))", outline: "none", boxSizing: "border-box",
};
const fieldTextarea: React.CSSProperties = { ...field, padding: "10px 12px", resize: "vertical" as const, lineHeight: 1.65 };
const label: React.CSSProperties = { fontSize: "11px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "hsl(var(--foreground) / 0.38)", display: "block", marginBottom: "5px" };
const btnPrimary: React.CSSProperties = {
  padding: "9px 22px", borderRadius: "999px", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 600,
  background: "linear-gradient(140deg, #22917f, #1a7868)", color: "#fff",
  boxShadow: "0 3px 14px rgba(26,120,104,0.25)", transition: "opacity 0.18s ease",
};
const btnSecondary: React.CSSProperties = {
  padding: "8px 18px", borderRadius: "999px", border: "1px solid hsl(var(--border) / 0.70)", cursor: "pointer", fontSize: "12.5px", fontWeight: 500,
  background: "transparent", color: "hsl(var(--foreground) / 0.65)", transition: "all 0.18s ease",
};
const btnDanger: React.CSSProperties = {
  padding: "5px 14px", borderRadius: "999px", border: "1px solid rgba(220,60,60,0.35)", cursor: "pointer", fontSize: "11.5px", fontWeight: 500,
  background: "transparent", color: "rgba(200,50,50,0.75)", transition: "all 0.18s ease",
};

/* ── helpers ──────────────────────────────────────────────────────── */
function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}
function slugify(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

/* ── Post form ─────────────────────────────────────────────────────── */
const EMPTY_FORM = {
  title: "", slug: "", excerpt: "", content: "", featuredImage: "",
  categoryId: "", productId: "", status: "draft", authorName: "Phan Văn Thắng",
  seoTitle: "", seoDescription: "", tagIds: [] as number[],
};
type FormState = typeof EMPTY_FORM;

function PostForm({ initial, categories, products, tags, onSave, onCancel }: {
  initial?: FormState & { id?: number };
  categories: NewsCategory[]; products: NewsProduct[]; tags: NewsTag[];
  onSave: (data: FormState & { id?: number }) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<FormState>(initial ?? EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const set = (k: keyof FormState, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const toggleTag = (id: number) => {
    setForm((f) => ({
      ...f,
      tagIds: f.tagIds.includes(id) ? f.tagIds.filter((t) => t !== id) : [...f.tagIds, id],
    }));
  };

  async function submit(status: "draft" | "published") {
    setSaving(true); setErr("");
    try {
      await onSave({ ...form, status, id: (initial as { id?: number } | undefined)?.id });
    } catch (e) {
      setErr(String(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {err && <div style={{ background: "rgba(220,60,60,0.08)", border: "1px solid rgba(220,60,60,0.25)", borderRadius: "8px", padding: "10px 14px", fontSize: "13px", color: "rgba(200,50,50,0.9)" }}>{err}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label style={label}>Tiêu đề</label>
          <input style={field} value={form.title} onChange={(e) => { set("title", e.target.value); if (!initial?.slug) set("slug", slugify(e.target.value)); }} />
        </div>
        <div>
          <label style={label}>Slug (URL)</label>
          <input style={field} value={form.slug} onChange={(e) => set("slug", e.target.value)} />
        </div>
      </div>

      <div>
        <label style={label}>Tóm tắt</label>
        <textarea style={{ ...fieldTextarea, height: "70px" }} value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} />
      </div>

      <div>
        <label style={label}>Nội dung</label>
        <textarea style={{ ...fieldTextarea, height: "240px", fontFamily: "monospace", fontSize: "12.5px" }} value={form.content} onChange={(e) => set("content", e.target.value)} />
        <p style={{ fontSize: "10.5px", color: "hsl(var(--foreground) / 0.30)", marginTop: "4px" }}>Hỗ trợ # Tiêu đề, ## Phụ đề, - Danh sách, và xuống dòng đôi để ngắt đoạn.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label style={label}>Danh mục</label>
          <select style={{ ...field, appearance: "none" as const }} value={form.categoryId} onChange={(e) => set("categoryId", e.target.value)}>
            <option value="">Không có</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label style={label}>Sản phẩm liên quan</label>
          <select style={{ ...field, appearance: "none" as const }} value={form.productId} onChange={(e) => set("productId", e.target.value)}>
            <option value="">Không có</option>
            {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label style={label}>Tác giả</label>
          <input style={field} value={form.authorName} onChange={(e) => set("authorName", e.target.value)} />
        </div>
      </div>

      <div>
        <label style={label}>Ảnh đại diện (URL)</label>
        <input style={field} placeholder="https://..." value={form.featuredImage} onChange={(e) => set("featuredImage", e.target.value)} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label style={label}>SEO Title</label>
          <input style={field} value={form.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} />
        </div>
        <div>
          <label style={label}>SEO Description</label>
          <input style={field} value={form.seoDescription} onChange={(e) => set("seoDescription", e.target.value)} />
        </div>
      </div>

      <div>
        <label style={label}>Tags</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          {tags.map((t) => {
            const active = form.tagIds.includes(t.id);
            return (
              <button key={t.id} type="button" onClick={() => toggleTag(t.id)} style={{
                padding: "4px 12px", borderRadius: "999px", border: "1px solid", cursor: "pointer", fontSize: "12px",
                borderColor: active ? "hsl(var(--primary))" : "hsl(var(--border) / 0.60)",
                background: active ? "hsl(var(--primary) / 0.10)" : "transparent",
                color: active ? "hsl(var(--primary))" : "hsl(var(--foreground) / 0.50)",
              }}>
                #{t.slug}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: "flex", gap: "0.75rem", paddingTop: "0.5rem" }}>
        <button style={btnPrimary} disabled={saving} onClick={() => submit("published")}>
          {saving ? "Đang lưu..." : "Đăng bài"}
        </button>
        <button style={btnSecondary} disabled={saving} onClick={() => submit("draft")}>
          Lưu nháp
        </button>
        <button style={{ ...btnSecondary, marginLeft: "auto" }} onClick={onCancel}>Huỷ</button>
      </div>
    </div>
  );
}

/* ── New tag form ──────────────────────────────────────────────────── */
function NewTagForm({ adminKey, onCreated }: { adminKey: string; onCreated: (tag: NewsTag) => void }) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  async function save() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const tag = await adminApi.createTag(adminKey, name.trim(), slugify(name.trim()));
      onCreated(tag); setName("");
    } finally { setSaving(false); }
  }
  return (
    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
      <input style={{ ...field, maxWidth: "220px" }} placeholder="Tên tag mới..." value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && save()} />
      <button style={btnSecondary} disabled={saving} onClick={save}>{saving ? "..." : "Thêm tag"}</button>
    </div>
  );
}

/* ── Main Admin page ──────────────────────────────────────────────── */
export default function Admin() {
  const [adminKey, setAdminKey] = useState<string>(() => localStorage.getItem("adminKey") ?? "");
  const [keyInput, setKeyInput] = useState("");
  const [authErr, setAuthErr] = useState(false);

  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [products, setProducts] = useState<NewsProduct[]>([]);
  const [tags, setTags] = useState<NewsTag[]>([]);
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(false);

  const [view, setView] = useState<"list" | "create" | "edit">("list");
  const [editing, setEditing] = useState<(FormState & { id?: number }) | null>(null);

  async function loadData(key: string) {
    setLoading(true);
    try {
      const [meta, postList] = await Promise.all([adminApi.getMeta(key), adminApi.getPosts(key)]);
      setCategories(meta.categories); setProducts(meta.products); setTags(meta.tags);
      setPosts(postList); setAdminKey(key); localStorage.setItem("adminKey", key); setAuthErr(false);
    } catch (e) {
      setAuthErr(true); setAdminKey(""); localStorage.removeItem("adminKey");
    } finally { setLoading(false); }
  }

  useEffect(() => { if (adminKey) loadData(adminKey); }, []);

  if (!adminKey) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", background: "hsl(var(--background))" }}>
        <div style={{ width: "100%", maxWidth: "360px", padding: "2.5rem", border: "1px solid hsl(var(--border) / 0.80)", borderRadius: "14px", boxShadow: "0 4px 28px rgba(10,40,35,0.08)" }}>
          <p style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "hsl(var(--primary))", marginBottom: "0.75rem" }}>Quản trị nội dung</p>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: "1.75rem", color: "hsl(var(--foreground))" }}>Đăng nhập quản trị</h1>
          {authErr && <p style={{ fontSize: "12.5px", color: "rgba(200,50,50,0.85)", marginBottom: "1rem" }}>Khoá không đúng. Thử lại.</p>}
          <label style={label}>Khoá quản trị</label>
          <input type="password" style={{ ...field, marginBottom: "1.25rem" }} value={keyInput} onChange={(e) => setKeyInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && loadData(keyInput)} />
          <button style={{ ...btnPrimary, width: "100%" }} onClick={() => loadData(keyInput)}>Xác nhận</button>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", color: "hsl(var(--foreground) / 0.35)", fontSize: "14px" }}>Đang tải...</div>;
  }

  async function handleSave(data: FormState & { id?: number }) {
    const payload = {
      title: data.title, slug: data.slug, excerpt: data.excerpt || null, content: data.content || null,
      featuredImage: data.featuredImage || null, categoryId: data.categoryId ? Number(data.categoryId) : null,
      productId: data.productId ? Number(data.productId) : null, status: data.status,
      authorName: data.authorName, seoTitle: data.seoTitle || null, seoDescription: data.seoDescription || null,
      tagIds: data.tagIds,
    };
    if (data.id) {
      const updated = await adminApi.updatePost(adminKey, data.id, payload);
      setPosts((ps) => ps.map((p) => p.id === data.id ? updated : p));
    } else {
      const created = await adminApi.createPost(adminKey, payload);
      setPosts((ps) => [created, ...ps]);
    }
    setView("list"); setEditing(null);
  }

  async function handleDelete(id: number) {
    if (!confirm("Xoá bài viết này?")) return;
    await adminApi.deletePost(adminKey, id);
    setPosts((ps) => ps.filter((p) => p.id !== id));
  }

  function startEdit(post: NewsPost) {
    const tagIds = (post.tags ?? []).map((t) => t.id);
    setEditing({
      id: post.id, title: post.title, slug: post.slug, excerpt: post.excerpt ?? "",
      content: post.content ?? "", featuredImage: post.featuredImage ?? "",
      categoryId: post.categoryId ? String(post.categoryId) : "",
      productId: post.productId ? String(post.productId) : "",
      status: post.status, authorName: post.authorName ?? "Phan Văn Thắng",
      seoTitle: post.seoTitle ?? "", seoDescription: post.seoDescription ?? "", tagIds,
    });
    setView("edit");
  }

  return (
    <div style={{ minHeight: "100vh", background: "hsl(var(--background))", padding: "2rem 0 5rem" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 1.5rem" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2.5rem", paddingBottom: "1.5rem", borderBottom: "1px solid hsl(var(--border) / 0.50)" }}>
          <div>
            <p style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "hsl(var(--primary))", marginBottom: "0.25rem" }}>Thắng SWC</p>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "hsl(var(--foreground))", margin: 0 }}>Quản trị Tin tức</h1>
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            {view === "list" && (
              <button style={btnPrimary} onClick={() => { setEditing(null); setView("create"); }}>+ Bài viết mới</button>
            )}
            <button style={btnSecondary} onClick={() => { setAdminKey(""); localStorage.removeItem("adminKey"); }}>Đăng xuất</button>
          </div>
        </div>

        {/* ── Create / Edit form ── */}
        {(view === "create" || view === "edit") && (
          <div>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1.75rem", color: "hsl(var(--foreground))" }}>
              {view === "create" ? "Bài viết mới" : "Chỉnh sửa bài viết"}
            </h2>
            <PostForm
              initial={editing ?? undefined}
              categories={categories} products={products} tags={tags}
              onSave={handleSave}
              onCancel={() => { setView("list"); setEditing(null); }}
            />
          </div>
        )}

        {/* ── Post list ── */}
        {view === "list" && (
          <div>
            {/* Tags management */}
            <div style={{ marginBottom: "2.5rem", padding: "1.25rem 1.5rem", border: "1px solid hsl(var(--border) / 0.60)", borderRadius: "10px" }}>
              <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "hsl(var(--foreground) / 0.35)", marginBottom: "0.875rem" }}>Tags hiện có</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
                {tags.map((t) => (
                  <span key={t.id} style={{ fontSize: "11.5px", padding: "3px 10px", borderRadius: "999px", border: "1px solid hsl(var(--border) / 0.55)", color: "hsl(var(--foreground) / 0.55)" }}>#{t.slug}</span>
                ))}
              </div>
              <NewTagForm adminKey={adminKey} onCreated={(tag) => setTags((ts) => [...ts, tag])} />
            </div>

            {/* Post table */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {posts.length === 0 && (
                <p style={{ textAlign: "center", padding: "3rem 0", color: "hsl(var(--foreground) / 0.35)", fontSize: "14px" }}>Chưa có bài viết nào.</p>
              )}
              {posts.map((post) => (
                <div key={post.id} style={{
                  padding: "1.25rem 1.5rem", border: "1px solid hsl(var(--border) / 0.70)", borderRadius: "10px",
                  display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap",
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.4rem", flexWrap: "wrap" }}>
                      <span style={{
                        fontSize: "9px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "2px 8px", borderRadius: "999px",
                        background: post.status === "published" ? "hsl(var(--primary) / 0.12)" : "hsl(var(--muted))",
                        color: post.status === "published" ? "hsl(var(--primary))" : "hsl(var(--foreground) / 0.45)",
                        border: `1px solid ${post.status === "published" ? "hsl(var(--primary) / 0.25)" : "hsl(var(--border) / 0.50)"}`,
                      }}>
                        {post.status === "published" ? "Đã đăng" : "Nháp"}
                      </span>
                      {post.status === "published" && <span style={{ fontSize: "11px", color: "hsl(var(--foreground) / 0.35)" }}>{fmtDate(post.publishedAt)}</span>}
                    </div>
                    <p style={{ fontSize: "15px", fontWeight: 700, color: "hsl(var(--foreground))", margin: "0 0 0.25rem", lineHeight: 1.3 }}>{post.title}</p>
                    <p style={{ fontSize: "11.5px", color: "hsl(var(--foreground) / 0.40)", margin: 0 }}>/tin-tuc/.../{post.slug}</p>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                    <button style={btnSecondary} onClick={() => startEdit(post)}>Sửa</button>
                    <button style={btnDanger} onClick={() => handleDelete(post.id)}>Xoá</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
