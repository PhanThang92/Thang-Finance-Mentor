import React, { useEffect, useState } from "react";
import { adminApi, type NewsTag } from "@/lib/newsApi";
import { A, s, slugify } from "./shared";

export function TagsPanel({ adminKey }: { adminKey: string }) {
  const [tags, setTags]       = useState<NewsTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<NewsTag | null>(null);
  const [isNew, setIsNew]     = useState(false);
  const [form, setForm]       = useState({ name: "", slug: "" });
  const [saving, setSaving]   = useState(false);
  const [err, setErr]         = useState("");
  const [q, setQ]             = useState("");

  useEffect(() => {
    adminApi.getMeta(adminKey).then((m) => setTags(m.tags)).finally(() => setLoading(false));
  }, [adminKey]);

  const filtered = q.trim() ? tags.filter((t) => t.name.toLowerCase().includes(q.toLowerCase()) || t.slug.includes(q.toLowerCase())) : tags;

  const openNew = () => {
    setForm({ name: "", slug: "" });
    setEditing({ id: 0, name: "", slug: "", createdAt: "" });
    setIsNew(true); setErr("");
  };

  const openEdit = (t: NewsTag) => {
    setForm({ name: t.name, slug: t.slug });
    setEditing(t); setIsNew(false); setErr("");
  };

  const save = async () => {
    if (!form.name.trim() || !form.slug.trim()) { setErr("Tên và slug là bắt buộc."); return; }
    setSaving(true); setErr("");
    try {
      if (isNew) {
        const created = await adminApi.createTag(adminKey, form.name, form.slug);
        setTags((p) => [...p, created]);
      } else if (editing) {
        const updated = await adminApi.updateTag(adminKey, editing.id, form.name, form.slug);
        setTags((p) => p.map((t) => t.id === updated.id ? updated : t));
      }
      setEditing(null);
    } catch (e) { setErr(String(e)); }
    finally { setSaving(false); }
  };

  const del = async (id: number) => {
    if (!confirm("Xóa tag này? Tag sẽ bị gỡ khỏi tất cả bài viết liên quan.")) return;
    try { await adminApi.deleteTag(adminKey, id); setTags((p) => p.filter((t) => t.id !== id)); if (editing?.id === id) setEditing(null); }
    catch (e) { alert(String(e)); }
  };

  if (loading) return <p style={{ fontSize: "13px", color: A.textMuted }}>Đang tải...</p>;

  return (
    <div style={{ display: "grid", gridTemplateColumns: editing ? "1fr 300px" : "1fr", gap: "1.25rem", alignItems: "start" }}>
      {/* List */}
      <div>
        <div style={s.sectionHeader}>
          <h2 style={s.sectionTitle}>Tags ({tags.length})</h2>
          <div style={{ display: "flex", gap: "0.625rem" }}>
            <input
              placeholder="Tìm tag..."
              value={q} onChange={(e) => setQ(e.target.value)}
              style={{ ...s.field, width: "180px", height: "33px" }}
            />
            <button style={s.btnPrimary} onClick={openNew}>+ Thêm tag</button>
          </div>
        </div>

        {/* Tag chips */}
        <div style={{ ...s.card, minHeight: "120px" }}>
          {filtered.length === 0 ? (
            <p style={{ fontSize: "13px", color: A.textLight }}>
              {q ? "Không tìm thấy tag phù hợp." : "Chưa có tag nào."}
            </p>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {filtered.map((t) => (
                <div
                  key={t.id}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "6px",
                    padding: "5px 12px", borderRadius: "999px",
                    border: `1px solid ${editing?.id === t.id ? A.primary + "60" : A.border}`,
                    background: editing?.id === t.id ? `${A.primary}08` : "rgba(0,0,0,0.02)",
                    transition: "all 0.12s ease",
                  }}
                >
                  <span style={{ fontSize: "12.5px", fontWeight: 500, color: A.text }}>#{t.slug}</span>
                  <span style={{ fontSize: "11px", color: A.textLight }}>({t.name})</span>
                  <button
                    title="Sửa"
                    style={{ background: "none", border: "none", cursor: "pointer", padding: "0 2px", color: A.textMuted, fontSize: "12px", lineHeight: 1 }}
                    onClick={() => openEdit(t)}
                  >
                    ✎
                  </button>
                  <button
                    title="Xóa"
                    style={{ background: "none", border: "none", cursor: "pointer", padding: "0 2px", color: A.danger, fontSize: "12px", lineHeight: 1 }}
                    onClick={() => del(t.id)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <p style={{ fontSize: "11.5px", color: A.textLight, marginTop: "0.625rem" }}>
          Slug tag phải là duy nhất và chỉ dùng ký tự thường, không dấu, ngăn cách bởi dấu gạch ngang.
        </p>
      </div>

      {/* Editor */}
      {editing && (
        <div style={s.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <p style={{ fontWeight: 600, fontSize: "14px", margin: 0 }}>{isNew ? "Thêm tag mới" : `Sửa: #${editing.slug}`}</p>
            <button style={s.btnGhost} onClick={() => setEditing(null)}>✕</button>
          </div>
          {err && <div style={s.error}>{err}</div>}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            <div>
              <label style={s.label}>Tên hiển thị</label>
              <input style={s.field} value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: isNew ? slugify(e.target.value) : f.slug }))}
                placeholder="Ví dụ: Tư duy tài chính" />
            </div>
            <div>
              <label style={s.label}>Slug (duy nhất)</label>
              <input style={s.field} value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                placeholder="tu-duy-tai-chinh" />
              <p style={{ fontSize: "11px", color: A.textLight, margin: "3px 0 0" }}>Không được trùng với tag khác</p>
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
