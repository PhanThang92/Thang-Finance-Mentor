import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { YOUTUBE_CHANNEL_URL } from "@/config/siteConfig";
import { getFeaturedVideo, getHomepageVideos, videoGradient, type Video } from "@/lib/videos";

/* ── Animation ── */
const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };

/* ── Thumbnail ── */
function Thumbnail({
  gradient,
  large = false,
  duration,
  badge,
}: {
  gradient: string;
  large?: boolean;
  duration: string | null;
  badge?: string;
}) {
  const height = large ? "clamp(180px, 22vw, 260px)" : "120px";
  return (
    <div style={{ position: "relative", background: gradient, height, borderRadius: "10px", overflow: "hidden", flexShrink: 0 }}>
      <div
        style={{
          position: "absolute", inset: 0,
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 28px, rgba(255,255,255,0.018) 28px, rgba(255,255,255,0.018) 29px), repeating-linear-gradient(90deg, transparent, transparent 28px, rgba(255,255,255,0.018) 28px, rgba(255,255,255,0.018) 29px)",
        }}
      />
      <div
        style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
          width: "70%", height: "70%", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)",
        }}
      />
      <div
        style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
          width: large ? "48px" : "36px", height: large ? "48px" : "36px",
          borderRadius: "50%", background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.26)",
          backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <Play size={large ? 18 : 14} fill="rgba(255,255,255,0.88)" stroke="none" style={{ marginLeft: "2px" }} />
      </div>
      {duration && (
        <div
          style={{
            position: "absolute", bottom: "10px", right: "10px",
            background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)",
            borderRadius: "4px", padding: "2px 7px",
            fontSize: "10px", fontWeight: 500, color: "rgba(255,255,255,0.85)",
          }}
        >
          {duration}
        </div>
      )}
      {badge && (
        <div
          style={{
            position: "absolute", top: "10px", left: "10px",
            background: "rgba(52,160,140,0.88)", backdropFilter: "blur(6px)",
            borderRadius: "4px", padding: "2px 8px",
            fontSize: "9.5px", fontWeight: 600, letterSpacing: "0.08em",
            textTransform: "uppercase", color: "#fff",
          }}
        >
          {badge}
        </div>
      )}
    </div>
  );
}

