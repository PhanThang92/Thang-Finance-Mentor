import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { trackCtaClick } from "@/lib/analytics";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

export function CTASection() {
  return (
    <section
      id="lien-he"
      className="relative overflow-hidden py-28 md:py-36"
      style={{ background: "linear-gradient(150deg, #0d2622 0%, #102a26 45%, #091e1b 100%)" }}
    >
      {/* Ambient glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "40rem",
          height: "40rem",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(26,94,84,0.22) 0%, transparent 68%)",
          filter: "blur(60px)",
        }}
      />

      {/* Top border accent */}
      <div
        className="absolute top-0 left-0 right-0"
        style={{
          height: "1px",
          background: "linear-gradient(90deg, transparent 0%, rgba(52,160,140,0.22) 35%, rgba(52,160,140,0.22) 65%, transparent 100%)",
        }}
      />

      <div className="max-w-4xl mx-auto px-5 sm:px-8 text-center relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
          className="space-y-8"
        >
          {/* Eyebrow */}
          <motion.div variants={fadeUp} className="flex items-center justify-center gap-3">
            <div style={{ height: "0.5px", width: "2rem", background: "rgba(52,160,140,0.50)", flexShrink: 0 }} />
            <span style={{ fontSize: "10.5px", fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(52,160,140,0.78)" }}>
              Bắt đầu hành trình
            </span>
            <div style={{ height: "0.5px", width: "2rem", background: "rgba(52,160,140,0.50)", flexShrink: 0 }} />
          </motion.div>

          {/* Heading */}
          <motion.h2
            variants={fadeUp}
            style={{
              fontSize: "clamp(1.75rem, 4.5vw, 2.8rem)",
              fontWeight: 700,
              lineHeight: 1.18,
              letterSpacing: "-0.025em",
              color: "rgba(255,255,255,0.92)",
              maxWidth: "36rem",
              margin: "0 auto",
            }}
          >
            Hiểu đúng trước. Đi đường dài sau.
          </motion.h2>

          {/* Sub text */}
          <motion.p
            variants={fadeUp}
            style={{
              fontSize: "15px",
              lineHeight: 1.92,
              fontWeight: 400,
              color: "rgba(255,255,255,0.52)",
              maxWidth: "32rem",
              margin: "0 auto",
            }}
          >
            Khám phá thêm bài viết, chủ đề kiến thức và những hướng kết nối phù hợp với hành trình của bạn.
          </motion.p>

          {/* Buttons */}
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <a
              href="/tin-tuc"
              onClick={() => trackCtaClick("Xem bài viết mới", "cta_section")}
              className="inline-flex items-center gap-2"
              style={{
                height: "2.875rem",
                padding: "0 2rem",
                borderRadius: "999px",
                fontSize: "13px",
                fontWeight: 600,
                letterSpacing: "0.015em",
                color: "#fff",
                textDecoration: "none",
                background: "linear-gradient(140deg, #22917f 0%, #1a7868 100%)",
                boxShadow: "0 3px 18px rgba(20,115,98,0.30), inset 0 1px 0 rgba(255,255,255,0.12)",
                transition: "box-shadow 0.2s ease, transform 0.2s ease",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.boxShadow = "0 5px 24px rgba(20,115,98,0.44), inset 0 1px 0 rgba(255,255,255,0.16)";
                el.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.boxShadow = "0 3px 18px rgba(20,115,98,0.30), inset 0 1px 0 rgba(255,255,255,0.12)";
                el.style.transform = "translateY(0)";
              }}
            >
              Xem bài viết mới
              <ArrowRight size={14} strokeWidth={2} />
            </a>

            <a
              href="/cong-dong"
              onClick={() => trackCtaClick("Liên hệ kết nối", "cta_section")}
              className="inline-flex items-center gap-2"
              style={{
                height: "2.875rem",
                padding: "0 1.875rem",
                borderRadius: "999px",
                fontSize: "13px",
                fontWeight: 500,
                letterSpacing: "0.01em",
                color: "rgba(255,255,255,0.78)",
                textDecoration: "none",
                background: "rgba(255,255,255,0.055)",
                border: "1px solid rgba(255,255,255,0.14)",
                backdropFilter: "blur(10px)",
                transition: "background 0.2s ease, border-color 0.2s ease, color 0.2s ease",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = "rgba(255,255,255,0.09)";
                el.style.borderColor = "rgba(255,255,255,0.22)";
                el.style.color = "rgba(255,255,255,0.92)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = "rgba(255,255,255,0.055)";
                el.style.borderColor = "rgba(255,255,255,0.14)";
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
