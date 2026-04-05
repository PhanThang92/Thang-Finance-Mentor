import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "wouter";
import { resourcesApi, type LeadMagnet } from "@/lib/newsApi";

const PRIMARY  = "#0f766e";
const TEAL_BG  = "#f0faf8";
const TEAL_LIGHT = "rgba(15,118,110,0.08)";

const GATE_LABELS: Record<string, string> = {
  public:           "Tài liệu công khai",
  email_unlock:     "Để lại email để nhận tài liệu",
  lead_form_unlock: "Điền thông tin để nhận tài liệu",
};

interface UnlockResult {
  ok: boolean;
  downloadUrl?: string | null;
  fileName?: string | null;
  thankYouMessage?: string | null;
  message: string;
}

/* ── Unlock Form ──────────────────────────────────────────────────── */
function UnlockForm({
  resource,
  onSuccess,
}: {
  resource: LeadMagnet;
  onSuccess: (result: UnlockResult) => void;
}) {
  const [fullName, setFullName]   = useState("");
  const [email,    setEmail]      = useState("");
  const [phone,    setPhone]      = useState("");
  const [interest, setInterest]   = useState("");
  const [hp,       setHp]         = useState("");
  const [loading,  setLoading]    = useState(false);
  const [error,    setError]      = useState<string | null>(null);

  const isFull   = resource.gatingMode === "lead_form_unlock";
  const btnLabel = resource.buttonLabel || "Mở khóa tài liệu";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await resourcesApi.unlockResource(resource.slug, {
        fullName, email, phone: phone || undefined,
        interest: interest || undefined, hp,
        sourcePage:    window.location.pathname,
        sourceSection: "tai-lieu-detail",
      });
      onSuccess(res);
    } catch (err) {
      setError(String(err).replace("Error: ", ""));
    } finally {
      setLoading(false);
    }
  }

  const field: React.CSSProperties = {
    width: "100%", padding: "11px 14px", borderRadius: "8px",
    border: "1.5px solid rgba(0,0,0,0.12)", fontSize: "14.5px",
    outline: "none", boxSizing: "border-box", color: "#1a1a1a",
    background: "#fafaf9", transition: "border-color 0.15s",
    fontFamily: "inherit",
  };
  const label: React.CSSProperties = {
    fontSize: "12px", fontWeight: 600, letterSpacing: "0.06em",
    textTransform: "uppercase", color: "rgba(0,0,0,0.5)",
    display: "block", marginBottom: "6px",
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Honeypot */}
      <div style={{ display: "none" }} aria-hidden="true">
        <input tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} />
      </div>

      <div>
        <label style={label}>Họ và tên *</label>
        <input
          style={field}
          type="text"
          placeholder="Nguyễn Văn A"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          autoComplete="name"
        />
      </div>

      <div>
        <label style={label}>Email *</label>
        <input
          style={field}
          type="email"
          placeholder="email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </div>

      {isFull && (
        <>
          {(resource.requiresPhone) && (
            <div>
              <label style={label}>Số điện thoại</label>
              <input
                style={field}
                type="tel"
                placeholder="0901 234 567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
              />
            </div>
          )}
          <div>
            <label style={label}>Nội dung quan tâm</label>
            <input
              style={field}
              type="text"
              placeholder="Ví dụ: đầu tư dài hạn, quản lý tài chính..."
              value={interest}
              onChange={(e) => setInterest(e.target.value)}
            />
          </div>
        </>
      )}

      {error && (
        <p style={{ margin: 0, fontSize: "13.5px", color: "#c13333", lineHeight: 1.5 }}>{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        style={{
          width: "100%", padding: "14px", borderRadius: "9px",
          background: loading ? "rgba(15,118,110,0.5)" : PRIMARY,
          color: "#ffffff", border: "none", cursor: loading ? "not-allowed" : "pointer",
          fontSize: "15px", fontWeight: 700, letterSpacing: "0.01em",
          transition: "background 0.18s", fontFamily: "inherit",
        }}
      >
        {loading ? "Đang xử lý..." : btnLabel}
      </button>

      <p style={{ margin: 0, fontSize: "12px", color: "rgba(0,0,0,0.4)", textAlign: "center", lineHeight: 1.6 }}>
        Thông tin của bạn được bảo mật và không chia sẻ với bên thứ ba.
      </p>
    </form>
  );
}

/* ── Success State ────────────────────────────────────────────────── */
function SuccessState({ result }: { result: UnlockResult }) {
  const hasDownload = !!result.downloadUrl;
  const msg         = result.thankYouMessage ?? result.message;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", textAlign: "center" }}>
      <div
        style={{
          width: "56px", height: "56px", borderRadius: "50%",
          background: TEAL_BG, display: "flex", alignItems: "center",
          justifyContent: "center", margin: "0 auto", fontSize: "24px",
        }}
      >
        ✓
      </div>
      <div>
        <h3 style={{ margin: "0 0 8px", fontSize: "18px", fontWeight: 700, color: "#1a1a1a" }}>
          Cảm ơn bạn
        </h3>
        <p style={{ margin: 0, fontSize: "14.5px", color: "rgba(0,0,0,0.6)", lineHeight: 1.7 }}>
          {msg}
        </p>
      </div>

      {hasDownload && (
        <a
          href={result.downloadUrl!}
          download={result.fileName ?? true}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-block", padding: "13px 28px", borderRadius: "9px",
            background: PRIMARY, color: "#ffffff", textDecoration: "none",
            fontSize: "14.5px", fontWeight: 700, letterSpacing: "0.01em",
          }}
        >
          Tải xuống ngay{result.fileName ? `: ${result.fileName}` : ""}
        </a>
      )}

      <div style={{ paddingTop: "8px", borderTop: "1px solid rgba(0,0,0,0.07)" }}>
        <p style={{ margin: "0 0 12px", fontSize: "13px", color: "rgba(0,0,0,0.45)" }}>
          Khám phá thêm kiến thức
        </p>
        <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/tai-lieu" style={{ fontSize: "13.5px", fontWeight: 600, color: PRIMARY, textDecoration: "none" }}>
            Xem thêm tài liệu
          </Link>
          <span style={{ color: "rgba(0,0,0,0.2)" }}>·</span>
          <Link href="/bai-viet" style={{ fontSize: "13.5px", fontWeight: 600, color: PRIMARY, textDecoration: "none" }}>
            Đọc bài viết mới nhất
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ── Public Download (gatingMode: public) ─────────────────────────── */
function PublicDownload({ resource }: { resource: LeadMagnet }) {
  const url   = resource.fileUrl ?? resource.externalUrl;
  const label = resource.buttonLabel || "Tải xuống ngay";
  if (!url) return null;
  return (
    <a
      href={url}
      download={resource.fileName ?? true}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "inline-flex", alignItems: "center", gap: "8px",
        padding: "13px 28px", borderRadius: "9px", background: PRIMARY,
        color: "#ffffff", textDecoration: "none", fontSize: "15px",
        fontWeight: 700, width: "100%", justifyContent: "center",
      }}
    >
      {label}
    </a>
  );
}

