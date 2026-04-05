import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { BackgroundDecor } from "@/components/BackgroundDecor";
import { useSeoMeta } from "@/hooks/useSeoMeta";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};

const hubs = [
  {
    eyebrow: "Bài viết",
    title: "Bài viết chuyên sâu",
    desc: "Những bài chia sẻ và phân tích về tài chính cá nhân, đầu tư và tư duy tích sản theo hướng thực tế và dài hạn.",
    href: "/bai-viet",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 6h16M4 10h12M4 14h8M4 18h10" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    eyebrow: "Video",
    title: "Thư viện video",
    desc: "Nội dung video từ kênh YouTube — các bài giảng, phân tích và chia sẻ góc nhìn tài chính theo hình thức dễ tiếp cận hơn.",
    href: "/video",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="2" y="5" width="20" height="14" rx="2.5" stroke="hsl(var(--primary))" strokeWidth="1.5" />
        <path d="M10 9l5 3-5 3V9z" fill="hsl(var(--primary))" fillOpacity="0.7" />
      </svg>
    ),
  },
  {
    eyebrow: "Chủ đề",
    title: "Khám phá theo chủ đề",
    desc: "Nội dung được tổ chức theo từng nhóm kiến thức rõ ràng — giúp bạn tìm đúng chủ đề mình cần tìm hiểu.",
    href: "/chu-de",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="5" cy="6" r="1.5" fill="hsl(var(--primary))" />
        <circle cx="5" cy="12" r="1.5" fill="hsl(var(--primary))" />
        <circle cx="5" cy="18" r="1.5" fill="hsl(var(--primary))" />
        <path d="M9 6h10M9 12h10M9 18h10" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    eyebrow: "Series nổi bật",
    title: "Chuỗi nội dung chính",
    desc: "Theo dõi các chuỗi bài viết và nội dung có hệ thống — được xây dựng để bạn học theo lộ trình, không rời rạc.",
    href: "/series",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M3 5h18M3 10h14M3 15h18M3 20h10" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="19" cy="20" r="2" stroke="hsl(var(--primary))" strokeWidth="1.5" />
      </svg>
    ),
  },
];

