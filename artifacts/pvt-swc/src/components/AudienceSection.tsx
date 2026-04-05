import React from "react";
import { motion } from "framer-motion";

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

const audiences = [
  { n: "01", text: "Người đi làm nhiều năm nhưng tài sản vẫn chưa hình thành rõ" },
  { n: "02", text: "Người có thu nhập nhưng chưa có hệ thống quản lý và đầu tư bài bản" },
  { n: "03", text: "Người muốn hiểu đầu tư theo hướng dài hạn, thực tế" },
  { n: "04", text: "Người muốn phát triển bản thân và tài chính song song" },
  { n: "05", text: "Người muốn đi đường dài, không FOMO" },
];

function AudienceCard({ n, text }: { n: string; text: string }) {
  const isLast = n === "05";

  return (
    <motion.div
      variants={fadeUp}
      className={`flex items-start gap-5 rounded-xl transition-all duration-200${isLast ? " md:col-span-2 md:max-w-md" : ""}`}
      style={{
        padding: "1.375rem 1.5rem",
        background: "rgba(255,255,255,0.052)",
        border: "1px solid rgba(255,255,255,0.095)",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.background = "rgba(255,255,255,0.082)";
        el.style.borderColor = "rgba(255,255,255,0.14)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.background = "rgba(255,255,255,0.052)";
        el.style.borderColor = "rgba(255,255,255,0.095)";
      }}
    >
      {/* Editorial number marker */}
      <span
        className="flex-shrink-0 mt-0.5"
        style={{
          fontSize: "11px",
          fontWeight: 600,
          letterSpacing: "0.12em",
          color: "rgba(120,210,185,0.72)",
          lineHeight: 1,
          paddingTop: "3px",
        }}
      >
        {n}
      </span>

      {/* Card text */}
      <p
        style={{
          fontSize: "15px",
          lineHeight: 1.72,
          fontWeight: 400,
          color: "rgba(255,255,255,0.84)",
        }}
      >
        {text}
      </p>
    </motion.div>
  );
}

export function AudienceSection() {
  return (
    <section
      className="py-24 md:py-32 relative overflow-hidden"
      style={{ background: "linear-gradient(160deg, #102a26 0%, #0e2421 100%)" }}
    >
      {/* Subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.022) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.022) 1px, transparent 1px)",
          backgroundSize: "4rem 4rem",
        }}
      />

      <div className="max-w-5xl mx-auto px-5 sm:px-8 relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
          className="space-y-12"
        >
          {/* ── Header ── */}
          <div className="max-w-2xl space-y-4">
            <motion.div variants={fadeUp} className="flex items-center gap-3">
              <div className="flex-shrink-0" style={{ width: "2rem", height: "0.5px", background: "rgba(200,160,80,0.60)" }} />
              <span
                style={{ fontSize: "10.5px", fontWeight: 600, letterSpacing: "0.20em", textTransform: "uppercase", color: "rgba(200,160,80,0.78)" }}
              >
                Dành cho ai?
              </span>
            </motion.div>

            <motion.h2
              variants={fadeUp}
              className="text-white"
              style={{ fontSize: "clamp(1.65rem, 3.8vw, 2.25rem)", fontWeight: 700, lineHeight: 1.2, letterSpacing: "-0.018em" }}
            >
              Trang này dành cho ai?
            </motion.h2>

            {/* 1. Updated intro copy */}
            <motion.p
              variants={fadeUp}
              style={{ fontSize: "15px", lineHeight: 1.88, fontWeight: 400, color: "rgba(255,255,255,0.58)" }}
            >
              Nếu anh/chị đang ở một trong những giai đoạn dưới đây, rất có thể những nội dung
              tôi chia sẻ sẽ phù hợp.
            </motion.p>
          </div>

          {/* ── Audience cards ── */}
          <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {audiences.map(({ n, text }) => (
              <AudienceCard key={n} n={n} text={text} />
            ))}
          </motion.div>

          {/* ── Closing statement — calm brand statement ── */}
          <motion.div
            variants={fadeUp}
            className="pt-10 border-t"
            style={{ borderColor: "rgba(255,255,255,0.08)" }}
          >
            <div className="max-w-2xl">
              {/* Short accent line */}
              <div
                className="mb-4"
                style={{ width: "1.5rem", height: "1.5px", background: "rgba(120,210,185,0.45)" }}
              />
              <p
                style={{
                  fontSize: "15.5px",
                  lineHeight: 1.9,
                  fontWeight: 300,
                  fontStyle: "italic",
                  color: "rgba(255,255,255,0.62)",
                  letterSpacing: "0.005em",
                }}
              >
                Nếu anh/chị đang tìm một hướng đi bình tĩnh hơn, thực tế hơn và có chiều sâu
                hơn với tài chính và cuộc sống — đây có thể là nơi phù hợp.
              </p>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}
