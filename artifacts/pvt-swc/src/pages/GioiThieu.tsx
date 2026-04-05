import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { BackgroundDecor } from "@/components/BackgroundDecor";
import { ProcessSection } from "@/components/ProcessSection";
import {
  aboutHero,
  dinhHuong,
  coreValues,
  audienceSection,
  aboutCta,
} from "@/content/aboutPageData";

const fadeUp = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.70, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.11 } },
};

/* ─────────────────────────────────────────────────────────────────────
   A. HERO — personal identity anchor
   Portrait used once, confidently. Text column leads.
───────────────────────────────────────────────────────────────────── */
function GioiThieuHero() {
  return (
    <section
      className="relative overflow-hidden"
      style={{
        background: "linear-gradient(148deg, #0c2420 0%, #0e2924 55%, #081b17 100%)",
        paddingTop:    "clamp(6.5rem, 15vw, 10rem)",
        paddingBottom: "clamp(5.5rem, 12vw, 8.5rem)",
      }}
    >
      {/* Structural grid texture */}
      <BackgroundDecor />

      {/* Right-side atmospheric glow — grounds the portrait */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "-5%", right: "-8%",
          width: "58%", height: "115%",
          background: "radial-gradient(ellipse at 60% 38%, rgba(34,145,127,0.10) 0%, rgba(20,100,88,0.04) 42%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      {/* Top-left ambient — balances the glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: 0, left: 0,
          width: "42%", height: "55%",
          background: "radial-gradient(ellipse at 10% 10%, rgba(26,118,100,0.07) 0%, transparent 62%)",
        }}
      />

      {/* Bottom vignette / section close */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{ height: "100px", background: "linear-gradient(to bottom, transparent, rgba(8,27,23,0.52))" }}
      />

      {/* Bottom hairline accent */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{
          height: "1px",
          background: "linear-gradient(90deg, transparent 0%, rgba(52,160,140,0.16) 30%, rgba(52,160,140,0.16) 70%, transparent 100%)",
        }}
      />

      <div className="max-w-5xl mx-auto px-5 sm:px-8 relative z-10">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="grid grid-cols-1 lg:grid-cols-[1fr_308px] gap-10 lg:gap-20 items-center"
        >

          {/* ── Text column ── */}
          <div>
            {/* Eyebrow */}
            <motion.div variants={fadeUp} className="flex items-center gap-3" style={{ marginBottom: "1.75rem" }}>
              <div style={{
                width: "2rem", height: "0.5px",
                background: "linear-gradient(to right, rgba(200,158,76,0.20), rgba(200,158,76,0.65))",
                flexShrink: 0,
              }} />
              <span style={{
                fontSize: "9px", fontWeight: 600,
                letterSpacing: "0.28em", textTransform: "uppercase",
                color: "rgba(200,158,76,0.72)",
              }}>
                {aboutHero.eyebrow}
              </span>
            </motion.div>

            {/* H1 — strong, premium, clear */}
            <motion.h1
              variants={fadeUp}
              className="text-white"
              style={{
                fontSize: "clamp(2.25rem, 5.6vw, 3.6rem)",
                fontWeight: 700,
                lineHeight: 1.10,
                letterSpacing: "-0.038em",
                marginBottom: "1.875rem",
                maxWidth: "22rem",
              }}
            >
              {aboutHero.heading}
            </motion.h1>

            {/* Primary subheading — editorial lead */}
            <motion.p
              variants={fadeUp}
              style={{
                fontSize: "15.5px",
                fontWeight: 400,
                color: "rgba(255,255,255,0.62)",
                lineHeight: 1.86,
                maxWidth: "30rem",
                marginBottom: "1.125rem",
              }}
            >
              {aboutHero.subheading}
            </motion.p>

            {/* Supporting text — stepped down, quiet */}
            <motion.p
              variants={fadeUp}
              style={{
                fontSize: "13px",
                fontWeight: 400,
                color: "rgba(255,255,255,0.34)",
                lineHeight: 1.92,
                maxWidth: "26rem",
                marginBottom: "2.5rem",
                letterSpacing: "0.005em",
              }}
            >
              {aboutHero.supportingText}
            </motion.p>

            {/* CTA buttons */}
            <motion.div variants={fadeUp} className="flex items-center gap-3 flex-wrap">
              {/* Primary */}
              <a
                href="/tin-tuc"
                className="inline-flex items-center gap-2 rounded-full text-white"
                style={{
                  height: "2.875rem",
                  padding: "0 1.875rem",
                  fontSize: "12.5px",
                  fontWeight: 600,
                  letterSpacing: "0.03em",
                  textDecoration: "none",
                  background: "linear-gradient(140deg, #22917f 0%, #1a7868 100%)",
                  boxShadow: "0 4px 20px rgba(20,115,98,0.26), inset 0 1px 0 rgba(255,255,255,0.14)",
                  transition: "box-shadow 0.24s ease, transform 0.24s ease",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.boxShadow = "0 7px 26px rgba(20,115,98,0.40), inset 0 1px 0 rgba(255,255,255,0.16)";
                  el.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.boxShadow = "0 4px 20px rgba(20,115,98,0.26), inset 0 1px 0 rgba(255,255,255,0.14)";
                  el.style.transform = "translateY(0)";
                }}
              >
                Xem bài viết
                <ArrowRight size={12} strokeWidth={2.2} />
              </a>

              {/* Secondary — frosted glass */}
              <a
                href="/#lien-he"
                className="inline-flex items-center gap-2 rounded-full"
                style={{
                  height: "2.875rem",
                  padding: "0 1.625rem",
                  fontSize: "12.5px",
                  fontWeight: 500,
                  color: "rgba(255,255,255,0.68)",
                  textDecoration: "none",
                  background: "rgba(255,255,255,0.048)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  backdropFilter: "blur(16px)",
                  transition: "background 0.24s ease, border-color 0.24s ease, color 0.24s ease",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = "rgba(255,255,255,0.075)";
                  el.style.borderColor = "rgba(255,255,255,0.20)";
                  el.style.color = "rgba(255,255,255,0.86)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = "rgba(255,255,255,0.048)";
                  el.style.borderColor = "rgba(255,255,255,0.12)";
                  el.style.color = "rgba(255,255,255,0.68)";
                }}
              >
                Liên hệ kết nối
              </a>
            </motion.div>

            {/* Trust bar — separated by a hairline */}
            <motion.div variants={fadeUp} style={{ marginTop: "2.5rem" }}>
              <div style={{
                height: "1px",
                width: "100%",
                maxWidth: "20rem",
                background: "rgba(255,255,255,0.07)",
                marginBottom: "1.25rem",
              }} />
              <div className="flex items-center gap-6 flex-wrap">
                {[
                  { n: "7+", label: "năm đầu tư dài hạn" },
                  { n: "5+", label: "năm công nghệ" },
                ].map((s, i) => (
                  <React.Fragment key={s.label}>
                    {i > 0 && (
                      <div style={{ width: "1px", height: "22px", background: "rgba(255,255,255,0.09)", flexShrink: 0 }} />
                    )}
                    <div className="flex items-baseline gap-1.5">
                      <span style={{
                        fontSize: "14.5px", fontWeight: 600,
                        color: "rgba(255,255,255,0.60)", letterSpacing: "-0.022em",
                      }}>
                        {s.n}
                      </span>
                      <span style={{
                        fontSize: "10.5px", fontWeight: 400,
                        color: "rgba(255,255,255,0.28)", letterSpacing: "0.03em",
                      }}>
                        {s.label}
                      </span>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </motion.div>
          </div>

          {/* ── Portrait — single use, double-frame treatment ── */}
          <motion.div
            variants={fadeUp}
            className="flex justify-center lg:justify-end"
            style={{ position: "relative" }}
          >
            {/* Outer frosted ring — premium frame */}
            <div
              style={{
                padding: "5px",
                borderRadius: "22px",
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(255,255,255,0.09)",
                boxShadow: "0 32px 80px rgba(0,0,0,0.50), 0 8px 24px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.06)",
                width: "100%",
                maxWidth: "296px",
              }}
            >
              {/* Inner portrait card */}
              <div
                style={{
                  borderRadius: "18px",
                  overflow: "hidden",
                  aspectRatio: "4/5",
                  position: "relative",
                  background: "#0a2420",
                }}
              >
                <img
                  src="/portrait.png"
                  alt="Phan Văn Thắng SWC"
                  style={{
                    width: "100%", height: "100%",
                    objectFit: "cover",
                    objectPosition: "60% 8%",
                    filter: "brightness(1.07) contrast(1.05) saturate(0.92)",
                    display: "block",
                  }}
                />

                {/* Bottom gradient — gives name badge contrast */}
                <div className="absolute inset-0 pointer-events-none" style={{
                  background: "linear-gradient(to top, rgba(8,27,23,0.88) 0%, rgba(8,27,23,0.24) 32%, transparent 55%)",
                }} />

                {/* Left-edge gradient — blends portrait into dark bg */}
                <div className="absolute inset-0 pointer-events-none" style={{
                  background: "linear-gradient(to right, rgba(12,36,32,0.30) 0%, transparent 40%)",
                }} />

                {/* Name badge */}
                <div className="absolute bottom-0 left-0 right-0" style={{ padding: "0 1.375rem 1.375rem" }}>
                  <div style={{ height: "0.5px", background: "rgba(255,255,255,0.10)", marginBottom: "0.75rem" }} />
                  <p style={{
                    fontSize: "12px", fontWeight: 600,
                    color: "rgba(255,255,255,0.88)",
                    letterSpacing: "0.012em",
                    lineHeight: 1.3,
                    marginBottom: "3px",
                  }}>
                    Phan Văn Thắng
                  </p>
                  <p style={{
                    fontSize: "9.5px", fontWeight: 400,
                    color: "rgba(255,255,255,0.36)",
                    letterSpacing: "0.07em",
                    textTransform: "uppercase",
                  }}>
                    Mentor tài chính dài hạn
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   B. ĐỊNH HƯỚNG — why this site exists / the philosophy
   Text-led. No portrait. Principle cards on the right.
───────────────────────────────────────────────────────────────────── */
function DinhHuongSection() {
  return (
    <section id="dinh-huong" className="bg-background" style={{ paddingTop: "clamp(4.5rem, 11vw, 7rem)", paddingBottom: "clamp(4.5rem, 11vw, 7rem)" }}>
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={stagger}
          className="grid grid-cols-1 lg:grid-cols-[1fr_264px] gap-12 lg:gap-16 items-start"
        >

          {/* ── Left: editorial text ── */}
          <div>
            {/* Eyebrow */}
            <motion.div variants={fadeUp} className="flex items-center gap-3 mb-6">
              <div style={{ width: "1.75rem", height: "1px", background: "hsl(var(--primary) / 0.45)", flexShrink: 0 }} />
              <span className="section-label">{dinhHuong.eyebrow}</span>
            </motion.div>

            {/* Heading */}
            <motion.h2
              variants={fadeUp}
              style={{
                fontSize: "clamp(1.45rem, 3.2vw, 2rem)",
                fontWeight: 700,
                lineHeight: 1.24,
                letterSpacing: "-0.022em",
                color: "hsl(var(--foreground))",
                maxWidth: "28rem",
                marginBottom: "1.875rem",
              }}
            >
              {dinhHuong.heading}
            </motion.h2>

            {/* Body paragraphs */}
            <motion.div variants={fadeUp} className="space-y-4 mb-8" style={{ maxWidth: "36rem" }}>
              <p style={{ fontSize: "15px", lineHeight: 1.94, fontWeight: 400, color: "hsl(var(--foreground) / 0.65)" }}>
                {dinhHuong.para1}
              </p>
              <p style={{ fontSize: "15px", lineHeight: 1.94, fontWeight: 400, color: "hsl(var(--foreground) / 0.65)" }}>
                {dinhHuong.para2}
              </p>
            </motion.div>

            {/* Editorial quote block */}
            <motion.blockquote
              variants={fadeUp}
              className="pl-5"
              style={{
                borderLeft: "2px solid hsl(var(--primary) / 0.22)",
                margin: 0,
                maxWidth: "32rem",
              }}
            >
              <p style={{
                fontSize: "14px",
                lineHeight: 1.86,
                fontWeight: 400,
                fontStyle: "italic",
                color: "hsl(var(--foreground) / 0.50)",
                letterSpacing: "0.003em",
              }}>
                Đi đường dài trong tài chính luôn bắt đầu từ việc hiểu đúng.
              </p>
            </motion.blockquote>
          </div>

          {/* ── Right: principle cards ── */}
          <motion.div variants={stagger} className="flex flex-col gap-3 lg:pt-10">
            {dinhHuong.principles.map(({ title, desc }) => (
              <motion.div
                key={title}
                variants={fadeUp}
                style={{
                  padding: "1.375rem 1.625rem",
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border) / 0.50)",
                  borderRadius: "14px",
                  borderTop: "2px solid hsl(var(--primary) / 0.18)",
                  boxShadow: "0 1px 6px rgba(10,40,35,0.06)",
                }}
              >
                <p style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  letterSpacing: "-0.005em",
                  color: "hsl(var(--foreground) / 0.88)",
                  lineHeight: 1.38,
                  marginBottom: "5px",
                }}>
                  {title}
                </p>
                <p style={{
                  fontSize: "12px",
                  lineHeight: 1.74,
                  fontWeight: 400,
                  color: "hsl(var(--muted-foreground))",
                }}>
                  {desc}
                </p>
              </motion.div>
            ))}
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   C. CORE VALUES — 4 guiding principles
   Card-grid section on a slightly warmer surface.
───────────────────────────────────────────────────────────────────── */
function GioiThieuValuesSection() {
  return (
    <section
      style={{
        background: "hsl(var(--card))",
        paddingTop: "clamp(4.5rem, 11vw, 7rem)",
        paddingBottom: "clamp(4.5rem, 11vw, 7rem)",
      }}
    >
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={stagger}
          className="space-y-12"
        >
          {/* Header */}
          <div className="max-w-xl">
            <motion.div variants={fadeUp} className="flex items-center gap-3 mb-5">
              <div style={{ width: "1.75rem", height: "1px", background: "hsl(var(--primary) / 0.45)", flexShrink: 0 }} />
              <span className="section-label">Giá trị cốt lõi</span>
            </motion.div>
            <motion.h2
              variants={fadeUp}
              style={{
                fontSize: "clamp(1.45rem, 3.2vw, 2rem)",
                fontWeight: 700,
                lineHeight: 1.24,
                letterSpacing: "-0.022em",
                color: "hsl(var(--foreground))",
              }}
            >
              Những nguyên tắc tôi ưu tiên khi xây nội dung và đồng hành
            </motion.h2>
          </div>

          {/* Cards */}
          <motion.div
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5"
          >
            {coreValues.map(({ icon, title, desc }) => (
              <motion.div
                key={title}
                variants={fadeUp}
                className="flex flex-col bg-background"
                style={{
                  padding: "1.875rem 1.625rem",
                  borderRadius: "14px",
                  border: "1px solid hsl(var(--border) / 0.55)",
                  boxShadow: "0 1px 4px rgba(10,40,35,0.05)",
                  transition: "border-color 0.28s ease, box-shadow 0.28s ease, transform 0.28s ease",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = "hsl(var(--primary) / 0.24)";
                  el.style.boxShadow = "0 8px 28px rgba(10,40,35,0.10), 0 2px 6px rgba(10,40,35,0.05)";
                  el.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = "hsl(var(--border) / 0.55)";
                  el.style.boxShadow = "0 1px 4px rgba(10,40,35,0.05)";
                  el.style.transform = "translateY(0)";
                }}
              >
                {/* Icon */}
                <div
                  className="flex items-center justify-center mb-6 flex-shrink-0"
                  style={{
                    width: "44px", height: "44px",
                    borderRadius: "10px",
                    background: "hsl(var(--primary) / 0.07)",
                    border: "1px solid hsl(var(--primary) / 0.12)",
                  }}
                >
                  {icon}
                </div>

                {/* Title */}
                <p style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  letterSpacing: "-0.008em",
                  color: "hsl(var(--foreground))",
                  lineHeight: 1.34,
                  marginBottom: "0.625rem",
                }}>
                  {title}
                </p>

                {/* Body */}
                <p style={{
                  fontSize: "12.5px",
                  lineHeight: 1.84,
                  fontWeight: 400,
                  color: "hsl(var(--muted-foreground))",
                }}>
                  {desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   E. DÀNH CHO AI — checklist cards on dark background
───────────────────────────────────────────────────────────────────── */
function GioiThieuAudienceSection() {
  return (
    <section
      style={{
        background: "linear-gradient(168deg, #0f2823 0%, #0a1f1c 100%)",
        paddingTop: "clamp(4.5rem, 11vw, 7rem)",
        paddingBottom: "clamp(4.5rem, 11vw, 7rem)",
      }}
    >
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={stagger}
          className="space-y-12"
        >
          {/* Header */}
          <div className="max-w-xl space-y-5">
            <motion.div variants={fadeUp} className="flex items-center gap-3">
              <div style={{ height: "0.5px", width: "1.75rem", background: "rgba(52,160,140,0.55)", flexShrink: 0 }} />
              <span style={{
                fontSize: "9.5px", fontWeight: 600,
                letterSpacing: "0.24em", textTransform: "uppercase",
                color: "rgba(52,160,140,0.70)",
              }}>
                {audienceSection.eyebrow}
              </span>
            </motion.div>

            <motion.h2
              variants={fadeUp}
              style={{
                fontSize: "clamp(1.45rem, 3.2vw, 2rem)",
                fontWeight: 700,
                lineHeight: 1.24,
                letterSpacing: "-0.022em",
                color: "rgba(255,255,255,0.92)",
              }}
            >
              {audienceSection.heading}
            </motion.h2>
          </div>

          {/* Checklist cards */}
          <motion.div variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {audienceSection.items.map((item) => (
              <motion.div
                key={item}
                variants={fadeUp}
                className="flex items-start gap-4"
                style={{
                  padding: "1.5rem 1.75rem",
                  borderRadius: "14px",
                  background: "rgba(255,255,255,0.038)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  transition: "background 0.26s ease, border-color 0.26s ease",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = "rgba(52,160,140,0.09)";
                  el.style.borderColor = "rgba(52,160,140,0.20)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = "rgba(255,255,255,0.038)";
                  el.style.borderColor = "rgba(255,255,255,0.07)";
                }}
              >
                <div
                  className="flex items-center justify-center rounded-full flex-shrink-0"
                  style={{
                    width: "20px", height: "20px",
                    background: "rgba(52,160,140,0.15)",
                    border: "1px solid rgba(52,160,140,0.28)",
                    marginTop: "3px",
                  }}
                >
                  <Check size={10} strokeWidth={2.5} style={{ color: "rgba(52,160,140,0.88)" }} />
                </div>
                <p style={{
                  fontSize: "14px",
                  lineHeight: 1.76,
                  fontWeight: 400,
                  color: "rgba(255,255,255,0.70)",
                }}>
                  {item}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Closing note */}
          <motion.div
            variants={fadeUp}
            className="pt-4"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div style={{ width: "1.25rem", height: "1.5px", background: "rgba(52,160,140,0.40)", marginBottom: "1rem" }} />
            <p style={{
              fontSize: "14px",
              lineHeight: 1.9,
              fontWeight: 300,
              fontStyle: "italic",
              color: "rgba(255,255,255,0.48)",
              maxWidth: "36rem",
              letterSpacing: "0.005em",
            }}>
              Nếu anh/chị đang tìm một hướng đi bình tĩnh hơn, thực tế hơn và có chiều sâu
              hơn với tài chính — đây có thể là nơi phù hợp.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   F. FINAL CTA — soft, confident close
───────────────────────────────────────────────────────────────────── */
function GioiThieuCTASection() {
  return (
    <section
      className="relative overflow-hidden"
      style={{
        background: "linear-gradient(150deg, #0d2622 0%, #102a26 50%, #091e1b 100%)",
        paddingTop: "clamp(5rem, 12vw, 8rem)",
        paddingBottom: "clamp(5rem, 12vw, 8rem)",
      }}
    >
      {/* Radial glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: "44rem", height: "44rem",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(26,94,84,0.18) 0%, transparent 68%)",
          filter: "blur(64px)",
        }}
      />

      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0"
        style={{
          height: "1px",
          background: "linear-gradient(90deg, transparent 0%, rgba(52,160,140,0.20) 30%, rgba(52,160,140,0.20) 70%, transparent 100%)",
        }}
      />

      <div className="max-w-5xl mx-auto px-5 sm:px-8 relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={stagger}
          className="max-w-xl mx-auto text-center"
        >
          {/* Eyebrow */}
          <motion.div variants={fadeUp} className="flex justify-center items-center gap-3 mb-8">
            <div style={{ height: "0.5px", width: "1.875rem", background: "rgba(52,160,140,0.50)" }} />
            <span style={{
              fontSize: "9.5px", fontWeight: 600,
              letterSpacing: "0.24em", textTransform: "uppercase",
              color: "rgba(52,160,140,0.70)",
            }}>
              {aboutCta.eyebrow}
            </span>
            <div style={{ height: "0.5px", width: "1.875rem", background: "rgba(52,160,140,0.50)" }} />
          </motion.div>

          {/* Heading */}
          <motion.h2
            variants={fadeUp}
            className="text-white"
            style={{
              fontSize: "clamp(1.6rem, 3.8vw, 2.4rem)",
              fontWeight: 700,
              lineHeight: 1.2,
              letterSpacing: "-0.028em",
              marginBottom: "1.25rem",
            }}
          >
            {aboutCta.heading}
          </motion.h2>

          {/* Subtext */}
          <motion.p
            variants={fadeUp}
            style={{
              fontSize: "14.5px",
              lineHeight: 1.9,
              color: "rgba(255,255,255,0.50)",
              fontWeight: 400,
              maxWidth: "30rem",
              margin: "0 auto 2.5rem",
            }}
          >
            {aboutCta.subheading}
          </motion.p>

          {/* Buttons */}
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 justify-center items-center flex-wrap">
            {/* Primary */}
            <a
              href={aboutCta.primaryButton.href}
              className="inline-flex items-center justify-center gap-2 rounded-full text-white"
              style={{
                height: "2.875rem", padding: "0 1.875rem",
                fontSize: "13px", fontWeight: 600, letterSpacing: "0.02em",
                textDecoration: "none",
                background: "linear-gradient(140deg, #22917f 0%, #1a7868 100%)",
                boxShadow: "0 4px 20px rgba(20,115,98,0.28), inset 0 1px 0 rgba(255,255,255,0.14)",
                transition: "box-shadow 0.22s ease, transform 0.22s ease",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.boxShadow = "0 6px 24px rgba(20,115,98,0.40), inset 0 1px 0 rgba(255,255,255,0.16)";
                el.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.boxShadow = "0 4px 20px rgba(20,115,98,0.28), inset 0 1px 0 rgba(255,255,255,0.14)";
                el.style.transform = "translateY(0)";
              }}
            >
              {aboutCta.primaryButton.label}
              <ArrowRight size={13} strokeWidth={2} />
            </a>

            {/* Secondary: glass */}
            <a
              href={aboutCta.videoButton.href}
              className="inline-flex items-center justify-center gap-2 rounded-full"
              style={{
                height: "2.875rem", padding: "0 1.75rem",
                fontSize: "13px", fontWeight: 500,
                color: "rgba(255,255,255,0.75)",
                textDecoration: "none",
                background: "rgba(255,255,255,0.055)",
                border: "1px solid rgba(255,255,255,0.14)",
                backdropFilter: "blur(12px)",
                transition: "background 0.22s ease, border-color 0.22s ease, color 0.22s ease",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = "rgba(255,255,255,0.085)";
                el.style.borderColor = "rgba(255,255,255,0.20)";
                el.style.color = "rgba(255,255,255,0.90)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = "rgba(255,255,255,0.055)";
                el.style.borderColor = "rgba(255,255,255,0.14)";
                el.style.color = "rgba(255,255,255,0.75)";
              }}
            >
              {aboutCta.videoButton.label}
            </a>

            {/* Ghost: text link */}
            <a
              href={aboutCta.secondaryButton.href}
              style={{
                fontSize: "12.5px",
                fontWeight: 400,
                color: "rgba(255,255,255,0.40)",
                textDecoration: "none",
                letterSpacing: "0.01em",
                transition: "color 0.2s ease",
                padding: "0 0.25rem",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.64)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.40)"; }}
            >
              {aboutCta.secondaryButton.label}
            </a>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   PAGE ASSEMBLY
───────────────────────────────────────────────────────────────────── */
export default function GioiThieu() {
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  return (
    <>
      {/* 1. Hero — who the brand/person is (portrait used once only) */}
      <GioiThieuHero />
      {/* 2. Định hướng — why this site exists / brand philosophy */}
      <DinhHuongSection />
      {/* 3. Giá trị cốt lõi — guiding principles */}
      <GioiThieuValuesSection />
      {/* 4. Cách đồng hành — how value is created and shared */}
      <ProcessSection />
      {/* 5. Dành cho ai — who this is for */}
      <GioiThieuAudienceSection />
      {/* 6. Final CTA — soft, confident close */}
      <GioiThieuCTASection />
    </>
  );
}
