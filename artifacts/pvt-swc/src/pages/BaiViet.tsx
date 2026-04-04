import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { BackgroundDecor } from "@/components/BackgroundDecor";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.09 } } };

export default function BaiViet() {
  React.useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, []);

  return (
    <section
      className="relative overflow-hidden min-h-[80vh] flex items-center"
      style={{ background: "linear-gradient(150deg, #0d2622 0%, #102a26 45%, #091e1b 100%)" }}
    >
      <BackgroundDecor />
      <div className="max-w-5xl mx-auto px-5 sm:px-8 relative z-10 py-40">
        <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-xl space-y-6">
          <motion.div variants={fadeUp} className="flex items-center gap-2.5">
            <div style={{ width: "1.75rem", height: "0.5px", background: "rgba(200,158,76,0.65)", flexShrink: 0 }} />
            <span style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(200,158,76,0.78)" }}>
              Bài viết
            </span>
          </motion.div>
          <motion.h1 variants={fadeUp} className="text-white" style={{ fontSize: "clamp(1.9rem, 4.8vw, 3rem)", fontWeight: 700, lineHeight: 1.14, letterSpacing: "-0.030em" }}>
            Bài viết chuyên sâu
          </motion.h1>
          <motion.p variants={fadeUp} style={{ fontSize: "16px", color: "rgba(255,255,255,0.60)", lineHeight: 1.8 }}>
            Thư viện bài viết phân tích chuyên sâu đang được cập nhật và tổ chức lại. Trong thời gian này, bạn có thể xem các bài viết và chia sẻ tại mục Tin tức.
          </motion.p>
          <motion.div variants={fadeUp}>
            <a href="/tin-tuc" className="inline-flex items-center gap-2 rounded-full text-white" style={{ height: "2.875rem", padding: "0 1.75rem", fontSize: "13.5px", fontWeight: 600, background: "linear-gradient(140deg, #22917f 0%, #1a7868 100%)", boxShadow: "0 4px 20px rgba(20,115,98,0.30), inset 0 1px 0 rgba(255,255,255,0.14)", textDecoration: "none", gap: "8px", display: "inline-flex", alignItems: "center" }}>
              Xem nội dung tại Tin tức
              <ArrowRight size={14} strokeWidth={2} />
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
