import React from "react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden:  { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};
const stagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.13 } },
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
    title: "Đồng hành qua nội dung",
    desc: "Từng bước xây sự rõ ràng, kỷ luật và nền tảng bền vững hơn qua nội dung liên tục và cộng đồng.",
  },
];

export function ProcessSection() {
  return (
    <section
      style={{
        background: "hsl(var(--background))",
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
          className="space-y-14"
        >

          {/* Header */}
          <div className="max-w-xl">
            <motion.div variants={fadeUp} className="flex items-center gap-3 mb-5">
              <div style={{ width: "1.75rem", height: "1px", background: "hsl(var(--primary) / 0.45)", flexShrink: 0 }} />
              <span className="section-label">Cách làm việc</span>
            </motion.div>

            <motion.h2
              variants={fadeUp}
              style={{
                fontSize: "clamp(1.45rem, 3.2vw, 2rem)",
                fontWeight: 700,
                lineHeight: 1.24,
                letterSpacing: "-0.022em",
                color: "hsl(var(--foreground))",
                marginBottom: "0.875rem",
              }}
            >
              Cách tôi xây giá trị và đồng hành cùng người theo dõi
            </motion.h2>

            <motion.p
              variants={fadeUp}
              style={{
                fontSize: "14.5px",
                lineHeight: 1.88,
                fontWeight: 400,
                color: "hsl(var(--muted-foreground))",
                maxWidth: "36rem",
              }}
            >
              Không phức tạp, không tạo cảm giác phụ thuộc — chỉ là cách tiếp cận rõ ràng và thực tế hơn.
            </motion.p>
          </div>

          {/* Steps */}
          <div className="relative">
            {/* Desktop connector line — positioned to center of the 48px circles */}
            <div
              className="hidden lg:block absolute"
              style={{
                top: "23px",
                left: "calc(12.5% + 18px)",
                right: "calc(12.5% + 18px)",
                height: "1px",
                background: "linear-gradient(to right, hsl(var(--primary) / 0.12), hsl(var(--primary) / 0.28), hsl(var(--primary) / 0.12))",
              }}
            />

            <motion.div
              variants={stagger}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6"
            >
              {steps.map(({ num, title, desc }) => (
                <motion.div
                  key={num}
                  variants={fadeUp}
                  className="flex flex-col items-start lg:items-center"
                >
                  {/* Step number circle */}
                  <div
                    className="mb-6 flex items-center justify-center rounded-full"
                    style={{
                      width: "46px",
                      height: "46px",
                      background: "hsl(var(--primary) / 0.07)",
                      border: "1px solid hsl(var(--primary) / 0.22)",
                      flexShrink: 0,
                      position: "relative",
                      zIndex: 1,
                    }}
                  >
                    <span style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      color: "hsl(var(--primary) / 0.85)",
                    }}>
                      {num}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="lg:text-center">
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
                    <p style={{
                      fontSize: "12.5px",
                      lineHeight: 1.86,
                      fontWeight: 400,
                      color: "hsl(var(--muted-foreground))",
                    }}>
                      {desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Subtle closing divider */}
          <motion.div
            variants={fadeUp}
            className="h-px w-full"
            style={{ background: "hsl(var(--border) / 0.40)" }}
          />

        </motion.div>
      </div>
    </section>
  );
}
