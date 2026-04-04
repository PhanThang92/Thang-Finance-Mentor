import React, { useState, useEffect } from "react";
import { DashboardPanel }  from "./admin/DashboardPanel";
import { PostsPanel }      from "./admin/PostsPanel";
import { CategoriesPanel } from "./admin/CategoriesPanel";
import { TagsPanel }       from "./admin/TagsPanel";
import { ProductsPanel }   from "./admin/ProductsPanel";
import { LeadsPanel }      from "./admin/LeadsPanel";
import { CommunityPanel }  from "./admin/CommunityPanel";
import { SettingsPanel }   from "./admin/SettingsPanel";
import { ArticlesPanel }   from "./admin/ArticlesPanel";
import { VideosPanel }     from "./admin/VideosPanel";
import { A }               from "./admin/shared";

/* ── Types ────────────────────────────────────────────────────────── */
type Section =
  | "dashboard"
  | "posts"
  | "categories"
  | "tags"
  | "products"
  | "leads"
  | "community"
  | "settings"
  | "account"
  | "articles"
  | "videos";

interface NavItem { id: Section; label: string; icon: string; }
type NavGroup = { group: string; items: NavItem[] };

const NAV_STRUCTURE: NavGroup[] = [
  {
    group: "",
    items: [
      { id: "dashboard", label: "Tổng quan", icon: "◻" },
    ],
  },
  {
    group: "Tin tức",
    items: [
      { id: "posts",      label: "Bài viết",    icon: "≡" },
      { id: "categories", label: "Chuyên mục",  icon: "⊞" },
      { id: "tags",       label: "Tags",         icon: "#" },
    ],
  },
  {
    group: "Kiến thức",
    items: [
      { id: "articles", label: "Bài viết KB",  icon: "📄" },
      { id: "videos",   label: "Video",         icon: "▶" },
    ],
  },
  {
    group: "Hệ sinh thái",
    items: [
      { id: "products", label: "Sản phẩm", icon: "◈" },
      { id: "leads",    label: "Leads",    icon: "◉" },
    ],
  },
  {
    group: "Vận hành",
    items: [
      { id: "community", label: "Cộng đồng", icon: "◎" },
      { id: "settings",  label: "Cài đặt",   icon: "⚙" },
    ],
  },
  {
    group: "Hệ thống",
    items: [
      { id: "account", label: "Tài khoản", icon: "○" },
    ],
  },
];

const SECTION_TITLES: Record<Section, string> = {
  dashboard:  "Tổng quan",
  posts:      "Bài viết (Tin tức)",
  categories: "Chuyên mục",
  tags:       "Tags",
  products:   "Sản phẩm",
  leads:      "Leads",
  community:  "Cộng đồng",
  settings:   "Cài đặt",
  account:    "Tài khoản",
  articles:   "Kiến thức · Bài viết",
  videos:     "Kiến thức · Video",
};

const STORAGE_KEY = "swc_admin_key";

/* Sections that use full-height edge-to-edge layout (no inner padding) */
const FULL_HEIGHT_SECTIONS: Section[] = ["leads"];

