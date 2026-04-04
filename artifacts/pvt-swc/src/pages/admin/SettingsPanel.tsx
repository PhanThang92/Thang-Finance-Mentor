import React, { useEffect, useState, useCallback } from "react";
import { adminApi } from "@/lib/newsApi";
import { A, s } from "./shared";

/* ── Types ────────────────────────────────────────────────────────── */
type SettTab = "menu" | "footer" | "social" | "contact" | "form" | "seo";

interface NavItem {
  id: string; label: string; href: string; visible: boolean; order: number;
  children: NavChild[];
}
interface NavChild {
  id: string; label: string; href: string; desc: string; visible: boolean;
}
interface LinkRow { id: string; label: string; href: string; visible: boolean; }

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

/* ── Default values from current Navbar ──────────────────────────── */
const DEFAULT_NAV: NavItem[] = [
  { id: "trang-chu",  label: "Trang chủ",  href: "#trang-chu",  visible: true, order: 1, children: [] },
  { id: "gioi-thieu", label: "Giới thiệu", href: "#gioi-thieu", visible: true, order: 2, children: [] },
  { id: "noi-dung",   label: "Nội dung",   href: "#noi-dung",   visible: true, order: 3, children: [] },
  { id: "tin-tuc",    label: "Tin tức",    href: "/tin-tuc",    visible: true, order: 4, children: [] },
  { id: "cong-dong",  label: "Cộng đồng",  href: "/cong-dong",  visible: true, order: 5, children: [] },
  {
    id: "san-pham", label: "Sản phẩm", href: "", visible: true, order: 6,
    children: [
      { id: "road-to-1m", label: "Road to $1M · SWC PASS", href: "/san-pham/duong-toi-1-trieu-do", desc: "Lộ trình tài chính cá nhân có hệ thống", visible: true },
      { id: "atlas",      label: "ATLAS",                    href: "/san-pham/atlas",                desc: "Hệ sinh thái bất động sản kỹ thuật số",  visible: true },
    ],
  },
  { id: "lien-he",    label: "Liên hệ",    href: "#lien-he",    visible: true, order: 7, children: [] },
];
const DEFAULT_FOOTER_NAV: LinkRow[] = [
  { id: uid(), label: "Giới thiệu", href: "#gioi-thieu", visible: true },
  { id: uid(), label: "Tin tức",    href: "/tin-tuc",    visible: true },
  { id: uid(), label: "Cộng đồng",  href: "/cong-dong",  visible: true },
  { id: uid(), label: "Liên hệ",    href: "#lien-he",    visible: true },
];
const DEFAULT_FOOTER_PRODUCTS: LinkRow[] = [
  { id: uid(), label: "Road to $1M · SWC PASS", href: "/san-pham/duong-toi-1-trieu-do", visible: true },
  { id: uid(), label: "ATLAS",                    href: "/san-pham/atlas",                visible: true },
];

