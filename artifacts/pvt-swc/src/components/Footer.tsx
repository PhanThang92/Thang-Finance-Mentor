import React from "react";
import { Mail, MapPin, ArrowUpRight } from "lucide-react";
import { SiYoutube, SiFacebook } from "react-icons/si";
import {
  FOOTER_NAV_LINKS,
  FOOTER_KIEN_THUC_LINKS,
} from "@/config/navigationConfig";
import { siteConfig } from "@/config/siteConfig";

/* ══════════════════════════════════════════════════════════════════
   SHARED LINK STYLE HELPERS
══════════════════════════════════════════════════════════════════ */

const LINK_RESTING = "rgba(255,255,255,0.46)";
const LINK_HOVER   = "rgba(255,255,255,0.82)";

function onIn(e: React.MouseEvent)  { (e.currentTarget as HTMLElement).style.color = LINK_HOVER;   }
function onOut(e: React.MouseEvent) { (e.currentTarget as HTMLElement).style.color = LINK_RESTING; }

/* ── Column heading ─────────────────────────────────────────────── */
function ColHead({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display:       "flex",
        alignItems:    "center",
        gap:           "0.5rem",
        marginBottom:  "1.375rem",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width:        "2px",
          height:       "11px",
          borderRadius: "1px",
          background:   "hsl(var(--primary) / 0.48)",
          flexShrink:   0,
        }}
      />
      <p
        style={{
          fontSize:      "10.5px",
          fontWeight:    600,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color:         "rgba(255,255,255,0.36)",
          lineHeight:    1,
          margin:        0,
        }}
      >
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
        style={{
          display:        "inline-block",
          fontSize:       "13.5px",
          fontWeight:     400,
          letterSpacing:  "0.006em",
          color:          LINK_RESTING,
          textDecoration: "none",
          lineHeight:     1.4,
          transition:     "color 0.20s ease",
        }}
        onMouseEnter={onIn}
        onMouseLeave={onOut}
      >
        {children}
      </a>
    </li>
  );
}

/* ── Contact row ────────────────────────────────────────────────── */
function ContactLink({
  href,
  external,
  Icon,
  label,
  isStatic,
}: {
  href?: string;
  external?: boolean;
  Icon: React.ElementType;
  label: string;
  isStatic?: boolean;
}) {
  const inner = (hover: boolean) => (
    <div
      style={{
        display:    "flex",
        alignItems: "flex-start",
        gap:        "0.5rem",
        color:      isStatic ? "rgba(255,255,255,0.26)" : LINK_RESTING,
        transition: isStatic ? "none" : "color 0.20s ease",
      }}
    >
      <Icon
        size={12}
        style={{ marginTop: "2px", flexShrink: 0, opacity: isStatic ? 0.55 : 0.72 }}
      />
      <span
        style={{
          fontSize:      "13px",
          fontWeight:    400,
          letterSpacing: "0.006em",
          lineHeight:    1.55,
          wordBreak:     "break-all",
        }}
      >
        {label}
      </span>
      {!isStatic && (
        <ArrowUpRight
          size={10}
          style={{ marginTop: "3px", flexShrink: 0, opacity: 0.40 }}
        />
      )}
    </div>
  );

  if (isStatic || !href) return <div>{inner(false)}</div>;

  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      style={{ textDecoration: "none", display: "block" }}
      onMouseEnter={(e) => {
        const d = e.currentTarget.firstChild as HTMLElement;
        if (d) d.style.color = LINK_HOVER;
      }}
      onMouseLeave={(e) => {
        const d = e.currentTarget.firstChild as HTMLElement;
        if (d) d.style.color = LINK_RESTING;
      }}
    >
      {inner(false)}
    </a>
  );
}

