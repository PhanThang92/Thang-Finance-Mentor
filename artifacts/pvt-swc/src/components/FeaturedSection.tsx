import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
};

const cards = [
  {
    label: "Series",
    title: "Hành Trình Từ Tư Duy Đến Tự Do",
    desc: "Một series về tư duy, trách nhiệm, tài chính, sự nghiệp và cách một người bình thường có thể trưởng thành dần để bước gần hơn tới tự do.",
    gradientFrom: "#0e2421",
    gradientTo: "#1a4a44",
    accent: "rgba(52,160,140,0.35)",
  },
  {
    label: "Hành trình",
    title: "Con đường đến 1 triệu đô",
    desc: "Không phải lời hứa làm giàu nhanh. Đây là hành trình xây tài sản dài hạn bằng kỷ luật tài chính, tư duy đầu tư đúng và một hệ thống đồng hành nghiêm túc.",
    gradientFrom: "#142820",
    gradientTo: "#1e5448",
    accent: "rgba(36,130,100,0.30)",
  },
  {
    label: "Nền tảng",
    title: "Kiến thức đầu tư nền tảng",
    desc: "Dành cho người muốn bắt đầu từ gốc: hiểu tiền, hiểu rủi ro, hiểu cách nhìn một cơ hội đầu tư bằng sự tỉnh táo thay vì cảm xúc.",
    gradientFrom: "#0f2320",
    gradientTo: "#1c4840",
    accent: "rgba(60,140,120,0.25)",
  },
  {
    label: "Cuộc sống",
    title: "Kỷ luật, cuộc sống và phát triển bản thân",
    desc: "Những chia sẻ gần hơn với đời sống hằng ngày, nhưng lại là phần rất quan trọng để xây nên một hành trình tài chính bền vững.",
    gradientFrom: "#132824",
    gradientTo: "#214f47",
    accent: "rgba(45,150,130,0.28)",
  },
];

export function FeaturedSection() {
  return (
    <section className="py-28 md:py-36 bg-card">
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
          className="space-y-14"
        >
          {/* Header */}
          <div className="max-w-2xl space-y-4">
            <motion.div variants={fadeUp} className="flex items-center gap-3">
              <div className="h-px w-8 bg-primary/50" />
              <span className="section-label">Bắt đầu từ đâu?</span>
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold text-foreground">
              Bắt đầu từ những nội dung cốt lõi
            </motion.h2>
            <motion.p variants={fadeUp} className="prose-body">
              Nếu anh/chị mới biết đến tôi, đây là những nội dung nên bắt đầu trước.
            </motion.p>
          </div>

          {/* Cards grid */}
          <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {cards.map(({ label, title, desc, gradientFrom, gradientTo, accent }) => (
              <motion.div
                key={title}
                variants={fadeUp}
                className="group rounded-xl bg-white border border-border overflow-hidden hover:border-border/50 hover:-translate-y-0.5 transition-all duration-300 flex flex-col"
                style={{ boxShadow: "0 2px 8px -2px rgba(10,40,35,0.06)" }}
              >
                {/* Thumbnail */}
                <div
                  className="relative h-36 flex items-end overflow-hidden"
                  style={{
                    background: `linear-gradient(145deg, ${gradientFrom} 0%, ${gradientTo} 100%)`,
                  }}
                >
                  {/* Glow */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `radial-gradient(ellipse 80% 80% at 30% 30%, ${accent} 0%, transparent 70%)`,
                    }}
                  />
                  {/* Label chip */}
                  <span
                    className="relative z-10 m-4 text-[11px] font-semibold tracking-[0.12em] uppercase px-2.5 py-1 rounded-full"
                    style={{
                      background: "rgba(255,255,255,0.10)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      color: "rgba(255,255,255,0.75)",
                    }}
                  >
                    {label}
                  </span>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-grow gap-3">
                  <h3 className="text-[16px] font-bold text-foreground leading-snug group-hover:text-primary transition-colors duration-200">
                    {title}
                  </h3>
                  <p className="text-sm leading-[1.8] text-muted-foreground flex-grow">{desc}</p>
                  <div className="pt-2">
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:gap-2.5 transition-all duration-200 cursor-pointer">
                      Xem ngay
                      <ArrowRight size={14} strokeWidth={2} />
                    </span>
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
