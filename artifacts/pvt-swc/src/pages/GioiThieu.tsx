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
  hidden:   { opacity: 0, y: 18 },
  visible:  { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = {
  hidden:   {},
  visible:  { transition: { staggerChildren: 0.10 } },
};

/* ── A. Page Hero ─────────────────────────────────────────────────── */
function GioiThieuHero() {
  return (
    <section
      className="relative overflow-hidden"
      style={{
        background: "linear-gradient(150deg, #0d2622 0%, #102a26 45%, #091e1b 100%)",
        paddingTop:    "clamp(5.5rem, 14vw, 9rem)",
        paddingBottom: "clamp(4rem, 10vw, 7rem)",
      }}
    >
      <BackgroundDecor />
      <div className="max-w-5xl mx-auto px-5 sm:px-8 relative z-10">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-12 items-center"
        >

          {/* ── Text ── */}
          <div className="space-y-6">
            <motion.div variants={fadeUp} className="flex items-center gap-2.5">
              <div style={{ width: "1.75rem", height: "0.5px", background: "rgba(200,158,76,0.65)", flexShrink: 0 }} />
              <span style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(200,158,76,0.78)" }}>
                {aboutHero.eyebrow}
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-white"
              style={{ fontSize: "clamp(2rem, 5vw, 3.25rem)", fontWeight: 700, lineHeight: 1.13, letterSpacing: "-0.032em" }}
            >
              {aboutHero.heading}
            </motion.h1>

            <motion.p
              variants={fadeUp}
              style={{ fontSize: "17px", fontWeight: 400, color: "rgba(255,255,255,0.68)", lineHeight: 1.75, maxWidth: "34rem" }}
            >
              {aboutHero.subheading}
            </motion.p>

            <motion.p
              variants={fadeUp}
              style={{ fontSize: "14px", fontWeight: 400, color: "rgba(255,255,255,0.42)", lineHeight: 1.9, maxWidth: "30rem" }}
            >
              {aboutHero.supportingText}
            </motion.p>

            <motion.div variants={fadeUp}>
              <a
                href="/tin-tuc"
                className="inline-flex items-center gap-2 rounded-full text-white"
                style={{
                  height: "2.875rem",
                  padding: "0 1.875rem",
                  fontSize: "13px",
                  fontWeight: 600,
                  letterSpacing: "0.02em",
                  textDecoration: "none",
                  background: "linear-gradient(140deg, #22917f 0%, #1a7868 100%)",
                  boxShadow: "0 4px 20px rgba(20,115,98,0.30), inset 0 1px 0 rgba(255,255,255,0.14)",
                  transition: "box-shadow 0.22s ease, transform 0.22s ease",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.boxShadow = "0 5px 22px rgba(20,115,98,0.40), inset 0 1px 0 rgba(255,255,255,0.16)";
                  el.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.boxShadow = "0 4px 20px rgba(20,115,98,0.30), inset 0 1px 0 rgba(255,255,255,0.14)";
                  el.style.transform = "translateY(0)";
                }}
              >
                Khám phá bài viết
                <ArrowRight size={13} strokeWidth={2} />
              </a>
            </motion.div>
          </div>

          {/* ── Portrait — single use, hero only ── */}
          <motion.div variants={fadeUp} className="flex justify-center lg:justify-end">
            <div style={{ width: "100%", maxWidth: "230px" }}>
              <div
                className="relative overflow-hidden w-full"
                style={{ borderRadius: "1.5rem", aspectRatio: "4/5" }}
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
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: "linear-gradient(to top, rgba(9,30,27,0.75) 0%, rgba(9,30,27,0.18) 32%, transparent 55%)" }}
                />
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: "linear-gradient(to right, rgba(13,38,34,0.30) 0%, transparent 50%)" }}
                />
              </div>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}

