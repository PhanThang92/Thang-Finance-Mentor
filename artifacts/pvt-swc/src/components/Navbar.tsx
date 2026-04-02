import React, { useState, useEffect, useRef } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { name: "Trang chủ", href: "#trang-chu" },
  { name: "Giới thiệu", href: "#gioi-thieu" },
  { name: "Nội dung", href: "#noi-dung" },
  { name: "Cộng đồng", href: "#cong-dong" },
  { name: "Sản phẩm", href: `${import.meta.env.BASE_URL}san-pham/duong-toi-1-trieu-do` },
  { name: "Liên hệ", href: "#lien-he" },
];

/* ── Per-state design tokens ────────────────────────────── */
const HERO = {
  linkColor:      "rgba(255,255,255,0.70)",
  linkHover:      "rgba(255,255,255,0.92)",
  ctaBg:          "rgba(255,255,255,0.08)",
  ctaBorder:      "rgba(255,255,255,0.18)",
  ctaHoverBg:     "rgba(255,255,255,0.14)",
  ctaHoverBorder: "rgba(255,255,255,0.25)",
} as const;

const SCROLLED = {
  linkColor:      "hsl(var(--foreground) / 0.56)",
  linkHover:      "hsl(var(--primary))",
  ctaBg:          "hsl(var(--primary))",
  ctaBorder:      "transparent",
  ctaShadow:      "0 1px 8px rgba(10,40,35,0.14)",
  ctaHoverShadow: "0 2px 14px rgba(10,40,35,0.20)",
} as const;

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const ctaRef   = useRef<HTMLAnchorElement | null>(null);

  /* Scroll detection */
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 48);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Imperatively sync colors when state flips — avoids React re-render jank */
  useEffect(() => {
    linkRefs.current.forEach((el) => {
      if (!el) return;
      el.style.color = isScrolled ? SCROLLED.linkColor : HERO.linkColor;
    });
    const cta = ctaRef.current;
    if (!cta) return;
    if (isScrolled) {
      cta.style.background   = SCROLLED.ctaBg;
      cta.style.borderColor  = SCROLLED.ctaBorder;
      cta.style.color        = "#fff";
      cta.style.boxShadow    = SCROLLED.ctaShadow;
    } else {
      cta.style.background   = HERO.ctaBg;
      cta.style.borderColor  = HERO.ctaBorder;
      cta.style.color        = "#fff";
      cta.style.boxShadow    = "none";
    }
  }, [isScrolled]);

  return (
    <nav
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0,
        zIndex: 50,
        transition: "background 0.45s ease, box-shadow 0.45s ease, padding 0.45s ease",
        ...(isScrolled
          ? {
              /* ── Scrolled: warm off-white frosted bar ─── */
              background:           "rgba(251,253,251,0.97)",
              backdropFilter:       "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              /* Hairline + very subtle ambient depth */
              boxShadow:  "0 1px 0 rgba(0,0,0,0.055), 0 4px 24px rgba(10,40,35,0.05)",
              paddingTop:    "0.75rem",
              paddingBottom: "0.75rem",
            }
          : {
              /* ── Hero: premium overlay gradient ─────────
                 Soft darkness only at the very top, fades
                 to fully transparent so it reads as part
                 of the hero, not a separate bar.            */
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.14) 0%, rgba(0,0,0,0.03) 65%, transparent 100%)",
              backdropFilter:       "none",
              WebkitBackdropFilter: "none",
              boxShadow:    "none",
              paddingTop:    "1.25rem",
              paddingBottom: "1.25rem",
            }),
      }}
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8 flex items-center justify-between">

        {/* ── Logo ─────────────────────────────────────── */}
        <a
          href="#trang-chu"
          style={{
            fontSize:      "15px",
            fontWeight:    700,
            letterSpacing: "-0.02em",
            color:         isScrolled ? "hsl(var(--primary))" : "rgba(255,255,255,0.92)",
            textDecoration: "none",
            transition:    "color 0.3s ease",
          }}
        >
          Thắng SWC
        </a>

        {/* ── Desktop nav ──────────────────────────────── */}
        <div className="hidden md:flex items-center gap-6">
          <ul className="flex gap-6" style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {navLinks.map((link, i) => (
              <li key={link.name}>
                <a
                  ref={(el) => { linkRefs.current[i] = el; }}
                  href={link.href}
                  style={{
                    fontSize:      "13px",
                    fontWeight:    400,
                    letterSpacing: "0.010em",
                    color:         isScrolled ? SCROLLED.linkColor : HERO.linkColor,
                    textDecoration: "none",
                    transition:    "color 0.18s ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.color =
                      isScrolled ? SCROLLED.linkHover : HERO.linkHover;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.color =
                      isScrolled ? SCROLLED.linkColor : HERO.linkColor;
                  }}
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>

          {/* ── CTA button ───────────────────────────── */}
          <a
            ref={ctaRef}
            href="#lien-he"
            style={{
              display:        "inline-flex",
              alignItems:     "center",
              height:         "34px",
              padding:        "0 18px",
              borderRadius:   "999px",
              border:         "1px solid",
              fontSize:       "13px",
              fontWeight:     500,
              letterSpacing:  "0.014em",
              textDecoration: "none",
              color:          "#fff",
              transition:
                "background 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease",
              /* Initial inline values — imperative effect overrides these */
              ...(isScrolled
                ? {
                    background:  SCROLLED.ctaBg,
                    borderColor: SCROLLED.ctaBorder,
                    boxShadow:   SCROLLED.ctaShadow,
                  }
                : {
                    background:  HERO.ctaBg,
                    borderColor: HERO.ctaBorder,
                    boxShadow:   "none",
                  }),
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              if (isScrolled) {
                el.style.background  = "hsl(var(--primary) / 0.88)";
                el.style.boxShadow   = SCROLLED.ctaHoverShadow;
              } else {
                el.style.background  = HERO.ctaHoverBg;
                el.style.borderColor = HERO.ctaHoverBorder;
              }
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              if (isScrolled) {
                el.style.background = SCROLLED.ctaBg;
                el.style.boxShadow  = SCROLLED.ctaShadow;
              } else {
                el.style.background  = HERO.ctaBg;
                el.style.borderColor = HERO.ctaBorder;
              }
            }}
          >
            Tham gia cộng đồng
          </a>
        </div>

        {/* ── Mobile hamburger ─────────────────────────── */}
        <button
          className="md:hidden p-2 rounded-md"
          style={{
            color:      isScrolled ? "hsl(var(--foreground))" : "rgba(255,255,255,0.88)",
            background: "none",
            border:     "none",
            cursor:     "pointer",
          }}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
          data-testid="btn-mobile-menu"
        >
          {isMobileMenuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>

      {/* ── Mobile drawer ──────────────────────────────── */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden absolute top-full left-0 w-full"
          style={{
            background:    "rgba(251,253,251,0.98)",
            backdropFilter: "blur(20px)",
            borderBottom:  "1px solid rgba(0,0,0,0.07)",
            boxShadow:     "0 4px 24px rgba(10,40,35,0.07)",
          }}
        >
          <div
            className="max-w-6xl mx-auto px-5 py-4 flex flex-col"
            style={{ gap: "0" }}
          >
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                style={{
                  fontSize:      "14px",
                  fontWeight:    400,
                  letterSpacing: "0.010em",
                  color:         "hsl(var(--foreground) / 0.68)",
                  padding:       "0.7rem 0",
                  borderBottom:  "1px solid hsl(var(--border) / 0.40)",
                  textDecoration: "none",
                  transition:    "color 0.18s ease",
                }}
                onClick={() => setIsMobileMenuOpen(false)}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "hsl(var(--primary))";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "hsl(var(--foreground) / 0.68)";
                }}
              >
                {link.name}
              </a>
            ))}
            <a
              href="#lien-he"
              style={{
                marginTop:      "0.875rem",
                display:        "flex",
                alignItems:     "center",
                justifyContent: "center",
                height:         "2.625rem",
                borderRadius:   "999px",
                background:     "hsl(var(--primary))",
                fontSize:       "13.5px",
                fontWeight:     500,
                letterSpacing:  "0.014em",
                color:          "#fff",
                textDecoration: "none",
                boxShadow:      "0 1px 8px rgba(10,40,35,0.14)",
                transition:     "background 0.22s ease, box-shadow 0.22s ease",
              }}
              onClick={() => setIsMobileMenuOpen(false)}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = "hsl(var(--primary) / 0.88)";
                el.style.boxShadow  = "0 2px 14px rgba(10,40,35,0.20)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = "hsl(var(--primary))";
                el.style.boxShadow  = "0 1px 8px rgba(10,40,35,0.14)";
              }}
            >
              Tham gia cộng đồng
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