/* ── Main Page ────────────────────────────────────────────────────── */
export default function TaiLieuDetail() {
  const params = useParams<{ slug: string }>();
  const slug   = params?.slug ?? "";

  const [resource, setResource] = useState<LeadMagnet | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [unlocked, setUnlocked] = useState<UnlockResult | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    resourcesApi.getResource(slug)
      .then(setResource)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "rgba(0,0,0,0.35)", fontSize: "14px" }}>Đang tải...</p>
      </div>
    );
  }

  if (notFound || !resource) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px" }}>
        <p style={{ fontSize: "16px", color: "rgba(0,0,0,0.5)" }}>Không tìm thấy tài liệu này.</p>
        <Link href="/tai-lieu" style={{ color: PRIMARY, fontWeight: 600, textDecoration: "none" }}>
          Xem tất cả tài liệu
        </Link>
      </div>
    );
  }

  const seoTitle = resource.seoTitle || resource.title;
  const seoDesc  = resource.seoDescription || resource.shortDescription || "";
  const ogImg    = resource.ogImageUrl || resource.coverImageUrl || "";

  return (
    <>
      <Helmet>
        <title>{seoTitle} — Phan Văn Thắng SWC</title>
        {seoDesc && <meta name="description" content={seoDesc} />}
        {ogImg   && <meta property="og:image" content={ogImg} />}
        <meta property="og:title" content={seoTitle} />
        {seoDesc && <meta property="og:description" content={seoDesc} />}
      </Helmet>

      <div style={{ background: "#fafaf9", minHeight: "80vh" }}>
        {/* Hero */}
        <div
          style={{
            background: `linear-gradient(180deg, ${PRIMARY} 0%, #0e6e67 100%)`,
            padding: "64px 24px 56px",
          }}
        >
          <div style={{ maxWidth: "760px", margin: "0 auto" }}>
            <p style={{ margin: "0 0 12px", fontSize: "11px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)" }}>
              Tài liệu miễn phí
            </p>
            <h1 style={{ margin: "0 0 16px", fontSize: "clamp(26px, 5vw, 40px)", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
              {resource.title}
            </h1>
            {resource.shortDescription && (
              <p style={{ margin: 0, fontSize: "16px", color: "rgba(255,255,255,0.78)", lineHeight: 1.75, maxWidth: "600px" }}>
                {resource.shortDescription}
              </p>
            )}
          </div>
        </div>

        {/* Body */}
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "48px 24px 80px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) 340px",
              gap: "40px",
              alignItems: "start",
            }}
          >
            {/* Left: content */}
            <div>
              {resource.coverImageUrl && (
                <div style={{ marginBottom: "28px", borderRadius: "12px", overflow: "hidden" }}>
                  <img
                    src={resource.coverImageUrl}
                    alt={resource.coverImageAlt ?? resource.title}
                    style={{ width: "100%", display: "block", maxHeight: "360px", objectFit: "cover" }}
                  />
                </div>
              )}

              {resource.fullDescription && (
                <div
                  style={{
                    fontSize: "15.5px",
                    lineHeight: 1.8,
                    color: "#2d2d2d",
                    marginBottom: "32px",
                    whiteSpace: "pre-line",
                  }}
                >
                  {resource.fullDescription}
                </div>
              )}

              {/* CTA block (shown on left side for large screens) */}
              {(resource.ctaTitle || resource.ctaDescription) && (
                <div
                  style={{
                    background: TEAL_BG,
                    border: `1px solid rgba(15,118,110,0.15)`,
                    borderRadius: "12px",
                    padding: "24px 28px",
                  }}
                >
                  {resource.ctaTitle && (
                    <h3 style={{ margin: "0 0 8px", fontSize: "17px", fontWeight: 700, color: PRIMARY }}>
                      {resource.ctaTitle}
                    </h3>
                  )}
                  {resource.ctaDescription && (
                    <p style={{ margin: 0, fontSize: "14.5px", color: "rgba(0,0,0,0.6)", lineHeight: 1.7 }}>
                      {resource.ctaDescription}
                    </p>
                  )}
                </div>
              )}

              {/* Back link */}
              <div style={{ marginTop: "36px" }}>
                <Link href="/tai-lieu" style={{ fontSize: "13.5px", fontWeight: 600, color: PRIMARY, textDecoration: "none" }}>
                  ← Xem tất cả tài liệu
                </Link>
              </div>
            </div>

            {/* Right: unlock form */}
            <div style={{ position: "sticky", top: "88px" }}>
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid rgba(0,0,0,0.09)",
                  borderRadius: "14px",
                  padding: "28px",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
                }}
              >
                {unlocked ? (
                  <SuccessState result={unlocked} />
                ) : (
                  <>
                    <p
                      style={{
                        margin: "0 0 6px",
                        fontSize: "11px",
                        fontWeight: 700,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: PRIMARY,
                      }}
                    >
                      Tài liệu miễn phí
                    </p>
                    <h2 style={{ margin: "0 0 6px", fontSize: "17px", fontWeight: 700, color: "#1a1a1a", lineHeight: 1.35 }}>
                      {resource.title}
                    </h2>
                    <p style={{ margin: "0 0 22px", fontSize: "13px", color: "rgba(0,0,0,0.45)", lineHeight: 1.6 }}>
                      {GATE_LABELS[resource.gatingMode] ?? "Nhận tài liệu"}
                    </p>
                    {resource.gatingMode === "public" ? (
                      <PublicDownload resource={resource} />
                    ) : (
                      <UnlockForm resource={resource} onSuccess={setUnlocked} />
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile: sticky unlock card at bottom */}
        <style>{`
          @media (max-width: 700px) {
            .tai-lieu-grid { grid-template-columns: 1fr !important; }
            .tai-lieu-sticky { position: static !important; }
          }
        `}</style>
      </div>
    </>
  );
}
