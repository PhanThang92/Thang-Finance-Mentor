import React from "react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.72, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.11 } },
};

const metrics = [
  {
    type: "metric",
    num: "5+",
    unit: "năm",
    title: "Kinh nghiệm công nghệ",
  },
  {
    type: "metric",
    num: "7+",
    unit: "năm",
    title: "Theo đuổi đầu tư dài hạn",
  },
  {
    type: "value",
    title: "Chia sẻ thực tế",
    sub: "Kiến thức tài chính & phát triển bản thân",
  },
  {
    type: "value",
    title: "Định hướng bền vững",
    sub: "Ưu tiên giá trị dài hạn thay vì hưng phấn ngắn hạn",
  },
];

const keyPoints = [
  "Hiểu đúng giá trị của lao động và thời gian",
  "Xây nền tài chính cá nhân vững hơn",
  "Rèn tư duy đầu tư đúng",
  "Từng bước hình thành tài sản bằng kỷ luật và kiến thức",
];

export function AboutSection() {
  return (
    <section id="gioi-thieu" className="py-20 md:py-28 bg-background">
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
          className="space-y-14"
        >

          {/* ── Section header ── */}
          <div className="max-w-2xl space-y-4">
            <motion.div variants={fadeUp} className="flex items-center gap-3">
              <div className="h-px w-8 bg-primary/50" />
              <span className="section-label">Giới thiệu</span>
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
              Tôi là ai
            </motion.h2>
          </div>

          {/* ── Body — two column ── */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_272px] gap-12 lg:gap-14 items-start">

            {/* Left: editorial text */}
            <motion.div variants={fadeUp}>

              {/* Name intro */}
              <p
                className="text-foreground mb-5"
                style={{ fontSize: "17px", fontWeight: 600, lineHeight: 1.5, letterSpacing: "-0.01em" }}
              >
                Tôi là Phan Văn Thắng.
              </p>

              {/* Background */}
              <p
                className="text-foreground/65 mb-5"
                style={{ fontSize: "15px", lineHeight: 1.9, fontWeight: 400 }}
              >
                Tôi từng làm việc trong lĩnh vực công nghệ nhiều năm, sau đó bước sâu hơn vào
                hành trình quản lý tài chính cá nhân, đầu tư giá trị và phát triển tư duy tài
                sản dài hạn.
              </p>

              {/* Key insight */}
              <p
                className="text-foreground/78 mb-5"
                style={{ fontSize: "15px", lineHeight: 1.9, fontWeight: 400 }}
              >
                Qua thời gian, tôi nhận ra điều này rất rõ: nhiều người làm việc chăm chỉ, thu
                nhập không hẳn thấp, nhưng sau nhiều năm vẫn chưa xây được một nền tài chính
                thật sự vững.
              </p>

              {/* Core diagnosis — left-border editorial block */}
              <div
                className="mb-5 pl-4 space-y-1.5"
                style={{ borderLeft: "1.5px solid hsl(var(--primary) / 0.30)" }}
              >
                <p
                  className="text-foreground/68"
                  style={{ fontSize: "14.5px", lineHeight: 1.8, fontWeight: 400 }}
                >
                  Vấn đề thường không nằm ở việc họ thiếu cố gắng.
                </p>
                <p
                  className="text-foreground/68"
                  style={{ fontSize: "14.5px", lineHeight: 1.8, fontWeight: 400 }}
                >
                  Mà nằm ở chỗ họ chưa có một hệ thống đúng, chưa hiểu tiền đủ sâu,
                  chưa có kỷ luật tài chính đủ bền và tư duy đầu tư đủ dài hạn.
                </p>
              </div>

              {/* Conclusion */}
              <p
                className="text-foreground/65 mb-8"
                style={{ fontSize: "15px", lineHeight: 1.9, fontWeight: 400 }}
              >
                Vì vậy, điều tôi đang theo đuổi không phải là tạo ra cảm giác hưng phấn nhất
                thời. Tôi muốn chia sẻ một hướng đi thực tế hơn, bền hơn và có chiều sâu hơn.
              </p>

              {/* Key points — refined bullet list */}
              <ul className="space-y-2.5">
                {keyPoints.map((item) => (
                  <li key={item} className="flex items-start gap-3.5">
                    <span
                      className="flex-shrink-0"
                      style={{
                        marginTop: "8px",
                        width: "4px",
                        height: "4px",
                        borderRadius: "50%",
                        background: "hsl(var(--primary) / 0.60)",
                      }}
                    />
                    <span
                      className="text-foreground/68"
                      style={{ fontSize: "14.5px", lineHeight: 1.78, fontWeight: 400 }}
                    >
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* ── Quote card ── */}
            <motion.div variants={fadeUp} className="sticky top-28">
              <div
                className="rounded-xl bg-card overflow-hidden"
                style={{
                  border: "1px solid hsl(var(--border) / 0.65)",
                  boxShadow: "0 6px 28px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04)",
                }}
              >
                {/* Teal accent top bar */}
                <div
                  style={{
                    height: "3px",
                    background: "linear-gradient(to right, hsl(var(--primary) / 0.80), hsl(var(--primary) / 0.15))",
                  }}
                />

                <div className="p-8">
                  {/* Decorative quote mark */}
                  <div
                    className="select-none"
                    style={{
                      fontSize: "4.5rem",
                      lineHeight: 0.85,
                      color: "hsl(var(--primary) / 0.18)",
                      fontWeight: 700,
                      marginBottom: "1rem",
                      marginTop: "-6px",
                      fontStyle: "normal",
                    }}
                    aria-hidden="true"
                  >
                    "
                  </div>

                  {/* Quote body — brand statement level presence */}
                  <p
                    style={{
                      fontSize: "15.5px",
                      lineHeight: 1.88,
                      fontWeight: 400,
                      fontStyle: "italic",
                      color: "hsl(var(--foreground) / 0.84)",
                      letterSpacing: "0.002em",
                    }}
                  >
                    Hành trình tài chính bền vững không bắt đầu từ thị trường. Nó bắt đầu từ
                    tư duy, kỷ luật và cách mình sống mỗi ngày.
                  </p>

                  {/* Attribution */}
                  <div
                    className="mt-7 pt-5 flex items-center gap-3"
                    style={{ borderTop: "1px solid hsl(var(--border) / 0.55)" }}
                  >
                    <div
                      style={{
                        width: "1.25rem",
                        height: "1.5px",
                        background: "hsl(var(--primary) / 0.55)",
                        flexShrink: 0,
                      }}
                    />
                    <p
                      style={{
                        fontSize: "11.5px",
                        fontWeight: 500,
                        color: "hsl(var(--foreground) / 0.48)",
                        letterSpacing: "0.025em",
                      }}
                    >
                      Phan Văn Thắng SWC
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* ── Bottom cards ── */}
          <motion.div
            variants={stagger}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-10 border-t"
            style={{ borderColor: "hsl(var(--border) / 0.55)" }}
          >
            {metrics.map((card, idx) => (
              <motion.div
                key={idx}
                variants={fadeUp}
                className="flex flex-col p-5 rounded-xl bg-card"
                style={{
                  border: "1px solid hsl(var(--border) / 0.60)",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                  minHeight: "116px",
                  ...(card.type === "metric" && {
                    borderTop: "2px solid hsl(var(--primary) / 0.20)",
                  }),
                }}
              >
                {card.type === "metric" ? (
                  /* Metric card — no icon, data speaks */
                  <>
                    <div className="flex items-baseline gap-1 mb-auto">
                      <span
                        className="text-foreground"
                        style={{
                          fontSize: "1.65rem",
                          fontWeight: 700,
                          lineHeight: 1,
                          letterSpacing: "-0.025em",
                        }}
                      >
                        {card.num}
                      </span>
                      {card.unit && (
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 400,
                            color: "hsl(var(--foreground) / 0.38)",
                            marginLeft: "1px",
                          }}
                        >
                          {card.unit}
                        </span>
                      )}
                    </div>
                    <p
                      className="mt-3"
                      style={{
                        fontSize: "12px",
                        fontWeight: 400,
                        color: "hsl(var(--foreground) / 0.50)",
                        lineHeight: 1.5,
                      }}
                    >
                      {card.title}
                    </p>
                  </>
                ) : (
                  /* Value card — no icon, statement speaks */
                  <>
                    <div
                      className="mb-3"
                      style={{
                        width: "1.25rem",
                        height: "1.5px",
                        background: "hsl(var(--primary) / 0.40)",
                      }}
                    />
                    <p
                      className="mb-1.5"
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "hsl(var(--foreground) / 0.88)",
                        lineHeight: 1.35,
                        letterSpacing: "-0.005em",
                      }}
                    >
                      {card.title}
                    </p>
                    <p
                      style={{
                        fontSize: "12px",
                        fontWeight: 400,
                        color: "hsl(var(--foreground) / 0.46)",
                        lineHeight: 1.6,
                      }}
                    >
                      {card.sub}
                    </p>
                  </>
                )}
              </motion.div>
            ))}
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}
