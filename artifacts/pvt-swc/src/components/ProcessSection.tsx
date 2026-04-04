import React from "react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const steps = [
  {
    num: "01",
    title: "Chia sẻ nền tảng",
    desc: "Thông qua bài viết, nội dung và các góc nhìn cốt lõi về tài chính, đầu tư và tư duy tích sản.",
  },
  {
    num: "02",
    title: "Giúp làm rõ vấn đề",
    desc: "Để mỗi người hiểu mình đang thiếu điều gì trong hành trình tài chính — và cần ưu tiên điều gì trước.",
  },
  {
    num: "03",
    title: "Gợi mở hướng đi phù hợp",
    desc: "Dựa trên bối cảnh, nhu cầu và mục tiêu dài hạn — không áp đặt công thức chung cho tất cả.",
  },
  {
    num: "04",
    title: "Đồng hành bằng hệ thống nội dung",
    desc: "Từng bước xây sự rõ ràng, kỷ luật và nền tảng bền vững hơn qua nội dung liên tục và cộng đồng.",
  },
];

export function ProcessSection() {
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
          className="space-y-14"
        >

          {/* ── Header ── */}
          <div className="max-w-2xl space-y-4">
            <motion.div variants={fadeUp} className="flex items-center gap-3">
              <div className="h-px w-8 bg-primary/50" />
              <span className="section-label">Cách làm việc</span>
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
              Cách tôi xây giá trị và đồng hành cùng người theo dõi
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
              Không phức tạp, không tạo cảm giác phụ thuộc — chỉ là cách tiếp cận rõ ràng và thực tế hơn.
            </motion.p>
          </div>

          {/* ── Steps ── */}
          <div className="relative">
            {/* Connector line (desktop) */}
            <div
              className="hidden lg:block absolute"
              style={{
                top: "28px",
                left: "calc(12.5% + 20px)",
                right: "calc(12.5% + 20px)",
                height: "1px",
                background: "linear-gradient(to right, hsl(var(--primary) / 0.18), hsl(var(--primary) / 0.35), hsl(var(--primary) / 0.18))",
              }}
            />

            <motion.div
              variants={stagger}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-5"
            >
              {steps.map(({ num, title, desc }) => (
                <motion.div
                  key={num}
                  variants={fadeUp}
                  className="flex flex-col items-start lg:items-center"
                >
                  {/* Step number circle */}
                  <div
                    className="mb-5 flex items-center justify-center rounded-full"
                    style={{
                      width: "56px",
                      height: "56px",
                      background: "hsl(var(--primary) / 0.09)",
                      border: "1.5px solid hsl(var(--primary) / 0.26)",
                      flexShrink: 0,
                      position: "relative",
                      zIndex: 1,
                    }}
                  >
                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: 700,
                        letterSpacing: "0.04em",
                        color: "hsl(var(--primary))",
                      }}
                    >
                      {num}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="lg:text-center">
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
                    <p
                      style={{
                        fontSize: "13px",
                        lineHeight: 1.84,
                        fontWeight: 400,
                        color: "hsl(var(--muted-foreground))",
                      }}
                    >
                      {desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

        </motion.div>
      </div>
    </section>
  );
}
