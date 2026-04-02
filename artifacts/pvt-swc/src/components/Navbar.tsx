import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Menu, X } from "lucide-react";

/* ── Navigation data ────────────────────────────────────── */
type NavItem =
  | { name: string; href: string; dropdown?: false }
  | { name: string; href?: never; dropdown: true; items: { name: string; href: string }[] };

/* ── Per-state design tokens ────────────────────────────── */
const HERO = {
  linkColor:      "rgba(255,255,255,0.70)",
  linkHover:      "rgba(255,255,255,0.92)",
  linkActive:     "rgba(255,255,255,0.96)",
  ctaBg:          "rgba(255,255,255,0.08)",
  ctaBorder:      "rgba(255,255,255,0.18)",
  ctaHoverBg:     "rgba(255,255,255,0.14)",
  ctaHoverBorder: "rgba(255,255,255,0.25)",
} as const;

const SCROLLED = {
  linkColor:      "hsl(var(--foreground) / 0.56)",
  linkHover:      "hsl(var(--primary))",
  linkActive:     "hsl(var(--primary))",
  ctaBg:          "hsl(var(--primary))",
  ctaBorder:      "transparent",
  ctaShadow:      "0 1px 8px rgba(10,40,35,0.14)",
  ctaHoverShadow: "0 2px 14px rgba(10,40,35,0.20)",
} as const;

