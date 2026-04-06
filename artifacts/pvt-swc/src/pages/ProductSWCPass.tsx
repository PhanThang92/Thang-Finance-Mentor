import { useSeoMeta } from "@/hooks/useSeoMeta";
import React, { useEffect, useRef, useState } from "react";
import { leadsApi } from "@/lib/newsApi";
import { motion, AnimatePresence } from "framer-motion";

/* ── Animation presets ───────────────────────────────────── */
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.10 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.64, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};
const VP = { once: true, margin: "-48px" };

/* ── Design tokens ───────────────────────────────────────── */
const CARD_LIGHT: React.CSSProperties = {
  borderRadius: "0.75rem",
  border: "1px solid hsl(var(--border) / 0.88)",
  boxShadow: "0 1px 6px rgba(10,40,35,0.05)",
  padding: "1.875rem 1.75rem",
  transition: "border-color 0.26s ease, transform 0.26s ease, box-shadow 0.26s ease",
};
const CARD_DARK: React.CSSProperties = {
  borderRadius: "0.75rem",
  border: "1px solid rgba(52,160,140,0.14)",
  background: "rgba(52,160,140,0.035)",
  padding: "1.875rem 1.75rem",
  transition: "border-color 0.26s ease",
};
const DARK_BG_A = "linear-gradient(160deg, #0d2622 0%, #091e1b 55%, #071815 100%)";
const DARK_BG_B = "linear-gradient(180deg, #091e1b 0%, #060f0d 100%)";
const DARK_BG_C = "linear-gradient(165deg, #0c2420 0%, #091c18 100%)";

function hoverLift(e: React.MouseEvent) {
  const el = e.currentTarget as HTMLElement;
  el.style.borderColor = "hsl(var(--primary) / 0.26)";
  el.style.transform = "translateY(-2px)";
  el.style.boxShadow = "0 4px 16px rgba(10,40,35,0.10)";
}
function hoverReset(e: React.MouseEvent) {
  const el = e.currentTarget as HTMLElement;
  el.style.borderColor = "hsl(var(--border) / 0.88)";
  el.style.transform = "translateY(0)";
  el.style.boxShadow = "0 1px 6px rgba(10,40,35,0.05)";
}
function hoverLiftDark(e: React.MouseEvent) {
  (e.currentTarget as HTMLElement).style.borderColor = "rgba(52,160,140,0.32)";
}
function hoverResetDark(e: React.MouseEvent) {
  (e.currentTarget as HTMLElement).style.borderColor = "rgba(52,160,140,0.14)";
}

/* ── Shared editorial primitives ─────────────────────────── */
function SectionLabel({ children, dark = false }: { children: string; dark?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
      <div style={{ height: "1px", width: "1.75rem", flexShrink: 0, background: dark ? "rgba(52,160,140,0.50)" : "hsl(var(--primary) / 0.45)" }} />
      <span style={{ fontSize: "10.5px", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: dark ? "rgba(52,160,140,0.75)" : "hsl(var(--primary))" }}>
        {children}
      </span>
    </div>
  );
}

function SectionHeading({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <h2 style={{ fontSize: "clamp(1.6rem, 3.6vw, 2.2rem)", fontWeight: 700, lineHeight: 1.22, letterSpacing: "-0.018em", color: dark ? "rgba(255,255,255,0.94)" : "hsl(var(--foreground))" }}>
      {children}
    </h2>
  );
}

function AnchorLine({ children, dark = false, style }: { children: string; dark?: boolean; style?: React.CSSProperties }) {
  return (
    <p style={{ fontSize: "14px", fontWeight: 400, fontStyle: "italic", letterSpacing: "0.004em", lineHeight: 1.65, color: dark ? "rgba(52,160,140,0.78)" : "hsl(var(--primary) / 0.80)", ...style }}>
      {children}
    </p>
  );
}

function NumMarker({ num, dark = false }: { num: string; dark?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "1rem" }}>
      <span style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.10em", color: dark ? "rgba(52,160,140,0.75)" : "hsl(var(--primary) / 0.75)" }}>{num}</span>
      <div style={{ width: "1.5rem", height: "1px", background: dark ? "rgba(52,160,140,0.30)" : "hsl(var(--primary) / 0.30)" }} />
    </div>
  );
}

/* ── Button styles ───────────────────────────────────────── */
const BTN_PRIMARY: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  height: "44px", padding: "0 28px", borderRadius: "999px",
  fontSize: "14px", fontWeight: 500, letterSpacing: "0.01em",
  textDecoration: "none", background: "linear-gradient(140deg, #22917f, #1a7868)",
  color: "#fff", boxShadow: "0 4px 18px rgba(26,120,104,0.28)",
  transition: "transform 0.22s ease, box-shadow 0.22s ease", border: "none", cursor: "pointer",
};
const BTN_GHOST: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  height: "44px", padding: "0 24px", borderRadius: "999px",
  fontSize: "14px", fontWeight: 400, letterSpacing: "0.01em",
  background: "transparent", cursor: "pointer",
  border: "1px solid rgba(52,160,140,0.32)", color: "rgba(52,160,140,0.82)",
  transition: "border-color 0.22s ease, color 0.22s ease",
};
const BTN_SECONDARY_DARK: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  height: "44px", padding: "0 24px", borderRadius: "999px",
  fontSize: "14px", fontWeight: 400, letterSpacing: "0.01em",
  textDecoration: "none", background: "rgba(255,255,255,0.065)",
  border: "1px solid rgba(255,255,255,0.16)", color: "rgba(255,255,255,0.86)",
  backdropFilter: "blur(8px)", transition: "background 0.22s ease", cursor: "pointer",
};

