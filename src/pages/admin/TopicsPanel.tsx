import React, { useEffect, useState, useCallback, useMemo } from "react";
import { adminApi, type Topic } from "@/lib/newsApi";
import { A, s, fmtDate, slugify } from "./shared";

/* ── Toast ─────────────────────────────────────────────────────────────── */
function Toast({ msg, type, onClose }: { msg: string; type: "ok" | "err"; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3200); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 500, background: type === "ok" ? A.primary : A.danger, color: "#fff", borderRadius: "9px", padding: "11px 18px", fontSize: "13px", fontWeight: 500, boxShadow: "0 4px 18px rgba(0,0,0,0.18)" }}>
      {msg}
    </div>
  );
}

/* ── Status chip ─────────────────────────────────────────────────────── */
function StatusChip({ status }: { status: string }) {
  const active = status === "active";
  return (
    <span style={{ display: "inline-block", fontSize: "10px", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", padding: "2px 8px", borderRadius: "5px", background: active ? "rgba(26,120,104,0.10)" : "rgba(0,0,0,0.06)", color: active ? A.primary : A.textMuted }}>
      {active ? "Hoạt động" : "Ẩn"}
    </span>
  );
}

/* ── Form type ─────────────────────────────────────────────────────────── */
type Form = Partial<Topic>;

const EMPTY: Form = {
  title: "", slug: "", description: "", shortDescription: "", iconKey: "",
  featured: false, displayOrder: 0, status: "active",
  seoTitle: "", seoDescription: "",
};

/* ── Main component ────────────────────────────────────────────────────── */
export function TopicsPanel({ adminKey }: { adminKey: string }) {
  const [topics, setTopics]   = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView]       = useState<"list" | "form">("list");
  const [form, setForm]       = useState<Form>(EMPTY);
  const [saving, setSaving]   = useState(false);
  const [err, setErr]         = useState("");
  const [toast, setToast]     = useState<{ msg: string; type: "ok" | "err" } | null>(null);
  const [q, setQ]             = useState("");
  const [fStatus, setFStatus] = useState("all");

  const showToast = useCallback((msg: string, type: "ok" | "err" = "ok") => setToast({ msg, type }), []);

  const reload = useCallback(() => {
    setLoading(true);
    adminApi.getTopics(adminKey).then(setTopics).catch(console.error).finally(() => setLoading(false));
  }, [adminKey]);

  useEffect(() => { reload(); }, [reload]);

  const visible = useMemo(() => topics.filter((t) => {
    if (fStatus !== "all" && t.status !== fStatus) return false;
    if (q.trim()) {
      const lq = q.toLowerCase();
      return t.title.toLowerCase().includes(lq) || t.slug.toLowerCase().includes(lq);
    }
    return true;
  }), [topics, q, fStatus]);

  const newTopic = () => { setForm({ ...EMPTY }); setErr(""); setView("form"); };
  const editTopic = (t: Topic) => { setForm({ ...t }); setErr(""); setView("form"); };

  const deleteTopic = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa chủ đề này?\nHành động này không thể hoàn tác.")) return;
    try {
      await adminApi.deleteTopic(adminKey, id);
      setTopics((prev) => prev.filter((t) => t.id !== id));
      showToast("Đã xóa thành công.");
    } catch (e) { showToast(String(e), "err"); }
  };

  const toggleFeatured = async (t: Topic) => {
    try {
      const updated = await adminApi.updateTopic(adminKey, t.id, { ...t, featured: !t.featured });
      setTopics((prev) => prev.map((x) => x.id === updated.id ? updated : x));
      showToast(!t.featured ? "Đã đặt nổi bật." : "Đã bỏ nổi bật.");
    } catch (e) { showToast(String(e), "err"); }
  };

  const save = async () => {
    if (!form.title?.trim()) { setErr("Vui lòng nhập tên chủ đề."); return; }
    if (!form.slug?.trim())  { setErr("Vui lòng nhập đường dẫn tĩnh."); return; }
    setSaving(true); setErr("");
    try {
      if (form.id) {
        const updated = await adminApi.updateTopic(adminKey, form.id, form);
        setTopics((prev) => prev.map((t) => t.id === updated.id ? updated : t));
        showToast("Đã cập nhật chủ đề.");
      } else {
        const created = await adminApi.createTopic(adminKey, form);
        setTopics((prev) => [created, ...prev]);
        showToast("Đã tạo chủ đề mới.");
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
            <h2 style={{ ...s.sectionTitle, margin: "0 0 2px" }}>Quản lý chủ đề</h2>
            <p style={{ fontSize: "12.5px", color: A.textMuted, margin: 0 }}>Tạo và quản lý các chủ đề nội dung</p>
          </div>
          <button style={s.btnPrimary} onClick={newTopic}>+ Tạo chủ đề mới</button>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.625rem", padding: "0.875rem 1rem", marginBottom: "1rem", background: "#fff", border: `1px solid ${A.border}`, borderRadius: "9px", alignItems: "center" }}>
          <div style={{ position: "relative", flex: "1 1 200px", minWidth: "180px" }}>
            <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: A.textLight, pointerEvents: "none" }}>⌕</span>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm kiếm chủ đề..." style={{ ...s.field, paddingLeft: "28px", height: "34px" }} />
          </div>
          <select value={fStatus} onChange={(e) => setFStatus(e.target.value)} style={{ ...s.select, height: "34px", minWidth: "140px" }}>
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="hidden">Ẩn</option>
          </select>
          <span style={{ fontSize: "12px", color: A.textLight, marginLeft: "auto" }}>{visible.length} / {topics.length} chủ đề</span>
        </div>

        {loading ? (
          <p style={{ fontSize: "13px", color: A.textMuted }}>Đang tải...</p>
        ) : topics.length === 0 ? (
          <div style={{ ...s.card, textAlign: "center", padding: "4rem 2rem" }}>
            <p style={{ fontSize: "15px", fontWeight: 700, color: A.text, margin: "0 0 6px" }}>Chưa có chủ đề nào</p>
            <p style={{ fontSize: "13px", color: A.textMuted, margin: "0 0 1.5rem" }}>Tạo chủ đề đầu tiên để phân loại nội dung.</p>
            <button style={s.btnPrimary} onClick={newTopic}>+ Tạo chủ đề đầu tiên</button>
          </div>
        ) : visible.length === 0 ? (
          <div style={{ ...s.card, textAlign: "center", padding: "3rem 2rem" }}>
            <p style={{ fontSize: "14px", fontWeight: 600, color: A.text, margin: "0 0 8px" }}>Không có kết quả phù hợp</p>
            <button style={s.btnSecondary} onClick={() => { setQ(""); setFStatus("all"); }}>Xóa bộ lọc</button>
          </div>
        ) : (
          <div style={{ ...s.card, padding: 0, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "rgba(0,0,0,0.015)" }}>
                  <th style={s.th}>Tên chủ đề</th>
                  <th style={{ ...s.th, width: "160px" }}>Đường dẫn</th>
                  <th style={{ ...s.th, width: "100px" }}>Trạng thái</th>
                  <th style={{ ...s.th, width: "70px", textAlign: "center" }}>Nổi bật</th>
                  <th style={{ ...s.th, width: "70px", textAlign: "center" }}>Thứ tự</th>
                  <th style={{ ...s.th, width: "130px" }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((t, i) => (
                  <tr key={t.id} style={{ background: i % 2 === 0 ? "#fff" : "rgba(0,0,0,0.012)" }}>
                    <td style={s.td}>
                      <p style={{ fontSize: "13px", fontWeight: 600, color: A.text, margin: "0 0 2px" }}>{t.title}</p>
                      {t.shortDescription && <p style={{ fontSize: "11.5px", color: A.textMuted, margin: 0 }}>{t.shortDescription}</p>}
                    </td>
                    <td style={s.td}><span style={{ fontSize: "11.5px", color: A.textLight, fontFamily: "monospace" }}>/{t.slug}</span></td>
                    <td style={s.td}><StatusChip status={t.status} /></td>
                    <td style={{ ...s.td, textAlign: "center" }}>
                      <button onClick={() => toggleFeatured(t)} title={t.featured ? "Bỏ nổi bật" : "Bật nổi bật"}
                        style={{ background: "none", border: "none", cursor: "pointer", fontSize: "15px", lineHeight: 1, color: t.featured ? "#d97706" : A.border }}>★</button>
                    </td>
                    <td style={{ ...s.td, textAlign: "center" }}><span style={{ fontSize: "12px", color: A.textMuted }}>{t.displayOrder}</span></td>
                    <td style={{ ...s.td, whiteSpace: "nowrap" }}>
                      <div style={{ display: "flex", gap: "4px" }}>
                        <button onClick={() => editTopic(t)} style={{ ...s.btnGhost, fontSize: "11.5px", padding: "4px 10px" }}>Sửa</button>
                        <button onClick={() => deleteTopic(t.id)} style={{ ...s.btnGhost, fontSize: "11.5px", padding: "4px 10px", color: A.danger }}>Xóa</button>
                      </div>
                    </td>
                  </tr>
                ))}
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
  return (
    <div style={{ maxWidth: "720px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem", fontSize: "13px", color: A.textMuted }}>
        <button onClick={() => setView("list")} style={{ background: "none", border: "none", cursor: "pointer", color: A.primary, padding: 0, fontSize: "13px" }}>Chủ đề</button>
        <span>›</span>
        <span>{isEdit ? "Chỉnh sửa" : "Tạo mới"}</span>
      </div>

      <div style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h2 style={{ ...s.sectionTitle, margin: 0 }}>{isEdit ? "Chỉnh sửa chủ đề" : "Tạo chủ đề mới"}</h2>
        <div style={{ display: "flex", gap: "0.625rem" }}>
          <button onClick={save} disabled={saving} style={{ ...s.btnPrimary, opacity: saving ? 0.6 : 1 }}>{saving ? "Đang lưu..." : "Lưu chủ đề"}</button>
          <button onClick={() => setView("list")} disabled={saving} style={{ ...s.btnGhost, color: A.textMuted }}>Hủy</button>
        </div>
      </div>

      {err && <div style={s.error}>{err}</div>}

      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

        {/* Thông tin chính */}
        <div style={s.card}>
          <h3 style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: A.textMuted, margin: "0 0 1rem" }}>Thông tin chính</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            <div>
              <label style={s.label}>Tên chủ đề *</label>
              <input value={form.title ?? ""} onChange={(e) => {
                const title = e.target.value;
                setForm((f) => ({ ...f, title, slug: f.id ? f.slug : slugify(title) }));
              }} placeholder="Tên chủ đề..." style={s.field} />
            </div>
            <div>
              <label style={s.label}>Đường dẫn tĩnh *</label>
              <div style={{ display: "flex", gap: "8px" }}>
                <input value={form.slug ?? ""} onChange={(e) => setField("slug", slugify(e.target.value))} placeholder="ten-chu-de" style={{ ...s.field, fontFamily: "monospace", fontSize: "12.5px", flex: 1 }} />
                <button type="button" onClick={() => setField("slug", slugify(form.title ?? ""))} style={{ ...s.btnSecondary, padding: "7px 12px", fontSize: "11.5px", whiteSpace: "nowrap" }}>Tự tạo</button>
              </div>
            </div>
            <div>
              <label style={s.label}>Mô tả ngắn</label>
              <input value={form.shortDescription ?? ""} onChange={(e) => setField("shortDescription", e.target.value)} placeholder="Mô tả ngắn gọn..." style={s.field} />
            </div>
            <div>
              <label style={s.label}>Mô tả</label>
              <textarea value={form.description ?? ""} onChange={(e) => setField("description", e.target.value)} rows={4} placeholder="Mô tả chi tiết về chủ đề này..." style={s.textarea} />
            </div>
            <div>
              <label style={s.label}>Biểu tượng / khóa hình ảnh</label>
              <input value={form.iconKey ?? ""} onChange={(e) => setField("iconKey", e.target.value)} placeholder="vd: icon-money, finance-icon..." style={s.field} />
            </div>
          </div>
        </div>

        {/* Hiển thị */}
        <div style={s.card}>
          <h3 style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: A.textMuted, margin: "0 0 1rem" }}>Hiển thị</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem" }}>
            <div>
              <label style={s.label}>Trạng thái</label>
              <select value={form.status ?? "active"} onChange={(e) => setField("status", e.target.value)} style={s.select}>
                <option value="active">Hoạt động</option>
                <option value="hidden">Ẩn</option>
              </select>
            </div>
            <div>
              <label style={s.label}>Thứ tự hiển thị</label>
              <input type="number" value={form.displayOrder ?? 0} onChange={(e) => setField("displayOrder", Number(e.target.value))} min={0} style={s.field} />
            </div>
          </div>
          <div style={{ marginTop: "0.875rem" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", userSelect: "none" }}>
              <input type="checkbox" checked={form.featured ?? false} onChange={(e) => setField("featured", e.target.checked)} style={{ width: "15px", height: "15px", cursor: "pointer" }} />
              <span style={{ fontSize: "13px", color: A.text, fontWeight: 500 }}>Chủ đề nổi bật</span>
            </label>
          </div>
        </div>

        {/* SEO */}
        <div style={s.card}>
          <h3 style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: A.textMuted, margin: "0 0 1rem" }}>SEO</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            <div>
              <label style={s.label}>Tiêu đề SEO</label>
              <input value={form.seoTitle ?? ""} onChange={(e) => setField("seoTitle", e.target.value)} placeholder={form.title || ""} style={s.field} maxLength={70} />
            </div>
            <div>
              <label style={s.label}>Mô tả SEO</label>
              <textarea value={form.seoDescription ?? ""} onChange={(e) => setField("seoDescription", e.target.value)} rows={3} placeholder={form.description || ""} style={s.textarea} maxLength={160} />
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", paddingBottom: "2rem" }}>
          <button onClick={save} disabled={saving} style={{ ...s.btnPrimary, opacity: saving ? 0.6 : 1 }}>{saving ? "Đang lưu..." : "Lưu chủ đề"}</button>
          <button onClick={() => setView("list")} disabled={saving} style={{ ...s.btnGhost, color: A.textMuted }}>Hủy</button>
        </div>
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