/* ── B. Định hướng — brand direction / why this site exists ─────── */
function DinhHuongSection() {
  return (
    <section className="py-24 md:py-32 bg-background">
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
          className="grid grid-cols-1 lg:grid-cols-[1fr_288px] gap-14 lg:gap-16 items-start"
        >

          {/* ── Left: editorial text ── */}
          <div className="space-y-7">
            <motion.div variants={fadeUp} className="flex items-center gap-3">
              <div className="h-px w-8 bg-primary/50" />
              <span className="section-label">{dinhHuong.eyebrow}</span>
            </motion.div>

            <motion.h2
              variants={fadeUp}
              style={{
                fontSize: "clamp(1.5rem, 3.4vw, 2.1rem)",
                fontWeight: 700,
                lineHeight: 1.22,
                letterSpacing: "-0.022em",
                color: "hsl(var(--foreground))",
                maxWidth: "30rem",
              }}
            >
              {dinhHuong.heading}
            </motion.h2>

            <motion.div variants={fadeUp} className="space-y-4 max-w-[34rem]">
              <p style={{ fontSize: "15px", lineHeight: 1.92, fontWeight: 400, color: "hsl(var(--foreground) / 0.68)" }}>
                {dinhHuong.para1}
              </p>
              <p style={{ fontSize: "15px", lineHeight: 1.92, fontWeight: 400, color: "hsl(var(--foreground) / 0.68)" }}>
                {dinhHuong.para2}
              </p>
            </motion.div>

            {/* Quote block */}
            <motion.div
              variants={fadeUp}
              className="pl-4 max-w-[32rem]"
              style={{ borderLeft: "1.5px solid hsl(var(--primary) / 0.28)" }}
            >
              <p style={{
                fontSize: "14.5px",
                lineHeight: 1.84,
                fontWeight: 400,
                fontStyle: "italic",
                color: "hsl(var(--foreground) / 0.56)",
              }}>
                Đi đường dài trong tài chính luôn bắt đầu từ việc hiểu đúng.
              </p>
            </motion.div>
          </div>

          {/* ── Right: principle cards — no portrait ── */}
          <motion.div variants={stagger} className="flex flex-col gap-3 lg:pt-16">
            {dinhHuong.principles.map(({ title, desc }) => (
              <motion.div
                key={title}
                variants={fadeUp}
                className="rounded-xl"
                style={{
                  padding: "1.25rem 1.5rem",
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border) / 0.55)",
                  borderTop: "2px solid hsl(var(--primary) / 0.22)",
                  boxShadow: "0 1px 4px rgba(10,40,35,0.05)",
                }}
              >
                <p style={{
                  fontSize: "13.5px",
                  fontWeight: 600,
                  letterSpacing: "-0.006em",
                  color: "hsl(var(--foreground) / 0.90)",
                  lineHeight: 1.35,
                  marginBottom: "6px",
                }}>
                  {title}
                </p>
                <p style={{
                  fontSize: "12.5px",
                  lineHeight: 1.72,
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

/* ── C. Core Values ───────────────────────────────────────────────── */
function GioiThieuValuesSection() {
  return (
    <section className="py-24 md:py-32" style={{ background: "hsl(var(--card))" }}>
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
          className="space-y-14"
        >
          <div className="max-w-2xl space-y-4">
            <motion.div variants={fadeUp} className="flex items-center gap-3">
              <div className="h-px w-8 bg-primary/50" />
              <span className="section-label">Giá trị cốt lõi</span>
            </motion.div>
            <motion.h2
              variants={fadeUp}
              style={{
                fontSize: "clamp(1.5rem, 3.4vw, 2.1rem)",
                fontWeight: 700,
                lineHeight: 1.22,
                letterSpacing: "-0.022em",
                color: "hsl(var(--foreground))",
              }}
            >
              Những nguyên tắc tôi ưu tiên khi xây nội dung và đồng hành
            </motion.h2>
          </div>

          <motion.div
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {coreValues.map(({ icon, title, desc }) => (
              <motion.div
                key={title}
                variants={fadeUp}
                className="flex flex-col rounded-xl bg-background p-7"
                style={{
                  border: "1px solid hsl(var(--border) / 0.55)",
                  boxShadow: "0 2px 8px rgba(10,40,35,0.06), 0 1px 2px rgba(10,40,35,0.04)",
                  transition: "border-color 0.26s ease, box-shadow 0.26s ease, transform 0.26s ease",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = "hsl(var(--primary) / 0.28)";
                  el.style.boxShadow = "0 6px 22px rgba(10,40,35,0.10), 0 2px 4px rgba(10,40,35,0.05)";
                  el.style.transform = "translateY(-3px)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = "hsl(var(--border) / 0.55)";
                  el.style.boxShadow = "0 2px 8px rgba(10,40,35,0.06), 0 1px 2px rgba(10,40,35,0.04)";
                  el.style.transform = "translateY(0)";
                }}
              >
                <div
                  className="mb-5 flex items-center justify-center rounded-lg"
                  style={{
                    width: "48px", height: "48px",
                    background: "hsl(var(--primary) / 0.07)",
                    border: "1px solid hsl(var(--primary) / 0.13)",
                    flexShrink: 0,
                  }}
                >
                  {icon}
                </div>
                <p className="mb-2.5" style={{ fontSize: "14.5px", fontWeight: 600, letterSpacing: "-0.008em", color: "hsl(var(--foreground))", lineHeight: 1.3 }}>
                  {title}
                </p>
                <p style={{ fontSize: "13px", lineHeight: 1.8, fontWeight: 400, color: "hsl(var(--muted-foreground))" }}>
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

/* ── E. "Dành cho ai" ─────────────────────────────────────────────── */
function GioiThieuAudienceSection() {
  return (
    <section
      className="py-24 md:py-32"
      style={{ background: "linear-gradient(180deg, #0f2823 0%, #0a1f1c 100%)" }}
    >
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
          className="space-y-12"
        >
          <div className="max-w-2xl space-y-4">
            <motion.div variants={fadeUp} className="flex items-center gap-3">
              <div style={{ height: "0.5px", width: "2rem", background: "rgba(52,160,140,0.55)", flexShrink: 0 }} />
              <span style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.20em", textTransform: "uppercase", color: "rgba(52,160,140,0.72)" }}>
                {audienceSection.eyebrow}
              </span>
            </motion.div>
            <motion.h2
              variants={fadeUp}
              style={{
                fontSize: "clamp(1.5rem, 3.4vw, 2.1rem)",
                fontWeight: 700,
                lineHeight: 1.22,
                letterSpacing: "-0.022em",
                color: "rgba(255,255,255,0.92)",
              }}
            >
              {audienceSection.heading}
            </motion.h2>
          </div>

          <motion.div variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {audienceSection.items.map((item) => (
              <motion.div
                key={item}
                variants={fadeUp}
                className="flex items-start gap-4 rounded-xl"
                style={{
                  padding: "1.375rem 1.625rem",
                  background: "rgba(255,255,255,0.042)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  transition: "background 0.26s ease, border-color 0.26s ease",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = "rgba(52,160,140,0.09)";
                  el.style.borderColor = "rgba(52,160,140,0.22)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = "rgba(255,255,255,0.042)";
                  el.style.borderColor = "rgba(255,255,255,0.08)";
                }}
              >
                <div
                  className="flex items-center justify-center rounded-full flex-shrink-0"
                  style={{
                    width: "22px", height: "22px",
                    background: "rgba(52,160,140,0.16)",
                    border: "1px solid rgba(52,160,140,0.28)",
                    marginTop: "2px",
                  }}
                >
                  <Check size={11} strokeWidth={2.5} style={{ color: "rgba(52,160,140,0.90)" }} />
                </div>
                <p style={{ fontSize: "14.5px", lineHeight: 1.72, fontWeight: 400, color: "rgba(255,255,255,0.72)" }}>
                  {item}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ── F. Final CTA ─────────────────────────────────────────────────── */
function GioiThieuCTASection() {
  return (
    <section
      className="relative overflow-hidden py-24 md:py-32"
      style={{ background: "linear-gradient(150deg, #0d2622 0%, #102a26 45%, #091e1b 100%)" }}
    >
      <div
        className="absolute pointer-events-none"
        style={{
          top: "50%", left: "50%",
          transform: "translate(-50%,-50%)",
          width: "40rem", height: "40rem",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(26,94,84,0.22) 0%, transparent 68%)",
          filter: "blur(60px)",
        }}
      />
      <div
        className="absolute top-0 left-0 right-0"
        style={{
          height: "1px",
          background: "linear-gradient(90deg, transparent 0%, rgba(52,160,140,0.22) 35%, rgba(52,160,140,0.22) 65%, transparent 100%)",
        }}
      />

      <div className="max-w-5xl mx-auto px-5 sm:px-8 relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
          className="max-w-2xl mx-auto text-center space-y-8"
        >
          <motion.div variants={fadeUp} className="flex justify-center items-center gap-3">
            <div style={{ height: "0.5px", width: "2rem", background: "rgba(52,160,140,0.55)" }} />
            <span style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.20em", textTransform: "uppercase", color: "rgba(52,160,140,0.72)" }}>
              {aboutCta.eyebrow}
            </span>
            <div style={{ height: "0.5px", width: "2rem", background: "rgba(52,160,140,0.55)" }} />
          </motion.div>

          <motion.h2
            variants={fadeUp}
            className="text-white"
            style={{
              fontSize: "clamp(1.65rem, 4vw, 2.5rem)",
              fontWeight: 700,
              lineHeight: 1.18,
              letterSpacing: "-0.028em",
            }}
          >
            {aboutCta.heading}
          </motion.h2>

          <motion.p
            variants={fadeUp}
            style={{ fontSize: "15px", lineHeight: 1.88, color: "rgba(255,255,255,0.56)", fontWeight: 400 }}
          >
            {aboutCta.subheading}
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 justify-center flex-wrap">
            {/* Primary: bài viết */}
            <a
              href={aboutCta.primaryButton.href}
              className="inline-flex items-center justify-center gap-2 rounded-full text-white"
              style={{
                height: "3rem", padding: "0 1.875rem",
                fontSize: "13.5px", fontWeight: 600, letterSpacing: "0.02em",
                textDecoration: "none",
                background: "linear-gradient(140deg, #22917f 0%, #1a7868 100%)",
                boxShadow: "0 4px 20px rgba(20,115,98,0.30), inset 0 1px 0 rgba(255,255,255,0.14)",
                transition: "box-shadow 0.22s ease, transform 0.22s ease",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.boxShadow = "0 5px 22px rgba(20,115,98,0.40), inset 0 1px 0 rgba(255,255,255,0.16)";
                el.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.boxShadow = "0 4px 20px rgba(20,115,98,0.30), inset 0 1px 0 rgba(255,255,255,0.14)";
                el.style.transform = "translateY(0)";
              }}
            >
              {aboutCta.primaryButton.label}
              <ArrowRight size={14} strokeWidth={2} />
            </a>

            {/* Secondary: video */}
            <a
              href={aboutCta.videoButton.href}
              className="inline-flex items-center justify-center gap-2 rounded-full"
              style={{
                height: "3rem", padding: "0 1.875rem",
                fontSize: "13.5px", fontWeight: 450,
                color: "rgba(255,255,255,0.78)",
                textDecoration: "none",
                background: "rgba(255,255,255,0.058)",
                border: "1px solid rgba(255,255,255,0.16)",
                backdropFilter: "blur(12px)",
                transition: "background 0.22s ease, border-color 0.22s ease, color 0.22s ease",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = "rgba(255,255,255,0.085)";
                el.style.borderColor = "rgba(255,255,255,0.22)";
                el.style.color = "rgba(255,255,255,0.90)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = "rgba(255,255,255,0.058)";
                el.style.borderColor = "rgba(255,255,255,0.16)";
                el.style.color = "rgba(255,255,255,0.78)";
              }}
            >
              {aboutCta.videoButton.label}
            </a>

            {/* Ghost: liên hệ */}
            <a
              href={aboutCta.secondaryButton.href}
              className="inline-flex items-center justify-center gap-2 rounded-full"
              style={{
                height: "3rem", padding: "0 1.875rem",
                fontSize: "13.5px", fontWeight: 400,
                color: "rgba(255,255,255,0.52)",
                textDecoration: "none",
                transition: "color 0.22s ease",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.78)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.52)"; }}
            >
              {aboutCta.secondaryButton.label}
            </a>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}

/* ── Page assembly ────────────────────────────────────────────────── */
export default function GioiThieu() {
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  return (
    <>
      {/* 1. Hero — who the brand/person is */}
      <GioiThieuHero />
      {/* 2. Định hướng — why this site exists, philosophy */}
      <DinhHuongSection />
      {/* 3. Giá trị cốt lõi — guiding principles */}
      <GioiThieuValuesSection />
      {/* 4. Cách đồng hành — how value is created */}
      <ProcessSection />
      {/* 5. Dành cho ai — who this is for */}
      <GioiThieuAudienceSection />
      {/* 6. Final CTA */}
      <GioiThieuCTASection />
    </>
  );
}
