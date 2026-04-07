import React, { useEffect, useState, useCallback } from "react";
import { adminApi } from "@/lib/newsApi";
import { A, s } from "./shared";

/* ── Types ────────────────────────────────────────────────────────── */
type CommTab = "general" | "paths" | "links" | "cta";

interface HeroForm {
  title: string; subtitle: string; badge: string; intro: string;
  cta1Text: string; cta1Link: string; cta2Text: string; cta2Link: string;
}
interface CommPath {
  id: string; num: string; label: string; title: string;
  anchor: string; desc: string; link: string; order: number; visible: boolean;
}
interface LinksForm {
  openUrl: string; openPlatform: string;
  groupUrl: string; groupPlatform: string;
  ecosystemUrl: string; ecosystemPlatform: string;
  facebook: string; zalo: string; telegram: string; youtube: string; discord: string; internal: string;
}
interface CtaForm {
  sectionTitle: string; sectionText: string; btnText: string;
  formTitle: string; formSuccess: string; formEmail: string;
  formNote: string; formEnabled: boolean;
}
interface FormOption { id: string; label: string; visible: boolean; }

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

const PLATFORM_OPTIONS = [
  { value: "",          label: "— Chọn nền tảng —" },
  { value: "facebook",  label: "Facebook" },
  { value: "telegram",  label: "Telegram" },
  { value: "zalo",      label: "Zalo" },
  { value: "discord",   label: "Discord" },
  { value: "youtube",   label: "YouTube" },
  { value: "website",   label: "Website / trang nội bộ" },
];

const DEFAULT_PATHS: CommPath[] = [
  {
    id: "path-1", num: "01", label: "Bắt đầu nhẹ",
    title: "Theo dõi nội dung miễn phí",
    anchor: "Phù hợp nếu anh/chị đang ở giai đoạn bắt đầu.",
    desc: "Nếu anh/chị đang ở giai đoạn bắt đầu, đây là cách phù hợp nhất. Hãy xem video, đọc bài viết, tiếp nhận dần các góc nhìn nền tảng và xây tư duy đúng trước.",
    link: "", order: 1, visible: true,
  },
  {
    id: "path-2", num: "02", label: "Đi cùng cộng đồng",
    title: "Tham gia cộng đồng",
    anchor: "Một môi trường tốt giúp hành trình dài hạn bền hơn.",
    desc: "Nếu anh/chị muốn có môi trường để học cùng người khác, trao đổi, duy trì động lực và đi đường dài vững hơn, cộng đồng sẽ là nơi phù hợp hơn việc đi một mình.",
    link: "", order: 2, visible: true,
  },
  {
    id: "path-3", num: "03", label: "Đi sâu hơn",
    title: "Chương trình chuyên sâu",
    anchor: "Dành cho người muốn đi sâu hơn với lộ trình nghiêm túc.",
    desc: "Nếu anh/chị muốn đi sâu hơn vào kiến thức, công cụ, hệ thống hoặc một lộ trình nghiêm túc hơn, tôi có những chương trình phù hợp cho từng giai đoạn phát triển.",
    link: "", order: 3, visible: true,
  },
];

const DEFAULT_FORM_OPTIONS: FormOption[] = [
  { id: "theo-doi", label: "Theo dõi cộng đồng mở", visible: true },
  { id: "nhom-trao-doi", label: "Tham gia nhóm trao đổi", visible: true },
  { id: "he-sinh-thai", label: "Tìm hiểu hệ sinh thái chuyên sâu", visible: true },
];

