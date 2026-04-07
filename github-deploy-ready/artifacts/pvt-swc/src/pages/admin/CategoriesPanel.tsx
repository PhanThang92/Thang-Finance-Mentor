import React, { useEffect, useState } from "react";
import { adminApi, type NewsCategory } from "@/lib/newsApi";
import { A, s, fmtDate, slugify } from "./shared";

export function CategoriesPanel({ adminKey }: { adminKey: string }) {
  const [cats, setCats]       = useState<NewsCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<NewsCategory | null>(null);
  const [isNew, setIsNew]     = useState(false);
  const [form, setForm]       = useState({ name: "", slug: "", description: "" });
  const [saving, setSaving]   = useState(false);
  const [err, setErr]         = useState("");

  useEffect(() => {
    adminApi.getMeta(adminKey).then((m) => setCats(m.categories)).finally(() => setLoading(false));
  }, [adminKey]);

  const openNew = () => {
    setForm({ name: "", slug: "", description: "" });
    setEditing({ id: 0, name: "", slug: "", description: null, createdAt: "" });
    setIsNew(true); setErr("");
  };

  const openEdit = (c: NewsCategory) => {
    setForm({ name: c.name, slug: c.slug, description: c.description ?? "" });
    setEditing(c); setIsNew(false); setErr("");
  };

  const save = async () => {
    if (!form.name.trim() || !form.slug.trim()) { setErr("Tên và slug là bắt buộc."); return; }
    setSaving(true); setErr("");
    try {
      if (isNew) {
        const created = await adminApi.createCategory(adminKey, form);
        setCats((p) => [...p, created]);
      } else if (editing) {
        const updated = await adminApi.updateCategory(adminKey, editing.id, form);
        setCats((p) => p.map((c) => c.id === updated.id ? updated : c));
      }
      setEditing(null);
    } catch (e) { setErr(String(e)); }
    finally { setSaving(false); }
  };

  const del = async (id: number) => {
    if (!confirm("Xóa chuyên mục này? Các bài viết sẽ mất liên kết.")) return;
    try { await adminApi.deleteCategory(adminKey, id); setCats((p) => p.filter((c) => c.id !== id)); if (editing?.id === id) setEditing(null); }
    catch (e) { alert(String(e)); }
  };

  if (loading) return <p style={{ fontSize: "13px", color: A.textMuted }}>Đang tải...</p>;

  return (
    <div style={{ display: "grid", gridTemplateColumns: editing ? "1fr 340px" : "1fr", gap: "1.25rem", alignItems: "start" }}>
      {/* List */}
      <div>
        <div style={s.sectionHeader}>
          <h2 style={s.sectionTitle}>Chuyên mục ({cats.length})</h2>
          <button style={s.btnPrimary} onClick={openNew}>+ Thêm chuyên mục</button>
        </div>
        <div style={{ ...s.card, padding: 0, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={s.th}>Tên chuyên mục</th>
                <th style={s.th}>Slug</th>
                <th style={s.th}>Mô tả</th>
                <th style={s.th}>Ngày tạo</th>
                <th style={s.th}></th>
              </tr>
            </thead>
            <tbody>
              {cats.map((c) => (
                <tr key={c.id} style={{ background: editing?.id === c.id ? `${A.primary}06` : "transparent" }}>
                  <td style={s.td}><span style={{ fontWeight: 600 }}>{c.name}</span></td>
                  <td style={s.td}><code style={{ fontSize: "12px", color: A.textMuted }}>{c.slug}</code></td>
                  <td style={s.td}><span style={{ fontSize: "12.5px", color: A.textMuted }}>{c.description ? c.description.slice(0, 60) + (c.description.length > 60 ? "…" : "") : "—"}</span></td>
                  <td style={s.td}><span style={{ fontSize: "12px", color: A.textLight }}>{fmtDate(c.createdAt)}</span></td>
                  <td style={s.td}>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button style={s.btnSecondary} onClick={() => openEdit(c)}>Sửa</button>
                      <button style={s.btnDanger} onClick={() => del(c.id)}>Xóa</button>
                    </div>
                  </td>
                </tr>
              ))}
              {cats.length === 0 && (
                <tr><td colSpan={5} style={{ ...s.td, textAlign: "center", color: A.textLight, padding: "2rem" }}>Chưa có chuyên mục nào.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Editor */}
      {editing && (
        <div style={s.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <p style={{ fontWeight: 600, fontSize: "14px", margin: 0 }}>{isNew ? "Thêm chuyên mục mới" : `Sửa: ${editing.name}`}</p>
            <button style={s.btnGhost} onClick={() => setEditing(null)}>✕</button>
          </div>
          {err && <div style={s.error}>{err}</div>}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            <div>
              <label style={s.label}>Tên chuyên mục</label>
              <input style={s.field} value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: isNew ? slugify(e.target.value) : f.slug }))} />
            </div>
            <div>
              <label style={s.label}>Slug</label>
              <input style={s.field} value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} />
              <p style={{ fontSize: "11px", color: A.textLight, margin: "3px 0 0" }}>Dùng trong URL và lọc bài viết</p>
            </div>
            <div>
              <label style={s.label}>Mô tả</label>
              <textarea style={{ ...s.textarea, height: "72px" }} value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Mô tả ngắn về chuyên mục này..." />
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
