import React, { useEffect, useState, useCallback } from "react";
import { adminApi, type NewsProduct } from "@/lib/newsApi";
import { A, s, fmtDate, slugify } from "./shared";

type ProdTab = "basic" | "page" | "pricing" | "seo";

const TAB_LABELS: { id: ProdTab; label: string }[] = [
  { id: "basic",   label: "Thông tin cơ bản" },
  { id: "page",    label: "Trang sản phẩm" },
  { id: "pricing", label: "Giá & CTA" },
  { id: "seo",     label: "SEO" },
];

function tabBtn(active: boolean): React.CSSProperties {
  return {
    padding: "6px 16px", borderRadius: "6px", border: "none", cursor: "pointer",
    fontSize: "12.5px", fontWeight: active ? 600 : 400,
    background: active ? "#fff" : "transparent",
    color: active ? A.text : A.textMuted,
    boxShadow: active ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
    transition: "all 0.14s ease",
  };
}

/* ── Product editor with tabs ───────────────────────────────────── */
function ProductEditor({
  product,
  adminKey,
  onSaved,
  onClose,
  isNew,
}: {
  product: NewsProduct & { isNew?: boolean };
  adminKey: string;
  onSaved: (p: NewsProduct) => void;
  onClose: () => void;
  isNew: boolean;
}) {
  const [tab, setTab] = useState<ProdTab>("basic");

  /* Basic fields */
  const [basic, setBasic] = useState({ name: product.name, slug: product.slug, description: product.description ?? "" });

  /* Page settings (stored in site_settings as product_{slug}_{field}) */
  const [page, setPage] = useState({ headline: "", sub: "", feature_1: "", feature_2: "", feature_3: "", feature_4: "" });
  const [pricing, setPricing] = useState({ price: "", price_unit: "", cta_text: "", cta_link: "", note: "" });
  const [seo, setSeo] = useState({ seo_title: "", seo_desc: "" });

  const [loadingExtra, setLoadingExtra] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  /* Load extra settings */
  const loadExtra = useCallback(async (slug: string) => {
    if (!slug) return;
    setLoadingExtra(true);
    try {
      const all = await adminApi.getSettings(adminKey);
      const g = (k: string) => all[`product_${slug}_${k}`] ?? "";
      setPage({ headline: g("headline"), sub: g("sub"), feature_1: g("feature_1"), feature_2: g("feature_2"), feature_3: g("feature_3"), feature_4: g("feature_4") });
      setPricing({ price: g("price"), price_unit: g("price_unit"), cta_text: g("cta_text"), cta_link: g("cta_link"), note: g("note") });
      setSeo({ seo_title: g("seo_title"), seo_desc: g("seo_desc") });
    } catch { /* ignore */ }
    finally { setLoadingExtra(false); }
  }, [adminKey]);

  useEffect(() => {
    if (!isNew && product.slug) loadExtra(product.slug);
  }, [isNew, product.slug, loadExtra]);

  const save = async () => {
    if (!basic.name.trim() || !basic.slug.trim()) { setErr("Tên và slug là bắt buộc."); return; }
    setSaving(true); setErr(""); setMsg("");
    try {
      let saved: NewsProduct;
      if (isNew) {
        saved = await adminApi.createProduct(adminKey, { name: basic.name, slug: basic.slug, description: basic.description });
      } else {
        saved = await adminApi.updateProduct(adminKey, product.id, { name: basic.name, slug: basic.slug, description: basic.description });
      }

      /* Save extra fields to settings */
      const slug = saved.slug;
      const extra: Record<string, string> = {};
      Object.entries(page).forEach(([k, v]) => { extra[`product_${slug}_${k}`] = v; });
      Object.entries(pricing).forEach(([k, v]) => { extra[`product_${slug}_${k}`] = v; });
      Object.entries(seo).forEach(([k, v]) => { extra[`product_${slug}_${k}`] = v; });
      await adminApi.updateSettings(adminKey, extra);

      onSaved(saved);
      setMsg("Đã lưu.");
    } catch (e) { setErr(String(e)); }
    finally { setSaving(false); }
  };

  return (
    <div style={s.card}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.125rem" }}>
        <p style={{ fontWeight: 700, fontSize: "14px", margin: 0 }}>{isNew ? "Thêm sản phẩm mới" : `Sửa: ${product.name}`}</p>
        <button style={s.btnGhost} onClick={onClose}>✕</button>
      </div>

      {/* Tab bar */}
      <div style={{ display: "flex", gap: "2px", background: A.bg, padding: "3px", borderRadius: "8px", marginBottom: "1.25rem" }}>
        {TAB_LABELS.map(({ id, label }) => (
          <button key={id} style={tabBtn(tab === id)} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>

      {err && <div style={{ ...s.error, marginBottom: "1rem" }}>{err}</div>}
      {msg && <div style={{ fontSize: "12.5px", color: A.primary, marginBottom: "0.875rem" }}>{msg}</div>}
      {loadingExtra && tab !== "basic" && <p style={{ fontSize: "12.5px", color: A.textMuted, marginBottom: "0.875rem" }}>Đang tải cài đặt...</p>}

      {/* ── Tab: Thông tin cơ bản */}
      {tab === "basic" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
          <div>
            <label style={s.label}>Tên sản phẩm</label>
            <input style={s.field} value={basic.name}
              onChange={(e) => setBasic((f) => ({ ...f, name: e.target.value, slug: isNew ? slugify(e.target.value) : f.slug }))} />
          </div>
          <div>
            <label style={s.label}>Slug (dùng trong URL)</label>
            <input style={s.field} value={basic.slug}
              onChange={(e) => setBasic((f) => ({ ...f, slug: e.target.value }))} />
            <p style={{ fontSize: "11px", color: A.textLight, margin: "3px 0 0" }}>Ví dụ: atlas, road-to-1m</p>
          </div>
          <div>
            <label style={s.label}>Mô tả ngắn (hiển thị trong admin)</label>
            <textarea style={{ ...s.textarea, height: "80px" }} value={basic.description}
              onChange={(e) => setBasic((f) => ({ ...f, description: e.target.value }))}
              placeholder="Mô tả nội bộ về sản phẩm này..." />
          </div>
        </div>
      )}

      {/* ── Tab: Trang sản phẩm */}
      {tab === "page" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
          <div>
            <label style={s.label}>Headline (tiêu đề chính trang)</label>
            <input style={s.field} value={page.headline}
              onChange={(e) => setPage((f) => ({ ...f, headline: e.target.value }))}
              placeholder="Ví dụ: Xây dựng tài sản từ con số 0" />
          </div>
          <div>
            <label style={s.label}>Sub-headline (mô tả ngắn)</label>
            <textarea style={{ ...s.textarea, height: "80px" }} value={page.sub}
              onChange={(e) => setPage((f) => ({ ...f, sub: e.target.value }))}
              placeholder="Mô tả giá trị sản phẩm trong 1–2 câu..." />
          </div>
          <p style={{ fontSize: "11.5px", fontWeight: 600, color: A.textMuted, margin: "0.25rem 0 0", letterSpacing: "0.06em", textTransform: "uppercase" }}>Điểm nổi bật (features)</p>
          {(["feature_1", "feature_2", "feature_3", "feature_4"] as const).map((k, i) => (
            <div key={k}>
              <label style={s.label}>Điểm nổi bật {i + 1}</label>
              <input style={s.field} value={page[k]}
                onChange={(e) => setPage((f) => ({ ...f, [k]: e.target.value }))}
                placeholder={`Ví dụ: Phương pháp đầu tư thực chiến`} />
            </div>
          ))}
        </div>
      )}

      {/* ── Tab: Giá & CTA */}
      {tab === "pricing" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div>
              <label style={s.label}>Giá</label>
              <input style={s.field} value={pricing.price}
                onChange={(e) => setPricing((f) => ({ ...f, price: e.target.value }))}
                placeholder="2.990.000" />
            </div>
            <div>
              <label style={s.label}>Đơn vị / chu kỳ</label>
              <input style={s.field} value={pricing.price_unit}
                onChange={(e) => setPricing((f) => ({ ...f, price_unit: e.target.value }))}
                placeholder="VNĐ · một lần" />
            </div>
          </div>
          <div>
            <label style={s.label}>Ghi chú giá</label>
            <input style={s.field} value={pricing.note}
              onChange={(e) => setPricing((f) => ({ ...f, note: e.target.value }))}
              placeholder="Ví dụ: Bao gồm trọn đời cập nhật nội dung" />
          </div>
          <div>
            <label style={s.label}>Text nút CTA</label>
            <input style={s.field} value={pricing.cta_text}
              onChange={(e) => setPricing((f) => ({ ...f, cta_text: e.target.value }))}
              placeholder="Đăng ký ngay" />
          </div>
          <div>
            <label style={s.label}>Link CTA (URL đăng ký)</label>
            <input style={s.field} value={pricing.cta_link}
              onChange={(e) => setPricing((f) => ({ ...f, cta_link: e.target.value }))}
              placeholder="https://..." />
          </div>
        </div>
      )}

      {/* ── Tab: SEO */}
      {tab === "seo" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
          <div>
            <label style={s.label}>SEO Title</label>
            <input style={s.field} value={seo.seo_title}
              onChange={(e) => setSeo((f) => ({ ...f, seo_title: e.target.value }))}
              placeholder={`${basic.name} — Thắng SWC`} />
            <p style={{ fontSize: "11px", color: A.textLight, margin: "3px 0 0" }}>Khuyến nghị: 50–60 ký tự</p>
          </div>
          <div>
            <label style={s.label}>SEO Description</label>
            <textarea style={{ ...s.textarea, height: "90px" }} value={seo.seo_desc}
              onChange={(e) => setSeo((f) => ({ ...f, seo_desc: e.target.value }))}
              placeholder="Mô tả ngắn hiển thị trên Google..." />
            <p style={{ fontSize: "11px", color: A.textLight, margin: "3px 0 0" }}>Khuyến nghị: 120–160 ký tự</p>
          </div>
        </div>
      )}

      {/* Save */}
      <div style={{ display: "flex", gap: "0.625rem", marginTop: "1.25rem", paddingTop: "1.125rem", borderTop: `1px solid ${A.border}` }}>
        <button style={s.btnPrimary} disabled={saving} onClick={save}>{saving ? "Đang lưu..." : "Lưu tất cả"}</button>
        <button style={s.btnSecondary} onClick={onClose}>Đóng</button>
      </div>
    </div>
  );
}