export default function KienThuc() {
  useSeoMeta({
    title: "Kho Kiến Thức",
    description: "Tổng hợp bài viết, video và tài nguyên về tư duy đầu tư, tài chính cá nhân và hành trình tích sản dài hạn từ Phan Văn Thắng SWC.",
    keywords: "kiến thức đầu tư, tài chính cá nhân, tư duy tích sản, Phan Văn Thắng SWC",
    canonicalUrl: "https://thangswc.com/kien-thuc",
  });

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  return (
    <>
      {/* ── Hero ── */}
      <section
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(150deg, #0d2622 0%, #102a26 45%, #091e1b 100%)",
          paddingTop: "clamp(5.5rem, 14vw, 9rem)",
          paddingBottom: "clamp(3.5rem, 9vw, 6rem)",
        }}
      >
        <BackgroundDecor />
        <div className="max-w-5xl mx-auto px-5 sm:px-8 relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="max-w-2xl space-y-5"
          >
            <motion.div variants={fadeUp} className="flex items-center gap-2.5">
              <div style={{ width: "1.75rem", height: "0.5px", background: "rgba(200,158,76,0.65)", flexShrink: 0 }} />
              <span style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(200,158,76,0.78)" }}>
                Kiến thức
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-white"
              style={{
                fontSize: "clamp(1.9rem, 4.8vw, 3rem)",
                fontWeight: 700,
                lineHeight: 1.14,
                letterSpacing: "-0.030em",
              }}
            >
              Thư viện nội dung và tri thức thực chiến
            </motion.h1>

            <motion.p
              variants={fadeUp}
              style={{
                fontSize: "16px",
                fontWeight: 400,
                color: "rgba(255,255,255,0.62)",
                lineHeight: 1.78,
              }}
            >
              Nơi tổng hợp bài viết, video, chủ đề và các chuỗi nội dung giúp bạn tiếp cận tài chính, đầu tư và tư duy tích sản theo hướng rõ ràng hơn, thực tế hơn và dài hạn hơn.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ── Hub cards ── */}
      <section className="py-28 md:py-36 bg-background">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 gap-5"
          >
            {hubs.map(({ eyebrow, title, desc, href, icon }) => (
              <motion.a
                key={title}
                variants={fadeUp}
                href={href}
                className="group flex flex-col rounded-xl p-7"
                style={{
                  background:    "hsl(var(--card))",
                  border:        "1px solid hsl(var(--border) / 0.55)",
                  boxShadow:     "0 2px 8px rgba(10,40,35,0.06), 0 1px 2px rgba(10,40,35,0.04)",
                  textDecoration: "none",
                  transition:    "border-color 0.26s ease, box-shadow 0.26s ease, transform 0.26s ease",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = "hsl(var(--primary) / 0.28)";
                  el.style.boxShadow   = "0 6px 22px rgba(10,40,35,0.10), 0 2px 4px rgba(10,40,35,0.05)";
                  el.style.transform   = "translateY(-3px)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = "hsl(var(--border) / 0.55)";
                  el.style.boxShadow   = "0 2px 8px rgba(10,40,35,0.06), 0 1px 2px rgba(10,40,35,0.04)";
                  el.style.transform   = "translateY(0)";
                }}
              >
                <div
                  className="mb-5 flex items-center justify-center rounded-lg"
                  style={{
                    width: "50px", height: "50px",
                    background: "hsl(var(--primary) / 0.07)",
                    border: "1px solid hsl(var(--primary) / 0.13)",
                    flexShrink: 0,
                  }}
                >
                  {icon}
                </div>

                <p className="mb-1" style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "hsl(var(--primary) / 0.68)" }}>
                  {eyebrow}
                </p>
                <p className="mb-2.5" style={{ fontSize: "16px", fontWeight: 600, letterSpacing: "-0.012em", color: "hsl(var(--foreground))", lineHeight: 1.3 }}>
                  {title}
                </p>
                <p style={{ fontSize: "13.5px", lineHeight: 1.82, fontWeight: 400, color: "hsl(var(--muted-foreground))", flex: 1 }}>
                  {desc}
                </p>

                <div className="mt-5 flex items-center gap-1.5" style={{ color: "hsl(var(--primary))", fontSize: "13px", fontWeight: 500 }}>
                  <span>Khám phá</span>
                  <ArrowRight size={12} strokeWidth={2} style={{ transition: "transform 0.2s ease" }} className="group-hover:translate-x-0.5" />
                </div>
              </motion.a>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Footer CTA ── */}
      <section
        className="relative overflow-hidden py-24 md:py-32"
        style={{ background: "hsl(var(--card))", borderTop: "1px solid hsl(var(--border) / 0.45)" }}
      >
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-6"
          >
            <motion.div variants={fadeUp} className="space-y-2 max-w-lg">
              <p style={{ fontSize: "clamp(1.25rem, 3vw, 1.65rem)", fontWeight: 700, letterSpacing: "-0.020em", color: "hsl(var(--foreground))", lineHeight: 1.25 }}>
                Hoặc bắt đầu từ những cập nhật mới nhất
              </p>
              <p style={{ fontSize: "14px", color: "hsl(var(--muted-foreground))", lineHeight: 1.75 }}>
                Tin tức, thông báo và hoạt động cộng đồng từ Phan Văn Thắng SWC.
              </p>
            </motion.div>
            <motion.div variants={fadeUp}>
              <a
                href="/tin-tuc"
                className="inline-flex items-center gap-2 rounded-full"
                style={{
                  height: "2.75rem",
                  padding: "0 1.5rem",
                  fontSize: "13.5px",
                  fontWeight: 600,
                  background: "hsl(var(--primary))",
                  color: "#fff",
                  textDecoration: "none",
                  boxShadow: "0 2px 12px rgba(10,40,35,0.16)",
                  transition: "background 0.2s ease, box-shadow 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = "hsl(var(--primary) / 0.88)";
                  el.style.boxShadow  = "0 4px 20px rgba(10,40,35,0.22)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = "hsl(var(--primary))";
                  el.style.boxShadow  = "0 2px 12px rgba(10,40,35,0.16)";
                }}
              >
                Xem tin tức
                <ArrowRight size={13} strokeWidth={2} />
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
