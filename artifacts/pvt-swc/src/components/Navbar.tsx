import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { Menu, X } from "lucide-react";
import { NAV_ITEMS, KIEN_THUC_PATHS } from "@/config/navigationConfig";

/* ── Navigation types ──────────────────────────────────────────────── */
type NavDropdownItem = { name: string; desc?: string; href: string };
type NavItem =
  | { name: string; href: string; dropdownKey?: never; dropdown?: false }
  | { name: string; href?: never; dropdown: true; dropdownKey: string; items: NavDropdownItem[] };

/* ── Design tokens per scroll state ───────────────────────────────── */
const HERO = {
  linkColor:      "rgba(255,255,255,0.65)",
  linkHover:      "rgba(255,255,255,0.94)",
  linkActive:     "rgba(255,255,255,0.96)",
  ctaBg:          "rgba(255,255,255,0.08)",
  ctaBorder:      "rgba(255,255,255,0.16)",
  ctaHoverBg:     "rgba(255,255,255,0.14)",
  ctaHoverBorder: "rgba(255,255,255,0.26)",
} as const;

const SCROLLED = {
  linkColor:      "hsl(var(--foreground) / 0.50)",
  linkHover:      "hsl(var(--primary))",
  linkActive:     "hsl(var(--primary))",
  ctaBg:          "hsl(var(--primary))",
  ctaBorder:      "transparent",
  ctaShadow:      "0 1px 8px rgba(10,40,35,0.12)",
  ctaHoverBg:     "hsl(var(--primary) / 0.86)",
  ctaHoverShadow: "0 3px 14px rgba(10,40,35,0.20)",
} as const;

/* ── Keyframe CSS ─────────────────────────────────────────────────── */
const STYLE_TAG = `
  @keyframes pvt-dd-in {
    from { opacity: 0; transform: translateX(-50%) translateY(-6px); }
    to   { opacity: 1; transform: translateX(-50%) translateY(0px);  }
  }
  @keyframes pvt-mob-in {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0px);  }
  }
`;

/* ── Chevron ──────────────────────────────────────────────────────── */
function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="7" height="7" viewBox="0 0 8 8" fill="none"
      aria-hidden="true"
      style={{
        display:    "inline-block",
        marginLeft: "5px",
        flexShrink: 0,
        opacity:    open ? 0.70 : 0.55,
        transform:  open ? "rotate(180deg)" : "rotate(0deg)",
        transition: "transform 0.22s ease, opacity 0.18s ease",
      }}
    >
      <path d="M1 2.5L4 5.5L7 2.5" stroke="currentColor" strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Active underline indicator ───────────────────────────────────── */
function ActiveDot({ scrolled }: { scrolled: boolean }) {
  return (
    <span
      aria-hidden="true"
      style={{
        position:     "absolute",
        bottom:       "-5px",
        left:         "50%",
        transform:    "translateX(-50%)",
        width:        "18px",
        height:       "1.5px",
        borderRadius: "999px",
        background:   scrolled
          ? "hsl(var(--primary) / 0.60)"
          : "rgba(255,255,255,0.48)",
      }}
    />
  );
}

