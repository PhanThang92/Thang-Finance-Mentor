import React, { useState, useEffect, useCallback } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { A, s } from "./shared";

/* ── Types ────────────────────────────────────────────────────────────── */
interface AnalyticsSummary {
  totalArticleViews: number;
  totalArticleClicks: number;
  totalVideoClicks: number;
  totalCtaClicks: number;
  uniqueVisitors: number;
}
interface TopArticle { slug: string | null; title: string | null; views: number; clicks: number; total: number; }
interface TopVideo   { slug: string | null; title: string | null; clicks: number; }
interface TopCta     { label: string | null; clicks: number; }
interface TopTopic   { slug: string | null; title: string | null; clicks: number; }
interface TrendPoint {
  date: string;
  articleViews: number;
  articleClicks: number;
  videoClicks: number;
  ctaClicks: number;
}
interface AnalyticsData {
  summary: AnalyticsSummary;
  topArticles: TopArticle[];
  topVideos: TopVideo[];
  topCtas: TopCta[];
  topTopics: TopTopic[];
  trend: TrendPoint[];
}

/* ── Config ────────────────────────────────────────────────────────────── */
const BASE_API = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "");

const DATE_RANGES = [
  { label: "7 ngày",  days: 7  },
  { label: "30 ngày", days: 30 },
  { label: "90 ngày", days: 90 },
];

/* ── Helpers ───────────────────────────────────────────────────────────── */
function fmtDate(iso: string): string {
  try {
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
  } catch { return iso; }
}

function fmtNum(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

/* ── Summary card ─────────────────────────────────────────────────────── */
function SummaryCard({
  label, value, sub, accent = A.primary,
}: { label: string; value: number | string; sub?: string; accent?: string }) {
  return (
    <div style={{
      background: A.bgCard, borderRadius: "10px",
      border: `1px solid ${A.border}`, padding: "1.25rem 1.5rem",
      borderTop: `3px solid ${accent}`,
      flex: "1 1 180px", minWidth: 0,
    }}>
      <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.10em", textTransform: "uppercase", color: A.textMuted, margin: "0 0 8px" }}>{label}</p>
      <p style={{ fontSize: "28px", fontWeight: 700, color: A.text, margin: "0 0 4px", lineHeight: 1 }}>{fmtNum(Number(value))}</p>
      {sub && <p style={{ fontSize: "11.5px", color: A.textLight, margin: 0 }}>{sub}</p>}
    </div>
  );
}

/* ── Empty state ──────────────────────────────────────────────────────── */
function Empty({ msg = "Chưa có dữ liệu trong khoảng thời gian này." }: { msg?: string }) {
  return (
    <div style={{ textAlign: "center", padding: "2.5rem 1rem", color: A.textLight, fontSize: "13px" }}>
      {msg}
    </div>
  );
}

/* ── Rank badge ───────────────────────────────────────────────────────── */
function Rank({ n }: { n: number }) {
  const colors: [string, string][] = [
    ["#b8860b", "#fff8e1"],
    ["#909090", "#f5f5f5"],
    ["#8b6046", "#f9f0eb"],
  ];
  const [fg, bg] = n <= 3 ? colors[n - 1] : [A.textLight, A.bg];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: "22px", height: "22px", borderRadius: "50%",
      fontSize: "11px", fontWeight: 700, background: bg, color: fg, flexShrink: 0,
    }}>{n}</span>
  );
}

/* ── Tooltip customisation ────────────────────────────────────────────── */
function ChartTooltip({ active, payload, label }: Record<string, unknown>) {
  if (!active || !Array.isArray(payload) || !payload.length) return null;
  return (
    <div style={{
      background: "#fff", border: `1px solid ${A.border}`, borderRadius: "8px",
      padding: "10px 14px", fontSize: "12px", boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
    }}>
      <p style={{ fontWeight: 600, color: A.text, margin: "0 0 6px" }}>{String(label)}</p>
      {payload.map((entry: Record<string, unknown>, i: number) => (
        <p key={i} style={{ margin: "2px 0", color: String(entry.color) }}>
          {String(entry.name)}: <strong>{String(entry.value)}</strong>
        </p>
      ))}
    </div>
  );
}

