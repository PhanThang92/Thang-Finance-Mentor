import React from "react";
import { motion } from "framer-motion";
import { BackgroundDecor } from "./BackgroundDecor";
import { ArrowDown } from "lucide-react";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.85, delay, ease: [0.22, 1, 0.36, 1] },
});

const trustItems = [
  "Tư duy dài hạn",
  "Kiến thức thực chiến",
  "Hệ thống nội dung chọn lọc",
];

export function HeroSection() {
  return (
    <section
      id="trang-chu"
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{ background: "linear-gradient(150deg, #0d2622 0%, #102a26 45%, #091e1b 100%)" }}
    >
      <BackgroundDecor />

      <div className="max-w-6xl mx-auto px-5 sm:px-8 relative z-10 w-full pt-24 pb-20 md:pt-32 md:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_390px] gap-10 lg:gap-14 items-center">

          {/* ── Text Column ── */}
          <div className="flex flex-col max-w-xl">

            {/* Eyebrow */}
            <motion.div {...fadeUp(0.1)} className="flex items-center gap-2.5 mb-7">
              <div
                className="flex-shrink-0"
                style={{ width: "1.75rem", height: "0.5px", background: "rgba(200,158,76,0.65)" }}
              />
              <span
                className="text-accent/78"
                style={{ fontSize: "10.5px", fontWeight: 600, letterSpacing: "0.22em", textTransform: "uppercase" }}
              >
                Phan Văn Thắng SWC
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              {...fadeUp(0.18)}
              className="text-white mb-7"
              style={{
                fontSize: "clamp(2.1rem, 5.5vw, 3.4rem)",
                fontWeight: 700,
                lineHeight: 1.16,
                letterSpacing: "-0.034em",
              }}
            >
              Tư duy tài chính đúng.{" "}
              <span style={{ color: "rgba(255,255,255,0.62)", fontWeight: 400 }}>
                Tích sản dài hạn.
              </span>
              <br />
              <span style={{ color: "rgba(255,255,255,0.88)", fontWeight: 500 }}>
                Đầu tư với góc nhìn thực chiến.
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              {...fadeUp(0.30)}
              className="mb-10"
              style={{
                fontSize: "15px",
                fontWeight: 400,
                color: "rgba(255,255,255,0.68)",
                lineHeight: 1.92,
                maxWidth: "30rem",
              }}
            >
              Chia sẻ kiến thức tài chính, đầu tư và phát triển bản thân theo hướng kỷ luật, dài hạn và bền vững — dành cho những người muốn xây nền tảng vững chắc thay vì tìm kiếm kết quả ngắn hạn.
            </motion.p>

            {/* Buttons */}
            <motion.div {...fadeUp(0.45)} className="flex flex-col sm:flex-row gap-2.5 mb-9">
              <a
                href="/tin-tuc"
                className="inline-flex items-center justify-center rounded-full text-white transition-all"
                style={{
                  height: "3rem",
                  padding: "0 2rem",
                  fontSize: "13.5px",
                  fontWeight: 600,
                  letterSpacing: "0.02em",
                  background: "linear-gradient(140deg, #22917f 0%, #1a7868 100%)",
                  boxShadow: "0 4px 20px rgba(20,115,98,0.30), inset 0 1px 0 rgba(255,255,255,0.14)",
                  transition: "box-shadow 0.22s ease, transform 0.22s ease",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.boxShadow = "0 5px 22px rgba(20,115,98,0.40), inset 0 1px 0 rgba(255,255,255,0.16)";
                  el.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.boxShadow = "0 3px 16px rgba(20,115,98,0.28), inset 0 1px 0 rgba(255,255,255,0.13)";
                  el.style.transform = "translateY(0)";
                }}
                data-testid="btn-hero-explore"
              >
                Khám phá bài viết
              </a>

              <a
                href="#dich-vu"
                className="inline-flex items-center justify-center rounded-full transition-all"
                style={{
                  height: "3rem",
                  padding: "0 2rem",
                  fontSize: "13.5px",
                  fontWeight: 450,
                  letterSpacing: "0.01em",
                  color: "rgba(255,255,255,0.75)",
                  background: "rgba(255,255,255,0.058)",
                  border: "1px solid rgba(255,255,255,0.16)",
                  backdropFilter: "blur(12px)",
                  transition: "background 0.22s ease, border-color 0.22s ease, color 0.22s ease",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = "rgba(255,255,255,0.085)";
                  el.style.borderColor = "rgba(255,255,255,0.22)";
                  el.style.color = "rgba(255,255,255,0.90)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = "rgba(255,255,255,0.055)";
                  el.style.borderColor = "rgba(255,255,255,0.15)";
                  el.style.color = "rgba(255,255,255,0.75)";
                }}
                data-testid="btn-hero-service"
              >
                Tìm hiểu hướng đồng hành
              </a>
            </motion.div>

            {/* Trust line */}
            <motion.div
              {...fadeUp(0.60)}
              className="flex flex-wrap items-center gap-x-5 gap-y-2"
            >
              {trustItems.map((item, i) => (
                <React.Fragment key={item}>
                  {i > 0 && (
                    <span
                      aria-hidden="true"
                      style={{ width: "3px", height: "3px", borderRadius: "50%", background: "rgba(255,255,255,0.26)", flexShrink: 0 }}
                    />
                  )}
                  <span style={{ fontSize: "12px", fontWeight: 400, color: "rgba(255,255,255,0.44)", letterSpacing: "0.025em" }}>
                    {item}
                  </span>
                </React.Fragment>
              ))}
            </motion.div>
          </div>

          {/* ── Portrait Column ── */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex justify-center lg:justify-end"
          >
            <div className="w-60 sm:w-72 lg:w-full max-w-[360px]">

              {/* Image frame */}
              <div
                className="relative w-full overflow-hidden"
                style={{ borderRadius: "1.5rem", aspectRatio: "4/5" }}
              >
                <img
                  src="/portrait.png"
                  alt="Phan Văn Thắng SWC"
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{
                    objectPosition: "60% 10%",
                    filter: "brightness(1.08) contrast(1.05) saturate(0.93)",
                  }}
                />

                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(to bottom, transparent 0%, transparent 24%, rgba(255,255,255,0.045) 42%, rgba(255,255,255,0.07) 58%, rgba(255,255,255,0.03) 72%, transparent 82%)",
                    mixBlendMode: "screen",
                  }}
                />

                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(to right, #0d2622 0%, rgba(13,38,34,0.62) 16%, rgba(13,38,34,0.14) 35%, transparent 56%)",
                  }}
                />

                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(to top, #091e1b 0%, rgba(9,30,27,0.75) 20%, transparent 48%)",
                  }}
                />

                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(to bottom, rgba(9,30,27,0.28) 0%, transparent 24%)",
                  }}
                />

                {/* Metrics */}
                <div className="absolute bottom-0 left-0 right-0 px-5 pb-4.5 z-10">
                  <div
                    className="mb-3"
                    style={{ height: "0.5px", background: "rgba(255,255,255,0.09)" }}
                  />
                  <div className="flex items-start gap-5">
                    {[
                      { n: "7+", label: "năm đầu tư dài hạn" },
                      { n: "5+", label: "năm công nghệ" },
                    ].map((s, i) => (
                      <React.Fragment key={s.label}>
                        {i > 0 && (
                          <div
                            className="self-stretch"
                            style={{ width: "0.5px", background: "rgba(255,255,255,0.09)", flexShrink: 0 }}
                          />
                        )}
                        <div>
                          <p
                            className="text-white leading-none"
                            style={{ fontSize: "0.95rem", fontWeight: 600, letterSpacing: "-0.01em" }}
                          >
                            {s.n}
                          </p>
                          <p
                            style={{
                              fontSize: "9.5px",
                              fontWeight: 400,
                              color: "rgba(255,255,255,0.40)",
                              letterSpacing: "0.06em",
                              lineHeight: 1.5,
                              marginTop: "3px",
                            }}
                          >
                            {s.label}
                          </p>
                        </div>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>

              {/* Signature caption */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.7 }}
                className="mt-3.5 flex items-center gap-3"
              >
                <div style={{ flexGrow: 1, height: "0.5px", background: "rgba(255,255,255,0.12)" }} />
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 500,
                    color: "rgba(255,255,255,0.52)",
                    letterSpacing: "0.03em",
                    whiteSpace: "nowrap",
                  }}
                >
                  Phan Văn Thắng · Mentor tài chính dài hạn
                </span>
                <div style={{ flexGrow: 1, height: "0.5px", background: "rgba(255,255,255,0.12)" }} />
              </motion.div>
            </div>
          </motion.div>

        </div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowDown size={14} style={{ color: "rgba(255,255,255,0.18)" }} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