/* ── SEO ─────────────────────────────────────────────────── */
function useSEO() {
  useEffect(() => {
    const prev = document.title;
    document.title = "SWC Pass | Quyền truy cập có cấu trúc vào hệ sinh thái SWC | Phan Văn Thắng SWC";
    let metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.name = "description";
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = "SWC Pass là lớp truy cập nền tảng vào hệ sinh thái SWC — bao gồm SWC Field, tài liệu có hệ thống và các lớp giá trị mở rộng. Dành cho người muốn tiếp cận tài chính cá nhân một cách có cấu trúc và có ý thức.";
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
        <div style={{ position: "absolute", top: "8%", right: "-4%", width: "38rem", height: "38rem", borderRadius: "50%", background: "radial-gradient(circle, rgba(36,110,95,0.16) 0%, transparent 68%)", filter: "blur(80px)" }} />
        <div style={{ position: "absolute", bottom: "-10%", left: "-6%", width: "28rem", height: "28rem", borderRadius: "50%", background: "radial-gradient(circle, rgba(26,80,72,0.12) 0%, transparent 70%)", filter: "blur(60px)" }} />
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(90deg, transparent, rgba(52,160,140,0.12) 50%, transparent)" }} />
      </div>

      <div className="max-w-4xl mx-auto px-5 sm:px-8 relative z-10 pt-32 pb-24">
        <motion.div initial="hidden" animate="visible" variants={stagger}>

          <motion.div variants={fadeUp} style={{ marginBottom: "1.75rem" }}>
            <SectionLabel dark>SWC Pass · Hệ sinh thái SWC</SectionLabel>
          </motion.div>

          {/* Main headline */}
          <motion.h1 variants={fadeUp} style={{ fontSize: "clamp(2.6rem, 6.5vw, 4.2rem)", fontWeight: 800, lineHeight: 1.06, letterSpacing: "-0.032em", color: "rgba(255,255,255,0.96)", marginBottom: "1.25rem" }}>
            SWC Pass
          </motion.h1>

          {/* Sub-headline — one clear positioning sentence */}
          <motion.p variants={fadeUp} style={{ fontSize: "clamp(1.05rem, 2.4vw, 1.2rem)", lineHeight: 1.58, fontWeight: 400, color: "rgba(255,255,255,0.72)", maxWidth: "34rem", marginBottom: "1rem" }}>
            Cổng truy cập có cấu trúc vào hệ sinh thái SWC — không phải một khóa học, mà là một điểm khởi đầu cho một hệ thống.
          </motion.p>

          {/* Italic positioning line */}
          <motion.div variants={fadeUp} style={{ display: "flex", alignItems: "flex-start", gap: "0.875rem", marginBottom: "2rem" }}>
            <div style={{ marginTop: "0.42rem", width: "2rem", height: "1.5px", background: "rgba(52,160,140,0.55)", borderRadius: "999px", flexShrink: 0 }} />
            <p style={{ fontSize: "clamp(13.5px, 1.8vw, 15px)", fontStyle: "italic", fontWeight: 400, color: "rgba(52,160,140,0.88)", letterSpacing: "0.003em", lineHeight: 1.62, margin: 0 }}>
              Truy cập SWC Field, tài liệu có hệ thống và cộng đồng dài hạn — theo mức độ phù hợp với từng giai đoạn.
            </p>
          </motion.div>

          {/* Feature tags */}
          <motion.div variants={fadeUp} style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "2.25rem" }}>
            {["SWC Field", "Tài liệu có hệ thống", "Cộng đồng", "Hỗ trợ dài hạn"].map((tag) => (
              <span key={tag} style={{
                display: "inline-flex", alignItems: "center",
                height: "26px", padding: "0 11px", borderRadius: "999px",
                border: "1px solid rgba(52,160,140,0.16)",
                background: "rgba(52,160,140,0.06)",
                fontSize: "11px", fontWeight: 400,
                letterSpacing: "0.015em",
                color: "rgba(255,255,255,0.46)",
              }}>
                {tag}
              </span>
            ))}
          </motion.div>

          {/* CTAs */}
          <motion.div variants={fadeUp} style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
            <a href="#goi-swc-pass" style={BTN_PRIMARY}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 24px rgba(26,120,104,0.38)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 18px rgba(26,120,104,0.28)"; }}>
              Xem các gói
            </a>
            <button style={BTN_SECONDARY_DARK} onClick={onConsult}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.11)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.065)"; }}>
              Hỏi trước khi quyết định
            </button>
          </motion.div>

        </motion.div>
      </div>

      {/* Scroll hint */}
      <div style={{ position: "absolute", bottom: "2rem", left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.375rem" }}>
        <div style={{ width: "1px", height: "2.5rem", background: "linear-gradient(to bottom, transparent, rgba(52,160,140,0.28))", borderRadius: "999px" }} />
      </div>

      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(90deg, transparent, rgba(52,160,140,0.08) 50%, transparent)" }} />
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   B. WHAT IS SWC PASS (light)
══════════════════════════════════════════════════════════ */
const whatCards = [
  {
    icon: (
      <svg width="19" height="19" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="1.4" />
        <path d="M7 10l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Cổng vào SWC Field",
    body: "SWC Pass cấp quyền truy cập vào SWC Field — nền tảng nội dung, phân tích và tài liệu cốt lõi được tổ chức theo hệ thống của hệ sinh thái SWC.",
  },
  {
    icon: (
      <svg width="19" height="19" viewBox="0 0 20 20" fill="none">
        <rect x="3" y="4" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.4" />
        <path d="M7 8h6M7 11h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
    title: "Tài liệu tổ chức theo giai đoạn",
    body: "Không phải thông tin rải rác từ nhiều nguồn. Là tài liệu được xây dựng theo hệ thống, phù hợp với từng giai đoạn tiếp cận tài chính cá nhân.",
  },
  {
    icon: (
      <svg width="19" height="19" viewBox="0 0 20 20" fill="none">
        <path d="M4 10h12M13 7l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Lớp giá trị mở rộng theo gói",
    body: "Gói cao hơn bổ sung thêm Road to a Million, phân tích chuyên sâu và quyền truy cập vào các sản phẩm trong hệ sinh thái — theo từng mức độ cam kết.",
  },
  {
    icon: (
      <svg width="19" height="19" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.4" />
        <path d="M10 3v2M10 15v2M3 10h2M15 10h2M5.22 5.22l1.42 1.42M13.36 13.36l1.42 1.42M5.22 14.78l1.42-1.42M13.36 6.64l1.42-1.42" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
    title: "Điểm khởi đầu cho một hành trình",
    body: "SWC Pass không đứng độc lập. Đây là điểm đầu tiên của một hệ sinh thái được xây dựng dần theo thời gian — cộng đồng, công cụ và định hướng phát triển.",
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
              <AnchorLine>SWC Pass là lớp nền tảng — cổng vào một hệ sinh thái, không phải một khóa học đơn lẻ hay một tập tài liệu đóng gói sẵn.</AnchorLine>
            </motion.div>
          </div>

          <motion.div variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {whatCards.map(({ icon, title, body }, i) => (
              <motion.div key={i} variants={fadeUp} style={{ ...CARD_LIGHT, display: "flex", gap: "1.125rem", alignItems: "flex-start" }} onMouseEnter={hoverLift} onMouseLeave={hoverReset}>
                <div style={{
                  flexShrink: 0, width: "40px", height: "40px", borderRadius: "9px",
                  background: "hsl(var(--primary) / 0.07)", border: "1px solid hsl(var(--primary) / 0.14)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "hsl(var(--primary))", marginTop: "1px",
                }}>
                  {icon}
                </div>
                <div>
                  <h3 style={{ fontSize: "14.5px", fontWeight: 600, lineHeight: 1.3, letterSpacing: "-0.008em", color: "hsl(var(--foreground))", marginBottom: "0.5rem" }}>{title}</h3>
                  <p style={{ fontSize: "13.5px", lineHeight: 1.88, color: "hsl(var(--foreground) / 0.48)", fontWeight: 400 }}>{body}</p>
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
    from: "Thông tin phân mảnh, khó biết bắt đầu từ đâu",
    to: "Một điểm truy cập có cấu trúc, dễ định hướng",
    body: "SWC Field tập hợp tài liệu và phân tích theo hệ thống rõ ràng — thay vì thu thập từ nhiều nguồn rời rạc và phải tự sắp xếp lại.",
  },
  {
    from: "Phản ứng với thị trường theo cảm tính",
    to: "Góc nhìn dài hạn với khuôn khổ tư duy rõ ràng",
    body: "Có công cụ và tài liệu phù hợp giúp người dùng tư duy bình tĩnh hơn — thay vì bị kéo đi bởi biến động ngắn hạn hoặc thông tin thiếu bối cảnh.",
  },
  {
    from: "Theo dõi bên ngoài, không có bước tiếp theo",
    to: "Tham gia chủ động vào hệ sinh thái theo cách riêng",
    body: "SWC Pass tạo ra điểm khởi đầu rõ ràng — từ người quan sát bên ngoài đến người có quyền truy cập thực sự vào hệ sinh thái và tài liệu bên trong.",
  },
];

function ProblemSection() {
  return (
    <section className="py-20 sm:py-28" style={{ background: DARK_BG_C }}>
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={VP} variants={stagger} className="space-y-12">
          <div className="space-y-4 max-w-2xl">
            <motion.div variants={fadeUp}><SectionLabel dark>SWC Pass giúp giải quyết điều gì</SectionLabel></motion.div>
            <motion.div variants={fadeUp}><SectionHeading dark>Từ thụ động sang có hệ thống</SectionHeading></motion.div>
            <motion.div variants={fadeUp}>
              <AnchorLine dark>Nhiều người không thiếu thông tin — họ thiếu một cách tiếp cận có cấu trúc để tổng hợp và sử dụng thông tin đó.</AnchorLine>
            </motion.div>
          </div>

          <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {problemCards.map(({ from, to, body }, i) => (
              <motion.div key={i} variants={fadeUp} style={CARD_DARK} onMouseEnter={hoverLiftDark} onMouseLeave={hoverResetDark}>
                <div style={{ marginBottom: "1.125rem" }}>
                  <p style={{ fontSize: "10.5px", fontWeight: 600, letterSpacing: "0.13em", textTransform: "uppercase", color: "rgba(255,255,255,0.26)", marginBottom: "0.5rem" }}>Trước</p>
                  <p style={{ fontSize: "13.5px", fontWeight: 400, color: "rgba(255,255,255,0.48)", lineHeight: 1.52 }}>{from}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.125rem" }}>
                  <div style={{ flex: 1, height: "1px", background: "rgba(52,160,140,0.20)" }} />
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" style={{ color: "rgba(52,160,140,0.55)", flexShrink: 0 }}>
                    <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div style={{ flex: 1, height: "1px", background: "rgba(52,160,140,0.20)" }} />
                </div>
                <div style={{ marginBottom: "1rem" }}>
                  <p style={{ fontSize: "10.5px", fontWeight: 600, letterSpacing: "0.13em", textTransform: "uppercase", color: "rgba(52,160,140,0.68)", marginBottom: "0.5rem" }}>Sau</p>
                  <p style={{ fontSize: "14px", fontWeight: 600, color: "rgba(255,255,255,0.88)", lineHeight: 1.38, letterSpacing: "-0.008em" }}>{to}</p>
                </div>
                <p style={{ fontSize: "13px", lineHeight: 1.88, color: "rgba(255,255,255,0.40)", fontWeight: 300 }}>{body}</p>
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
    body: "Nền tảng nội dung cốt lõi của hệ sinh thái. Bao gồm tài liệu, phân tích và góc nhìn được tổ chức theo hệ thống — thay vì rải rác qua nhiều nguồn.",
    note: null,
  },
  {
    num: "02",
    title: "Road to a Million",
    body: "Một khuôn khổ tiếp cận tài chính dài hạn và có ý thức — không phải lời cam kết kết quả. Được thiết kế để giúp người dùng xây dựng lộ trình tài chính của riêng mình theo hướng bài bản.",
    note: "Có trong gói Ultimate.",
  },
  {
    num: "03",
    title: "Phân tích và góc nhìn chuyên sâu",
    body: "Các phân tích và góc nhìn từ hệ sinh thái SWC — bổ sung tham chiếu cho quá trình ra quyết định, không thay thế tư vấn tài chính cá nhân độc lập.",
    note: null,
  },
  {
    num: "04",
    title: "Hệ sinh thái mở rộng",
    body: "Sản phẩm và ứng dụng trong hệ sinh thái SWC — tùy theo gói và theo từng giai đoạn phát triển. SWC Pass là nền tảng kết nối vào những lớp giá trị đang được xây dựng.",
    note: "Áp dụng theo gói và giai đoạn.",
  },
];

function InsideSection() {
  return (
    <section className="py-20 sm:py-28" style={{ background: "hsl(var(--card))" }}>
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={VP} variants={stagger} className="space-y-12">
          <div className="space-y-4 max-w-2xl">
            <motion.div variants={fadeUp}><SectionLabel>Bên trong SWC Pass có gì</SectionLabel></motion.div>
            <motion.div variants={fadeUp}><SectionHeading>Bốn lớp giá trị của hệ sinh thái</SectionHeading></motion.div>
            <motion.div variants={fadeUp}>
              <AnchorLine>Mỗi lớp phục vụ một mục đích riêng — và phạm vi truy cập mở rộng theo từng hạng gói.</AnchorLine>
            </motion.div>
          </div>

          <motion.div variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {insideItems.map(({ num, title, body, note }) => (
              <motion.div key={num} variants={fadeUp} className="bg-background" style={CARD_LIGHT} onMouseEnter={hoverLift} onMouseLeave={hoverReset}>
                <NumMarker num={num} />
                <h3 style={{ fontSize: "15.5px", fontWeight: 700, lineHeight: 1.28, letterSpacing: "-0.012em", color: "hsl(var(--foreground))", marginBottom: "0.625rem" }}>{title}</h3>
                <p style={{ fontSize: "13.5px", lineHeight: 1.88, color: "hsl(var(--foreground) / 0.50)", fontWeight: 400 }}>{body}</p>
                {note && (
                  <div style={{ marginTop: "0.875rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <div style={{ width: "3px", height: "3px", borderRadius: "50%", background: "hsl(var(--primary) / 0.50)", flexShrink: 0 }} />
                    <span style={{ fontSize: "12px", fontWeight: 500, color: "hsl(var(--primary) / 0.72)", fontStyle: "italic" }}>{note}</span>
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
    title: "Người muốn có điểm khởi đầu rõ hơn",
    body: "Anh/chị đã theo dõi thông tin về tài chính cá nhân hoặc hệ sinh thái SWC, nhưng chưa có điểm vào rõ ràng. SWC Pass tạo ra cấu trúc đó — có hệ thống, không rối.",
  },
  {
    num: "02",
    title: "Người đã tin vào cách tiếp cận dài hạn",
    body: "Anh/chị hiểu rằng tài chính cá nhân cần tư duy hệ thống, không phải phản ứng ngắn hạn. SWC Pass phù hợp với người muốn đi theo hướng đó một cách có ý thức.",
  },
  {
    num: "03",
    title: "Người muốn tham gia sâu hơn vào hệ sinh thái",
    body: "Anh/chị muốn tiếp cận toàn bộ hệ sinh thái, hoặc tìm hiểu về hướng đồng hành dài hạn. Gói Ultimate được thiết kế cho nhóm này.",
  },
];
const notFor = [
  "tín hiệu đầu tư ngắn hạn",
  "cam kết lợi nhuận hay kết quả cụ thể",
  "nội dung miễn phí không cam kết",
  "thay thế cho tư vấn tài chính cá nhân độc lập",
];

function AudienceSection() {
  return (
    <section className="py-20 sm:py-28" style={{ background: "hsl(var(--background))" }}>
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={VP} variants={stagger} className="space-y-12">
          <div className="space-y-4 max-w-2xl">
            <motion.div variants={fadeUp}><SectionLabel>SWC Pass phù hợp với ai</SectionLabel></motion.div>
            <motion.div variants={fadeUp}><SectionHeading>Ba nhóm thường thấy giá trị nhất</SectionHeading></motion.div>
            <motion.div variants={fadeUp}>
              <AnchorLine>SWC Pass không dành cho tất cả mọi người — và điều đó là cố ý, không phải hạn chế.</AnchorLine>
            </motion.div>
          </div>

          <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {audienceCards.map(({ num, title, body }) => (
              <motion.div key={num} variants={fadeUp} className="bg-card flex flex-col" style={{ ...CARD_LIGHT, padding: "2rem 1.875rem" }} onMouseEnter={hoverLift} onMouseLeave={hoverReset}>
                <NumMarker num={num} />
                <h3 style={{ fontSize: "14.5px", fontWeight: 600, lineHeight: 1.32, letterSpacing: "-0.008em", color: "hsl(var(--foreground))", marginBottom: "0.625rem" }}>{title}</h3>
                <p style={{ fontSize: "13.5px", lineHeight: 1.88, color: "hsl(var(--foreground) / 0.50)", fontWeight: 400 }}>{body}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Not for block */}
          <motion.div variants={fadeUp} style={{ borderRadius: "0.75rem", border: "1px solid hsl(var(--border) / 0.55)", padding: "1.5rem 1.875rem", background: "hsl(var(--card))" }}>
            <p style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.10em", color: "hsl(var(--foreground) / 0.38)", marginBottom: "0.75rem", textTransform: "uppercase" }}>
              Chưa phù hợp nếu anh/chị đang tìm
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem 2.5rem" }}>
              {notFor.map((item) => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <div style={{ width: "3px", height: "3px", borderRadius: "50%", background: "hsl(var(--foreground) / 0.24)", flexShrink: 0 }} />
                  <span style={{ fontSize: "13.5px", color: "hsl(var(--foreground) / 0.46)", fontWeight: 400 }}>{item}</span>
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
    tag: null,
    highlight: false,
    features: [
      "Truy cập SWC Field",
      "Tài liệu và phân tích cơ bản",
      "Cộng đồng SWC",
      "Cập nhật nội dung trong thời hạn",
    ],
    note: "Phù hợp cho người muốn bắt đầu và trải nghiệm trong 1 năm trước khi quyết định thêm.",
    ctaLabel: "Tìm hiểu Essential",
    planKey: "Essential ($240 / 1 năm + 90 ngày)",
  },
  {
    name: "Plus",
    price: "$600",
    duration: "5 năm",
    tag: "Phổ biến",
    highlight: true,
    features: [
      "Toàn bộ giá trị Essential",
      "Thời hạn 5 năm — cam kết dài hạn",
      "Truy cập SWC Field đầy đủ",
      "Ưu tiên tiếp cận nội dung mới",
    ],
    note: "Phù hợp cho người đã hiểu giá trị của hệ thống và muốn đồng hành lâu dài với chi phí tối ưu hơn.",
    ctaLabel: "Tìm hiểu Plus",
    planKey: "Plus ($600 / 5 năm)",
  },
  {
    name: "Ultimate",
    price: "$2,600",
    duration: "Trọn đời",
    tag: null,
    highlight: false,
    features: [
      "Truy cập SWC Field không giới hạn",
      "Road to a Million — khuôn khổ tài chính dài hạn",
      "Sản phẩm & ứng dụng hệ sinh thái (khi áp dụng)",
      "Ưu tiên tư vấn và hỗ trợ",
      "Hướng đồng hành và đối tác trong hệ sinh thái",
    ],
    note: "Phù hợp cho người muốn truy cập toàn diện hoặc tìm hiểu về hướng tham gia sâu hơn vào hệ sinh thái.",
    ctaLabel: "Tìm hiểu Ultimate",
    planKey: "Ultimate ($2,600 / Trọn đời)",
  },
];

function PricingSection({ onConsult }: { onConsult: (plan?: string) => void }) {
  return (
    <section id="goi-swc-pass" className="py-20 sm:py-28" style={{ background: DARK_BG_B }}>
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={VP} variants={stagger} className="space-y-12">
          <div className="space-y-4 max-w-2xl">
            <motion.div variants={fadeUp}><SectionLabel dark>Các hạng gói SWC Pass</SectionLabel></motion.div>
            <motion.div variants={fadeUp}><SectionHeading dark>Chọn mức truy cập phù hợp</SectionHeading></motion.div>
            <motion.div variants={fadeUp}>
              <AnchorLine dark>Không cần vội, không cần mua nhiều hơn nhu cầu thật. Mỗi gói phục vụ một giai đoạn khác nhau.</AnchorLine>
            </motion.div>
          </div>

          <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map(({ name, price, duration, tag, highlight, features, note, ctaLabel, planKey }) => (
              <motion.div key={name} variants={fadeUp} style={{
                borderRadius: "0.875rem",
                border: highlight ? "1px solid rgba(52,160,140,0.42)" : "1px solid rgba(52,160,140,0.13)",
                background: highlight ? "rgba(52,160,140,0.07)" : "rgba(255,255,255,0.022)",
                padding: "2rem 1.75rem",
                display: "flex", flexDirection: "column",
                position: "relative",
                transition: "border-color 0.25s ease",
              }} onMouseEnter={hoverLiftDark} onMouseLeave={hoverResetDark}>

                {tag && (
                  <div style={{
                    position: "absolute", top: "-1px", left: "50%", transform: "translateX(-50%)",
                    background: "linear-gradient(135deg, #22917f, #1a7868)",
                    borderRadius: "0 0 8px 8px", padding: "3px 14px",
                    fontSize: "9.5px", fontWeight: 700, letterSpacing: "0.14em",
                    textTransform: "uppercase", color: "#fff",
                  }}>
                    {tag}
                  </div>
                )}

                {/* Price block */}
                <div style={{ marginBottom: "0.5rem" }}>
                  <p style={{ fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(52,160,140,0.70)", marginBottom: "0.5rem" }}>{name}</p>
                  <p style={{ fontSize: "clamp(2rem, 5vw, 2.5rem)", fontWeight: 800, color: "rgba(255,255,255,0.96)", letterSpacing: "-0.030em", lineHeight: 1 }}>{price}</p>
                  <p style={{ fontSize: "12.5px", color: "rgba(255,255,255,0.38)", marginTop: "0.3rem", fontWeight: 300 }}>{duration}</p>
                </div>

                <div style={{ width: "100%", height: "1px", background: "rgba(52,160,140,0.13)", margin: "1.25rem 0" }} />

                {/* Feature list */}
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 1.375rem", display: "flex", flexDirection: "column", gap: "0.65rem", flex: 1 }}>
                  {features.map((f) => (
                    <li key={f} style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start" }}>
                      <svg width="13" height="13" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: "3px", color: "rgba(52,160,140,0.72)" }}>
                        <path d="M2.5 7.5l3 2.5 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span style={{ fontSize: "13px", lineHeight: 1.6, color: "rgba(255,255,255,0.68)", fontWeight: 300 }}>{f}</span>
                    </li>
                  ))}
                </ul>

                <p style={{ fontSize: "11.5px", lineHeight: 1.72, color: "rgba(255,255,255,0.28)", fontStyle: "italic", marginBottom: "1.25rem" }}>{note}</p>

                <button style={BTN_GHOST} onClick={() => onConsult(planKey)}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(52,160,140,0.56)"; (e.currentTarget as HTMLElement).style.color = "rgba(52,160,140,1)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(52,160,140,0.32)"; (e.currentTarget as HTMLElement).style.color = "rgba(52,160,140,0.82)"; }}>
                  {ctaLabel}
                </button>
              </motion.div>
            ))}
          </motion.div>

          {/* Pricing disclaimer */}
          <motion.div variants={fadeUp} style={{ borderRadius: "0.625rem", border: "1px solid rgba(255,255,255,0.06)", padding: "1.125rem 1.5rem", background: "rgba(255,255,255,0.02)" }}>
            <p style={{ fontSize: "12px", lineHeight: 1.75, color: "rgba(255,255,255,0.28)", fontWeight: 300, fontStyle: "italic", margin: 0 }}>
              Ghi chú: Quyền lợi và phạm vi các gói có thể được cập nhật theo thông báo chính thức từ hệ sinh thái SWC. Thông tin trên mang tính tổng quan — liên hệ để xác nhận chi tiết mới nhất trước khi quyết định.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   G. WHY FOUNDATIONAL — rewritten with distinct positioning
══════════════════════════════════════════════════════════ */
const differenceCards = [
  {
    title: "Hệ thống, không phải nội dung rời",
    body: "SWC Pass không phải là một gói tài liệu đóng gói sẵn. Giá trị của nó nằm ở cách tổ chức — tài liệu, phân tích và cộng đồng được kết nối có hệ thống và cập nhật theo thời gian.",
  },
  {
    title: "Truy cập dài hạn, không phải học một lần",
    body: "Khác với khóa học thông thường, SWC Pass là quyền truy cập liên tục — người dùng được tiếp cận nội dung mới và hệ sinh thái phát triển theo từng giai đoạn, không chỉ một tập nội dung cố định.",
  },
  {
    title: "Nền tảng cho các lớp giá trị tiếp theo",
    body: "SWC Pass mở cánh cửa vào toàn bộ hệ sinh thái SWC — từ phân tích chuyên sâu đến định hướng đối tác — theo từng mức độ và thời điểm phù hợp với từng người.",
  },
];

function FoundationalSection() {
  return (
    <section className="py-20 sm:py-28" style={{ background: "hsl(var(--background))" }}>
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={VP} variants={stagger} className="space-y-12">
          <div className="space-y-4 max-w-2xl">
            <motion.div variants={fadeUp}><SectionLabel>Điều làm SWC Pass khác biệt</SectionLabel></motion.div>
            <motion.div variants={fadeUp}><SectionHeading>Không phải sản phẩm nội dung thông thường</SectionHeading></motion.div>
            <motion.div variants={fadeUp}>
              <AnchorLine>SWC Pass là lớp kết nối người dùng với hệ sinh thái — không chỉ với một tập nội dung tại một thời điểm.</AnchorLine>
            </motion.div>
          </div>

          <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {differenceCards.map(({ title, body }, i) => (
              <motion.div key={i} variants={fadeUp} style={{ ...CARD_LIGHT, borderTop: "2px solid hsl(var(--primary) / 0.18)" }} onMouseEnter={hoverLift} onMouseLeave={hoverReset}>
                <h3 style={{ fontSize: "15px", fontWeight: 700, lineHeight: 1.3, letterSpacing: "-0.010em", color: "hsl(var(--foreground))", marginBottom: "0.75rem" }}>{title}</h3>
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
   H. MENTOR GUIDANCE (dark) — more personal, more honest
══════════════════════════════════════════════════════════ */
function MentorSection({ onConsult }: { onConsult: () => void }) {
  return (
    <section className="py-20 sm:py-28" style={{ background: DARK_BG_A }}>
      <div className="max-w-3xl mx-auto px-5 sm:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={VP} variants={stagger} className="space-y-8">

          <motion.div variants={fadeUp}><SectionLabel dark>Lời khuyên từ mentor</SectionLabel></motion.div>

          {/* Pull quote */}
          <motion.div variants={fadeUp} style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
            <div style={{ width: "2px", flexShrink: 0, background: "rgba(52,160,140,0.36)", borderRadius: "999px", marginTop: "4px", alignSelf: "stretch" }} />
            <p style={{ fontSize: "clamp(1.05rem, 2.3vw, 1.25rem)", fontWeight: 600, lineHeight: 1.38, letterSpacing: "-0.012em", color: "rgba(255,255,255,0.90)", margin: 0 }}>
              SWC Pass không phải lối tắt.<br />Đây là quyền truy cập vào một hệ thống — và hệ thống cần thời gian.
            </p>
          </motion.div>

          {/* Body paragraphs */}
          <motion.div variants={fadeUp} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {[
              "Nếu anh/chị đang tìm kiếm một nơi rõ ràng hơn để bắt đầu — một cấu trúc thay vì thông tin rải rác từ nhiều nguồn — thì SWC Pass là đáng cân nhắc. Không phải vì nó hoàn hảo, mà vì nó có hệ thống.",
              "Nếu anh/chị đã có nền tảng cơ bản và muốn đi sâu hơn với công cụ, tài liệu và cộng đồng đi cùng — SWC Pass phù hợp với hướng đó.",
              "Nếu anh/chị vẫn đang trong giai đoạn tìm hiểu, chưa có mục tiêu tài chính cụ thể, hoặc đang tìm kết quả nhanh — tôi khuyên nên bắt đầu từ nội dung miễn phí trên kênh, hiểu hệ thống trước, rồi mới quyết định.",
            ].map((text, i) => (
              <div key={i} style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                <span style={{ flexShrink: 0, marginTop: "0.42rem", fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", color: "rgba(52,160,140,0.60)" }}>0{i + 1}</span>
                <p style={{ fontSize: "clamp(13.5px, 1.9vw, 15px)", lineHeight: 1.90, color: "rgba(255,255,255,0.56)", fontWeight: 300, margin: 0 }}>{text}</p>
              </div>
            ))}
          </motion.div>

          {/* Author card */}
          <motion.div variants={fadeUp} style={{ display: "flex", alignItems: "center", gap: "1rem", paddingTop: "1.5rem", borderTop: "1px solid rgba(52,160,140,0.10)" }}>
            <div style={{
              width: "42px", height: "42px", borderRadius: "50%", flexShrink: 0,
              background: "rgba(52,160,140,0.10)", border: "1.5px solid rgba(52,160,140,0.22)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ fontSize: "15px", fontWeight: 700, color: "rgba(52,160,140,0.85)" }}>T</span>
            </div>
            <div>
              <p style={{ fontSize: "13.5px", fontWeight: 600, color: "rgba(255,255,255,0.80)", margin: 0, lineHeight: 1.3 }}>Phan Văn Thắng</p>
              <p style={{ fontSize: "11.5px", fontWeight: 300, color: "rgba(255,255,255,0.30)", margin: "2px 0 0", fontStyle: "italic" }}>Hệ sinh thái SWC</p>
            </div>
            <div style={{ marginLeft: "auto" }}>
              <button style={{ ...BTN_GHOST, height: "38px", fontSize: "13px" }} onClick={onConsult}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(52,160,140,0.56)"; (e.currentTarget as HTMLElement).style.color = "rgba(52,160,140,1)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(52,160,140,0.32)"; (e.currentTarget as HTMLElement).style.color = "rgba(52,160,140,0.82)"; }}>
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
   I. FAQ (dark) — with smooth animated expand
══════════════════════════════════════════════════════════ */
function FAQItem({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
  const bodyRef = useRef<HTMLDivElement>(null);
  return (
    <div style={{ borderBottom: "1px solid rgba(52,160,140,0.10)" }}>
      <button onClick={onToggle} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", padding: "1.125rem 0", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
        <span style={{ fontSize: "14px", fontWeight: open ? 500 : 400, color: open ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.68)", letterSpacing: "-0.007em", lineHeight: 1.38, transition: "color 0.18s ease" }}>
          {q}
        </span>
        <span style={{
          flexShrink: 0, width: "22px", height: "22px", borderRadius: "50%",
          border: `1px solid ${open ? "rgba(52,160,140,0.46)" : "rgba(255,255,255,0.12)"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: open ? "rgba(52,160,140,0.88)" : "rgba(255,255,255,0.36)",
          transition: "border-color 0.18s ease, color 0.18s ease, transform 0.22s ease",
          transform: open ? "rotate(45deg)" : "rotate(0deg)",
        }}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <line x1="5" y1="1" x2="5" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="1" y1="5" x2="9" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } }}
            exit={{ height: 0, opacity: 0, transition: { duration: 0.20, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } }}
            style={{ overflow: "hidden" }}
          >
            <div ref={bodyRef} style={{ paddingBottom: "1.25rem" }}>
              <p style={{ fontSize: "13.5px", lineHeight: 1.90, color: "rgba(255,255,255,0.46)", fontWeight: 300 }}>{a}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const faqs = [
    {
      q: "SWC Pass là khóa học hay sản phẩm truy cập hệ sinh thái?",
      a: "SWC Pass là sản phẩm truy cập — không phải khóa học độc lập. Nó cấp quyền vào SWC Field và hệ sinh thái SWC, không chỉ là một tập nội dung đóng gói cố định. Cách tiếp cận đúng là coi đây là một cổng vào và một mối quan hệ liên tục, không phải một khóa học có điểm bắt đầu và điểm kết thúc."
    },
    {
      q: "SWC Pass có bao gồm SWC Field không?",
      a: "Có. SWC Field là thành phần cốt lõi trong tất cả các gói SWC Pass. Tùy hạng gói, phạm vi truy cập và tài liệu đi kèm sẽ khác nhau — nhưng quyền truy cập vào SWC Field có ở mọi gói."
    },
    {
      q: "Gói nào bao gồm Road to a Million?",
      a: "Road to a Million được bao gồm trong gói Ultimate. Đây là khuôn khổ tiếp cận tài chính dài hạn — không phải lời hứa kết quả tài chính cụ thể, mà là cách tư duy và lộ trình có cấu trúc cho người muốn xây dựng tài chính theo hướng bài bản."
    },
    {
      q: "SWC Pass có phù hợp với người mới bắt đầu không?",
      a: "Phù hợp, nhưng có điều kiện. Nếu anh/chị đã có nền tảng cơ bản về tài chính cá nhân và hiểu mình đang tìm kiếm gì, SWC Pass là điểm khởi đầu có cấu trúc. Nếu chưa, nên theo dõi nội dung miễn phí từ kênh Thắng SWC trước — để hiểu cách tiếp cận trước khi quyết định."
    },
    {
      q: "Có hướng đối tác hay đồng hành trong hệ sinh thái không?",
      a: "Có trong gói Ultimate và một số hướng cụ thể. Tuy nhiên, hướng đối tác nên được hiểu là đồng hành dài hạn với hệ sinh thái — không phải mô hình giới thiệu hay hoa hồng đơn giản. Liên hệ trực tiếp để trao đổi cụ thể hơn nếu đây là mối quan tâm của anh/chị."
    },
    {
      q: "Tôi nên chọn gói nào?",
      a: "Essential phù hợp nếu muốn trải nghiệm và đánh giá trong 1 năm. Plus phù hợp nếu đã hiểu giá trị và muốn cam kết dài hơn với chi phí hợp lý hơn trên mỗi năm. Ultimate phù hợp nếu muốn truy cập toàn diện — bao gồm Road to a Million và các sản phẩm hệ sinh thái — hoặc tìm hiểu hướng tham gia sâu hơn. Nếu chưa chắc, có thể để lại câu hỏi để trao đổi trước."
    },
  ];

  return (
    <section className="py-20 sm:py-24" style={{ background: DARK_BG_B }}>
      <div className="max-w-3xl mx-auto px-5 sm:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={VP} variants={stagger}>
          <motion.div variants={fadeUp} style={{ marginBottom: "1rem" }}><SectionLabel dark>Câu hỏi thường gặp</SectionLabel></motion.div>
          <motion.div variants={fadeUp} style={{ marginBottom: "2.75rem" }}><SectionHeading dark>Những điều hay được hỏi</SectionHeading></motion.div>
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
function FinalCTASection({
  showModal,
  onOpen,
  onClose,
  defaultPlan,
}: {
  showModal: boolean;
  onOpen: (plan?: string) => void;
  onClose: () => void;
  defaultPlan: string;
}) {
  const [name,  setName]  = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [plan,  setPlan]  = useState(defaultPlan);
  const [note,  setNote]  = useState("");
  const [sent,  setSent]  = useState(false);
  const [loading, setLoading] = useState(false);

  // Sync defaultPlan into local state when modal opens
  useEffect(() => {
    if (showModal) setPlan(defaultPlan);
  }, [showModal, defaultPlan]);

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

  const overlay: React.CSSProperties = {
    position: "fixed", inset: 0, zIndex: 1000,
    background: "rgba(3,12,10,0.86)", backdropFilter: "blur(12px)",
    display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem",
  };
  const panel: React.CSSProperties = {
    width: "100%", maxWidth: "460px", position: "relative",
    background: "linear-gradient(160deg, #0f2825 0%, #081e1b 100%)",
    border: "1px solid rgba(52,160,140,0.16)", borderRadius: "1rem",
    padding: "2rem 2rem 2.25rem",
    boxShadow: "0 24px 64px rgba(0,0,0,0.52)", maxHeight: "92vh", overflowY: "auto",
  };
  const fieldLabel: React.CSSProperties = {
    display: "block", fontSize: "10px", fontWeight: 600, letterSpacing: "0.14em",
    textTransform: "uppercase", color: "rgba(255,255,255,0.34)", marginBottom: "7px",
  };
  const fieldBase: React.CSSProperties = {
    width: "100%", height: "42px", padding: "0 14px",
    background: "rgba(255,255,255,0.045)", border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: "8px", fontSize: "13.5px", fontWeight: 400,
    color: "rgba(255,255,255,0.84)", outline: "none",
    transition: "border-color 0.22s ease", boxSizing: "border-box" as const,
  };
  const fieldSelect: React.CSSProperties = {
    ...fieldBase, cursor: "pointer", appearance: "none" as const,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='rgba(255,255,255,0.26)' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center", paddingRight: "36px",
  };
  const fieldTextarea: React.CSSProperties = { ...fieldBase, height: "72px", padding: "10px 14px", resize: "vertical" as const, lineHeight: 1.6 };
  const submitBtn: React.CSSProperties = { ...BTN_PRIMARY, width: "100%", height: "46px", fontSize: "14px", marginTop: "0.25rem" };
  const closeBtn: React.CSSProperties = {
    position: "absolute", top: "1rem", right: "1rem",
    width: "28px", height: "28px", borderRadius: "50%",
    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.09)",
    color: "rgba(255,255,255,0.42)", display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", fontSize: "17px", lineHeight: 1,
  };
  const focusBorder = (e: React.FocusEvent<HTMLElement>) => (e.currentTarget.style.borderColor = "rgba(52,160,140,0.50)");
  const blurBorder  = (e: React.FocusEvent<HTMLElement>) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)");

  const SuccessMark = () => (
    <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "rgba(52,160,140,0.10)", border: "1px solid rgba(52,160,140,0.24)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem" }}>
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M3.5 9.5L7 13l7.5-8" stroke="rgba(52,160,140,0.88)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
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

            <motion.h2 variants={fadeUp} style={{ fontSize: "clamp(1.6rem, 4vw, 2.2rem)", fontWeight: 700, lineHeight: 1.22, letterSpacing: "-0.020em", color: "rgba(255,255,255,0.94)", marginBottom: "1.125rem" }}>
              Bắt đầu với quyền truy cập có cấu trúc,<br />không phải thông tin rời rạc
            </motion.h2>

            <motion.p variants={fadeUp} style={{ fontSize: "14px", lineHeight: 1.90, fontWeight: 300, color: "rgba(255,255,255,0.48)", maxWidth: "33rem", margin: "0 auto 2.25rem" }}>
              SWC Pass được xây dựng cho người muốn tiếp cận hệ sinh thái SWC một cách rõ hơn và bền hơn. Nếu anh/chị muốn trao đổi trước khi quyết định, để lại thông tin — không có áp lực.
            </motion.p>

            <motion.div variants={fadeUp} style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", justifyContent: "center", marginBottom: "2.5rem" }}>
              <a href="#goi-swc-pass" style={BTN_PRIMARY}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 24px rgba(26,120,104,0.40)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 18px rgba(26,120,104,0.28)"; }}>
                Xem các gói
              </a>
              <button style={BTN_GHOST} onClick={() => onOpen()}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(52,160,140,0.56)"; (e.currentTarget as HTMLElement).style.color = "rgba(52,160,140,1)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(52,160,140,0.32)"; (e.currentTarget as HTMLElement).style.color = "rgba(52,160,140,0.82)"; }}>
                Hỏi trước khi quyết định
              </button>
            </motion.div>

            <motion.p variants={fadeUp} style={{ fontSize: "12.5px", fontStyle: "italic", fontWeight: 300, color: "rgba(255,255,255,0.25)", lineHeight: 1.7 }}>
              Quyết định tốt là quyết định dựa trên hiểu biết đầy đủ.
            </motion.p>

          </motion.div>
        </div>
      </section>

      {/* Consultation modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            key="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            style={overlay}
            onClick={handleClose}
          >
            <motion.div
              key="modal-panel"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
              style={panel}
              onClick={e => e.stopPropagation()}
            >
              <button style={closeBtn} onClick={handleClose} aria-label="Đóng">×</button>

              {sent ? (
                <div style={{ textAlign: "center", padding: "2rem 0.5rem" }}>
                  <SuccessMark />
                  <p style={{ fontSize: "16px", fontWeight: 600, color: "rgba(255,255,255,0.90)", marginBottom: "0.75rem" }}>Đã nhận thông tin</p>
                  <p style={{ fontSize: "13.5px", fontWeight: 300, lineHeight: 1.85, color: "rgba(255,255,255,0.44)", maxWidth: "26rem", margin: "0 auto 1.75rem" }}>
                    Cảm ơn anh/chị đã dành thời gian. Chúng tôi sẽ liên hệ trong thời gian sớm nhất để trao đổi về SWC Pass.
                  </p>
                  <button style={{ ...BTN_GHOST, width: "100%" }} onClick={handleClose}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(52,160,140,0.56)"; (e.currentTarget as HTMLElement).style.color = "rgba(52,160,140,1)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(52,160,140,0.32)"; (e.currentTarget as HTMLElement).style.color = "rgba(52,160,140,0.82)"; }}>
                    Đóng
                  </button>
                </div>
              ) : (
                <>
                  <p style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(52,160,140,0.65)", marginBottom: "0.5rem" }}>SWC Pass · Tư vấn</p>
                  <h3 style={{ fontSize: "17px", fontWeight: 700, color: "rgba(255,255,255,0.92)", marginBottom: "0.5rem", lineHeight: 1.28 }}>
                    Để lại thông tin để trao đổi thêm
                  </h3>
                  <p style={{ fontSize: "13px", fontWeight: 300, lineHeight: 1.75, color: "rgba(255,255,255,0.38)", marginBottom: "1.5rem" }}>
                    Không có áp lực. Cứ để lại câu hỏi hoặc mối quan tâm, chúng tôi sẽ liên hệ phù hợp.
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div>
                      <label style={fieldLabel}>Họ và tên</label>
                      <input type="text" placeholder="Nguyễn Văn A" style={fieldBase} value={name} onChange={e => setName(e.target.value)} onFocus={focusBorder} onBlur={blurBorder} />
                    </div>
                    <div>
                      <label style={fieldLabel}>Email</label>
                      <input type="email" placeholder="email@example.com" style={fieldBase} value={email} onChange={e => setEmail(e.target.value)} onFocus={focusBorder} onBlur={blurBorder} />
                    </div>
                    <div>
                      <label style={fieldLabel}>Số điện thoại / Zalo <span style={{ opacity: 0.45, fontWeight: 300, fontSize: "9px" }}>(không bắt buộc)</span></label>
                      <input type="tel" placeholder="09xx xxx xxx" style={fieldBase} value={phone} onChange={e => setPhone(e.target.value)} onFocus={focusBorder} onBlur={blurBorder} />
                    </div>
                    <div>
                      <label style={fieldLabel}>Gói quan tâm</label>
                      <select style={fieldSelect} value={plan} onChange={e => setPlan(e.target.value)} onFocus={focusBorder} onBlur={blurBorder}>
                        <option value="">Chưa chắc / Muốn hỏi thêm</option>
                        <option value="Essential ($240 / 1 năm + 90 ngày)">Essential — $240 / 1 năm + 90 ngày</option>
                        <option value="Plus ($600 / 5 năm)">Plus — $600 / 5 năm</option>
                        <option value="Ultimate ($2,600 / Trọn đời)">Ultimate — $2,600 / Trọn đời</option>
                      </select>
                    </div>
                    <div>
                      <label style={fieldLabel}>Câu hỏi hoặc ghi chú <span style={{ opacity: 0.45, fontWeight: 300, fontSize: "9px" }}>(không bắt buộc)</span></label>
                      <textarea placeholder="Anh/chị muốn hỏi hoặc chia sẻ thêm điều gì..." style={fieldTextarea} value={note} onChange={e => setNote(e.target.value)} onFocus={focusBorder} onBlur={blurBorder} />
                    </div>
                    <button
                      style={{ ...submitBtn, opacity: loading || !name.trim() || !email.trim() ? 0.65 : 1, cursor: loading || !name.trim() || !email.trim() ? "not-allowed" : "pointer" }}
                      onClick={handleSubmit}
                      disabled={loading || !name.trim() || !email.trim()}
                      onMouseEnter={e => { if (!loading && name.trim() && email.trim()) { (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 24px rgba(26,120,104,0.44)"; } }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 18px rgba(26,120,104,0.28)"; }}>
                      {loading ? "Đang gửi..." : "Gửi thông tin"}
                    </button>
                    <p style={{ fontSize: "11px", fontWeight: 300, color: "rgba(255,255,255,0.22)", textAlign: "center", lineHeight: 1.65 }}>
                      Thông tin của anh/chị được bảo mật và chỉ dùng để trao đổi về SWC Pass.
                    </p>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ══════════════════════════════════════════════════════════
   PAGE EXPORT
══════════════════════════════════════════════════════════ */
export default function ProductSWCPass() {
  useSeoMeta({
    title:       "SWC Pass — Quyền truy cập có cấu trúc vào hệ sinh thái SWC",
    description: "SWC Pass là lớp truy cập nền tảng vào hệ sinh thái SWC — bao gồm SWC Field, tài liệu có hệ thống và các lớp giá trị mở rộng. Dành cho người muốn tiếp cận tài chính cá nhân một cách có cấu trúc.",
    ogImage:     "/opengraph.jpg",
    ogType:      "website",
  });
  const [showModal, setShowModal] = useState(false);
  const [defaultPlan, setDefaultPlan] = useState("");

  function openConsult(plan?: string) {
    setDefaultPlan(plan ?? "");
    setShowModal(true);
  }

  return (
    <>
      <Hero onConsult={() => openConsult()} />
      <WhatIsSection />
      <ProblemSection />
      <InsideSection />
      <AudienceSection />
      <PricingSection onConsult={openConsult} />
      <FoundationalSection />
      <MentorSection onConsult={() => openConsult()} />
      <FAQSection />
      <FinalCTASection
        showModal={showModal}
        onOpen={openConsult}
        onClose={() => setShowModal(false)}
        defaultPlan={defaultPlan}
      />
    </>
  );
}