/* ══════════════════════════════════════════════════════════════════
   FOOTER COMPONENT
══════════════════════════════════════════════════════════════════ */
export function Footer() {
  const homeBase = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "");
  const year     = new Date().getFullYear();

  return (
    <footer
      className="relative text-white overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, #0d2320 0%, #091a18 42%, #060f0e 100%)",
      }}
    >
      {/* Ambient glow — top-right */}
      <div
        aria-hidden="true"
        className="absolute pointer-events-none"
        style={{
          top:          "-18%",
          right:        "-8%",
          width:        "30rem",
          height:       "30rem",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(26,94,84,0.11) 0%, transparent 68%)",
          filter:       "blur(56px)",
        }}
      />

      {/* Top accent hairline */}
      <div
        aria-hidden="true"
        style={{
          position:   "absolute",
          top:        0,
          left:       0,
          right:      0,
          height:     "1px",
          background:
            "linear-gradient(90deg, transparent 0%, rgba(52,160,140,0.28) 28%, rgba(52,160,140,0.28) 72%, transparent 100%)",
        }}
      />

      <div className="max-w-6xl mx-auto px-5 sm:px-8 relative z-10">

        {/* ── Main grid ──────────────────────────────────────────── */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1.4fr] gap-y-12 gap-x-8 lg:gap-x-14"
          style={{
            paddingTop:    "5rem",
            paddingBottom: "4.25rem",
            borderBottom:  "1px solid rgba(255,255,255,0.066)",
          }}
        >

          {/* ── Brand block ──────────────────────────────────────── */}
          <div style={{ maxWidth: "21rem" }} className="sm:col-span-2 md:col-span-1">

            {/* Wordmark */}
            <a
              href={`${homeBase}/`}
              style={{ textDecoration: "none", display: "inline-block", marginBottom: "1rem" }}
            >
              <div
                style={{
                  fontSize:      "17.5px",
                  fontWeight:    700,
                  letterSpacing: "-0.032em",
                  color:         "rgba(255,255,255,0.94)",
                  lineHeight:    1.1,
                  marginBottom:  "0.3rem",
                }}
              >
                Thắng SWC
              </div>
              <div
                style={{
                  fontSize:      "10.5px",
                  fontWeight:    500,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color:         "hsl(var(--primary) / 0.52)",
                  lineHeight:    1,
                }}
              >
                Phan Văn Thắng
              </div>
            </a>

            {/* Positioning tagline */}
            <p
              style={{
                fontSize:      "12px",
                fontWeight:    400,
                fontStyle:     "italic",
                letterSpacing: "0.004em",
                color:         "rgba(255,255,255,0.30)",
                lineHeight:    1.80,
                marginBottom:  "0.875rem",
              }}
            >
              {siteConfig.brandTagline}
            </p>

            {/* Short divider */}
            <div
              aria-hidden="true"
              style={{
                width:        "2.25rem",
                height:       "1px",
                background:   "rgba(255,255,255,0.10)",
                marginBottom: "1.125rem",
              }}
            />

            {/* Description */}
            <p
              style={{
                fontSize:      "13.5px",
                fontWeight:    300,
                letterSpacing: "0.004em",
                lineHeight:    1.92,
                color:         "rgba(255,255,255,0.42)",
                marginBottom:  "2rem",
              }}
            >
              {siteConfig.footerDescription}
            </p>

            {/* Social — icon + text format */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              <a
                href={siteConfig.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display:        "inline-flex",
                  alignItems:     "center",
                  gap:            "0.5rem",
                  textDecoration: "none",
                  color:          LINK_RESTING,
                  fontSize:       "12.5px",
                  fontWeight:     400,
                  letterSpacing:  "0.006em",
                  transition:     "color 0.20s ease",
                }}
                onMouseEnter={onIn}
                onMouseLeave={onOut}
              >
                <SiYoutube size={12} style={{ flexShrink: 0, opacity: 0.78 }} />
                <span>YouTube</span>
                <ArrowUpRight size={10} style={{ opacity: 0.38, marginLeft: "1px" }} />
              </a>

              <a
                href={siteConfig.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display:        "inline-flex",
                  alignItems:     "center",
                  gap:            "0.5rem",
                  textDecoration: "none",
                  color:          LINK_RESTING,
                  fontSize:       "12.5px",
                  fontWeight:     400,
                  letterSpacing:  "0.006em",
                  transition:     "color 0.20s ease",
                }}
                onMouseEnter={onIn}
                onMouseLeave={onOut}
              >
                <SiFacebook size={12} style={{ flexShrink: 0, opacity: 0.78 }} />
                <span>Facebook</span>
                <ArrowUpRight size={10} style={{ opacity: 0.38, marginLeft: "1px" }} />
              </a>

              <a
                href={`mailto:${siteConfig.contactEmail}`}
                style={{
                  display:        "inline-flex",
                  alignItems:     "center",
                  gap:            "0.5rem",
                  textDecoration: "none",
                  color:          LINK_RESTING,
                  fontSize:       "12.5px",
                  fontWeight:     400,
                  letterSpacing:  "0.004em",
                  transition:     "color 0.20s ease",
                }}
                onMouseEnter={onIn}
                onMouseLeave={onOut}
              >
                <Mail size={12} style={{ flexShrink: 0, opacity: 0.78 }} />
                <span>{siteConfig.contactEmail}</span>
              </a>

              <div
                style={{
                  display:       "inline-flex",
                  alignItems:    "center",
                  gap:           "0.5rem",
                  color:         "rgba(255,255,255,0.24)",
                  fontSize:      "12.5px",
                  fontWeight:    400,
                  letterSpacing: "0.006em",
                }}
              >
                <MapPin size={12} style={{ flexShrink: 0, opacity: 0.65 }} />
                <span>Hà Nội, Việt Nam</span>
              </div>
            </div>
          </div>

          {/* ── Col 2: Liên kết nhanh ────────────────────────────── */}
          <div>
            <ColHead>Liên kết nhanh</ColHead>
            <ul
              style={{
                listStyle: "none",
                margin:    0,
                padding:   0,
                display:   "flex",
                flexDirection: "column",
                gap:       "0.875rem",
              }}
            >
              {FOOTER_NAV_LINKS.map(({ name, href }) => (
                <NavLink key={name} href={`${homeBase}${href}`}>
                  {name}
                </NavLink>
              ))}
            </ul>
          </div>

          {/* ── Col 3: Kiến thức ──────────────────────────────────── */}
          <div>
            <ColHead>Kiến thức</ColHead>
            <ul
              style={{
                listStyle: "none",
                margin:    0,
                padding:   0,
                display:   "flex",
                flexDirection: "column",
                gap:       "0.875rem",
              }}
            >
              {FOOTER_KIEN_THUC_LINKS.map(({ name, href }) => (
                <NavLink key={name} href={`${homeBase}${href}`}>
                  {name}
                </NavLink>
              ))}
            </ul>
          </div>

          {/* ── Col 4: Kết nối ────────────────────────────────────── */}
          <div>
            <ColHead>Kết nối</ColHead>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.125rem" }}>

              <ContactLink
                href={siteConfig.youtubeUrl}
                external
                Icon={SiYoutube}
                label="Kênh YouTube"
              />

              <ContactLink
                href={siteConfig.facebookUrl}
                external
                Icon={SiFacebook}
                label="Trang Facebook"
              />

              <ContactLink
                href={`mailto:${siteConfig.contactEmail}`}
                Icon={Mail}
                label={siteConfig.contactEmail}
              />

              <ContactLink
                Icon={MapPin}
                label="Hà Nội, Việt Nam"
                isStatic
              />

              {/* Subtle CTA invitation */}
              <div
                style={{
                  marginTop:    "0.5rem",
                  paddingTop:   "1.25rem",
                  borderTop:    "1px solid rgba(255,255,255,0.058)",
                }}
              >
                <a
                  href={`${homeBase}/cong-dong`}
                  style={{
                    display:        "inline-flex",
                    alignItems:     "center",
                    gap:            "0.375rem",
                    fontSize:       "12.5px",
                    fontWeight:     500,
                    letterSpacing:  "0.010em",
                    color:          "hsl(var(--primary) / 0.60)",
                    textDecoration: "none",
                    transition:     "color 0.20s ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.color =
                      "hsl(var(--primary) / 0.90)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.color =
                      "hsl(var(--primary) / 0.60)";
                  }}
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
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
          style={{
            paddingTop:    "1.75rem",
            paddingBottom: "1.75rem",
          }}
        >
          <p
            style={{
              fontSize:      "12px",
              fontWeight:    400,
              letterSpacing: "0.006em",
              color:         "rgba(255,255,255,0.30)",
              flexShrink:    0,
            }}
          >
            © {year} Phan Văn Thắng SWC. Bảo lưu mọi quyền.
          </p>

          {/* Separator dot — desktop only */}
          <div
            aria-hidden="true"
            className="hidden md:block"
            style={{
              width:        "3px",
              height:       "3px",
              borderRadius: "50%",
              background:   "rgba(255,255,255,0.14)",
              flexShrink:   0,
            }}
          />

          <p
            style={{
              fontSize:      "11.5px",
              fontWeight:    300,
              lineHeight:    1.78,
              color:         "rgba(255,255,255,0.24)",
              maxWidth:      "30rem",
            }}
            className="md:text-right"
          >
            {siteConfig.disclaimer}
          </p>
        </div>

      </div>
    </footer>
  );
}
