import React, { useEffect, useState } from "react";
import { adminApi, type DashboardData, type NewsProduct } from "@/lib/newsApi";
import { A, fmtDate, leadStatusLabel, leadStatusColor } from "./shared";

type Section = "dashboard" | "posts" | "categories" | "tags" | "products" | "leads" | "community" | "settings" | "account";

/* ── Quick action button ─────────────────────────────────────────── */
function QuickAction({
  icon, label, sub, onClick,
}: { icon: string; label: string; sub: string; onClick: () => void }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        flex: 1, minWidth: "160px",
        display: "flex", alignItems: "center", gap: "0.75rem",
        padding: "0.875rem 1rem",
        background: hov ? `${A.primary}0d` : "#fff",
        border: `1px solid ${hov ? A.primary + "40" : A.border}`,
        borderRadius: "9px", cursor: "pointer", textAlign: "left",
        transition: "all 0.15s ease",
      }}
    >
      <span style={{
        width: "32px", height: "32px", borderRadius: "8px",
        background: `${A.primary}14`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "15px", flexShrink: 0, color: A.primary,
      }}>
        {icon}
      </span>
      <div>
        <p style={{ fontSize: "13px", fontWeight: 600, color: A.text, margin: 0, lineHeight: 1.3 }}>{label}</p>
        <p style={{ fontSize: "11px", color: A.textLight, margin: 0 }}>{sub}</p>
      </div>
    </button>
  );
}