/* ── Tab bar ──────────────────────────────────────────────────────── */
function TabBar({ tab, setTab }: { tab: SettTab; setTab: (t: SettTab) => void }) {
  const TABS: { id: SettTab; label: string }[] = [
    { id: "menu",    label: "Menu" },
    { id: "footer",  label: "Footer" },
    { id: "social",  label: "Social" },
    { id: "contact", label: "Liên hệ" },
    { id: "form",    label: "Form" },
    { id: "seo",     label: "SEO chung" },
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
  return <p style={{ fontSize: "11px", color: A.textLight, margin: "3px 0 0", lineHeight: 1.5 }}>{text}</p>;
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
function InfoBox({ title, text }: { title: string; text: string }) {
  return (
    <div style={{ padding: "0.875rem 1.125rem", background: "rgba(26,120,104,0.05)", border: "1px solid rgba(26,120,104,0.18)", borderRadius: "8px" }}>
      <p style={{ fontSize: "12px", color: A.primary, margin: "0 0 3px", fontWeight: 600 }}>{title}</p>
      <p style={{ fontSize: "11.5px", color: A.textMuted, margin: 0, lineHeight: 1.65 }}>{text}</p>
    </div>
  );
}

/* ── Reorderable link list ────────────────────────────────────────── */
function LinkList({
  rows, setRows, addLabel = "+ Thêm liên kết", showDesc = false,
}: {
  rows: LinkRow[]; setRows: React.Dispatch<React.SetStateAction<LinkRow[]>>;
  addLabel?: string; showDesc?: boolean;
}) {
  const add = () => setRows((p) => [...p, { id: uid(), label: "", href: "", visible: true }]);
  const upd = (i: number, patch: Partial<LinkRow>) => setRows((p) => p.map((r, j) => j === i ? { ...r, ...patch } : r));
  const del = (i: number) => setRows((p) => p.filter((_, j) => j !== i));
  return (
    <div>
      {rows.map((row, i) => (
        <div key={row.id} style={{
          display: "flex", gap: "0.5rem", alignItems: "center",
          padding: "0.625rem 0", borderBottom: `1px solid ${A.border}`,
          opacity: row.visible ? 1 : 0.5,
        }}>
          <input type="checkbox" checked={row.visible}
            onChange={(e) => upd(i, { visible: e.target.checked })}
            style={{ accentColor: A.primary, flexShrink: 0 }} title="Hiển thị" />
          <input style={{ ...s.field, flex: "1.2", fontSize: "12.5px" }} value={row.label}
            placeholder="Nhãn..." onChange={(e) => upd(i, { label: e.target.value })} />
          <input style={{ ...s.field, flex: "1.8", fontSize: "12px", fontFamily: "monospace" }} value={row.href}
            placeholder="/duong-dan hoặc #anchor" onChange={(e) => upd(i, { href: e.target.value })} />
          <button onClick={() => setRows((p) => move(p, i, -1))} style={{ ...s.btnGhost, padding: "4px 7px" }}>↑</button>
          <button onClick={() => setRows((p) => move(p, i,  1))} style={{ ...s.btnGhost, padding: "4px 7px" }}>↓</button>
          <button onClick={() => del(i)} style={{ ...s.btnGhost, padding: "4px 8px", color: A.danger }}>✕</button>
        </div>
      ))}
      <button style={{ ...s.btnSecondary, marginTop: "0.75rem", fontSize: "12px", padding: "7px 12px" }} onClick={add}>
        {addLabel}
      </button>
    </div>
  );
}

/* ── Menu tab ─────────────────────────────────────────────────────── */
function MenuTab({ navItems, setNavItems }: { navItems: NavItem[]; setNavItems: React.Dispatch<React.SetStateAction<NavItem[]>> }) {
  const upd = (i: number, patch: Partial<NavItem>) => setNavItems((p) => p.map((x, j) => j === i ? { ...x, ...patch } : x));
  const del = (i: number) => setNavItems((p) => p.filter((_, j) => j !== i).map((x, j) => ({ ...x, order: j + 1 })));
  const addItem = () => setNavItems((p) => [...p, { id: uid(), label: "", href: "", visible: true, order: p.length + 1, children: [] }]);

  const updChild = (ni: number, ci: number, patch: Partial<NavChild>) =>
    setNavItems((p) => p.map((x, j) => j !== ni ? x : { ...x, children: x.children.map((c, k) => k === ci ? { ...c, ...patch } : c) }));
  const delChild = (ni: number, ci: number) =>
    setNavItems((p) => p.map((x, j) => j !== ni ? x : { ...x, children: x.children.filter((_, k) => k !== ci) }));
  const addChild = (ni: number) =>
    setNavItems((p) => p.map((x, j) => j !== ni ? x : { ...x, children: [...x.children, { id: uid(), label: "", href: "", desc: "", visible: true }] }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <InfoBox
        title="Cấu trúc menu điều hướng"
        text="Thay đổi được lưu vào hệ thống và sẽ áp dụng lên Navbar. Checkbox bỏ chọn để ẩn mục. Mục có dropdown (Sản phẩm) có thể thêm/xoá sub-mục."
      />
      {navItems.map((item, i) => (
        <div key={item.id} style={{
          ...s.card, padding: "1.125rem",
          borderLeft: item.visible ? `3px solid ${A.primary}` : `3px solid ${A.border}`,
          opacity: item.visible ? 1 : 0.58,
        }}>
          {/* Item row */}
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: item.children.length > 0 ? "0.875rem" : 0 }}>
            <input type="checkbox" checked={item.visible} onChange={(e) => upd(i, { visible: e.target.checked })}
              style={{ accentColor: A.primary, flexShrink: 0 }} title="Hiển thị" />
            <input
              style={{ ...s.field, fontWeight: 600, fontSize: "13px", flex: "1.2" }}
              value={item.label} placeholder="Tên mục..."
              onChange={(e) => upd(i, { label: e.target.value })} />
            <input
              style={{ ...s.field, flex: "1.8", fontFamily: "monospace", fontSize: "12px" }}
              value={item.href} placeholder="/duong-dan hoặc #anchor hoặc để trống nếu có dropdown"
              onChange={(e) => upd(i, { href: e.target.value })} />
            <button onClick={() => setNavItems((p) => move(p, i, -1))} style={{ ...s.btnGhost, padding: "4px 8px" }}>↑</button>
            <button onClick={() => setNavItems((p) => move(p, i,  1))} style={{ ...s.btnGhost, padding: "4px 8px" }}>↓</button>
            <button onClick={() => addChild(i)} style={{ ...s.btnGhost, padding: "4px 10px", fontSize: "11.5px", color: A.primary }} title="Thêm sub-mục">+ sub</button>
            <button onClick={() => del(i)} style={{ ...s.btnGhost, padding: "4px 8px", color: A.danger }}>✕</button>
          </div>

          {/* Children */}
          {item.children.length > 0 && (
            <div style={{ paddingLeft: "1.25rem", borderLeft: `2px solid ${A.border}`, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {item.children.map((child, ci) => (
                <div key={child.id} style={{ display: "flex", gap: "0.5rem", alignItems: "center", opacity: child.visible ? 1 : 0.5 }}>
                  <input type="checkbox" checked={child.visible}
                    onChange={(e) => updChild(i, ci, { visible: e.target.checked })}
                    style={{ accentColor: A.primary, flexShrink: 0 }} />
                  <input style={{ ...s.field, fontWeight: 600, fontSize: "12.5px", flex: "1.2" }}
                    value={child.label} placeholder="Tên sub-mục..."
                    onChange={(e) => updChild(i, ci, { label: e.target.value })} />
                  <input style={{ ...s.field, fontFamily: "monospace", fontSize: "12px", flex: "1.5" }}
                    value={child.href} placeholder="/duong-dan"
                    onChange={(e) => updChild(i, ci, { href: e.target.value })} />
                  <input style={{ ...s.field, fontSize: "12px", flex: "1" }}
                    value={child.desc} placeholder="Mô tả ngắn (tuỳ chọn)"
                    onChange={(e) => updChild(i, ci, { desc: e.target.value })} />
                  <button onClick={() => delChild(i, ci)} style={{ ...s.btnGhost, padding: "4px 8px", color: A.danger }}>✕</button>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
      <button style={{ ...s.btnSecondary, padding: "9px", width: "100%" }} onClick={addItem}>
        + Thêm mục menu
      </button>
    </div>
  );
}

/* ── Footer tab ───────────────────────────────────────────────────── */
function FooterTab({
  settings, setS, footerNav, setFooterNav, footerProducts, setFooterProducts,
}: {
  settings: Record<string, string>; setS: (k: string, v: string) => void;
  footerNav: LinkRow[]; setFooterNav: React.Dispatch<React.SetStateAction<LinkRow[]>>;
  footerProducts: LinkRow[]; setFooterProducts: React.Dispatch<React.SetStateAction<LinkRow[]>>;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.125rem" }}>
      {/* Brand block */}
      <div style={s.card}>
        <SectionHead>Brand block</SectionHead>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem" }}>
          <div>
            <Lbl>Tên thương hiệu</Lbl>
            <input style={s.field} value={settings["footer_company_name"] ?? ""}
              placeholder="Thắng SWC" onChange={(e) => setS("footer_company_name", e.target.value)} />
          </div>
          <div>
            <Lbl>Copyright</Lbl>
            <input style={s.field} value={settings["footer_copyright"] ?? ""}
              placeholder="© 2026 Phan Văn Thắng. All rights reserved."
              onChange={(e) => setS("footer_copyright", e.target.value)} />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <Lbl>Tagline / mô tả ngắn</Lbl>
            <textarea style={{ ...s.textarea, height: "72px" }} value={settings["footer_tagline"] ?? ""}
              placeholder="Góc nhìn dài hạn về tài chính cá nhân và đầu tư bền vững."
              onChange={(e) => setS("footer_tagline", e.target.value)} />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <Lbl>Disclaimer / ghi chú cuối footer</Lbl>
            <textarea style={{ ...s.textarea, height: "72px" }} value={settings["footer_disclaimer"] ?? ""}
              placeholder="Nội dung trên website chỉ mang tính chất tham khảo..."
              onChange={(e) => setS("footer_disclaimer", e.target.value)} />
          </div>
        </div>
      </div>

      {/* Footer nav links */}
      <div style={s.card}>
        <SectionHead>Nhóm điều hướng chính</SectionHead>
        <div style={{ fontSize: "11.5px", color: A.textLight, marginBottom: "0.75rem", fontStyle: "italic" }}>Checkbox = hiển thị &nbsp;·&nbsp; ↑↓ = thứ tự</div>
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr 2fr auto auto auto", gap: "0", alignItems: "center" }}>
          <span style={{ ...s.label, gridColumn: "2", marginBottom: 0, paddingBottom: "6px" }}>Nhãn</span>
          <span style={{ ...s.label, gridColumn: "3", marginBottom: 0, paddingBottom: "6px", paddingLeft: "0.5rem" }}>Đường dẫn</span>
        </div>
        <LinkList rows={footerNav} setRows={setFooterNav} addLabel="+ Thêm liên kết điều hướng" />
      </div>

      {/* Footer product links */}
      <div style={s.card}>
        <SectionHead>Nhóm sản phẩm / hệ sinh thái</SectionHead>
        <div style={{ fontSize: "11.5px", color: A.textLight, marginBottom: "0.75rem", fontStyle: "italic" }}>Các sản phẩm hiển thị ở footer</div>
        <LinkList rows={footerProducts} setRows={setFooterProducts} addLabel="+ Thêm sản phẩm" />
      </div>

      {/* Extra links */}
      <div style={s.card}>
        <SectionHead>Link phụ (chính sách, điều khoản…)</SectionHead>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "0.75rem" }}>
          <div>
            <Lbl>Link 1 — nhãn</Lbl>
            <input style={s.field} value={settings["footer_extra_link_1_label"] ?? ""}
              placeholder="Chính sách bảo mật" onChange={(e) => setS("footer_extra_link_1_label", e.target.value)} />
          </div>
          <div>
            <Lbl>Link 1 — URL</Lbl>
            <input style={s.field} value={settings["footer_extra_link_1_url"] ?? ""}
              placeholder="/chinh-sach-bao-mat" onChange={(e) => setS("footer_extra_link_1_url", e.target.value)} />
          </div>
          <div>
            <Lbl>Link 2 — nhãn</Lbl>
            <input style={s.field} value={settings["footer_extra_link_2_label"] ?? ""}
              placeholder="Điều khoản sử dụng" onChange={(e) => setS("footer_extra_link_2_label", e.target.value)} />
          </div>
          <div>
            <Lbl>Link 2 — URL</Lbl>
            <input style={s.field} value={settings["footer_extra_link_2_url"] ?? ""}
              placeholder="/dieu-khoan-su-dung" onChange={(e) => setS("footer_extra_link_2_url", e.target.value)} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Social tab ───────────────────────────────────────────────────── */
function SocialTab({ settings, setS }: { settings: Record<string, string>; setS: (k: string, v: string) => void }) {
  const socials: { key: string; label: string; placeholder: string }[] = [
    { key: "social_facebook",  label: "Facebook",         placeholder: "https://facebook.com/..." },
    { key: "social_youtube",   label: "YouTube",          placeholder: "https://youtube.com/@..." },
    { key: "social_zalo",      label: "Zalo",             placeholder: "https://zalo.me/..." },
    { key: "social_telegram",  label: "Telegram",         placeholder: "https://t.me/..." },
    { key: "social_tiktok",    label: "TikTok",           placeholder: "https://tiktok.com/@..." },
    { key: "social_linkedin",  label: "LinkedIn",         placeholder: "https://linkedin.com/in/..." },
    { key: "social_email",     label: "Email liên hệ",    placeholder: "contact@example.com" },
    { key: "social_community", label: "Link cộng đồng chính", placeholder: "https://..." },
  ];

  return (
    <div style={s.card}>
      <SectionHead>Kênh mạng xã hội & liên kết</SectionHead>
      <p style={{ fontSize: "12px", color: A.textLight, margin: "0 0 1.125rem", fontStyle: "italic" }}>
        Để trống nếu kênh chưa có. Các link này được dùng trong navbar, footer và các CTA trên website.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
        {socials.map(({ key, label, placeholder }) => (
          <div key={key}>
            <Lbl>{label}</Lbl>
            <input style={s.field} type="text" value={settings[key] ?? ""}
              placeholder={placeholder} onChange={(e) => setS(key, e.target.value)} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Contact tab ──────────────────────────────────────────────────── */
function ContactTab({ settings, setS }: { settings: Record<string, string>; setS: (k: string, v: string) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.125rem" }}>
      <div style={s.card}>
        <SectionHead>Thông tin liên hệ chính</SectionHead>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <Lbl>Email chính</Lbl>
            <input style={s.field} value={settings["contact_email"] ?? ""}
              placeholder="contact@swc.vn" onChange={(e) => setS("contact_email", e.target.value)} />
          </div>
          <div>
            <Lbl>Số điện thoại</Lbl>
            <input style={s.field} value={settings["contact_phone"] ?? ""}
              placeholder="+84 xxx xxx xxx" onChange={(e) => setS("contact_phone", e.target.value)} />
          </div>
          <div>
            <Lbl>Zalo cá nhân</Lbl>
            <input style={s.field} value={settings["contact_zalo"] ?? ""}
              placeholder="0xxx..." onChange={(e) => setS("contact_zalo", e.target.value)} />
          </div>
          <div>
            <Lbl>Địa chỉ (nếu có)</Lbl>
            <input style={s.field} value={settings["contact_address"] ?? ""}
              placeholder="TP. Hồ Chí Minh, Việt Nam" onChange={(e) => setS("contact_address", e.target.value)} />
          </div>
        </div>
      </div>
      <div style={s.card}>
        <SectionHead>Ghi chú & thông tin bổ sung</SectionHead>
        <div>
          <Lbl>Ghi chú liên hệ</Lbl>
          <textarea style={{ ...s.textarea, height: "80px" }} value={settings["contact_note"] ?? ""}
            placeholder="Ví dụ: Thường phản hồi trong vòng 24 giờ trong ngày làm việc."
            onChange={(e) => setS("contact_note", e.target.value)} />
        </div>
        <div style={{ marginTop: "0.875rem" }}>
          <Lbl>Thông tin doanh nghiệp / đơn vị</Lbl>
          <input style={s.field} value={settings["contact_business"] ?? ""}
            placeholder="Tên đơn vị, mã số thuế nếu cần"
            onChange={(e) => setS("contact_business", e.target.value)} />
        </div>
      </div>
    </div>
  );
}

/* ── Form tab ─────────────────────────────────────────────────────── */
function FormTab({ settings, setS }: { settings: Record<string, string>; setS: (k: string, v: string) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.125rem" }}>
      <div style={s.card}>
        <SectionHead>Form liên hệ & CTA chính</SectionHead>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
          <div>
            <Lbl>Tiêu đề form</Lbl>
            <input style={{ ...s.field, fontWeight: 600 }} value={settings["form_cta_title"] ?? ""}
              placeholder="Để lại thông tin — tôi sẽ liên hệ bạn"
              onChange={(e) => setS("form_cta_title", e.target.value)} />
          </div>
          <div>
            <Lbl>Mô tả dưới tiêu đề</Lbl>
            <textarea style={{ ...s.textarea, height: "72px" }} value={settings["form_cta_subtitle"] ?? ""}
              placeholder="Điền thông tin để nhận tư vấn miễn phí..."
              onChange={(e) => setS("form_cta_subtitle", e.target.value)} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div>
              <Lbl>Text nút gửi</Lbl>
              <input style={s.field} value={settings["form_btn_text"] ?? ""}
                placeholder="Gửi thông tin" onChange={(e) => setS("form_btn_text", e.target.value)} />
            </div>
            <div>
              <Lbl>Ghi chú nhỏ dưới form</Lbl>
              <input style={s.field} value={settings["form_note_text"] ?? ""}
                placeholder="Miễn phí, không spam." onChange={(e) => setS("form_note_text", e.target.value)} />
            </div>
          </div>
        </div>
      </div>
      <div style={s.card}>
        <SectionHead>Tin nhắn phản hồi</SectionHead>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
          <div>
            <Lbl>Thông báo gửi thành công</Lbl>
            <input style={s.field} value={settings["form_success_msg"] ?? ""}
              placeholder="Cảm ơn bạn! Tôi sẽ liên hệ trong 24 giờ."
              onChange={(e) => setS("form_success_msg", e.target.value)} />
          </div>
          <div>
            <Lbl>Thông báo gửi lỗi</Lbl>
            <input style={s.field} value={settings["form_error_msg"] ?? ""}
              placeholder="Có lỗi xảy ra. Vui lòng thử lại hoặc liên hệ trực tiếp."
              onChange={(e) => setS("form_error_msg", e.target.value)} />
          </div>
          <div>
            <Lbl>Email nhận thông báo</Lbl>
            <input style={s.field} type="email" value={settings["form_recipient_email"] ?? ""}
              placeholder="admin@swc.vn" onChange={(e) => setS("form_recipient_email", e.target.value)} />
            <Hint text="Leads luôn được lưu vào database. Email này là để nhận thông báo khi có form mới." />
          </div>
        </div>
      </div>
      <div style={s.card}>
        <SectionHead>Nhãn nguồn mặc định</SectionHead>
        <p style={{ fontSize: "12px", color: A.textLight, margin: "0 0 1rem", fontStyle: "italic" }}>
          Giá trị nguồn được gán tự động khi form được gửi từ trang tương ứng.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: "0.875rem" }}>
          {[
            { key: "form_source_lien_he",   label: "Nguồn: trang Liên hệ",    placeholder: "lien-he" },
            { key: "form_source_cong_dong",  label: "Nguồn: trang Cộng đồng",  placeholder: "cong-dong" },
            { key: "form_source_tin_tuc",    label: "Nguồn: trang Tin tức",    placeholder: "tin-tuc" },
            { key: "form_source_san_pham",   label: "Nguồn: trang Sản phẩm",   placeholder: "san-pham" },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <Lbl>{label}</Lbl>
              <input style={{ ...s.field, fontFamily: "monospace", fontSize: "12px" }} value={settings[key] ?? ""}
                placeholder={placeholder} onChange={(e) => setS(key, e.target.value)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── SEO tab ──────────────────────────────────────────────────────── */
function SeoTab({ settings, setS }: { settings: Record<string, string>; setS: (k: string, v: string) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.125rem", maxWidth: "720px" }}>
      <div style={s.card}>
        <SectionHead>SEO toàn site</SectionHead>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <Lbl>Site title mặc định</Lbl>
            <input style={{ ...s.field, fontWeight: 600 }} value={settings["site_seo_title"] ?? ""}
              placeholder="Phan Văn Thắng SWC — Tư duy tài chính thực chiến"
              onChange={(e) => setS("site_seo_title", e.target.value)} />
            <Hint text={`${(settings["site_seo_title"] ?? "").length} / 60 ký tự · Khuyến nghị dưới 60`} />
          </div>
          <div>
            <Lbl>Meta description chung</Lbl>
            <textarea style={{ ...s.textarea, height: "80px" }} value={settings["site_seo_description"] ?? ""}
              placeholder="Chia sẻ kiến thức tài chính, đầu tư và phát triển bản thân..."
              onChange={(e) => setS("site_seo_description", e.target.value)} />
            <Hint text={`${(settings["site_seo_description"] ?? "").length} / 160 ký tự · Khuyến nghị 120–160`} />
          </div>
          <div>
            <Lbl>Keywords (SEO phụ)</Lbl>
            <input style={s.field} value={settings["site_seo_keywords"] ?? ""}
              placeholder="tài chính, đầu tư, tư duy, phát triển bản thân"
              onChange={(e) => setS("site_seo_keywords", e.target.value)} />
          </div>
          <div>
            <Lbl>OG Image URL (ảnh chia sẻ mặc định)</Lbl>
            <input style={s.field} value={settings["site_seo_og_image"] ?? ""}
              placeholder="https://..." onChange={(e) => setS("site_seo_og_image", e.target.value)} />
            {settings["site_seo_og_image"] && (
              <img src={settings["site_seo_og_image"]} alt="og preview"
                style={{ marginTop: "8px", width: "100%", maxWidth: "360px", aspectRatio: "1200/630", objectFit: "cover", borderRadius: "6px", border: `1px solid ${A.border}` }} />
            )}
            <Hint text="Khuyến nghị: 1200×630 px" />
          </div>
        </div>
      </div>
      <div style={s.card}>
        <SectionHead>Tracking & Analytics</SectionHead>
        <div>
          <Lbl>Google Analytics ID</Lbl>
          <input style={{ ...s.field, fontFamily: "monospace" }} value={settings["site_google_analytics"] ?? ""}
            placeholder="G-XXXXXXXXXX" onChange={(e) => setS("site_google_analytics", e.target.value)} />
          <Hint text="Thêm G- ID để kích hoạt Google Analytics 4. Để trống nếu chưa cần." />
        </div>
        <div style={{ marginTop: "0.875rem" }}>
          <Lbl>Favicon / Logo URL</Lbl>
          <input style={s.field} value={settings["site_favicon"] ?? ""}
            placeholder="https://... hoặc /favicon.ico"
            onChange={(e) => setS("site_favicon", e.target.value)} />
        </div>
      </div>
    </div>
  );
}

/* ── Main panel ─────────────────────────────────────────────────── */
export function SettingsPanel({ adminKey }: { adminKey: string }) {
  const [tab, setTab]         = useState<SettTab>("menu");
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [msg, setMsg]           = useState("");

  /* Complex state */
  const [navItems, setNavItems]         = useState<NavItem[]>(DEFAULT_NAV);
  const [footerNav, setFooterNav]       = useState<LinkRow[]>(DEFAULT_FOOTER_NAV);
  const [footerProducts, setFooterProducts] = useState<LinkRow[]>(DEFAULT_FOOTER_PRODUCTS);

  const setS = useCallback((key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  /* Load */
  useEffect(() => {
    adminApi.getSettings(adminKey).then((data) => {
      const coerced: Record<string, string> = {};
      Object.entries(data).forEach(([k, v]) => { coerced[k] = v ?? ""; });
      setSettings(coerced);

      const nav = safeJson<NavItem[]>(data["site_nav_items"] ?? null, []);
      if (nav.length > 0) setNavItems(nav.map((x, i) => ({ ...x, id: x.id || uid(), order: i + 1, children: (x.children ?? []).map((c) => ({ ...c, id: c.id || uid() })) })));

      const fn = safeJson<LinkRow[]>(data["footer_nav_links"] ?? null, []);
      if (fn.length > 0) setFooterNav(fn.map((r) => ({ ...r, id: r.id || uid() })));

      const fp = safeJson<LinkRow[]>(data["footer_product_links"] ?? null, []);
      if (fp.length > 0) setFooterProducts(fp.map((r) => ({ ...r, id: r.id || uid() })));
    }).finally(() => setLoading(false));
  }, [adminKey]);

  /* Save */
  const save = async () => {
    setSaving(true); setMsg("");
    try {
      const payload: Record<string, string> = {
        ...settings,
        site_nav_items:       JSON.stringify(navItems),
        footer_nav_links:     JSON.stringify(footerNav),
        footer_product_links: JSON.stringify(footerProducts),
      };
      await adminApi.updateSettings(adminKey, payload);
      setMsg("Đã lưu cài đặt.");
    } catch (e) { setMsg(String(e)); }
    finally { setSaving(false); }
  };

  if (loading) return <p style={{ fontSize: "13px", color: A.textMuted }}>Đang tải...</p>;

  return (
    <div>
      {/* Header */}
      <div style={{ ...s.sectionHeader, marginBottom: "1.25rem" }}>
        <div>
          <h2 style={{ ...s.sectionTitle, margin: "0 0 4px" }}>Cài đặt website</h2>
          <p style={{ fontSize: "13px", color: A.textMuted, margin: 0 }}>
            Quản lý các thành phần dùng chung trên toàn bộ website
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          {msg && (
            <span style={{ fontSize: "12.5px", color: msg.startsWith("Đã") ? A.primary : A.danger }}>
              {msg}
            </span>
          )}
          <button style={s.btnPrimary} disabled={saving} onClick={save}>
            {saving ? "Đang lưu..." : "Lưu tất cả"}
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <TabBar tab={tab} setTab={setTab} />

      {/* Tab content */}
      {tab === "menu" && <MenuTab navItems={navItems} setNavItems={setNavItems} />}

      {tab === "footer" && (
        <FooterTab
          settings={settings} setS={setS}
          footerNav={footerNav} setFooterNav={setFooterNav}
          footerProducts={footerProducts} setFooterProducts={setFooterProducts}
        />
      )}

      {tab === "social"  && <SocialTab  settings={settings} setS={setS} />}
      {tab === "contact" && <ContactTab settings={settings} setS={setS} />}
      {tab === "form"    && <FormTab    settings={settings} setS={setS} />}
      {tab === "seo"     && <SeoTab     settings={settings} setS={setS} />}
    </div>
  );
}
