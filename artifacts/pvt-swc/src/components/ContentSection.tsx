import React from "react";
import { motion } from "framer-motion";
import { SiYoutube } from "react-icons/si";

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.13 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
};

const pillars = [
  {
    num: "01",
    title: "Tư duy tài chính & đầu tư",
    anchor: "Hiểu tiền đúng trước khi đi tìm cơ hội.",
    desc: "Quản lý tài chính cá nhân, tư duy tích sản, hiểu rủi ro trước lợi nhuận, đầu tư dài hạn và góc nhìn thực tế về tài sản, dòng tiền và quyền sở hữu.",
  },
  {
    num: "02",
    title: "Phát triển bản thân & sự nghiệp",
    anchor: "Xây năng lực trước khi kỳ vọng bứt phá.",
    desc: "Kỷ luật cá nhân, trách nhiệm với cuộc đời mình, tư duy nghề nghiệp, phát triển sự nghiệp theo hướng dài hạn và xây phiên bản tốt hơn của chính mình.",
  },
  {
    num: "03",
    title: "Hệ thống & cộng đồng",
    anchor: "Đi đường dài cần môi trường và người đồng hành phù hợp.",
    desc: "Hệ thống học tập, công cụ và tư duy ứng dụng, cách xây môi trường phát triển lành mạnh và cộng đồng cùng học, cùng làm, cùng trưởng thành.",
  },
];

export function ContentSection() {
  return (
    <section id="noi-dung" className="py-24 md:py-32 bg-background">
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
          className="space-y-14"
        >

          {/* ── Header ── */}
          <div className="max-w-2xl space-y-4">
            <motion.div variants={fadeUp} className="flex items-center gap-3">
              <div className="h-px w-8 bg-primary/50" />
              <span className="section-label">Nội dung</span>
            </motion.div>
            <motion.h2
              variants={fadeUp}
              className="text-foreground"
              style={{
                fontSize: "clamp(1.65rem, 3.8vw, 2.25rem)",
                fontWeight: 700,
                lineHeight: 1.2,
                letterSpacing: "-0.018em",
              }}
            >
              Nội dung tôi đang chia sẻ
            </motion.h2>
            <motion.p
              variants={fadeUp}
              style={{
                fontSize: "15px",
                lineHeight: 1.88,
                fontWeight: 400,
                color: "hsl(var(--muted-foreground))",
                maxWidth: "34rem",
              }}
            >
              Những gì tôi chia sẻ xoay quanh một mục tiêu chung: giúp anh/chị xây một nền tảng
              tốt hơn cho tài chính, công việc, tư duy và cuộc sống dài hạn.
            </motion.p>
          </div>

          {/* ── Pillar cards ── */}
          <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pillars.map(({ num, title, anchor, desc }) => (
              <motion.div
                key={num}
                variants={fadeUp}
                className="group relative flex flex-col rounded-xl bg-card transition-all duration-300"
                style={{
                  border: "1px solid hsl(var(--border) / 0.92)",
                  padding: "1.75rem 1.625rem",
                  boxShadow: "0 2px 8px rgba(10,40,35,0.07)",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = "hsl(var(--primary) / 0.28)";
                  el.style.boxShadow = "0 4px 20px rgba(10,40,35,0.09)";
                  el.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = "hsl(var(--border) / 0.92)";
                  el.style.boxShadow = "0 2px 8px rgba(10,40,35,0.07)";
                  el.style.transform = "translateY(0)";
                }}
              >
                {/* Editorial number marker */}
                <div className="flex items-center gap-3 mb-5">
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      letterSpacing: "0.13em",
                      color: "hsl(var(--primary) / 0.72)",
                      lineHeight: 1,
                    }}
                  >
                    {num}
                  </span>
                  <div
                    style={{
                      flexGrow: 1,
                      maxWidth: "2rem",
                      height: "1px",
                      background: "hsl(var(--primary) / 0.28)",
                    }}
                  />
                </div>

                {/* Title */}
                <h3
                  className="text-foreground mb-2"
                  style={{
                    fontSize: "16.5px",
                    fontWeight: 700,
                    lineHeight: 1.3,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {title}
                </h3>

                {/* Anchor line */}
                <p
                  className="mb-4"
                  style={{
                    fontSize: "12.5px",
                    fontWeight: 500,
                    fontStyle: "italic",
                    color: "hsl(var(--primary) / 0.82)",
                    lineHeight: 1.55,
                    letterSpacing: "0.005em",
                  }}
                >
                  {anchor}
                </p>

                {/* Body */}
                <p
                  style={{
                    fontSize: "13.5px",
                    lineHeight: 1.86,
                    fontWeight: 400,
                    color: "hsl(var(--muted-foreground))",
                  }}
                >
                  {desc}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* ── CTA ── */}
          <motion.div variants={fadeUp} className="pt-2">
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 rounded-full transition-all duration-200"
              style={{
                height: "2.625rem",
                padding: "0 1.75rem",
                fontSize: "13px",
                fontWeight: 500,
                letterSpacing: "0.015em",
                color: "hsl(var(--primary))",
                border: "1px solid hsl(var(--primary) / 0.45)",
                background: "transparent",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = "hsl(var(--primary) / 0.06)";
                el.style.borderColor = "hsl(var(--primary) / 0.60)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = "transparent";
                el.style.borderColor = "hsl(var(--primary) / 0.40)";
              }}
              data-testid="btn-youtube"
            >
              <SiYoutube size={14} style={{ color: "#e05050", flexShrink: 0 }} />
              Khám phá playlist YouTube
            </a>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}
