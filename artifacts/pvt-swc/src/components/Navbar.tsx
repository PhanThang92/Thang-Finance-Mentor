import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Menu, X } from "lucide-react";

/* ── Navigation data ────────────────────────────────────── */
type NavItem =
  | { name: string; href: string; dropdown?: false }
  | {
      name: string;
      href?: never;
      dropdown: true;
      items: { name: string; desc?: string; href: string }[];
    };

/* ── Per-state design tokens ────────────────────────────── */
const HERO = {
  linkColor:      "rgba(255,255,255,0.70)",
  linkHover:      "rgba(255,255,255,0.92)",
  linkActive:     "rgba(255,255,255,0.96)",
  ctaBg:          "rgba(255,255,255,0.08)",
  ctaBorder:      "rgba(255,255,255,0.18)",
  ctaHoverBg:     "rgba(255,255,255,0.14)",
  ctaHoverBorder: "rgba(255,255,255,0.26)",
} as const;

const SCROLLED = {
  linkColor:      "hsl(var(--foreground) / 0.54)",
  linkHover:      "hsl(var(--primary))",
  linkActive:     "hsl(var(--primary))",
  ctaBg:          "hsl(var(--primary))",
  ctaBorder:      "transparent",
  ctaShadow:      "0 1px 8px rgba(10,40,35,0.14)",
  ctaHoverBg:     "hsl(var(--primary) / 0.88)",
  ctaHoverShadow: "0 3px 16px rgba(10,40,35,0.22)",
} as const;

/* ── Keyframe animation (injected once) ─────────────────── */
const DROPDOWN_STYLE = `
  @keyframes pvt-dd-in {
    from { opacity: 0; transform: translateX(-50%) translateY(-5px); }
    to   { opacity: 1; transform: translateX(-50%) translateY(0px);  }
  }
`;

/* ── Chevron SVG ─────────────────────────────────────────── */
function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="8" height="8" viewBox="0 0 8 8" fill="none"
      aria-hidden="true"
      style={{
        display:    "inline-block",
        marginLeft: "5px",
        flexShrink: 0,
        opacity:    0.75,
        transform:  open ? "rotate(180deg)" : "rotate(0deg)",
        transition: "transform 0.22s ease, opacity 0.18s ease",
      }}
    >
      <path
        d="M1 2.5L4 5.5L7 2.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ── Component ───────────────────────────────────────────── */
