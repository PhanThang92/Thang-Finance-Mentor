import React, { useEffect, useState, useCallback } from "react";
import { adminApi, type NewsProduct } from "@/lib/newsApi";
import { A, s, fmtDate, slugify } from "./shared";

/* ── Types ────────────────────────────────────────────────────────── */
type ProdTab = "general" | "hero" | "sections" | "faq" | "pricing" | "cta" | "seo";

interface GeneralForm {
  name: string; slug: string; description: string; status: string; thumbnail: string; sortOrder: string;
}
interface HeroForm {
  label: string; headline: string; subtitle: string; insight: string;
  cta1Text: string; cta1Link: string; cta2Text: string; cta2Link: string;
}
interface Section {
  id: string; key: string; title: string; subtitle: string; content: string; order: number; visible: boolean;
}
interface Faq {
  id: string; question: string; answer: string; order: number; visible: boolean;
}
interface PricingOption {
  id: string; name: string; price: string; supportText: string; badge: string;
  ctaText: string; ctaLink: string; order: number; visible: boolean;
}
interface CtaForm {
  title: string; text: string; btn1Text: string; btn1Link: string; btn2Text: string; btn2Link: string; closing: string;
}
interface SeoForm { seoTitle: string; seoDesc: string; ogImage: string; }

/* ── Helpers ──────────────────────────────────────────────────────── */
const uid = () => Math.random().toString(36).slice(2, 10);

function safeJson<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try { return JSON.parse(raw) as T; } catch { return fallback; }
}

function move<T>(arr: T[], idx: number, dir: -1 | 1): T[] {
  const next = [...arr];
  const target = idx + dir;
  if (target < 0 || target >= next.length) return next;
  [next[idx], next[target]] = [next[target], next[idx]];
  return next.map((item, i) => ({ ...(item as object), order: i + 1 }) as T);
}

const STATUS_OPTIONS = [
  { value: "visible", label: "Hiển thị công khai" },
  { value: "draft",   label: "Nháp" },
  { value: "hidden",  label: "Ẩn" },
];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    visible: { label: "Hiển thị", color: "#16a34a", bg: "#16a34a18" },
    draft:   { label: "Nháp",     color: "#d97706", bg: "#d9770618" },
    hidden:  { label: "Ẩn",       color: "#6b7280", bg: "#6b728018" },
  };
  const m = map[status] ?? map["draft"];
  return (
    <span style={{
      fontSize: "10px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
      padding: "2px 8px", borderRadius: "4px", background: m.bg, color: m.color,
    }}>
      {m.label}
    </span>
  );
}

