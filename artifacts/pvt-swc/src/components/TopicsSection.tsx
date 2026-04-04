import React from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { newsApi } from "@/lib/newsApi";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

/* ── Static topic cards (fallback + enrich) ── */
const STATIC_TOPICS = [
  {
    slug: "tai-chinh-ca-nhan",
    name: "Tài chính cá nhân",
    desc: "Ngân sách, tiết kiệm, quản lý dòng tiền và xây nền tài chính cá nhân bền vững.",
    href: "/tin-tuc/tai-chinh-ca-nhan",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.4" />
        <path d="M10 6v1.5M10 12.5V14M7.5 9.5a2.5 2.5 0 015 0c0 1.38-1.12 2-2.5 2s-2.5.62-2.5 2a2.5 2.5 0 005 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    slug: "dau-tu-dai-han",
    name: "Đầu tư dài hạn",
    desc: "Góc nhìn, chiến lược và kinh nghiệm thực tế về đầu tư dài hạn có kỷ luật.",
    href: "/tin-tuc",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M3 14L7 9L11 12L16 5L18 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="18" cy="7" r="1.2" fill="currentColor" />
      </svg>
    ),
  },
  {
    slug: "tu-duy-tich-san",
    name: "Tư duy tích sản",
    desc: "Xây dựng tư duy đúng về tài sản, giá trị và hành trình tự do tài chính.",
    href: "/tin-tuc/tu-duy-dau-tu",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M10 2l2.09 6H18l-4.91 3.57 1.87 5.74L10 13.71 5.04 17.31l1.87-5.74L2 8h5.91L10 2z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    ),
  },
  {
    slug: "kien-thuc-thuc-chien",
    name: "Kiến thức thực chiến",
    desc: "Chia sẻ thực tế từ người đã áp dụng — không lý thuyết, không giật gân.",
    href: "/tin-tuc",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M10 2C7.8 2 6 3.8 6 6c0 1.5.8 2.8 2 3.5V11l2 3 2-3V9.5c1.2-.7 2-2 2-3.5 0-2.2-1.8-4-4-4z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 14h4M8 16.5h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    slug: "goc-nhin-thi-truong",
    name: "Góc nhìn thị trường",
    desc: "Phân tích, quan sát và cập nhật thị trường tài chính theo góc nhìn dài hạn.",
    href: "/tin-tuc",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.4" />
        <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M6 9h6M9 6v6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    slug: "phat-trien-ban-than",
    name: "Phát triển bản thân",
    desc: "Kỷ luật, thói quen và cách sống để hỗ trợ hành trình tài chính bền vững.",
    href: "/tin-tuc",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="10" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.4" />
        <path d="M3.5 17.5c0-3.59 2.91-6.5 6.5-6.5s6.5 2.91 6.5 6.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },
];

