import { useSeoMeta } from "@/hooks/useSeoMeta";
import React, { useEffect, useState } from "react";
import { Link } from "wouter";
import { resourcesApi, type LeadMagnet } from "@/lib/newsApi";

const PRIMARY = "#0f766e";
const TEAL_BG = "#f0faf8";

const TYPE_LABELS: Record<string, string> = {
  file:          "Tệp tải xuống",
  gated_page:    "Nội dung mở khóa",
  external_link: "Link ngoài",
};

const GATE_LABELS: Record<string, string> = {
  public:           "Miễn phí",
  email_unlock:     "Nhận qua email",
  lead_form_unlock: "Điền thông tin",
};

const TYPE_FILTERS = [
  { value: "", label: "Tất cả" },
  { value: "file", label: "Tệp tải xuống" },
  { value: "gated_page", label: "Nội dung" },
  { value: "external_link", label: "Link ngoài" },
];

function ResourceCard({ r }: { r: LeadMagnet }) {
  const gateLabel = GATE_LABELS[r.gatingMode] ?? r.gatingMode;
  const btnLabel  = r.buttonLabel || (r.gatingMode === "public" ? "Tải ngay" : "Nhận tài liệu");

  return (
    <Link href={`/tai-lieu/${r.slug}`} style={{ textDecoration: "none" }}>
      <div
        style={{
          background: "#ffffff",
          border: "1px solid rgba(0,0,0,0.09)",
          borderRadius: "14px",
          overflow: "hidden",
          transition: "box-shadow 0.2s ease, transform 0.2s ease",
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 32px rgba(15,118,110,0.13)";
          (e.currentTarget as HTMLDivElement).style.transform  = "translateY(-2px)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
          (e.currentTarget as HTMLDivElement).style.transform  = "translateY(0)";
        }}
      >
        {r.coverImageUrl ? (
          <div style={{ height: "180px", overflow: "hidden", background: TEAL_BG }}>
            <img
              src={r.coverImageUrl}
              alt={r.coverImageAlt ?? r.title}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        ) : (
          <div
            style={{
              height: "120px",
              background: `linear-gradient(135deg, ${PRIMARY} 0%, #0e6e67 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: "36px", opacity: 0.35 }}>⊙</span>
          </div>
        )}
        <div style={{ padding: "20px 22px 22px", flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            <span
              style={{
                fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em",
                textTransform: "uppercase", color: PRIMARY,
                background: TEAL_BG, padding: "3px 8px", borderRadius: "20px",
              }}
            >
              {TYPE_LABELS[r.resourceType] ?? r.resourceType}
            </span>
            <span
              style={{
                fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em",
                textTransform: "uppercase", color: "rgba(0,0,0,0.45)",
                background: "#f5f5f4", padding: "3px 8px", borderRadius: "20px",
              }}
            >
              {gateLabel}
            </span>
          </div>
          <h3
            style={{
              margin: 0, fontSize: "16px", fontWeight: 700, color: "#1a1a1a",
              lineHeight: 1.4, letterSpacing: "-0.01em",
            }}
          >
            {r.title}
          </h3>
          {r.shortDescription && (
            <p
              style={{
                margin: 0, fontSize: "14px", color: "rgba(0,0,0,0.55)",
                lineHeight: 1.65, flex: 1,
              }}
            >
              {r.shortDescription}
            </p>
          )}
          <div
            style={{
              marginTop: "4px", display: "inline-flex", alignItems: "center", gap: "6px",
              fontSize: "13.5px", fontWeight: 600, color: PRIMARY,
            }}
          >
            {btnLabel}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function TaiLieu() {
  useSeoMeta({
    title:       "Tài liệu & Lead Magnet — Phan Văn Thắng SWC",
    description: "Tải tài liệu miễn phí về tài chính cá nhân, lập kế hoạch tích sản, và đầu tư có kỷ luật từ Phan Văn Thắng SWC.",
    ogImage:     "/opengraph.jpg",
    ogType:      "website",
  });
  const [resources, setResources] = useState<LeadMagnet[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [typeFilter, setTypeFilter] = useState("");

  useEffect(() => {
    resourcesApi.getResources().then(setResources).finally(() => setLoading(false));
  }, []);

  const filtered = typeFilter ? resources.filter((r) => r.resourceType === typeFilter) : resources;

  return (
    <div style={{ background: "#fafaf9", minHeight: "80vh" }}>
      {/* Hero */}
      <div
        style={{
          background: `linear-gradient(180deg, ${PRIMARY} 0%, #0e6e67 100%)`,
          padding: "72px 24px 56px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            margin: "0 0 14px",
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.65)",
          }}
        >
          Tài liệu miễn phí
        </p>
        <h1
          style={{
            margin: "0 0 16px",
            fontSize: "clamp(28px, 5vw, 42px)",
            fontWeight: 800,
            color: "#ffffff",
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
          }}
        >
          Tài liệu &amp; Kiến thức
        </h1>
        <p
          style={{
            margin: "0 auto",
            maxWidth: "520px",
            fontSize: "16px",
            color: "rgba(255,255,255,0.75)",
            lineHeight: 1.7,
          }}
        >
          Những tài liệu thực chiến được tổng hợp kỹ lưỡng — giúp bạn hành động ngay, không lý thuyết rỗng.
        </p>
      </div>

      {/* Filters */}
      <div
        style={{
          background: "#ffffff",
          borderBottom: "1px solid rgba(0,0,0,0.08)",
          padding: "0 24px",
          display: "flex",
          gap: "0",
          justifyContent: "center",
          overflowX: "auto",
        }}
      >
        {TYPE_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setTypeFilter(f.value)}
            style={{
              padding: "14px 18px",
              border: "none",
              background: "none",
              cursor: "pointer",
              fontSize: "13.5px",
              fontWeight: typeFilter === f.value ? 700 : 500,
              color: typeFilter === f.value ? PRIMARY : "rgba(0,0,0,0.5)",
              borderBottom: typeFilter === f.value ? `2px solid ${PRIMARY}` : "2px solid transparent",
              transition: "all 0.15s",
              whiteSpace: "nowrap",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "48px 24px 80px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "rgba(0,0,0,0.35)", fontSize: "14px" }}>
            Đang tải tài liệu...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <p style={{ color: "rgba(0,0,0,0.4)", fontSize: "15px" }}>Chưa có tài liệu nào được xuất bản.</p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "24px",
            }}
          >
            {filtered.map((r) => (
              <ResourceCard key={r.id} r={r} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
