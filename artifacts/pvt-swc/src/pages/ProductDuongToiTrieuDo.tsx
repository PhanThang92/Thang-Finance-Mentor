import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Footer } from "@/components/Footer";

/* ── Animation presets ─────────────────────────────────── */
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.13 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.72, ease: [0.22, 1, 0.36, 1] } },
};
const VP = { once: true, margin: "-72px" };

/* ── Shared primitives ─────────────────────────────────── */
function SectionLabel({ children, dark = false }: { children: string; dark?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div
        style={{
          height: "1px",
          width: "2rem",
          background: dark ? "rgba(52,160,140,0.55)" : "hsl(var(--primary) / 0.50)",
        }}
      />
      <span
        style={{
          fontSize: "11px",
          fontWeight: 600,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: dark ? "rgba(52,160,140,0.78)" : "hsl(var(--primary))",
        }}
      >
        {children}
      </span>
    </div>
  );
}

function SectionHeading({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <h2
      style={{
        fontSize: "clamp(1.65rem, 3.8vw, 2.25rem)",
        fontWeight: 700,
        lineHeight: 1.2,
        letterSpacing: "-0.018em",
        color: dark ? "rgba(255,255,255,0.94)" : "hsl(var(--foreground))",
      }}
    >
      {children}
    </h2>
  );
}

/* ── Inline Navbar for product page ───────────────────────
   Same two-state behavior as the main Navbar, with "Sản phẩm" active */
function ProductNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 48);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const homeBase = import.meta.env.BASE_URL.replace(/\/$/, "");

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
                "linear-gradient(to bottom, rgba(0,0,0,0.20) 0%, rgba(0,0,0,0.05) 70%, transparent 100%)",
              paddingTop: "1.125rem",
              paddingBottom: "1.125rem",
            }),
      }}
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8 flex items-center justify-between">
        <a
          href={homeBase + "/"}
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

        <div className="hidden md:flex items-center gap-6">
          <ul className="flex gap-6">
            {[
              { name: "Trang chủ", href: homeBase + "/" },
              { name: "Giới thiệu", href: homeBase + "/#gioi-thieu" },
              { name: "Nội dung", href: homeBase + "/#noi-dung" },
              { name: "Sản phẩm", href: "#", active: true },
            ].map((link) => (
              <li key={link.name}>
                <a
                  href={link.href}
                  style={{
                    fontSize: "13px",
                    fontWeight: link.active ? 500 : 400,
                    letterSpacing: "0.008em",
                    color: link.active
                      ? isScrolled ? "hsl(var(--primary))" : "rgba(255,255,255,0.96)"
                      : isScrolled ? "hsl(var(--foreground) / 0.62)" : "rgba(255,255,255,0.72)",
                    textDecoration: "none",
                    transition: "color 0.2s ease",
                  }}
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
          <a
            href="#cta"
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
              transition: "background 0.25s ease, border-color 0.25s ease",
              ...(isScrolled
                ? { background: "hsl(var(--primary))", borderColor: "transparent", color: "#fff", boxShadow: "0 1px 8px rgba(10,40,35,0.14)" }
                : { background: "rgba(255,255,255,0.10)", borderColor: "rgba(255,255,255,0.22)", color: "#fff" }),
            }}
          >
            Đăng ký quan tâm
          </a>
        </div>

        <button
          className="md:hidden p-2 rounded-md"
          style={{ color: isScrolled ? "hsl(var(--foreground))" : "rgba(255,255,255,0.90)" }}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <svg width="21" height="21" viewBox="0 0 21 21" fill="none">
            {isMobileMenuOpen
              ? <><line x1="3" y1="3" x2="18" y2="18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><line x1="18" y1="3" x2="3" y2="18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></>
              : <><line x1="3" y1="7" x2="18" y2="7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><line x1="3" y1="11" x2="18" y2="11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><line x1="3" y1="15" x2="18" y2="15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></>}
          </svg>
        </button>
      </div>

      {isMobileMenuOpen && (
        <div style={{ background: "rgba(251,253,251,0.98)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 4px 20px rgba(10,40,35,0.07)" }}
          className="md:hidden absolute top-full left-0 w-full">
          <div className="max-w-6xl mx-auto px-5 py-4 flex flex-col gap-0.5">
            {[
              { name: "Trang chủ", href: homeBase + "/" },
              { name: "Giới thiệu", href: homeBase + "/#gioi-thieu" },
              { name: "Nội dung", href: homeBase + "/#noi-dung" },
              { name: "Sản phẩm", href: "#" },
            ].map((link) => (
              <a key={link.name} href={link.href}
                style={{ fontSize: "14px", fontWeight: 400, color: "hsl(var(--foreground) / 0.72)", padding: "0.7rem 0", borderBottom: "1px solid hsl(var(--border) / 0.45)", textDecoration: "none" }}
                onClick={() => setIsMobileMenuOpen(false)}>
                {link.name}
              </a>
            ))}
            <a href="#cta"
              style={{ marginTop: "0.875rem", height: "2.625rem", display: "flex", alignItems: "center", justifyContent: "center", background: "hsl(var(--primary))", borderRadius: "999px", fontSize: "13.5px", fontWeight: 500, color: "#fff", textDecoration: "none" }}
              onClick={() => setIsMobileMenuOpen(false)}>
              Đăng ký quan tâm
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}

/* ══════════════════════════════════════════════════════════
   SECTIONS
══════════════════════════════════════════════════════════ */

/* 1. Hero */
function Hero() {
  const ctaBase: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", height: "44px",
    borderRadius: "999px", fontSize: "14px", fontWeight: 500,
    letterSpacing: "0.01em", textDecoration: "none",
    transition: "all 0.25s ease",
  };

  return (
    <section
      className="relative overflow-hidden flex flex-col justify-center min-h-screen"
      style={{ background: "linear-gradient(160deg, #0d2622 0%, #091e1b 55%, #071815 100%)" }}
    >
      {/* Decorative glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div style={{ position: "absolute", top: "10%", right: "5%", width: "38rem", height: "38rem", borderRadius: "50%", background: "radial-gradient(circle, rgba(36,110,95,0.22) 0%, transparent 68%)", filter: "blur(60px)" }} />
        <div style={{ position: "absolute", bottom: "-10%", left: "-5%", width: "30rem", height: "30rem", borderRadius: "50%", background: "radial-gradient(circle, rgba(26,80,72,0.18) 0%, transparent 70%)", filter: "blur(48px)" }} />
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(90deg, transparent, rgba(52,160,140,0.15) 50%, transparent)" }} />
      </div>

      <div className="max-w-4xl mx-auto px-5 sm:px-8 relative z-10 pt-32 pb-24">
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-8">
          {/* Label */}
          <motion.div variants={fadeUp}>
            <SectionLabel dark>Road to $1M · SWC PASS</SectionLabel>
          </motion.div>

          {/* Title */}
          <motion.h1 variants={fadeUp} style={{ fontSize: "clamp(2.2rem, 6vw, 3.75rem)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.025em", color: "rgba(255,255,255,0.96)" }}>
            Đường tới<br />$1.000.000
          </motion.h1>

          {/* Subtitle */}
          <motion.p variants={fadeUp} style={{ fontSize: "clamp(1rem, 2.2vw, 1.18rem)", lineHeight: 1.72, fontWeight: 300, color: "rgba(255,255,255,0.68)", maxWidth: "36rem" }}>
            Không phải để kể chuyện hay. Mà để anh/chị có một bước đi tiếp theo cụ thể với tiền của mình.
          </motion.p>

          {/* Supporting */}
          <motion.p variants={fadeUp} style={{ fontSize: "15px", lineHeight: 1.88, fontWeight: 300, color: "rgba(255,255,255,0.50)", maxWidth: "32rem" }}>
            Dành cho người đi làm muốn hiểu đầu tư dài hạn đúng hơn, xây một hệ thống tài chính rõ hơn và bắt đầu bằng những hành động nhỏ nhưng có ý thức.
          </motion.p>

          {/* Insight line */}
          <motion.div variants={fadeUp} className="flex items-center gap-3">
            <div style={{ width: "2rem", height: "1.5px", background: "rgba(52,160,140,0.55)", borderRadius: "999px", flexShrink: 0 }} />
            <p style={{ fontSize: "14px", fontStyle: "italic", fontWeight: 400, color: "rgba(255,255,255,0.52)", letterSpacing: "0.005em" }}>
              "Đồng tiền này đang làm việc hay chỉ đang nằm im?"
            </p>
          </motion.div>

          {/* CTAs */}
          <motion.div variants={fadeUp} className="flex flex-wrap gap-3 pt-2">
            <a href="#lo-trinh" style={{ ...ctaBase, padding: "0 28px", background: "linear-gradient(140deg, #22917f, #1a7868)", color: "#fff", boxShadow: "0 4px 18px rgba(26,120,104,0.32)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 24px rgba(26,120,104,0.40)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 18px rgba(26,120,104,0.32)"; }}>
              Tìm hiểu lộ trình
            </a>
            <a href="#cta" style={{ ...ctaBase, padding: "0 24px", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.88)", backdropFilter: "blur(8px)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.13)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)"; }}>
              Đăng ký nhận thông tin
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* 2. Problem */
const problems = [
  { num: "01", title: "Thu nhập tăng nhưng tự do tài chính không tăng theo", body: "Nhiều người có thu nhập cao hơn nhưng vẫn không tiến gần hơn tới tự do. Vì thu nhập và tài sản là hai khái niệm khác nhau." },
  { num: "02", title: "Chi phí sống luôn có xu hướng đuổi kịp thu nhập", body: "Khi thu nhập tăng, lối sống thường tăng theo tương ứng. Phần chênh lệch thực sự tạo ra tài sản ngày càng nhỏ lại." },
  { num: "03", title: "Tiền nằm im không sinh ra gì và mất sức mua theo thời gian", body: "Giữ tiền không phải là an toàn. Lạm phát lấy đi sức mua một cách thầm lặng, đều đặn, mỗi năm." },
  { num: "04", title: "Có tiền nhưng không có hệ thống thì cuối tháng vẫn dễ hết tiền", body: "Không phải vấn đề về số lượng. Mà về cách tổ chức. Không có hệ thống, tiền sẽ tự tìm đường ra." },
];

function ProblemSection() {
  return (
    <section className="py-24 md:py-32 bg-background">
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={VP} variants={stagger} className="space-y-14">
          <div className="max-w-2xl space-y-4">
            <motion.div variants={fadeUp}><SectionLabel>Thực tế</SectionLabel></motion.div>
            <motion.div variants={fadeUp}><SectionHeading>Vì sao nhiều người vẫn chưa tiến gần hơn tới tự do tài chính?</SectionHeading></motion.div>
          </div>
          <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {problems.map(({ num, title, body }) => (
              <motion.div key={num} variants={fadeUp}
                className="rounded-xl bg-card flex flex-col"
                style={{ border: "1px solid hsl(var(--border) / 0.88)", padding: "1.75rem 1.625rem", boxShadow: "0 2px 8px rgba(10,40,35,0.06)", transition: "border-color 0.28s ease, transform 0.28s ease" }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "hsl(var(--primary) / 0.25)"; el.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "hsl(var(--border) / 0.88)"; el.style.transform = "translateY(0)"; }}>
                <div className="flex items-center gap-3 mb-4">
                  <span style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.13em", color: "hsl(var(--primary) / 0.72)", lineHeight: 1 }}>{num}</span>
                  <div style={{ width: "2rem", height: "1px", background: "hsl(var(--primary) / 0.28)" }} />
                </div>
                <h3 style={{ fontSize: "15.5px", fontWeight: 700, lineHeight: 1.3, letterSpacing: "-0.01em", color: "hsl(var(--foreground))", marginBottom: "0.625rem" }}>{title}</h3>
                <p style={{ fontSize: "13.5px", lineHeight: 1.85, color: "hsl(var(--muted-foreground))", fontWeight: 400 }}>{body}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* 3. Goal */
const goals = [
  { title: "Hiểu đúng về đầu tư theo hướng dài hạn", body: "Không phải cổ phiếu ngắn hạn hay lãi suất hứa hẹn. Mà là cách nhìn đúng về thời gian, rủi ro và tài sản thực sự." },
  { title: "Xây danh mục có cấu trúc: bảo vệ – tăng trưởng – mạo hiểm có ý thức", body: "Một danh mục không phải là tập hợp ngẫu nhiên. Mà là hệ thống 3 cấp độ, mỗi cấp phục vụ một mục tiêu rõ ràng." },
  { title: "Vượt qua 4 rào cản tâm lý phổ biến để bắt đầu", body: "Không có tiền, không có kiến thức, sợ mất tiền, không có thời gian — tất cả đều có cách tiếp cận cụ thể." },
  { title: "Kết thúc với một bước đi tiếp theo cụ thể", body: "Không phải một kế hoạch lý tưởng trên giấy. Mà là một hành động nhỏ nhưng rõ ràng — có thể thực hiện ngay tháng này." },
];

function GoalSection() {
  return (
    <section className="py-24 md:py-32" style={{ background: "linear-gradient(160deg, #0e2522 0%, #0a1e1b 100%)" }}>
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={VP} variants={stagger} className="space-y-14">
          <div className="max-w-2xl space-y-4">
            <motion.div variants={fadeUp}><SectionLabel dark>Mục tiêu</SectionLabel></motion.div>
            <motion.div variants={fadeUp}><SectionHeading dark>Mục tiêu thật sự của Road to $1M</SectionHeading></motion.div>
          </div>
          <motion.div variants={stagger} className="space-y-6">
            {goals.map(({ title, body }, i) => (
              <motion.div key={i} variants={fadeUp} className="flex gap-5">
                <div style={{ flexShrink: 0, width: "2px", background: "rgba(52,160,140,0.42)", borderRadius: "999px", marginTop: "4px" }} />
                <div style={{ paddingTop: "2px" }}>
                  <p style={{ fontSize: "16px", fontWeight: 600, color: "rgba(255,255,255,0.90)", marginBottom: "0.5rem", letterSpacing: "-0.005em", lineHeight: 1.3 }}>{title}</p>
                  <p style={{ fontSize: "14px", lineHeight: 1.85, color: "rgba(255,255,255,0.55)", fontWeight: 300 }}>{body}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* 4. Audience */
const forGroups = [
  { num: "01", title: "Người đi làm 35+ có tích lũy", body: "Anh/chị đang có thu nhập ổn định, bắt đầu tích lũy được hoặc đã có một số tiền nhàn rỗi nhưng chưa biết đặt vào đâu một cách có hệ thống." },
  { num: "02", title: "Nhà đầu tư cá nhân bận rộn", body: "Anh/chị đã có kinh nghiệm đầu tư nhưng ra quyết định chủ yếu dựa trên cảm tính hoặc thông tin ngắn hạn, muốn có góc nhìn dài hạn hơn." },
  { num: "03", title: "Người muốn biến tiền thành tài sản", body: "Anh/chị đang giữ tiền trong tài khoản ngân hàng và biết rõ đó không phải giải pháp tối ưu, nhưng chưa có hệ thống để thay đổi." },
];
const notFor = ["Muốn lãi nhanh", "Muốn tín hiệu mua bán ngắn hạn", "Muốn cam kết kết quả", "Không sẵn sàng đi đường dài"];

function AudienceSection() {
  return (
    <section className="py-24 md:py-32 bg-card">
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={VP} variants={stagger} className="space-y-14">
          <div className="max-w-2xl space-y-4">
            <motion.div variants={fadeUp}><SectionLabel>Đối tượng</SectionLabel></motion.div>
            <motion.div variants={fadeUp}><SectionHeading>Dành cho ai?</SectionHeading></motion.div>
          </div>
          <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {forGroups.map(({ num, title, body }) => (
              <motion.div key={num} variants={fadeUp}
                className="rounded-xl bg-background flex flex-col"
                style={{ border: "1px solid hsl(var(--border) / 0.88)", padding: "1.75rem 1.625rem", boxShadow: "0 2px 8px rgba(10,40,35,0.06)", transition: "border-color 0.28s ease, transform 0.28s ease" }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "hsl(var(--primary) / 0.25)"; el.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "hsl(var(--border) / 0.88)"; el.style.transform = "translateY(0)"; }}>
                <div className="flex items-center gap-3 mb-4">
                  <span style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.13em", color: "hsl(var(--primary) / 0.72)" }}>{num}</span>
                  <div style={{ width: "2rem", height: "1px", background: "hsl(var(--primary) / 0.28)" }} />
                </div>
                <h3 style={{ fontSize: "15.5px", fontWeight: 700, lineHeight: 1.3, letterSpacing: "-0.01em", color: "hsl(var(--foreground))", marginBottom: "0.625rem" }}>{title}</h3>
                <p style={{ fontSize: "13.5px", lineHeight: 1.85, color: "hsl(var(--muted-foreground))", fontWeight: 400 }}>{body}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Not-for block */}
          <motion.div variants={fadeUp}
            className="rounded-xl"
            style={{ border: "1px solid hsl(var(--border) / 0.70)", padding: "1.5rem 1.75rem", background: "hsl(var(--background))" }}>
            <p style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "hsl(var(--muted-foreground) / 0.65)", marginBottom: "1rem" }}>
              Chưa phù hợp nếu
            </p>
            <div className="flex flex-wrap gap-x-8 gap-y-2.5">
              {notFor.map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "hsl(var(--muted-foreground) / 0.35)", flexShrink: 0 }} />
                  <span style={{ fontSize: "13.5px", color: "hsl(var(--muted-foreground) / 0.72)", fontWeight: 400 }}>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* 5. Journey */
const stages = [
  {
    num: "01", label: "Giai đoạn 1", title: "Đổi góc nhìn",
    points: ["Hiểu vì sao giữ tiền không có nghĩa là an toàn", "Hiểu tự do tài chính được đo bằng số tiền đang làm việc thay mình", "Phân biệt tiền nằm im và tài sản thực sự"],
  },
  {
    num: "02", label: "Giai đoạn 2", title: "Xây hệ thống",
    points: ["Bắt đầu trích 5–10% cố định từ thu nhập hàng tháng", "Xây danh mục 3 cấp độ: bảo vệ, tăng trưởng, mạo hiểm có ý thức", "Dùng công cụ hỗ trợ để không phải nghiên cứu hàng giờ mỗi tuần"],
  },
  {
    num: "03", label: "Giai đoạn 3", title: "Hành động nhỏ nhưng thật",
    points: ["Bước đầu tiên không cần lớn, chỉ cần cụ thể và có ý thức", "Xây thói quen nhỏ nhưng nhất quán thay vì quyết định lớn nhưng không thực hiện", "Đồng hành dài hạn với cộng đồng và thông tin đáng tin cậy"],
  },
];

function JourneySection() {
  return (
    <section id="lo-trinh" className="py-24 md:py-32" style={{ background: "linear-gradient(165deg, #0c2420 0%, #091c18 100%)" }}>
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={VP} variants={stagger} className="space-y-14">
          <div className="max-w-2xl space-y-4">
            <motion.div variants={fadeUp}><SectionLabel dark>Hành trình</SectionLabel></motion.div>
            <motion.div variants={fadeUp}><SectionHeading dark>3 chuyển đổi lớn của hành trình này</SectionHeading></motion.div>
          </div>
          <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stages.map(({ num, label, title, points }) => (
              <motion.div key={num} variants={fadeUp}
                className="rounded-xl flex flex-col"
                style={{ border: "1px solid rgba(52,160,140,0.18)", padding: "1.75rem 1.625rem", background: "rgba(255,255,255,0.04)", backdropFilter: "blur(4px)" }}>
                <div className="flex items-center gap-3 mb-5">
                  <span style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.13em", color: "rgba(52,160,140,0.72)" }}>{num}</span>
                  <div style={{ width: "2rem", height: "1px", background: "rgba(52,160,140,0.28)" }} />
                  <span style={{ fontSize: "11px", fontWeight: 400, fontStyle: "italic", letterSpacing: "0.01em", color: "rgba(255,255,255,0.38)" }}>{label}</span>
                </div>
                <h3 style={{ fontSize: "17px", fontWeight: 700, color: "rgba(255,255,255,0.92)", marginBottom: "1rem", letterSpacing: "-0.01em", lineHeight: 1.25 }}>{title}</h3>
                <ul className="space-y-2.5">
                  {points.map((pt, j) => (
                    <li key={j} className="flex items-start gap-2.5">
                      <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "rgba(52,160,140,0.65)", flexShrink: 0, marginTop: "7px" }} />
                      <span style={{ fontSize: "13.5px", lineHeight: 1.75, color: "rgba(255,255,255,0.58)", fontWeight: 300 }}>{pt}</span>
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

/* 6. Core knowledge */
const knowledge = [
  { num: "01", title: "Ba kiểu người cùng mức thu nhập", body: "Cùng thu nhập nhưng kết quả tài chính sau 10 năm hoàn toàn khác nhau. Điều gì tạo ra sự khác biệt đó?" },
  { num: "02", title: "Lạm phát: cái lấy đi thầm lặng", body: "Lạm phát không gây đau tức thì nhưng bào mòn đều đặn. Hiểu đúng để biết giữ tiền mặt có thực sự an toàn không." },
  { num: "03", title: "Tiền chờ đợi và tiền làm việc", body: "Hai đồng tiền cùng giá trị hôm nay nhưng khác nhau hoàn toàn về tương lai nếu một đồng được đặt đúng chỗ." },
  { num: "04", title: "Danh mục 3 cấp độ", body: "Bảo vệ – Tăng trưởng – Rủi ro có ý thức. Mỗi cấp độ phục vụ một mục tiêu khác nhau và cần được cân bằng phù hợp." },
  { num: "05", title: "Vì sao dồn hết vào một dự án không phải chiến lược", body: "Tập trung có thể tạo ra lợi nhuận lớn, nhưng cũng có thể xóa sạch mọi thứ. Đa dạng hóa có ý thức là gì?" },
  { num: "06", title: "Bắt đầu không cần hàng triệu đô", body: "5% từ thu nhập mỗi tháng, đặt đúng chỗ, trong 10 năm có thể tạo ra kết quả đáng kể hơn bạn nghĩ." },
  { num: "07", title: "Lãi kép: thời gian và tính đều đặn", body: "Không phải phép màu. Là toán học. Và người bắt đầu sớm hơn 5 năm có lợi thế không thể bù đắp bằng số tiền." },
];

function KnowledgeSection() {
  return (
    <section className="py-24 md:py-32 bg-background">
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={VP} variants={stagger} className="space-y-14">
          <div className="max-w-2xl space-y-4">
            <motion.div variants={fadeUp}><SectionLabel>Kiến thức</SectionLabel></motion.div>
            <motion.div variants={fadeUp}><SectionHeading>Những gì anh/chị sẽ bắt đầu nhìn rõ hơn</SectionHeading></motion.div>
          </div>
          <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {knowledge.map(({ num, title, body }) => (
              <motion.div key={num} variants={fadeUp}
                className="rounded-xl bg-card flex flex-col"
                style={{ border: "1px solid hsl(var(--border) / 0.88)", padding: "1.5rem 1.5rem", boxShadow: "0 2px 8px rgba(10,40,35,0.05)", transition: "border-color 0.28s ease, transform 0.28s ease" }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "hsl(var(--primary) / 0.25)"; el.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "hsl(var(--border) / 0.88)"; el.style.transform = "translateY(0)"; }}>
                <div className="flex items-center gap-2.5 mb-3.5">
                  <span style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.13em", color: "hsl(var(--primary) / 0.68)" }}>{num}</span>
                  <div style={{ width: "1.5rem", height: "1px", background: "hsl(var(--primary) / 0.22)" }} />
                </div>
                <h3 style={{ fontSize: "14.5px", fontWeight: 700, lineHeight: 1.35, color: "hsl(var(--foreground))", marginBottom: "0.5rem", letterSpacing: "-0.008em" }}>{title}</h3>
                <p style={{ fontSize: "13px", lineHeight: 1.82, color: "hsl(var(--muted-foreground))", fontWeight: 400 }}>{body}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* 7. Psychology */
const barriers = [
  { num: "01", title: "Tôi không có tiền dư", body: "Không cần chờ có nhiều tiền để bắt đầu. 5% từ thu nhập hiện tại đặt đúng chỗ, đều đặn, đã là một bước đi thực sự." },
  { num: "02", title: "Tôi không hiểu gì về đầu tư", body: "Không cần hiểu hết ngay. Cần bắt đầu từ những nguyên lý nền tảng và không để sự thiếu kiến thức trở thành lý do dừng lại." },
  { num: "03", title: "Tôi sợ mất tiền", body: "Sợ mất tiền là hợp lý. Nhưng rủi ro không phải là kẻ thù — rủi ro không được quản lý mới là. Có hệ thống sẽ giúp anh/chị đi xa hơn mà không phải lo ngại liên tục." },
  { num: "04", title: "Tôi không có thời gian", body: "Đầu tư dài hạn đúng nghĩa không đòi hỏi theo dõi từng giờ. Một hệ thống tốt giúp anh/chị ra quyết định ít hơn nhưng có chất lượng hơn." },
];

function PsychologySection() {
  return (
    <section className="py-24 md:py-32 bg-card">
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={VP} variants={stagger} className="space-y-14">
          <div className="max-w-2xl space-y-4">
            <motion.div variants={fadeUp}><SectionLabel>Tâm lý</SectionLabel></motion.div>
            <motion.div variants={fadeUp}><SectionHeading>4 rào cản tâm lý phổ biến khi bắt đầu</SectionHeading></motion.div>
          </div>
          <motion.div variants={stagger} className="space-y-5">
            {barriers.map(({ num, title, body }) => (
              <motion.div key={num} variants={fadeUp} className="flex gap-5">
                <div style={{ flexShrink: 0, width: "2px", background: "hsl(var(--primary) / 0.38)", borderRadius: "999px", marginTop: "4px" }} />
                <div>
                  <div className="flex items-center gap-3 mb-1.5">
                    <span style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.13em", color: "hsl(var(--primary) / 0.68)" }}>{num}</span>
                    <h3 style={{ fontSize: "15.5px", fontWeight: 700, color: "hsl(var(--foreground))", lineHeight: 1.3, letterSpacing: "-0.008em" }}>{title}</h3>
                  </div>
                  <p style={{ fontSize: "13.5px", lineHeight: 1.85, color: "hsl(var(--muted-foreground))", fontWeight: 400 }}>{body}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* 8. SWC PASS */
const passFeatures = [
  "Phân tích hàng tháng với các khuyến nghị cụ thể",
  "Hỗ trợ đánh giá cổ phiếu cổ tức",
  "Hỗ trợ cân bằng rủi ro danh mục",
];

function SwcPassSection() {
  return (
    <section className="py-24 md:py-32" style={{ background: "linear-gradient(160deg, #0d2522 0%, #091d1a 100%)" }}>
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={VP} variants={stagger} className="space-y-12">
          <div className="max-w-2xl space-y-4">
            <motion.div variants={fadeUp}><SectionLabel dark>Hệ sinh thái</SectionLabel></motion.div>
            <motion.div variants={fadeUp}><SectionHeading dark>Road to $1M nằm ở đâu trong hệ sinh thái SWC PASS?</SectionHeading></motion.div>
          </div>
          <motion.div variants={fadeUp} className="max-w-2xl space-y-6">
            <p style={{ fontSize: "15px", lineHeight: 1.88, color: "rgba(255,255,255,0.62)", fontWeight: 300 }}>
              Road to $1M là nền tảng kiến thức nằm trong hệ sinh thái SWC PASS — một dịch vụ thông tin tài chính được xây dựng để đồng hành dài hạn, không phải để giải trí ngắn hạn.
            </p>
            <div className="space-y-3.5">
              {passFeatures.map((f, i) => (
                <div key={i} className="flex items-start gap-3.5">
                  <div style={{ flexShrink: 0, width: "2px", height: "100%", background: "rgba(52,160,140,0.45)", borderRadius: "999px", marginTop: "4px", alignSelf: "stretch" }} />
                  <span style={{ fontSize: "14px", lineHeight: 1.75, color: "rgba(255,255,255,0.70)", fontWeight: 300 }}>{f}</span>
                </div>
              ))}
            </div>
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: "1.5rem" }}>
              <p style={{ fontSize: "13.5px", fontStyle: "italic", color: "rgba(255,255,255,0.42)", lineHeight: 1.75, fontWeight: 300 }}>
                "Dịch vụ thông tin giúp anh/chị ra quyết định có ý thức hơn, không cam kết lợi nhuận ảo."
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* 9. Pricing */
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
          <div className="max-w-2xl space-y-4">
            <motion.div variants={fadeUp}><SectionLabel>Đồng hành</SectionLabel></motion.div>
            <motion.div variants={fadeUp}><SectionHeading>Các lựa chọn đồng hành</SectionHeading></motion.div>
            <motion.p variants={fadeUp} style={{ fontSize: "15px", lineHeight: 1.88, color: "hsl(var(--muted-foreground))", maxWidth: "34rem" }}>
              Không có áp lực chọn ngay. Đây là thông tin để anh/chị hiểu rõ hơn về cấu trúc, trước khi quyết định.
            </motion.p>
          </div>
          <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tiers.map(({ label, price, sub, tag }) => (
              <motion.div key={label} variants={fadeUp}
                className="rounded-xl bg-card relative flex flex-col"
                style={{ border: `1px solid ${tag ? "hsl(var(--primary) / 0.40)" : "hsl(var(--border) / 0.88)"}`, padding: "1.75rem 1.625rem", boxShadow: tag ? "0 4px 20px rgba(10,40,35,0.09)" : "0 2px 8px rgba(10,40,35,0.06)" }}>
                {tag && (
                  <span style={{ position: "absolute", top: "-1px", right: "1.25rem", fontSize: "10.5px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "hsl(var(--primary))", background: "hsl(var(--background))", padding: "3px 10px", borderRadius: "0 0 6px 6px", border: "1px solid hsl(var(--primary) / 0.30)", borderTop: "none" }}>{tag}</span>
                )}
                <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "hsl(var(--primary) / 0.68)", marginBottom: "1rem" }}>{label}</p>
                <p style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.02em", color: "hsl(var(--foreground))", lineHeight: 1, marginBottom: "0.5rem" }}>{price}</p>
                <p style={{ fontSize: "13px", color: "hsl(var(--muted-foreground))", fontWeight: 400, marginBottom: "1.5rem" }}>{sub}</p>
                <a href="#cta"
                  className="mt-auto inline-flex items-center justify-center rounded-full transition-all duration-200"
                  style={{ height: "38px", fontSize: "13px", fontWeight: 500, letterSpacing: "0.01em", background: tag ? "hsl(var(--primary))" : "transparent", color: tag ? "#fff" : "hsl(var(--primary))", border: `1px solid ${tag ? "transparent" : "hsl(var(--primary) / 0.45)"}`, textDecoration: "none" }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = tag ? "hsl(var(--primary) / 0.88)" : "hsl(var(--primary) / 0.07)"; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = tag ? "hsl(var(--primary))" : "transparent"; }}>
                  Đăng ký quan tâm
                </a>
              </motion.div>
            ))}
          </motion.div>
          <motion.div variants={fadeUp} className="flex items-center gap-4">
            <div style={{ width: "1.75rem", height: "1px", background: "hsl(var(--border))", flexShrink: 0 }} />
            <p style={{ fontSize: "13px", fontStyle: "italic", color: "hsl(var(--muted-foreground) / 0.72)", lineHeight: 1.65 }}>
              Điều kiện ưu đãi và thời hạn có thể thay đổi theo từng thời điểm.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* 10. Final CTA */
const steps = [
  { num: "01", title: "Chọn một tỷ lệ trích cố định", body: "Bắt đầu với 5–10% từ thu nhập tháng này. Không cần hoàn hảo, chỉ cần nhất quán." },
  { num: "02", title: "Liệt kê 3 mục tiêu tiền trong 12 tháng tới", body: "Một mục tiêu bảo vệ, một mục tiêu tăng trưởng, một mục tiêu mạo hiểm có ý thức. Rõ ràng hơn là tốt hơn." },
  { num: "03", title: "Đăng ký hoặc nhắn tin để hiểu rõ hơn", body: "Tìm hiểu cách SWC PASS hoạt động và xem liệu có phù hợp với giai đoạn anh/chị đang ở không." },
];

function FinalCTA() {
  const btnBase: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", height: "44px", borderRadius: "999px",
    fontSize: "14px", fontWeight: 500, letterSpacing: "0.01em", textDecoration: "none",
    transition: "all 0.25s ease",
  };
  return (
    <section id="cta" className="py-24 md:py-32" style={{ background: "linear-gradient(165deg, #0c2420 0%, #091c18 55%, #07161580 100%)" }}>
      <div className="max-w-4xl mx-auto px-5 sm:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={VP} variants={stagger} className="space-y-14">
          <div className="max-w-2xl space-y-4">
            <motion.div variants={fadeUp}><SectionLabel dark>Bắt đầu</SectionLabel></motion.div>
            <motion.div variants={fadeUp}><SectionHeading dark>Bước đi tiếp theo không cần lớn. Chỉ cần rõ ràng.</SectionHeading></motion.div>
          </div>
          <motion.div variants={stagger} className="space-y-8 max-w-2xl">
            {steps.map(({ num, title, body }) => (
              <motion.div key={num} variants={fadeUp} className="flex gap-5">
                <div style={{ flexShrink: 0, width: "2px", background: "rgba(52,160,140,0.44)", borderRadius: "999px", marginTop: "4px" }} />
                <div>
                  <div className="flex items-center gap-3 mb-1.5">
                    <span style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.13em", color: "rgba(52,160,140,0.72)" }}>{num}</span>
                    <p style={{ fontSize: "16px", fontWeight: 600, color: "rgba(255,255,255,0.90)", letterSpacing: "-0.008em", lineHeight: 1.3 }}>{title}</p>
                  </div>
                  <p style={{ fontSize: "14px", lineHeight: 1.85, color: "rgba(255,255,255,0.52)", fontWeight: 300 }}>{body}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
          <motion.div variants={fadeUp} className="flex flex-wrap gap-3 pt-2">
            <a href="#" style={{ ...btnBase, padding: "0 28px", background: "linear-gradient(140deg, #22917f, #1a7868)", color: "#fff", boxShadow: "0 4px 18px rgba(26,120,104,0.32)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 24px rgba(26,120,104,0.40)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 18px rgba(26,120,104,0.32)"; }}>
              Đăng ký quan tâm
            </a>
            <a href="#" style={{ ...btnBase, padding: "0 24px", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.88)", backdropFilter: "blur(8px)" }}
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