/* ── Main panel ─────────────────────────────────────────────────── */
export function ProductsPanel({ adminKey }: { adminKey: string }) {
  const [products, setProducts] = useState<NewsProduct[]>([]);
  const [loading, setLoading]   = useState(true);
  const [editing, setEditing]   = useState<(NewsProduct & { isNew?: boolean }) | null>(null);

  useEffect(() => {
    adminApi.getMeta(adminKey).then((m) => setProducts(m.products)).finally(() => setLoading(false));
  }, [adminKey]);

  const openNew = () => {
    setEditing({ id: 0, name: "", slug: "", description: null, createdAt: "", isNew: true });
  };

  const onSaved = (p: NewsProduct) => {
    setProducts((prev) => {
      const exists = prev.find((x) => x.id === p.id);
      return exists ? prev.map((x) => x.id === p.id ? p : x) : [...prev, p];
    });
  };

  const del = async (id: number) => {
    if (!confirm("Xóa sản phẩm này? Các bài viết liên kết sẽ mất liên kết.")) return;
    try { await adminApi.deleteProduct(adminKey, id); setProducts((p) => p.filter((x) => x.id !== id)); if (editing?.id === id) setEditing(null); }
    catch (e) { alert(String(e)); }
  };

  if (loading) return <p style={{ fontSize: "13px", color: A.textMuted }}>Đang tải...</p>;

  return (
    <div style={{ display: "grid", gridTemplateColumns: editing ? "1fr 420px" : "1fr", gap: "1.25rem", alignItems: "start" }}>
      {/* List */}
      <div>
        <div style={s.sectionHeader}>
          <h2 style={s.sectionTitle}>Sản phẩm ({products.length})</h2>
          <button style={s.btnPrimary} onClick={openNew}>+ Thêm sản phẩm</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
          {products.map((p) => (
            <div
              key={p.id}
              style={{
                ...s.card,
                display: "flex", alignItems: "center", gap: "1rem",
                padding: "1rem 1.25rem",
                borderLeft: editing?.id === p.id ? `3px solid ${A.primary}` : `3px solid transparent`,
              }}
            >
              {/* Icon */}
              <div style={{
                width: "40px", height: "40px", borderRadius: "10px",
                background: `linear-gradient(135deg, ${A.primary}20, ${A.primary}08)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <span style={{ fontSize: "18px", color: A.primary }}>◈</span>
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 700, fontSize: "14px", color: A.text, margin: "0 0 2px" }}>{p.name}</p>
                <p style={{ fontSize: "12px", color: A.textMuted, margin: "0 0 4px", fontFamily: "monospace" }}>/{p.slug}</p>
                {p.description && (
                  <p style={{ fontSize: "12px", color: A.textLight, margin: 0 }}>
                    {p.description.slice(0, 80)}{p.description.length > 80 ? "…" : ""}
                  </p>
                )}
              </div>

              {/* Meta */}
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <p style={{ fontSize: "11px", color: A.textLight, margin: "0 0 0.5rem" }}>Tạo: {fmtDate(p.createdAt)}</p>
                <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                  <button style={s.btnSecondary} onClick={() => setEditing(p)}>Chỉnh sửa</button>
                  <button style={s.btnDanger} onClick={() => del(p.id)}>Xóa</button>
                </div>
              </div>
            </div>
          ))}

          {products.length === 0 && (
            <div style={{ ...s.card, textAlign: "center", padding: "3rem", color: A.textLight }}>
              <p style={{ fontSize: "13px" }}>Chưa có sản phẩm nào. Nhấn "+ Thêm sản phẩm" để bắt đầu.</p>
            </div>
          )}
        </div>

        <div style={{ marginTop: "1.25rem", padding: "1rem 1.25rem", background: "rgba(26,120,104,0.05)", border: "1px solid rgba(26,120,104,0.15)", borderRadius: "8px" }}>
          <p style={{ fontSize: "12.5px", color: A.primary, margin: "0 0 0.25rem", fontWeight: 600 }}>Về quản lý sản phẩm</p>
          <p style={{ fontSize: "12px", color: A.textMuted, margin: 0, lineHeight: 1.65 }}>
            Cột slug phải khớp với URL trang sản phẩm. Các thông tin trang (headline, giá, CTA) được lưu riêng trong cài đặt hệ thống và phản ánh lên trang sau khi lưu.
          </p>
        </div>
      </div>

      {/* Editor */}
      {editing && (
        <ProductEditor
          key={editing.id}
          product={editing}
          adminKey={adminKey}
          isNew={!!editing.isNew}
          onSaved={(p) => { onSaved(p); setEditing(p); }}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