/* ── Tab bar ──────────────────────────────────────────────────────── */
function TabBar({ tab, setTab }: { tab: CommTab; setTab: (t: CommTab) => void }) {
  const TABS: { id: CommTab; label: string }[] = [
    { id: "general", label: "Thông tin chung" },
    { id: "paths",   label: "Hình thức tham gia" },
    { id: "links",   label: "Liên kết cộng đồng" },
    { id: "cta",     label: "CTA & Form" },
  ];
  return (
    <div style={{ display: "flex", gap: 0, borderBottom: `1px solid ${A.border}`, marginBottom: "1.5rem" }}>
      {TABS.map(({ id, label }) => {
        const active = tab === id;
        return (
          <button key={id} onClick={() => setTab(id)} style={{
            padding: "10px 18px", border: "none", background: "none", cursor: "pointer",
            fontSize: "12.5px", fontWeight: active ? 600 : 400,
            color: active ? A.primary : A.textMuted,
            borderBottom: active ? `2px solid ${A.primary}` : "2px solid transparent",
            transition: "all 0.12s ease", whiteSpace: "nowrap",
          }}>
            {label}
          </button>
        );
      })}
    </div>
  );
}

function Lbl({ children }: { children: React.ReactNode }) {
  return <label style={s.label}>{children}</label>;
}
function Hint({ text }: { text: string }) {
  return <p style={{ fontSize: "11px", color: A.textLight, margin: "3px 0 0" }}>{text}</p>;
}
function SectionHead({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.12em",
      textTransform: "uppercase", color: A.textMuted, margin: "0 0 1rem",
    }}>
      {children}
    </p>
  );
}

