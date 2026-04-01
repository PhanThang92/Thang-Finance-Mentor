import React from "react";
import { motion } from "framer-motion";

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
};

const audiences = [
  { n: "01", text: "Người đi làm nhiều năm nhưng tài sản vẫn chưa hình thành rõ" },
  { n: "02", text: "Người có thu nhập nhưng chưa có hệ thống quản lý và đầu tư bài bản" },
  { n: "03", text: "Người muốn hiểu đầu tư theo hướng dài hạn, thực tế" },
  { n: "04", text: "Người muốn phát triển bản thân và tài chính song song" },
  { n: "05", text: "Người muốn đi đường dài, không FOMO" },
];

export function AudienceSection() {
  return (
    <section
      className="py-28 md:py-36 relative overflow-hidden"
      style={{ background: "linear-gradient(160deg, #102a26 0%, #0e2421 100%)" }}
    >
      {/* Subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "4rem 4rem",
        }}
      />

      <div className="max-w-5xl mx-auto px-5 sm:px-8 relative z-10">
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
              <div className="h-px w-8" style={{ background: "rgba(200,160,80,0.6)" }} />
              <span className="text-xs font-semibold tracking-[0.18em] uppercase text-accent/80">
                Dành cho ai?
              </span>
            </motion.div>
            <motion.h2
              variants={fadeUp}
              className="text-3xl md:text-4xl font-bold text-white"
            >
              Trang này dành cho ai?
            </motion.h2>
            <motion.p variants={fadeUp} className="text-white/60 text-[15px] leading-[1.85]">
              Nếu anh/chị đang ở một trong những giai đoạn dưới đây, rất có thể những nội dung
              tôi chia sẻ sẽ phù hợp:
            </motion.p>
          </div>

          {/* Audience cards */}
          <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {audiences.map(({ n, text }) => (
              <motion.div
                key={n}
                variants={fadeUp}
                className={`flex items-start gap-5 p-5 rounded-xl transition-colors ${
                  n === "05" ? "md:col-span-2 md:max-w-md" : ""
                }`}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <span
                  className="text-xs font-bold mt-0.5 flex-shrink-0"
                  style={{ color: "rgba(100,200,175,0.45)", letterSpacing: "0.06em" }}
                >
                  {n}
                </span>
                <p className="text-white/80 text-[15px] leading-[1.7] font-light">{text}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Closing line */}
          <motion.div
            variants={fadeUp}
            className="pt-6 border-t"
            style={{ borderColor: "rgba(255,255,255,0.07)" }}
          >
            <p className="text-white/50 text-[15px] leading-[1.85] italic max-w-2xl font-light">
              "Nếu anh/chị đang tìm một hướng đi bình tĩnh hơn, thực tế hơn và có chiều sâu hơn
              với tài chính và cuộc sống — đây có thể là nơi phù hợp."
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
