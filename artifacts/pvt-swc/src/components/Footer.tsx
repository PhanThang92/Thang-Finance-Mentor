import React from "react";
import { Mail, MapPin, ArrowUpRight } from "lucide-react";
import { SiYoutube, SiFacebook } from "react-icons/si";
import {
  FOOTER_NAV_LINKS,
  FOOTER_KIEN_THUC_LINKS,
  FOOTER_HE_SINH_THAI_LINKS,
} from "@/config/navigationConfig";
import { siteConfig } from "@/config/siteConfig";
import { useLogoSettings } from "@/hooks/useLogoSettings";

/* ══════════════════════════════════════════════════════════════════
   SHARED STYLE HELPERS
══════════════════════════════════════════════════════════════════ */

const LINK_RESTING = "rgba(255,255,255,0.46)";
const LINK_HOVER   = "rgba(255,255,255,0.82)";

function onIn(e: React.MouseEvent)  { (e.currentTarget as HTMLElement).style.color = LINK_HOVER;   }
function onOut(e: React.MouseEvent) { (e.currentTarget as HTMLElement).style.color = LINK_RESTING; }

/* ── Column heading ─────────────────────────────────────────────── */
function ColHead({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.375rem" }}>
      <div
        aria-hidden="true"
        style={{ width: "2px", height: "11px", borderRadius: "1px", background: "hsl(var(--primary) / 0.48)", flexShrink: 0 }}
      />
      <p style={{ fontSize: "10.5px", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.36)", lineHeight: 1, margin: 0 }}>
        {children}
      </p>
    </div>
  );
}

/* ── Navigation link ────────────────────────────────────────────── */
function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <a
        href={href}
        style={{ display: "inline-block", fontSize: "13.5px", fontWeight: 400, letterSpacing: "0.006em", color: LINK_RESTING, textDecoration: "none", lineHeight: 1.4, transition: "color 0.20s ease" }}
        onMouseEnter={onIn}
        onMouseLeave={onOut}
      >
        {children}
      </a>
    </li>
  );
}

/* ── Contact / social row ───────────────────────────────────────── */
function ContactLink({
  href, external, Icon, label, isStatic,
}: {
  href?: string; external?: boolean; Icon: React.ElementType; label: string; isStatic?: boolean;
}) {
  const inner = () => (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", color: isStatic ? "rgba(255,255,255,0.26)" : LINK_RESTING, transition: isStatic ? "none" : "color 0.20s ease" }}>
      <Icon size={12} style={{ marginTop: "2px", flexShrink: 0, opacity: isStatic ? 0.55 : 0.72 }} />
      <span style={{ fontSize: "13px", fontWeight: 400, letterSpacing: "0.006em", lineHeight: 1.55, wordBreak: "break-all" }}>
        {label}
      </span>
      {!isStatic && <ArrowUpRight size={10} style={{ marginTop: "3px", flexShrink: 0, opacity: 0.38 }} />}
    </div>
  );

  if (isStatic || !href) return <div>{inner()}</div>;

  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      style={{ textDecoration: "none", display: "block" }}
      onMouseEnter={(e) => { const d = e.currentTarget.firstChild as HTMLElement; if (d) d.style.color = LINK_HOVER; }}
      onMouseLeave={(e) => { const d = e.currentTarget.firstChild as HTMLElement; if (d) d.style.color = LINK_RESTING; }}
    >
      {inner()}
    </a>
  );
}

