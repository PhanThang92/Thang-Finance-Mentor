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
        background: "linear-gradient(152deg, #0d2622 0%, #0e2924 50%, #091c18 100%)",
        paddingTop:    "clamp(6rem, 15vw, 9.5rem)",
        paddingBottom: "clamp(5rem, 12vw, 8rem)",
      }}
    >
      <BackgroundDecor />

      {/* Subtle vignette at bottom edge */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{ height: "120px", background: "linear-gradient(to bottom, transparent, rgba(9,28,24,0.55))" }}
      />

      <div className="max-w-5xl mx-auto px-5 sm:px-8 relative z-10">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="grid grid-cols-1 lg:grid-cols-[1fr_272px] gap-10 lg:gap-16 items-center"
        >

          {/* ── Text column ── */}
          <div>
            {/* Eyebrow */}
            <motion.div variants={fadeUp} className="flex items-center gap-3 mb-8">
              <div style={{ width: "1.875rem", height: "0.5px", background: "rgba(200,158,76,0.60)", flexShrink: 0 }} />
              <span style={{
                fontSize: "9.5px", fontWeight: 600, letterSpacing: "0.26em",
                textTransform: "uppercase", color: "rgba(200,158,76,0.76)",
              }}>
                {aboutHero.eyebrow}
              </span>
            </motion.div>

            {/* H1 */}
            <motion.h1
              variants={fadeUp}
              className="text-white"
              style={{
                fontSize: "clamp(2.1rem, 5.2vw, 3.4rem)",
                fontWeight: 700,
                lineHeight: 1.12,
                letterSpacing: "-0.036em",
                marginBottom: "1.625rem",
              }}
            >
              {aboutHero.heading}
            </motion.h1>

            {/* Primary subheading */}
            <motion.p
              variants={fadeUp}
              style={{
                fontSize: "16.5px",
                fontWeight: 400,
                color: "rgba(255,255,255,0.66)",
                lineHeight: 1.78,
                maxWidth: "32rem",
                marginBottom: "1rem",
              }}
            >
              {aboutHero.subheading}
            </motion.p>

            {/* Supporting text — quieter */}
            <motion.p
              variants={fadeUp}
              style={{
                fontSize: "13.5px",
                fontWeight: 400,
                color: "rgba(255,255,255,0.38)",
                lineHeight: 1.9,
                maxWidth: "28rem",
                marginBottom: "2.25rem",
              }}
            >
              {aboutHero.supportingText}
            </motion.p>

            {/* CTA */}
            <motion.div variants={fadeUp} className="flex items-center gap-4 flex-wrap">
              <a
                href="/tin-tuc"
                className="inline-flex items-center gap-2 rounded-full text-white"
                style={{
                  height: "2.875rem",
                  padding: "0 1.875rem",
                  fontSize: "13px",
                  fontWeight: 600,
                  letterSpacing: "0.025em",
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
                Khám phá bài viết
                <ArrowRight size={13} strokeWidth={2} />
              </a>

              <a
                href="/gioi-thieu#dinh-huong"
                style={{
                  fontSize: "12.5px",
                  fontWeight: 400,
                  color: "rgba(255,255,255,0.44)",
                  textDecoration: "none",
                  letterSpacing: "0.01em",
                  transition: "color 0.2s ease",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.68)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.44)"; }}
              >
                Tìm hiểu định hướng
              </a>
            </motion.div>

            {/* Trust bar */}
            <motion.div
              variants={fadeUp}
              className="flex items-center gap-5 mt-8 flex-wrap"
            >
              {[
                { n: "7+", label: "năm đầu tư dài hạn" },
                { n: "5+", label: "năm công nghệ" },
              ].map((s, i) => (
                <React.Fragment key={s.label}>
                  {i > 0 && (
                    <div style={{ width: "1px", height: "24px", background: "rgba(255,255,255,0.10)", flexShrink: 0 }} />
                  )}
                  <div className="flex items-baseline gap-1.5">
                    <span style={{ fontSize: "15px", fontWeight: 600, color: "rgba(255,255,255,0.68)", letterSpacing: "-0.02em" }}>
                      {s.n}
                    </span>
                    <span style={{ fontSize: "11px", fontWeight: 400, color: "rgba(255,255,255,0.32)", letterSpacing: "0.04em" }}>
                      {s.label}
                    </span>
                  </div>
                </React.Fragment>
              ))}
            </motion.div>
          </div>

          {/* ── Portrait — single use ── */}
          <motion.div
            variants={fadeUp}
            className="flex justify-center lg:justify-end"
          >
            <div style={{ width: "100%", maxWidth: "260px" }}>
              <div
                className="relative overflow-hidden w-full"
                style={{
                  borderRadius: "1.75rem",
                  aspectRatio: "4/5",
                  border: "1px solid rgba(255,255,255,0.07)",
                  boxShadow: "0 24px 72px rgba(0,0,0,0.38), 0 4px 16px rgba(0,0,0,0.18)",
                }}
              >
                <img
                  src="/portrait.png"
                  alt="Phan Văn Thắng SWC"
                  style={{
                    width: "100%", height: "100%",
                    objectFit: "cover",
                    objectPosition: "60% 10%",
                    filter: "brightness(1.08) contrast(1.05) saturate(0.93)",
                    display: "block",
                  }}
                />

                {/* Gradient overlays */}
                <div className="absolute inset-0 pointer-events-none" style={{
                  background: "linear-gradient(to top, rgba(9,28,24,0.82) 0%, rgba(9,28,24,0.20) 38%, transparent 58%)",
                }} />
                <div className="absolute inset-0 pointer-events-none" style={{
                  background: "linear-gradient(to right, rgba(13,38,34,0.28) 0%, transparent 48%)",
                }} />

                {/* Name badge */}
                <div className="absolute bottom-0 left-0 right-0 px-5 pb-5">
                  <div style={{ height: "0.5px", background: "rgba(255,255,255,0.09)", marginBottom: "12px" }} />
                  <p style={{
                    fontSize: "12.5px", fontWeight: 600,
                    color: "rgba(255,255,255,0.86)", letterSpacing: "0.01em", lineHeight: 1.3,
                  }}>
                    Phan Văn Thắng
                  </p>
                  <p style={{
                    fontSize: "10px", fontWeight: 400,
                    color: "rgba(255,255,255,0.40)", letterSpacing: "0.06em", marginTop: "3px",
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
