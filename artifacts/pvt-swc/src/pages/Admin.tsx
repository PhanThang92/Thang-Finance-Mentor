import React, { useState, useEffect } from "react";
import { DashboardPanel } from "./admin/DashboardPanel";
import { PostsPanel }     from "./admin/PostsPanel";
import { TaxonomyPanel }  from "./admin/TaxonomyPanel";
import { ProductsPanel }  from "./admin/ProductsPanel";
import { LeadsPanel }     from "./admin/LeadsPanel";
import { SettingsPanel }  from "./admin/SettingsPanel";
import { A }              from "./admin/shared";

/* ── Types ────────────────────────────────────────────────────────── */
type Section = "dashboard" | "posts" | "taxonomy" | "products" | "leads" | "settings" | "account";

interface NavItem { id: Section; label: string; icon: string; }
const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard",        icon: "◎" },
  { id: "posts",     label: "Bài viết",          icon: "✦" },
  { id: "taxonomy",  label: "Chuyên mục & Tags", icon: "⊞" },
  { id: "products",  label: "Sản phẩm",          icon: "◈" },
  { id: "leads",     label: "Leads",             icon: "◉" },
  { id: "settings",  label: "Cài đặt",           icon: "⚙" },
  { id: "account",   label: "Tài khoản",         icon: "○" },
];

const STORAGE_KEY = "swc_admin_key";
const DEFAULT_KEY = "swc-admin-2026";

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
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: A.bg }}>
      <div style={{ width: "360px", background: "#fff", borderRadius: "12px", border: `1px solid ${A.border}`, padding: "2.5rem 2rem", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
        <div style={{ marginBottom: "2rem", textAlign: "center" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: `linear-gradient(140deg, #22917f, #1a7868)`, margin: "0 auto 1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontSize: "18px", fontWeight: 700 }}>S</span>
          </div>
          <p style={{ fontSize: "18px", fontWeight: 800, color: A.text, margin: "0 0 4px" }}>Thắng SWC</p>
          <p style={{ fontSize: "13px", color: A.textMuted, margin: 0 }}>Khu vực quản trị</p>
        </div>
        {err && <div style={{ background: "rgba(193,51,51,0.07)", border: "1px solid rgba(193,51,51,0.20)", borderRadius: "7px", padding: "9px 12px", fontSize: "13px", color: A.danger, marginBottom: "1rem" }}>{err}</div>}
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.10em", textTransform: "uppercase", color: A.textMuted, display: "block", marginBottom: "6px" }}>Admin Key</label>
          <input
            type="password" value={key} onChange={(e) => setKey(e.target.value)}
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
    <div style={{ maxWidth: "460px" }}>
      <h2 style={{ fontSize: "16px", fontWeight: 700, color: A.text, margin: "0 0 1.5rem" }}>Tài khoản</h2>
      <div style={{ background: "#fff", borderRadius: "10px", border: `1px solid ${A.border}`, padding: "1.5rem", marginBottom: "1rem" }}>
        <p style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: A.textMuted, margin: "0 0 1rem" }}>Admin key hiện tại</p>
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
      <div style={{ background: "#fff", borderRadius: "10px", border: `1px solid ${A.border}`, padding: "1.5rem" }}>
        <p style={{ fontSize: "13px", color: A.text, margin: "0 0 1rem" }}>Để thay đổi admin key trên server, cập nhật biến môi trường <code style={{ background: A.bg, padding: "1px 5px", borderRadius: "4px" }}>ADMIN_KEY</code> và khởi động lại server.</p>
        <button onClick={onLogout} style={{ padding: "8px 20px", borderRadius: "7px", border: `1px solid rgba(193,51,51,0.30)`, cursor: "pointer", fontSize: "13px", fontWeight: 500, background: "transparent", color: A.danger }}>
          Đăng xuất
        </button>
      </div>
    </div>
  );
}