/* ── Hình thức tham gia tab ───────────────────────────────────────── */
function PathsTab({ paths, setPaths }: { paths: CommPath[]; setPaths: React.Dispatch<React.SetStateAction<CommPath[]>> }) {
  const add = () => setPaths((p) => [...p, {
    id: uid(), num: `0${p.length + 1}`, label: "", title: "", anchor: "", desc: "", link: "",
    order: p.length + 1, visible: true,
  }]);
  const upd = (i: number, patch: Partial<CommPath>) => setPaths((p) => p.map((x, j) => j === i ? { ...x, ...patch } : x));
  const del = (i: number) => setPaths((p) => p.filter((_, j) => j !== i).map((x, j) => ({ ...x, order: j + 1 })));

  return (
    <div>
      <p style={{ fontSize: "12.5px", color: A.textMuted, margin: "0 0 1.25rem", lineHeight: 1.65 }}>
        Các hình thức tham gia hiển thị trên trang cộng đồng. Kéo thứ tự bằng nút ↑↓. Có thể ẩn từng mục nếu chưa sẵn sàng hiển thị.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {paths.map((path, i) => (
          <div key={path.id} style={{
            ...s.card, padding: "1.375rem",
            borderLeft: path.visible ? `3px solid ${A.primary}` : `3px solid ${A.border}`,
            opacity: path.visible ? 1 : 0.6,
          }}>
            {/* Row header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{
                  fontSize: "18px", fontWeight: 700, letterSpacing: "-0.02em",
                  color: path.visible ? A.primary : A.textLight,
                  fontFamily: "monospace",
                }}>
                  {path.num || `0${i + 1}`}
                </span>
                <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: A.textMuted }}>
                  Hình thức {i + 1}
                </span>
              </div>
              <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                <label style={{ fontSize: "11.5px", color: A.textMuted, cursor: "pointer", display: "flex", alignItems: "center", gap: "5px" }}>
                  <input type="checkbox" checked={path.visible} onChange={(e) => upd(i, { visible: e.target.checked })} style={{ accentColor: A.primary }} />
                  Hiển thị
                </label>
                <button onClick={() => setPaths((p) => move(p, i, -1))} style={{ ...s.btnGhost, padding: "3px 8px", fontSize: "14px" }}>↑</button>
                <button onClick={() => setPaths((p) => move(p, i,  1))} style={{ ...s.btnGhost, padding: "3px 8px", fontSize: "14px" }}>↓</button>
                <button onClick={() => del(i)} style={{ ...s.btnDanger, padding: "4px 9px", fontSize: "11px" }}>Xoá</button>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "80px 1fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
              <div>
                <Lbl>Số thứ tự</Lbl>
                <input style={s.field} value={path.num} placeholder="01" onChange={(e) => upd(i, { num: e.target.value })} />
              </div>
              <div>
                <Lbl>Nhãn ngắn (italic)</Lbl>
                <input style={s.field} value={path.label} placeholder="Bắt đầu nhẹ" onChange={(e) => upd(i, { label: e.target.value })} />
              </div>
              <div>
                <Lbl>Tiêu đề</Lbl>
                <input style={{ ...s.field, fontWeight: 600 }} value={path.title} placeholder="Theo dõi nội dung miễn phí" onChange={(e) => upd(i, { title: e.target.value })} />
              </div>
            </div>

            <div style={{ marginBottom: "0.75rem" }}>
              <Lbl>Dòng anchor (câu mô tả ngắn, italic)</Lbl>
              <input style={s.field} value={path.anchor} placeholder="Phù hợp nếu anh/chị đang ở giai đoạn bắt đầu." onChange={(e) => upd(i, { anchor: e.target.value })} />
            </div>

            <div style={{ marginBottom: "0.75rem" }}>
              <Lbl>Mô tả đầy đủ</Lbl>
              <textarea style={{ ...s.textarea, height: "80px" }} value={path.desc}
                placeholder="Nội dung dài hơn giải thích hình thức tham gia..."
                onChange={(e) => upd(i, { desc: e.target.value })} />
            </div>

            <div>
              <Lbl>Liên kết CTA (nếu có)</Lbl>
              <input style={s.field} value={path.link} placeholder="https://... hoặc /cong-dong#dang-ky" onChange={(e) => upd(i, { link: e.target.value })} />
            </div>
          </div>
        ))}
      </div>
      <button style={{ ...s.btnSecondary, marginTop: "1rem", width: "100%", padding: "10px" }} onClick={add}>
        + Thêm hình thức tham gia
      </button>
    </div>
  );
}

/* ── Liên kết cộng đồng tab ───────────────────────────────────────── */
function LinksTab({ links, setLinks }: { links: LinksForm; setLinks: React.Dispatch<React.SetStateAction<LinksForm>> }) {
  const set = (k: keyof LinksForm, v: string) => setLinks((f) => ({ ...f, [k]: v }));

  const MainLink = ({
    label, hint, urlKey, platformKey,
  }: { label: string; hint: string; urlKey: keyof LinksForm; platformKey: keyof LinksForm }) => (
    <div style={{ ...s.card, padding: "1.25rem" }}>
      <SectionHead>{label}</SectionHead>
      <p style={{ fontSize: "12px", color: A.textLight, margin: "0 0 1rem", fontStyle: "italic" }}>{hint}</p>
      <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: "0.75rem" }}>
        <div>
          <Lbl>Nền tảng</Lbl>
          <select style={s.select} value={links[platformKey] ?? ""} onChange={(e) => set(platformKey, e.target.value)}>
            {PLATFORM_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <Lbl>URL</Lbl>
          <input style={s.field} value={links[urlKey] ?? ""} placeholder="https://..." onChange={(e) => set(urlKey, e.target.value)} />
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <MainLink
        label="Cộng đồng mở (hình thức 01)"
        hint="Nơi người mới bắt đầu theo dõi — Facebook Group, YouTube, v.v."
        urlKey="openUrl" platformKey="openPlatform"
      />
      <MainLink
        label="Nhóm trao đổi (hình thức 02)"
        hint="Nhóm chuyên trao đổi, hỗ trợ giữa các thành viên."
        urlKey="groupUrl" platformKey="groupPlatform"
      />
      <MainLink
        label="Hệ sinh thái chuyên sâu (hình thức 03)"
        hint="Trang đăng ký chương trình chuyên sâu hoặc sản phẩm."
        urlKey="ecosystemUrl" platformKey="ecosystemPlatform"
      />

      {/* General platform links */}
      <div style={s.card}>
        <SectionHead>Kênh & nền tảng tổng quát</SectionHead>
        <p style={{ fontSize: "12px", color: A.textLight, margin: "0 0 1rem", fontStyle: "italic" }}>
          Dùng trong footer, navbar hoặc bất kỳ vị trí nào cần link mạng xã hội.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "0.875rem" }}>
          {([
            { key: "facebook", label: "Facebook" },
            { key: "zalo",     label: "Zalo" },
            { key: "telegram", label: "Telegram" },
            { key: "youtube",  label: "YouTube" },
            { key: "discord",  label: "Discord" },
            { key: "internal", label: "Trang nội bộ / website" },
          ] as { key: keyof LinksForm; label: string }[]).map(({ key, label }) => (
            <div key={key as string}>
              <Lbl>{label}</Lbl>
              <input style={s.field} value={links[key] ?? ""} placeholder="https://..."
                onChange={(e) => set(key, e.target.value)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── CTA & Form tab ───────────────────────────────────────────────── */
function CtaTab({
  cta, setCta, formOptions, setFormOptions,
}: {
  cta: CtaForm; setCta: React.Dispatch<React.SetStateAction<CtaForm>>;
  formOptions: FormOption[]; setFormOptions: React.Dispatch<React.SetStateAction<FormOption[]>>;
}) {
  const set = (k: keyof CtaForm, v: string | boolean) => setCta((f) => ({ ...f, [k]: v }));
  const updOpt = (i: number, patch: Partial<FormOption>) => setFormOptions((p) => p.map((o, j) => j === i ? { ...o, ...patch } : o));
  const addOpt = () => setFormOptions((p) => [...p, { id: uid(), label: "", visible: true }]);
  const delOpt = (i: number) => setFormOptions((p) => p.filter((_, j) => j !== i));

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", alignItems: "start" }}>
      {/* Left: section content */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div style={s.card}>
          <SectionHead>Section CTA trên trang cộng đồng</SectionHead>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            <div>
              <Lbl>Tiêu đề section</Lbl>
              <input style={{ ...s.field, fontWeight: 600 }} value={cta.sectionTitle}
                placeholder="Bắt đầu hành trình của bạn"
                onChange={(e) => set("sectionTitle", e.target.value)} />
            </div>
            <div>
              <Lbl>Mô tả hỗ trợ</Lbl>
              <textarea style={{ ...s.textarea, height: "72px" }} value={cta.sectionText}
                placeholder="Điền thông tin để nhận hỗ trợ và được kết nối đúng hình thức..."
                onChange={(e) => set("sectionText", e.target.value)} />
            </div>
            <div>
              <Lbl>Text nút CTA (nếu không dùng form)</Lbl>
              <input style={s.field} value={cta.btnText} placeholder="Tham gia ngay"
                onChange={(e) => set("btnText", e.target.value)} />
            </div>
          </div>
        </div>

        <div style={s.card}>
          <SectionHead>Form đăng ký</SectionHead>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            <div>
              <label style={{ ...s.label, marginBottom: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <input type="checkbox" checked={cta.formEnabled}
                    onChange={(e) => set("formEnabled", e.target.checked)}
                    style={{ accentColor: A.primary }} />
                  Hiện form đăng ký trên trang
                </div>
              </label>
            </div>
            <div>
              <Lbl>Tiêu đề form</Lbl>
              <input style={s.field} value={cta.formTitle} placeholder="Để lại thông tin để được hỗ trợ"
                onChange={(e) => set("formTitle", e.target.value)} />
            </div>
            <div>
              <Lbl>Ghi chú dưới form</Lbl>
              <input style={s.field} value={cta.formNote} placeholder="Miễn phí. Không spam."
                onChange={(e) => set("formNote", e.target.value)} />
            </div>
            <div>
              <Lbl>Tin nhắn thành công</Lbl>
              <input style={s.field} value={cta.formSuccess} placeholder="Cảm ơn anh/chị. Chúng tôi sẽ liên hệ sớm."
                onChange={(e) => set("formSuccess", e.target.value)} />
            </div>
            <div>
              <Lbl>Email nhận thông báo</Lbl>
              <input style={s.field} type="email" value={cta.formEmail} placeholder="admin@example.com"
                onChange={(e) => set("formEmail", e.target.value)} />
              <Hint text="Leads vẫn được lưu vào database. Email này là để nhận thông báo." />
            </div>
          </div>
        </div>
      </div>

      {/* Right: form options */}
      <div style={s.card}>
        <SectionHead>Tùy chọn trong form</SectionHead>
        <p style={{ fontSize: "12px", color: A.textLight, margin: "0 0 1rem", fontStyle: "italic", lineHeight: 1.55 }}>
          Các lựa chọn người dùng chọn khi điền form "Tôi muốn…". Có thể ẩn hoặc đổi tên nhãn.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {formOptions.map((opt, i) => (
            <div key={opt.id} style={{
              display: "flex", alignItems: "center", gap: "0.75rem",
              padding: "0.75rem", background: A.bg, borderRadius: "8px",
              opacity: opt.visible ? 1 : 0.55,
            }}>
              <input type="checkbox" checked={opt.visible}
                onChange={(e) => updOpt(i, { visible: e.target.checked })}
                style={{ accentColor: A.primary, flexShrink: 0 }} />
              <input
                style={{ ...s.field, flex: 1, fontSize: "12.5px" }}
                value={opt.label}
                placeholder="Nhãn tùy chọn..."
                onChange={(e) => updOpt(i, { label: e.target.value })}
              />
              <button onClick={() => delOpt(i)} style={{ ...s.btnGhost, padding: "4px 8px", color: A.danger, flexShrink: 0 }}>✕</button>
            </div>
          ))}
        </div>
        <button style={{ ...s.btnSecondary, marginTop: "0.875rem", width: "100%", padding: "8px" }} onClick={addOpt}>
          + Thêm tùy chọn
        </button>
      </div>
    </div>
  );
}

/* ── Main panel ─────────────────────────────────────────────────── */
export function CommunityPanel({ adminKey }: { adminKey: string }) {
  const [tab, setTab]     = useState<CommTab>("general");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [msg, setMsg]         = useState("");

  /* General / Hero */
  const [hero, setHero] = useState<HeroForm>({
    title: "", subtitle: "", badge: "", intro: "",
    cta1Text: "", cta1Link: "", cta2Text: "", cta2Link: "",
  });
  const setH = (k: keyof HeroForm, v: string) => setHero((f) => ({ ...f, [k]: v }));

  /* Participation paths */
  const [paths, setPaths] = useState<CommPath[]>(DEFAULT_PATHS);

  /* Links */
  const [links, setLinks] = useState<LinksForm>({
    openUrl: "", openPlatform: "", groupUrl: "", groupPlatform: "",
    ecosystemUrl: "", ecosystemPlatform: "",
    facebook: "", zalo: "", telegram: "", youtube: "", discord: "", internal: "",
  });

  /* CTA & Form */
  const [cta, setCta] = useState<CtaForm>({
    sectionTitle: "", sectionText: "", btnText: "",
    formTitle: "", formSuccess: "", formEmail: "", formNote: "", formEnabled: true,
  });
  const [formOptions, setFormOptions] = useState<FormOption[]>(DEFAULT_FORM_OPTIONS);

  /* Load */
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.getSettings(adminKey);
      const g = (k: string) => (data[k] ?? "") as string;

      setHero({
        title:    g("community_hero_title"),
        subtitle: g("community_hero_subtitle"),
        badge:    g("community_hero_badge"),
        intro:    g("community_hero_intro"),
        cta1Text: g("community_hero_cta1_text"),
        cta1Link: g("community_hero_cta1_link"),
        cta2Text: g("community_hero_cta2_text"),
        cta2Link: g("community_hero_cta2_link"),
      });

      const rawPaths = g("community_paths");
      if (rawPaths) {
        setPaths(safeJson<CommPath[]>(rawPaths, DEFAULT_PATHS).map((p, i) => ({ ...p, id: p.id || uid(), order: i + 1 })));
      }

      setLinks({
        openUrl:         g("community_link_open_url"),
        openPlatform:    g("community_link_open_platform"),
        groupUrl:        g("community_link_group_url"),
        groupPlatform:   g("community_link_group_platform"),
        ecosystemUrl:    g("community_link_ecosystem_url"),
        ecosystemPlatform: g("community_link_ecosystem_platform"),
        facebook:  g("community_link_facebook"),
        zalo:      g("community_link_zalo"),
        telegram:  g("community_link_telegram"),
        youtube:   g("community_link_youtube"),
        discord:   g("community_link_discord"),
        internal:  g("community_link_internal"),
      });

      setCta({
        sectionTitle: g("community_cta_title"),
        sectionText:  g("community_cta_subtitle"),
        btnText:      g("community_cta_btn_text"),
        formTitle:    g("community_form_title"),
        formSuccess:  g("community_form_success"),
        formEmail:    g("community_form_email"),
        formNote:     g("community_form_note"),
        formEnabled:  g("community_form_enabled") !== "false",
      });

      const rawOpts = g("community_form_options");
      if (rawOpts) {
        setFormOptions(safeJson<FormOption[]>(rawOpts, DEFAULT_FORM_OPTIONS).map((o) => ({ ...o, id: o.id || uid() })));
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [adminKey]);

  useEffect(() => { load(); }, [load]);

  /* Save */
  const save = async () => {
    setSaving(true); setMsg("");
    try {
      const payload: Record<string, string> = {
        community_hero_title:    hero.title,
        community_hero_subtitle: hero.subtitle,
        community_hero_badge:    hero.badge,
        community_hero_intro:    hero.intro,
        community_hero_cta1_text: hero.cta1Text,
        community_hero_cta1_link: hero.cta1Link,
        community_hero_cta2_text: hero.cta2Text,
        community_hero_cta2_link: hero.cta2Link,
        community_paths:         JSON.stringify(paths),
        community_link_open_url:         links.openUrl,
        community_link_open_platform:    links.openPlatform,
        community_link_group_url:        links.groupUrl,
        community_link_group_platform:   links.groupPlatform,
        community_link_ecosystem_url:    links.ecosystemUrl,
        community_link_ecosystem_platform: links.ecosystemPlatform,
        community_link_facebook:  links.facebook,
        community_link_zalo:      links.zalo,
        community_link_telegram:  links.telegram,
        community_link_youtube:   links.youtube,
        community_link_discord:   links.discord,
        community_link_internal:  links.internal,
        community_cta_title:      cta.sectionTitle,
        community_cta_subtitle:   cta.sectionText,
        community_cta_btn_text:   cta.btnText,
        community_form_title:     cta.formTitle,
        community_form_success:   cta.formSuccess,
        community_form_email:     cta.formEmail,
        community_form_note:      cta.formNote,
        community_form_enabled:   cta.formEnabled ? "true" : "false",
        community_form_options:   JSON.stringify(formOptions),
      };
      await adminApi.updateSettings(adminKey, payload);
      setMsg("Đã lưu tất cả.");
    } catch (e) { setMsg(String(e)); }
    finally { setSaving(false); }
  };

  if (loading) return <p style={{ fontSize: "13px", color: A.textMuted }}>Đang tải...</p>;

  return (
    <div>
      {/* Header */}
      <div style={{ ...s.sectionHeader, marginBottom: "1.25rem" }}>
        <div>
          <h2 style={{ ...s.sectionTitle, margin: "0 0 4px" }}>Cộng đồng</h2>
          <p style={{ fontSize: "13px", color: A.textMuted, margin: 0 }}>
            Quản lý nội dung, hình thức tham gia và liên kết cộng đồng
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          {msg && (
            <span style={{ fontSize: "12.5px", color: msg.startsWith("Đã") ? A.primary : A.danger }}>
              {msg}
            </span>
          )}
          <a
            href="/cong-dong"
            target="_blank"
            rel="noopener"
            style={{
              display: "inline-flex", alignItems: "center", gap: "4px",
              padding: "6px 12px", borderRadius: "6px", border: `1px solid ${A.border}`,
              fontSize: "12.5px", fontWeight: 500, textDecoration: "none", color: A.text,
            }}
          >
            ↗ Xem trang cộng đồng
          </a>
          <button style={s.btnPrimary} disabled={saving} onClick={save}>
            {saving ? "Đang lưu..." : "Lưu tất cả"}
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <TabBar tab={tab} setTab={setTab} />

      {/* ── Tab: Thông tin chung ── */}
      {tab === "general" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 290px", gap: "1.25rem", alignItems: "start" }}>
          {/* Left */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={s.card}>
              <SectionHead>Hero section (đầu trang cộng đồng)</SectionHead>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                <div>
                  <Lbl>Tiêu đề hero</Lbl>
                  <input style={{ ...s.field, fontSize: "14px", fontWeight: 600 }} value={hero.title}
                    placeholder="Những cách anh/chị có thể đồng hành cùng tôi"
                    onChange={(e) => setH("title", e.target.value)} />
                </div>
                <div>
                  <Lbl>Mô tả supporting text</Lbl>
                  <textarea style={{ ...s.textarea, height: "88px" }} value={hero.subtitle}
                    placeholder="Mỗi người đang ở một giai đoạn khác nhau. Vì vậy, tôi muốn giữ nhiều cách đồng hành..."
                    onChange={(e) => setH("subtitle", e.target.value)} />
                </div>
                <div>
                  <Lbl>Intro / phụ đề section</Lbl>
                  <input style={s.field} value={hero.intro}
                    placeholder="Ví dụ: Cộng đồng"
                    onChange={(e) => setH("intro", e.target.value)} />
                  <Hint text="Nhãn nhỏ hoặc section label hiển thị trên tiêu đề" />
                </div>
              </div>
            </div>
          </div>

          {/* Right */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={s.card}>
              <SectionHead>Badge / Số liệu</SectionHead>
              <Lbl>Badge phụ (số thành viên, v.v.)</Lbl>
              <input style={s.field} value={hero.badge}
                placeholder="Hơn 5.000 thành viên"
                onChange={(e) => setH("badge", e.target.value)} />
            </div>
            <div style={s.card}>
              <SectionHead>CTA 1 (nút chính)</SectionHead>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div>
                  <Lbl>Text nút</Lbl>
                  <input style={s.field} value={hero.cta1Text} placeholder="Tham gia cộng đồng"
                    onChange={(e) => setH("cta1Text", e.target.value)} />
                </div>
                <div>
                  <Lbl>Link</Lbl>
                  <input style={s.field} value={hero.cta1Link} placeholder="https://... hoặc #dang-ky"
                    onChange={(e) => setH("cta1Link", e.target.value)} />
                </div>
              </div>
            </div>
            <div style={s.card}>
              <SectionHead>CTA 2 (nút phụ)</SectionHead>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div>
                  <Lbl>Text nút</Lbl>
                  <input style={s.field} value={hero.cta2Text} placeholder="Xem thêm"
                    onChange={(e) => setH("cta2Text", e.target.value)} />
                </div>
                <div>
                  <Lbl>Link</Lbl>
                  <input style={s.field} value={hero.cta2Link} placeholder="https://..."
                    onChange={(e) => setH("cta2Link", e.target.value)} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Hình thức tham gia ── */}
      {tab === "paths" && <PathsTab paths={paths} setPaths={setPaths} />}

      {/* ── Tab: Liên kết cộng đồng ── */}
      {tab === "links" && <LinksTab links={links} setLinks={setLinks} />}

      {/* ── Tab: CTA & Form ── */}
      {tab === "cta" && <CtaTab cta={cta} setCta={setCta} formOptions={formOptions} setFormOptions={setFormOptions} />}

      {/* Footer note */}
      <div style={{ marginTop: "1.5rem", padding: "1rem 1.25rem", background: "rgba(26,120,104,0.05)", border: "1px solid rgba(26,120,104,0.15)", borderRadius: "8px" }}>
        <p style={{ fontSize: "12.5px", color: A.primary, margin: "0 0 3px", fontWeight: 600 }}>Lưu ý</p>
        <p style={{ fontSize: "12px", color: A.textMuted, margin: 0, lineHeight: 1.65 }}>
          Nhấn "Lưu tất cả" để lưu tất cả thay đổi trên mọi tab. Các thay đổi sẽ phản ánh ngay trên trang cộng đồng sau khi lưu. Trường để trống sẽ giữ nguyên giá trị mặc định trong code.
        </p>
      </div>
    </div>
  );
}