export function TopicsSection() {
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: newsApi.getCategories,
    staleTime: 10 * 60 * 1000,
  });

  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: newsApi.getProducts,
    staleTime: 10 * 60 * 1000,
  });

  return (
    <section
      id="chu-de"
      className="py-28 md:py-36"
      style={{ background: "hsl(var(--card))" }}
    >
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
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
              <div className="h-px w-8 bg-primary/50" />
              <span className="section-label">Thư viện kiến thức</span>
            </motion.div>
            <motion.h2
              variants={fadeUp}
              style={{
                fontSize: "clamp(1.5rem, 3.4vw, 2.1rem)",
                fontWeight: 700,
                lineHeight: 1.22,
                letterSpacing: "-0.020em",
                color: "hsl(var(--foreground))",
              }}
            >
              Khám phá nội dung theo từng chủ đề
            </motion.h2>
            <motion.p
              variants={fadeUp}
              style={{
                fontSize: "15px",
                lineHeight: 1.88,
                fontWeight: 400,
                color: "hsl(var(--muted-foreground))",
                maxWidth: "38rem",
              }}
            >
              Đi theo từng nhóm nội dung để đọc sâu hơn, dễ chọn đúng điều mình đang cần.
            </motion.p>
          </div>

          {/* ── Topic cards ── */}
          <motion.div
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {STATIC_TOPICS.map(({ slug, name, desc, href, icon }) => {
              const catMatch = categories?.find((c) => c.slug === slug || c.name === name);
              return (
                <motion.a
                  key={slug}
                  variants={fadeUp}
                  href={catMatch ? `/tin-tuc/${catMatch.slug}` : href}
                  className="group flex flex-col rounded-xl p-5 bg-background"
                  style={{
                    border: "1px solid hsl(var(--border) / 0.70)",
                    boxShadow: "0 1px 4px rgba(10,40,35,0.04)",
                    textDecoration: "none",
                    transition: "border-color 0.22s ease, box-shadow 0.22s ease, transform 0.22s ease",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = "hsl(var(--primary) / 0.28)";
                    el.style.boxShadow = "0 4px 16px rgba(10,40,35,0.09)";
                    el.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = "hsl(var(--border) / 0.70)";
                    el.style.boxShadow = "0 1px 4px rgba(10,40,35,0.04)";
                    el.style.transform = "translateY(0)";
                  }}
                >
                  {/* Icon */}
                  <div
                    className="mb-4 flex items-center justify-center rounded-lg"
                    style={{
                      width: "40px", height: "40px",
                      background: "hsl(var(--primary) / 0.07)",
                      border: "1px solid hsl(var(--primary) / 0.12)",
                      color: "hsl(var(--primary))",
                      flexShrink: 0,
                    }}
                  >
                    {icon}
                  </div>

                  {/* Name */}
                  <p
                    className="mb-1.5 group-hover:text-primary transition-colors duration-200"
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      letterSpacing: "-0.008em",
                      color: "hsl(var(--foreground))",
                      lineHeight: 1.3,
                    }}
                  >
                    {name}
                  </p>

                  {/* Desc */}
                  <p
                    className="flex-grow mb-4"
                    style={{
                      fontSize: "12.5px",
                      lineHeight: 1.78,
                      fontWeight: 400,
                      color: "hsl(var(--muted-foreground))",
                    }}
                  >
                    {desc}
                  </p>

                  {/* Arrow */}
                  <div className="flex items-center gap-1.5"
                    style={{ fontSize: "11.5px", fontWeight: 500, color: "hsl(var(--primary) / 0.72)" }}>
                    Xem bài viết
                    <ArrowRight size={11} strokeWidth={2} className="group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </motion.a>
              );
            })}

            {/* Product cards from API */}
            {products?.map((prod) => (
              <motion.a
                key={prod.id}
                variants={fadeUp}
                href={`/tin-tuc/san-pham/${prod.slug}`}
                className="group flex flex-col rounded-xl p-5 bg-background"
                style={{
                  border: "1px solid hsl(var(--border) / 0.70)",
                  boxShadow: "0 1px 4px rgba(10,40,35,0.04)",
                  textDecoration: "none",
                  transition: "border-color 0.22s ease, box-shadow 0.22s ease, transform 0.22s ease",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = "hsl(var(--primary) / 0.28)";
                  el.style.boxShadow = "0 4px 16px rgba(10,40,35,0.09)";
                  el.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = "hsl(var(--border) / 0.70)";
                  el.style.boxShadow = "0 1px 4px rgba(10,40,35,0.04)";
                  el.style.transform = "translateY(0)";
                }}
              >
                <div
                  className="mb-4 flex items-center justify-center rounded-lg"
                  style={{
                    width: "40px", height: "40px",
                    background: "hsl(var(--primary) / 0.07)",
                    border: "1px solid hsl(var(--primary) / 0.12)",
                    color: "hsl(var(--primary))",
                    flexShrink: 0,
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                    <rect x="2" y="2" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                    <rect x="10" y="2" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                    <rect x="2" y="10" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                    <rect x="10" y="10" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                  </svg>
                </div>
                <p className="mb-1.5 group-hover:text-primary transition-colors duration-200"
                  style={{ fontSize: "14px", fontWeight: 600, letterSpacing: "-0.008em", color: "hsl(var(--foreground))", lineHeight: 1.3 }}>
                  {prod.name}
                </p>
                {prod.description && (
                  <p className="flex-grow mb-4"
                    style={{ fontSize: "12.5px", lineHeight: 1.78, fontWeight: 400, color: "hsl(var(--muted-foreground))" }}>
                    {prod.description}
                  </p>
                )}
                <div className="flex items-center gap-1.5"
                  style={{ fontSize: "11.5px", fontWeight: 500, color: "hsl(var(--primary) / 0.72)" }}>
                  Xem bài viết
                  <ArrowRight size={11} strokeWidth={2} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </motion.a>
            ))}
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}