/* ── Component ────────────────────────────────────────────────────── */
export function Navbar() {
  const [location]              = useLocation();
  const [isScrolled,            setIsScrolled]            = useState(false);
  const [isMobileMenuOpen,      setIsMobileMenuOpen]      = useState(false);
  const [openDropdownKey,       setOpenDropdownKey]       = useState<string | null>(null);
  const [openMobileDropdownKey, setOpenMobileDropdownKey] = useState<string | null>(null);

  /* Refs */
  const linkRefs      = useRef<(HTMLElement | null)[]>([]);
  const ctaRef        = useRef<HTMLAnchorElement | null>(null);
  const dropdownRefs  = useRef<Map<string, HTMLLIElement>>(new Map());
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Derived */
  const homeBase        = import.meta.env.BASE_URL.replace(/\/$/, "");
  const isHome          = location === "/" || location === "";
  const isProductPage   = location.startsWith("/san-pham");
  const isCommunityPage = location.startsWith("/cong-dong");
  const isTinTucPage    = location.startsWith("/tin-tuc");
  const isAboutPage     = location.startsWith("/gioi-thieu");
  const isKienThucPage  = KIEN_THUC_PATHS.some((p) => location.startsWith(p));

  /* Dark hero = transparent initial navbar */
  const isHeroDark        = isHome || isProductPage || isCommunityPage || isAboutPage;
  const effectiveScrolled = isScrolled || !isHeroDark;

  const navLinks: NavItem[] = NAV_ITEMS.map((item) => {
    if (item.dropdownKey) {
      return {
        name:        item.name,
        dropdown:    true as const,
        dropdownKey: item.dropdownKey,
        items: (item.items ?? []).map((sub) => ({
          name: sub.name,
          desc: sub.desc,
          href: `${homeBase}${sub.path}`,
        })),
      };
    }
    if (item.path === "/" && isHome)         return { name: item.name, href: "#trang-chu" };
    if (item.path === "/#lien-he" && isHome) return { name: item.name, href: "#lien-he" };
    return { name: item.name, href: `${homeBase}${item.path ?? "/"}` };
  });

  /* ── Scroll listener ──────────────────────────────────────────── */
  useEffect(() => {
    const fn = () => setIsScrolled(window.scrollY > 48);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  /* ── Close mobile menu on route change ───────────────────────── */
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setOpenMobileDropdownKey(null);
  }, [location]);

  /* ── Imperative color sync ────────────────────────────────────── */
  useEffect(() => {
    linkRefs.current.forEach((el, i) => {
      if (!el) return;
      const isActive =
        (i === 1 && isAboutPage)     ||
        (i === 2 && isKienThucPage)  ||
        (i === 3 && isTinTucPage)    ||
        (i === 4 && isCommunityPage) ||
        (i === 5 && isProductPage);
      el.style.color      = isActive
        ? (effectiveScrolled ? SCROLLED.linkActive : HERO.linkActive)
        : (effectiveScrolled ? SCROLLED.linkColor  : HERO.linkColor);
      el.style.fontWeight = isActive ? "500" : "400";
    });
    const cta = ctaRef.current;
    if (!cta) return;
    if (effectiveScrolled) {
      cta.style.background  = SCROLLED.ctaBg;
      cta.style.borderColor = SCROLLED.ctaBorder;
      cta.style.boxShadow   = SCROLLED.ctaShadow;
      cta.style.color       = "#fff";
    } else {
      cta.style.background  = HERO.ctaBg;
      cta.style.borderColor = HERO.ctaBorder;
      cta.style.boxShadow   = "none";
      cta.style.color       = "rgba(255,255,255,0.88)";
    }
  }, [effectiveScrolled, isAboutPage, isKienThucPage, isTinTucPage, isCommunityPage, isProductPage]);

  /* ── Dropdown open / close ────────────────────────────────────── */
  const openDropdown = useCallback((key: string) => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setOpenDropdownKey(key);
  }, []);

  const scheduleClose = useCallback(() => {
    closeTimerRef.current = setTimeout(() => setOpenDropdownKey(null), 190);
  }, []);

  /* Outside-click closes desktop dropdowns */
  useEffect(() => {
    if (!openDropdownKey) return;
    const fn = (e: MouseEvent) => {
      const target = e.target as Node;
      let inside = false;
      dropdownRefs.current.forEach((el) => {
        if (el && el.contains(target)) inside = true;
      });
      if (!inside) setOpenDropdownKey(null);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [openDropdownKey]);

  /* Cleanup timers */
  useEffect(() => () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
  }, []);

  /* ── Derived color shortcuts ──────────────────────────────────── */
  const linkColor = effectiveScrolled ? SCROLLED.linkColor : HERO.linkColor;
  const linkHover = effectiveScrolled ? SCROLLED.linkHover : HERO.linkHover;

  /* ── Base link style ──────────────────────────────────────────── */
  const baseLinkStyle: React.CSSProperties = {
    fontSize:       "13px",
    fontWeight:     400,
    letterSpacing:  "0.012em",
    textDecoration: "none",
    transition:     "color 0.20s ease",
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

  return (
    <>
      <style>{STYLE_TAG}</style>

      <nav
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0,
          zIndex: 50,
          transition: "background 0.40s ease, box-shadow 0.40s ease, border-color 0.40s ease, padding 0.40s ease",
          ...(effectiveScrolled
            ? {
                background:           "rgba(249,252,250,0.97)",
                backdropFilter:       "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                boxShadow:            "none",
                borderBottom:         "1px solid rgba(0,0,0,0.052)",
                paddingTop:    "0.75rem",
                paddingBottom: "0.75rem",
              }
            : {
                background:
                  "linear-gradient(to bottom, rgba(5,25,20,0.22) 0%, rgba(4,18,14,0.06) 60%, transparent 100%)",
                backdropFilter:       "none",
                WebkitBackdropFilter: "none",
                boxShadow:            "none",
                borderBottom:         "1px solid transparent",
                paddingTop:    "1.25rem",
                paddingBottom: "1.25rem",
              }),
        }}
      >
        <div className="max-w-6xl mx-auto px-5 sm:px-8 flex items-center justify-between">

          {/* ── Brand ──────────────────────────────────────────── */}
          <a
            href={`${homeBase}/`}
            style={{
              fontSize:       "15.5px",
              fontWeight:     700,
              letterSpacing:  "-0.026em",
              color:          effectiveScrolled
                ? "hsl(var(--primary))"
                : "rgba(255,255,255,0.94)",
              textDecoration: "none",
              transition:     "color 0.32s ease",
              lineHeight:     1,
              userSelect:     "none",
            }}
          >
            Thắng SWC
          </a>

          {/* ── Desktop nav ────────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-8">
            <ul
              style={{
                listStyle: "none", margin: 0, padding: 0,
                display: "flex", alignItems: "center", gap: "1.625rem",
              }}
            >
              {navLinks.map((link, i) => {

                /* ── Dropdown ───────────────────────────────── */
                if (link.dropdown) {
                  const key      = link.dropdownKey;
                  const isOpen   = openDropdownKey === key;
                  const isActive = (key === "kien-thuc" && isKienThucPage)
                                || (key === "san-pham"   && isProductPage);

                  const triggerColor = isActive
                    ? (effectiveScrolled ? SCROLLED.linkActive : HERO.linkActive)
                    : (isOpen ? linkHover : linkColor);

                  return (
                    <li
                      key={link.name}
                      ref={(el) => {
                        if (el) dropdownRefs.current.set(key, el);
                        else dropdownRefs.current.delete(key);
                      }}
                      style={{ position: "relative" }}
                      onMouseEnter={() => openDropdown(key)}
                      onMouseLeave={scheduleClose}
                    >
                      {/* Trigger button */}
                      <button
                        ref={(el) => { linkRefs.current[i] = el; }}
                        style={{ ...baseLinkStyle, color: triggerColor, fontWeight: isActive ? 500 : 400 }}
                        onClick={() => isOpen ? setOpenDropdownKey(null) : openDropdown(key)}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = linkHover; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = triggerColor; }}
                      >
                        {link.name}
                        {isActive && !isOpen && <ActiveDot scrolled={effectiveScrolled} />}
                        <Chevron open={isOpen} />
                      </button>

                      {/* Hover bridge — prevents gap-triggered close */}
                      <div aria-hidden="true" style={{
                        position: "absolute", top: "100%",
                        left: "-28px", right: "-28px", height: "14px", zIndex: 99,
                      }} />

                      {/* Dropdown panel */}
                      {isOpen && (
                        <div
                          role="menu"
                          onMouseEnter={() => openDropdown(key)}
                          onMouseLeave={scheduleClose}
                          style={{
                            position:             "absolute",
                            top:                  "calc(100% + 8px)",
                            left:                 "50%",
                            transform:            "translateX(-50%)",
                            minWidth:             "280px",
                            background:           "rgba(249,252,250,0.99)",
                            backdropFilter:       "blur(28px)",
                            WebkitBackdropFilter: "blur(28px)",
                            borderRadius:         "12px",
                            border:               "1px solid rgba(0,0,0,0.07)",
                            borderTop:            "1.5px solid hsl(var(--primary) / 0.16)",
                            boxShadow:
                              "0 4px 16px rgba(10,40,35,0.08), 0 16px 40px rgba(10,40,35,0.10)",
                            padding:  "0.5rem 0",
                            zIndex:   100,
                            animation: "pvt-dd-in 0.20s cubic-bezier(0.16,1,0.3,1) forwards",
                          }}
                        >
                          {link.items.map((item) => {
                            const itemActive =
                              (key === "san-pham"  && isProductPage  && item.href.endsWith(location)) ||
                              (key === "kien-thuc" && isKienThucPage && item.href.endsWith(location));

                            return (
                              <a
                                key={item.name}
                                href={item.href}
                                role="menuitem"
                                style={{
                                  display:        "block",
                                  padding:        "0.625rem 1.25rem 0.625rem 1rem",
                                  textDecoration: "none",
                                  transition:     "background 0.16s ease",
                                  borderLeft: `2px solid ${
                                    itemActive ? "hsl(var(--primary))" : "transparent"
                                  }`,
                                  background: itemActive ? "hsl(var(--primary) / 0.04)" : "transparent",
                                  marginLeft:  "0.25rem",
                                  marginRight: "0.25rem",
                                  borderRadius: "0 6px 6px 0",
                                }}
                                onMouseEnter={(e) => {
                                  const el = e.currentTarget as HTMLElement;
                                  el.style.background  = "hsl(var(--primary) / 0.05)";
                                  el.style.borderColor = "hsl(var(--primary) / 0.40)";
                                }}
                                onMouseLeave={(e) => {
                                  const el = e.currentTarget as HTMLElement;
                                  el.style.background  = itemActive ? "hsl(var(--primary) / 0.04)" : "transparent";
                                  el.style.borderColor = itemActive ? "hsl(var(--primary))" : "transparent";
                                }}
                              >
                                <span style={{
                                  display:       "block",
                                  fontSize:      "13px",
                                  fontWeight:    itemActive ? 500 : 400,
                                  letterSpacing: "0.008em",
                                  color:         itemActive
                                    ? "hsl(var(--primary))"
                                    : "hsl(var(--foreground) / 0.70)",
                                  lineHeight:    1.35,
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
                                    color:         "hsl(var(--foreground) / 0.38)",
                                    lineHeight:    1.5,
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

                /* ── Plain link ─────────────────────────────── */
                const isActive =
                  (i === 0 && (isHome)) ||
                  (i === 1 && isAboutPage) ||
                  (i === 3 && isTinTucPage) ||
                  (i === 4 && isCommunityPage);

                return (
                  <li key={link.name} style={{ position: "relative" }}>
                    <a
                      ref={(el) => { linkRefs.current[i] = el; }}
                      href={link.href}
                      style={{
                        ...baseLinkStyle,
                        color:      isActive
                          ? (effectiveScrolled ? SCROLLED.linkActive : HERO.linkActive)
                          : linkColor,
                        fontWeight: isActive ? 500 : 400,
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = linkHover; }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.color = isActive
                          ? (effectiveScrolled ? SCROLLED.linkActive : HERO.linkActive)
                          : linkColor;
                      }}
                    >
                      {link.name}
                      {isActive && <ActiveDot scrolled={effectiveScrolled} />}
                    </a>
                  </li>
                );
              })}
            </ul>

            {/* ── CTA button ─────────────────────────────────── */}
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
                fontSize:       "12.5px",
                fontWeight:     500,
                letterSpacing:  "0.018em",
                textDecoration: "none",
                color:          "#fff",
                transition:     "background 0.24s ease, border-color 0.24s ease, box-shadow 0.24s ease",
                ...(effectiveScrolled
                  ? {
                      background:  SCROLLED.ctaBg,
                      borderColor: SCROLLED.ctaBorder,
                      boxShadow:   SCROLLED.ctaShadow,
                    }
                  : {
                      background:  HERO.ctaBg,
                      borderColor: HERO.ctaBorder,
                      boxShadow:   "inset 0 1px 0 rgba(255,255,255,0.10)",
                    }),
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = effectiveScrolled ? SCROLLED.ctaHoverBg : HERO.ctaHoverBg;
                el.style.boxShadow  = effectiveScrolled ? SCROLLED.ctaHoverShadow : "inset 0 1px 0 rgba(255,255,255,0.12)";
                if (!effectiveScrolled) el.style.borderColor = HERO.ctaHoverBorder;
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.background  = effectiveScrolled ? SCROLLED.ctaBg  : HERO.ctaBg;
                el.style.borderColor = effectiveScrolled ? SCROLLED.ctaBorder : HERO.ctaBorder;
                el.style.boxShadow   = effectiveScrolled ? SCROLLED.ctaShadow : "inset 0 1px 0 rgba(255,255,255,0.10)";
              }}
            >
              Tham gia cộng đồng
            </a>
          </div>

          {/* ── Mobile hamburger ────────────────────────────────── */}
          <button
            className="md:hidden"
            style={{
              color:      effectiveScrolled ? "hsl(var(--foreground) / 0.70)" : "rgba(255,255,255,0.84)",
              background: "none",
              border:     "none",
              cursor:     "pointer",
              padding:    "0.375rem",
              borderRadius: "6px",
              display:    "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "color 0.2s ease, background 0.2s ease",
            }}
            onClick={() => setIsMobileMenuOpen((v) => !v)}
            aria-label={isMobileMenuOpen ? "Đóng menu" : "Mở menu"}
            data-testid="btn-mobile-menu"
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = effectiveScrolled
                ? "rgba(0,0,0,0.04)"
                : "rgba(255,255,255,0.08)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "none";
            }}
          >
            {isMobileMenuOpen ? <X size={18} strokeWidth={1.75} /> : <Menu size={18} strokeWidth={1.75} />}
          </button>
        </div>

        {/* ── Mobile drawer ───────────────────────────────────────── */}
        {isMobileMenuOpen && (
          <div
            className="md:hidden absolute top-full left-0 w-full"
            style={{
              background:           "rgba(249,252,250,0.99)",
              backdropFilter:       "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              borderBottom:         "1px solid rgba(0,0,0,0.058)",
              boxShadow:            "0 12px 36px rgba(10,40,35,0.08)",
              animation:            "pvt-mob-in 0.22s cubic-bezier(0.16,1,0.3,1) forwards",
            }}
          >
            <div className="max-w-6xl mx-auto px-5 py-5 flex flex-col">
              {navLinks.map((link) => {

                /* ── Mobile dropdown item ──────────────────── */
                if (link.dropdown) {
                  const key       = link.dropdownKey;
                  const isMobOpen = openMobileDropdownKey === key;
                  const isActive  = (key === "kien-thuc" && isKienThucPage)
                                 || (key === "san-pham"   && isProductPage);

                  return (
                    <React.Fragment key={link.name}>
                      <button
                        style={{
                          display:        "flex",
                          alignItems:     "center",
                          justifyContent: "space-between",
                          width:          "100%",
                          fontSize:       "14px",
                          fontWeight:     isActive ? 500 : 400,
                          letterSpacing:  "0.010em",
                          color:          isActive
                            ? "hsl(var(--primary))"
                            : "hsl(var(--foreground) / 0.65)",
                          padding:        "0.75rem 0",
                          background:     "none",
                          border:         "none",
                          borderBottom:   isMobOpen
                            ? "none"
                            : "1px solid rgba(0,0,0,0.055)",
                          cursor:         "pointer",
                        }}
                        onClick={() =>
                          setOpenMobileDropdownKey((prev) => prev === key ? null : key)
                        }
                      >
                        <span>{link.name}</span>
                        <span style={{
                          color:      isActive
                            ? "hsl(var(--primary) / 0.60)"
                            : "hsl(var(--foreground) / 0.35)",
                          transition: "transform 0.22s ease",
                          transform:  isMobOpen ? "rotate(180deg)" : "rotate(0deg)",
                          display:    "inline-flex",
                        }}>
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                            <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor"
                                  strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      </button>

                      {isMobOpen && (
                        <div style={{
                          borderBottom: "1px solid rgba(0,0,0,0.055)",
                          padding:      "0.25rem 0 0.625rem",
                        }}>
                          {link.items.map((item) => {
                            const itemActive =
                              (key === "san-pham"  && isProductPage  && item.href.endsWith(location)) ||
                              (key === "kien-thuc" && isKienThucPage && item.href.endsWith(location));

                            return (
                              <a
                                key={item.name}
                                href={item.href}
                                style={{
                                  display:        "flex",
                                  alignItems:     "flex-start",
                                  gap:            "0.625rem",
                                  padding:        "0.625rem 0 0.625rem 1rem",
                                  textDecoration: "none",
                                  borderLeft: `2px solid ${
                                    itemActive
                                      ? "hsl(var(--primary))"
                                      : "hsl(var(--primary) / 0.24)"
                                  }`,
                                  marginLeft:   "0.25rem",
                                  borderRadius: "0 6px 6px 0",
                                  background:   itemActive ? "hsl(var(--primary) / 0.04)" : "transparent",
                                  transition:   "background 0.16s ease",
                                }}
                                onClick={() => {
                                  setIsMobileMenuOpen(false);
                                  setOpenMobileDropdownKey(null);
                                }}
                              >
                                <div>
                                  <div style={{
                                    fontSize:      "13.5px",
                                    fontWeight:    itemActive ? 500 : 400,
                                    letterSpacing: "0.008em",
                                    color:         itemActive
                                      ? "hsl(var(--primary))"
                                      : "hsl(var(--foreground) / 0.66)",
                                    lineHeight:    1.35,
                                    marginBottom:  item.desc ? "0.2rem" : 0,
                                  }}>
                                    {item.name}
                                  </div>
                                  {item.desc && (
                                    <div style={{
                                      fontSize:   "11.5px",
                                      fontWeight: 300,
                                      color:      "hsl(var(--foreground) / 0.36)",
                                      lineHeight: 1.5,
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

                /* ── Plain mobile link ──────────────────────── */
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    style={{
                      fontSize:       "14px",
                      fontWeight:     400,
                      letterSpacing:  "0.010em",
                      color:          "hsl(var(--foreground) / 0.65)",
                      padding:        "0.75rem 0",
                      borderBottom:   "1px solid rgba(0,0,0,0.055)",
                      textDecoration: "none",
                      transition:     "color 0.18s ease",
                      display:        "block",
                    }}
                    onClick={() => setIsMobileMenuOpen(false)}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "hsl(var(--primary))"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "hsl(var(--foreground) / 0.65)"; }}
                  >
                    {link.name}
                  </a>
                );
              })}

              {/* Mobile CTA */}
              <a
                href={`${homeBase}/cong-dong#dang-ky`}
                style={{
                  marginTop:      "1rem",
                  display:        "flex",
                  alignItems:     "center",
                  justifyContent: "center",
                  height:         "2.625rem",
                  borderRadius:   "999px",
                  background:     "hsl(var(--primary))",
                  fontSize:       "13px",
                  fontWeight:     500,
                  letterSpacing:  "0.018em",
                  color:          "#fff",
                  textDecoration: "none",
                  boxShadow:      "0 1px 10px rgba(10,40,35,0.14)",
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
                  el.style.boxShadow  = "0 1px 10px rgba(10,40,35,0.14)";
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
