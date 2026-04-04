import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.10 } },
};

const highlights = [
  "Góc nhìn dài hạn",
  "Nội dung thực chiến",
  "Ưu tiên giá trị bền vững",
];

export function AboutPersonSection() {
  return (
    <section
      id="gioi-thieu"
      className="py-28 md:py-36 bg-background"
    >
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
          className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-12 lg:gap-16 items-center"
        >

          {/* ── Right: Portrait (shown first on mobile via order) ── */}
          <motion.div
            variants={fadeUp}
            className="flex justify-center lg:order-last"
          >
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

                {/* Bottom gradient */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: "linear-gradient(to top, rgba(9,30,27,0.65) 0%, rgba(9,30,27,0.18) 35%, transparent 60%)",
                  }}
                />

                {/* Name badge — bottom */}
                <div
                  className="absolute bottom-0 left-0 right-0 px-5 pb-5"
                >
                  <p
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "rgba(255,255,255,0.88)",
                      letterSpacing: "0.01em",
                      lineHeight: 1.3,
                    }}
                  >
                    Phan Văn Thắng
                  </p>
                  <p
                    style={{
                      fontSize: "10.5px",
                      fontWeight: 400,
                      color: "rgba(255,255,255,0.46)",
                      letterSpacing: "0.04em",
                      marginTop: "2px",
                    }}
                  >
                    Mentor tài chính dài hạn
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Left: Content ── */}
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
                letterSpacing: "-0.020em",
                color: "hsl(var(--foreground))",
              }}
            >
              Về Phan Văn Thắng SWC
            </motion.h2>

            <motion.div variants={fadeUp} className="space-y-4">
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
              {highlights.map((item, i) => (
                <motion.div
                  key={item}
                  variants={fadeUp}
                  className="flex-1"
                  style={{
                    paddingRight: "1rem",
                    borderRight: i < highlights.length - 1 ? "1px solid hsl(var(--border) / 0.45)" : "none",
                    marginRight: i < highlights.length - 1 ? "1rem" : "0",
                  }}
                >
                  <div
                    style={{
                      width: "16px", height: "2px",
                      background: "hsl(var(--primary) / 0.55)",
                      marginBottom: "8px",
                    }}
                  />
                  <span style={{ fontSize: "13.5px", lineHeight: 1.55, fontWeight: 500, color: "hsl(var(--foreground) / 0.68)", display: "block" }}>
                    {item}
                  </span>
                </motion.div>
              ))}
            </motion.div>

            {/* Quote block */}
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

            {/* CTA */}
            <motion.div variants={fadeUp}>
              <a
                href="/gioi-thieu"
                className="inline-flex items-center gap-2 group/link"
                style={{
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "hsl(var(--primary))",
                  textDecoration: "none",
                }}
              >
                Tìm hiểu thêm
                <ArrowRight size={13} strokeWidth={2} className="group-hover/link:translate-x-0.5 transition-transform" />
              </a>
            </motion.div>
          </div>

        </motion.div>
      </div>
    </section>
  );
}
