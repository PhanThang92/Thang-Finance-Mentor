import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 48);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Trang chủ", href: "#trang-chu" },
    { name: "Giới thiệu", href: "#gioi-thieu" },
    { name: "Nội dung", href: "#noi-dung" },
    { name: "Cộng đồng", href: "#cong-dong" },
    { name: "Liên hệ", href: "#lien-he" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-white/96 backdrop-blur-xl shadow-[0_1px_0_0_rgba(0,0,0,0.07)] py-3.5"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8 flex items-center justify-between">
        <a
          href="#trang-chu"
          className={`text-lg font-bold tracking-tight transition-colors duration-300 ${
            isScrolled ? "text-primary" : "text-white"
          }`}
        >
          Thắng SWC
        </a>

        <div className="hidden md:flex items-center gap-8">
          <ul className="flex gap-7">
            {navLinks.map((link) => (
              <li key={link.name}>
                <a
                  href={link.href}
                  className={`text-[13.5px] font-medium transition-colors duration-300 ${
                    isScrolled
                      ? "text-foreground/70 hover:text-primary"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
          <a
            href="#lien-he"
            className={`inline-flex items-center h-9 px-5 rounded-full text-[13.5px] font-semibold transition-all duration-300 ${
              isScrolled
                ? "bg-primary text-white hover:bg-primary/90"
                : "bg-white/15 text-white border border-white/25 hover:bg-white/22"
            }`}
          >
            Tham gia cộng đồng
          </a>
        </div>

        <button
          className={`md:hidden p-2 rounded-md transition-colors ${
            isScrolled ? "text-foreground" : "text-white"
          }`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
          data-testid="btn-mobile-menu"
        >
          {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-border shadow-lg">
          <div className="max-w-6xl mx-auto px-5 py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-foreground/80 font-medium py-3 border-b border-border/40 text-sm hover:text-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <a
              href="#lien-he"
              className="mt-3 flex items-center justify-center h-11 bg-primary text-white rounded-full text-sm font-semibold hover:bg-primary/90 transition-colors"
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