/* ── Sub-components ───────────────────────────────────────────────── */
function TabBar({ tab, setTab, counts }: {
  tab: ProdTab; setTab: (t: ProdTab) => void;
  counts: Partial<Record<ProdTab, number>>;
}) {
  const TABS: { id: ProdTab; label: string }[] = [
    { id: "general",  label: "Thông tin chung" },
    { id: "hero",     label: "Hero" },
    { id: "sections", label: "Sections" },
    { id: "faq",      label: "FAQ" },
    { id: "pricing",  label: "Pricing" },
    { id: "cta",      label: "CTA" },
    { id: "seo",      label: "SEO" },
  ];
  return (
    <div style={{ display: "flex", gap: 0, borderBottom: `1px solid ${A.border}`, overflowX: "auto" }}>
      {TABS.map(({ id, label }) => {
        const active = tab === id;
        const c = counts[id];
        return (
          <button key={id} onClick={() => setTab(id)} style={{
            padding: "10px 16px", border: "none", background: "none", cursor: "pointer",
            fontSize: "12.5px", fontWeight: active ? 600 : 400,
            color: active ? A.primary : A.textMuted,
            borderBottom: active ? `2px solid ${A.primary}` : "2px solid transparent",
            transition: "all 0.12s ease", whiteSpace: "nowrap", flexShrink: 0,
          }}>
            {label}
            {c !== undefined && c > 0 && (
              <span style={{
                marginLeft: "5px", fontSize: "10px", padding: "1px 6px", borderRadius: "999px",
                background: active ? `${A.primary}18` : "rgba(0,0,0,0.07)",
                color: active ? A.primary : A.textMuted,
              }}>
                {c}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function Lbl({ children }: { children: React.ReactNode }) {
  return <label style={s.label}>{children}</label>;
}

function Hint({ text, warn }: { text: string; warn?: boolean }) {
  return <p style={{ fontSize: "11px", color: warn ? "#d97706" : A.textLight, margin: "3px 0 0" }}>{text}</p>;
}

/* ── Sections tab ─────────────────────────────────────────────────── */
function SectionsTab({ sections, setSections }: { sections: Section[]; setSections: React.Dispatch<React.SetStateAction<Section[]>> }) {
  const add = () => setSections((p) => [...p, { id: uid(), key: "", title: "", subtitle: "", content: "", order: p.length + 1, visible: true }]);
  const upd = (i: number, patch: Partial<Section>) => setSections((p) => p.map((s, j) => j === i ? { ...s, ...patch } : s));
  const del = (i: number) => setSections((p) => p.filter((_, j) => j !== i).map((s, j) => ({ ...s, order: j + 1 })));

  return (
    <div>
      {sections.length === 0 && (
        <div style={{
          textAlign: "center", padding: "2.5rem", border: `1px dashed ${A.border}`, borderRadius: "10px",
          color: A.textLight, fontSize: "13px", marginBottom: "1rem",
        }}>
          Chưa có section nào. Nhấn "Thêm section" để bắt đầu.
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
        {sections.map((sec, i) => (
          <div key={sec.id} style={{
            ...s.card, padding: "1.25rem",
            borderLeft: sec.visible ? `3px solid ${A.primary}` : `3px solid ${A.border}`,
            opacity: sec.visible ? 1 : 0.6,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.875rem" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: A.textMuted }}>
                Section {i + 1}
              </span>
              <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                <label style={{ fontSize: "11.5px", color: A.textMuted, cursor: "pointer", display: "flex", alignItems: "center", gap: "5px" }}>
                  <input type="checkbox" checked={sec.visible} onChange={(e) => upd(i, { visible: e.target.checked })} style={{ accentColor: A.primary }} />
                  Hiển thị
                </label>
                <button onClick={() => setSections((p) => move(p, i, -1))} style={{ ...s.btnGhost, padding: "3px 8px", fontSize: "14px" }} title="Lên">↑</button>
                <button onClick={() => setSections((p) => move(p, i,  1))} style={{ ...s.btnGhost, padding: "3px 8px", fontSize: "14px" }} title="Xuống">↓</button>
                <button onClick={() => del(i)} style={{ ...s.btnDanger, padding: "4px 9px", fontSize: "11px" }}>Xoá</button>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
              <div>
                <Lbl>Section key</Lbl>
                <input style={s.field} value={sec.key} placeholder="about, benefits..." onChange={(e) => upd(i, { key: e.target.value })} />
              </div>
              <div>
                <Lbl>Tiêu đề</Lbl>
                <input style={s.field} value={sec.title} placeholder="Tiêu đề section..." onChange={(e) => upd(i, { title: e.target.value })} />
              </div>
            </div>
            <div style={{ marginBottom: "0.75rem" }}>
              <Lbl>Phụ đề (subtitle)</Lbl>
              <input style={s.field} value={sec.subtitle} placeholder="Mô tả ngắn..." onChange={(e) => upd(i, { subtitle: e.target.value })} />
            </div>
            <div>
              <Lbl>Nội dung (text hoặc Markdown)</Lbl>
              <textarea style={{ ...s.textarea, height: "100px" }} value={sec.content} placeholder="Nội dung section..." onChange={(e) => upd(i, { content: e.target.value })} />
            </div>
          </div>
        ))}
      </div>
      <button style={{ ...s.btnSecondary, marginTop: "1rem", width: "100%", padding: "10px" }} onClick={add}>
        + Thêm section
      </button>
    </div>
  );
}

/* ── FAQ tab ──────────────────────────────────────────────────────── */
function FaqTab({ faqs, setFaqs }: { faqs: Faq[]; setFaqs: React.Dispatch<React.SetStateAction<Faq[]>> }) {
  const add = () => setFaqs((p) => [...p, { id: uid(), question: "", answer: "", order: p.length + 1, visible: true }]);
  const upd = (i: number, patch: Partial<Faq>) => setFaqs((p) => p.map((f, j) => j === i ? { ...f, ...patch } : f));
  const del = (i: number) => setFaqs((p) => p.filter((_, j) => j !== i).map((f, j) => ({ ...f, order: j + 1 })));

  return (
    <div>
      {faqs.length === 0 && (
        <div style={{ textAlign: "center", padding: "2.5rem", border: `1px dashed ${A.border}`, borderRadius: "10px", color: A.textLight, fontSize: "13px", marginBottom: "1rem" }}>
          Chưa có câu hỏi nào. Nhấn "Thêm câu hỏi" để bắt đầu.
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {faqs.map((f, i) => (
          <div key={f.id} style={{ ...s.card, padding: "1.125rem", opacity: f.visible ? 1 : 0.6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: A.textMuted }}>FAQ {i + 1}</span>
              <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                <label style={{ fontSize: "11.5px", color: A.textMuted, cursor: "pointer", display: "flex", alignItems: "center", gap: "5px" }}>
                  <input type="checkbox" checked={f.visible} onChange={(e) => upd(i, { visible: e.target.checked })} style={{ accentColor: A.primary }} />
                  Hiển thị
                </label>
                <button onClick={() => setFaqs((p) => move(p, i, -1))} style={{ ...s.btnGhost, padding: "3px 8px", fontSize: "14px" }}>↑</button>
                <button onClick={() => setFaqs((p) => move(p, i,  1))} style={{ ...s.btnGhost, padding: "3px 8px", fontSize: "14px" }}>↓</button>
                <button onClick={() => del(i)} style={{ ...s.btnDanger, padding: "4px 9px", fontSize: "11px" }}>Xoá</button>
              </div>
            </div>
            <div style={{ marginBottom: "0.75rem" }}>
              <Lbl>Câu hỏi</Lbl>
              <input style={s.field} value={f.question} placeholder="Câu hỏi thường gặp..." onChange={(e) => upd(i, { question: e.target.value })} />
            </div>
            <div>
              <Lbl>Câu trả lời</Lbl>
              <textarea style={{ ...s.textarea, height: "88px" }} value={f.answer} placeholder="Câu trả lời..." onChange={(e) => upd(i, { answer: e.target.value })} />
            </div>
          </div>
        ))}
      </div>
      <button style={{ ...s.btnSecondary, marginTop: "1rem", width: "100%", padding: "10px" }} onClick={add}>
        + Thêm câu hỏi
      </button>
    </div>
  );
}

/* ── Pricing tab ──────────────────────────────────────────────────── */
function PricingTab({ options, setOptions }: { options: PricingOption[]; setOptions: React.Dispatch<React.SetStateAction<PricingOption[]>> }) {
  const add = () => setOptions((p) => [...p, { id: uid(), name: "", price: "", supportText: "", badge: "", ctaText: "", ctaLink: "", order: p.length + 1, visible: true }]);
  const upd = (i: number, patch: Partial<PricingOption>) => setOptions((p) => p.map((o, j) => j === i ? { ...o, ...patch } : o));
  const del = (i: number) => setOptions((p) => p.filter((_, j) => j !== i).map((o, j) => ({ ...o, order: j + 1 })));

  return (
    <div>
      {options.length === 0 && (
        <div style={{ textAlign: "center", padding: "2.5rem", border: `1px dashed ${A.border}`, borderRadius: "10px", color: A.textLight, fontSize: "13px", marginBottom: "1rem" }}>
          Chưa có gói giá nào. Nhấn "Thêm gói giá" để bắt đầu.
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {options.map((opt, i) => (
          <div key={opt.id} style={{
            ...s.card, padding: "1.25rem",
            borderLeft: opt.visible ? `3px solid ${A.primary}` : `3px solid ${A.border}`,
            opacity: opt.visible ? 1 : 0.6,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.875rem" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: A.textMuted }}>
                Gói {i + 1}{opt.badge ? ` — ${opt.badge}` : ""}
              </span>
              <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                <label style={{ fontSize: "11.5px", color: A.textMuted, cursor: "pointer", display: "flex", alignItems: "center", gap: "5px" }}>
                  <input type="checkbox" checked={opt.visible} onChange={(e) => upd(i, { visible: e.target.checked })} style={{ accentColor: A.primary }} />
                  Hiển thị
                </label>
                <button onClick={() => setOptions((p) => move(p, i, -1))} style={{ ...s.btnGhost, padding: "3px 8px", fontSize: "14px" }}>↑</button>
                <button onClick={() => setOptions((p) => move(p, i,  1))} style={{ ...s.btnGhost, padding: "3px 8px", fontSize: "14px" }}>↓</button>
                <button onClick={() => del(i)} style={{ ...s.btnDanger, padding: "4px 9px", fontSize: "11px" }}>Xoá</button>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
              <div>
                <Lbl>Tên gói</Lbl>
                <input style={s.field} value={opt.name} placeholder="SWC PASS Basic..." onChange={(e) => upd(i, { name: e.target.value })} />
              </div>
              <div>
                <Lbl>Giá</Lbl>
                <input style={s.field} value={opt.price} placeholder="2.990.000 VNĐ" onChange={(e) => upd(i, { price: e.target.value })} />
              </div>
              <div>
                <Lbl>Badge nổi bật</Lbl>
                <input style={s.field} value={opt.badge} placeholder="Phổ biến" onChange={(e) => upd(i, { badge: e.target.value })} />
              </div>
            </div>
            <div style={{ marginBottom: "0.75rem" }}>
              <Lbl>Mô tả hỗ trợ</Lbl>
              <input style={s.field} value={opt.supportText} placeholder="Bao gồm trọn đời cập nhật nội dung..." onChange={(e) => upd(i, { supportText: e.target.value })} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <div>
                <Lbl>Text nút CTA</Lbl>
                <input style={s.field} value={opt.ctaText} placeholder="Đăng ký ngay" onChange={(e) => upd(i, { ctaText: e.target.value })} />
              </div>
              <div>
                <Lbl>Link CTA</Lbl>
                <input style={s.field} value={opt.ctaLink} placeholder="https://..." onChange={(e) => upd(i, { ctaLink: e.target.value })} />
              </div>
            </div>
          </div>
        ))}
      </div>
      <button style={{ ...s.btnSecondary, marginTop: "1rem", width: "100%", padding: "10px" }} onClick={add}>
        + Thêm gói giá
      </button>
    </div>
  );
}

/* ── Product editor ───────────────────────────────────────────────── */
function ProductEditor({
  product, adminKey, isNew, settings, onSaved, onBack,
}: {
  product: NewsProduct; adminKey: string; isNew: boolean;
  settings: Record<string, string | null>;
  onSaved: (p: NewsProduct, newSettings: Record<string, string>) => void;
  onBack: () => void;
}) {
  const [tab, setTab] = useState<ProdTab>("general");
  const [saving, setSaving] = useState(false);
  const [err, setErr]     = useState("");
  const [msg, setMsg]     = useState("");

  const g = useCallback((k: string) => settings[`product_${product.slug}_${k}`] ?? "", [settings, product.slug]);

  /* State per tab */
  const [general, setGeneral] = useState<GeneralForm>({
    name: product.name, slug: product.slug, description: product.description ?? "",
    status: g("status") || "visible", thumbnail: g("thumbnail"), sortOrder: g("sort_order"),
  });

  const [hero, setHero] = useState<HeroForm>({
    label:    g("hero_label")    || g("label")    || "",
    headline: g("hero_headline") || g("headline") || "",
    subtitle: g("hero_subtitle") || g("sub")      || "",
    insight:  g("hero_insight")  || "",
    cta1Text: g("hero_cta1_text") || g("cta_text") || "",
    cta1Link: g("hero_cta1_link") || g("cta_link") || "",
    cta2Text: g("hero_cta2_text") || "",
    cta2Link: g("hero_cta2_link") || "",
  });

  const [sections, setSections] = useState<Section[]>(
    safeJson<Section[]>(g("sections"), []).map((s, i) => ({ ...s, id: s.id || uid(), order: i + 1 }))
  );

  const [faqs, setFaqs] = useState<Faq[]>(
    safeJson<Faq[]>(g("faqs"), []).map((f, i) => ({ ...f, id: f.id || uid(), order: i + 1 }))
  );

  /* Migrate old pricing keys if needed */
  const rawPricing = g("pricing_v2");
  const [pricingOptions, setPricingOptions] = useState<PricingOption[]>(() => {
    if (rawPricing) return safeJson<PricingOption[]>(rawPricing, []).map((o, i) => ({ ...o, id: o.id || uid(), order: i + 1 }));
    const oldPrice = g("price");
    if (oldPrice) {
      return [{
        id: uid(), name: "Gói mặc định", price: oldPrice,
        supportText: g("note"), badge: "", ctaText: g("cta_text"), ctaLink: g("cta_link"), order: 1, visible: true,
      }];
    }
    return [];
  });

  const [cta, setCta] = useState<CtaForm>({
    title:    g("cta_title"),    text:      g("cta_text_full") || "",
    btn1Text: g("cta_btn1_text") || g("cta_text") || "", btn1Link: g("cta_btn1_link") || g("cta_link") || "",
    btn2Text: g("cta_btn2_text"), btn2Link: g("cta_btn2_link"),
    closing:  g("cta_closing"),
  });

  const [seo, setSeo] = useState<SeoForm>({
    seoTitle: g("seo_title"), seoDesc: g("seo_desc"), ogImage: g("seo_og_image"),
  });

  const counts: Partial<Record<ProdTab, number>> = {
    sections: sections.length,
    faq:      faqs.length,
    pricing:  pricingOptions.length,
  };

  const save = async () => {
    if (!general.name.trim() || !general.slug.trim()) { setErr("Tên và slug là bắt buộc."); return; }
    setSaving(true); setErr(""); setMsg("");
    try {
      let saved: NewsProduct;
      if (isNew) {
        saved = await adminApi.createProduct(adminKey, { name: general.name, slug: general.slug, description: general.description });
      } else {
        saved = await adminApi.updateProduct(adminKey, product.id, { name: general.name, slug: general.slug, description: general.description });
      }

      const sl = saved.slug;
      const extra: Record<string, string> = {
        [`product_${sl}_status`]:        general.status,
        [`product_${sl}_thumbnail`]:     general.thumbnail,
        [`product_${sl}_sort_order`]:    general.sortOrder,
        [`product_${sl}_hero_label`]:    hero.label,
        [`product_${sl}_hero_headline`]: hero.headline,
        [`product_${sl}_hero_subtitle`]: hero.subtitle,
        [`product_${sl}_hero_insight`]:  hero.insight,
        [`product_${sl}_hero_cta1_text`]: hero.cta1Text,
        [`product_${sl}_hero_cta1_link`]: hero.cta1Link,
        [`product_${sl}_hero_cta2_text`]: hero.cta2Text,
        [`product_${sl}_hero_cta2_link`]: hero.cta2Link,
        [`product_${sl}_sections`]:      JSON.stringify(sections),
        [`product_${sl}_faqs`]:          JSON.stringify(faqs),
        [`product_${sl}_pricing_v2`]:    JSON.stringify(pricingOptions),
        [`product_${sl}_cta_title`]:     cta.title,
        [`product_${sl}_cta_text_full`]: cta.text,
        [`product_${sl}_cta_btn1_text`]: cta.btn1Text,
        [`product_${sl}_cta_btn1_link`]: cta.btn1Link,
        [`product_${sl}_cta_btn2_text`]: cta.btn2Text,
        [`product_${sl}_cta_btn2_link`]: cta.btn2Link,
        [`product_${sl}_cta_closing`]:   cta.closing,
        [`product_${sl}_seo_title`]:     seo.seoTitle,
        [`product_${sl}_seo_desc`]:      seo.seoDesc,
        [`product_${sl}_seo_og_image`]:  seo.ogImage,
      };
      await adminApi.updateSettings(adminKey, extra);
      onSaved(saved, extra);
      setMsg("Đã lưu tất cả.");
    } catch (e) { setErr(String(e)); }
    finally { setSaving(false); }
  };

  return (
    <div>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
        <button onClick={onBack} style={{ fontSize: "12.5px", color: A.textMuted, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
          Sản phẩm
        </button>
        <span style={{ fontSize: "12px", color: A.textLight }}>/</span>
        <span style={{ fontSize: "12.5px", color: A.text, fontWeight: 500 }}>
          {isNew ? "Tạo mới" : general.name || product.name}
        </span>
      </div>

      {/* Header */}
      <div style={s.sectionHeader}>
        <h2 style={{ ...s.sectionTitle, margin: 0 }}>
          {isNew ? "Tạo sản phẩm mới" : `Chỉnh sửa: ${product.name}`}
        </h2>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          {err && (
            <span style={{ fontSize: "12px", color: A.danger, padding: "5px 10px", background: "rgba(193,51,51,0.07)", borderRadius: "6px", maxWidth: "260px" }}>
              {err}
            </span>
          )}
          {msg && <span style={{ fontSize: "12.5px", color: A.primary }}>{msg}</span>}
          {!isNew && (
            <a
              href={`/san-pham/${product.slug}`}
              target="_blank"
              rel="noopener"
              style={{
                display: "inline-flex", alignItems: "center", gap: "4px",
                padding: "6px 12px", borderRadius: "6px", border: `1px solid ${A.border}`,
                fontSize: "12.5px", fontWeight: 500, textDecoration: "none", color: A.text,
              }}
            >
              ↗ Xem trang
            </a>
          )}
          <button style={s.btnPrimary} disabled={saving} onClick={save}>
            {saving ? "Đang lưu..." : "Lưu tất cả"}
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ marginBottom: "1.5rem" }}>
        <TabBar tab={tab} setTab={setTab} counts={counts} />
      </div>

      {/* ── Tab: Thông tin chung ── */}
      {tab === "general" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 290px", gap: "1.25rem", alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={s.card}>
              <div style={{ marginBottom: "1rem" }}>
                <Lbl>Tên sản phẩm <span style={{ color: A.danger }}>*</span></Lbl>
                <input
                  style={{ ...s.field, fontSize: "15px", fontWeight: 600 }}
                  value={general.name}
                  placeholder="Tên sản phẩm..."
                  onChange={(e) => setGeneral((f) => ({ ...f, name: e.target.value, slug: isNew ? slugify(e.target.value) : f.slug }))}
                />
              </div>
              <div>
                <Lbl>Slug (URL)</Lbl>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <span style={{
                    fontSize: "12.5px", color: A.textMuted, background: "rgba(0,0,0,0.04)",
                    border: `1px solid ${A.border}`, borderRight: "none",
                    padding: "7px 10px", borderRadius: "6px 0 0 6px", flexShrink: 0,
                  }}>
                    /san-pham/
                  </span>
                  <input style={{ ...s.field, borderRadius: "0 6px 6px 0", flex: 1 }} value={general.slug}
                    placeholder="atlas" onChange={(e) => setGeneral((f) => ({ ...f, slug: e.target.value }))} />
                </div>
                <Hint text="Ví dụ: atlas, road-to-1m — phải khớp với URL trang sản phẩm" />
              </div>
            </div>
            <div style={s.card}>
              <Lbl>Mô tả ngắn</Lbl>
              <textarea style={{ ...s.textarea, height: "90px" }} value={general.description}
                placeholder="Mô tả sản phẩm (hiển thị trong admin và thẻ meta)..."
                onChange={(e) => setGeneral((f) => ({ ...f, description: e.target.value }))} />
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={s.card}>
              <Lbl>Trạng thái hiển thị</Lbl>
              <select style={s.select} value={general.status} onChange={(e) => setGeneral((f) => ({ ...f, status: e.target.value }))}>
                {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div style={s.card}>
              <Lbl>Ảnh đại diện (URL)</Lbl>
              <input style={s.field} value={general.thumbnail} placeholder="https://..." onChange={(e) => setGeneral((f) => ({ ...f, thumbnail: e.target.value }))} />
              {general.thumbnail && (
                <img src={general.thumbnail} alt="thumbnail"
                  style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", borderRadius: "6px", marginTop: "8px", border: `1px solid ${A.border}` }} />
              )}
            </div>
            <div style={s.card}>
              <Lbl>Thứ tự hiển thị</Lbl>
              <input style={s.field} type="number" value={general.sortOrder} placeholder="1, 2, 3..."
                onChange={(e) => setGeneral((f) => ({ ...f, sortOrder: e.target.value }))} />
              <Hint text="Số nhỏ hơn hiển thị trước. Để trống để dùng thứ tự mặc định." />
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Hero ── */}
      {tab === "hero" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={s.card}>
              <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: A.textMuted, margin: "0 0 1rem" }}>Nội dung</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                <div>
                  <Lbl>Label nhỏ phía trên tiêu đề</Lbl>
                  <input style={s.field} value={hero.label} placeholder="Ví dụ: Chương trình học đầu tư" onChange={(e) => setHero((f) => ({ ...f, label: e.target.value }))} />
                </div>
                <div>
                  <Lbl>Headline chính</Lbl>
                  <input style={{ ...s.field, fontSize: "14px", fontWeight: 600 }} value={hero.headline}
                    placeholder="Tiêu đề lớn của trang..." onChange={(e) => setHero((f) => ({ ...f, headline: e.target.value }))} />
                </div>
                <div>
                  <Lbl>Subtitle</Lbl>
                  <textarea style={{ ...s.textarea, height: "80px" }} value={hero.subtitle}
                    placeholder="Mô tả 1–2 câu dưới headline..."
                    onChange={(e) => setHero((f) => ({ ...f, subtitle: e.target.value }))} />
                </div>
                <div>
                  <Lbl>Insight / dòng phụ nhỏ</Lbl>
                  <input style={s.field} value={hero.insight} placeholder="Ví dụ: Phương pháp thực chiến từ người đã làm" onChange={(e) => setHero((f) => ({ ...f, insight: e.target.value }))} />
                </div>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={s.card}>
              <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: A.textMuted, margin: "0 0 1rem" }}>CTA 1 (nút chính)</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div>
                  <Lbl>Text nút</Lbl>
                  <input style={s.field} value={hero.cta1Text} placeholder="Đăng ký ngay" onChange={(e) => setHero((f) => ({ ...f, cta1Text: e.target.value }))} />
                </div>
                <div>
                  <Lbl>Link</Lbl>
                  <input style={s.field} value={hero.cta1Link} placeholder="https://..." onChange={(e) => setHero((f) => ({ ...f, cta1Link: e.target.value }))} />
                </div>
              </div>
            </div>
            <div style={s.card}>
              <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: A.textMuted, margin: "0 0 1rem" }}>CTA 2 (nút phụ)</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div>
                  <Lbl>Text nút</Lbl>
                  <input style={s.field} value={hero.cta2Text} placeholder="Tìm hiểu thêm" onChange={(e) => setHero((f) => ({ ...f, cta2Text: e.target.value }))} />
                </div>
                <div>
                  <Lbl>Link</Lbl>
                  <input style={s.field} value={hero.cta2Link} placeholder="https://... hoặc #section" onChange={(e) => setHero((f) => ({ ...f, cta2Link: e.target.value }))} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Sections ── */}
      {tab === "sections" && <SectionsTab sections={sections} setSections={setSections} />}

      {/* ── Tab: FAQ ── */}
      {tab === "faq" && <FaqTab faqs={faqs} setFaqs={setFaqs} />}

      {/* ── Tab: Pricing ── */}
      {tab === "pricing" && <PricingTab options={pricingOptions} setOptions={setPricingOptions} />}

      {/* ── Tab: CTA ── */}
      {tab === "cta" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={s.card}>
              <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: A.textMuted, margin: "0 0 1rem" }}>Nội dung CTA cuối trang</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                <div>
                  <Lbl>Tiêu đề CTA</Lbl>
                  <input style={{ ...s.field, fontWeight: 600 }} value={cta.title} placeholder="Sẵn sàng bắt đầu?" onChange={(e) => setCta((f) => ({ ...f, title: e.target.value }))} />
                </div>
                <div>
                  <Lbl>Mô tả hỗ trợ</Lbl>
                  <textarea style={{ ...s.textarea, height: "80px" }} value={cta.text}
                    placeholder="Vài câu thúc đẩy hành động..."
                    onChange={(e) => setCta((f) => ({ ...f, text: e.target.value }))} />
                </div>
                <div>
                  <Lbl>Dòng kết / lưu ý nhỏ</Lbl>
                  <input style={s.field} value={cta.closing} placeholder="Ví dụ: Hỗ trợ hoàn tiền trong 7 ngày" onChange={(e) => setCta((f) => ({ ...f, closing: e.target.value }))} />
                </div>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={s.card}>
              <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: A.textMuted, margin: "0 0 1rem" }}>Nút CTA 1 (chính)</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div><Lbl>Text nút</Lbl><input style={s.field} value={cta.btn1Text} placeholder="Đăng ký ngay" onChange={(e) => setCta((f) => ({ ...f, btn1Text: e.target.value }))} /></div>
                <div><Lbl>Link</Lbl><input style={s.field} value={cta.btn1Link} placeholder="https://..." onChange={(e) => setCta((f) => ({ ...f, btn1Link: e.target.value }))} /></div>
              </div>
            </div>
            <div style={s.card}>
              <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: A.textMuted, margin: "0 0 1rem" }}>Nút CTA 2 (phụ)</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div><Lbl>Text nút</Lbl><input style={s.field} value={cta.btn2Text} placeholder="Tìm hiểu thêm" onChange={(e) => setCta((f) => ({ ...f, btn2Text: e.target.value }))} /></div>
                <div><Lbl>Link</Lbl><input style={s.field} value={cta.btn2Link} placeholder="https://..." onChange={(e) => setCta((f) => ({ ...f, btn2Link: e.target.value }))} /></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: SEO ── */}
      {tab === "seo" && (
        <div style={{ maxWidth: "680px" }}>
          <div style={s.card}>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <Lbl>SEO Title</Lbl>
                <input style={s.field} value={seo.seoTitle}
                  placeholder={`${general.name} — Thắng SWC`}
                  onChange={(e) => setSeo((f) => ({ ...f, seoTitle: e.target.value }))} />
                <Hint text={`${seo.seoTitle.length} / 60 · Khuyến nghị dưới 60 ký tự`} warn={seo.seoTitle.length > 60} />
              </div>
              <div>
                <Lbl>SEO Description</Lbl>
                <textarea style={{ ...s.textarea, height: "90px" }} value={seo.seoDesc}
                  placeholder="Mô tả ngắn hiển thị trên Google..."
                  onChange={(e) => setSeo((f) => ({ ...f, seoDesc: e.target.value }))} />
                <Hint text={`${seo.seoDesc.length} / 160 · Khuyến nghị dưới 160 ký tự`} warn={seo.seoDesc.length > 160} />
              </div>
              <div>
                <Lbl>OG Image (URL ảnh chia sẻ mạng xã hội)</Lbl>
                <input style={s.field} value={seo.ogImage} placeholder="https://..." onChange={(e) => setSeo((f) => ({ ...f, ogImage: e.target.value }))} />
                {seo.ogImage && (
                  <img src={seo.ogImage} alt="og"
                    style={{ width: "100%", maxWidth: "400px", aspectRatio: "1200/630", objectFit: "cover", borderRadius: "6px", marginTop: "8px", border: `1px solid ${A.border}` }} />
                )}
                <Hint text="Khuyến nghị: 1200×630 px. Để trống để dùng ảnh mặc định của website." />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Product card for list ────────────────────────────────────────── */
function StatPill({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ textAlign: "center" }}>
      <p style={{ fontSize: "17px", fontWeight: 700, color: value > 0 ? A.text : A.textLight, margin: "0 0 1px", lineHeight: 1 }}>{value}</p>
      <p style={{ fontSize: "10.5px", color: A.textLight, margin: 0 }}>{label}</p>
    </div>
  );
}

/* ── Main panel ─────────────────────────────────────────────────── */
export function ProductsPanel({ adminKey }: { adminKey: string }) {
  const [products, setProducts] = useState<NewsProduct[]>([]);
  const [settings, setSettings] = useState<Record<string, string | null>>({});
  const [loading, setLoading]   = useState(true);
  const [view, setView]         = useState<"list" | "edit">("list");
  const [editProduct, setEditProduct] = useState<NewsProduct | null>(null);
  const [isNew, setIsNew]       = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [meta, allSettings] = await Promise.all([
        adminApi.getMeta(adminKey),
        adminApi.getSettings(adminKey),
      ]);
      setProducts(meta.products);
      setSettings(allSettings);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [adminKey]);

  useEffect(() => { load(); }, [load]);

  const openNew = () => {
    setEditProduct({ id: 0, name: "", slug: "", description: null, createdAt: "" });
    setIsNew(true); setView("edit");
  };
  const openEdit = (p: NewsProduct) => { setEditProduct(p); setIsNew(false); setView("edit"); };

  const onSaved = (p: NewsProduct, newSettings: Record<string, string>) => {
    setProducts((prev) => {
      const exists = prev.find((x) => x.id === p.id);
      return exists ? prev.map((x) => x.id === p.id ? p : x) : [...prev, p];
    });
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const del = async (id: number) => {
    if (!confirm("Xoá sản phẩm này? Các bài viết liên kết sẽ mất liên kết.")) return;
    try { await adminApi.deleteProduct(adminKey, id); setProducts((p) => p.filter((x) => x.id !== id)); }
    catch (e) { alert(String(e)); }
  };

  if (view === "edit" && editProduct) {
    return (
      <ProductEditor
        key={editProduct.id}
        product={editProduct}
        adminKey={adminKey}
        isNew={isNew}
        settings={settings}
        onSaved={(p, ns) => { onSaved(p, ns); setEditProduct(p); setIsNew(false); }}
        onBack={() => { setView("list"); load(); }}
      />
    );
  }

  if (loading) return <p style={{ fontSize: "13px", color: A.textMuted }}>Đang tải...</p>;

  return (
    <div>
      {/* Header */}
      <div style={{ ...s.sectionHeader, marginBottom: "1.25rem" }}>
        <div>
          <h2 style={{ ...s.sectionTitle, margin: "0 0 4px" }}>Sản phẩm</h2>
          <p style={{ fontSize: "13px", color: A.textMuted, margin: 0 }}>Quản lý các sản phẩm trong hệ sinh thái Thắng SWC</p>
        </div>
        <button style={s.btnPrimary} onClick={openNew}>+ Tạo sản phẩm</button>
      </div>

      {/* Product grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "1.125rem" }}>
        {products.map((p) => {
          const g = (k: string) => settings[`product_${p.slug}_${k}`] ?? "";
          const status = g("status") || "visible";
          const sectionsCount = safeJson<unknown[]>(g("sections"), []).length;
          const faqsCount     = safeJson<unknown[]>(g("faqs"),     []).length;
          const pricingCount  = safeJson<unknown[]>(g("pricing_v2"),[]).length;
          const hasHero = !!(g("hero_headline") || g("headline"));

          return (
            <div key={p.id} style={{ ...s.card, padding: "1.375rem" }}>
              {/* Top row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{
                    width: "40px", height: "40px", borderRadius: "10px", flexShrink: 0,
                    background: `linear-gradient(135deg, ${A.primary}22, ${A.primary}08)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <span style={{ fontSize: "18px", color: A.primary }}>◈</span>
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: "14px", color: A.text, margin: "0 0 2px" }}>{p.name}</p>
                    <code style={{ fontSize: "11px", color: A.textMuted }}>/san-pham/{p.slug}</code>
                  </div>
                </div>
                <StatusBadge status={status} />
              </div>

              {p.description && (
                <p style={{ fontSize: "12.5px", color: A.textMuted, margin: "0 0 1rem", lineHeight: 1.55 }}>
                  {p.description.slice(0, 90)}{p.description.length > 90 ? "…" : ""}
                </p>
              )}

              {/* Stats row */}
              <div style={{
                display: "flex", gap: "1.25rem", padding: "0.875rem 1rem",
                background: A.bg, borderRadius: "8px", marginBottom: "1rem",
              }}>
                <StatPill label="Sections" value={sectionsCount} />
                <StatPill label="FAQs" value={faqsCount} />
                <StatPill label="Gói giá" value={pricingCount} />
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: "17px", fontWeight: 700, color: hasHero ? A.primary : A.textLight, margin: "0 0 1px", lineHeight: 1 }}>{hasHero ? "✓" : "—"}</p>
                  <p style={{ fontSize: "10.5px", color: A.textLight, margin: 0 }}>Hero</p>
                </div>
              </div>

              {/* Footer */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "0.875rem", borderTop: `1px solid ${A.border}` }}>
                <p style={{ fontSize: "11px", color: A.textLight, margin: 0 }}>Tạo: {fmtDate(p.createdAt)}</p>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <a
                    href={`/san-pham/${p.slug}`}
                    target="_blank"
                    rel="noopener"
                    style={{ ...s.btnGhost, textDecoration: "none", fontSize: "12px", padding: "5px 10px" }}
                  >
                    ↗ Xem
                  </a>
                  <button style={s.btnSecondary} onClick={() => openEdit(p)}>Chỉnh sửa</button>
                  <button style={s.btnDanger} onClick={() => del(p.id)}>Xoá</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {products.length === 0 && (
        <div style={{ ...s.card, textAlign: "center", padding: "3.5rem", color: A.textLight, marginTop: "0.5rem" }}>
          <p style={{ fontSize: "13px", margin: "0 0 0.5rem" }}>Chưa có sản phẩm nào.</p>
          <p style={{ fontSize: "12px", margin: 0 }}>Nhấn "+ Tạo sản phẩm" để thêm sản phẩm đầu tiên.</p>
        </div>
      )}

      <div style={{ marginTop: "1.5rem", padding: "1rem 1.25rem", background: "rgba(26,120,104,0.05)", border: "1px solid rgba(26,120,104,0.15)", borderRadius: "8px" }}>
        <p style={{ fontSize: "12.5px", color: A.primary, margin: "0 0 3px", fontWeight: 600 }}>Về quản lý sản phẩm</p>
        <p style={{ fontSize: "12px", color: A.textMuted, margin: 0, lineHeight: 1.65 }}>
          Slug phải khớp với URL trang sản phẩm. Hero, Sections, FAQ, Pricing, CTA và SEO được lưu trong cài đặt hệ thống và áp dụng lên trang sau khi lưu.
        </p>
      </div>
    </div>
  );
}
