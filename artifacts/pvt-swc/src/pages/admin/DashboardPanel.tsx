import React, { useEffect, useState } from "react";
import { adminApi, type DashboardData } from "@/lib/newsApi";
import { A, s, fmtDate, leadStatusLabel, leadStatusColor } from "./shared";

export function DashboardPanel({ adminKey }: { adminKey: string }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getDashboard(adminKey).then(setData).catch(console.error).finally(() => setLoading(false));
  }, [adminKey]);

  if (loading) return <div style={{ padding: "2rem", color: A.textMuted, fontSize: "13px" }}>Đang tải...</div>;
  if (!data) return <div style={{ padding: "2rem", color: A.danger, fontSize: "13px" }}>Không tải được dữ liệu.</div>;

  const statCards = [
    { label: "Bài đã đăng", value: data.publishedCount, color: A.primary },
    { label: "Bản nháp", value: data.draftCount, color: "#6b7280" },
    { label: "Sản phẩm", value: data.productCount, color: "#7c3aed" },
    { label: "Tổng leads", value: data.totalLeads, color: "#d97706" },
    { label: "Leads mới", value: data.newLeads, color: "#dc2626" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "1rem" }}>
        {statCards.map((c) => (
          <div key={c.label} style={{ ...s.card, padding: "1.25rem" }}>
            <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: A.textLight, margin: "0 0 0.5rem" }}>{c.label}</p>
            <p style={{ fontSize: "28px", fontWeight: 800, color: c.color, margin: 0, lineHeight: 1 }}>{c.value}</p>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        {/* Recent posts */}
        <div style={s.card}>
          <p style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: A.textMuted, margin: "0 0 1rem" }}>Bài viết gần đây</p>
          {data.recentPosts.length === 0
            ? <p style={{ fontSize: "13px", color: A.textLight }}>Chưa có bài viết.</p>
            : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                {data.recentPosts.map((p) => (
                  <div key={p.id} style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                    <span style={{
                      fontSize: "9.5px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase",
                      padding: "2px 7px", borderRadius: "4px", flexShrink: 0, marginTop: "1px",
                      background: p.status === "published" ? "rgba(26,120,104,0.10)" : "rgba(0,0,0,0.06)",
                      color: p.status === "published" ? A.primary : A.textMuted,
                    }}>{p.status === "published" ? "Đã đăng" : "Nháp"}</span>
                    <span style={{ fontSize: "13px", color: A.text, lineHeight: 1.4 }}>{p.title}</span>
                  </div>
                ))}
              </div>
            )}
        </div>

        {/* Recent leads */}
        <div style={s.card}>
          <p style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: A.textMuted, margin: "0 0 1rem" }}>Leads gần đây</p>
          {data.recentLeads.length === 0
            ? <p style={{ fontSize: "13px", color: A.textLight }}>Chưa có leads.</p>
            : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {data.recentLeads.map((l) => (
                  <div key={l.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                    <div>
                      <p style={{ fontSize: "13px", fontWeight: 500, color: A.text, margin: 0 }}>{l.name}</p>
                      <p style={{ fontSize: "11.5px", color: A.textMuted, margin: 0 }}>{l.phone ?? l.email ?? "—"}</p>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <span style={{ fontSize: "10px", fontWeight: 600, color: leadStatusColor(l.status) }}>{leadStatusLabel(l.status)}</span>
                      <p style={{ fontSize: "11px", color: A.textLight, margin: 0 }}>{fmtDate(l.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
