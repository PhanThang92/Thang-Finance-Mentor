import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { BackgroundDecor } from "@/components/BackgroundDecor";
import { ProcessSection } from "@/components/ProcessSection";
import {
  aboutHero,
  aboutMain,
  coreValues,
  audienceSection,
  aboutCta,
} from "@/content/aboutPageData";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.10 } },
};

/* ── A. Page Hero ────────────────────────────────────────── */
function GioiThieuHero() {
  return (
    <section
      className="relative overflow-hidden"
      style={{
        background: "linear-gradient(150deg, #0d2622 0%, #102a26 45%, #091e1b 100%)",
        paddingTop: "clamp(5.5rem, 14vw, 9rem)",
        paddingBottom: "clamp(4rem, 10vw, 7rem)",
      }}
    >
      <BackgroundDecor />
      <div className="max-w-5xl mx-auto px-5 sm:px-8 relative z-10">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-12 items-center"
        >
          {/* ── Text ── */}
          <div className="space-y-6">
            <motion.div variants={fadeUp} className="flex items-center gap-2.5">
              <div style={{ width: "1.75rem", height: "0.5px", background: "rgba(200,158,76,0.65)", flexShrink: 0 }} />
              <span style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(200,158,76,0.78)" }}>
                Giới thiệu
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-white"
              style={{
                fontSize: "clamp(2rem, 5vw, 3.25rem)",
                fontWeight: 700,
                lineHeight: 1.13,
                letterSpacing: "-0.032em",
              }}
            >
              Phan Văn Thắng SWC
            </motion.h1>

            <motion.p
              variants={fadeUp}
              style={{
                fontSize: "17px",
                fontWeight: 400,
                color: "rgba(255,255,255,0.68)",
                lineHeight: 1.75,
                maxWidth: "34rem",
              }}
            >
              Chia sẻ kiến thức tài chính, đầu tư và tư duy tích sản theo hướng thực tế, kỷ luật và dài hạn.
            </motion.p>

            <motion.p
              variants={fadeUp}
              style={{
                fontSize: "14px",
                fontWeight: 400,
                color: "rgba(255,255,255,0.42)",
                lineHeight: 1.9,
                maxWidth: "30rem",
              }}
            >
              Không theo đuổi những lời hứa ngắn hạn. Ưu tiên sự rõ ràng, nền tảng vững và hành trình đi đường dài.
            </motion.p>
          </div>

          {/* ── Portrait ── */}
          <motion.div
            variants={fadeUp}
            className="flex justify-center lg:justify-end"
          >
            <div style={{ width: "100%", maxWidth: "240px" }}>
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

/* ── B. Full About Section ───────────────────────────────── */
function GioiThieuAboutSection() {
  return (
    <section className="py-28 md:py-36 bg-background">
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
          className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-12 lg:gap-16 items-start"
        >
          {/* ── Content ── */}
          <div className="space-y-6">
            <motion.div variants={fadeUp} className="flex items-center gap-3">
              <div className="h-px w-8 bg-primary/50" />
              <span className="section-label">Về Phan Văn Thắng SWC</span>
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
              Về Phan Văn Thắng SWC
            </motion.h2>

            <motion.div variants={fadeUp}>
              <p style={{ fontSize: "15px", lineHeight: 1.92, fontWeight: 400, color: "hsl(var(--foreground) / 0.72)" }}>
                Phan Văn Thắng SWC theo đuổi hướng chia sẻ kiến thức tài chính, đầu tư và tư duy tích sản theo cách thực tế, kỷ luật và dài hạn. Mục tiêu không phải tạo cảm giác làm giàu nhanh, mà là giúp người đọc có góc nhìn rõ hơn để xây nền tảng tài chính bền vững theo thời gian.
              </p>
            </motion.div>

            {/* Highlights */}
            <motion.div
              variants={stagger}
              className="flex gap-0"
              style={{
                borderTop: "1px solid hsl(var(--border) / 0.55)",
                borderBottom: "1px solid hsl(var(--border) / 0.55)",
                paddingTop: "1.125rem",
                paddingBottom: "1.125rem",
              }}
            >
              {aboutMain.highlights.map((item, i) => (
                <motion.div
                  key={item}
                  variants={fadeUp}
                  className="flex-1"
                  style={{
                    paddingRight: "1rem",
                    borderRight: i < aboutMain.highlights.length - 1 ? "1px solid hsl(var(--border) / 0.45)" : "none",
                    marginRight: i < aboutMain.highlights.length - 1 ? "1rem" : "0",
                  }}
                >
                  <div style={{ width: "16px", height: "2px", background: "hsl(var(--primary) / 0.55)", marginBottom: "8px" }} />
                  <span style={{ fontSize: "13.5px", lineHeight: 1.55, fontWeight: 500, color: "hsl(var(--foreground) / 0.68)", display: "block" }}>
                    {item}
                  </span>
                </motion.div>
              ))}
            </motion.div>

            {/* Quote */}
            <motion.div
              variants={fadeUp}
              className="pl-4"
              style={{ borderLeft: "1.5px solid hsl(var(--primary) / 0.28)" }}
            >
              <p style={{
                fontSize: "14.5px",
                lineHeight: 1.84,
                fontWeight: 400,
                fontStyle: "italic",
                color: "hsl(var(--foreground) / 0.60)",
              }}>
                Đi đường dài trong tài chính luôn bắt đầu từ việc hiểu đúng.
              </p>
            </motion.div>
          </div>

          {/* ── Portrait ── */}
          <motion.div variants={fadeUp} className="flex justify-center lg:justify-start">
            <div style={{ width: "100%", maxWidth: "320px" }}>
              <div
                className="relative overflow-hidden"
                style={{
                  borderRadius: "1.25rem",
                  aspectRatio: "4/5",
                  border: "1px solid hsl(var(--border) / 0.65)",
                  boxShadow: "0 8px 40px rgba(10,40,35,0.14), 0 1px 4px rgba(10,40,35,0.06)",
                }}
              >
                <img
                  src="/portrait.png"
                  alt="Phan Văn Thắng SWC"
                  style={{
                    width: "100%", height: "100%",
                    objectFit: "cover",
                    objectPosition: "60% 8%",
                    filter: "brightness(1.06) contrast(1.04) saturate(0.94)",
                    display: "block",
                  }}
                />
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: "linear-gradient(to top, rgba(9,30,27,0.65) 0%, rgba(9,30,27,0.18) 35%, transparent 60%)" }}
                />
                <div className="absolute bottom-0 left-0 right-0 px-5 pb-5">
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.88)", letterSpacing: "0.01em", lineHeight: 1.3 }}>
                    Phan Văn Thắng
                  </p>
                  <p style={{ fontSize: "10.5px", fontWeight: 400, color: "rgba(255,255,255,0.46)", letterSpacing: "0.04em", marginTop: "2px" }}>
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

/* ── C. Core Values Section ──────────────────────────────── */
function GioiThieuValuesSection() {
  return (
    <section
      className="py-28 md:py-36"
      style={{ background: "hsl(var(--card))" }}
    >
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
          className="space-y-16"
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
                    width: "48px",
                    height: "48px",
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

/* ── E. "Dành cho ai" Section ────────────────────────────── */
function GioiThieuAudienceSection() {
  return (
    <section
      className="py-28 md:py-36"
      style={{ background: "linear-gradient(180deg, #0f2823 0%, #0a1f1c 100%)" }}
    >
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
              <div style={{ height: "0.5px", width: "2rem", background: "rgba(52,160,140,0.55)", flexShrink: 0 }} />
              <span style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.20em", textTransform: "uppercase", color: "rgba(52,160,140,0.72)" }}>
                Dành cho ai
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
              Phù hợp với những người đang muốn xây nền tài chính vững hơn
            </motion.h2>
          </div>

          <motion.div
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {audienceSection.items.map((item) => (
              <motion.div
                key={item}
                variants={fadeUp}
                className="flex items-start gap-4 rounded-xl"
                style={{
                  padding: "1.5rem 1.75rem",
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
                    width: "24px",
                    height: "24px",
                    background: "rgba(52,160,140,0.16)",
                    border: "1px solid rgba(52,160,140,0.28)",
                    marginTop: "1px",
                  }}
                >
                  <Check size={12} strokeWidth={2.5} style={{ color: "rgba(52,160,140,0.90)" }} />
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

/* ── F. Final CTA ────────────────────────────────────────── */
function GioiThieuCTASection() {
  return (
    <section
      className="relative overflow-hidden py-28 md:py-36"
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
              Bắt đầu
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
            Bắt đầu từ việc hiểu đúng, rồi đi đường dài
          </motion.h2>

          <motion.p
            variants={fadeUp}
            style={{
              fontSize: "15px",
              lineHeight: 1.88,
              color: "rgba(255,255,255,0.56)",
              fontWeight: 400,
            }}
          >
            Khám phá thêm bài viết, chủ đề nội dung và những hướng kết nối phù hợp với hành trình của bạn.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="/tin-tuc"
              className="inline-flex items-center justify-center gap-2 rounded-full text-white"
              style={{
                height: "3rem",
                padding: "0 2rem",
                fontSize: "13.5px",
                fontWeight: 600,
                letterSpacing: "0.02em",
                background: "linear-gradient(140deg, #22917f 0%, #1a7868 100%)",
                boxShadow: "0 4px 20px rgba(20,115,98,0.30), inset 0 1px 0 rgba(255,255,255,0.14)",
                textDecoration: "none",
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
              Xem bài viết
              <ArrowRight size={14} strokeWidth={2} />
            </a>

            <a
              href="/#lien-he"
              className="inline-flex items-center justify-center gap-2 rounded-full"
              style={{
                height: "3rem",
                padding: "0 2rem",
                fontSize: "13.5px",
                fontWeight: 450,
                color: "rgba(255,255,255,0.78)",
                background: "rgba(255,255,255,0.058)",
                border: "1px solid rgba(255,255,255,0.16)",
                backdropFilter: "blur(12px)",
                textDecoration: "none",
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
              Liên hệ kết nối
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ── Page ────────────────────────────────────────────────── */
export default function GioiThieu() {
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  return (
    <>
      <GioiThieuHero />
      <GioiThieuAboutSection />
      <GioiThieuValuesSection />
      <ProcessSection />
      <GioiThieuAudienceSection />
      <GioiThieuCTASection />
    </>
  );
}
