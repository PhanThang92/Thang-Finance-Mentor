import React from "react";
import { motion } from "framer-motion";
import { BackgroundDecor } from "./BackgroundDecor";

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.22 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

const beliefs = [
  {
    key: "Tiền bạc phản chiếu tư duy.",
    body: "Cách một người sử dụng tiền thường cho thấy họ đang nhìn cuộc đời ngắn hay dài, nông hay sâu.",
  },
  {
    key: "Đầu tư phản chiếu bản lĩnh.",
    body: "Không phải lúc thị trường thuận lợi, mà chính trong biến động, cảm xúc và sự bất định, con người mới bộc lộ rõ nhất nền tảng của mình.",
  },
  {
    key: "Tài sản phản chiếu hệ thống sống.",
    body: "Nếu một người không có kỷ luật, không có nguyên tắc và không có định hướng dài hạn, rất khó để tài sản được hình thành một cách bền vững.",
  },
];

export function PhilosophySection() {
  return (
    <section
      className="relative py-28 md:py-40 text-white overflow-hidden"
      style={{ background: "linear-gradient(165deg, #0c2420 0%, #0a1f1c 55%, #091c18 100%)" }}
    >
      <BackgroundDecor />

      <div className="max-w-4xl mx-auto px-5 sm:px-8 relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
          className="space-y-16"
        >
          {/* Header */}
          <div className="space-y-4">
            <motion.div variants={fadeUp} className="flex items-center gap-3">
              <div className="h-px w-8" style={{ background: "rgba(200,160,80,0.55)" }} />
              <span
                className="text-xs font-semibold tracking-[0.18em] uppercase"
                style={{ color: "rgba(200,160,80,0.75)" }}
              >
                Tuyên ngôn
              </span>
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-bold text-white">
              Tuyên ngôn của tôi
            </motion.h2>
          </div>

          {/* Opening paragraphs */}
          <motion.div variants={fadeUp} className="space-y-6 max-w-2xl">
            <p
              className="font-light"
              style={{
                fontSize: "18px",
                lineHeight: 1.88,
                color: "rgba(255,255,255,0.84)",
                letterSpacing: "-0.008em",
              }}
            >
              Tôi tin rằng tự do tài chính không phải là đặc quyền của một số ít người may mắn.
            </p>
            <p
              className="font-light"
              style={{
                fontSize: "16px",
                lineHeight: 1.85,
                color: "rgba(255,255,255,0.56)",
              }}
            >
              Nó là kết quả của một quá trình đủ dài, đủ tỉnh táo và đủ kỷ luật.
            </p>
          </motion.div>

          {/* Divider */}
          <motion.div
            variants={fadeUp}
            className="h-px max-w-xs"
            style={{ background: "rgba(255,255,255,0.07)" }}
          />

          {/* Belief trio */}
          <motion.div variants={stagger} className="space-y-10">
            <motion.p variants={fadeUp} className="text-white/50 text-sm font-medium tracking-wide">
              Tôi cũng tin rằng:
            </motion.p>
            {beliefs.map(({ key, body }) => (
              <motion.div
                key={key}
                variants={fadeUp}
                className="flex gap-5"
              >
                <div
                  className="flex-shrink-0 w-0.5 rounded-full self-stretch mt-1"
                  style={{ background: "rgba(52,160,140,0.46)" }}
                />
                <div className="space-y-2.5">
                  <p
                    style={{
                      fontSize: "16px",
                      fontWeight: 600,
                      color: "rgba(255,255,255,0.92)",
                      letterSpacing: "-0.005em",
                      lineHeight: 1.3,
                    }}
                  >
                    {key}
                  </p>
                  <p
                    className="font-light"
                    style={{
                      fontSize: "15px",
                      lineHeight: 1.88,
                      color: "rgba(255,255,255,0.60)",
                    }}
                  >
                    {body}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Divider */}
          <motion.div
            variants={fadeUp}
            className="h-px max-w-xs"
            style={{ background: "rgba(255,255,255,0.07)" }}
          />

          {/* Closing */}
          <motion.div variants={fadeUp} className="space-y-4 max-w-2xl">
            <p className="text-[16px] leading-[1.9] text-white/65 font-light">
              Vì vậy, điều tôi muốn xây không chỉ là những nội dung về đầu tư.
            </p>
            <p className="text-[17px] leading-[1.9] text-white/80">
              Tôi muốn cùng anh/chị xây một hành trình lớn hơn thế — một hành trình sống chủ
              động hơn, hiểu giá trị của thời gian hơn, làm chủ bản thân tốt hơn, và từ đó từng
              bước tạo ra một nền tài chính vững hơn cho tương lai.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
