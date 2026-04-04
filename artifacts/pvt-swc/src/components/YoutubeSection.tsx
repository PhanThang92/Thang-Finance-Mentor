import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";

/* ── YouTube channel constant — replace when real URL is known ── */
export const YOUTUBE_CHANNEL_URL = "https://youtube.com/@pvtswc";

/* ── Animation ── */
const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

/* ── Video data ── */
const FEATURED = {
  title: "Đầu tư dài hạn bắt đầu từ đâu nếu bạn chưa có nhiều vốn?",
  description:
    "Một góc nhìn dành cho những người mới bắt đầu hành trình tích sản và muốn đi đường dài bằng sự kỷ luật thay vì cảm xúc.",
  duration: "15 phút",
  badge: "Video nổi bật",
  gradient: "linear-gradient(145deg, #0c2622 0%, #12453d 55%, #1a6258 100%)",
  href: YOUTUBE_CHANNEL_URL,
};

const SECONDARY = [
  {
    title: "Vì sao kiếm nhiều hơn vẫn chưa chắc vững hơn về tài chính?",
    description: "Hiểu khác biệt giữa thu nhập cao và nền tảng tài chính vững.",
    duration: "12 phút",
    gradient: "linear-gradient(145deg, #0d1e2e 0%, #1a3550 55%, #1e4060 100%)",
    href: YOUTUBE_CHANNEL_URL,
  },
  {
    title: "Người mới đầu tư nên nhìn vào điều gì trước lợi nhuận?",
    description: "Một cách tiếp cận thực tế hơn để giảm rủi ro khi bắt đầu.",
    duration: "9 phút",
    gradient: "linear-gradient(145deg, #1a200d 0%, #2d3b18 55%, #374720 100%)",
    href: YOUTUBE_CHANNEL_URL,
  },
  {
    title: "Tích sản là quá trình của kỷ luật, không phải cảm hứng",
    description: "Xây tài sản bền vững thường bắt đầu từ những nguyên tắc nhỏ nhưng lặp lại đủ lâu.",
    duration: "18 phút",
    gradient: "linear-gradient(145deg, #1e1a0a 0%, #3a2e12 55%, #44381a 100%)",
    href: YOUTUBE_CHANNEL_URL,
  },
];

/* ── Shared thumbnail component ── */
function Thumbnail({
  gradient,
  large = false,
  duration,
  badge,
}: {
  gradient: string;
  large?: boolean;
  duration: string;
  badge?: string;
}) {
  const height = large ? "clamp(180px, 22vw, 260px)" : "120px";
  return (
    <div
      style={{
        position: "relative",
        background: gradient,
        height,
        borderRadius: "10px",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {/* Subtle cross-hatch pattern */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 28px, rgba(255,255,255,0.018) 28px, rgba(255,255,255,0.018) 29px), repeating-linear-gradient(90deg, transparent, transparent 28px, rgba(255,255,255,0.018) 28px, rgba(255,255,255,0.018) 29px)",
        }}
      />
      {/* Ambient glow */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "70%",
          height: "70%",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)",
        }}
      />
      {/* Play icon */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: large ? "48px" : "36px",
          height: large ? "48px" : "36px",
          borderRadius: "50%",
          background: "rgba(255,255,255,0.16)",
          border: "1px solid rgba(255,255,255,0.26)",
          backdropFilter: "blur(6px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Play
          size={large ? 18 : 14}
          fill="rgba(255,255,255,0.88)"
          stroke="none"
          style={{ marginLeft: "2px" }}
        />
      </div>
      {/* Duration badge */}
      <div
        style={{
          position: "absolute",
          bottom: "10px",
          right: "10px",
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(6px)",
          borderRadius: "4px",
          padding: "2px 7px",
          fontSize: "10px",
          fontWeight: 500,
          color: "rgba(255,255,255,0.85)",
          letterSpacing: "0.01em",
        }}
      >
        {duration}
      </div>
      {/* Badge pill (featured) */}
      {badge && (
        <div
          style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            background: "rgba(52,160,140,0.88)",
            backdropFilter: "blur(6px)",
            borderRadius: "4px",
            padding: "2px 8px",
            fontSize: "9.5px",
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#fff",
          }}
        >
          {badge}
        </div>
      )}
    </div>
  );
}

/* ── Card styles ── */
const cardBase: React.CSSProperties = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border) / 0.55)",
  borderRadius: "14px",
  overflow: "hidden",
  textDecoration: "none",
  display: "flex",
  flexDirection: "column",
  boxShadow: "0 2px 8px rgba(10,40,35,0.06), 0 1px 2px rgba(10,40,35,0.04)",
  transition: "border-color 0.24s ease, box-shadow 0.24s ease, transform 0.24s ease",
};

function onEnter(e: React.MouseEvent<HTMLElement>) {
  const el = e.currentTarget as HTMLElement;
  el.style.borderColor = "hsl(var(--primary) / 0.25)";
  el.style.boxShadow   = "0 6px 24px rgba(10,40,35,0.10), 0 2px 4px rgba(10,40,35,0.05)";
  el.style.transform   = "translateY(-3px)";
}
function onLeave(e: React.MouseEvent<HTMLElement>) {
  const el = e.currentTarget as HTMLElement;
  el.style.borderColor = "hsl(var(--border) / 0.55)";
  el.style.boxShadow   = "0 2px 8px rgba(10,40,35,0.06), 0 1px 2px rgba(10,40,35,0.04)";
  el.style.transform   = "translateY(0)";
}

