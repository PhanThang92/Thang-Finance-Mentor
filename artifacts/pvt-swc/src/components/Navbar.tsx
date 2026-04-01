import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/95 backdrop-blur-sm shadow-sm py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        <a href="#trang-chu" className="text-xl md:text-2xl font-bold text-primary tracking-tight">
          Thắng SWC
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-8">
          <ul className="flex space-x-6 text-sm font-medium text-foreground/80">
            {navLinks.map((link) => (
              <li key={link.name}>
                <a
                  href={link.href}
                  className="hover:text-primary transition-colors"
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
          <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
            <a href="#cong-dong">Tham gia cộng đồng</a>
          </Button>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-foreground p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
          data-testid="btn-mobile-menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-background border-b border-border shadow-lg py-4 px-4 flex flex-col space-y-4">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-foreground font-medium py-2 border-b border-border/50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name}
            </a>
          ))}
          <Button asChild className="w-full mt-4 bg-primary text-primary-foreground">
            <a href="#cong-dong" onClick={() => setIsMobileMenuOpen(false)}>
              Tham gia cộng đồng
            </a>
          </Button>
        </div>
      )}
    </nav>
  );
}