/* ── Login ────────────────────────────────────────────────────────── */
function LoginScreen({ onLogin }: { onLogin: (key: string) => void }) {
  const [key, setKey]   = useState("");
  const [err, setErr]   = useState("");
  const [busy, setBusy] = useState(false);

  const attempt = async () => {
    if (!key.trim()) { setErr("Nhập admin key."); return; }
    setBusy(true); setErr("");
    try {
      const r = await fetch("/api/admin/dashboard", { headers: { Authorization: `Bearer ${key.trim()}` } });
      if (!r.ok) { setErr("Admin key không đúng."); return; }
      localStorage.setItem(STORAGE_KEY, key.trim());
      onLogin(key.trim());
    } catch { setErr("Không kết nối được server."); }
    finally { setBusy(false); }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: A.bg, fontFamily: "'Be Vietnam Pro', sans-serif" }}>
      <div style={{ width: "360px", background: "#fff", borderRadius: "12px", border: `1px solid ${A.border}`, padding: "2.5rem 2rem", boxShadow: "0 4px 32px rgba(0,0,0,0.07)" }}>
        <div style={{ marginBottom: "2rem", textAlign: "center" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: `linear-gradient(140deg, #22917f, #1a7868)`, margin: "0 auto 1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontSize: "18px", fontWeight: 700 }}>S</span>
          </div>
          <p style={{ fontSize: "18px", fontWeight: 800, color: A.text, margin: "0 0 4px" }}>Thắng SWC</p>
          <p style={{ fontSize: "13px", color: A.textMuted, margin: 0 }}>Khu vực quản trị</p>
        </div>
        {err && (
          <div style={{ background: "rgba(193,51,51,0.07)", border: "1px solid rgba(193,51,51,0.20)", borderRadius: "7px", padding: "9px 12px", fontSize: "13px", color: A.danger, marginBottom: "1rem" }}>
            {err}
          </div>
        )}
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.10em", textTransform: "uppercase", color: A.textMuted, display: "block", marginBottom: "6px" }}>Admin Key</label>
          <input
            type="password" value={key}
            onChange={(e) => setKey(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && attempt()}
            placeholder="••••••••••••••"
            style={{ width: "100%", height: "42px", padding: "0 12px", borderRadius: "8px", border: `1px solid ${A.border}`, fontSize: "14px", outline: "none", boxSizing: "border-box", background: A.bg }}
          />
        </div>
        <button disabled={busy} onClick={attempt}
          style={{ width: "100%", height: "42px", borderRadius: "8px", border: "none", cursor: busy ? "not-allowed" : "pointer", fontSize: "14px", fontWeight: 600, background: `linear-gradient(140deg, #22917f, #1a7868)`, color: "#fff", opacity: busy ? 0.7 : 1 }}>
          {busy ? "Đang kiểm tra..." : "Đăng nhập"}
        </button>
      </div>
    </div>
  );
}

/* ── Account panel ────────────────────────────────────────────────── */
function AccountPanel({ adminKey, onLogout }: { adminKey: string; onLogout: () => void }) {
  const [newKey, setNewKey] = useState("");
  const [msg, setMsg]       = useState("");

  const changeKey = () => {
    if (!newKey.trim() || newKey.length < 8) { setMsg("Key phải có ít nhất 8 ký tự."); return; }
    localStorage.setItem(STORAGE_KEY, newKey.trim());
    setMsg("Admin key đã được cập nhật (chỉ trên trình duyệt này). Reload để đăng nhập lại.");
  };

  return (
    <div style={{ maxWidth: "480px" }}>
      {/* Info card */}
      <div style={{ background: "#fff", borderRadius: "10px", border: `1px solid ${A.border}`, padding: "1.5rem", marginBottom: "1rem" }}>
        <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: A.textMuted, margin: "0 0 1rem" }}>
          Admin key hiện tại
        </p>
        <p style={{ fontSize: "13px", color: A.text, margin: "0 0 1.5rem", background: A.bg, padding: "8px 12px", borderRadius: "7px", fontFamily: "monospace" }}>
          {adminKey.slice(0, 4)}{"•".repeat(Math.max(0, adminKey.length - 4))}
        </p>
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: A.textMuted, display: "block", marginBottom: "5px" }}>Key mới</label>
          <input type="password" value={newKey} onChange={(e) => setNewKey(e.target.value)} placeholder="••••••••"
            style={{ width: "100%", padding: "8px 11px", borderRadius: "7px", border: `1px solid ${A.border}`, fontSize: "13.5px", outline: "none", boxSizing: "border-box" }} />
        </div>
        {msg && <p style={{ fontSize: "12.5px", color: msg.startsWith("Admin key đã") ? A.primary : A.danger, margin: "0 0 1rem" }}>{msg}</p>}
        <button onClick={changeKey} style={{ padding: "8px 20px", borderRadius: "7px", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 600, background: A.primary, color: "#fff" }}>
          Cập nhật key
        </button>
      </div>

      {/* Server env note */}
      <div style={{ background: "#fff", borderRadius: "10px", border: `1px solid ${A.border}`, padding: "1.5rem", marginBottom: "1rem" }}>
        <p style={{ fontSize: "13px", color: A.text, margin: "0 0 1rem", lineHeight: 1.6 }}>
          Để thay đổi admin key trên server, cập nhật biến môi trường{" "}
          <code style={{ background: A.bg, padding: "1px 5px", borderRadius: "4px" }}>ADMIN_KEY</code>{" "}
          và khởi động lại server.
        </p>
        <p style={{ fontSize: "12px", color: A.textMuted, margin: "0 0 1rem", lineHeight: 1.6 }}>
          Key mặc định nếu chưa cài biến môi trường: <code style={{ background: A.bg, padding: "1px 5px", borderRadius: "4px" }}>swc-admin-2026</code>
        </p>
        <button onClick={onLogout} style={{ padding: "8px 20px", borderRadius: "7px", border: `1px solid rgba(193,51,51,0.30)`, cursor: "pointer", fontSize: "13px", fontWeight: 500, background: "transparent", color: A.danger }}>
          Đăng xuất
        </button>
      </div>

      {/* Admin users note */}
      <div style={{ background: "#fff", borderRadius: "10px", border: `1px solid ${A.border}`, padding: "1.5rem" }}>
        <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: A.textMuted, margin: "0 0 0.875rem" }}>
          Quản lý tài khoản
        </p>
        <p style={{ fontSize: "12.5px", color: A.textMuted, margin: 0, lineHeight: 1.65 }}>
          Hệ thống hiện chạy với một admin key duy nhất (single-user mode). 
          Nếu cần nhiều vai trò admin khác nhau, hãy liên hệ dev để mở rộng hệ thống xác thực.
        </p>
      </div>
    </div>
  );
}

