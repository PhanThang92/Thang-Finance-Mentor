import React, { useEffect, useState } from "react";
import { leadsApi } from "@/lib/newsApi";
import { motion } from "framer-motion";

/* ── Animation presets ───────────────────────────────────── */
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.11 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.68, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};
const VP = { once: true, margin: "-56px" };

/* ── Design tokens ───────────────────────────────────────── */
const CARD_LIGHT: React.CSSProperties = {
  borderRadius: "0.75rem",
  border: "1px solid hsl(var(--border) / 0.92)",
  boxShadow: "0 2px 8px rgba(10,40,35,0.06)",
  padding: "1.875rem 1.75rem",
  transition: "border-color 0.28s ease, transform 0.28s ease",
};
const CARD_DARK: React.CSSProperties = {
  borderRadius: "0.75rem",
  border: "1px solid rgba(52,160,140,0.15)",
  background: "rgba(52,160,140,0.04)",
  padding: "1.875rem 1.75rem",
  transition: "border-color 0.28s ease",
};
const DARK_BG_A = "linear-gradient(160deg, #0d2622 0%, #091e1b 55%, #071815 100%)";
const DARK_BG_B = "linear-gradient(180deg, #091e1b 0%, #060f0d 100%)";
const DARK_BG_C = "linear-gradient(165deg, #0c2420 0%, #091c18 100%)";

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
function hoverLiftDark(e: React.MouseEvent) {
  (e.currentTarget as HTMLElement).style.borderColor = "rgba(52,160,140,0.34)";
}
function hoverResetDark(e: React.MouseEvent) {
  (e.currentTarget as HTMLElement).style.borderColor = "rgba(52,160,140,0.15)";
}

/* ── Shared editorial primitives ─────────────────────────── */
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

/* ── Reused button styles ────────────────────────────────── */
const BTN_PRIMARY: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  height: "44px", padding: "0 28px", borderRadius: "999px",
  fontSize: "14px", fontWeight: 500, letterSpacing: "0.01em",
  textDecoration: "none", background: "linear-gradient(140deg, #22917f, #1a7868)",
  color: "#fff", boxShadow: "0 4px 18px rgba(26,120,104,0.30)",
  transition: "transform 0.22s ease, box-shadow 0.22s ease", border: "none", cursor: "pointer",
};
const BTN_GHOST: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  height: "44px", padding: "0 24px", borderRadius: "999px",
  fontSize: "14px", fontWeight: 400, letterSpacing: "0.01em",
  background: "transparent", cursor: "pointer",
  border: "1px solid rgba(52,160,140,0.35)", color: "rgba(52,160,140,0.85)",
  transition: "border-color 0.22s ease, color 0.22s ease",
};
const BTN_SECONDARY_DARK: React.CSSProperties = {
  display: "inline-flex", alignItems: "center",
  height: "44px", padding: "0 24px", borderRadius: "999px",
  fontSize: "14px", fontWeight: 400, letterSpacing: "0.01em",
  textDecoration: "none", background: "rgba(255,255,255,0.07)",
  border: "1px solid rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.88)",
  backdropFilter: "blur(8px)", transition: "background 0.22s ease",
};

/* ── SEO ─────────────────────────────────────────────────── */
function useSEO() {
  useEffect(() => {
    const prev = document.title;
    document.title = "SWC Pass | Quyền truy cập vào hệ sinh thái SWC | Phan Văn Thắng SWC";
    let metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.name = "description";
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = "SWC Pass là sản phẩm nền tảng giúp bạn tiếp cận hệ sinh thái SWC theo cách có cấu trúc hơn, với quyền truy cập SWC Field, tài liệu liên quan và các lớp giá trị mở rộng theo từng hạng gói.";
    return () => { document.title = prev; };
  }, []);
}