/* ── Stat card ───────────────────────────────────────────────────── */
function StatCard({
  label, value, sub, accentColor,
}: { label: string; value: number; sub?: string; accentColor: string }) {
  return (
    <div style={{
      background: "#fff", borderRadius: "10px", border: `1px solid ${A.border}`,
      padding: "1.125rem 1.25rem",
      borderLeft: `3px solid ${accentColor}`,
      display: "flex", flexDirection: "column", gap: "0.375rem",
    }}>
      <p style={{ fontSize: "10.5px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: A.textLight, margin: 0 }}>
        {label}
      </p>
      <p style={{ fontSize: "26px", fontWeight: 800, color: accentColor, margin: 0, lineHeight: 1 }}>
        {value}
      </p>
      {sub && (
        <p style={{ fontSize: "11px", color: A.textLight, margin: 0 }}>{sub}</p>
      )}
    </div>
  );
}

/* ── Post status pill ────────────────────────────────────────────── */
function StatusPill({ status }: { status: string }) {
  const published = status === "published";
  return (
    <span style={{
      display: "inline-block",
      fontSize: "9.5px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
      padding: "2px 7px", borderRadius: "4px", flexShrink: 0,
      background: published ? "rgba(26,120,104,0.10)" : "rgba(0,0,0,0.06)",
      color: published ? A.primary : A.textMuted,
    }}>
      {published ? "Đã đăng" : "Nháp"}
    </span>
  );
}

/* ── Lead status pill ────────────────────────────────────────────── */
function LeadPill({ status }: { status: string }) {
  const color = leadStatusColor(status);
  return (
    <span style={{
      display: "inline-block",
      fontSize: "9.5px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
      padding: "2px 7px", borderRadius: "4px",
      background: `${color}18`, color,
    }}>
      {leadStatusLabel(status)}
    </span>
  );
}

/* ── Main ────────────────────────────────────────────────────────── */
export function DashboardPanel({
  adminKey,
  onNavigate,
}: {
  adminKey: string;
  onNavigate: (s: Section) => void;
}) {
  const [data, setData]           = useState<DashboardData | null>(null);
  const [products, setProducts]   = useState<NewsProduct[]>([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([
      adminApi.getDashboard(adminKey),
      adminApi.getMeta(adminKey),
    ]).then(([dash, meta]) => {
      setData(dash);
      setProducts(meta.products);
    }).catch(console.error).finally(() => setLoading(false));
  }, [adminKey]);

  if (loading) return (
    <div style={{ padding: "2rem 0", color: A.textMuted, fontSize: "13px" }}>Đang tải...</div>
  );
  if (!data) return (
    <div style={{ padding: "2rem 0", color: A.danger, fontSize: "13px" }}>Không tải được dữ liệu.</div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", maxWidth: "960px" }}>

      {/* ── Quick actions ─────────────────────────────────────────── */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
        <QuickAction
          icon="＋"
          label="Tạo bài viết mới"
          sub="Soạn và xuất bản nội dung"
          onClick={() => onNavigate("posts")}
        />
        <QuickAction
          icon="◈"
          label="Cập nhật sản phẩm"
          sub="Chỉnh thông tin, giá, link"
          onClick={() => onNavigate("products")}
        />
        <QuickAction
          icon="◉"
          label={data.newLeads > 0 ? `${data.newLeads} lead mới` : "Xem leads"}
          sub={data.newLeads > 0 ? "Cần xử lý" : "Quản lý danh sách"}
          onClick={() => onNavigate("leads")}
        />
        <QuickAction
          icon="◎"
          label="Cộng đồng"
          sub="Cập nhật nội dung & liên kết"
          onClick={() => onNavigate("community")}
        />
      </div>

      {/* ── Stat cards ───────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "0.875rem" }}>
        <StatCard
          label="Bài đã đăng"
          value={data.publishedCount}
          sub="Bài viết công khai"
          accentColor={A.primary}
        />
        <StatCard
          label="Bản nháp"
          value={data.draftCount}
          sub="Chưa xuất bản"
          accentColor="#6b7280"
        />
        <StatCard
          label="Sản phẩm"
          value={data.productCount}
          sub="Đang hoạt động"
          accentColor="#7c3aed"
        />
        <StatCard
          label="Tổng leads"
          value={data.totalLeads}
          sub="Từ tất cả nguồn"
          accentColor="#d97706"
        />
        <StatCard
          label="Leads mới"
          value={data.newLeads}
          sub="Chờ liên hệ"
          accentColor={data.newLeads > 0 ? "#dc2626" : "#6b7280"}
        />
      </div>

      {/* ── Recent panels ────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>

        {/* Recent posts */}
        <div style={{ background: "#fff", borderRadius: "10px", border: `1px solid ${A.border}`, overflow: "hidden" }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "1rem 1.25rem 0.875rem", borderBottom: `1px solid ${A.border}`,
          }}>
            <p style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: A.textMuted, margin: 0 }}>
              Bài viết gần đây
            </p>
            <button
              onClick={() => onNavigate("posts")}
              style={{ fontSize: "11.5px", color: A.primary, background: "none", border: "none", cursor: "pointer", padding: 0, fontWeight: 500 }}
            >
              Xem tất cả →
            </button>
          </div>
          <div style={{ padding: "0.25rem 0" }}>
            {data.recentPosts.length === 0
              ? <p style={{ fontSize: "13px", color: A.textLight, padding: "1rem 1.25rem", margin: 0 }}>Chưa có bài viết.</p>
              : data.recentPosts.map((p, i) => (
                <div key={p.id} style={{
                  display: "flex", alignItems: "flex-start", gap: "0.75rem",
                  padding: "0.75rem 1.25rem",
                  borderBottom: i < data.recentPosts.length - 1 ? `1px solid rgba(0,0,0,0.04)` : "none",
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: "12.5px", fontWeight: 500, color: A.text, margin: "0 0 4px",
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}>
                      {p.title}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                      <StatusPill status={p.status} />
                      {p.categoryName && <span style={{ fontSize: "10.5px", color: A.textLight }}>{p.categoryName}</span>}
                    </div>
                  </div>
                  <p style={{ fontSize: "10.5px", color: A.textLight, flexShrink: 0, margin: "2px 0 0" }}>
                    {fmtDate(p.updatedAt ?? p.createdAt)}
                  </p>
                </div>
              ))
            }
          </div>
        </div>

        {/* Recent leads */}
        <div style={{ background: "#fff", borderRadius: "10px", border: `1px solid ${A.border}`, overflow: "hidden" }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "1rem 1.25rem 0.875rem", borderBottom: `1px solid ${A.border}`,
          }}>
            <p style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: A.textMuted, margin: 0 }}>
              Leads gần đây
            </p>
            <button
              onClick={() => onNavigate("leads")}
              style={{ fontSize: "11.5px", color: A.primary, background: "none", border: "none", cursor: "pointer", padding: 0, fontWeight: 500 }}
            >
              Xem tất cả →
            </button>
          </div>
          <div style={{ padding: "0.25rem 0" }}>
            {data.recentLeads.length === 0
              ? <p style={{ fontSize: "13px", color: A.textLight, padding: "1rem 1.25rem", margin: 0 }}>Chưa có leads.</p>
              : data.recentLeads.map((l, i) => (
                <div key={l.id} style={{
                  display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.75rem",
                  padding: "0.75rem 1.25rem",
                  borderBottom: i < data.recentLeads.length - 1 ? `1px solid rgba(0,0,0,0.04)` : "none",
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "12.5px", fontWeight: 600, color: A.text, margin: "0 0 4px" }}>{l.name}</p>
                    <p style={{ fontSize: "11px", color: A.textMuted, margin: 0 }}>
                      {l.phone ?? l.email ?? "—"}
                      {l.productRef && <span style={{ marginLeft: "6px", color: A.textLight }}>· {l.productRef}</span>}
                    </p>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <LeadPill status={l.status} />
                    <p style={{ fontSize: "10.5px", color: A.textLight, margin: "4px 0 0" }}>{fmtDate(l.createdAt)}</p>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>

      {/* ── Active products ───────────────────────────────────────── */}
      {products.length > 0 && (
        <div style={{ background: "#fff", borderRadius: "10px", border: `1px solid ${A.border}`, overflow: "hidden" }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "1rem 1.25rem 0.875rem", borderBottom: `1px solid ${A.border}`,
          }}>
            <p style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: A.textMuted, margin: 0 }}>
              Sản phẩm đang hoạt động
            </p>
            <button
              onClick={() => onNavigate("products")}
              style={{ fontSize: "11.5px", color: A.primary, background: "none", border: "none", cursor: "pointer", padding: 0, fontWeight: 500 }}
            >
              Quản lý →
            </button>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 0 }}>
            {products.map((p, i) => (
              <div key={p.id} style={{
                flex: "1 1 200px",
                padding: "0.875rem 1.25rem",
                borderRight: (i + 1) % 3 !== 0 && i < products.length - 1 ? `1px solid ${A.border}` : "none",
                borderBottom: Math.floor(i / 3) < Math.floor((products.length - 1) / 3) ? `1px solid ${A.border}` : "none",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                  <div style={{
                    width: "28px", height: "28px", borderRadius: "7px",
                    background: `${A.primary}15`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <span style={{ fontSize: "12px", color: A.primary }}>◈</span>
                  </div>
                  <div>
                    <p style={{ fontSize: "12.5px", fontWeight: 600, color: A.text, margin: 0 }}>{p.name}</p>
                    <p style={{ fontSize: "11px", color: A.textLight, margin: 0, fontFamily: "monospace" }}>/{p.slug}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