/* ── Card hover handlers ── */
const cardStyle: React.CSSProperties = {
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

/* ── Skeleton ── */
function SkeletonCard({ large = false }: { large?: boolean }) {
  const h = large ? "clamp(180px, 22vw, 260px)" : "120px";
  return (
    <div style={{ ...cardStyle, gap: 0, cursor: "default" }}>
      <div style={{ background: "hsl(var(--muted) / 0.4)", height: h, borderRadius: "10px", animation: "pulse 1.5s ease-in-out infinite" }} />
      <div style={{ padding: "1rem 1.1rem 1.25rem", display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ height: "13px", background: "hsl(var(--muted) / 0.4)", borderRadius: "4px", width: "80%", animation: "pulse 1.5s ease-in-out infinite" }} />
        <div style={{ height: "11px", background: "hsl(var(--muted) / 0.3)", borderRadius: "4px", width: "60%", animation: "pulse 1.5s ease-in-out infinite" }} />
      </div>
    </div>
  );
}

/* ── Component ── */
export function YoutubeSection() {
  const [featuredVideo,   setFeaturedVideo]   = React.useState<Video | null>(null);
  const [secondaryVideos, setSecondaryVideos] = React.useState<Video[]>([]);
  const [loading,         setLoading]         = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      const [featured, secondary] = await Promise.all([
        getFeaturedVideo(),
        getHomepageVideos(3),
      ]);
      if (!cancelled) {
        setFeaturedVideo(featured);
        setSecondaryVideos(secondary);
        setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  if (!loading && !featuredVideo) return null;

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
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
            <div className="space-y-4 max-w-lg">
              <motion.div variants={fadeUp} className="flex items-center gap-2.5">
                <div style={{ width: "1.75rem", height: "0.5px", background: "rgba(200,158,76,0.65)", flexShrink: 0 }} />
                <span style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(200,158,76,0.78)" }}>
                  Kênh YouTube
                </span>
              </motion.div>
              <motion.h2
                variants={fadeUp}
                style={{ fontSize: "clamp(1.45rem, 3.5vw, 2.1rem)", fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.22, color: "hsl(var(--foreground))" }}
              >
                Theo dõi các chia sẻ đầu tư và tư duy tích sản trên YouTube
              </motion.h2>
              <motion.p variants={fadeUp} style={{ fontSize: "14.5px", color: "hsl(var(--muted-foreground))", lineHeight: 1.82 }}>
                Những video được xây dựng để giúp người xem hiểu rõ hơn về tài chính, đầu tư dài hạn và quá trình xây nền tảng tài sản bền vững.
              </motion.p>
            </div>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row md:flex-col gap-2.5 flex-shrink-0">
              <a
                href={YOUTUBE_CHANNEL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2"
                style={{ height: "2.625rem", padding: "0 1.375rem", borderRadius: "999px", fontSize: "13px", fontWeight: 600, color: "#fff", textDecoration: "none", background: "linear-gradient(140deg, #22917f 0%, #1a7868 100%)", boxShadow: "0 3px 16px rgba(20,115,98,0.28), inset 0 1px 0 rgba(255,255,255,0.12)", transition: "box-shadow 0.2s ease, transform 0.2s ease", whiteSpace: "nowrap" }}
                onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = "0 5px 22px rgba(20,115,98,0.40), inset 0 1px 0 rgba(255,255,255,0.16)"; el.style.transform = "translateY(-1px)"; }}
                onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = "0 3px 16px rgba(20,115,98,0.28), inset 0 1px 0 rgba(255,255,255,0.12)"; el.style.transform = "translateY(0)"; }}
              >
                Xem kênh YouTube
                <ArrowRight size={13} strokeWidth={2} />
              </a>
              <a
                href="/video"
                className="inline-flex items-center gap-2"
                style={{ height: "2.625rem", padding: "0 1.375rem", borderRadius: "999px", fontSize: "13px", fontWeight: 500, color: "hsl(var(--foreground) / 0.78)", textDecoration: "none", background: "transparent", border: "1px solid hsl(var(--border))", transition: "background 0.2s ease, border-color 0.2s ease, color 0.2s ease", whiteSpace: "nowrap" }}
                onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "hsl(var(--muted) / 0.5)"; el.style.borderColor = "hsl(var(--border) / 0.8)"; el.style.color = "hsl(var(--foreground))"; }}
                onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "transparent"; el.style.borderColor = "hsl(var(--border))"; el.style.color = "hsl(var(--foreground) / 0.78)"; }}
              >
                Xem thư viện video
              </a>
            </motion.div>
          </div>

          {/* Featured card */}
          {loading ? (
            <div style={{ marginBottom: "16px" }}>
              <SkeletonCard large />
            </div>
          ) : featuredVideo && (
            <motion.a
              variants={fadeUp}
              href={featuredVideo.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ ...cardStyle, marginBottom: "16px" }}
              onMouseEnter={onEnter}
              onMouseLeave={onLeave}
            >
              <div className="flex flex-col md:flex-row">
                <div style={{ minWidth: 0, flex: "0 0 clamp(220px, 40%, 340px)" }}>
                  <Thumbnail gradient={videoGradient(featuredVideo)} large duration={featuredVideo.duration} badge="Video nổi bật" />
                </div>
                <div style={{ padding: "clamp(1.25rem, 3vw, 2rem)", display: "flex", flexDirection: "column", justifyContent: "center", gap: "12px" }}>
                  <p style={{ fontSize: "18px", fontWeight: 700, letterSpacing: "-0.018em", lineHeight: 1.38, color: "hsl(var(--foreground))" }}>
                    {featuredVideo.title}
                  </p>
                  <p style={{ fontSize: "13.5px", color: "hsl(var(--muted-foreground))", lineHeight: 1.82, fontWeight: 400 }}>
                    {featuredVideo.excerpt}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "hsl(var(--primary))", fontSize: "12.5px", fontWeight: 500, marginTop: "4px" }}>
                    <Play size={12} fill="hsl(var(--primary))" stroke="none" />
                    <span>Xem video</span>
                  </div>
                </div>
              </div>
            </motion.a>
          )}

          {/* Supporting cards */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[0, 1, 2].map((i) => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <motion.div variants={stagger} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {secondaryVideos.map((v) => (
                <motion.a
                  key={v.id}
                  variants={fadeUp}
                  href={v.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ ...cardStyle }}
                  onMouseEnter={onEnter}
                  onMouseLeave={onLeave}
                >
                  <Thumbnail gradient={videoGradient(v)} duration={v.duration} />
                  <div style={{ padding: "1rem 1.1rem 1.25rem" }}>
                    <p style={{ fontSize: "13px", fontWeight: 600, lineHeight: 1.52, letterSpacing: "-0.010em", color: "hsl(var(--foreground))", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", marginBottom: "6px" }}>
                      {v.title}
                    </p>
                    <p style={{ fontSize: "12px", color: "hsl(var(--muted-foreground))", lineHeight: 1.72, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {v.excerpt}
                    </p>
                  </div>
                </motion.a>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