/* ══════════════════════════════════════════════════════════════════
   FOOTER COMPONENT
   Layout: 5-column on large screens
   Brand | Liên kết nhanh | Kiến thức | Hệ sinh thái | Kết nối
══════════════════════════════════════════════════════════════════ */
export function Footer() {
  const homeBase = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "");
  const year     = new Date().getFullYear();
  const logo     = useLogoSettings();

  return (
    <footer className="relative text-white overflow-hidden" style={{ background: "linear-gradient(180deg, #0d2320 0%, #091a18 42%, #060f0e 100%)" }}>

      {/* Ambient glow — top-right */}
      <div aria-hidden="true" className="absolute pointer-events-none" style={{ top: "-18%", right: "-8%", width: "30rem", height: "30rem", borderRadius: "50%", background: "radial-gradient(circle, rgba(26,94,84,0.11) 0%, transparent 68%)", filter: "blur(56px)" }} />

      {/* Top accent hairline */}
      <div aria-hidden="true" style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(90deg, transparent 0%, rgba(52,160,140,0.28) 28%, rgba(52,160,140,0.28) 72%, transparent 100%)" }} />

      <div className="max-w-6xl mx-auto px-5 sm:px-8 relative z-10">

        {/* ── Main grid ──────────────────────────────────────────── */}
        {/*
          Desktop (lg): 5 columns — Brand (wide) | Nav | Kiến thức | Hệ sinh thái | Kết nối
          Tablet  (md): 2+3 split — Brand full-width top, 3 content cols below + Kết nối
          Mobile:       single column stacked
        */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.9fr_1fr_1fr_1fr_1.2fr]"
          style={{ gap: "3rem 3.5rem", paddingTop: "5rem", paddingBottom: "4.25rem", borderBottom: "1px solid rgba(255,255,255,0.066)" }}
        >

          {/* ── Col 1: Brand block ───────────────────────────────── */}
          <div style={{ maxWidth: "20rem" }} className="sm:col-span-2 lg:col-span-1">

            {/* Wordmark */}
            <a
              href={`${homeBase}/`}
              style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}
            >
              {(logo.logoIconDark || logo.logoIcon) ? (
                <>
                  <img
                    src={logo.logoIconDark || logo.logoIcon}
                    alt=""
                    aria-hidden="true"
                    style={{ width: "32px", height: "32px", objectFit: "contain", flexShrink: 0 }}
                  />
                  <div>
                    <div style={{ fontSize: "15px", fontWeight: 700, letterSpacing: "-0.022em", color: "rgba(255,255,255,0.92)", lineHeight: 1.2, marginBottom: "0.25rem" }}>
                      {logo.brandName || "Phan Văn Thắng SWC"}
                    </div>
                    <div style={{ fontSize: "10px", fontWeight: 400, letterSpacing: "0.02em", color: "rgba(255,255,255,0.26)", lineHeight: 1 }}>
                      Thuộc hệ sinh thái Sky World Community
                    </div>
                  </div>
                </>
              ) : logo.logoDarkBg ? (
                <img
                  src={logo.logoDarkBg}
                  alt={logo.displayName}
                  style={{ display: "block", width: `${logo.desktopWidth}px`, maxWidth: "160px", height: "auto", objectFit: "contain" }}
                />
              ) : (
                <div>
                  <div style={{ fontSize: "17.5px", fontWeight: 700, letterSpacing: "-0.032em", color: "rgba(255,255,255,0.94)", lineHeight: 1.1, marginBottom: "0.3rem" }}>
                    {logo.brandName || logo.displayName || "Thắng SWC"}
                  </div>
                  <div style={{ fontSize: "10.5px", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "hsl(var(--primary) / 0.52)", lineHeight: 1 }}>
                    Phan Văn Thắng
                  </div>
                </div>
              )}
            </a>

            {/* Positioning tagline */}
            <p style={{ fontSize: "12px", fontWeight: 400, fontStyle: "italic", letterSpacing: "0.004em", color: "rgba(255,255,255,0.28)", lineHeight: 1.82, marginBottom: "0.875rem" }}>
              {siteConfig.brandTagline}
            </p>

            {/* Divider */}
            <div aria-hidden="true" style={{ width: "2.25rem", height: "1px", background: "rgba(255,255,255,0.10)", marginBottom: "1.125rem" }} />

            {/* Brand description */}
            <p style={{ fontSize: "13px", fontWeight: 300, letterSpacing: "0.004em", lineHeight: 1.92, color: "rgba(255,255,255,0.40)" }}>
              {siteConfig.footerDescription}
            </p>
          </div>

          {/* ── Col 2: Liên kết nhanh ────────────────────────────── */}
          <div>
            <ColHead>Liên kết nhanh</ColHead>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              {FOOTER_NAV_LINKS.map(({ name, href }) => (
                <NavLink key={name} href={`${homeBase}${href}`}>{name}</NavLink>
              ))}
            </ul>
          </div>

          {/* ── Col 3: Kiến thức ──────────────────────────────────── */}
          <div>
            <ColHead>Kiến thức</ColHead>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              {FOOTER_KIEN_THUC_LINKS.map(({ name, href }) => (
                <NavLink key={name} href={`${homeBase}${href}`}>{name}</NavLink>
              ))}
            </ul>
          </div>

          {/* ── Col 4: Hệ sinh thái ───────────────────────────────── */}
          <div>
            <ColHead>Hệ sinh thái</ColHead>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              {FOOTER_HE_SINH_THAI_LINKS.map(({ name, href }) => (
                <NavLink key={name} href={`${homeBase}${href}`}>{name}</NavLink>
              ))}
            </ul>
          </div>

          {/* ── Col 5: Kết nối ────────────────────────────────────── */}
          <div>
            <ColHead>Kết nối</ColHead>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.125rem" }}>

              <ContactLink href={siteConfig.youtubeUrl} external Icon={SiYoutube} label="Kênh YouTube" />
              <ContactLink href={siteConfig.facebookUrl} external Icon={SiFacebook} label="Trang Facebook" />
              <ContactLink href={`mailto:${siteConfig.contactEmail}`} Icon={Mail} label={siteConfig.contactEmail} />
              <ContactLink Icon={MapPin} label="Hà Nội, Việt Nam" isStatic />

              {/* Tham gia CTA */}
              <div style={{ marginTop: "0.5rem", paddingTop: "1.25rem", borderTop: "1px solid rgba(255,255,255,0.055)" }}>
                <a
                  href={`${homeBase}/cong-dong#dang-ky`}
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", fontSize: "12.5px", fontWeight: 500, letterSpacing: "0.010em", color: "hsl(var(--primary) / 0.60)", textDecoration: "none", transition: "color 0.20s ease" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "hsl(var(--primary) / 0.90)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "hsl(var(--primary) / 0.60)"; }}
                >
                  <span>Tham gia cộng đồng</span>
                  <ArrowUpRight size={11} style={{ opacity: 0.70 }} />
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* ── Bottom bar ─────────────────────────────────────────── */}
        <div
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-3"
          style={{ paddingTop: "1.75rem", paddingBottom: "1.75rem" }}
        >
          <p style={{ fontSize: "12px", fontWeight: 400, letterSpacing: "0.006em", color: "rgba(255,255,255,0.30)", flexShrink: 0, margin: 0 }}>
            © {year} Phan Văn Thắng SWC. Bảo lưu mọi quyền.
          </p>

          {/* Separator dot — desktop only */}
          <div aria-hidden="true" className="hidden md:block" style={{ width: "3px", height: "3px", borderRadius: "50%", background: "rgba(255,255,255,0.13)", flexShrink: 0 }} />

          <p
            style={{ fontSize: "11.5px", fontWeight: 300, lineHeight: 1.80, color: "rgba(255,255,255,0.22)", maxWidth: "32rem", margin: 0 }}
            className="md:text-right"
          >
            {siteConfig.disclaimer}
          </p>
        </div>

      </div>
    </footer>
  );
}
