import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Play, Search } from "lucide-react";
import { BackgroundDecor } from "@/components/BackgroundDecor";
import { useSeoMeta } from "@/hooks/useSeoMeta";
import { YOUTUBE_CHANNEL_URL } from "@/config/siteConfig";
import { trackVideoClick, trackCtaClick } from "@/lib/analytics";
import { CompactLeadForm } from "@/components/CompactLeadForm";
import {
  getFeaturedVideo,
  getVideosByCategory,
  searchVideos,
  videoGradient,
  type Video,
} from "@/lib/videos";
import { getFeaturedSeries } from "@/content/seriesData";
import type { SeriesItem } from "@/types/content";

/* ── Animation ── */
const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };

/* ── Filter config ── */
const FILTERS: { key: string; label: string }[] = [
  { key: "all",      label: "Tất cả" },
  { key: "featured", label: "Nổi bật" },
  { key: "tai-chinh", label: "Tài chính cá nhân" },
  { key: "dau-tu",   label: "Đầu tư dài hạn" },
  { key: "tu-duy",   label: "Tư duy tích sản" },
  { key: "series",   label: "Series" },
];

/* ── Thumbnail ── */
function Thumbnail({
  gradient,
  duration,
  badge,
  large = false,
}: {
  gradient: string;
  duration: string | null;
  badge?: string;
  large?: boolean;
}) {
  const h = large ? "clamp(200px, 26vw, 300px)" : "160px";
  return (
    <div style={{ position: "relative", background: gradient, height: h, flexShrink: 0, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute", inset: 0,
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 28px, rgba(255,255,255,0.016) 28px, rgba(255,255,255,0.016) 29px), repeating-linear-gradient(90deg, transparent, transparent 28px, rgba(255,255,255,0.016) 28px, rgba(255,255,255,0.016) 29px)",
        }}
      />
      <div
        style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
          width: "60%", height: "60%", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,255,255,0.055) 0%, transparent 70%)",
        }}
      />
      <div
        style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
          width: large ? "50px" : "38px", height: large ? "50px" : "38px",
          borderRadius: "50%", background: "rgba(255,255,255,0.14)",
          border: "1px solid rgba(255,255,255,0.24)", backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <Play size={large ? 19 : 14} fill="rgba(255,255,255,0.88)" stroke="none" style={{ marginLeft: "2px" }} />
      </div>
      {duration && (
        <div
          style={{
            position: "absolute", bottom: "10px", right: "10px",
            background: "rgba(0,0,0,0.52)", backdropFilter: "blur(6px)",
            borderRadius: "4px", padding: "2px 7px",
            fontSize: "10px", fontWeight: 500, color: "rgba(255,255,255,0.86)",
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

/* ── Video card ── */
function VideoCard({ video }: { video: Video }) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <motion.a
      variants={fadeUp}
      href={video.youtubeUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackVideoClick(video.slug ?? video.youtubeUrl ?? "", video.title ?? undefined)}
      style={{
        background: "hsl(var(--card))",
        border: `1px solid ${hovered ? "hsl(var(--primary) / 0.22)" : "hsl(var(--border) / 0.55)"}`,
        borderRadius: "12px", overflow: "hidden", textDecoration: "none",
        display: "flex", flexDirection: "column",
        boxShadow: hovered ? "0 6px 24px rgba(10,40,35,0.10), 0 2px 4px rgba(10,40,35,0.05)" : "0 2px 8px rgba(10,40,35,0.05)",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        transition: "border-color 0.24s ease, box-shadow 0.24s ease, transform 0.24s ease",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Thumbnail gradient={videoGradient(video)} duration={video.duration} />
      <div style={{ padding: "1.1rem 1.2rem 1.4rem", flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
        <p
          style={{
            fontSize: "13.5px", fontWeight: 600, lineHeight: 1.52, letterSpacing: "-0.010em",
            color: "hsl(var(--foreground))", display: "-webkit-box",
            WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
          }}
        >
          {video.title}
        </p>
        <p
          style={{
            fontSize: "12px", color: "hsl(var(--muted-foreground))", lineHeight: 1.72,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
          }}
        >
          {video.excerpt}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: "5px", marginTop: "4px", color: "hsl(var(--primary))", fontSize: "11.5px", fontWeight: 500 }}>
          <Play size={10} fill="hsl(var(--primary))" stroke="none" />
          <span>Xem video</span>
        </div>
      </div>
    </motion.a>
  );
}

/* ── Series card ── */
function SeriesCard({ title, description, count, coverGradient, youtubeUrl }: SeriesItem) {
  return (
    <motion.a
      variants={fadeUp}
      href={youtubeUrl}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "flex", flexDirection: "column", borderRadius: "14px", overflow: "hidden",
        textDecoration: "none", border: "1px solid hsl(var(--border) / 0.55)",
        background: "hsl(var(--card))", boxShadow: "0 2px 8px rgba(10,40,35,0.05)",
        transition: "border-color 0.24s ease, box-shadow 0.24s ease, transform 0.24s ease",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = "hsl(var(--primary) / 0.22)";
        el.style.boxShadow   = "0 6px 22px rgba(10,40,35,0.10)";
        el.style.transform   = "translateY(-3px)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = "hsl(var(--border) / 0.55)";
        el.style.boxShadow   = "0 2px 8px rgba(10,40,35,0.05)";
        el.style.transform   = "translateY(0)";
      }}
    >
      <div style={{ height: "90px", background: coverGradient, position: "relative", overflow: "hidden" }}>
        <div
          style={{
            position: "absolute", inset: 0,
            backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,0.014) 20px, rgba(255,255,255,0.014) 21px)",
          }}
        />
        <div style={{ position: "absolute", bottom: "12px", left: "14px" }}>
          <span style={{ fontSize: "9.5px", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)", background: "rgba(0,0,0,0.30)", padding: "2px 7px", borderRadius: "3px" }}>
            {count}
          </span>
        </div>
      </div>
      <div style={{ padding: "1.1rem 1.2rem 1.4rem", display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
        <p style={{ fontSize: "14px", fontWeight: 700, letterSpacing: "-0.012em", lineHeight: 1.38, color: "hsl(var(--foreground))" }}>
          {title}
        </p>
        <p style={{ fontSize: "12px", color: "hsl(var(--muted-foreground))", lineHeight: 1.78 }}>
          {description}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: "5px", marginTop: "4px", color: "hsl(var(--primary))", fontSize: "12px", fontWeight: 500 }}>
          <span>Xem series</span>
          <ArrowRight size={11} strokeWidth={2} />
        </div>
      </div>
    </motion.a>
  );
}

/* ── Skeleton ── */
function VideoSkeleton() {
  return (
    <div style={{
      background: "hsl(var(--card))", border: "1px solid hsl(var(--border) / 0.55)",
      borderRadius: "12px", overflow: "hidden", display: "flex", flexDirection: "column",
    }}>
      <div style={{ height: "160px", background: "hsl(var(--muted) / 0.4)", animation: "pulse 1.5s ease-in-out infinite" }} />
      <div style={{ padding: "1.1rem 1.2rem 1.4rem", display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ height: "13px", background: "hsl(var(--muted) / 0.4)", borderRadius: "4px", width: "85%", animation: "pulse 1.5s ease-in-out infinite" }} />
        <div style={{ height: "11px", background: "hsl(var(--muted) / 0.3)", borderRadius: "4px", width: "65%", animation: "pulse 1.5s ease-in-out infinite" }} />
      </div>
    </div>
  );
}

/* ── Empty state ── */
function EmptyState({ message = "Các video mới sẽ sớm xuất hiện tại đây." }: { message?: string }) {
  return (
    <div style={{ textAlign: "center", padding: "4rem 0", color: "hsl(var(--muted-foreground))", fontSize: "14px" }}>
      <p style={{ fontWeight: 500, marginBottom: "6px" }}>Nội dung đang được cập nhật</p>
      <p style={{ fontSize: "13px" }}>{message}</p>
    </div>
  );
}

/* ── Main page ── */
export default function VideoLibrary() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery,  setSearchQuery]  = useState("");
  const [featuredVideo, setFeaturedVideo] = useState<Video | null>(null);
  const [allVideos,    setAllVideos]    = useState<Video[]>([]);
  const [loading,      setLoading]      = useState(true);

  useSeoMeta({
    title: "Kho Kiến Thức – Video",
    description: "Thư viện video về tư duy đầu tư, tài chính cá nhân và hành trình tích sản dài hạn từ Phan Văn Thắng SWC.",
    keywords: "video đầu tư, tài chính cá nhân, tư duy tích sản, Phan Văn Thắng SWC",
    canonicalUrl: "https://thangswc.com/video",
  });

  const seriesList = getFeaturedSeries();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [featured, all] = await Promise.all([
        getFeaturedVideo(),
        getVideosByCategory(),
      ]);
      if (!cancelled) {
        setFeaturedVideo(featured);
        setAllVideos(all);
        setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const filteredVideos = useMemo(() => {
    if (activeFilter === "series") return [];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return allVideos.filter(
        (v) => v.title.toLowerCase().includes(q) || (v.excerpt ?? "").toLowerCase().includes(q)
      );
    }
    if (activeFilter === "all") return allVideos.filter((v) => !v.isFeaturedVideo);
    if (activeFilter === "featured") return allVideos.filter((v) => v.featured);
    return allVideos.filter(
      (v) => !v.isFeaturedVideo && (v.categories ?? []).includes(activeFilter)
    );
  }, [activeFilter, searchQuery, allVideos]);

  React.useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, []);

  return (
    <>
      {/* ── Hero ── */}
      <section
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(150deg, #0d2622 0%, #102a26 45%, #091e1b 100%)", paddingTop: "clamp(5.5rem, 14vw, 9rem)", paddingBottom: "clamp(3.5rem, 9vw, 5.5rem)" }}
      >
        <BackgroundDecor />
        <div className="max-w-5xl mx-auto px-5 sm:px-8 relative z-10">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-2xl space-y-5">
            <motion.div variants={fadeUp} className="flex items-center gap-2.5">
              <div style={{ width: "1.75rem", height: "0.5px", background: "rgba(200,158,76,0.65)", flexShrink: 0 }} />
              <span style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(200,158,76,0.78)" }}>
                Thư viện video
              </span>
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-white" style={{ fontSize: "clamp(1.9rem, 4.8vw, 3rem)", fontWeight: 700, lineHeight: 1.14, letterSpacing: "-0.030em" }}>
              Video chia sẻ về tài chính, đầu tư và tư duy tích sản
            </motion.h1>
            <motion.p variants={fadeUp} style={{ fontSize: "16px", color: "rgba(255,255,255,0.60)", lineHeight: 1.8 }}>
              Tổng hợp các video giúp người xem tiếp cận tài chính và đầu tư theo hướng thực tế, kỷ luật và dài hạn hơn.
            </motion.p>
            <motion.p variants={fadeUp} style={{ fontSize: "14px", color: "rgba(255,255,255,0.40)", lineHeight: 1.8 }}>
              Theo dõi các nội dung được chọn lọc từ kênh YouTube để học, suy ngẫm và xây nền tảng vững hơn theo thời gian.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ── Filter toolbar ── */}
      <div style={{ background: "hsl(var(--background))", borderBottom: "1px solid hsl(var(--border) / 0.5)", position: "sticky", top: "64px", zIndex: 40 }}>
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-2 flex-wrap flex-1">
            {FILTERS.map(({ key, label }) => {
              const active = activeFilter === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveFilter(key)}
                  style={{
                    height: "2rem", padding: "0 0.875rem", borderRadius: "999px",
                    fontSize: "12px", fontWeight: active ? 600 : 400, cursor: "pointer",
                    border: `1px solid ${active ? "hsl(var(--primary) / 0.5)" : "hsl(var(--border))"}`,
                    background: active ? "hsl(var(--primary) / 0.10)" : "transparent",
                    color: active ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
                    transition: "all 0.18s ease", letterSpacing: "0.005em", whiteSpace: "nowrap",
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <div style={{ position: "relative", flexShrink: 0 }}>
            <Search size={13} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "hsl(var(--muted-foreground))", pointerEvents: "none" }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm video theo từ khóa..."
              style={{ height: "2rem", paddingLeft: "28px", paddingRight: "12px", borderRadius: "999px", fontSize: "12px", border: "1px solid hsl(var(--border))", background: "hsl(var(--muted) / 0.3)", color: "hsl(var(--foreground))", outline: "none", width: "200px", transition: "border-color 0.18s ease, width 0.24s ease" }}
              onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "hsl(var(--primary) / 0.5)"; (e.target as HTMLInputElement).style.width = "240px"; }}
              onBlur={(e)  => { (e.target as HTMLInputElement).style.borderColor = "hsl(var(--border))"; (e.target as HTMLInputElement).style.width = "200px"; }}
            />
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="bg-background">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-16 md:py-24 space-y-20">

          {/* Featured video */}
          {(activeFilter === "all" || activeFilter === "featured") && !searchQuery && (
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger}>
              <motion.div variants={fadeUp} className="flex items-center gap-2.5 mb-7">
                <div style={{ width: "1.5rem", height: "0.5px", background: "rgba(200,158,76,0.65)", flexShrink: 0 }} />
                <span style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.20em", textTransform: "uppercase", color: "rgba(200,158,76,0.78)" }}>
                  Video nổi bật
                </span>
              </motion.div>
              {loading ? (
                <div style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border) / 0.55)", borderRadius: "16px", overflow: "hidden", height: "220px", animation: "pulse 1.5s ease-in-out infinite" }} />
              ) : featuredVideo ? (
                <motion.a
                  variants={fadeUp}
                  href={featuredVideo.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "flex", flexDirection: "column", background: "hsl(var(--card))", border: "1px solid hsl(var(--border) / 0.55)", borderRadius: "16px", overflow: "hidden", textDecoration: "none", boxShadow: "0 2px 12px rgba(10,40,35,0.07)", transition: "border-color 0.24s ease, box-shadow 0.24s ease, transform 0.24s ease" }}
                  onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "hsl(var(--primary) / 0.25)"; el.style.boxShadow = "0 8px 32px rgba(10,40,35,0.12)"; el.style.transform = "translateY(-3px)"; }}
                  onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "hsl(var(--border) / 0.55)"; el.style.boxShadow = "0 2px 12px rgba(10,40,35,0.07)"; el.style.transform = "translateY(0)"; }}
                >
                  <div className="flex flex-col md:flex-row">
                    <div style={{ flex: "0 0 clamp(240px, 42%, 380px)" }}>
                      <Thumbnail gradient={videoGradient(featuredVideo)} duration={featuredVideo.duration} badge="Video nổi bật" large />
                    </div>
                    <div style={{ padding: "clamp(1.5rem, 3vw, 2.25rem)", display: "flex", flexDirection: "column", justifyContent: "center", gap: "14px" }}>
                      <p style={{ fontSize: "clamp(1.1rem, 2.5vw, 1.4rem)", fontWeight: 700, letterSpacing: "-0.022em", lineHeight: 1.38, color: "hsl(var(--foreground))" }}>
                        {featuredVideo.title}
                      </p>
                      <p style={{ fontSize: "14px", color: "hsl(var(--muted-foreground))", lineHeight: 1.85 }}>
                        {featuredVideo.excerpt}
                      </p>
                      <div style={{ display: "flex", alignItems: "center", gap: "7px", color: "hsl(var(--primary))", fontSize: "13px", fontWeight: 600 }}>
                        <Play size={14} fill="hsl(var(--primary))" stroke="none" />
                        <span>Xem video</span>
                      </div>
                    </div>
                  </div>
                </motion.a>
              ) : null}
            </motion.div>
          )}

          {/* Video grid */}
          {activeFilter !== "series" && (
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger}>
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {[0, 1, 2, 3, 4, 5].map((i) => <VideoSkeleton key={i} />)}
                </div>
              ) : filteredVideos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredVideos.map((v) => <VideoCard key={v.id} video={v} />)}
                </div>
              ) : (
                <EmptyState message="Không có video phù hợp với bộ lọc này." />
              )}
            </motion.div>
          )}

          {/* Series */}
          {(activeFilter === "all" || activeFilter === "series") && !searchQuery && (
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger} className="space-y-8">
              <div className="space-y-3">
                <motion.div variants={fadeUp} className="flex items-center gap-2.5">
                  <div style={{ width: "1.5rem", height: "0.5px", background: "rgba(200,158,76,0.65)", flexShrink: 0 }} />
                  <span style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.20em", textTransform: "uppercase", color: "rgba(200,158,76,0.78)" }}>
                    Series nổi bật
                  </span>
                </motion.div>
                <motion.h2 variants={fadeUp} style={{ fontSize: "clamp(1.25rem, 3vw, 1.65rem)", fontWeight: 700, letterSpacing: "-0.022em", lineHeight: 1.28, color: "hsl(var(--foreground))" }}>
                  Theo dõi nội dung theo từng hành trình rõ ràng hơn
                </motion.h2>
              </div>
              <motion.div variants={stagger} className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {seriesList.map((s) => <SeriesCard key={s.id} {...s} />)}
              </motion.div>
            </motion.div>
          )}

        </div>
      </div>

      {/* ── CTA block ── */}
      <section className="relative overflow-hidden py-24 md:py-32" style={{ background: "linear-gradient(150deg, #0d2622 0%, #102a26 45%, #091e1b 100%)" }}>
        <BackgroundDecor />
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(90deg, transparent 0%, rgba(52,160,140,0.22) 35%, rgba(52,160,140,0.22) 65%, transparent 100%)" }} />
        <div className="max-w-4xl mx-auto px-5 sm:px-8 text-center relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger} className="space-y-7">
            <motion.h2 variants={fadeUp} style={{ fontSize: "clamp(1.5rem, 4vw, 2.4rem)", fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.22, color: "rgba(255,255,255,0.92)", maxWidth: "34rem", margin: "0 auto" }}>
              Tiếp tục theo dõi và học theo cách phù hợp với bạn
            </motion.h2>
            <motion.p variants={fadeUp} style={{ fontSize: "15px", color: "rgba(255,255,255,0.50)", lineHeight: 1.88, maxWidth: "28rem", margin: "0 auto" }}>
              Khám phá thêm bài viết, video và các chủ đề được chọn lọc để xây nền tảng tài chính vững hơn theo thời gian.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <a href="/bai-viet" className="inline-flex items-center gap-2" style={{ height: "2.875rem", padding: "0 2rem", borderRadius: "999px", fontSize: "13px", fontWeight: 600, color: "#fff", textDecoration: "none", background: "linear-gradient(140deg, #22917f 0%, #1a7868 100%)", boxShadow: "0 3px 18px rgba(20,115,98,0.30), inset 0 1px 0 rgba(255,255,255,0.12)", transition: "box-shadow 0.2s ease, transform 0.2s ease", whiteSpace: "nowrap" }} onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = "0 5px 24px rgba(20,115,98,0.42), inset 0 1px 0 rgba(255,255,255,0.16)"; el.style.transform = "translateY(-1px)"; }} onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = "0 3px 18px rgba(20,115,98,0.30), inset 0 1px 0 rgba(255,255,255,0.12)"; el.style.transform = "translateY(0)"; }}>
                Xem bài viết
                <ArrowRight size={14} strokeWidth={2} />
              </a>
              <a href={YOUTUBE_CHANNEL_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2" style={{ height: "2.875rem", padding: "0 1.875rem", borderRadius: "999px", fontSize: "13px", fontWeight: 500, color: "rgba(255,255,255,0.78)", textDecoration: "none", background: "rgba(255,255,255,0.055)", border: "1px solid rgba(255,255,255,0.14)", backdropFilter: "blur(10px)", transition: "background 0.2s ease, border-color 0.2s ease, color 0.2s ease", whiteSpace: "nowrap" }} onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "rgba(255,255,255,0.09)"; el.style.borderColor = "rgba(255,255,255,0.22)"; el.style.color = "rgba(255,255,255,0.92)"; }} onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "rgba(255,255,255,0.055)"; el.style.borderColor = "rgba(255,255,255,0.14)"; el.style.color = "rgba(255,255,255,0.78)"; }}>
                Xem kênh YouTube
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Lead capture form */}
      <CompactLeadForm
        title="Nhận cập nhật video mới"
        description="Để lại thông tin để nhận thông báo khi có video mới và nội dung được chọn lọc phù hợp với anh/chị."
        sourceType="video-page"
        sourcePage="/video"
        formType="email-capture"
        buttonLabel="Đăng ký nhận cập nhật"
      />
    </>
  );
}
