import React from "react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.10 } },
};

const values = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
        <path d="M11 2L13.5 8H20L14.75 12L16.75 18L11 14.25L5.25 18L7.25 12L2 8H8.5L11 2Z"
          stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    ),
    title: "Tư duy tài chính đúng",
    desc: "Không phải mẹo làm giàu nhanh — mà là cách hiểu tiền, rủi ro và cơ hội theo chiều sâu thực sự.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
        <path d="M3 17L8 11L12 14L17 7L20 9" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="20" cy="9" r="1.5" fill="hsl(var(--primary))" />
      </svg>
    ),
    title: "Đầu tư dài hạn thực chiến",
    desc: "Góc nhìn từ người đã đi qua thị trường nhiều năm, chia sẻ thực tế chứ không lý thuyết suông.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
        <rect x="3" y="14" width="3" height="5" rx="1" stroke="hsl(var(--primary))" strokeWidth="1.5" />
        <rect x="9.5" y="10" width="3" height="9" rx="1" stroke="hsl(var(--primary))" strokeWidth="1.5" />
        <rect x="16" y="6" width="3" height="13" rx="1" stroke="hsl(var(--primary))" strokeWidth="1.5" />
      </svg>
    ),
    title: "Kỷ luật tích sản",
    desc: "Tài sản được xây bằng thói quen đúng mỗi ngày, không phải bằng một quyết định hưng phấn nhất thời.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
        <circle cx="11" cy="11" r="8.5" stroke="hsl(var(--primary))" strokeWidth="1.5" />
        <path d="M11 7V11L14 13" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Đồng hành bằng hệ thống",
    desc: "Không chỉ chia sẻ kiến thức — mà là xây một hệ sinh thái nội dung đủ để người đọc đi xa và đi lâu.",
  },
];

export function ValueCoreSection() {
  return (
    <section
      id="gia-tri"
      className="py-24 md:py-32"
      style={{ background: "hsl(var(--card))" }}
    >
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
              <span className="section-label">Về nội dung</span>
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
              Một hệ sinh thái nội dung dành cho người muốn xây nền tài chính vững chắc
            </motion.h2>
            <motion.p
              variants={fadeUp}
              style={{
                fontSize: "15px",
                lineHeight: 1.88,
                fontWeight: 400,
                color: "hsl(var(--muted-foreground))",
                maxWidth: "38rem",
              }}
            >
              Website tập trung vào chia sẻ góc nhìn, kinh nghiệm và hệ thống kiến thức giúp người đọc
              hiểu đúng hơn về tài chính, đầu tư và quá trình xây tài sản dài hạn.
            </motion.p>
          </div>

          {/* ── Value cards ── */}
          <motion.div
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {values.map(({ icon, title, desc }) => (
              <motion.div
                key={title}
                variants={fadeUp}
                className="flex flex-col rounded-xl bg-background p-6"
                style={{
                  border: "1px solid hsl(var(--border) / 0.70)",
                  boxShadow: "0 1px 4px rgba(10,40,35,0.05)",
                  transition: "border-color 0.24s ease, box-shadow 0.24s ease, transform 0.24s ease",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = "hsl(var(--primary) / 0.30)";
                  el.style.boxShadow = "0 4px 18px rgba(10,40,35,0.09)";
                  el.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = "hsl(var(--border) / 0.70)";
                  el.style.boxShadow = "0 1px 4px rgba(10,40,35,0.05)";
                  el.style.transform = "translateY(0)";
                }}
              >
                {/* Icon */}
                <div
                  className="mb-5 flex items-center justify-center rounded-lg"
                  style={{
                    width: "44px",
                    height: "44px",
                    background: "hsl(var(--primary) / 0.07)",
                    border: "1px solid hsl(var(--primary) / 0.12)",
                    flexShrink: 0,
                  }}
                >
                  {icon}
                </div>

                {/* Title */}
                <p
                  className="mb-2.5"
                  style={{
                    fontSize: "14.5px",
                    fontWeight: 600,
                    letterSpacing: "-0.008em",
                    color: "hsl(var(--foreground))",
                    lineHeight: 1.3,
                  }}
                >
                  {title}
                </p>

                {/* Desc */}
                <p
                  style={{
                    fontSize: "13px",
                    lineHeight: 1.8,
                    fontWeight: 400,
                    color: "hsl(var(--muted-foreground))",
                  }}
                >
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
