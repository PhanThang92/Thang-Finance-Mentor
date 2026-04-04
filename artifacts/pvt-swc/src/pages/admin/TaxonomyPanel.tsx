import React, { useEffect, useState } from "react";
import { adminApi, type NewsCategory, type NewsTag } from "@/lib/newsApi";
import { A, s, fmtDate, slugify } from "./shared";

export function TaxonomyPanel({ adminKey }: { adminKey: string }) {
  const [cats, setCats]   = useState<NewsCategory[]>([]);
  const [tags, setTags]   = useState<NewsTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]     = useState<"categories" | "tags">("categories");

  // Category form
  const [catForm, setCatForm] = useState({ id: 0, name: "", slug: "", description: "" });
  const [catEditing, setCatEditing] = useState(false);
  const [catSaving, setCatSaving] = useState(false);
  const [catErr, setCatErr] = useState("");

  // Tag form
  const [tagForm, setTagForm] = useState({ id: 0, name: "", slug: "" });
  const [tagEditing, setTagEditing] = useState(false);
  const [tagSaving, setTagSaving] = useState(false);
  const [tagErr, setTagErr] = useState("");

  useEffect(() => {
    adminApi.getMeta(adminKey).then((m) => { setCats(m.categories); setTags(m.tags); }).finally(() => setLoading(false));
  }, [adminKey]);

  /* ── Categories ── */
  const newCat = () => { setCatForm({ id: 0, name: "", slug: "", description: "" }); setCatEditing(true); setCatErr(""); };
  const editCat = (c: NewsCategory) => { setCatForm({ id: c.id, name: c.name, slug: c.slug, description: c.description ?? "" }); setCatEditing(true); setCatErr(""); };
  const saveCat = async () => {
    setCatSaving(true); setCatErr("");
    try {
      if (catForm.id) {
        const updated = await adminApi.updateCategory(adminKey, catForm.id, catForm);
        setCats((prev) => prev.map((c) => c.id === updated.id ? updated : c));
      } else {
        const created = await adminApi.createCategory(adminKey, catForm);
        setCats((prev) => [...prev, created]);
      }
      setCatEditing(false);
    } catch (e) { setCatErr(String(e)); }
    finally { setCatSaving(false); }
  };
  const deleteCat = async (id: number) => {
    if (!confirm("Xóa chuyên mục này? Các bài viết sẽ mất liên kết.")) return;
    try { await adminApi.deleteCategory(adminKey, id); setCats((prev) => prev.filter((c) => c.id !== id)); }
    catch (e) { alert(String(e)); }
  };

  /* ── Tags ── */
  const newTag = () => { setTagForm({ id: 0, name: "", slug: "" }); setTagEditing(true); setTagErr(""); };
  const editTag = (t: NewsTag) => { setTagForm({ id: t.id, name: t.name, slug: t.slug }); setTagEditing(true); setTagErr(""); };
  const saveTag = async () => {
    setTagSaving(true); setTagErr("");
    try {
      if (tagForm.id) {
        const updated = await adminApi.updateTag(adminKey, tagForm.id, tagForm.name, tagForm.slug);
        setTags((prev) => prev.map((t) => t.id === updated.id ? updated : t));
      } else {
        const created = await adminApi.createTag(adminKey, tagForm.name, tagForm.slug);
        setTags((prev) => [...prev, created]);
      }
      setTagEditing(false);
    } catch (e) { setTagErr(String(e)); }
    finally { setTagSaving(false); }
  };
  const deleteTag = async (id: number) => {
    if (!confirm("Xóa tag này?")) return;
    try { await adminApi.deleteTag(adminKey, id); setTags((prev) => prev.filter((t) => t.id !== id)); }
    catch (e) { alert(String(e)); }
  };

  if (loading) return <p style={{ fontSize: "13px", color: A.textMuted }}>Đang tải...</p>;

  const tabBtn = (active: boolean): React.CSSProperties => ({
    padding: "6px 18px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 500,
    background: active ? A.primary : "transparent", color: active ? "#fff" : A.textMuted, transition: "all 0.16s",
  });

  return (
    <div>
      <div style={{ ...s.sectionHeader, marginBottom: "1.5rem" }}>
        <h2 style={s.sectionTitle}>Chuyên mục & Tags</h2>
        <div style={{ display: "flex", gap: "4px", background: "rgba(0,0,0,0.05)", padding: "3px", borderRadius: "8px" }}>
          <button style={tabBtn(tab === "categories")} onClick={() => setTab("categories")}>Chuyên mục ({cats.length})</button>
          <button style={tabBtn(tab === "tags")} onClick={() => setTab("tags")}>Tags ({tags.length})</button>
        </div>
      </div>

      {/* ── CATEGORIES ── */}
      {tab === "categories" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "1.25rem", alignItems: "start" }}>
          <div style={{ ...s.card, padding: 0, overflow: "hidden" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 1.25rem", borderBottom: `1px solid ${A.border}` }}>
              <p style={{ fontWeight: 600, fontSize: "13.5px", margin: 0 }}>Danh sách chuyên mục</p>
              <button style={s.btnPrimary} onClick={newCat}>+ Thêm mới</button>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr><th style={s.th}>Tên</th><th style={s.th}>Slug</th><th style={s.th}>Ngày tạo</th><th style={s.th}></th></tr></thead>
              <tbody>
                {cats.map((c) => (
                  <tr key={c.id}>
                    <td style={s.td}><span style={{ fontWeight: 500 }}>{c.name}</span></td>
                    <td style={s.td}><code style={{ fontSize: "12px", color: A.textMuted }}>{c.slug}</code></td>
                    <td style={s.td}><span style={{ fontSize: "12px", color: A.textLight }}>{fmtDate(c.createdAt)}</span></td>
                    <td style={s.td}>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button style={s.btnSecondary} onClick={() => editCat(c)}>Sửa</button>
                        <button style={s.btnDanger} onClick={() => deleteCat(c.id)}>Xóa</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {catEditing && (
            <div style={s.card}>
              <p style={{ fontWeight: 600, fontSize: "13.5px", margin: "0 0 1rem" }}>{catForm.id ? "Sửa chuyên mục" : "Thêm chuyên mục mới"}</p>
              {catErr && <div style={s.error}>{catErr}</div>}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                <div>
                  <label style={s.label}>Tên chuyên mục</label>
                  <input style={s.field} value={catForm.name} onChange={(e) => setCatForm((f) => ({ ...f, name: e.target.value, slug: f.id ? f.slug : slugify(e.target.value) }))} />
                </div>
                <div>
                  <label style={s.label}>Slug</label>
                  <input style={s.field} value={catForm.slug} onChange={(e) => setCatForm((f) => ({ ...f, slug: e.target.value }))} />
                </div>
                <div>
                  <label style={s.label}>Mô tả</label>
                  <input style={s.field} value={catForm.description} onChange={(e) => setCatForm((f) => ({ ...f, description: e.target.value }))} />
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button style={s.btnPrimary} disabled={catSaving} onClick={saveCat}>{catSaving ? "Đang lưu..." : "Lưu"}</button>
                  <button style={s.btnSecondary} onClick={() => setCatEditing(false)}>Hủy</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAGS ── */}
      {tab === "tags" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "1.25rem", alignItems: "start" }}>
          <div style={{ ...s.card, padding: 0, overflow: "hidden" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 1.25rem", borderBottom: `1px solid ${A.border}` }}>
              <p style={{ fontWeight: 600, fontSize: "13.5px", margin: 0 }}>Danh sách tags</p>
              <button style={s.btnPrimary} onClick={newTag}>+ Thêm mới</button>
            </div>
            <div style={{ padding: "1rem", display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {tags.map((t) => (
                <div key={t.id} style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "5px 12px", borderRadius: "999px", border: `1px solid ${A.border}`, background: "rgba(0,0,0,0.03)" }}>
                  <span style={{ fontSize: "12.5px", fontWeight: 500 }}>#{t.slug}</span>
                  <button style={{ background: "none", border: "none", cursor: "pointer", padding: "0 2px", color: A.textMuted, fontSize: "12px", lineHeight: 1 }} onClick={() => editTag(t)}>✎</button>
                  <button style={{ background: "none", border: "none", cursor: "pointer", padding: "0 2px", color: A.danger, fontSize: "12px", lineHeight: 1 }} onClick={() => deleteTag(t.id)}>✕</button>
                </div>
              ))}
              {tags.length === 0 && <p style={{ fontSize: "13px", color: A.textLight }}>Chưa có tag nào.</p>}
            </div>
          </div>

          {tagEditing && (
            <div style={s.card}>
              <p style={{ fontWeight: 600, fontSize: "13.5px", margin: "0 0 1rem" }}>{tagForm.id ? "Sửa tag" : "Thêm tag mới"}</p>
              {tagErr && <div style={s.error}>{tagErr}</div>}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                <div>
                  <label style={s.label}>Tên tag</label>
                  <input style={s.field} value={tagForm.name} onChange={(e) => setTagForm((f) => ({ ...f, name: e.target.value, slug: f.id ? f.slug : slugify(e.target.value) }))} />
                </div>
                <div>
                  <label style={s.label}>Slug</label>
                  <input style={s.field} value={tagForm.slug} onChange={(e) => setTagForm((f) => ({ ...f, slug: e.target.value }))} />
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button style={s.btnPrimary} disabled={tagSaving} onClick={saveTag}>{tagSaving ? "Đang lưu..." : "Lưu"}</button>
                  <button style={s.btnSecondary} onClick={() => setTagEditing(false)}>Hủy</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