/* ── Main Admin shell ─────────────────────────────────────────────── */
export default function Admin() {
  const [adminKey, setAdminKey] = useState<string | null>(null);
  const [section, setSection]   = useState<Section>("dashboard");
  const [newLeads, setNewLeads] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setAdminKey(stored);
  }, []);

  useEffect(() => {
    if (!adminKey) return;
    fetch("/api/admin/dashboard", { headers: { Authorization: `Bearer ${adminKey}` } })
      .then((r) => r.json())
      .then((d) => setNewLeads(d.newLeads ?? 0))
      .catch(() => {});
  }, [adminKey, section]);

  const logout = () => { localStorage.removeItem(STORAGE_KEY); setAdminKey(null); };

  if (!adminKey) return <LoginScreen onLogin={(k) => setAdminKey(k)} />;

  const isFullHeight = FULL_HEIGHT_SECTIONS.includes(section);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: A.bg, fontFamily: "'Be Vietnam Pro', sans-serif" }}>

      {/* ── Top bar ─────────────────────────────────────────────────── */}
      <header style={{
        height: "52px", flexShrink: 0,
        background: "#fff", borderBottom: `1px solid ${A.border}`,
        display: "flex", alignItems: "center",
        padding: "0 1.25rem 0 0",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        {/* Brand — matches sidebar width */}
        <div style={{
          width: "220px", flexShrink: 0,
          display: "flex", alignItems: "center", gap: "0.625rem",
          padding: "0 1.25rem", height: "100%",
          borderRight: `1px solid ${A.border}`,
        }}>
          <div style={{ width: "26px", height: "26px", borderRadius: "7px", background: "linear-gradient(140deg, #22917f, #1a7868)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ color: "#fff", fontSize: "12px", fontWeight: 700 }}>S</span>
          </div>
          <div>
            <p style={{ fontSize: "12.5px", fontWeight: 700, color: A.text, margin: 0, lineHeight: 1.2 }}>Thắng SWC</p>
            <p style={{ fontSize: "9.5px", fontWeight: 600, color: A.primary, margin: 0, letterSpacing: "0.08em", textTransform: "uppercase" }}>Admin</p>
          </div>
        </div>

        {/* Page title */}
        <div style={{ flex: 1, padding: "0 1.5rem" }}>
          <p style={{ fontSize: "14px", fontWeight: 600, color: A.text, margin: 0 }}>
            {SECTION_TITLES[section]}
          </p>
        </div>

        {/* Right actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <a
            href="/"
            target="_blank"
            rel="noopener"
            style={{
              fontSize: "12.5px", fontWeight: 500, color: A.textMuted, textDecoration: "none",
              padding: "5px 12px", borderRadius: "6px", border: `1px solid ${A.border}`,
              display: "flex", alignItems: "center", gap: "5px",
            }}
          >
            <span style={{ fontSize: "10px" }}>↗</span> Xem website
          </a>
          <button
            onClick={logout}
            style={{
              fontSize: "12.5px", fontWeight: 500, color: A.danger, background: "transparent",
              border: `1px solid rgba(193,51,51,0.25)`, borderRadius: "6px",
              padding: "5px 12px", cursor: "pointer",
            }}
          >
            Thoát
          </button>
        </div>
      </header>

      {/* ── Body ────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", minHeight: 0, overflow: "hidden" }}>

        {/* ── Sidebar ─────────────────────────────────────────────── */}
        <aside style={{
          width: "220px", flexShrink: 0,
          background: "#fff", borderRight: `1px solid ${A.border}`,
          display: "flex", flexDirection: "column",
          position: "sticky", top: "52px", height: "calc(100vh - 52px)",
          overflowY: "auto",
        }}>
          <nav style={{ flex: 1, padding: "0.875rem 0.625rem 1rem" }}>
            {NAV_STRUCTURE.map((group, gi) => (
              <div key={gi} style={{ marginBottom: "0.5rem" }}>
                {group.group && (
                  <p style={{
                    fontSize: "9.5px", fontWeight: 700, letterSpacing: "0.14em",
                    textTransform: "uppercase", color: A.textLight,
                    margin: gi === 0 ? "0 0 4px 10px" : "12px 0 4px 10px",
                  }}>
                    {group.group}
                  </p>
                )}
                {group.items.map((item) => {
                  const active = section === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setSection(item.id)}
                      style={{
                        width: "100%", display: "flex", alignItems: "center", gap: "0.625rem",
                        padding: "7px 10px 7px 8px",
                        borderRadius: "7px", border: "none", cursor: "pointer", textAlign: "left",
                        background: active ? `${A.primary}12` : "transparent",
                        color: active ? A.primary : A.textMuted,
                        fontWeight: active ? 600 : 400, fontSize: "13px",
                        transition: "background 0.12s ease, color 0.12s ease",
                        marginBottom: "1px", position: "relative",
                      }}
                    >
                      {active && (
                        <span style={{
                          position: "absolute", left: 0, top: "5px", bottom: "5px",
                          width: "3px", borderRadius: "0 2px 2px 0", background: A.primary,
                        }} />
                      )}
                      <span style={{ fontSize: "13px", flexShrink: 0, width: "18px", textAlign: "center", opacity: active ? 1 : 0.55 }}>
                        {item.icon}
                      </span>
                      <span style={{ flex: 1 }}>{item.label}</span>
                      {item.id === "leads" && newLeads > 0 && (
                        <span style={{
                          fontSize: "10px", fontWeight: 700, background: "#dc2626", color: "#fff",
                          padding: "1px 6px", borderRadius: "999px", lineHeight: 1.6, flexShrink: 0,
                        }}>
                          {newLeads}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>

          <div style={{ padding: "0.75rem 1rem", borderTop: `1px solid ${A.border}` }}>
            <p style={{ fontSize: "10.5px", color: A.textLight, margin: 0 }}>Thắng SWC Admin · 2026</p>
          </div>
        </aside>

        {/* ── Content ──────────────────────────────────────────────── */}
        <main style={{
          flex: 1, minWidth: 0,
          overflowY: isFullHeight ? "hidden" : "auto",
          padding: isFullHeight ? 0 : "1.75rem 2rem 3rem",
        }}>
          {section === "dashboard"  && <DashboardPanel  adminKey={adminKey} onNavigate={setSection} />}
          {section === "posts"      && <PostsPanel      adminKey={adminKey} />}
          {section === "categories" && <CategoriesPanel adminKey={adminKey} />}
          {section === "tags"       && <TagsPanel       adminKey={adminKey} />}
          {section === "products"   && <ProductsPanel   adminKey={adminKey} />}
          {section === "leads"      && <LeadsPanel      adminKey={adminKey} />}
          {section === "community"  && <CommunityPanel  adminKey={adminKey} />}
          {section === "settings"   && <SettingsPanel   adminKey={adminKey} />}
          {section === "account"    && <AccountPanel    adminKey={adminKey} onLogout={logout} />}
          {section === "articles"   && <ArticlesPanel   adminKey={adminKey} />}
          {section === "videos"     && <VideosPanel     adminKey={adminKey} />}
        </main>
      </div>
    </div>
  );
}
