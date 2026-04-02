import React from "react";
import { motion } from "framer-motion";
import { BackgroundDecor } from "./BackgroundDecor";
import { ArrowDown } from "lucide-react";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] },
});

export function HeroSection() {
  return (
    <section
      id="trang-chu"
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{ background: "linear-gradient(145deg, #0c2420 0%, #102a26 40%, #0a1f1c 100%)" }}
    >
      <BackgroundDecor />

      <div className="max-w-6xl mx-auto px-5 sm:px-8 relative z-10 w-full pt-24 pb-20 md:pt-32 md:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12 lg:gap-16 items-center">

          {/* ── Text Column ── */}
          <div className="space-y-6 max-w-2xl">

            {/* Brand label */}
            <motion.div {...fadeUp(0.1)} className="flex items-center gap-3">
              <div className="h-px w-7 bg-accent/65" />
              <span className="text-[11px] font-semibold tracking-[0.20em] uppercase text-accent/80">
                Phan Văn Thắng SWC
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              {...fadeUp(0.2)}
              className="text-[1.65rem] sm:text-[2.1rem] md:text-[2.6rem] font-bold text-white leading-[1.18]"
            >
              Xây tài sản dài hạn{" "}
              <span className="text-white/70 font-normal">không bắt đầu từ may mắn.</span>
              <br />
              <span className="text-white/88">
                Nó bắt đầu từ kỷ luật, tư duy đúng và một hành trình nghiêm túc.
              </span>
            </motion.h1>

            {/* 1. Body text — main supporting paragraph, clearer weight */}
            <motion.p
              {...fadeUp(0.32)}
              className="text-[15px] md:text-[15.5px] text-white/68 leading-[1.9] max-w-lg"
              style={{ fontWeight: 400 }}
            >
              Tôi chia sẻ về tư duy tài chính, đầu tư dài hạn, phát triển bản thân và cách xây
              dựng một hệ thống đủ vững để người bình thường có thể đi xa hơn trên hành trình tự
              do tài chính.
            </motion.p>

            {/* 1. Secondary paragraph — softer, visually lighter */}
            <motion.p
              {...fadeUp(0.42)}
              className="text-[12.5px] md:text-[13px] text-white/36 leading-[1.95] max-w-lg italic"
              style={{ fontWeight: 300 }}
            >
              Tôi không theo đuổi những lời hứa làm giàu nhanh. Tôi tin vào một con đường thực
              tế hơn: hiểu tiền đúng, sống kỷ luật hơn, đầu tư tỉnh táo hơn và kiên trì đủ lâu
              để tài sản có cơ hội hình thành.
            </motion.p>

            {/* 2. CTA buttons — premium, polished */}
            <motion.div {...fadeUp(0.52)} className="flex flex-col sm:flex-row gap-3 pt-3">
              {/* Primary — brighter teal, clean shadow, smooth hover */}
              <a
                href="#noi-dung"
                className="inline-flex items-center justify-center h-11 px-7 rounded-full text-[13.5px] font-semibold tracking-[0.02em] text-white transition-all duration-250"
                style={{
                  background: "linear-gradient(135deg, #1f9e8a 0%, #1a8876 100%)",
                  boxShadow: "0 4px 18px rgba(26,136,118,0.30), inset 0 1px 0 rgba(255,255,255,0.12)",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.boxShadow = "0 6px 24px rgba(26,136,118,0.42), inset 0 1px 0 rgba(255,255,255,0.15)";
                  el.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.boxShadow = "0 4px 18px rgba(26,136,118,0.30), inset 0 1px 0 rgba(255,255,255,0.12)";
                  el.style.transform = "translateY(0)";
                }}
                data-testid="btn-hero-explore"
              >
                Khám phá nội dung
              </a>

              {/* Secondary — dark glass, refined border */}
              <a
                href="#lien-he"
                className="inline-flex items-center justify-center h-11 px-7 rounded-full text-[13.5px] font-medium text-white/80 transition-all duration-250"
                style={{
                  background: "rgba(255,255,255,0.055)",
                  border: "1px solid rgba(255,255,255,0.13)",
                  backdropFilter: "blur(8px)",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = "rgba(255,255,255,0.09)";
                  el.style.borderColor = "rgba(255,255,255,0.20)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = "rgba(255,255,255,0.055)";
                  el.style.borderColor = "rgba(255,255,255,0.13)";
                }}
                data-testid="btn-hero-community"
              >
                Tham gia cộng đồng
              </a>
            </motion.div>
          </div>

          {/* ── Portrait Column ── */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="flex justify-center lg:justify-end"
          >
            <div className="relative w-64 sm:w-72 lg:w-full max-w-[380px]">

              {/* Portrait image wrapper */}
              <div
                className="relative w-full overflow-hidden"
                style={{ borderRadius: "1.25rem", aspectRatio: "3/4" }}
              >
                {/* 5. Photo — slight brightness/contrast lift for better suit/shoulder area */}
                <img
                  src="/portrait.png"
                  alt="Phan Văn Thắng SWC"
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{
                    objectPosition: "60% 12%",
                    filter: "brightness(1.07) contrast(1.04) saturate(0.96)",
                  }}
                />

                {/* Left edge fade */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(to right, #0c2420 0%, rgba(12,36,32,0.68) 18%, rgba(12,36,32,0.18) 38%, transparent 60%)",
                  }}
                />

                {/* Bottom fade */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(to top, #0a1f1c 0%, rgba(10,31,28,0.72) 24%, transparent 52%)",
                  }}
                />

                {/* Top vignette */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(to bottom, rgba(10,31,28,0.30) 0%, transparent 26%)",
                  }}
                />

                {/* 3. Metrics — refined, smaller, more editorial */}
                <div className="absolute bottom-0 left-0 right-0 px-5 pb-5 z-10">
                  {/* Thin separator line */}
                  <div
                    className="mb-3.5"
                    style={{ height: "0.5px", background: "rgba(255,255,255,0.10)" }}
                  />
                  <div className="flex items-start gap-6">
                    {[
                      { n: "7+", label: "năm đầu tư dài hạn" },
                      { n: "5+", label: "năm công nghệ" },
                    ].map((s) => (
                      <div key={s.label} className="space-y-0.5">
                        <p
                          className="text-white leading-none"
                          style={{ fontSize: "1.05rem", fontWeight: 600, letterSpacing: "-0.01em" }}
                        >
                          {s.n}
                        </p>
                        <p
                          className="text-white/42"
                          style={{ fontSize: "10px", fontWeight: 400, letterSpacing: "0.04em", lineHeight: 1.5 }}
                        >
                          {s.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 4. Caption — brighter, medium weight, refined divider */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1, duration: 0.6 }}
                className="mt-4 flex items-center gap-2.5"
              >
                <div style={{ flexGrow: 1, height: "0.5px", background: "rgba(255,255,255,0.14)" }} />
                <span
                  className="text-white/55 whitespace-nowrap"
                  style={{ fontSize: "11.5px", fontWeight: 500, letterSpacing: "0.025em" }}
                >
                  Phan Văn Thắng · Mentor tài chính dài hạn
                </span>
                <div style={{ flexGrow: 1, height: "0.5px", background: "rgba(255,255,255,0.14)" }} />
              </motion.div>
            </div>
          </motion.div>

        </div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowDown size={15} className="text-white/20" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
