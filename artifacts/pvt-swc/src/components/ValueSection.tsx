import React from "react";
import { motion } from "framer-motion";

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.13 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

const values = [
  {
    num: "01",
    title: "Kỷ luật tài chính",
    anchor: "Nền móng của mọi tài sản bền vững.",
    desc: "Không có tài sản bền vững nếu không có kỷ luật. Từ quản lý chi tiêu, xây quỹ an toàn, hình thành thói quen tích lũy đến cách ra quyết định trước cám dỗ ngắn hạn — tất cả đều là phần gốc.",
  },
  {
    num: "02",
    title: "Tư duy đầu tư đúng",
    anchor: "Hiểu rủi ro trước khi nói tới lợi nhuận.",
    desc: "Đầu tư không bắt đầu bằng câu hỏi: 'Cái gì tăng nhanh nhất?'. Nó nên bắt đầu bằng những câu hỏi sâu hơn về rủi ro, giá trị và khả năng giữ được sự tỉnh táo khi thị trường biến động.",
  },
  {
    num: "03",
    title: "Hệ thống phát triển dài hạn",
    anchor: "Đi đường dài cần công cụ, nguyên tắc và cộng đồng.",
    desc: "Một người có thể rất quyết tâm trong vài ngày. Nhưng để đi được vài năm, cần một hệ thống học tập, một môi trường đủ tốt, một cộng đồng đồng hành và những nguyên tắc đủ rõ để quay lại mỗi khi chệch hướng.",
    denseBody: true,
  },
];

export function ValueSection() {
  return (
    <section className="py-24 md:py-32 bg-card">
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
              <span className="section-label">Giá trị cốt lõi</span>
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
              3 trụ giá trị tôi theo đuổi
            </motion.h2>
            {/* 1. Updated intro copy */}
            <motion.p
              variants={fadeUp}
              style={{
                fontSize: "15px",
                lineHeight: 1.88,
                fontWeight: 400,
                color: "hsl(var(--muted-foreground))",
                maxWidth: "36rem",
              }}
            >
              Tôi tin rằng một hành trình tài chính bền vững không bắt đầu từ cơ hội kiếm được
              bao nhiêu. Nó bắt đầu từ nền tảng mình đang đứng trên.
            </motion.p>
          </div>

          {/* ── Value cards ── */}
          <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {values.map(({ num, title, anchor, desc, denseBody }) => (
              <motion.div
                key={num}
                variants={fadeUp}
                className="group relative flex flex-col rounded-xl bg-background transition-all duration-300"
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
                {/* 3. Editorial number marker — top left, inline */}
                <div className="flex items-center gap-3 mb-5">
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      letterSpacing: "0.13em",
                      color: "hsl(var(--primary) / 0.65)",
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
                    fontSize: "17px",
                    fontWeight: 700,
                    lineHeight: 1.3,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {title}
                </h3>

                {/* 4. Anchor line — principle sub-statement */}
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
                    fontSize: denseBody ? "13.5px" : "14px",
                    lineHeight: denseBody ? 1.78 : 1.85,
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
