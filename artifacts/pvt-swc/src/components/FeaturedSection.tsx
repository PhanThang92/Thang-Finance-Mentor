import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

const cards = [
  {
    anchor: "Phù hợp để bắt đầu",
    label: "Series",
    title: "Hành Trình Từ Tư Duy Đến Tự Do",
    desc: "Một series về tư duy, trách nhiệm, tài chính, sự nghiệp và cách một người bình thường có thể trưởng thành dần để bước gần hơn tới tự do.",
    gradientAngle: 145,
    gradientFrom: "#0e2421",
    gradientTo: "#1a4a44",
    glow: { color: "rgba(52,160,140,0.36)", x: "30%", y: "28%", rx: "74%", ry: "68%" },
    shimmer: { dir: "to bottom right", opacity: 0.065 },
  },
  {
    anchor: "Nên xem trước",
    label: "Hành trình",
    title: "Con đường đến 1 triệu đô",
    desc: "Không phải lời hứa làm giàu nhanh. Đây là hành trình xây tài sản dài hạn bằng kỷ luật tài chính, tư duy đầu tư đúng và một hệ thống đồng hành nghiêm túc.",
    gradientAngle: 130,
    gradientFrom: "#142820",
    gradientTo: "#1e5448",
    glow: { color: "rgba(36,130,100,0.33)", x: "72%", y: "22%", rx: "80%", ry: "62%" },
    shimmer: { dir: "to bottom left", opacity: 0.055 },
  },
  {
    anchor: "Nền tảng quan trọng",
    label: "Nền tảng",
    title: "Kiến thức đầu tư nền tảng",
    desc: "Dành cho người muốn bắt đầu từ gốc: hiểu tiền, hiểu rủi ro, hiểu cách nhìn một cơ hội đầu tư bằng sự tỉnh táo thay vì cảm xúc.",
    gradientAngle: 155,
    gradientFrom: "#0f2420",
    gradientTo: "#1d4c42",
    glow: { color: "rgba(58,148,124,0.32)", x: "52%", y: "78%", rx: "66%", ry: "80%" },
    shimmer: { dir: "to top right", opacity: 0.06 },
  },
  {
    anchor: "Gần với đời sống",
    label: "Cuộc sống",
    title: "Kỷ luật, cuộc sống và phát triển bản thân",
    desc: "Những chia sẻ gần hơn với đời sống hằng ngày, nhưng lại là phần rất quan trọng để xây nên một hành trình tài chính bền vững.",
    gradientAngle: 138,
    gradientFrom: "#132824",
    gradientTo: "#22514a",
    glow: { color: "rgba(48,152,132,0.34)", x: "18%", y: "55%", rx: "70%", ry: "72%" },
    shimmer: { dir: "to top left", opacity: 0.065 },
  },
];

export function FeaturedSection() {
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
              <span className="section-label">Bắt đầu từ đâu?</span>
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
              Bắt đầu từ những nội dung cốt lõi
            </motion.h2>
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
              Nếu anh/chị mới biết đến tôi, đây là những nội dung nên bắt đầu trước để hiểu rõ
              hơn góc nhìn, triết lý và định hướng tôi đang theo đuổi.
            </motion.p>
          </div>

          {/* ── Cards grid ── */}
          <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cards.map(({ anchor, label, title, desc, gradientAngle, gradientFrom, gradientTo, glow, shimmer }) => (
              <motion.div
                key={title}
                variants={fadeUp}
                className="group flex flex-col rounded-xl bg-white overflow-hidden"
                style={{
                  border: "1px solid hsl(var(--border) / 0.88)",
                  boxShadow: "0 2px 8px rgba(10,40,35,0.06)",
                  transition: "border-color 0.28s ease, box-shadow 0.28s ease, transform 0.28s ease",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = "hsl(var(--primary) / 0.25)";
                  el.style.boxShadow = "0 6px 22px rgba(10,40,35,0.10)";
                  el.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = "hsl(var(--border) / 0.88)";
                  el.style.boxShadow = "0 2px 8px rgba(10,40,35,0.06)";
                  el.style.transform = "translateY(0)";
                }}
              >
                {/* ── Thumbnail ── */}
                <div
                  className="relative overflow-hidden"
                  style={{
                    height: "140px",
                    background: `linear-gradient(${gradientAngle}deg, ${gradientFrom} 0%, ${gradientTo} 100%)`,
                  }}
                >
                  {/* Radial glow — position and ellipse shape vary per card */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `radial-gradient(ellipse ${glow.rx} ${glow.ry} at ${glow.x} ${glow.y}, ${glow.color} 0%, transparent 68%)`,
                    }}
                  />
                  {/* Directional shimmer — direction varies per card */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(${shimmer.dir}, rgba(255,255,255,${shimmer.opacity}) 0%, transparent 55%)`,
                    }}
                  />
                  {/* Subtle horizontal light band at top edge */}
                  <div
                    className="absolute top-0 left-0 right-0"
                    style={{
                      height: "1px",
                      background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.12) 40%, rgba(255,255,255,0.08) 60%, transparent)",
                    }}
                  />
                  {/* Label chip — bottom-left */}
                  <span
                    className="absolute bottom-0 left-0 m-4 z-10"
                    style={{
                      fontSize: "10.5px",
                      fontWeight: 600,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      padding: "3px 10px",
                      borderRadius: "999px",
                      background: "rgba(255,255,255,0.09)",
                      border: "1px solid rgba(255,255,255,0.14)",
                      color: "rgba(255,255,255,0.70)",
                    }}
                  >
                    {label}
                  </span>
                </div>

                {/* ── Card body ── */}
                <div
                  className="flex flex-col flex-grow"
                  style={{ padding: "1.375rem 1.5rem 1.5rem" }}
                >
                  {/* Anchor label */}
                  <p
                    style={{
                      fontSize: "11.5px",
                      fontWeight: 500,
                      fontStyle: "italic",
                      letterSpacing: "0.012em",
                      color: "hsl(var(--primary) / 0.75)",
                      lineHeight: 1,
                      marginBottom: "0.575rem",
                    }}
                  >
                    {anchor}
                  </p>

                  {/* Title */}
                  <h3
                    className="text-foreground"
                    style={{
                      fontSize: "15.5px",
                      fontWeight: 700,
                      lineHeight: 1.3,
                      letterSpacing: "-0.01em",
                      marginBottom: "0.625rem",
                      transition: "color 0.2s ease",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "hsl(var(--primary))"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "hsl(var(--foreground))"; }}
                  >
                    {title}
                  </h3>

                  {/* Description */}
                  <p
                    className="flex-grow"
                    style={{
                      fontSize: "13px",
                      lineHeight: 1.86,
                      fontWeight: 400,
                      color: "hsl(var(--muted-foreground))",
                      marginBottom: "1.125rem",
                    }}
                  >
                    {desc}
                  </p>

                  {/* CTA */}
                  <div>
                    <a
                      href="#"
                      className="inline-flex items-center gap-1.5 group/cta"
                      style={{
                        fontSize: "12.5px",
                        fontWeight: 500,
                        letterSpacing: "0.008em",
                        color: "hsl(var(--primary))",
                        textDecoration: "none",
                        transition: "gap 0.2s ease",
                      }}
                    >
                      Bắt đầu tại đây
                      <ArrowRight
                        size={13}
                        strokeWidth={2}
                        style={{
                          transition: "transform 0.2s ease",
                          flexShrink: 0,
                        }}
                        className="group-hover/cta:translate-x-0.5"
                      />
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}
