import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.11 } },
};

const services = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 6h16M4 10h12M4 14h8M4 18h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    title: "Bài viết phân tích & chia sẻ góc nhìn",
    desc: "Các bài viết tập trung vào tư duy tài chính, đầu tư, tích sản và những quan sát thực tế từ hành trình làm nghề.",
    link: "/tin-tuc",
    linkText: "Xem thêm",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
        <path d="M4 20c0-3.314 3.582-6 8-6s8 2.686 8 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    title: "Hướng đồng hành phù hợp",
    desc: "Tùy theo nhu cầu, người đọc có thể tìm hiểu thêm các hình thức kết nối, tư vấn hoặc định hướng phù hợp.",
    link: "/cong-dong",
    linkText: "Xem thêm",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="3" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <rect x="13" y="3" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <rect x="3" y="13" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <rect x="13" y="13" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
    title: "Nội dung chọn lọc theo chủ đề",
    desc: "Hệ thống nội dung được sắp xếp theo nhóm chủ đề để giúp việc theo dõi và học hỏi dễ dàng hơn.",
    link: "/tin-tuc",
    linkText: "Xem thêm",
  },
];

export function ServicesSection() {
  return (
    <section
      id="dich-vu"
      className="py-24 md:py-32"
      style={{ background: "linear-gradient(180deg, #0f2823 0%, #0a1f1c 100%)" }}
    >
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
              <div style={{ height: "0.5px", width: "2rem", background: "rgba(52,160,140,0.55)", flexShrink: 0 }} />
              <span style={{
                fontSize: "10.5px", fontWeight: 600, letterSpacing: "0.18em",
                textTransform: "uppercase", color: "rgba(52,160,140,0.80)",
              }}>
                Dịch vụ
              </span>
            </motion.div>
            <motion.h2
              variants={fadeUp}
              style={{
                fontSize: "clamp(1.5rem, 3.4vw, 2.1rem)",
                fontWeight: 700,
                lineHeight: 1.22,
                letterSpacing: "-0.020em",
                color: "rgba(255,255,255,0.92)",
              }}
            >
              Những gì bạn có thể tìm thấy tại đây
            </motion.h2>
            <motion.p
              variants={fadeUp}
              style={{
                fontSize: "15px",
                lineHeight: 1.88,
                fontWeight: 400,
                color: "rgba(255,255,255,0.50)",
                maxWidth: "36rem",
              }}
            >
              Không phải một website để hứa hẹn kết quả nhanh. Đây là nơi tổng hợp nội dung, góc nhìn và các hướng đồng hành phù hợp cho người muốn phát triển tài chính theo cách bài bản hơn.
            </motion.p>
          </div>

          {/* ── Cards ── */}
          <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {services.map(({ icon, title, desc, link, linkText }) => (
              <motion.div
                key={title}
                variants={fadeUp}
                className="flex flex-col rounded-xl"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  padding: "1.875rem",
                  transition: "background 0.24s ease, border-color 0.24s ease, transform 0.24s ease",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = "rgba(52,160,140,0.08)";
                  el.style.borderColor = "rgba(52,160,140,0.20)";
                  el.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = "rgba(255,255,255,0.04)";
                  el.style.borderColor = "rgba(255,255,255,0.08)";
                  el.style.transform = "translateY(0)";
                }}
              >
                {/* Icon */}
                <div
                  className="mb-6"
                  style={{
                    width: "46px",
                    height: "46px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "12px",
                    background: "rgba(52,160,140,0.12)",
                    border: "1px solid rgba(52,160,140,0.18)",
                    color: "rgba(52,160,140,0.90)",
                    flexShrink: 0,
                  }}
                >
                  {icon}
                </div>

                {/* Title */}
                <p
                  className="mb-3"
                  style={{
                    fontSize: "15px",
                    fontWeight: 600,
                    letterSpacing: "-0.010em",
                    color: "rgba(255,255,255,0.88)",
                    lineHeight: 1.35,
                    flex: "0 0 auto",
                  }}
                >
                  {title}
                </p>

                {/* Desc */}
                <p
                  className="flex-grow mb-6"
                  style={{
                    fontSize: "13.5px",
                    lineHeight: 1.84,
                    fontWeight: 400,
                    color: "rgba(255,255,255,0.45)",
                  }}
                >
                  {desc}
                </p>

                {/* Link */}
                <a
                  href={link}
                  className="inline-flex items-center gap-1.5 group/link"
                  style={{
                    fontSize: "12.5px",
                    fontWeight: 500,
                    color: "rgba(52,160,140,0.80)",
                    textDecoration: "none",
                    letterSpacing: "0.008em",
                    transition: "color 0.18s ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.color = "rgba(52,160,140,1)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.color = "rgba(52,160,140,0.80)";
                  }}
                >
                  {linkText}
                  <ArrowRight size={12} strokeWidth={2} className="group-hover/link:translate-x-0.5 transition-transform" />
                </a>
              </motion.div>
            ))}
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}