/* ══════════════════════════════════════════════════════════
   A. HERO
══════════════════════════════════════════════════════════ */
function Hero({ onConsult }: { onConsult: () => void }) {
  return (
    <section className="relative overflow-hidden flex flex-col justify-center min-h-screen" style={{ background: DARK_BG_A }}>
      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div style={{ position: "absolute", top: "10%", right: "0%", width: "40rem", height: "40rem", borderRadius: "50%", background: "radial-gradient(circle, rgba(36,110,95,0.18) 0%, transparent 68%)", filter: "blur(72px)" }} />
        <div style={{ position: "absolute", bottom: "-8%", left: "-4%", width: "30rem", height: "30rem", borderRadius: "50%", background: "radial-gradient(circle, rgba(26,80,72,0.14) 0%, transparent 70%)", filter: "blur(56px)" }} />
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(90deg, transparent, rgba(52,160,140,0.14) 50%, transparent)" }} />
      </div>

      <div className="max-w-4xl mx-auto px-5 sm:px-8 relative z-10 pt-32 pb-24">
        <motion.div initial="hidden" animate="visible" variants={stagger}>

          <motion.div variants={fadeUp} style={{ marginBottom: "1.75rem" }}>
            <SectionLabel dark>SWC Pass · Hệ sinh thái SWC</SectionLabel>
          </motion.div>

          <motion.h1 variants={fadeUp} style={{ fontSize: "clamp(2.4rem, 6.5vw, 4rem)", fontWeight: 800, lineHeight: 1.08, letterSpacing: "-0.030em", color: "rgba(255,255,255,0.96)", marginBottom: "1.375rem" }}>
            SWC Pass
          </motion.h1>

          <motion.p variants={fadeUp} style={{ fontSize: "clamp(1rem, 2.2vw, 1.15rem)", lineHeight: 1.68, fontWeight: 400, color: "rgba(255,255,255,0.76)", maxWidth: "36rem", marginBottom: "1.125rem" }}>
            Cổng truy cập có cấu trúc vào hệ sinh thái SWC.
          </motion.p>

          <motion.p variants={fadeUp} style={{ fontSize: "14px", lineHeight: 1.92, fontWeight: 300, color: "rgba(255,255,255,0.42)", maxWidth: "34rem", marginBottom: "1.875rem" }}>
            SWC Pass là lớp truy cập nền tảng dành cho người muốn bước vào hệ sinh thái SWC một cách rõ ràng và có hệ thống hơn — với quyền truy cập SWC Field, tài liệu liên quan và các lớp giá trị sâu hơn tùy theo gói.
          </motion.p>

          <motion.div variants={fadeUp} style={{ display: "flex", alignItems: "flex-start", gap: "1rem", marginBottom: "2.25rem" }}>
            <div style={{ marginTop: "0.38rem", width: "2.5rem", height: "1.5px", background: "rgba(52,160,140,0.60)", borderRadius: "999px", flexShrink: 0 }} />
            <p style={{ fontSize: "clamp(14px, 1.8vw, 15px)", fontStyle: "italic", fontWeight: 400, color: "rgba(52,160,140,0.90)", letterSpacing: "0.004em", lineHeight: 1.62, margin: 0 }}>
              Không chỉ là một sản phẩm nội dung. Mà là điểm khởi đầu cho một hệ thống.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "2.25rem" }}>
            {["Truy cập SWC Field", "Tài liệu có hệ thống", "Hỗ trợ dài hạn"].map((tag) => (
              <span key={tag} style={{
                display: "inline-flex", alignItems: "center",
                height: "26px", padding: "0 11px", borderRadius: "999px",
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
            <a href="#goi-swc-pass" style={BTN_PRIMARY}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 24px rgba(26,120,104,0.38)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 18px rgba(26,120,104,0.30)"; }}>
              Xem các gói
            </a>
            <button style={BTN_SECONDARY_DARK} onClick={onConsult}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.12)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)"; }}>
              Tư vấn thêm
            </button>
          </motion.div>

        </motion.div>
      </div>

      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(90deg, transparent, rgba(52,160,140,0.10) 50%, transparent)" }} />
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   B. WHAT IS SWC PASS (light)
══════════════════════════════════════════════════════════ */
const whatCards = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="1.4" />
        <path d="M7 10l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Cổng truy cập vào SWC Field",
    body: "SWC Pass cấp quyền truy cập vào SWC Field — nền tảng nội dung, phân tích và tài liệu cốt lõi của hệ sinh thái SWC.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="3" y="4" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.4" />
        <path d="M7 8h6M7 11h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
    title: "Tài liệu và phân tích có cấu trúc",
    body: "Không phải thông tin rải rác từ nhiều nguồn. Là tài liệu được tổ chức theo hệ thống, phù hợp với từng giai đoạn tiếp cận.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M4 10h12M4 10l4-4M4 10l4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="16" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    ),
    title: "Lớp giá trị mở rộng theo từng gói",
    body: "Gói cao hơn bao gồm Road to a Million, phân tích tư vấn chuyên sâu và quyền truy cập vào các sản phẩm/ứng dụng mở rộng trong hệ sinh thái.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.4" />
        <path d="M10 3v2M10 15v2M3 10h2M15 10h2M5.22 5.22l1.42 1.42M13.36 13.36l1.42 1.42M5.22 14.78l1.42-1.42M13.36 6.64l1.42-1.42" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
    title: "Kết nối vào hệ sinh thái dài hạn",
    body: "SWC Pass không đứng độc lập. Nó là điểm khởi đầu của một hành trình kết nối với cộng đồng, công cụ và định hướng phát triển trong dài hạn.",
  },
];

function WhatIsSection() {
  return (
    <section className="py-20 sm:py-28" style={{ background: "hsl(var(--background))" }}>
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={VP} variants={stagger} className="space-y-12">
          <div className="space-y-4 max-w-2xl">
            <motion.div variants={fadeUp}><SectionLabel>SWC Pass là gì</SectionLabel></motion.div>
            <motion.div variants={fadeUp}><SectionHeading>Không chỉ là sản phẩm nội dung</SectionHeading></motion.div>
            <motion.div variants={fadeUp}>
              <AnchorLine>SWC Pass là lớp nền tảng — cổng vào một hệ sinh thái, không phải một khóa học đơn lẻ.</AnchorLine>
            </motion.div>
          </div>

          <motion.div variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {whatCards.map(({ icon, title, body }, i) => (
              <motion.div key={i} variants={fadeUp} style={{ ...CARD_LIGHT, display: "flex", gap: "1.25rem", alignItems: "flex-start" }} onMouseEnter={hoverLift} onMouseLeave={hoverReset}>
                <div style={{
                  flexShrink: 0, width: "42px", height: "42px", borderRadius: "10px",
                  background: "hsl(var(--primary) / 0.08)", border: "1px solid hsl(var(--primary) / 0.16)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "hsl(var(--primary))", marginTop: "2px",
                }}>
                  {icon}
                </div>
                <div>
                  <h3 style={{ fontSize: "15px", fontWeight: 600, lineHeight: 1.3, letterSpacing: "-0.010em", color: "hsl(var(--foreground))", marginBottom: "0.6rem" }}>{title}</h3>
                  <p style={{ fontSize: "13.5px", lineHeight: 1.85, color: "hsl(var(--foreground) / 0.50)", fontWeight: 400 }}>{body}</p>
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
   C. PROBLEM / SOLUTION (dark)
══════════════════════════════════════════════════════════ */
const problemCards = [
  {
    from: "Thông tin phân mảnh, khó tổng hợp",
    to: "Một điểm truy cập có cấu trúc, dễ định hướng",
    body: "Thay vì thu thập thông tin từ nhiều nguồn rời rạc, SWC Pass cung cấp tài liệu và phân tích theo hệ thống rõ ràng trong SWC Field.",
  },
  {
    from: "Quyết định dựa trên cảm xúc và tin tức ngắn hạn",
    to: "Góc nhìn có hệ thống và khuôn khổ dài hạn",
    body: "Việc có công cụ và tài liệu phù hợp giúp người dùng tư duy rõ hơn thay vì phản ứng với biến động thị trường theo cảm tính.",
  },
  {
    from: "Theo dõi thụ động, không có điểm bắt đầu rõ ràng",
    to: "Tham gia chủ động vào hệ sinh thái theo cách riêng",
    body: "SWC Pass tạo ra điểm khởi đầu rõ ràng — từ người theo dõi bên ngoài đến người có quyền truy cập thật sự vào hệ sinh thái.",
  },
];

function ProblemSection() {
  return (
    <section className="py-20 sm:py-28" style={{ background: DARK_BG_C }}>
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={VP} variants={stagger} className="space-y-12">
          <div className="space-y-4 max-w-2xl">
            <motion.div variants={fadeUp}><SectionLabel dark>SWC Pass giúp giải quyết điều gì</SectionLabel></motion.div>
            <motion.div variants={fadeUp}><SectionHeading dark>Từ thụ động đến có hệ thống</SectionHeading></motion.div>
            <motion.div variants={fadeUp}>
              <AnchorLine dark>Nhiều người không thiếu thông tin — họ thiếu một cách tiếp cận có cấu trúc.</AnchorLine>
            </motion.div>
          </div>

          <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {problemCards.map(({ from, to, body }, i) => (
              <motion.div key={i} variants={fadeUp} style={CARD_DARK} onMouseEnter={hoverLiftDark} onMouseLeave={hoverResetDark}>
                <div style={{ marginBottom: "1.25rem" }}>
                  <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", marginBottom: "0.5rem" }}>Trước</p>
                  <p style={{ fontSize: "13.5px", fontWeight: 400, color: "rgba(255,255,255,0.52)", lineHeight: 1.5 }}>{from}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "1.25rem" }}>
                  <div style={{ flex: 1, height: "1px", background: "rgba(52,160,140,0.25)" }} />
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ color: "rgba(52,160,140,0.60)", flexShrink: 0 }}>
                    <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div style={{ flex: 1, height: "1px", background: "rgba(52,160,140,0.25)" }} />
                </div>
                <div style={{ marginBottom: "1.125rem" }}>
                  <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(52,160,140,0.70)", marginBottom: "0.5rem" }}>Sau</p>
                  <p style={{ fontSize: "14px", fontWeight: 600, color: "rgba(255,255,255,0.88)", lineHeight: 1.38, letterSpacing: "-0.008em" }}>{to}</p>
                </div>
                <p style={{ fontSize: "13.5px", lineHeight: 1.85, color: "rgba(255,255,255,0.44)", fontWeight: 300 }}>{body}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   D. WHAT'S INSIDE (light)
══════════════════════════════════════════════════════════ */
const insideItems = [
  {
    num: "01",
    title: "SWC Field",
    body: "Nền tảng nội dung cốt lõi của hệ sinh thái. Bao gồm tài liệu, phân tích và góc nhìn được tổ chức có hệ thống — thay vì rải rác qua nhiều nguồn khác nhau.",
    note: null,
  },
  {
    num: "02",
    title: "Road to a Million",
    body: "Một khuôn khổ tài chính dài hạn, thực tiễn — không phải lời hứa kết quả. Được thiết kế để giúp người dùng xây dựng lộ trình tài chính theo hướng có cấu trúc và có ý thức.",
    note: "Có trong gói Ultimate.",
  },
  {
    num: "03",
    title: "Phân tích và tư vấn",
    body: "Các phân tích chuyên sâu và góc nhìn từ hệ sinh thái SWC — giúp người dùng có thêm tham chiếu trong quá trình ra quyết định, không thay thế tư vấn chuyên nghiệp độc lập.",
    note: null,
  },
  {
    num: "04",
    title: "Hệ sinh thái mở rộng",
    body: "Marketplace, sản phẩm và ứng dụng tương lai trong hệ sinh thái SWC — tùy theo gói và giai đoạn phát triển. SWC Pass là nền tảng kết nối vào những lớp giá trị đang được xây dựng.",
    note: "Có trong gói Ultimate khi áp dụng.",
  },
];

function InsideSection() {
  return (
    <section className="py-20 sm:py-28" style={{ background: "hsl(var(--card))" }}>
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={VP} variants={stagger} className="space-y-12">
          <div className="space-y-4 max-w-2xl">
            <motion.div variants={fadeUp}><SectionLabel>Bên trong SWC Pass có gì</SectionLabel></motion.div>
            <motion.div variants={fadeUp}><SectionHeading>4 lớp giá trị của hệ sinh thái</SectionHeading></motion.div>
            <motion.div variants={fadeUp}>
              <AnchorLine>Mỗi lớp phục vụ một mục đích khác nhau — và mở rộng theo từng hạng gói.</AnchorLine>
            </motion.div>
          </div>

          <motion.div variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {insideItems.map(({ num, title, body, note }) => (
              <motion.div key={num} variants={fadeUp} className="bg-background" style={CARD_LIGHT} onMouseEnter={hoverLift} onMouseLeave={hoverReset}>
                <NumMarker num={num} />
                <h3 style={{ fontSize: "16px", fontWeight: 700, lineHeight: 1.28, letterSpacing: "-0.012em", color: "hsl(var(--foreground))", marginBottom: "0.75rem" }}>{title}</h3>
                <p style={{ fontSize: "14px", lineHeight: 1.88, color: "hsl(var(--foreground) / 0.50)", fontWeight: 400 }}>{body}</p>
                {note && (
                  <div style={{ marginTop: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "hsl(var(--primary) / 0.55)", flexShrink: 0 }} />
                    <span style={{ fontSize: "12px", fontWeight: 500, color: "hsl(var(--primary) / 0.75)", fontStyle: "italic" }}>{note}</span>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   E. WHO IS IT FOR (light bg)
══════════════════════════════════════════════════════════ */
const audienceCards = [
  {
    num: "01",
    title: "Người mới muốn điểm khởi đầu có cấu trúc",
    body: "Anh/chị đã theo dõi thông tin về SWC hoặc tài chính cá nhân, nhưng chưa có điểm vào rõ ràng. SWC Pass tạo ra điểm khởi đầu đó — có hệ thống, không rối.",
  },
  {
    num: "02",
    title: "Người đã nhìn thấy giá trị của tư duy dài hạn",
    body: "Anh/chị hiểu rằng tài chính cá nhân cần cách tiếp cận hệ thống, không phải thông tin ngắn hạn. SWC Pass phù hợp cho người muốn đi theo hướng đó một cách có ý thức.",
  },
  {
    num: "03",
    title: "Người muốn truy cập sâu hoặc đồng hành dài hạn",
    body: "Anh/chị muốn tham gia cộng đồng, có quyền truy cập toàn diện vào hệ sinh thái, hoặc tìm hiểu về hướng đối tác trong hệ thống. Gói Ultimate được thiết kế cho nhóm này.",
  },
];
const notFor = ["tín hiệu đầu tư ngắn hạn", "cam kết lợi nhuận", "thông tin miễn phí không cần tham gia", "giải pháp thay thế tư vấn tài chính độc lập"];

function AudienceSection() {
  return (
    <section className="py-20 sm:py-28" style={{ background: "hsl(var(--background))" }}>
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={VP} variants={stagger} className="space-y-12">
          <div className="space-y-4 max-w-2xl">
            <motion.div variants={fadeUp}><SectionLabel>SWC Pass phù hợp với ai</SectionLabel></motion.div>
            <motion.div variants={fadeUp}><SectionHeading>Dành cho ai?</SectionHeading></motion.div>
            <motion.div variants={fadeUp}>
              <AnchorLine>Không phải cho tất cả mọi người — và điều đó là tốt.</AnchorLine>
            </motion.div>
          </div>

          <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {audienceCards.map(({ num, title, body }) => (
              <motion.div key={num} variants={fadeUp} className="bg-card flex flex-col" style={{ ...CARD_LIGHT, padding: "2rem 1.875rem" }} onMouseEnter={hoverLift} onMouseLeave={hoverReset}>
                <NumMarker num={num} />
                <h3 style={{ fontSize: "15px", fontWeight: 600, lineHeight: 1.30, letterSpacing: "-0.010em", color: "hsl(var(--foreground))", marginBottom: "0.75rem" }}>{title}</h3>
                <p style={{ fontSize: "13.5px", lineHeight: 1.88, color: "hsl(var(--foreground) / 0.50)", fontWeight: 400 }}>{body}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div variants={fadeUp} style={{ borderRadius: "0.75rem", border: "1px solid hsl(var(--border) / 0.65)", padding: "1.625rem 1.875rem", background: "hsl(var(--card))" }}>
            <p style={{ fontSize: "12.5px", fontWeight: 500, letterSpacing: "0.005em", color: "hsl(var(--foreground) / 0.42)", marginBottom: "0.875rem" }}>
              Chưa phù hợp nếu anh/chị đang tìm
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem 2.25rem" }}>
              {notFor.map((item) => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <div style={{ width: "3px", height: "3px", borderRadius: "50%", background: "hsl(var(--foreground) / 0.28)", flexShrink: 0 }} />
                  <span style={{ fontSize: "13.5px", color: "hsl(var(--foreground) / 0.50)", fontWeight: 400 }}>{item}</span>
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
   F. PRICING (dark)
══════════════════════════════════════════════════════════ */
const plans = [
  {
    name: "Essential",
    price: "$240",
    duration: "1 năm + 90 ngày",
    tag: "Khởi đầu",
    highlight: false,
    features: [
      "Truy cập SWC Field",
      "Tài liệu và phân tích cơ bản",
      "Cộng đồng SWC",
      "Cập nhật nội dung trong thời hạn",
    ],
    note: "Phù hợp cho người mới muốn bắt đầu có cấu trúc.",
    ctaLabel: "Tìm hiểu Essential",
  },
  {
    name: "Plus",
    price: "$600",
    duration: "5 năm",
    tag: "Phổ biến",
    highlight: true,
    features: [
      "Tất cả giá trị của Essential",
      "Thời hạn 5 năm — cam kết dài hạn",
      "Truy cập SWC Field đầy đủ",
      "Ưu tiên tiếp cận nội dung mới",
    ],
    note: "Phù hợp cho người đã hiểu giá trị của hệ thống và muốn đồng hành lâu dài.",
    ctaLabel: "Tìm hiểu Plus",
  },
  {
    name: "Ultimate",
    price: "$2,600",
    duration: "Trọn đời",
    tag: "Toàn diện",
    highlight: false,
    features: [
      "Truy cập SWC Field không giới hạn",
      "Road to a Million — lộ trình tài chính dài hạn",
      "Sản phẩm & ứng dụng hệ sinh thái (khi áp dụng)",
      "Ưu tiên tư vấn và hỗ trợ",
      "Định hướng đối tác trong hệ sinh thái",
    ],
    note: "Phù hợp cho người muốn tham gia dài hạn hoặc tìm hiểu hướng đối tác.",
    ctaLabel: "Tìm hiểu Ultimate",
  },
];

function PricingSection({ onConsult }: { onConsult: () => void }) {
  return (
    <section id="goi-swc-pass" className="py-20 sm:py-28" style={{ background: DARK_BG_B }}>
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={VP} variants={stagger} className="space-y-12">
          <div className="space-y-4 max-w-2xl">
            <motion.div variants={fadeUp}><SectionLabel dark>Các hạng gói SWC Pass</SectionLabel></motion.div>
            <motion.div variants={fadeUp}><SectionHeading dark>Chọn mức truy cập phù hợp</SectionHeading></motion.div>
            <motion.div variants={fadeUp}>
              <AnchorLine dark>Mỗi gói phục vụ một giai đoạn khác nhau — không cần vội, không cần mua nhiều hơn nhu cầu thật.</AnchorLine>
            </motion.div>
          </div>

          <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map(({ name, price, duration, tag, highlight, features, note, ctaLabel }) => (
              <motion.div key={name} variants={fadeUp} style={{
                borderRadius: "0.875rem",
                border: highlight ? "1px solid rgba(52,160,140,0.45)" : "1px solid rgba(52,160,140,0.15)",
                background: highlight ? "rgba(52,160,140,0.08)" : "rgba(255,255,255,0.025)",
                padding: "2rem 1.75rem",
                display: "flex", flexDirection: "column",
                position: "relative",
                transition: "border-color 0.25s ease",
              }} onMouseEnter={hoverLiftDark} onMouseLeave={hoverResetDark}>
                {highlight && (
                  <div style={{
                    position: "absolute", top: "-1px", left: "50%", transform: "translateX(-50%)",
                    background: "linear-gradient(135deg, #22917f, #1a7868)",
                    borderRadius: "0 0 8px 8px", padding: "3px 14px",
                    fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em",
                    textTransform: "uppercase", color: "#fff",
                  }}>
                    {tag}
                  </div>
                )}

                <div style={{ marginBottom: "0.625rem" }}>
                  <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(52,160,140,0.72)", marginBottom: "0.5rem" }}>{name}</p>
                  <p style={{ fontSize: "clamp(2rem, 5vw, 2.6rem)", fontWeight: 800, color: "rgba(255,255,255,0.96)", letterSpacing: "-0.032em", lineHeight: 1 }}>{price}</p>
                  <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.40)", marginTop: "0.35rem", fontWeight: 300 }}>{duration}</p>
                </div>

                <div style={{ width: "100%", height: "1px", background: "rgba(52,160,140,0.15)", margin: "1.25rem 0" }} />

                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 1.5rem", display: "flex", flexDirection: "column", gap: "0.7rem", flex: 1 }}>
                  {features.map((f) => (
                    <li key={f} style={{ display: "flex", gap: "0.625rem", alignItems: "flex-start" }}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: "3px", color: "rgba(52,160,140,0.75)" }}>
                        <path d="M2.5 7.5l3 2.5 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span style={{ fontSize: "13.5px", lineHeight: 1.6, color: "rgba(255,255,255,0.70)", fontWeight: 300 }}>{f}</span>
                    </li>
                  ))}
                </ul>

                <p style={{ fontSize: "12px", lineHeight: 1.70, color: "rgba(255,255,255,0.30)", fontStyle: "italic", marginBottom: "1.375rem" }}>{note}</p>

                <button style={BTN_GHOST} onClick={onConsult}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(52,160,140,0.60)"; (e.currentTarget as HTMLElement).style.color = "rgba(52,160,140,1)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(52,160,140,0.35)"; (e.currentTarget as HTMLElement).style.color = "rgba(52,160,140,0.85)"; }}>
                  {ctaLabel}
                </button>
              </motion.div>
            ))}
          </motion.div>

          <motion.div variants={fadeUp} style={{ borderRadius: "0.625rem", border: "1px solid rgba(255,255,255,0.07)", padding: "1.125rem 1.5rem", background: "rgba(255,255,255,0.025)" }}>
            <p style={{ fontSize: "12.5px", lineHeight: 1.72, color: "rgba(255,255,255,0.30)", fontWeight: 300, fontStyle: "italic", margin: 0 }}>
              Ghi chú: Quyền lợi và phạm vi các gói có thể được cập nhật theo thông báo chính thức từ hệ sinh thái SWC. Thông tin trên mang tính tổng quan, liên hệ để xác nhận chi tiết mới nhất.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   G. WHY FOUNDATIONAL (light)
══════════════════════════════════════════════════════════ */
const foundationalCards = [
  {
    title: "Điểm vào rõ ràng",
    body: "Thay vì tìm kiếm thông tin từ nhiều nơi, SWC Pass tạo ra một điểm khởi đầu có cấu trúc — giúp người mới định hướng nhanh hơn và người đã quan tâm đi sâu hơn.",
  },
  {
    title: "Hệ thống thay vì thông tin rời rạc",
    body: "Giá trị của SWC Pass không nằm ở từng nội dung đơn lẻ, mà ở cách tổ chức — tài liệu, phân tích và cộng đồng được kết nối có hệ thống.",
  },
  {
    title: "Cổng vào giá trị sâu hơn",
    body: "SWC Pass là nền tảng để tiếp cận các lớp giá trị tiếp theo trong hệ sinh thái SWC — từ phân tích chuyên sâu đến hướng đối tác — theo từng giai đoạn phù hợp.",
  },
];

function FoundationalSection() {
  return (
    <section className="py-20 sm:py-28" style={{ background: "hsl(var(--background))" }}>
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={VP} variants={stagger} className="space-y-12">
          <div className="space-y-4 max-w-2xl">
            <motion.div variants={fadeUp}><SectionLabel>Vì sao SWC Pass là sản phẩm nền tảng</SectionLabel></motion.div>
            <motion.div variants={fadeUp}><SectionHeading>Không phải một sản phẩm nội dung bình thường</SectionHeading></motion.div>
            <motion.div variants={fadeUp}>
              <AnchorLine>SWC Pass là lớp kết nối người dùng với hệ sinh thái — không chỉ với một tập nội dung.</AnchorLine>
            </motion.div>
          </div>

          <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {foundationalCards.map(({ title, body }, i) => (
              <motion.div key={i} variants={fadeUp} style={{ ...CARD_LIGHT, borderTop: "3px solid hsl(var(--primary) / 0.22)" }} onMouseEnter={hoverLift} onMouseLeave={hoverReset}>
                <h3 style={{ fontSize: "15.5px", fontWeight: 700, lineHeight: 1.3, letterSpacing: "-0.012em", color: "hsl(var(--foreground))", marginBottom: "0.875rem" }}>{title}</h3>
                <p style={{ fontSize: "13.5px", lineHeight: 1.88, color: "hsl(var(--foreground) / 0.50)", fontWeight: 400 }}>{body}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   H. MENTOR GUIDANCE (dark)
══════════════════════════════════════════════════════════ */
function MentorSection({ onConsult }: { onConsult: () => void }) {
  return (
    <section className="py-20 sm:py-28" style={{ background: DARK_BG_A }}>
      <div className="max-w-3xl mx-auto px-5 sm:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={VP} variants={stagger} className="space-y-8">

          <motion.div variants={fadeUp}><SectionLabel dark>Cách tôi khuyên anh/chị tiếp cận SWC Pass</SectionLabel></motion.div>

          <motion.div variants={fadeUp} style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
            <div style={{ width: "2px", flexShrink: 0, background: "rgba(52,160,140,0.40)", borderRadius: "999px", marginTop: "4px", alignSelf: "stretch" }} />
            <p style={{ fontSize: "clamp(1.1rem, 2.4vw, 1.3rem)", fontWeight: 600, lineHeight: 1.35, letterSpacing: "-0.012em", color: "rgba(255,255,255,0.90)", margin: 0 }}>
              Đừng nhìn SWC Pass như một lối tắt.<br />Hãy nhìn nó như quyền truy cập vào một hệ thống.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} style={{ display: "flex", flexDirection: "column", gap: "1.375rem" }}>
            {[
              "Nếu anh/chị cần một nơi rõ ràng hơn để bắt đầu — một cấu trúc thay vì thông tin rải rác — thì SWC Pass là đáng cân nhắc.",
              "Nếu anh/chị đã hiểu giá trị của cách tiếp cận dài hạn và muốn có công cụ, tài liệu và cộng đồng đi cùng — thì SWC Pass phù hợp.",
              "Nếu anh/chị vẫn chưa có nền tảng tài chính cá nhân rõ ràng, chưa có mục tiêu cụ thể, hoặc đang tìm kiếm kết quả nhanh — thì hãy hiểu hệ thống trước và đi từng bước.",
            ].map((text, i) => (
              <div key={i} style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                <span style={{ flexShrink: 0, marginTop: "0.5rem", fontSize: "10px", fontWeight: 600, letterSpacing: "0.10em", color: "rgba(52,160,140,0.68)" }}>0{i + 1}</span>
                <p style={{ fontSize: "clamp(14px, 1.9vw, 15.5px)", lineHeight: 1.88, color: "rgba(255,255,255,0.60)", fontWeight: 300, margin: 0 }}>{text}</p>
              </div>
            ))}
          </motion.div>

          {/* Author signature */}
          <motion.div variants={fadeUp} style={{ display: "flex", alignItems: "center", gap: "1rem", paddingTop: "1.5rem", borderTop: "1px solid rgba(52,160,140,0.12)" }}>
            <div style={{
              width: "44px", height: "44px", borderRadius: "50%", flexShrink: 0,
              background: "rgba(52,160,140,0.12)", border: "1.5px solid rgba(52,160,140,0.24)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ fontSize: "16px", fontWeight: 700, color: "rgba(52,160,140,0.88)" }}>T</span>
            </div>
            <div>
              <p style={{ fontSize: "13.5px", fontWeight: 600, color: "rgba(255,255,255,0.82)", margin: 0, lineHeight: 1.3 }}>Phan Văn Thắng</p>
              <p style={{ fontSize: "12px", fontWeight: 300, color: "rgba(255,255,255,0.32)", margin: "2px 0 0", fontStyle: "italic" }}>Mentor tài chính dài hạn · Hệ sinh thái SWC</p>
            </div>
            <div style={{ marginLeft: "auto" }}>
              <button style={{ ...BTN_GHOST, height: "38px", fontSize: "13px" }} onClick={onConsult}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(52,160,140,0.60)"; (e.currentTarget as HTMLElement).style.color = "rgba(52,160,140,1)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(52,160,140,0.35)"; (e.currentTarget as HTMLElement).style.color = "rgba(52,160,140,0.85)"; }}>
                Đặt câu hỏi
              </button>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   I. FAQ (dark)
══════════════════════════════════════════════════════════ */
function FAQItem({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
  return (
    <div style={{ borderBottom: "1px solid rgba(52,160,140,0.12)" }}>
      <button onClick={onToggle} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", padding: "1.125rem 0", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
        <span style={{ fontSize: "14px", fontWeight: open ? 500 : 400, color: open ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.72)", letterSpacing: "-0.008em", lineHeight: 1.35, transition: "color 0.18s ease" }}>
          {q}
        </span>
        <span style={{ flexShrink: 0, width: "22px", height: "22px", borderRadius: "50%", border: `1px solid ${open ? "rgba(52,160,140,0.50)" : "rgba(255,255,255,0.14)"}`, display: "flex", alignItems: "center", justifyContent: "center", color: open ? "rgba(52,160,140,0.90)" : "rgba(255,255,255,0.40)", transition: "border-color 0.18s ease, color 0.18s ease, transform 0.22s ease", transform: open ? "rotate(45deg)" : "rotate(0deg)" }}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <line x1="5" y1="1" x2="5" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="1" y1="5" x2="9" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </span>
      </button>
      {open && (
        <div style={{ paddingBottom: "1.25rem" }}>
          <p style={{ fontSize: "13.5px", lineHeight: 1.88, color: "rgba(255,255,255,0.48)", fontWeight: 300 }}>{a}</p>
        </div>
      )}
    </div>
  );
}

function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const faqs = [
    { q: "SWC Pass là khóa học hay sản phẩm truy cập hệ sinh thái?", a: "SWC Pass là sản phẩm truy cập — không phải khóa học độc lập. Nó cấp quyền vào SWC Field và hệ sinh thái SWC, không đơn giản là một tập nội dung đóng gói. Cách tiếp đúng nhất là coi đây là một cổng vào, không phải một khóa học." },
    { q: "SWC Pass có bao gồm SWC Field không?", a: "Có. SWC Field là thành phần cốt lõi trong tất cả các gói SWC Pass. Tùy hạng gói, phạm vi truy cập và tài liệu đi kèm sẽ khác nhau." },
    { q: "Gói nào bao gồm Road to a Million?", a: "Road to a Million được bao gồm trong gói Ultimate. Đây là khuôn khổ tài chính dài hạn — không phải lời hứa kết quả, mà là cách tiếp cận và lộ trình có cấu trúc cho người muốn xây dựng tài chính theo hướng bài bản." },
    { q: "SWC Pass có phù hợp với người mới bắt đầu không?", a: "Phù hợp, nhưng có điều kiện. Nếu anh/chị đã có nền tảng cơ bản về tài chính cá nhân và hiểu mình đang tìm kiếm gì, SWC Pass là điểm khởi đầu tốt. Nếu chưa, nên tìm hiểu nội dung miễn phí từ kênh Thắng SWC trước khi quyết định." },
    { q: "Có hướng đối tác hay affiliate trong SWC Pass không?", a: "Có trong gói Ultimate và một số hướng cụ thể trong hệ sinh thái. Tuy nhiên, hướng đối tác nên được hiểu là đồng hành dài hạn với hệ sinh thái — không phải mô hình kiếm tiền nhanh hay hoa hồng giới thiệu đơn giản. Liên hệ trực tiếp để trao đổi cụ thể hơn." },
    { q: "Tôi nên chọn Essential, Plus hay Ultimate?", a: "Essential phù hợp nếu anh/chị muốn bắt đầu và trải nghiệm trong 1 năm. Plus phù hợp nếu đã hiểu giá trị và muốn cam kết dài hơn với chi phí hợp lý hơn. Ultimate phù hợp nếu muốn truy cập toàn diện — bao gồm Road to a Million và các sản phẩm hệ sinh thái — hoặc tìm hiểu hướng đối tác." },
  ];

  return (
    <section className="py-20 sm:py-24" style={{ background: DARK_BG_B }}>
      <div className="max-w-3xl mx-auto px-5 sm:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={VP} variants={stagger}>
          <motion.div variants={fadeUp} style={{ marginBottom: "1.25rem" }}><SectionLabel dark>FAQ</SectionLabel></motion.div>
          <motion.div variants={fadeUp} style={{ marginBottom: "2.75rem" }}><SectionHeading dark>Câu hỏi thường gặp</SectionHeading></motion.div>
          <motion.div variants={fadeUp}>
            {faqs.map((faq, i) => (
              <FAQItem key={i} q={faq.q} a={faq.a} open={openIdx === i} onToggle={() => setOpenIdx(openIdx === i ? null : i)} />
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   J. FINAL CTA + CONSULT MODAL (dark)
══════════════════════════════════════════════════════════ */
function FinalCTASection({ showModal, onOpen, onClose }: { showModal: boolean; onOpen: () => void; onClose: () => void }) {
  const [name,  setName]  = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [plan,  setPlan]  = useState("");
  const [note,  setNote]  = useState("");
  const [sent,  setSent]  = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!name.trim() || !email.trim()) return;
    setLoading(true);
    try {
      await leadsApi.submit({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        sourceType: "swc-pass",
        sourcePage: "/san-pham/swc-pass",
        formType: "consultation",
        interestTopic: plan || undefined,
        message: note.trim() || undefined,
        consentStatus: "given",
      });
      setSent(true);
    } catch {
      setSent(true);
    } finally {
      setLoading(false);
    }
  }

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setName(""); setEmail(""); setPhone(""); setPlan(""); setNote(""); setSent(false);
    }, 320);
  };

  const overlay: React.CSSProperties = { position: "fixed", inset: 0, zIndex: 1000, background: "rgba(3,12,10,0.84)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" };
  const panel: React.CSSProperties = { width: "100%", maxWidth: "468px", position: "relative", background: "linear-gradient(160deg, #0f2825 0%, #081e1b 100%)", border: "1px solid rgba(52,160,140,0.18)", borderRadius: "1rem", padding: "2rem 2rem 2.25rem", boxShadow: "0 24px 64px rgba(0,0,0,0.50)", maxHeight: "90vh", overflowY: "auto" };
  const fieldLabel: React.CSSProperties = { display: "block", fontSize: "10.5px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.36)", marginBottom: "7px" };
  const fieldBase: React.CSSProperties = { width: "100%", height: "42px", padding: "0 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.11)", borderRadius: "8px", fontSize: "13.5px", fontWeight: 400, color: "rgba(255,255,255,0.84)", outline: "none", transition: "border-color 0.22s ease", boxSizing: "border-box" as const };
  const fieldSelect: React.CSSProperties = { ...fieldBase, cursor: "pointer", appearance: "none" as const, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='rgba(255,255,255,0.28)' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center", paddingRight: "36px" };
  const fieldTextarea: React.CSSProperties = { ...fieldBase, height: "72px", padding: "10px 14px", resize: "vertical" as const, lineHeight: 1.6 };
  const submitBtn: React.CSSProperties = { ...BTN_PRIMARY, width: "100%", height: "46px", fontSize: "14px", marginTop: "0.25rem" };
  const closeBtn: React.CSSProperties = { position: "absolute", top: "1rem", right: "1rem", width: "28px", height: "28px", borderRadius: "50%", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.46)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "17px", lineHeight: 1 };
  const focusBorder = (e: React.FocusEvent<HTMLElement>) => (e.currentTarget.style.borderColor = "rgba(52,160,140,0.55)");
  const blurBorder  = (e: React.FocusEvent<HTMLElement>) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.11)");

  const SuccessMark = () => (
    <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "rgba(52,160,140,0.12)", border: "1px solid rgba(52,160,140,0.28)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem" }}>
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M3.5 9.5L7 13l7.5-8" stroke="rgba(52,160,140,0.90)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );

  return (
    <>
      <section id="tu-van" className="py-20 sm:py-28" style={{ background: DARK_BG_A }}>
        <div className="max-w-3xl mx-auto px-5 sm:px-8 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={VP} variants={stagger}>

            <motion.div variants={fadeUp} style={{ marginBottom: "1.5rem", display: "flex", justifyContent: "center" }}>
              <SectionLabel dark>Bước tiếp theo</SectionLabel>
            </motion.div>

            <motion.h2 variants={fadeUp} style={{ fontSize: "clamp(1.65rem, 4vw, 2.25rem)", fontWeight: 700, lineHeight: 1.2, letterSpacing: "-0.020em", color: "rgba(255,255,255,0.94)", marginBottom: "1.125rem" }}>
              Bắt đầu với quyền truy cập đúng,<br />không phải thông tin rời rạc
            </motion.h2>

            <motion.p variants={fadeUp} style={{ fontSize: "14px", lineHeight: 1.88, fontWeight: 300, color: "rgba(255,255,255,0.50)", maxWidth: "34rem", margin: "0 auto 2.25rem" }}>
              SWC Pass được thiết kế cho người muốn bước vào hệ sinh thái SWC một cách rõ hơn và có cấu trúc hơn. Nếu anh/chị muốn trao đổi trước khi quyết định, để lại thông tin và chúng tôi sẽ liên hệ.
            </motion.p>

            <motion.div variants={fadeUp} style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", justifyContent: "center", marginBottom: "2.5rem" }}>
              <a href="#goi-swc-pass" style={BTN_PRIMARY}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 24px rgba(26,120,104,0.38)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 18px rgba(26,120,104,0.30)"; }}>
                Xem các gói
              </a>
              <button style={BTN_GHOST} onClick={onOpen}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(52,160,140,0.60)"; (e.currentTarget as HTMLElement).style.color = "rgba(52,160,140,1)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(52,160,140,0.35)"; (e.currentTarget as HTMLElement).style.color = "rgba(52,160,140,0.85)"; }}>
                Tư vấn và hỏi thêm
              </button>
            </motion.div>

            <motion.p variants={fadeUp} style={{ fontSize: "13px", fontStyle: "italic", fontWeight: 300, color: "rgba(255,255,255,0.28)", lineHeight: 1.7 }}>
              Không có áp lực. Quyết định tốt là quyết định dựa trên hiểu biết đầy đủ.
            </motion.p>

          </motion.div>
        </div>
      </section>

      {/* Consultation Modal */}
      {showModal && (
        <div style={overlay} onClick={handleClose}>
          <div style={panel} onClick={e => e.stopPropagation()}>
            <button style={closeBtn} onClick={handleClose} aria-label="Đóng">×</button>

            {sent ? (
              <div style={{ textAlign: "center", padding: "2rem 0.5rem" }}>
                <SuccessMark />
                <p style={{ fontSize: "16px", fontWeight: 600, color: "rgba(255,255,255,0.90)", marginBottom: "0.75rem" }}>Đã nhận thông tin</p>
                <p style={{ fontSize: "13.5px", fontWeight: 300, lineHeight: 1.82, color: "rgba(255,255,255,0.46)", maxWidth: "26rem", margin: "0 auto 1.75rem" }}>
                  Cảm ơn anh/chị đã dành thời gian. Chúng tôi sẽ liên hệ trong thời gian sớm nhất để trao đổi về SWC Pass phù hợp.
                </p>
                <button style={{ ...BTN_GHOST, width: "100%" }} onClick={handleClose}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(52,160,140,0.60)"; (e.currentTarget as HTMLElement).style.color = "rgba(52,160,140,1)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(52,160,140,0.35)"; (e.currentTarget as HTMLElement).style.color = "rgba(52,160,140,0.85)"; }}>
                  Đóng
                </button>
              </div>
            ) : (
              <>
                <p style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(52,160,140,0.68)", marginBottom: "0.5rem" }}>SWC Pass · Tư vấn</p>
                <h3 style={{ fontSize: "18px", fontWeight: 700, color: "rgba(255,255,255,0.92)", marginBottom: "0.625rem", lineHeight: 1.25 }}>
                  Để lại thông tin để trao đổi thêm
                </h3>
                <p style={{ fontSize: "13px", fontWeight: 300, lineHeight: 1.72, color: "rgba(255,255,255,0.40)", marginBottom: "1.5rem" }}>
                  Không có áp lực. Anh/chị cứ để lại câu hỏi hoặc mối quan tâm, chúng tôi sẽ liên hệ phù hợp.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
                  <div>
                    <label style={fieldLabel}>Họ và tên</label>
                    <input type="text" placeholder="Nguyễn Văn A" style={fieldBase} value={name} onChange={e => setName(e.target.value)} onFocus={focusBorder} onBlur={blurBorder} />
                  </div>
                  <div>
                    <label style={fieldLabel}>Email</label>
                    <input type="email" placeholder="email@example.com" style={fieldBase} value={email} onChange={e => setEmail(e.target.value)} onFocus={focusBorder} onBlur={blurBorder} />
                  </div>
                  <div>
                    <label style={fieldLabel}>Số điện thoại / Zalo <span style={{ opacity: 0.5, fontWeight: 300, fontSize: "9px" }}>(không bắt buộc)</span></label>
                    <input type="tel" placeholder="09xx xxx xxx" style={fieldBase} value={phone} onChange={e => setPhone(e.target.value)} onFocus={focusBorder} onBlur={blurBorder} />
                  </div>
                  <div>
                    <label style={fieldLabel}>Gói quan tâm</label>
                    <select style={fieldSelect} value={plan} onChange={e => setPlan(e.target.value)} onFocus={focusBorder} onBlur={blurBorder}>
                      <option value="">Chưa chắc / Muốn hỏi thêm</option>
                      <option value="Essential ($240 / 1 năm + 90 ngày)">Essential ($240 / 1 năm + 90 ngày)</option>
                      <option value="Plus ($600 / 5 năm)">Plus ($600 / 5 năm)</option>
                      <option value="Ultimate ($2,600 / Trọn đời)">Ultimate ($2,600 / Trọn đời)</option>
                    </select>
                  </div>
                  <div>
                    <label style={fieldLabel}>Câu hỏi hoặc ghi chú <span style={{ opacity: 0.5, fontWeight: 300, fontSize: "9px" }}>(không bắt buộc)</span></label>
                    <textarea placeholder="Anh/chị muốn hỏi hoặc chia sẻ thêm điều gì..." style={fieldTextarea} value={note} onChange={e => setNote(e.target.value)} onFocus={focusBorder} onBlur={blurBorder} />
                  </div>
                  <button style={{ ...submitBtn, opacity: loading ? 0.7 : 1 }} onClick={handleSubmit} disabled={loading || !name.trim() || !email.trim()}
                    onMouseEnter={e => { if (!loading) { (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 24px rgba(26,120,104,0.42)"; } }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 18px rgba(26,120,104,0.30)"; }}>
                    {loading ? "Đang gửi..." : "Gửi thông tin"}
                  </button>
                  <p style={{ fontSize: "11.5px", fontWeight: 300, color: "rgba(255,255,255,0.26)", textAlign: "center", lineHeight: 1.65 }}>
                    Thông tin của anh/chị được bảo mật và chỉ dùng để trao đổi về SWC Pass.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

/* ══════════════════════════════════════════════════════════
   PAGE EXPORT
══════════════════════════════════════════════════════════ */
export default function ProductSWCPass() {
  useSEO();
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Hero onConsult={() => setShowModal(true)} />
      <WhatIsSection />
      <ProblemSection />
      <InsideSection />
      <AudienceSection />
      <PricingSection onConsult={() => setShowModal(true)} />
      <FoundationalSection />
      <MentorSection onConsult={() => setShowModal(true)} />
      <FAQSection />
      <FinalCTASection showModal={showModal} onOpen={() => setShowModal(true)} onClose={() => setShowModal(false)} />
    </>
  );
}