/* ── Main Admin ───────────────────────────────────────────────────── */
export default function Admin() {
  const [adminKey, setAdminKey] = useState<string | null>(null);
  const [section, setSection]   = useState<Section>("dashboard");
  const [newLeads, setNewLeads] = useState(0);

  /* Restore key from storage */
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setAdminKey(stored);
  }, []);

  /* Refresh new leads badge */
  useEffect(() => {
    if (!adminKey) return;
    fetch("/api/admin/dashboard", { headers: { Authorization: `Bearer ${adminKey}` } })
      .then((r) => r.json())
      .then((d) => setNewLeads(d.newLeads ?? 0))
      .catch(() => {});
  }, [adminKey, section]);

  const logout = () => { localStorage.removeItem(STORAGE_KEY); setAdminKey(null); };

  if (!adminKey) return <LoginScreen onLogin={(k) => setAdminKey(k)} />;

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: A.bg, fontFamily: "'Be Vietnam Pro', sans-serif" }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: "220px", flexShrink: 0, background: "#fff",
        borderRight: `1px solid ${A.border}`, display: "flex", flexDirection: "column",
        position: "sticky", top: 0, height: "100vh", overflowY: "auto",
      }}>
        {/* Brand */}
        <div style={{ padding: "1.25rem 1.25rem 1rem", borderBottom: `1px solid ${A.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "7px", background: `linear-gradient(140deg, #22917f, #1a7868)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ color: "#fff", fontSize: "13px", fontWeight: 700 }}>S</span>
            </div>
            <div>
              <p style={{ fontSize: "13px", fontWeight: 700, color: A.text, margin: 0, lineHeight: 1.2 }}>Thắng SWC</p>
              <p style={{ fontSize: "10px", color: A.textMuted, margin: 0 }}>Admin</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "0.75rem 0.625rem" }}>
          {NAV_ITEMS.map((item) => {
            const active = section === item.id;
            return (
              <button key={item.id} onClick={() => setSection(item.id)} style={{
                width: "100%", display: "flex", alignItems: "center", gap: "0.625rem",
                padding: "8px 10px", borderRadius: "7px", border: "none", cursor: "pointer", textAlign: "left",
                background: active ? `${A.primary}14` : "transparent",
                color: active ? A.primary : A.textMuted,
                fontWeight: active ? 600 : 400, fontSize: "13px",
                transition: "background 0.14s ease, color 0.14s ease",
                marginBottom: "2px",
              }}>
                <span style={{ fontSize: "12px", opacity: 0.8, flexShrink: 0 }}>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.id === "leads" && newLeads > 0 && (
                  <span style={{ fontSize: "10px", fontWeight: 700, background: "#dc2626", color: "#fff", padding: "1px 6px", borderRadius: "999px", lineHeight: 1.6 }}>{newLeads}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding: "0.875rem 1rem", borderTop: `1px solid ${A.border}` }}>
          <a href="/tin-tuc" target="_blank" rel="noopener" style={{ fontSize: "11.5px", color: A.textLight, textDecoration: "none", display: "block", marginBottom: "6px" }}>→ Xem trang web</a>
          <button onClick={logout} style={{ fontSize: "11.5px", color: A.danger, background: "none", border: "none", cursor: "pointer", padding: 0 }}>Đăng xuất</button>
        </div>
      </aside>

      {/* ── Content ── */}
      <main style={{ flex: 1, minWidth: 0, padding: "2rem", overflowY: "auto" }}>
        {/* Section header breadcrumb */}
        <div style={{ marginBottom: "1.75rem" }}>
          <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: A.textLight, margin: "0 0 2px" }}>
            {NAV_ITEMS.find((n) => n.id === section)?.label}
          </p>
        </div>

        {section === "dashboard" && <DashboardPanel adminKey={adminKey} />}
        {section === "posts"     && <PostsPanel     adminKey={adminKey} />}
        {section === "taxonomy"  && <TaxonomyPanel  adminKey={adminKey} />}
        {section === "products"  && <ProductsPanel  adminKey={adminKey} />}
        {section === "leads"     && <LeadsPanel     adminKey={adminKey} />}
        {section === "settings"  && <SettingsPanel  adminKey={adminKey} />}
        {section === "account"   && <AccountPanel   adminKey={adminKey} onLogout={logout} />}
      </main>
    </div>
  );
}