/* ── Component ── */
export function YoutubeSection() {
  return (
    <section
      className="relative overflow-hidden py-24 md:py-32"
      style={{ background: "hsl(var(--background))", borderTop: "1px solid hsl(var(--border) / 0.5)" }}
    >
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
        >
          {/* ── Section header ── */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
            <div className="space-y-4 max-w-lg">
              <motion.div variants={fadeUp} className="flex items-center gap-2.5">
                <div style={{ width: "1.75rem", height: "0.5px", background: "rgba(200,158,76,0.65)", flexShrink: 0 }} />
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 600,
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: "rgba(200,158,76,0.78)",
                  }}
                >
                  Kênh YouTube
                </span>
              </motion.div>
              <motion.h2
                variants={fadeUp}
                style={{
                  fontSize: "clamp(1.45rem, 3.5vw, 2.1rem)",
                  fontWeight: 700,
                  letterSpacing: "-0.025em",
                  lineHeight: 1.22,
                  color: "hsl(var(--foreground))",
                }}
              >
                Theo dõi các chia sẻ đầu tư và tư duy tích sản trên YouTube
              </motion.h2>
              <motion.p
                variants={fadeUp}
                style={{
                  fontSize: "14.5px",
                  color: "hsl(var(--muted-foreground))",
                  lineHeight: 1.82,
                }}
              >
                Những video được xây dựng để giúp người xem hiểu rõ hơn về tài chính, đầu tư dài hạn và quá trình xây nền tảng tài sản bền vững.
              </motion.p>
            </div>

            {/* CTAs */}
            <motion.div
              variants={fadeUp}
              className="flex flex-col sm:flex-row md:flex-col gap-2.5 flex-shrink-0"
            >
              <a
                href={YOUTUBE_CHANNEL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2"
                style={{
                  height: "2.625rem",
                  padding: "0 1.375rem",
                  borderRadius: "999px",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#fff",
                  textDecoration: "none",
                  background: "linear-gradient(140deg, #22917f 0%, #1a7868 100%)",
                  boxShadow: "0 3px 16px rgba(20,115,98,0.28), inset 0 1px 0 rgba(255,255,255,0.12)",
                  transition: "box-shadow 0.2s ease, transform 0.2s ease",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.boxShadow = "0 5px 22px rgba(20,115,98,0.40), inset 0 1px 0 rgba(255,255,255,0.16)";
                  el.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.boxShadow = "0 3px 16px rgba(20,115,98,0.28), inset 0 1px 0 rgba(255,255,255,0.12)";
                  el.style.transform = "translateY(0)";
                }}
              >
                Xem kênh YouTube
                <ArrowRight size={13} strokeWidth={2} />
              </a>
              <a
                href="/video"
                className="inline-flex items-center gap-2"
                style={{
                  height: "2.625rem",
                  padding: "0 1.375rem",
                  borderRadius: "999px",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "hsl(var(--foreground) / 0.78)",
                  textDecoration: "none",
                  background: "transparent",
                  border: "1px solid hsl(var(--border))",
                  transition: "background 0.2s ease, border-color 0.2s ease, color 0.2s ease",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = "hsl(var(--muted) / 0.5)";
                  el.style.borderColor = "hsl(var(--border) / 0.8)";
                  el.style.color = "hsl(var(--foreground))";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = "transparent";
                  el.style.borderColor = "hsl(var(--border))";
                  el.style.color = "hsl(var(--foreground) / 0.78)";
                }}
              >
                Xem thư viện video
              </a>
            </motion.div>
          </div>

          {/* ── Featured card ── */}
          <motion.a
            variants={fadeUp}
            href={FEATURED.href}
            target="_blank"
            rel="noopener noreferrer"
            style={{ ...cardBase, marginBottom: "16px" }}
            onMouseEnter={onEnter}
            onMouseLeave={onLeave}
          >
            <div className="flex flex-col md:flex-row">
              {/* Thumbnail */}
              <div style={{ minWidth: 0, flex: "0 0 clamp(220px, 40%, 340px)" }}>
                <Thumbnail gradient={FEATURED.gradient} large duration={FEATURED.duration} badge={FEATURED.badge} />
              </div>
              {/* Text */}
              <div style={{ padding: "clamp(1.25rem, 3vw, 2rem)", display: "flex", flexDirection: "column", justifyContent: "center", gap: "12px" }}>
                <p style={{ fontSize: "18px", fontWeight: 700, letterSpacing: "-0.018em", lineHeight: 1.38, color: "hsl(var(--foreground))" }}>
                  {FEATURED.title}
                </p>
                <p style={{ fontSize: "13.5px", color: "hsl(var(--muted-foreground))", lineHeight: 1.82, fontWeight: 400 }}>
                  {FEATURED.description}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "hsl(var(--primary))", fontSize: "12.5px", fontWeight: 500, marginTop: "4px" }}>
                  <Play size={12} fill="hsl(var(--primary))" stroke="none" />
                  <span>Xem video</span>
                </div>
              </div>
            </div>
          </motion.a>

          {/* ── Supporting cards ── */}
          <motion.div variants={stagger} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {SECONDARY.map(({ title, description, duration, gradient, href }) => (
              <motion.a
                key={title}
                variants={fadeUp}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                style={{ ...cardBase }}
                onMouseEnter={onEnter}
                onMouseLeave={onLeave}
              >
                <Thumbnail gradient={gradient} duration={duration} />
                <div style={{ padding: "1rem 1.1rem 1.25rem" }}>
                  <p
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      lineHeight: 1.52,
                      letterSpacing: "-0.010em",
                      color: "hsl(var(--foreground))",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      marginBottom: "6px",
                    }}
                  >
                    {title}
                  </p>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "hsl(var(--muted-foreground))",
                      lineHeight: 1.72,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {description}
                  </p>
                </div>
              </motion.a>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
