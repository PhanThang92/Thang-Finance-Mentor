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

          {/* Text Column */}
          <div className="space-y-7 max-w-2xl">
            <motion.div {...fadeUp(0.1)} className="flex items-center gap-3">
              <div className="h-px w-8 bg-accent/70" />
              <span className="text-xs font-semibold tracking-[0.18em] uppercase text-accent/90">
                Phan Văn Thắng SWC
              </span>
            </motion.div>

            <motion.h1
              {...fadeUp(0.2)}
              className="text-[1.65rem] sm:text-[2.1rem] md:text-[2.6rem] font-bold text-white leading-[1.18]"
            >
              Xây tài sản dài hạn{" "}
              <span className="text-white/75 font-normal">không bắt đầu từ may mắn.</span>
              <br />
              <span className="text-white/90">
                Nó bắt đầu từ kỷ luật, tư duy đúng và một hành trình nghiêm túc.
              </span>
            </motion.h1>

            <motion.p
              {...fadeUp(0.35)}
              className="text-base md:text-lg text-white/65 leading-[1.85] max-w-xl font-light"
            >
              Tôi chia sẻ về tư duy tài chính, đầu tư dài hạn, phát triển bản thân và cách xây
              dựng một hệ thống đủ vững để người bình thường có thể đi xa hơn trên hành trình tự
              do tài chính.
            </motion.p>

            <motion.p
              {...fadeUp(0.45)}
              className="text-sm md:text-[15px] text-white/45 leading-[1.85] max-w-xl italic"
            >
              Tôi không theo đuổi những lời hứa làm giàu nhanh. Tôi tin vào một con đường thực
              tế hơn — hiểu tiền đúng, sống kỷ luật hơn, đầu tư tỉnh táo hơn, và kiên trì đủ
              lâu để tài sản có cơ hội hình thành.
            </motion.p>

            <motion.div {...fadeUp(0.55)} className="flex flex-col sm:flex-row gap-3 pt-2">
              <a
                href="#noi-dung"
                className="inline-flex items-center justify-center h-12 px-7 rounded-full bg-primary text-white text-sm font-semibold tracking-wide hover:bg-primary/90 transition-all duration-200 shadow-lg shadow-primary/20 hover:shadow-primary/30"
                data-testid="btn-hero-explore"
              >
                Khám phá nội dung
              </a>
              <a
                href="#lien-he"
                className="inline-flex items-center justify-center h-12 px-7 rounded-full bg-white/8 text-white/90 text-sm font-medium border border-white/18 hover:bg-white/14 transition-all duration-200"
                data-testid="btn-hero-community"
              >
                Tham gia cộng đồng
              </a>
            </motion.div>
          </div>

          {/* Portrait Card */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="flex justify-center lg:justify-end"
          >
            <div className="relative w-72 md:w-80 lg:w-full">
              {/* Card */}
              <div
                className="w-full aspect-[3/4] rounded-2xl overflow-hidden flex flex-col items-center justify-center relative"
                style={{
                  background: "linear-gradient(160deg, #1a4a44 0%, #133833 60%, #0e2e2a 100%)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  boxShadow: "0 32px 64px -16px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)",
                }}
              >
                {/* Inner glow */}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(ellipse 80% 60% at 50% 30%, rgba(52,160,140,0.12) 0%, transparent 70%)",
                  }}
                />

                {/* Placeholder monogram */}
                <div className="relative z-10 flex flex-col items-center gap-4">
                  <div
                    className="w-24 h-24 rounded-full flex items-center justify-center"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.10)",
                    }}
                  >
                    <span className="text-3xl font-bold text-white/30 tracking-widest">PVT</span>
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-white/60 text-sm font-medium">Phan Văn Thắng</p>
                    <p className="text-white/35 text-xs">Mentor · Nhà đầu tư dài hạn</p>
                  </div>
                </div>

                {/* Decorative horizontal line */}
                <div
                  className="absolute bottom-24 left-8 right-8 h-px"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                />

                {/* Stats row at bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-5 flex justify-around">
                  {[
                    { n: "7+", label: "năm đầu tư" },
                    { n: "5+", label: "năm công nghệ" },
                  ].map((s) => (
                    <div key={s.label} className="text-center">
                      <p className="text-white/80 text-lg font-bold">{s.n}</p>
                      <p className="text-white/35 text-[11px] mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating badge */}
              <motion.div
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1, duration: 0.6 }}
                className="absolute -right-4 top-10 rounded-xl py-2.5 px-4 text-xs font-semibold text-white/90 shadow-xl"
                style={{
                  background: "rgba(30,80,70,0.85)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255,255,255,0.10)",
                }}
              >
                Đầu tư dài hạn
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
            <ArrowDown size={16} className="text-white/25" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
