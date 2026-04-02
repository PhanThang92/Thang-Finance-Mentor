import React from "react";
import { motion } from "framer-motion";
import { Briefcase, TrendingUp, BookOpen, Target } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.72, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const metrics = [
  {
    type: "metric",
    num: "5+",
    unit: "năm",
    title: "Kinh nghiệm công nghệ",
    icon: Briefcase,
  },
  {
    type: "metric",
    num: "7+",
    unit: "năm",
    title: "Theo đuổi đầu tư dài hạn",
    icon: TrendingUp,
  },
  {
    type: "value",
    num: null,
    unit: "",
    title: "Chia sẻ thực tế",
    sub: "Kiến thức tài chính & phát triển bản thân",
    icon: BookOpen,
  },
  {
    type: "value",
    num: null,
    unit: "",
    title: "Định hướng bền vững",
    sub: "Ưu tiên giá trị dài hạn thay vì hưng phấn ngắn hạn",
    icon: Target,
  },
];

const keyPoints = [
  "Hiểu giá trị của lao động và thời gian",
  "Xây nền tài chính cá nhân vững hơn",
  "Rèn tư duy đầu tư đúng",
  "Từng bước hình thành tài sản bằng kỷ luật và kiến thức",
];

export function AboutSection() {
  return (
    <section id="gioi-thieu" className="py-28 md:py-36 bg-background">
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
          className="space-y-16"
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
              style={{ fontSize: "clamp(1.65rem, 3.8vw, 2.25rem)", fontWeight: 700, lineHeight: 1.2, letterSpacing: "-0.018em" }}
            >
              Tôi là ai
            </motion.h2>
          </div>

          {/* ── Body — two column ── */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_268px] gap-12 lg:gap-16 items-start">

            {/* Left: editorial text */}
            <motion.div variants={fadeUp} className="space-y-0">

              {/* Name intro — anchor statement */}
              <p
                className="text-foreground mb-5"
                style={{ fontSize: "17px", fontWeight: 600, lineHeight: 1.55, letterSpacing: "-0.01em" }}
              >
                Tôi là Phan Văn Thắng.
              </p>

              {/* Background paragraph */}
              <p
                className="text-foreground/68 mb-5"
                style={{ fontSize: "15px", lineHeight: 1.9, fontWeight: 400 }}
              >
                Tôi từng làm việc trong lĩnh vực công nghệ nhiều năm, sau đó bước sâu hơn vào
                hành trình quản lý tài chính cá nhân, đầu tư giá trị và phát triển tư duy tài
                sản dài hạn.
              </p>

              {/* Key insight — slightly elevated contrast */}
              <p
                className="text-foreground/80 mb-6"
                style={{ fontSize: "15px", lineHeight: 1.9, fontWeight: 400 }}
              >
                Qua thời gian, tôi nhận ra điều này rất rõ: nhiều người làm việc chăm chỉ, thu
                nhập không hẳn thấp, nhưng sau nhiều năm vẫn chưa xây được một nền tài chính
                thật sự vững.
              </p>

              {/* Core diagnosis — broken into 3 short punchy lines */}
              <div
                className="mb-6 pl-4 space-y-2"
                style={{ borderLeft: "2px solid hsl(var(--primary) / 0.28)" }}
              >
                <p className="text-foreground/72" style={{ fontSize: "14.5px", lineHeight: 1.75, fontWeight: 400 }}>
                  Vấn đề thường không nằm ở việc họ thiếu cố gắng.
                </p>
                <p className="text-foreground/72" style={{ fontSize: "14.5px", lineHeight: 1.75, fontWeight: 400 }}>
                  Mà nằm ở chỗ họ chưa có một hệ thống đúng, chưa hiểu tiền đủ sâu,
                  chưa có kỷ luật tài chính đủ bền và tư duy đầu tư đủ dài hạn.
                </p>
              </div>

              {/* Conclusion */}
              <p
                className="text-foreground/68 mb-8"
                style={{ fontSize: "15px", lineHeight: 1.9, fontWeight: 400 }}
              >
                Vì vậy, điều tôi đang theo đuổi không phải là tạo ra cảm giác hưng phấn nhất
                thời. Tôi muốn chia sẻ một hướng đi thực tế hơn, bền hơn và có chiều sâu hơn.
              </p>

              {/* Key points — editorial list */}
              <ul className="space-y-3">
                {keyPoints.map((item) => (
                  <li key={item} className="flex items-start gap-3.5">
                    <span
                      className="flex-shrink-0 mt-[7px]"
                      style={{ width: "5px", height: "5px", borderRadius: "50%", background: "hsl(var(--primary) / 0.55)" }}
                    />
                    <span
                      className="text-foreground/70"
                      style={{ fontSize: "14.5px", lineHeight: 1.75, fontWeight: 400 }}
                    >
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* ── Quote card — editorial pull-quote ── */}
            <motion.div
              variants={fadeUp}
              className="sticky top-28"
            >
              <div
                className="rounded-xl bg-card overflow-hidden"
                style={{
                  border: "1px solid hsl(var(--border) / 0.7)",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)",
                }}
              >
                {/* Primary accent bar at top */}
                <div
                  style={{ height: "3px", background: "linear-gradient(to right, hsl(var(--primary) / 0.85), hsl(var(--primary) / 0.20))" }}
                />

                <div className="p-7">
                  {/* Decorative opening quote */}
                  <div
                    className="mb-4 select-none"
                    style={{ fontSize: "3.5rem", lineHeight: 1, color: "hsl(var(--primary) / 0.20)", fontWeight: 700, marginTop: "-8px" }}
                    aria-hidden="true"
                  >
                    "
                  </div>

                  {/* Quote body */}
                  <p
                    className="text-foreground/82"
                    style={{ fontSize: "15px", lineHeight: 1.85, fontWeight: 400, fontStyle: "italic" }}
                  >
                    Hành trình tài chính bền vững không bắt đầu từ thị trường. Nó bắt đầu từ
                    tư duy và kỷ luật.
                  </p>

                  {/* Attribution */}
                  <div
                    className="mt-6 pt-5 flex items-center gap-3"
                    style={{ borderTop: "1px solid hsl(var(--border) / 0.6)" }}
                  >
                    <div
                      style={{ width: "1.5rem", height: "1.5px", background: "hsl(var(--primary) / 0.50)", flexShrink: 0 }}
                    />
                    <p
                      className="text-foreground/55"
                      style={{ fontSize: "12px", fontWeight: 500, letterSpacing: "0.02em" }}
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
            className="grid grid-cols-2 md:grid-cols-4 gap-3.5 pt-10 border-t border-border/60"
          >
            {metrics.map((card, idx) => (
              <motion.div
                key={idx}
                variants={fadeUp}
                className="flex flex-col gap-0 p-5 rounded-xl bg-card"
                style={{
                  border: "1px solid hsl(var(--border) / 0.65)",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                  minHeight: "108px",
                }}
              >
                {/* Icon — small, subtle */}
                <div
                  className="mb-3.5 flex items-center justify-center rounded-lg"
                  style={{ width: "2rem", height: "2rem", background: "hsl(var(--primary) / 0.07)" }}
                >
                  <card.icon size={14} strokeWidth={1.7} style={{ color: "hsl(var(--primary) / 0.75)" }} />
                </div>

                {card.type === "metric" ? (
                  /* Metric card — large number + label */
                  <>
                    <div className="flex items-baseline gap-1 mb-1">
                      <span
                        className="text-foreground"
                        style={{ fontSize: "1.55rem", fontWeight: 700, lineHeight: 1, letterSpacing: "-0.02em" }}
                      >
                        {card.num}
                      </span>
                      {card.unit && (
                        <span
                          className="text-foreground/45"
                          style={{ fontSize: "11px", fontWeight: 400 }}
                        >
                          {card.unit}
                        </span>
                      )}
                    </div>
                    <p
                      className="text-foreground/55"
                      style={{ fontSize: "12px", fontWeight: 400, lineHeight: 1.45 }}
                    >
                      {card.title}
                    </p>
                  </>
                ) : (
                  /* Value statement card — title + description */
                  <>
                    <p
                      className="text-foreground/88 mb-1.5"
                      style={{ fontSize: "13px", fontWeight: 600, lineHeight: 1.35, letterSpacing: "-0.005em" }}
                    >
                      {card.title}
                    </p>
                    <p
                      className="text-foreground/48"
                      style={{ fontSize: "11.5px", fontWeight: 400, lineHeight: 1.55 }}
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
