import React, { useState, useEffect, useRef } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { name: "Trang chủ", href: "#trang-chu" },
  { name: "Giới thiệu", href: "#gioi-thieu" },
  { name: "Nội dung", href: "#noi-dung" },
  { name: "Cộng đồng", href: "#cong-dong" },
  { name: "Liên hệ", href: "#lien-he" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const ctaRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 48);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* Sync link + CTA colors when scroll state changes */
  useEffect(() => {
    linkRefs.current.forEach((el) => {
      if (!el) return;
      el.style.color = isScrolled
        ? "hsl(var(--foreground) / 0.62)"
        : "rgba(255,255,255,0.72)";
    });
    if (ctaRef.current) {
      if (isScrolled) {
        ctaRef.current.style.background = "hsl(var(--primary))";
        ctaRef.current.style.borderColor = "transparent";
        ctaRef.current.style.color = "#fff";
        ctaRef.current.style.boxShadow = "0 1px 8px rgba(10,40,35,0.14)";
      } else {
        ctaRef.current.style.background = "rgba(255,255,255,0.10)";
        ctaRef.current.style.borderColor = "rgba(255,255,255,0.22)";
        ctaRef.current.style.color = "#fff";
        ctaRef.current.style.boxShadow = "none";
      }
    }
  }, [isScrolled]);

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        transition: "background 0.45s ease, box-shadow 0.45s ease, padding 0.45s ease",
        ...(isScrolled
          ? {
              background: "rgba(251,253,251,0.97)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              boxShadow: "0 1px 0 rgba(0,0,0,0.06), 0 2px 16px rgba(10,40,35,0.04)",
              paddingTop: "0.75rem",
              paddingBottom: "0.75rem",
            }
          : {
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.04) 70%, transparent 100%)",
              backdropFilter: "none",
              WebkitBackdropFilter: "none",
              boxShadow: "none",
              paddingTop: "1.125rem",
              paddingBottom: "1.125rem",
            }),
      }}
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8 flex items-center justify-between">

        {/* Logo */}
        <a
          href="#trang-chu"
          style={{
            fontSize: "15px",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: isScrolled ? "hsl(var(--primary))" : "rgba(255,255,255,0.92)",
            textDecoration: "none",
            transition: "color 0.3s ease",
          }}
        >
          Thắng SWC
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          <ul className="flex gap-6">
            {navLinks.map((link, i) => (
              <li key={link.name}>
                <a
                  ref={(el) => { linkRefs.current[i] = el; }}
                  href={link.href}
                  style={{
                    fontSize: "13px",
                    fontWeight: 400,
                    letterSpacing: "0.008em",
                    color: isScrolled
                      ? "hsl(var(--foreground) / 0.62)"
                      : "rgba(255,255,255,0.72)",
                    textDecoration: "none",
                    transition: "color 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.color = isScrolled
                      ? "hsl(var(--primary))"
                      : "rgba(255,255,255,0.96)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.color = isScrolled
                      ? "hsl(var(--foreground) / 0.62)"
                      : "rgba(255,255,255,0.72)";
                  }}
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <a
            ref={ctaRef}
            href="#lien-he"
            style={{
              display: "inline-flex",
              alignItems: "center",
              height: "34px",
              padding: "0 18px",
              borderRadius: "999px",
              border: "1px solid",
              fontSize: "13px",
              fontWeight: 500,
              letterSpacing: "0.01em",
              textDecoration: "none",
              transition: "background 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease, color 0.25s ease",
              ...(isScrolled
                ? {
                    background: "hsl(var(--primary))",
                    borderColor: "transparent",
                    color: "#fff",
                    boxShadow: "0 1px 8px rgba(10,40,35,0.14)",
                  }
                : {
                    background: "rgba(255,255,255,0.10)",
                    borderColor: "rgba(255,255,255,0.22)",
                    color: "#fff",
                    boxShadow: "none",
                  }),
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              if (isScrolled) {
                el.style.background = "hsl(var(--primary) / 0.88)";
                el.style.boxShadow = "0 2px 12px rgba(10,40,35,0.18)";
              } else {
                el.style.background = "rgba(255,255,255,0.17)";
                el.style.borderColor = "rgba(255,255,255,0.32)";
              }
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              if (isScrolled) {
                el.style.background = "hsl(var(--primary))";
                el.style.boxShadow = "0 1px 8px rgba(10,40,35,0.14)";
              } else {
                el.style.background = "rgba(255,255,255,0.10)";
                el.style.borderColor = "rgba(255,255,255,0.22)";
              }
            }}
          >
            Tham gia cộng đồng
          </a>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 rounded-md transition-colors"
          style={{ color: isScrolled ? "hsl(var(--foreground))" : "rgba(255,255,255,0.90)" }}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
          data-testid="btn-mobile-menu"
        >
          {isMobileMenuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden absolute top-full left-0 w-full border-b"
          style={{
            background: "rgba(251,253,251,0.98)",
            backdropFilter: "blur(20px)",
            borderColor: "rgba(0,0,0,0.07)",
            boxShadow: "0 4px 20px rgba(10,40,35,0.07)",
          }}
        >
          <div className="max-w-6xl mx-auto px-5 py-4 flex flex-col gap-0.5">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                style={{
                  fontSize: "14px",
                  fontWeight: 400,
                  color: "hsl(var(--foreground) / 0.72)",
                  padding: "0.7rem 0",
                  borderBottom: "1px solid hsl(var(--border) / 0.45)",
                  textDecoration: "none",
                  transition: "color 0.2s ease",
                }}
                onClick={() => setIsMobileMenuOpen(false)}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "hsl(var(--primary))"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "hsl(var(--foreground) / 0.72)"; }}
              >
                {link.name}
              </a>
            ))}
            <a
              href="#lien-he"
              className="flex items-center justify-center rounded-full text-white"
              style={{
                marginTop: "0.875rem",
                height: "2.625rem",
                background: "hsl(var(--primary))",
                fontSize: "13.5px",
                fontWeight: 500,
                letterSpacing: "0.01em",
                textDecoration: "none",
                boxShadow: "0 1px 8px rgba(10,40,35,0.14)",
              }}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Tham gia cộng đồng
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
