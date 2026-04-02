import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Footer } from "@/components/Footer";

/* ── Animation presets — identical to home page ─────────── */
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.12 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.68, ease: [0.22, 1, 0.36, 1] } },
};
const VP = { once: true, margin: "-64px" };

/* ── Shared design tokens ────────────────────────────────── */
const CARD_LIGHT: React.CSSProperties = {
  borderRadius: "0.75rem",
  border: "1px solid hsl(var(--border) / 0.92)",
  boxShadow: "0 2px 8px rgba(10,40,35,0.06)",
  padding: "1.75rem 1.625rem",
  transition: "border-color 0.28s ease, transform 0.28s ease",
};
const CARD_DARK: React.CSSProperties = {
  borderRadius: "0.75rem",
  border: "1px solid rgba(52,160,140,0.16)",
  background: "rgba(52,160,140,0.04)",
  padding: "1.75rem 1.625rem",
  transition: "border-color 0.28s ease",
};

function hoverLift(e: React.MouseEvent) {
  const el = e.currentTarget as HTMLElement;
  el.style.borderColor = "hsl(var(--primary) / 0.28)";
  el.style.transform = "translateY(-2px)";
}
function hoverReset(e: React.MouseEvent) {
  const el = e.currentTarget as HTMLElement;
  el.style.borderColor = "hsl(var(--border) / 0.92)";
  el.style.transform = "translateY(0)";
}

/* ── Editorial primitives ────────────────────────────────── */
function SectionLabel({ children, dark = false }: { children: string; dark?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
      <div style={{ height: "1px", width: "2rem", flexShrink: 0, background: dark ? "rgba(52,160,140,0.55)" : "hsl(var(--primary) / 0.50)" }} />
      <span style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: dark ? "rgba(52,160,140,0.78)" : "hsl(var(--primary))" }}>
        {children}
      </span>
    </div>
  );
}

function SectionHeading({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <h2 style={{ fontSize: "clamp(1.65rem, 3.8vw, 2.25rem)", fontWeight: 700, lineHeight: 1.2, letterSpacing: "-0.018em", color: dark ? "rgba(255,255,255,0.94)" : "hsl(var(--foreground))" }}>
      {children}
    </h2>
  );
}

/* Anchor line — the italic bridge between heading and body, per home page system */
function AnchorLine({ children, dark = false, style }: { children: string; dark?: boolean; style?: React.CSSProperties }) {
  return (
    <p style={{ fontSize: "12.5px", fontWeight: 500, fontStyle: "italic", letterSpacing: "0.005em", lineHeight: 1.55, color: dark ? "rgba(52,160,140,0.82)" : "hsl(var(--primary) / 0.82)", ...style }}>
      {children}
    </p>
  );
}

function NumMarker({ num, dark = false }: { num: string; dark?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.125rem" }}>
      <span style={{ fontSize: "11.5px", fontWeight: 600, letterSpacing: "0.10em", color: dark ? "rgba(52,160,140,0.80)" : "hsl(var(--primary) / 0.80)" }}>{num}</span>
      <div style={{ width: "1.75rem", height: "1px", background: dark ? "rgba(52,160,140,0.35)" : "hsl(var(--primary) / 0.35)" }} />
    </div>
  );
}