export function Navbar() {
  const [location]            = useLocation();
  const [isScrolled,          setIsScrolled]          = useState(false);
  const [isMobileMenuOpen,    setIsMobileMenuOpen]    = useState(false);
  const [isSanPhamOpen,       setIsSanPhamOpen]       = useState(false);
  const [isMobileSanPhamOpen, setIsMobileSanPhamOpen] = useState(false);

  /* Refs */
  const linkRefs      = useRef<(HTMLElement | null)[]>([]);
  const ctaRef        = useRef<HTMLAnchorElement | null>(null);
  const dropdownEl    = useRef<HTMLLIElement | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Derived */
  const homeBase        = import.meta.env.BASE_URL.replace(/\/$/, "");
  const isHome          = location === "/" || location === "";
  const isProductPage   = location.startsWith("/san-pham");
  const isCommunityPage = location.startsWith("/cong-dong");
  const isTinTucPage    = location.startsWith("/tin-tuc");

  /* Conditional hrefs — hash on home page, absolute on all other pages */
  const sec = (hash: string) => isHome ? hash : `${homeBase}/${hash}`;

  const navLinks: NavItem[] = [
    { name: "Trang chủ",  href: sec("#trang-chu")  },
    { name: "Giới thiệu", href: sec("#gioi-thieu") },
    { name: "Nội dung",   href: sec("#noi-dung")   },
    { name: "Tin tức",    href: `${homeBase}/tin-tuc` },
    { name: "Cộng đồng",  href: `${homeBase}/cong-dong` },
    {
      name: "Sản phẩm",
      dropdown: true,
      items: [
        {
          name: "Road to $1M · SWC PASS",
          desc: "Lộ trình tài chính cá nhân có hệ thống",
          href: `${homeBase}/san-pham/duong-toi-1-trieu-do`,
        },
        {
          name: "ATLAS",
          desc: "Hệ sinh thái bất động sản kỹ thuật số",
          href: `${homeBase}/san-pham/atlas`,
        },
      ],
    },
    { name: "Liên hệ", href: sec("#lien-he") },
  ];

  /* ── Scroll ─────────────────────────────────────────────── */
  useEffect(() => {
    const fn = () => setIsScrolled(window.scrollY > 48);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  /* ── Imperative color sync ───────────────────────────────── */
  useEffect(() => {
    linkRefs.current.forEach((el, i) => {
      if (!el) return;
      /* index 3 = "Tin tức", index 4 = "Cộng đồng", index 5 = "Sản phẩm" trigger */
      const isActive = (i === 5 && isProductPage) || (i === 4 && isCommunityPage) || (i === 3 && isTinTucPage);
      el.style.color      = isActive
        ? (isScrolled ? SCROLLED.linkActive : HERO.linkActive)
        : (isScrolled ? SCROLLED.linkColor  : HERO.linkColor);
      el.style.fontWeight = isActive ? "500" : "400";
    });
    const cta = ctaRef.current;
    if (!cta) return;
    if (isScrolled) {
      cta.style.background  = SCROLLED.ctaBg;
      cta.style.borderColor = SCROLLED.ctaBorder;
      cta.style.boxShadow   = SCROLLED.ctaShadow;
    } else {
      cta.style.background  = HERO.ctaBg;
      cta.style.borderColor = HERO.ctaBorder;
      cta.style.boxShadow   = "none";
    }
  }, [isScrolled, isProductPage, isCommunityPage, isTinTucPage]);

  /* ── Dropdown open / close with delay ───────────────────── */
  const openDropdown = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setIsSanPhamOpen(true);
  };
  const scheduleClose = () => {
    closeTimerRef.current = setTimeout(() => setIsSanPhamOpen(false), 180);
  };

  /* ── Outside-click ───────────────────────────────────────── */
  useEffect(() => {
    if (!isSanPhamOpen) return;
    const fn = (e: MouseEvent) => {
      if (dropdownEl.current && !dropdownEl.current.contains(e.target as Node)) {
        setIsSanPhamOpen(false);
      }
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [isSanPhamOpen]);

  /* Cleanup */
  useEffect(() => () => { if (closeTimerRef.current) clearTimeout(closeTimerRef.current); }, []);

  /* ── Color shortcuts ─────────────────────────────────────── */
  const linkColor  = isScrolled ? SCROLLED.linkColor  : HERO.linkColor;
  const linkHover  = isScrolled ? SCROLLED.linkHover  : HERO.linkHover;
  const linkActive = isScrolled ? SCROLLED.linkActive : HERO.linkActive;

  /* ── Base link style ─────────────────────────────────────── */
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
    whiteSpace:     "nowrap",
  };

  /* ─────────────────────────────────────────────────────────── */
  return (
    <>
      {/* Inject keyframe once */}
      <style>{DROPDOWN_STYLE}</style>

      <nav
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0,
          zIndex: 50,
          transition: "background 0.42s ease, box-shadow 0.42s ease, padding 0.42s ease",
          ...(isScrolled
            ? {
                background:           "rgba(251,253,251,0.97)",
                backdropFilter:       "blur(22px)",
                WebkitBackdropFilter: "blur(22px)",
                boxShadow:            "0 1px 0 rgba(0,0,0,0.055), 0 4px 24px rgba(10,40,35,0.05)",
                paddingTop:    "0.75rem",
                paddingBottom: "0.75rem",
              }
            : {
                background:
                  "linear-gradient(to bottom, rgba(0,0,0,0.14) 0%, rgba(0,0,0,0.03) 65%, transparent 100%)",
                backdropFilter:       "none",
                WebkitBackdropFilter: "none",
                boxShadow:            "none",
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

                /* ── Dropdown item ─────────────────────── */
                if (link.dropdown) {
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
                      {/* Trigger */}
                      <button
                        ref={(el) => { linkRefs.current[i] = el; }}
                        style={{
                          ...baseLinkStyle,
                          color:      triggerColor,
                          fontWeight: isProductPage ? 500 : 400,
                        }}
                        onClick={() => isSanPhamOpen ? setIsSanPhamOpen(false) : openDropdown()}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.color = linkHover;
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.color = triggerColor;
                        }}
                      >
                        {link.name}

                        {/* Active underline */}
                        {isProductPage && !isSanPhamOpen && (
                          <span
                            aria-hidden="true"
                            style={{
                              position:     "absolute",
                              bottom:       "-3px",
                              left:         0,
                              right:        "14px",
                              height:       "1.5px",
                              background:   isScrolled
                                ? "hsl(var(--primary) / 0.55)"
                                : "rgba(255,255,255,0.46)",
                              borderRadius: "999px",
                            }}
                          />
                        )}

                        <Chevron open={isSanPhamOpen} />
                      </button>

                      {/*
                        ── Invisible hover bridge ───────────────────────────
                        Absolutely positioned descendant that fills the visual
                        gap between the trigger bottom and the panel top.
                        Because it is a descendant of <li>, the browser's
                        native mouseleave event will NOT fire on <li> while
                        the cursor passes through this area, eliminating the
                        accidental-close problem without any timers.
                      */}
                      <div
                        aria-hidden="true"
                        style={{
                          position: "absolute",
                          top:      "100%",
                          left:     "-24px",
                          right:    "-24px",
                          height:   "12px",   /* safely covers the 6px gap */
                          zIndex:   99,
                        }}
                      />

                      {/* ── Dropdown panel ───────────────── */}
                      {isSanPhamOpen && (
                        <div
                          role="menu"
                          onMouseEnter={openDropdown}
                          onMouseLeave={scheduleClose}
                          style={{
                            position:             "absolute",
                            top:                  "calc(100% + 6px)",
                            left:                 "50%",
                            transform:            "translateX(-50%)",
                            minWidth:             "268px",
                            background:           "rgba(251,253,251,0.99)",
                            backdropFilter:       "blur(24px)",
                            WebkitBackdropFilter: "blur(24px)",
                            boxShadow:
                              "0 0 0 1px rgba(0,0,0,0.06), 0 4px 12px rgba(10,40,35,0.07), 0 12px 32px rgba(10,40,35,0.10)",
                            borderRadius: "0.75rem",
                            padding:      "0.375rem 0",
                            zIndex:       100,
                            animation:    "pvt-dd-in 0.18s cubic-bezier(0.16,1,0.3,1) forwards",
                          }}
                        >
                          {link.items.map((item) => {
                            const itemActive =
                              isProductPage && item.href.endsWith(location);

                            return (
                              <a
                                key={item.name}
                                href={item.href}
                                role="menuitem"
                                style={{
                                  display:        "block",
                                  padding:        "0.7rem 1.125rem 0.7rem 1rem",
                                  textDecoration: "none",
                                  transition:
                                    "background 0.16s ease, border-color 0.16s ease",
                                  borderLeft: `2px solid ${
                                    itemActive
                                      ? "hsl(var(--primary))"
                                      : "transparent"
                                  }`,
                                  background: itemActive
                                    ? "hsl(var(--primary) / 0.055)"
                                    : "transparent",
                                  borderRadius: "0 0.5rem 0.5rem 0",
                                  margin:       "0 0.375rem 0 0",
                                }}
                                onMouseEnter={(e) => {
                                  const el = e.currentTarget as HTMLElement;
                                  el.style.background   = "hsl(var(--primary) / 0.08)";
                                  el.style.borderColor  = "hsl(var(--primary))";
                                }}
                                onMouseLeave={(e) => {
                                  const el = e.currentTarget as HTMLElement;
                                  el.style.background  = itemActive
                                    ? "hsl(var(--primary) / 0.055)"
                                    : "transparent";
                                  el.style.borderColor = itemActive
                                    ? "hsl(var(--primary))"
                                    : "transparent";
                                }}
                                onClick={() => setIsSanPhamOpen(false)}
                              >
                                <span style={{
                                  display:       "block",
                                  fontSize:      "13px",
                                  fontWeight:    itemActive ? 500 : 400,
                                  letterSpacing: "0.008em",
                                  color:         itemActive
                                    ? "hsl(var(--primary))"
                                    : "hsl(var(--foreground) / 0.72)",
                                  lineHeight:    1.3,
                                  marginBottom:  item.desc ? "0.2rem" : 0,
                                  transition:    "color 0.16s ease",
                                }}>
                                  {item.name}
                                </span>
                                {item.desc && (
                                  <span style={{
                                    display:       "block",
                                    fontSize:      "11.5px",
                                    fontWeight:    300,
                                    letterSpacing: "0.006em",
                                    color:         "hsl(var(--foreground) / 0.40)",
                                    lineHeight:    1.45,
                                  }}>
                                    {item.desc}
                                  </span>
                                )}
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
                      style={{ ...baseLinkStyle, color: linkColor }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.color = linkHover;
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.color = linkColor;
                      }}
                    >
                      {link.name}
                    </a>
                  </li>
                );
              })}
            </ul>

            {/* ── CTA ──────────────────────────────────── */}
            <a
              ref={ctaRef}
              href={`${homeBase}/cong-dong#dang-ky`}
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
                el.style.background = isScrolled ? SCROLLED.ctaHoverBg : HERO.ctaHoverBg;
                el.style.boxShadow  = isScrolled ? SCROLLED.ctaHoverShadow : "none";
                if (!isScrolled) el.style.borderColor = HERO.ctaHoverBorder;
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.background  = isScrolled ? SCROLLED.ctaBg  : HERO.ctaBg;
                el.style.borderColor = isScrolled ? SCROLLED.ctaBorder : HERO.ctaBorder;
                el.style.boxShadow   = isScrolled ? SCROLLED.ctaShadow : "none";
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
            onClick={() => setIsMobileMenuOpen((v) => !v)}
            aria-label={isMobileMenuOpen ? "Đóng menu" : "Mở menu"}
            data-testid="btn-mobile-menu"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* ── Mobile drawer ────────────────────────────────── */}
        {isMobileMenuOpen && (
          <div
            className="md:hidden absolute top-full left-0 w-full"
            style={{
              background:           "rgba(251,253,251,0.99)",
              backdropFilter:       "blur(22px)",
              WebkitBackdropFilter: "blur(22px)",
              borderBottom:         "1px solid rgba(0,0,0,0.07)",
              boxShadow:            "0 8px 32px rgba(10,40,35,0.08)",
            }}
          >
            <div className="max-w-6xl mx-auto px-5 py-4 flex flex-col">
              {navLinks.map((link) => {

                /* ── Mobile dropdown ─────────────────────── */
                if (link.dropdown) {
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
                          padding:        "0.72rem 0",
                          background:     "none",
                          borderTop:      "none",
                          borderLeft:     "none",
                          borderRight:    "none",
                          borderBottom:   isMobileSanPhamOpen
                            ? "none"
                            : "1px solid hsl(var(--border) / 0.38)",
                          cursor:         "pointer",
                        }}
                        onClick={() => setIsMobileSanPhamOpen((v) => !v)}
                      >
                        <span>{link.name}</span>
                        <span style={{
                          color:      isProductPage
                            ? "hsl(var(--primary) / 0.65)"
                            : "hsl(var(--foreground) / 0.40)",
                          transition: "transform 0.22s ease",
                          transform:  isMobileSanPhamOpen ? "rotate(180deg)" : "rotate(0deg)",
                          display:    "inline-flex",
                        }}>
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                            <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      </button>

                      {isMobileSanPhamOpen && (
                        <div style={{
                          borderBottom: "1px solid hsl(var(--border) / 0.38)",
                          padding:      "0.25rem 0 0.5rem",
                        }}>
                          {link.items.map((item) => {
                            const itemActive =
                              isProductPage && item.href.endsWith(location);

                            return (
                              <a
                                key={item.name}
                                href={item.href}
                                style={{
                                  display:        "flex",
                                  alignItems:     "flex-start",
                                  gap:            "0.625rem",
                                  padding:        "0.6rem 0 0.6rem 1rem",
                                  textDecoration: "none",
                                  borderLeft:     `2px solid ${
                                    itemActive
                                      ? "hsl(var(--primary))"
                                      : "hsl(var(--primary) / 0.30)"
                                  }`,
                                  marginLeft:  "0.25rem",
                                  borderRadius: "0 0.375rem 0.375rem 0",
                                  background:  itemActive
                                    ? "hsl(var(--primary) / 0.05)"
                                    : "transparent",
                                  transition: "background 0.16s ease",
                                }}
                                onClick={() => {
                                  setIsMobileMenuOpen(false);
                                  setIsMobileSanPhamOpen(false);
                                }}
                              >
                                <div>
                                  <div style={{
                                    fontSize:      "13.5px",
                                    fontWeight:    itemActive ? 500 : 400,
                                    letterSpacing: "0.008em",
                                    color:         itemActive
                                      ? "hsl(var(--primary))"
                                      : "hsl(var(--foreground) / 0.68)",
                                    lineHeight:    1.3,
                                    marginBottom:  item.desc ? "0.2rem" : 0,
                                  }}>
                                    {item.name}
                                  </div>
                                  {item.desc && (
                                    <div style={{
                                      fontSize:   "11.5px",
                                      fontWeight: 300,
                                      color:      "hsl(var(--foreground) / 0.38)",
                                      lineHeight: 1.45,
                                    }}>
                                      {item.desc}
                                    </div>
                                  )}
                                </div>
                              </a>
                            );
                          })}
                        </div>
                      )}
                    </React.Fragment>
                  );
                }

                /* ── Plain mobile link ───────────────────── */
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    style={{
                      fontSize:      "14px",
                      fontWeight:    400,
                      letterSpacing: "0.010em",
                      color:         "hsl(var(--foreground) / 0.68)",
                      padding:       "0.72rem 0",
                      borderBottom:  "1px solid hsl(var(--border) / 0.38)",
                      textDecoration: "none",
                      transition:    "color 0.18s ease",
                    }}
                    onClick={() => setIsMobileMenuOpen(false)}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.color = "hsl(var(--primary))";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.color =
                        "hsl(var(--foreground) / 0.68)";
                    }}
                  >
                    {link.name}
                  </a>
                );
              })}

              {/* Mobile CTA */}
              <a
                href={`${homeBase}/cong-dong#dang-ky`}
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
                  boxShadow:      "0 1px 10px rgba(10,40,35,0.16)",
                  transition:     "background 0.22s ease, box-shadow 0.22s ease",
                }}
                onClick={() => setIsMobileMenuOpen(false)}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = SCROLLED.ctaHoverBg;
                  el.style.boxShadow  = SCROLLED.ctaHoverShadow;
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = "hsl(var(--primary))";
                  el.style.boxShadow  = "0 1px 10px rgba(10,40,35,0.16)";
                }}
              >
                Tham gia cộng đồng
              </a>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