/* ── Chevron SVG ─────────────────────────────────────────── */
function Chevron({ open, color }: { open: boolean; color: string }) {
  return (
    <svg
      width="8" height="8" viewBox="0 0 8 8" fill="none"
      style={{
        display:    "inline-block",
        marginLeft: "5px",
        flexShrink: 0,
        opacity:    0.85,
        transform:  open ? "rotate(180deg)" : "rotate(0deg)",
        transition: "transform 0.25s ease",
        color,
      }}
    >
      <path
        d="M1 2.5L4 5.5L7 2.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Navbar() {
  const [location]            = useLocation();
  const [isScrolled,          setIsScrolled]          = useState(false);
  const [isMobileMenuOpen,    setIsMobileMenuOpen]    = useState(false);
  const [isSanPhamOpen,       setIsSanPhamOpen]       = useState(false);
  const [isMobileSanPhamOpen, setIsMobileSanPhamOpen] = useState(false);

  /* Refs */
  const linkRefs       = useRef<(HTMLElement | null)[]>([]);
  const ctaRef         = useRef<HTMLAnchorElement | null>(null);
  const dropdownEl     = useRef<HTMLLIElement | null>(null);
  const closeTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Derived state */
  const homeBase       = import.meta.env.BASE_URL.replace(/\/$/, "");
  const isHome         = location === "/" || location === "";
  const isProductPage  = location.startsWith("/san-pham");
  const isSubItemActive = location === "/san-pham/duong-toi-1-trieu-do";

  /* Conditional hrefs — hash on home, absolute elsewhere */
  const sec = (hash: string) => isHome ? hash : `${homeBase}/${hash}`;

  const navLinks: NavItem[] = [
    { name: "Trang chủ",  href: sec("#trang-chu")  },
    { name: "Giới thiệu", href: sec("#gioi-thieu") },
    { name: "Nội dung",   href: sec("#noi-dung")   },
    { name: "Cộng đồng",  href: sec("#cong-dong")  },
    {
      name: "Sản phẩm",
      dropdown: true,
      items: [
        {
          name: "Road to $1M · SWC PASS",
          href: `${homeBase}/san-pham/duong-toi-1-trieu-do`,
        },
      ],
    },
    { name: "Liên hệ", href: sec("#lien-he") },
  ];

  /* ── Scroll detection ───────────────────────────────── */
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 48);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── Imperative color sync on scroll state + active page ── */
  useEffect(() => {
    linkRefs.current.forEach((el, i) => {
      if (!el) return;
      /* Index 4 = "Sản phẩm" dropdown trigger */
      if (i === 4 && isProductPage) {
        el.style.color      = isScrolled ? SCROLLED.linkActive : HERO.linkActive;
        el.style.fontWeight = "500";
      } else {
        el.style.color      = isScrolled ? SCROLLED.linkColor : HERO.linkColor;
        el.style.fontWeight = "400";
      }
    });
    const cta = ctaRef.current;
    if (!cta) return;
    if (isScrolled) {
      cta.style.background  = SCROLLED.ctaBg;
      cta.style.borderColor = SCROLLED.ctaBorder;
      cta.style.color       = "#fff";
      cta.style.boxShadow   = SCROLLED.ctaShadow;
    } else {
      cta.style.background  = HERO.ctaBg;
      cta.style.borderColor = HERO.ctaBorder;
      cta.style.color       = "#fff";
      cta.style.boxShadow   = "none";
    }
  }, [isScrolled, isProductPage]);

  /* ── Dropdown close delay helpers ───────────────────── */
  const openDropdown = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setIsSanPhamOpen(true);
  };

  const scheduleClose = () => {
    closeTimerRef.current = setTimeout(() => setIsSanPhamOpen(false), 160);
  };

  /* ── Outside-click closes dropdown ──────────────────── */
  useEffect(() => {
    if (!isSanPhamOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropdownEl.current && !dropdownEl.current.contains(e.target as Node)) {
        setIsSanPhamOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isSanPhamOpen]);

  /* Cleanup timer on unmount */
  useEffect(() => () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
  }, []);

  /* ── Derived color shortcuts ─────────────────────────── */
  const linkColor  = isScrolled ? SCROLLED.linkColor  : HERO.linkColor;
  const linkHover  = isScrolled ? SCROLLED.linkHover  : HERO.linkHover;
  const linkActive = isScrolled ? SCROLLED.linkActive : HERO.linkActive;

  /* ── Shared nav link style ───────────────────────────── */
  const baseLinkStyle: React.CSSProperties = {
    fontSize:       "13px",
    fontWeight:     400,
    letterSpacing:  "0.010em",
    textDecoration: "none",
    transition:     "color 0.18s ease",
    background:     "none",
    border:         "none",
    padding:        0,
    cursor:         "pointer",
    display:        "inline-flex",
    alignItems:     "center",
    lineHeight:     1,
    position:       "relative",
  };

  return (
    <nav
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0,
        zIndex: 50,
        transition: "background 0.45s ease, box-shadow 0.45s ease, padding 0.45s ease",
        ...(isScrolled
          ? {
              background:           "rgba(251,253,251,0.97)",
              backdropFilter:       "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              boxShadow:  "0 1px 0 rgba(0,0,0,0.055), 0 4px 24px rgba(10,40,35,0.05)",
              paddingTop:    "0.75rem",
              paddingBottom: "0.75rem",
            }
          : {
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
          href={`${homeBase}/`}
          style={{
            fontSize:       "15px",
            fontWeight:     700,
            letterSpacing:  "-0.02em",
            color:          isScrolled ? "hsl(var(--primary))" : "rgba(255,255,255,0.92)",
            textDecoration: "none",
            transition:     "color 0.3s ease",
          }}
        >
          Thắng SWC
        </a>

        {/* ── Desktop nav ──────────────────────────────── */}
        <div className="hidden md:flex items-center gap-6">
          <ul className="flex gap-6" style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {navLinks.map((link, i) => {

              if (link.dropdown) {
                /* ── Dropdown trigger ──────────────────── */
                const triggerColor = isProductPage
                  ? (isSanPhamOpen ? linkHover : linkActive)
                  : (isSanPhamOpen ? linkHover : linkColor);

                return (
                  <li
                    key={link.name}
                    ref={dropdownEl}
                    style={{ position: "relative" }}
                    onMouseEnter={openDropdown}
                    onMouseLeave={scheduleClose}
                  >
                    <button
                      ref={(el) => { linkRefs.current[i] = el; }}
                      style={{
                        ...baseLinkStyle,
                        color:      triggerColor,
                        fontWeight: isProductPage ? 500 : 400,
                      }}
                      onClick={() => isSanPhamOpen ? setIsSanPhamOpen(false) : openDropdown()}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = linkHover; }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.color = triggerColor;
                      }}
                    >
                      {link.name}

                      {/* Active page underline */}
                      {isProductPage && !isSanPhamOpen && (
                        <span style={{
                          position:     "absolute",
                          bottom:       "-2px",
                          left:         0,
                          right:        "13px",  /* exclude chevron width */
                          height:       "1.5px",
                          background:   isScrolled
                            ? "hsl(var(--primary) / 0.60)"
                            : "rgba(255,255,255,0.50)",
                          borderRadius: "999px",
                        }} />
                      )}

                      <Chevron open={isSanPhamOpen} color="currentColor" />
                    </button>

                    {/* ── Dropdown panel ─────────────────── */}
                    {isSanPhamOpen && (
                      <div
                        onMouseEnter={openDropdown}
                        onMouseLeave={scheduleClose}
                        style={{
                          position:             "absolute",
                          top:                  "calc(100% + 6px)",
                          left:                 "50%",
                          transform:            "translateX(-50%)",
                          minWidth:             "252px",
                          background:           "rgba(251,253,251,0.98)",
                          backdropFilter:       "blur(20px)",
                          WebkitBackdropFilter: "blur(20px)",
                          boxShadow:
                            "0 2px 8px rgba(10,40,35,0.06), 0 8px 28px rgba(10,40,35,0.11)",
                          border:       "1px solid rgba(0,0,0,0.07)",
                          borderRadius: "0.625rem",
                          padding:      "0.5rem 0",
                          zIndex:       100,
                        }}
                      >
                        {link.items.map((item) => {
                          const itemActive = location === "/san-pham/duong-toi-1-trieu-do"
                            && item.href.endsWith("duong-toi-1-trieu-do");

                          return (
                            <a
                              key={item.name}
                              href={item.href}
                              style={{
                                display:        "block",
                                padding:        "0.75rem 1.25rem",
                                fontSize:       "13px",
                                fontWeight:     itemActive ? 500 : 400,
                                letterSpacing:  "0.008em",
                                color:          itemActive
                                  ? "hsl(var(--primary))"
                                  : "hsl(var(--foreground) / 0.60)",
                                background:     itemActive
                                  ? "hsl(var(--primary) / 0.07)"
                                  : "transparent",
                                textDecoration: "none",
                                transition:     "color 0.18s ease, background 0.18s ease",
                              }}
                              onMouseEnter={(e) => {
                                const el = e.currentTarget as HTMLElement;
                                el.style.color      = "hsl(var(--primary))";
                                el.style.background = "hsl(var(--primary) / 0.09)";
                              }}
                              onMouseLeave={(e) => {
                                const el = e.currentTarget as HTMLElement;
                                el.style.color      = itemActive
                                  ? "hsl(var(--primary))"
                                  : "hsl(var(--foreground) / 0.60)";
                                el.style.background = itemActive
                                  ? "hsl(var(--primary) / 0.07)"
                                  : "transparent";
                              }}
                              onClick={() => setIsSanPhamOpen(false)}
                            >
                              {item.name}
                            </a>
                          );
                        })}
                      </div>
                    )}
                  </li>
                );
              }

              /* ── Plain link ────────────────────────── */
              return (
                <li key={link.name}>
                  <a
                    ref={(el) => { linkRefs.current[i] = el; }}
                    href={link.href}
                    style={{
                      ...baseLinkStyle,
                      color: linkColor,
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = linkHover; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = linkColor; }}
                  >
                    {link.name}
                  </a>
                </li>
              );
            })}
          </ul>

          {/* ── CTA button ───────────────────────────── */}
          <a
            ref={ctaRef}
            href={sec("#lien-he")}
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
                el.style.background = "hsl(var(--primary) / 0.88)";
                el.style.boxShadow  = SCROLLED.ctaHoverShadow;
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
            background:     "rgba(251,253,251,0.98)",
            backdropFilter: "blur(20px)",
            borderBottom:   "1px solid rgba(0,0,0,0.07)",
            boxShadow:      "0 4px 24px rgba(10,40,35,0.07)",
          }}
        >
          <div className="max-w-6xl mx-auto px-5 py-4 flex flex-col" style={{ gap: "0" }}>
            {navLinks.map((link) => {

              if (link.dropdown) {
                /* ── Mobile accordion ──────────────────── */
                return (
                  <React.Fragment key={link.name}>
                    <button
                      style={{
                        display:        "flex",
                        alignItems:     "center",
                        justifyContent: "space-between",
                        width:          "100%",
                        fontSize:       "14px",
                        fontWeight:     isProductPage ? 500 : 400,
                        letterSpacing:  "0.010em",
                        color:          isProductPage
                          ? "hsl(var(--primary))"
                          : "hsl(var(--foreground) / 0.68)",
                        padding:        "0.7rem 0",
                        textDecoration: "none",
                        background:     "none",
                        borderTop:      "none",
                        borderLeft:     "none",
                        borderRight:    "none",
                        borderBottom:   isMobileSanPhamOpen
                          ? "none"
                          : "1px solid hsl(var(--border) / 0.40)",
                        cursor:         "pointer",
                      }}
                      onClick={() => setIsMobileSanPhamOpen((v) => !v)}
                    >
                      <span>{link.name}</span>
                      <Chevron
                        open={isMobileSanPhamOpen}
                        color={isProductPage
                          ? "hsl(var(--primary) / 0.70)"
                          : "hsl(var(--foreground) / 0.45)"}
                      />
                    </button>

                    {isMobileSanPhamOpen && (
                      <div style={{ borderBottom: "1px solid hsl(var(--border) / 0.40)", paddingBottom: "0.25rem" }}>
                        {link.items.map((item) => {
                          const itemActive = item.href.endsWith("duong-toi-1-trieu-do")
                            && isSubItemActive;
                          return (
                            <a
                              key={item.name}
                              href={item.href}
                              style={{
                                display:        "flex",
                                alignItems:     "center",
                                gap:            "0.625rem",
                                fontSize:       "13.5px",
                                fontWeight:     itemActive ? 500 : 400,
                                letterSpacing:  "0.008em",
                                color:          itemActive
                                  ? "hsl(var(--primary))"
                                  : "hsl(var(--foreground) / 0.55)",
                                padding:        "0.6rem 0 0.6rem 1rem",
                                textDecoration: "none",
                                transition:     "color 0.18s ease",
                              }}
                              onMouseEnter={(e) => {
                                (e.currentTarget as HTMLElement).style.color = "hsl(var(--primary))";
                              }}
                              onMouseLeave={(e) => {
                                (e.currentTarget as HTMLElement).style.color = itemActive
                                  ? "hsl(var(--primary))"
                                  : "hsl(var(--foreground) / 0.55)";
                              }}
                              onClick={() => {
                                setIsMobileMenuOpen(false);
                                setIsMobileSanPhamOpen(false);
                              }}
                            >
                              <span style={{
                                width:        "4px",
                                height:       "4px",
                                borderRadius: "50%",
                                background:   itemActive
                                  ? "hsl(var(--primary))"
                                  : "hsl(var(--primary) / 0.55)",
                                flexShrink:   0,
                              }} />
                              {item.name}
                            </a>
                          );
                        })}
                      </div>
                    )}
                  </React.Fragment>
                );
              }

              /* ── Plain mobile link ─────────────────── */
              return (
                <a
                  key={link.name}
                  href={link.href}
                  style={{
                    fontSize:       "14px",
                    fontWeight:     400,
                    letterSpacing:  "0.010em",
                    color:          "hsl(var(--foreground) / 0.68)",
                    padding:        "0.7rem 0",
                    borderBottom:   "1px solid hsl(var(--border) / 0.40)",
                    textDecoration: "none",
                    transition:     "color 0.18s ease",
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
              );
            })}

            <a
              href={sec("#lien-he")}
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