/* ── Inline Navbar ────────────────────────────────────────── */
function ProductNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const ctaRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 48);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    linkRefs.current.forEach((el, i) => {
      if (!el) return;
      const isActive = i === 3; // "Sản phẩm"
      el.style.color = isActive
        ? (isScrolled ? "hsl(var(--primary))" : "rgba(255,255,255,0.96)")
        : (isScrolled ? "hsl(var(--foreground) / 0.62)" : "rgba(255,255,255,0.72)");
      el.style.fontWeight = isActive ? "500" : "400";
    });
    if (ctaRef.current) {
      if (isScrolled) {
        ctaRef.current.style.background = "hsl(var(--primary))";
        ctaRef.current.style.borderColor = "transparent";
        ctaRef.current.style.boxShadow = "0 1px 8px rgba(10,40,35,0.14)";
      } else {
        ctaRef.current.style.background = "rgba(255,255,255,0.10)";
        ctaRef.current.style.borderColor = "rgba(255,255,255,0.22)";
        ctaRef.current.style.boxShadow = "none";
      }
    }
  }, [isScrolled]);

  const homeBase = import.meta.env.BASE_URL.replace(/\/$/, "");
  const desktopLinks = [
    { name: "Trang chủ", href: homeBase + "/" },
    { name: "Giới thiệu", href: homeBase + "/#gioi-thieu" },
    { name: "Nội dung", href: homeBase + "/#noi-dung" },
    { name: "Sản phẩm", href: "#" },
    { name: "Liên hệ", href: homeBase + "/#lien-he" },
  ];

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
      transition: "background 0.45s ease, box-shadow 0.45s ease, padding 0.45s ease",
      ...(isScrolled
        ? { background: "rgba(251,253,251,0.97)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", boxShadow: "0 1px 0 rgba(0,0,0,0.06), 0 2px 16px rgba(10,40,35,0.04)", paddingTop: "0.75rem", paddingBottom: "0.75rem" }
        : { background: "linear-gradient(to bottom, rgba(0,0,0,0.20) 0%, rgba(0,0,0,0.05) 70%, transparent 100%)", paddingTop: "1.125rem", paddingBottom: "1.125rem" }),
    }}>
      <div className="max-w-6xl mx-auto px-5 sm:px-8 flex items-center justify-between">
        <a href={homeBase + "/"} style={{ fontSize: "15px", fontWeight: 700, letterSpacing: "-0.02em", color: isScrolled ? "hsl(var(--primary))" : "rgba(255,255,255,0.92)", textDecoration: "none", transition: "color 0.3s ease" }}>
          Thắng SWC
        </a>

        <div className="hidden md:flex items-center gap-6">
          <ul className="flex gap-6" style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {desktopLinks.map((link, i) => (
              <li key={link.name}>
                <a ref={el => { linkRefs.current[i] = el; }} href={link.href}
                  style={{ fontSize: "13px", letterSpacing: "0.008em", textDecoration: "none", transition: "color 0.2s ease", color: i === 3 ? (isScrolled ? "hsl(var(--primary))" : "rgba(255,255,255,0.96)") : (isScrolled ? "hsl(var(--foreground) / 0.62)" : "rgba(255,255,255,0.72)"), fontWeight: i === 3 ? 500 : 400 }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = isScrolled ? "hsl(var(--primary))" : "rgba(255,255,255,0.96)"; }}
                  onMouseLeave={e => {
                    const isActive = i === 3;
                    (e.currentTarget as HTMLElement).style.color = isActive ? (isScrolled ? "hsl(var(--primary))" : "rgba(255,255,255,0.96)") : (isScrolled ? "hsl(var(--foreground) / 0.62)" : "rgba(255,255,255,0.72)");
                  }}>
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
          <a ref={ctaRef} href="#cta" style={{
            display: "inline-flex", alignItems: "center", height: "34px", padding: "0 18px",
            borderRadius: "999px", border: "1px solid", fontSize: "13px", fontWeight: 500,
            letterSpacing: "0.01em", textDecoration: "none", color: "#fff",
            transition: "background 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease",
            ...(isScrolled ? { background: "hsl(var(--primary))", borderColor: "transparent", boxShadow: "0 1px 8px rgba(10,40,35,0.14)" } : { background: "rgba(255,255,255,0.10)", borderColor: "rgba(255,255,255,0.22)" }),
          }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = isScrolled ? "hsl(var(--primary) / 0.88)" : "rgba(255,255,255,0.17)"; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = isScrolled ? "hsl(var(--primary))" : "rgba(255,255,255,0.10)"; }}>
            Đăng ký quan tâm
          </a>
        </div>

        <button className="md:hidden p-2 rounded-md" style={{ color: isScrolled ? "hsl(var(--foreground))" : "rgba(255,255,255,0.90)", background: "none", border: "none", cursor: "pointer" }} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Toggle menu">
          <svg width="21" height="21" viewBox="0 0 21 21" fill="none">
            {isMobileMenuOpen
              ? <><line x1="3" y1="3" x2="18" y2="18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><line x1="18" y1="3" x2="3" y2="18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></>
              : <><line x1="3" y1="7" x2="18" y2="7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><line x1="3" y1="11" x2="18" y2="11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><line x1="3" y1="15" x2="18" y2="15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></>}
          </svg>
        </button>
      </div>

      {isMobileMenuOpen && (
        <div style={{ background: "rgba(251,253,251,0.98)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 4px 20px rgba(10,40,35,0.07)" }} className="md:hidden absolute top-full left-0 w-full">
          <div className="max-w-6xl mx-auto px-5 py-4 flex flex-col gap-0.5">
            {desktopLinks.map((link) => (
              <a key={link.name} href={link.href}
                style={{ fontSize: "14px", fontWeight: 400, color: "hsl(var(--foreground) / 0.72)", padding: "0.7rem 0", borderBottom: "1px solid hsl(var(--border) / 0.45)", textDecoration: "none", transition: "color 0.2s ease" }}
                onClick={() => setIsMobileMenuOpen(false)}>
                {link.name}
              </a>
            ))}
            <a href="#cta" style={{ marginTop: "0.875rem", height: "2.625rem", display: "flex", alignItems: "center", justifyContent: "center", background: "hsl(var(--primary))", borderRadius: "999px", fontSize: "13.5px", fontWeight: 500, color: "#fff", textDecoration: "none", boxShadow: "0 1px 8px rgba(10,40,35,0.14)" }} onClick={() => setIsMobileMenuOpen(false)}>
              Đăng ký quan tâm
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}

/* ══════════════════════════════════════════════════════════
   1. HERO
══════════════════════════════════════════════════════════ */
function Hero() {
  const btnPrimary: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", height: "44px", padding: "0 28px",
    borderRadius: "999px", fontSize: "14px", fontWeight: 500, letterSpacing: "0.01em",
    textDecoration: "none", background: "linear-gradient(140deg, #22917f, #1a7868)",
    color: "#fff", boxShadow: "0 4px 18px rgba(26,120,104,0.30)",
    transition: "transform 0.22s ease, box-shadow 0.22s ease",
  };
  const btnSecondary: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", height: "44px", padding: "0 24px",
    borderRadius: "999px", fontSize: "14px", fontWeight: 400, letterSpacing: "0.01em",
    textDecoration: "none", background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.88)",
    backdropFilter: "blur(8px)", transition: "background 0.22s ease",
  };

  return (
    <section className="relative overflow-hidden flex flex-col justify-center min-h-screen"
      style={{ background: "linear-gradient(160deg, #0d2622 0%, #091e1b 55%, #071815 100%)" }}>
      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div style={{ position: "absolute", top: "8%", right: "2%", width: "36rem", height: "36rem", borderRadius: "50%", background: "radial-gradient(circle, rgba(36,110,95,0.20) 0%, transparent 68%)", filter: "blur(64px)" }} />
        <div style={{ position: "absolute", bottom: "-8%", left: "-4%", width: "28rem", height: "28rem", borderRadius: "50%", background: "radial-gradient(circle, rgba(26,80,72,0.16) 0%, transparent 70%)", filter: "blur(52px)" }} />
        {/* Top accent hairline */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(90deg, transparent, rgba(52,160,140,0.14) 50%, transparent)" }} />
      </div>

      <div className="max-w-4xl mx-auto px-5 sm:px-8 relative z-10 pt-32 pb-24">
        <motion.div initial="hidden" animate="visible" variants={stagger}>

          <motion.div variants={fadeUp} style={{ marginBottom: "1.75rem" }}>
            <SectionLabel dark>Road to $1M · SWC PASS</SectionLabel>
          </motion.div>

          <motion.h1 variants={fadeUp} style={{ fontSize: "clamp(2.4rem, 6.5vw, 4rem)", fontWeight: 800, lineHeight: 1.08, letterSpacing: "-0.028em", color: "rgba(255,255,255,0.96)", marginBottom: "1.5rem" }}>
            Đường tới<br />$1.000.000
          </motion.h1>

          {/* Primary anchor statement — product direction, not hype */}
          <motion.p variants={fadeUp} style={{ fontSize: "clamp(1rem, 2.0vw, 1.1rem)", lineHeight: 1.70, fontWeight: 400, color: "rgba(255,255,255,0.76)", maxWidth: "36rem", marginBottom: "1.25rem" }}>
            Không phải lời hứa làm giàu nhanh. Đây là lộ trình để đồng tiền bắt đầu làm việc có hệ thống.
          </motion.p>

          {/* Secondary supporting context */}
          <motion.p variants={fadeUp} style={{ fontSize: "14px", lineHeight: 1.88, fontWeight: 300, color: "rgba(255,255,255,0.42)", maxWidth: "32rem", marginBottom: "2rem" }}>
            Dành cho người đi làm muốn hiểu đầu tư dài hạn đúng hơn, xây một hệ thống tài chính rõ hơn và bắt đầu bằng những hành động nhỏ nhưng có ý thức.
          </motion.p>

          {/* Brand belief — elevated from decorative to intentional key insight */}
          <motion.div variants={fadeUp} style={{ display: "flex", alignItems: "flex-start", gap: "1rem", marginBottom: "2rem" }}>
            <div style={{ marginTop: "0.35rem", width: "2.5rem", height: "1.5px", background: "rgba(52,160,140,0.60)", borderRadius: "999px", flexShrink: 0 }} />
            <p style={{ fontSize: "clamp(14px, 1.8vw, 15px)", fontStyle: "italic", fontWeight: 400, color: "rgba(52,160,140,0.90)", letterSpacing: "0.004em", lineHeight: 1.62, margin: 0 }}>
              Đồng tiền này đang làm việc hay chỉ đang nằm im?
            </p>
          </motion.div>

          {/* Product micro-tags — editorial, subtle, informational */}
          <motion.div variants={fadeUp} style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "2.25rem" }}>
            {[
              "Dành cho người bận rộn",
              "Không cần nghiên cứu hàng giờ",
              "Bắt đầu từ bước tiếp theo cụ thể",
            ].map((tag) => (
              <span key={tag} style={{
                display: "inline-flex", alignItems: "center",
                height: "26px", padding: "0 11px",
                borderRadius: "999px",
                border: "1px solid rgba(52,160,140,0.18)",
                background: "rgba(52,160,140,0.07)",
                fontSize: "11.5px", fontWeight: 400,
                letterSpacing: "0.018em",
                color: "rgba(255,255,255,0.50)",
              }}>
                {tag}
              </span>
            ))}
          </motion.div>

          <motion.div variants={fadeUp} style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
            <a href="#lo-trinh" style={btnPrimary}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 24px rgba(26,120,104,0.38)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 18px rgba(26,120,104,0.30)"; }}>
              Tìm hiểu lộ trình
            </a>
            <a href="#cta" style={btnSecondary}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.13)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)"; }}>
              Đăng ký nhận thông tin
            </a>
          </motion.div>

        </motion.div>
      </div>

      {/* Section transition accent */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(90deg, transparent, rgba(52,160,140,0.10) 50%, transparent)" }} />
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   2. PROBLEM
══════════════════════════════════════════════════════════ */
const problems = [
  { num: "01", title: "Thu nhập tăng nhưng tự do tài chính không tăng theo", body: "Nhiều người kiếm nhiều hơn trước, nhưng vẫn không tiến gần hơn tới tự do. Vì thu nhập và tài sản là hai câu chuyện hoàn toàn khác nhau." },
  { num: "02", title: "Chi phí sống luôn có xu hướng đuổi kịp thu nhập", body: "Khi thu nhập tăng, mức sống thường tăng theo. Nếu không có hệ thống phân bổ rõ ràng, phần tiền có thể trở thành tài sản sẽ ngày càng nhỏ lại." },
  { num: "03", title: "Tiền nằm im không sinh ra gì và mất sức mua theo thời gian", body: "Giữ tiền không đồng nghĩa an toàn. Khi tiền không làm việc, lạm phát vẫn âm thầm lấy đi giá trị của nó mỗi năm." },
  { num: "04", title: "Có tiền nhưng không có hệ thống thì cuối tháng vẫn dễ hết tiền", body: "Vấn đề thường không nằm ở số lượng. Mà nằm ở cách tổ chức. Không có hệ thống, tiền sẽ luôn tự tìm đường để biến mất." },
];

function ProblemSection() {
  return (
    <section className="py-24 md:py-32 bg-background">
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={VP} variants={stagger} className="space-y-14">
          <div className="space-y-5 max-w-2xl">
            <motion.div variants={fadeUp}><SectionLabel>Thực tế</SectionLabel></motion.div>
            <motion.div variants={fadeUp}><SectionHeading>Vì sao nhiều người vẫn chưa tiến gần hơn tới tự do tài chính?</SectionHeading></motion.div>
            <motion.div variants={fadeUp}>
              <AnchorLine style={{ fontSize: "13px", color: "hsl(var(--primary) / 0.90)" }}>
                Thu nhập không tự chuyển thành tài sản — đó là điểm khác biệt mà ít ai được dạy rõ ràng.
              </AnchorLine>
            </motion.div>
          </div>
          <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {problems.map(({ num, title, body }) => (
              <motion.div key={num} variants={fadeUp} className="bg-card flex flex-col"
                style={{ ...CARD_LIGHT, padding: "2rem 1.875rem" }}
                onMouseEnter={hoverLift} onMouseLeave={hoverReset}>
                <NumMarker num={num} />
                <h3 style={{
                  fontSize: "15.5px", fontWeight: 600, lineHeight: 1.28,
                  letterSpacing: "-0.012em", color: "hsl(var(--foreground))",
                  marginBottom: "0.875rem",
                }}>{title}</h3>
                <p style={{
                  fontSize: "14px", lineHeight: 1.88,
                  color: "hsl(var(--foreground) / 0.50)", fontWeight: 400,
                }}>{body}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   3. GOAL
══════════════════════════════════════════════════════════ */
const goals = [
  { title: "Hiểu đúng về đầu tư theo hướng dài hạn", body: "Không bắt đầu từ cổ phiếu 'nóng' hay lãi suất hứa hẹn. Mà bắt đầu từ cách nhìn đúng về thời gian, rủi ro và tài sản thực sự." },
  { title: "Xây danh mục có cấu trúc: bảo vệ – tăng trưởng – mạo hiểm có ý thức", body: "Danh mục không phải tập hợp ngẫu nhiên. Mà là một hệ thống 3 cấp độ, mỗi phần phục vụ một mục tiêu rõ ràng." },
  { title: "Vượt qua 4 rào cản tâm lý phổ biến khi bắt đầu", body: "Không có tiền, không có kiến thức, sợ mất tiền, không có thời gian — tất cả đều có cách tiếp cận cụ thể nếu bắt đầu đúng." },
  { title: "Kết thúc với một bước đi tiếp theo cụ thể", body: "Không dừng ở cảm hứng. Mà kết thúc bằng một hành động nhỏ nhưng rõ ràng — có thể bắt đầu ngay trong tháng này." },
];

function GoalSection() {
  return (
    <section className="py-24 md:py-32" style={{ background: "linear-gradient(160deg, #0e2522 0%, #0a1e1b 100%)" }}>
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={VP} variants={stagger} className="space-y-14">
          <div className="space-y-5 max-w-2xl">
            <motion.div variants={fadeUp}><SectionLabel dark>Mục tiêu</SectionLabel></motion.div>
            <motion.div variants={fadeUp}><SectionHeading dark>Mục tiêu thật sự của Road to $1M</SectionHeading></motion.div>
            <motion.div variants={fadeUp}>
              <AnchorLine dark style={{ fontSize: "13px", color: "rgba(52,160,140,0.90)" }}>
                Không phải khóa học lý thuyết. Là những thay đổi góc nhìn có thể thực hiện ngay.
              </AnchorLine>
            </motion.div>
          </div>
          <motion.div variants={stagger} className="space-y-10">
            {goals.map(({ title, body }, i) => (
              <motion.div key={i} variants={fadeUp} style={{ display: "flex", gap: "1.5rem" }}>
                {/* Left accent — slightly stronger opacity to anchor each principle */}
                <div style={{
                  flexShrink: 0, width: "2px",
                  background: "rgba(52,160,140,0.52)",
                  borderRadius: "999px", marginTop: "4px",
                }} />
                <div style={{ paddingTop: "1px" }}>
                  <p style={{
                    fontSize: "16.5px", fontWeight: 600,
                    color: "rgba(255,255,255,0.90)",
                    marginBottom: "0.625rem",
                    letterSpacing: "-0.010em",
                    lineHeight: 1.25,
                  }}>{title}</p>
                  <p style={{
                    fontSize: "14px", lineHeight: 1.90,
                    color: "rgba(255,255,255,0.50)", fontWeight: 300,
                  }}>{body}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   4. AUDIENCE
══════════════════════════════════════════════════════════ */
const forGroups = [
  { num: "01", title: "Người đi làm 35+ có tích lũy", body: "Anh/chị có thu nhập ổn định, đã bắt đầu tích lũy hoặc có một khoản tiền nhàn rỗi, nhưng chưa có một cách rõ ràng để biến khoản tiền đó thành tài sản dài hạn." },
  { num: "02", title: "Nhà đầu tư cá nhân bận rộn", body: "Anh/chị đã từng tìm hiểu hoặc đầu tư, nhưng việc ra quyết định vẫn dễ bị kéo bởi cảm xúc, tin tức ngắn hạn hoặc thiếu thời gian để nhìn mọi thứ một cách hệ thống." },
  { num: "03", title: "Người muốn biến tiền thành tài sản", body: "Anh/chị biết giữ tiền trong tài khoản ngân hàng không phải là giải pháp tối ưu, nhưng vẫn chưa có một cấu trúc đủ rõ để bắt đầu thay đổi." },
];
const notFor = ["lợi nhuận nhanh", "tín hiệu mua bán ngắn hạn", "cam kết kết quả", "một con đường không cần đi dài"];

function AudienceSection() {
  return (
    <section className="py-24 md:py-32 bg-card">
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={VP} variants={stagger} className="space-y-14">
          <div className="space-y-5 max-w-2xl">
            <motion.div variants={fadeUp}><SectionLabel>Đối tượng</SectionLabel></motion.div>
            <motion.div variants={fadeUp}><SectionHeading>Dành cho ai?</SectionHeading></motion.div>
            <motion.div variants={fadeUp}>
              <AnchorLine style={{ fontSize: "13px", color: "hsl(var(--primary) / 0.90)" }}>
                Được xây dựng cho người đi làm bận rộn, không phải nhà đầu tư chuyên nghiệp.
              </AnchorLine>
            </motion.div>
          </div>

          <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {forGroups.map(({ num, title, body }) => (
              <motion.div key={num} variants={fadeUp} className="bg-background flex flex-col"
                style={{ ...CARD_LIGHT, padding: "2rem 1.875rem" }}
                onMouseEnter={hoverLift} onMouseLeave={hoverReset}>
                <NumMarker num={num} />
                <h3 style={{
                  fontSize: "15.5px", fontWeight: 600, lineHeight: 1.28,
                  letterSpacing: "-0.012em", color: "hsl(var(--foreground))",
                  marginBottom: "0.875rem",
                }}>{title}</h3>
                <p style={{
                  fontSize: "14px", lineHeight: 1.88,
                  color: "hsl(var(--foreground) / 0.50)", fontWeight: 400,
                }}>{body}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Not-for block — a mentor's honest note, not a legal exclusion */}
          <motion.div variants={fadeUp} style={{
            borderRadius: "0.75rem",
            border: "1px solid hsl(var(--border) / 0.65)",
            padding: "1.625rem 1.875rem",
            background: "hsl(var(--background))",
          }}>
            <p style={{
              fontSize: "12.5px", fontWeight: 500, letterSpacing: "0.005em",
              color: "hsl(var(--foreground) / 0.42)", marginBottom: "1rem",
            }}>
              Chưa phù hợp nếu anh/chị đang tìm
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem 2.25rem" }}>
              {notFor.map((item) => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <div style={{ width: "3px", height: "3px", borderRadius: "50%", background: "hsl(var(--foreground) / 0.28)", flexShrink: 0 }} />
                  <span style={{ fontSize: "14px", color: "hsl(var(--foreground) / 0.52)", fontWeight: 400 }}>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   5. JOURNEY
══════════════════════════════════════════════════════════ */
const stages = [
  {
    num: "01", label: "Giai đoạn 1", title: "Đổi góc nhìn",
    points: ["Hiểu vì sao giữ tiền không đồng nghĩa an toàn", "Nhìn tự do tài chính như số tiền đang làm việc thay mình", "Phân biệt rõ tiền nằm im và tài sản thực sự"],
  },
  {
    num: "02", label: "Giai đoạn 2", title: "Xây hệ thống",
    points: ["Bắt đầu trích đều 5–10% từ thu nhập mỗi tháng", "Xây danh mục 3 cấp độ thay vì đầu tư rời rạc", "Dùng công cụ hỗ trợ để không phải nghiên cứu hàng giờ mỗi tuần"],
  },
  {
    num: "03", label: "Giai đoạn 3", title: "Hành động nhỏ nhưng thật",
    points: ["Bắt đầu từ bước nhỏ, nhưng rõ ràng và có ý thức", "Xây thói quen tài chính đều đặn thay vì chờ quyết định lớn", "Đi đường dài cùng cộng đồng và nguồn thông tin đáng tin cậy"],
  },
];

function JourneySection() {
  return (
    <section id="lo-trinh" className="py-24 md:py-32" style={{ background: "linear-gradient(165deg, #0c2420 0%, #091c18 100%)" }}>
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={VP} variants={stagger} className="space-y-14">
          <div className="space-y-5 max-w-2xl">
            <motion.div variants={fadeUp}><SectionLabel dark>Hành trình</SectionLabel></motion.div>
            <motion.div variants={fadeUp}><SectionHeading dark>3 chuyển đổi lớn của hành trình này</SectionHeading></motion.div>
            <motion.div variants={fadeUp}>
              <AnchorLine dark style={{ fontSize: "13px", color: "rgba(52,160,140,0.90)" }}>
                Ba chuyển đổi theo trình tự — mỗi bước đặt nền tảng cho bước tiếp theo.
              </AnchorLine>
            </motion.div>
          </div>
          <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stages.map(({ num, label, title, points }) => (
              <motion.div key={num} variants={fadeUp} className="flex flex-col"
                style={{ ...CARD_DARK, padding: "2rem 1.875rem" }}>
                {/* Stage header — num + hairline + label */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
                  <span style={{
                    fontSize: "11.5px", fontWeight: 600,
                    letterSpacing: "0.10em", color: "rgba(52,160,140,0.80)",
                  }}>{num}</span>
                  <div style={{ width: "1.75rem", height: "1px", background: "rgba(52,160,140,0.35)" }} />
                  <span style={{
                    fontSize: "11px", fontWeight: 500,
                    fontStyle: "italic", letterSpacing: "0.012em",
                    color: "rgba(255,255,255,0.44)",
                  }}>{label}</span>
                </div>
                <h3 style={{
                  fontSize: "17.5px", fontWeight: 700,
                  color: "rgba(255,255,255,0.92)",
                  marginBottom: "1.125rem",
                  letterSpacing: "-0.014em",
                  lineHeight: 1.22,
                }}>{title}</h3>
                <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {points.map((pt, j) => (
                    <li key={j} style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                      <div style={{
                        width: "4px", height: "4px", borderRadius: "50%",
                        background: "rgba(52,160,140,0.65)",
                        flexShrink: 0, marginTop: "8px",
                      }} />
                      <span style={{
                        fontSize: "14px", lineHeight: 1.82,
                        color: "rgba(255,255,255,0.52)", fontWeight: 300,
                      }}>{pt}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   6. CORE KNOWLEDGE
══════════════════════════════════════════════════════════ */
const knowledge = [
  { num: "01", title: "Ba kiểu người cùng mức thu nhập", body: "Cùng một mức thu nhập, nhưng kết quả sau 10 năm có thể hoàn toàn khác nhau. Khác biệt không nằm ở thu nhập, mà ở cách tiền được sử dụng." },
  { num: "02", title: "Lạm phát: cái lấy đi thầm lặng", body: "Lạm phát không làm bạn hoảng sợ, nhưng âm thầm lấy đi sức mua mỗi năm. Hiểu điều này để biết vì sao giữ tiền mặt không đồng nghĩa an toàn." },
  { num: "03", title: "Tiền chờ đợi và tiền làm việc", body: "Hai đồng tiền giống nhau hôm nay có thể cho hai kết quả hoàn toàn khác nhau trong tương lai — nếu một đồng được đặt đúng chỗ." },
  { num: "04", title: "Danh mục 3 cấp độ", body: "Bảo vệ – Tăng trưởng – Rủi ro có ý thức. Mỗi phần trong danh mục nên phục vụ một mục tiêu rõ ràng.", highlight: true },
  { num: "05", title: "Vì sao dồn hết vào một dự án không phải chiến lược", body: "Tập trung có thể tạo lợi nhuận lớn, nhưng cũng có thể xóa sạch mọi thứ. Đa dạng hóa có ý thức là một phần của tư duy dài hạn." },
  { num: "06", title: "Bắt đầu không cần hàng triệu đô", body: "Không cần đợi thật nhiều tiền mới bắt đầu. Điều quan trọng hơn là tỷ lệ đều đặn, vị trí đặt tiền và thời gian đi cùng nó.", highlight: true },
  { num: "07", title: "Lãi kép: thời gian và tính đều đặn", body: "Lãi kép không phải phép màu. Nó là lợi thế dành cho người bắt đầu sớm và duy trì đủ đều trong thời gian dài.", highlight: true },
];

function KnowledgeSection() {
  return (
    <section className="py-24 md:py-32 bg-background">
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={VP} variants={stagger} className="space-y-14">
          <div className="space-y-5 max-w-2xl">
            <motion.div variants={fadeUp}><SectionLabel>Kiến thức</SectionLabel></motion.div>
            <motion.div variants={fadeUp}><SectionHeading>Những gì anh/chị sẽ bắt đầu nhìn rõ hơn</SectionHeading></motion.div>
            <motion.div variants={fadeUp}>
              <AnchorLine style={{ fontSize: "13px", color: "hsl(var(--primary) / 0.90)" }}>
                Hiểu đúng một lần để không phải đoán mò nhiều lần.
              </AnchorLine>
            </motion.div>
          </div>
          <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {knowledge.map(({ num, title, body, highlight }) => (
              <motion.div key={num} variants={fadeUp} className="bg-card flex flex-col"
                style={{
                  ...CARD_LIGHT,
                  padding: "2rem 1.875rem",
                  /* Highlighted cards: trace teal border tint — one step more intentional */
                  ...(highlight ? { borderColor: "hsl(var(--primary) / 0.20)" } : {}),
                }}
                onMouseEnter={highlight
                  ? (e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "hsl(var(--primary) / 0.36)"; el.style.transform = "translateY(-2px)"; }
                  : hoverLift
                }
                onMouseLeave={highlight
                  ? (e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "hsl(var(--primary) / 0.20)"; el.style.transform = "translateY(0)"; }
                  : hoverReset
                }>
                <NumMarker num={num} />
                <h3 style={{
                  fontSize: "15px", fontWeight: 600, lineHeight: 1.28,
                  letterSpacing: "-0.012em", color: "hsl(var(--foreground))",
                  marginBottom: "0.75rem",
                }}>{title}</h3>
                <p style={{
                  fontSize: "13.5px", lineHeight: 1.85,
                  color: "hsl(var(--foreground) / 0.50)", fontWeight: 400,
                }}>{body}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   7. PSYCHOLOGY
══════════════════════════════════════════════════════════ */
const barriers = [
  { num: "01", title: "Tôi không có tiền dư", body: "Không cần chờ có nhiều tiền mới bắt đầu. Một tỷ lệ nhỏ nhưng đều đặn, đặt đúng chỗ, vẫn là một bước đi thật." },
  { num: "02", title: "Tôi không hiểu gì về đầu tư", body: "Không cần hiểu hết ngay mới được bắt đầu. Điều cần trước tiên là một nguyên lý đúng, không phải hàng chục thuật ngữ phức tạp." },
  { num: "03", title: "Tôi sợ mất tiền", body: "Sợ mất tiền là hợp lý. Nhưng rủi ro không phải là kẻ thù — rủi ro không được quản lý mới là điều nguy hiểm. Có hệ thống giúp anh/chị đi xa hơn mà không phải lo liên tục." },
  { num: "04", title: "Tôi không có thời gian", body: "Đầu tư dài hạn không đòi hỏi theo dõi từng giờ. Một hệ thống tốt giúp anh/chị ra ít quyết định hơn, nhưng chất lượng hơn." },
];

function PsychologySection() {
  return (
    <section className="py-24 md:py-32 bg-card">
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={VP} variants={stagger} className="space-y-14">
          <div className="space-y-5 max-w-2xl">
            <motion.div variants={fadeUp}><SectionLabel>Tâm lý</SectionLabel></motion.div>
            <motion.div variants={fadeUp}><SectionHeading>4 rào cản tâm lý phổ biến khi bắt đầu</SectionHeading></motion.div>
            <motion.div variants={fadeUp}>
              <AnchorLine style={{ fontSize: "13px", color: "hsl(var(--primary) / 0.90)" }}>
                Tất cả đều có thể vượt qua — bằng cách nhìn rõ hơn, không phải bằng ý chí mạnh hơn.
              </AnchorLine>
            </motion.div>
          </div>
          <motion.div variants={stagger} style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            {barriers.map(({ num, title, body }) => (
              <motion.div key={num} variants={fadeUp} style={{ display: "flex", gap: "1.5rem" }}>
                <div style={{ flexShrink: 0, width: "2px", background: "hsl(var(--primary) / 0.52)", borderRadius: "999px", marginTop: "4px" }} />
                <div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "0.625rem", marginBottom: "0.625rem" }}>
                    <span style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.10em", color: "hsl(var(--primary) / 0.80)", flexShrink: 0 }}>{num}</span>
                    <h3 style={{ fontSize: "16px", fontWeight: 600, color: "hsl(var(--foreground))", lineHeight: 1.22, letterSpacing: "-0.012em", margin: 0 }}>{title}</h3>
                  </div>
                  <p style={{ fontSize: "14px", lineHeight: 1.88, color: "hsl(var(--foreground) / 0.50)", fontWeight: 400 }}>{body}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   8. SWC PASS
══════════════════════════════════════════════════════════ */
const passFeatures = [
  { title: "Phân tích hàng tháng", body: "Báo cáo định kỳ với các nhận định cụ thể về thị trường và danh mục." },
  { title: "Hỗ trợ đánh giá cổ phiếu cổ tức", body: "Công cụ và góc nhìn để phân tích cổ phiếu theo tiêu chí dài hạn." },
  { title: "Hỗ trợ cân bằng rủi ro danh mục", body: "Hướng dẫn cách điều chỉnh tỷ trọng phù hợp với từng giai đoạn." },
];

function SwcPassSection() {
  return (
    <section className="py-24 md:py-32" style={{ background: "linear-gradient(160deg, #0d2522 0%, #091d1a 100%)" }}>
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={VP} variants={stagger} className="space-y-14">
          <div className="space-y-5 max-w-2xl">
            <motion.div variants={fadeUp}><SectionLabel dark>Hệ sinh thái</SectionLabel></motion.div>
            <motion.div variants={fadeUp}><SectionHeading dark>Road to $1M nằm ở đâu trong hệ sinh thái SWC PASS?</SectionHeading></motion.div>
            <motion.div variants={fadeUp}><AnchorLine dark>Một phần của dịch vụ đồng hành dài hạn, không đứng độc lập.</AnchorLine></motion.div>
          </div>

          <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
            {/* Left: description */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <p style={{ fontSize: "15px", lineHeight: 1.88, color: "rgba(255,255,255,0.60)", fontWeight: 300 }}>
                Road to $1M là nền tảng kiến thức nằm trong hệ sinh thái SWC PASS — một dịch vụ thông tin tài chính được xây dựng để đồng hành dài hạn, không phải để giải trí ngắn hạn.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {passFeatures.map(({ title, body }, i) => (
                  <div key={i} style={{ display: "flex", gap: "1rem" }}>
                    <div style={{ flexShrink: 0, width: "2px", borderRadius: "999px", background: "rgba(52,160,140,0.42)", marginTop: "3px" }} />
                    <div>
                      <p style={{ fontSize: "14px", fontWeight: 500, color: "rgba(255,255,255,0.80)", lineHeight: 1.35, marginBottom: "0.25rem" }}>{title}</p>
                      <p style={{ fontSize: "13px", lineHeight: 1.75, color: "rgba(255,255,255,0.50)", fontWeight: 300 }}>{body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: positioning callout */}
            <div style={{ borderRadius: "0.75rem", border: "1px solid rgba(52,160,140,0.18)", padding: "2rem 1.75rem", background: "rgba(52,160,140,0.05)" }}>
              <div style={{ width: "2rem", height: "1px", background: "rgba(52,160,140,0.45)", marginBottom: "1.25rem" }} />
              <p style={{ fontSize: "15.5px", fontStyle: "italic", fontWeight: 300, color: "rgba(255,255,255,0.72)", lineHeight: 1.78, marginBottom: "1.5rem" }}>
                "Dịch vụ thông tin giúp anh/chị ra quyết định có ý thức hơn, không cam kết lợi nhuận ảo."
              </p>
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: "1.25rem" }}>
                <p style={{ fontSize: "12px", fontWeight: 400, color: "rgba(255,255,255,0.35)", lineHeight: 1.65 }}>
                  SWC PASS là dịch vụ thông tin tài chính. Không phải tư vấn đầu tư cá nhân hay cam kết lợi nhuận dưới bất kỳ hình thức nào.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   9. PRICING
══════════════════════════════════════════════════════════ */
const tiers = [
  { label: "Hàng năm", price: "$240 / năm", sub: "Tương đương $20 / tháng", tag: null },
  { label: "5 năm", price: "$600 / 5 năm", sub: "Tương đương $10 / tháng", tag: "Tiết kiệm nhất" },
  { label: "Trọn đời", price: "$2.600", sub: "Một lần, không gia hạn", tag: null },
];

function PricingSection() {
  return (
    <section className="py-24 md:py-32 bg-background">
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={VP} variants={stagger} className="space-y-14">
          <div className="space-y-5 max-w-2xl">
            <motion.div variants={fadeUp}><SectionLabel>Đồng hành</SectionLabel></motion.div>
            <motion.div variants={fadeUp}><SectionHeading>Các lựa chọn đồng hành</SectionHeading></motion.div>
            <motion.div variants={fadeUp}><AnchorLine>Đồng hành theo năm, theo chu kỳ dài, hoặc cả cuộc đời đầu tư.</AnchorLine></motion.div>
          </div>

          <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tiers.map(({ label, price, sub, tag }) => (
              <motion.div key={label} variants={fadeUp} className="bg-card flex flex-col relative"
                style={{ ...CARD_LIGHT, border: `1px solid ${tag ? "hsl(var(--primary) / 0.38)" : "hsl(var(--border) / 0.92)"}`, boxShadow: tag ? "0 4px 20px rgba(10,40,35,0.09)" : "0 2px 8px rgba(10,40,35,0.06)" }}>

                {tag && (
                  <span style={{ position: "absolute", top: "-1px", right: "1.25rem", fontSize: "10.5px", fontWeight: 600, letterSpacing: "0.10em", textTransform: "uppercase", color: "hsl(var(--primary))", background: "hsl(var(--background))", padding: "3px 10px", borderRadius: "0 0 6px 6px", border: "1px solid hsl(var(--primary) / 0.28)", borderTop: "none" }}>{tag}</span>
                )}

                <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "hsl(var(--primary) / 0.68)", marginBottom: "0.875rem" }}>{label}</p>
                <p style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.022em", color: "hsl(var(--foreground))", lineHeight: 1, marginBottom: "0.375rem" }}>{price}</p>
                <p style={{ fontSize: "13px", color: "hsl(var(--muted-foreground))", fontWeight: 400, marginBottom: "0" }}>{sub}</p>

                <div style={{ flex: 1, minHeight: "1.5rem" }} />
                <div style={{ height: "1px", background: "hsl(var(--border) / 0.50)", margin: "1.25rem 0" }} />

                <a href="#cta" style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  height: "38px", borderRadius: "999px", fontSize: "13px", fontWeight: 500,
                  letterSpacing: "0.01em", textDecoration: "none",
                  background: tag ? "hsl(var(--primary))" : "transparent",
                  color: tag ? "#fff" : "hsl(var(--primary))",
                  border: `1px solid ${tag ? "transparent" : "hsl(var(--primary) / 0.42)"}`,
                  transition: "background 0.22s ease, border-color 0.22s ease",
                }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = tag ? "hsl(var(--primary) / 0.88)" : "hsl(var(--primary) / 0.07)"; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = tag ? "hsl(var(--primary))" : "transparent"; }}>
                  Đăng ký quan tâm
                </a>
              </motion.div>
            ))}
          </motion.div>

          <motion.div variants={fadeUp} style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ width: "1.75rem", height: "1px", background: "hsl(var(--border))", flexShrink: 0 }} />
            <p style={{ fontSize: "13px", fontStyle: "italic", color: "hsl(var(--muted-foreground) / 0.68)", lineHeight: 1.65 }}>
              Điều kiện ưu đãi và thời hạn có thể thay đổi theo từng thời điểm.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   10. FINAL CTA
══════════════════════════════════════════════════════════ */
const steps = [
  { num: "01", title: "Chọn một tỷ lệ trích cố định", body: "Bắt đầu với 5–10% từ thu nhập tháng này. Không cần hoàn hảo, chỉ cần nhất quán." },
  { num: "02", title: "Liệt kê 3 mục tiêu tiền trong 12 tháng tới", body: "Một mục tiêu bảo vệ, một mục tiêu tăng trưởng, một mục tiêu mạo hiểm có ý thức. Rõ ràng hơn là tốt hơn." },
  { num: "03", title: "Đăng ký hoặc nhắn tin để hiểu rõ hơn", body: "Tìm hiểu cách SWC PASS hoạt động và xem liệu có phù hợp với giai đoạn anh/chị đang ở không." },
];

function FinalCTA() {
  const btnPrimary: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", height: "44px", padding: "0 28px",
    borderRadius: "999px", fontSize: "14px", fontWeight: 500, letterSpacing: "0.01em",
    textDecoration: "none", background: "linear-gradient(140deg, #22917f, #1a7868)",
    color: "#fff", boxShadow: "0 4px 18px rgba(26,120,104,0.30)",
    transition: "transform 0.22s ease, box-shadow 0.22s ease",
  };
  const btnSecondary: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", height: "44px", padding: "0 24px",
    borderRadius: "999px", fontSize: "14px", fontWeight: 400, letterSpacing: "0.01em",
    textDecoration: "none", background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.88)",
    backdropFilter: "blur(8px)", transition: "background 0.22s ease",
  };

  return (
    <section id="cta" className="py-24 md:py-32" style={{ background: "linear-gradient(165deg, #0c2420 0%, #091c18 55%, rgba(7,22,21,0.92) 100%)" }}>
      <div className="max-w-4xl mx-auto px-5 sm:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={VP} variants={stagger} className="space-y-14">
          <div className="space-y-5 max-w-2xl">
            <motion.div variants={fadeUp}><SectionLabel dark>Bắt đầu</SectionLabel></motion.div>
            <motion.div variants={fadeUp}><SectionHeading dark>Bước đi tiếp theo không cần lớn. Chỉ cần rõ ràng.</SectionHeading></motion.div>
            <motion.div variants={fadeUp}><AnchorLine dark>Hành động nhỏ nhất anh/chị có thể làm ngay hôm nay.</AnchorLine></motion.div>
          </div>

          <motion.div variants={stagger} style={{ display: "flex", flexDirection: "column", gap: "2rem", maxWidth: "38rem" }}>
            {steps.map(({ num, title, body }) => (
              <motion.div key={num} variants={fadeUp} style={{ display: "flex", gap: "1.25rem" }}>
                <div style={{ flexShrink: 0, width: "2px", background: "rgba(52,160,140,0.42)", borderRadius: "999px", marginTop: "5px" }} />
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.375rem" }}>
                    <span style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.13em", color: "rgba(52,160,140,0.72)" }}>{num}</span>
                    <p style={{ fontSize: "16px", fontWeight: 600, color: "rgba(255,255,255,0.90)", letterSpacing: "-0.008em", lineHeight: 1.3 }}>{title}</p>
                  </div>
                  <p style={{ fontSize: "14px", lineHeight: 1.85, color: "rgba(255,255,255,0.50)", fontWeight: 300 }}>{body}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div variants={fadeUp} style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", paddingTop: "0.5rem" }}>
            <a href="#" style={btnPrimary}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 24px rgba(26,120,104,0.38)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 18px rgba(26,120,104,0.30)"; }}>
              Đăng ký quan tâm
            </a>
            <a href="#" style={btnSecondary}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.13)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)"; }}>
              Nhận thông tin
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   PAGE EXPORT
══════════════════════════════════════════════════════════ */
export default function ProductDuongToiTrieuDo() {
  return (
    <div className="min-h-[100dvh] flex flex-col w-full bg-background font-sans overflow-x-hidden">
      <ProductNavbar />
      <main className="flex-1">
        <Hero />
        <ProblemSection />
        <GoalSection />
        <AudienceSection />
        <JourneySection />
        <KnowledgeSection />
        <PsychologySection />
        <SwcPassSection />
        <PricingSection />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
