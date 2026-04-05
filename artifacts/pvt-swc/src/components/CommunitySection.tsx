import React from "react";
import { motion } from "framer-motion";

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.13 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

const paths = [
  {
    num: "01",
    label: "Bắt đầu nhẹ",
    title: "Theo dõi nội dung miễn phí",
    anchor: "Phù hợp nếu anh/chị đang ở giai đoạn bắt đầu.",
    desc: "Nếu anh/chị đang ở giai đoạn bắt đầu, đây là cách phù hợp nhất. Hãy xem video, đọc bài viết, tiếp nhận dần các góc nhìn nền tảng và xây tư duy đúng trước.",
  },
  {
    num: "02",
    label: "Đi cùng cộng đồng",
    title: "Tham gia cộng đồng",
    anchor: "Một môi trường tốt giúp hành trình dài hạn bền hơn.",
    desc: "Nếu anh/chị muốn có môi trường để học cùng người khác, trao đổi, duy trì động lực và đi đường dài vững hơn, cộng đồng sẽ là nơi phù hợp hơn việc đi một mình.",
  },
  {
    num: "03",
    label: "Đi sâu hơn",
    title: "Chương trình chuyên sâu",
    anchor: "Dành cho người muốn đi sâu hơn với lộ trình nghiêm túc.",
    desc: "Nếu anh/chị muốn đi sâu hơn vào kiến thức, công cụ, hệ thống hoặc một lộ trình nghiêm túc hơn, tôi có những chương trình phù hợp cho từng giai đoạn phát triển.",
  },
];

export function CommunitySection() {
  return (
    <section id="cong-dong" className="py-24 md:py-32 bg-background">
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
              <span className="section-label">Cộng đồng</span>
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
              Những cách anh/chị có thể đồng hành cùng tôi
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
              Mỗi người đang ở một giai đoạn khác nhau. Vì vậy, tôi muốn giữ nhiều cách đồng hành
              để anh/chị có thể bắt đầu từ nơi phù hợp nhất với mình.
            </motion.p>
          </div>

          {/* ── Path cards ── */}
          <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {paths.map(({ num, label, title, anchor, desc }) => (
              <motion.div
                key={num}
                variants={fadeUp}
                className="flex flex-col rounded-xl bg-card"
                style={{
                  border: "1px solid hsl(var(--border) / 0.92)",
                  padding: "1.75rem 1.625rem",
                  boxShadow: "0 2px 8px rgba(10,40,35,0.07)",
                  transition: "border-color 0.28s ease, box-shadow 0.28s ease, transform 0.28s ease",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = "hsl(var(--primary) / 0.28)";
                  el.style.boxShadow = "0 4px 20px rgba(10,40,35,0.09)";
                  el.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = "hsl(var(--border) / 0.92)";
                  el.style.boxShadow = "0 2px 8px rgba(10,40,35,0.07)";
                  el.style.transform = "translateY(0)";
                }}
              >
                {/* Editorial marker row */}
                <div className="flex items-center gap-3 mb-5">
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      letterSpacing: "0.13em",
                      color: "hsl(var(--primary) / 0.72)",
                      lineHeight: 1,
                      flexShrink: 0,
                    }}
                  >
                    {num}
                  </span>
                  <div
                    style={{
                      width: "2rem",
                      height: "1px",
                      flexShrink: 0,
                      background: "hsl(var(--primary) / 0.28)",
                    }}
                  />
                  {/* Soft engagement label — inline after the rule */}
                  <span
                    style={{
                      fontSize: "10.5px",
                      fontWeight: 400,
                      fontStyle: "italic",
                      letterSpacing: "0.01em",
                      color: "hsl(var(--muted-foreground) / 0.58)",
                      lineHeight: 1,
                    }}
                  >
                    {label}
                  </span>
                </div>

                {/* Title */}
                <h3
                  className="text-foreground mb-2"
                  style={{
                    fontSize: "16.5px",
                    fontWeight: 700,
                    lineHeight: 1.3,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {title}
                </h3>

                {/* Anchor line */}
                <p
                  className="mb-4"
                  style={{
                    fontSize: "12.5px",
                    fontWeight: 500,
                    fontStyle: "italic",
                    color: "hsl(var(--primary) / 0.82)",
                    lineHeight: 1.55,
                    letterSpacing: "0.005em",
                  }}
                >
                  {anchor}
                </p>

                {/* Body */}
                <p
                  style={{
                    fontSize: "13.5px",
                    lineHeight: 1.88,
                    fontWeight: 400,
                    color: "hsl(var(--muted-foreground))",
                  }}
                >
                  {desc}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* ── Closing note ── */}
          <motion.div variants={fadeUp} className="flex items-center gap-4 pt-1">
            <div
              style={{
                width: "1.75rem",
                height: "1px",
                flexShrink: 0,
                background: "hsl(var(--border))",
              }}
            />
            <p
              style={{
                fontSize: "13px",
                fontWeight: 400,
                fontStyle: "italic",
                color: "hsl(var(--muted-foreground) / 0.82)",
                lineHeight: 1.65,
              }}
            >
              Tôi ưu tiên sự phù hợp hơn số lượng. Không phải nội dung nào hay chương trình nào
              cũng dành cho tất cả mọi người.
            </p>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}
