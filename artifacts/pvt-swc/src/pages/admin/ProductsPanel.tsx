import React, { useEffect, useState } from "react";
import { adminApi, type NewsProduct } from "@/lib/newsApi";
import { A, s, fmtDate, slugify } from "./shared";

export function ProductsPanel({ adminKey }: { adminKey: string }) {
  const [products, setProducts] = useState<NewsProduct[]>([]);
  const [loading, setLoading]   = useState(true);
  const [editing, setEditing]   = useState<(NewsProduct & { isNew?: boolean }) | null>(null);
  const [saving, setSaving]     = useState(false);
  const [err, setErr]           = useState("");

  const [form, setForm] = useState({ name: "", slug: "", description: "" });

  useEffect(() => {
    adminApi.getMeta(adminKey).then((m) => setProducts(m.products)).finally(() => setLoading(false));
  }, [adminKey]);

  const openNew = () => {
    setForm({ name: "", slug: "", description: "" });
    setEditing({ id: 0, name: "", slug: "", description: null, createdAt: "", isNew: true });
    setErr("");
  };

  const openEdit = (p: NewsProduct) => {
    setForm({ name: p.name, slug: p.slug, description: p.description ?? "" });
    setEditing(p);
    setErr("");
  };

  const save = async () => {
    if (!form.name.trim() || !form.slug.trim()) { setErr("Tên và slug là bắt buộc."); return; }
    setSaving(true); setErr("");
    try {
      if (editing?.isNew) {
        const created = await adminApi.createProduct(adminKey, form);
        setProducts((prev) => [...prev, created]);
      } else if (editing) {
        const updated = await adminApi.updateProduct(adminKey, editing.id, form);
        setProducts((prev) => prev.map((p) => p.id === updated.id ? updated : p));
      }
      setEditing(null);
    } catch (e) { setErr(String(e)); }
    finally { setSaving(false); }
  };

  const del = async (id: number) => {
    if (!confirm("Xóa sản phẩm này? Các bài viết liên kết sẽ mất liên kết.")) return;
    try { await adminApi.deleteProduct(adminKey, id); setProducts((prev) => prev.filter((p) => p.id !== id)); if (editing?.id === id) setEditing(null); }
    catch (e) { alert(String(e)); }
  };

  if (loading) return <p style={{ fontSize: "13px", color: A.textMuted }}>Đang tải...</p>;

  return (
    <div style={{ display: "grid", gridTemplateColumns: editing ? "1fr 360px" : "1fr", gap: "1.25rem", alignItems: "start" }}>
      {/* List */}
      <div>
        <div style={s.sectionHeader}>
          <h2 style={s.sectionTitle}>Sản phẩm ({products.length})</h2>
          <button style={s.btnPrimary} onClick={openNew}>+ Thêm sản phẩm</button>
        </div>

        <div style={{ ...s.card, padding: 0, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr><th style={s.th}>Tên sản phẩm</th><th style={s.th}>Slug</th><th style={s.th}>Mô tả</th><th style={s.th}>Ngày tạo</th><th style={s.th}></th></tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td style={s.td}><span style={{ fontWeight: 600 }}>{p.name}</span></td>
                  <td style={s.td}><code style={{ fontSize: "12px", color: A.textMuted }}>{p.slug}</code></td>
                  <td style={s.td}><span style={{ fontSize: "12.5px", color: A.textMuted }}>{p.description ? p.description.slice(0, 60) + (p.description.length > 60 ? "…" : "") : "—"}</span></td>
                  <td style={s.td}><span style={{ fontSize: "12px", color: A.textLight }}>{fmtDate(p.createdAt)}</span></td>
                  <td style={s.td}>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button style={s.btnSecondary} onClick={() => openEdit(p)}>Sửa</button>
                      <button style={s.btnDanger} onClick={() => del(p.id)}>Xóa</button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr><td colSpan={5} style={{ ...s.td, textAlign: "center", color: A.textLight, padding: "2rem" }}>Chưa có sản phẩm nào.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: "1.25rem", padding: "1rem 1.25rem", background: "rgba(26,120,104,0.05)", border: "1px solid rgba(26,120,104,0.15)", borderRadius: "8px" }}>
          <p style={{ fontSize: "12.5px", color: A.primary, margin: "0 0 0.25rem", fontWeight: 600 }}>Về quản lý sản phẩm</p>
          <p style={{ fontSize: "12px", color: A.textMuted, margin: 0, lineHeight: 1.65 }}>
            Sản phẩm ở đây dùng để phân loại bài viết. Nội dung trang sản phẩm (sections, FAQ, pricing) hiện được quản lý trực tiếp trong code. 
            Cột "Slug" phải khớp với slug trong URL trang sản phẩm tương ứng.
          </p>
        </div>
      </div>

      {/* Form */}
      {editing && (
        <div style={s.card}>
          <p style={{ fontWeight: 600, fontSize: "14px", margin: "0 0 1.25rem" }}>{editing.isNew ? "Thêm sản phẩm mới" : `Sửa: ${editing.name}`}</p>
          {err && <div style={s.error}>{err}</div>}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={s.label}>Tên sản phẩm</label>
              <input style={s.field} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: editing.isNew ? slugify(e.target.value) : f.slug }))} />
            </div>
            <div>
              <label style={s.label}>Slug (dùng trong URL)</label>
              <input style={s.field} value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} />
            </div>
            <div>
              <label style={s.label}>Mô tả ngắn</label>
              <textarea style={{ ...s.textarea, height: "80px" }} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
            <div style={{ display: "flex", gap: "0.625rem" }}>
              <button style={s.btnPrimary} disabled={saving} onClick={save}>{saving ? "Đang lưu..." : "Lưu"}</button>
              <button style={s.btnSecondary} onClick={() => setEditing(null)}>Hủy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