/* ── Main component ───────────────────────────────────────────────────── */
export function AnalyticsPanel({ adminKey }: { adminKey: string }) {
  const [days,    setDays]    = useState(30);
  const [data,    setData]    = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE_API}/api/admin/analytics?days=${days}`, {
        headers: { Authorization: `Bearer ${adminKey}` },
      });
      if (!res.ok) throw new Error(await res.text());
      setData(await res.json());
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [days, adminKey]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const summary = data?.summary;
  const trend   = data?.trend ?? [];

  const chartData = trend.map((t) => ({
    date:          fmtDate(t.date),
    "Xem bài viết": t.articleViews + t.articleClicks,
    "Click video":  t.videoClicks,
    "Click CTA":    t.ctaClicks,
  }));

  return (
    <div style={{ maxWidth: "1100px" }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: "1.75rem" }}>
        <h2 style={{ fontSize: "18px", fontWeight: 700, color: A.text, margin: "0 0 6px" }}>
          Phân tích nội dung
        </h2>
        <p style={{ fontSize: "13px", color: A.textMuted, margin: 0 }}>
          Theo dõi hiệu suất bài viết, video và các tương tác quan trọng trên website.
        </p>
      </div>

      {/* ── Date range tabs ── */}
      <div style={{ display: "flex", gap: "6px", marginBottom: "1.5rem" }}>
        {DATE_RANGES.map((r) => (
          <button
            key={r.days}
            onClick={() => setDays(r.days)}
            style={{
              padding: "6px 16px", borderRadius: "999px", border: "none", cursor: "pointer",
              fontSize: "12.5px", fontWeight: 600,
              background: days === r.days ? A.primary : A.bgCard,
              color:      days === r.days ? "#fff"     : A.textMuted,
              boxShadow:  days === r.days ? "none" : `0 0 0 1px ${A.border}`,
              transition: "all 0.15s ease",
            }}
          >
            {r.label}
          </button>
        ))}
        {loading && (
          <span style={{ fontSize: "12px", color: A.textLight, alignSelf: "center", marginLeft: "8px" }}>
            Đang tải...
          </span>
        )}
      </div>

      {error && (
        <div style={{ ...s.card, background: "#fff5f5", borderColor: "rgba(193,51,51,0.25)", color: A.danger, fontSize: "13px", marginBottom: "1.5rem" }}>
          Lỗi tải dữ liệu: {error}
        </div>
      )}

      {/* ── Summary cards ── */}
      <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", marginBottom: "1.75rem" }}>
        <SummaryCard label="Lượt xem bài viết" value={summary?.totalArticleViews  ?? 0} sub={`${days} ngày qua`} accent={A.primary} />
        <SummaryCard label="Lượt click video"   value={summary?.totalVideoClicks   ?? 0} sub={`${days} ngày qua`} accent="#5b7fcb" />
        <SummaryCard label="Lượt click CTA"     value={summary?.totalCtaClicks     ?? 0} sub={`${days} ngày qua`} accent="#c08a2a" />
        <SummaryCard label="Lượt truy cập"      value={summary?.uniqueVisitors     ?? 0} sub="Khách riêng biệt"   accent="#6b8f6b" />
      </div>

      {/* ── Trend chart ── */}
      {chartData.length > 0 && (
        <div style={{ ...s.card, marginBottom: "1.75rem" }}>
          <p style={{ ...s.label, marginBottom: "1.25rem" }}>Xu hướng hoạt động</p>
          <div style={{ height: "220px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 4, right: 16, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={A.border} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: A.textLight }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: A.textLight }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
                <Line type="monotone" dataKey="Xem bài viết" stroke={A.primary}  strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                <Line type="monotone" dataKey="Click video"  stroke="#5b7fcb" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                <Line type="monotone" dataKey="Click CTA"    stroke="#c08a2a" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── Two-column section: Articles + Videos ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px", marginBottom: "16px" }}>

        {/* Top Articles */}
        <div style={s.card}>
          <p style={{ ...s.label, marginBottom: "1rem" }}>Bài viết nổi bật</p>
          {!data || data.topArticles.length === 0 ? (
            <Empty />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              {data.topArticles.map((a, i) => (
                <div key={a.slug ?? i} style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  padding: "8px 10px", borderRadius: "7px",
                  background: i % 2 === 0 ? "transparent" : A.bg,
                }}>
                  <Rank n={i + 1} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "13px", fontWeight: 500, color: A.text, margin: "0 0 1px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {a.title ?? a.slug ?? "—"}
                    </p>
                    {a.slug && (
                      <p style={{ fontSize: "10.5px", color: A.textLight, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        /{a.slug}
                      </p>
                    )}
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p style={{ fontSize: "14px", fontWeight: 700, color: A.primary, margin: 0 }}>{a.total}</p>
                    <p style={{ fontSize: "10px", color: A.textLight, margin: 0 }}>
                      {a.views}x / {a.clicks}↗
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Videos */}
        <div style={s.card}>
          <p style={{ ...s.label, marginBottom: "1rem" }}>Video được quan tâm</p>
          {!data || data.topVideos.length === 0 ? (
            <Empty />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              {data.topVideos.map((v, i) => (
                <div key={v.slug ?? i} style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  padding: "8px 10px", borderRadius: "7px",
                  background: i % 2 === 0 ? "transparent" : A.bg,
                }}>
                  <Rank n={i + 1} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "13px", fontWeight: 500, color: A.text, margin: "0 0 1px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {v.title ?? v.slug ?? "—"}
                    </p>
                    {v.slug && (
                      <p style={{ fontSize: "10.5px", color: A.textLight, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        /{v.slug}
                      </p>
                    )}
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p style={{ fontSize: "14px", fontWeight: 700, color: "#5b7fcb", margin: 0 }}>{v.clicks}</p>
                    <p style={{ fontSize: "10px", color: A.textLight, margin: 0 }}>lượt click</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Two-column: CTAs + Topics ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", marginBottom: "16px" }}>

        {/* Top CTAs */}
        <div style={s.card}>
          <p style={{ ...s.label, marginBottom: "1rem" }}>CTA được click nhiều</p>
          {!data || data.topCtas.length === 0 ? (
            <Empty />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              {data.topCtas.map((c, i) => {
                const pct = data.topCtas[0]?.clicks ? Math.round((c.clicks / data.topCtas[0].clicks) * 100) : 0;
                return (
                  <div key={c.label ?? i} style={{ padding: "8px 10px", borderRadius: "7px", background: i % 2 === 0 ? "transparent" : A.bg }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", marginBottom: "4px" }}>
                      <p style={{ fontSize: "13px", fontWeight: 500, color: A.text, margin: 0, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {c.label ?? "—"}
                      </p>
                      <p style={{ fontSize: "14px", fontWeight: 700, color: "#c08a2a", margin: 0, flexShrink: 0 }}>{c.clicks}</p>
                    </div>
                    <div style={{ height: "3px", borderRadius: "999px", background: A.border, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: "#c08a2a", borderRadius: "999px", transition: "width 0.5s ease" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Topics */}
        <div style={s.card}>
          <p style={{ ...s.label, marginBottom: "1rem" }}>Chủ đề hiệu quả</p>
          {!data || data.topTopics.length === 0 ? (
            <Empty />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              {data.topTopics.map((t, i) => (
                <div key={t.slug ?? i} style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  padding: "8px 10px", borderRadius: "7px",
                  background: i % 2 === 0 ? "transparent" : A.bg,
                }}>
                  <Rank n={i + 1} />
                  <p style={{ flex: 1, fontSize: "13px", fontWeight: 500, color: A.text, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {t.title ?? t.slug ?? "—"}
                  </p>
                  <p style={{ fontSize: "14px", fontWeight: 700, color: "#6b8f6b", margin: 0, flexShrink: 0 }}>{t.clicks}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Footer note ── */}
      <p style={{ fontSize: "11.5px", color: A.textLight, marginTop: "1rem" }}>
        Dữ liệu được thu thập từ lượt tương tác thực tế trên website. Khách truy cập được nhận diện bằng ID ẩn danh lưu trong trình duyệt.
      </p>
    </div>
  );
}
