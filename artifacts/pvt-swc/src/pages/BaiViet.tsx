import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Search, Clock } from "lucide-react";
import { BackgroundDecor } from "@/components/BackgroundDecor";
import { useSeoMeta } from "@/hooks/useSeoMeta";
import { trackArticleClick } from "@/lib/analytics";
import {
  getPublishedArticles,
  getFeaturedArticles,
  formatArticleDate,
  type Article,
} from "@/lib/articles";

/* ── Animation ── */
const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };

/* ── Category filter chips ── */
const CATEGORY_FILTERS = [
  { key: "all",             label: "Tất cả" },
  { key: "tu-duy-dau-tu",  label: "Tư duy đầu tư" },
  { key: "tai-chinh-ca-nhan", label: "Tài chính cá nhân" },
  { key: "dau-tu-dai-han", label: "Đầu tư dài hạn" },
];

/* ── Article card ── */
function ArticleCard({ article, featured = false }: { article: Article; featured?: boolean }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.a
      variants={fadeUp}
      href={`/bai-viet/${article.slug}`}
      onClick={() => trackArticleClick(article.slug, article.title ?? undefined)}
      style={{
        display: "flex",
        flexDirection: featured ? "column" : "column",
        background: "hsl(var(--card))",
        border: `1px solid ${hovered ? "hsl(var(--primary) / 0.22)" : "hsl(var(--border) / 0.55)"}`,
        borderRadius: "14px",
        overflow: "hidden",
        textDecoration: "none",
        boxShadow: hovered ? "0 6px 24px rgba(10,40,35,0.10)" : "0 2px 8px rgba(10,40,35,0.05)",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        transition: "border-color 0.24s ease, box-shadow 0.24s ease, transform 0.24s ease",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Cover gradient */}
      <div
        style={{
          height: featured ? "clamp(120px, 18vw, 180px)" : "100px",
          background: "linear-gradient(145deg, #0c2622 0%, #124540 55%, #1a6258 100%)",
          position: "relative",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            position: "absolute", inset: 0,
            backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 24px, rgba(255,255,255,0.012) 24px, rgba(255,255,255,0.012) 25px)",
          }}
        />
        {article.featured && (
          <div style={{ position: "absolute", top: "10px", left: "10px", background: "rgba(52,160,140,0.88)", backdropFilter: "blur(6px)", borderRadius: "4px", padding: "2px 8px", fontSize: "9.5px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#fff" }}>
            Nổi bật
          </div>
        )}
        <div style={{ position: "absolute", bottom: "10px", left: "12px" }}>
          <span style={{ fontSize: "9.5px", fontWeight: 600, letterSpacing: "0.10em", textTransform: "uppercase", color: "rgba(255,255,255,0.65)", background: "rgba(0,0,0,0.32)", padding: "2px 7px", borderRadius: "3px" }}>
            {article.category ?? "Bài viết"}
          </span>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "1.1rem 1.25rem 1.4rem", display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
        <p style={{ fontSize: featured ? "16px" : "13.5px", fontWeight: 700, letterSpacing: "-0.014em", lineHeight: 1.45, color: "hsl(var(--foreground))", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {article.title}
        </p>
        {article.excerpt && (
          <p style={{ fontSize: "12.5px", color: "hsl(var(--muted-foreground))", lineHeight: 1.78, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {article.excerpt}
          </p>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "4px" }}>
          {article.readingTime && (
            <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "hsl(var(--muted-foreground))" }}>
              <Clock size={10} strokeWidth={2} />
              {article.readingTime}
            </span>
          )}
          {article.publishDate && (
            <span style={{ fontSize: "11px", color: "hsl(var(--muted-foreground) / 0.7)" }}>
              {formatArticleDate(article.publishDate)}
            </span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "hsl(var(--primary))", fontSize: "11.5px", fontWeight: 500, marginTop: "2px" }}>
          <span>Đọc bài viết</span>
          <ArrowRight size={10} strokeWidth={2.5} />
        </div>
      </div>
    </motion.a>
  );
}

/* ── Skeleton ── */
function ArticleSkeleton({ featured = false }: { featured?: boolean }) {
  return (
    <div style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border) / 0.55)", borderRadius: "14px", overflow: "hidden" }}>
      <div style={{ height: featured ? "180px" : "100px", background: "hsl(var(--muted) / 0.4)", animation: "pulse 1.5s ease-in-out infinite" }} />
      <div style={{ padding: "1.1rem 1.25rem 1.4rem", display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ height: "14px", background: "hsl(var(--muted) / 0.4)", borderRadius: "4px", width: "90%", animation: "pulse 1.5s ease-in-out infinite" }} />
        <div style={{ height: "12px", background: "hsl(var(--muted) / 0.3)", borderRadius: "4px", width: "70%", animation: "pulse 1.5s ease-in-out infinite" }} />
      </div>
    </div>
  );
}

/* ── Empty state ── */
function EmptyState() {
  return (
    <div style={{ textAlign: "center", padding: "5rem 0", color: "hsl(var(--muted-foreground))" }}>
      <p style={{ fontSize: "15px", fontWeight: 600, marginBottom: "8px" }}>Nội dung đang được cập nhật</p>
      <p style={{ fontSize: "13px" }}>Các bài viết và chia sẻ mới sẽ sớm xuất hiện tại đây.</p>
    </div>
  );
}

/* ── Main page ── */
export default function BaiViet() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery,    setSearchQuery]    = useState("");
  const [articles,       setArticles]       = useState<Article[]>([]);
  const [featured,       setFeatured]       = useState<Article[]>([]);
  const [loading,        setLoading]        = useState(true);

  useSeoMeta({
    title: "Kho Kiến Thức – Bài Viết",
    description: "Bài viết chuyên sâu về tư duy đầu tư, tài chính cá nhân và hành trình tích sản dài hạn từ Phan Văn Thắng SWC.",
    keywords: "bài viết đầu tư, tài chính cá nhân, tư duy tích sản, Phan Văn Thắng SWC",
    canonicalUrl: "https://thangswc.com/bai-viet",
  });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [all, feat] = await Promise.all([
        getPublishedArticles({ limit: 50 }),
        getFeaturedArticles(3),
      ]);
      if (!cancelled) {
        setArticles(all);
        setFeatured(feat);
        setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    let list = articles;
    if (activeCategory !== "all") {
      list = list.filter((a) => a.categorySlug === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (a) => a.title.toLowerCase().includes(q) || (a.excerpt ?? "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [articles, activeCategory, searchQuery]);

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
                Bài viết
              </span>
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-white" style={{ fontSize: "clamp(1.9rem, 4.8vw, 3rem)", fontWeight: 700, lineHeight: 1.14, letterSpacing: "-0.030em" }}>
              Bài viết chuyên sâu về tài chính, đầu tư và tư duy tích sản
            </motion.h1>
            <motion.p variants={fadeUp} style={{ fontSize: "16px", color: "rgba(255,255,255,0.60)", lineHeight: 1.8 }}>
              Tổng hợp bài viết phân tích được chọn lọc, giúp bạn hiểu sâu hơn về tài chính cá nhân, đầu tư dài hạn và tư duy xây dựng tài sản bền vững.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ── Filter toolbar ── */}
      <div style={{ background: "hsl(var(--background))", borderBottom: "1px solid hsl(var(--border) / 0.5)", position: "sticky", top: "64px", zIndex: 40 }}>
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-2 flex-wrap flex-1">
            {CATEGORY_FILTERS.map(({ key, label }) => {
              const active = activeCategory === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveCategory(key)}
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
              placeholder="Tìm bài viết theo từ khóa..."
              style={{ height: "2rem", paddingLeft: "28px", paddingRight: "12px", borderRadius: "999px", fontSize: "12px", border: "1px solid hsl(var(--border))", background: "hsl(var(--muted) / 0.3)", color: "hsl(var(--foreground))", outline: "none", width: "200px", transition: "border-color 0.18s ease, width 0.24s ease" }}
              onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "hsl(var(--primary) / 0.5)"; (e.target as HTMLInputElement).style.width = "240px"; }}
              onBlur={(e)  => { (e.target as HTMLInputElement).style.borderColor = "hsl(var(--border))"; (e.target as HTMLInputElement).style.width = "200px"; }}
            />
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="bg-background">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-16 md:py-20 space-y-16">

          {/* Featured strip — show only on "all" with no search */}
          {activeCategory === "all" && !searchQuery && featured.length > 0 && (
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger} className="space-y-6">
              <motion.div variants={fadeUp} className="flex items-center gap-2.5">
                <div style={{ width: "1.5rem", height: "0.5px", background: "rgba(200,158,76,0.65)", flexShrink: 0 }} />
                <span style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.20em", textTransform: "uppercase", color: "rgba(200,158,76,0.78)" }}>
                  Bài viết nổi bật
                </span>
              </motion.div>
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  {[0, 1, 2].map((i) => <ArticleSkeleton key={i} featured />)}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  {featured.map((a) => <ArticleCard key={a.id} article={a} featured />)}
                </div>
              )}
            </motion.div>
          )}

          {/* Main grid */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger} className="space-y-6">
            {activeCategory !== "all" || searchQuery ? (
              <motion.div variants={fadeUp} className="flex items-center gap-2.5">
                <div style={{ width: "1.5rem", height: "0.5px", background: "rgba(200,158,76,0.65)", flexShrink: 0 }} />
                <span style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.20em", textTransform: "uppercase", color: "rgba(200,158,76,0.78)" }}>
                  Tất cả bài viết
                </span>
              </motion.div>
            ) : (
              <motion.div variants={fadeUp} className="flex items-center gap-2.5">
                <div style={{ width: "1.5rem", height: "0.5px", background: "rgba(200,158,76,0.65)", flexShrink: 0 }} />
                <span style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.20em", textTransform: "uppercase", color: "rgba(200,158,76,0.78)" }}>
                  Tất cả bài viết
                </span>
              </motion.div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[0, 1, 2, 3, 4, 5].map((i) => <ArticleSkeleton key={i} />)}
              </div>
            ) : filtered.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map((a) => <ArticleCard key={a.id} article={a} />)}
              </div>
            ) : (
              <EmptyState />
            )}
          </motion.div>

        </div>
      </div>

      {/* ── CTA ── */}
      <section className="relative overflow-hidden py-24" style={{ background: "linear-gradient(150deg, #0d2622 0%, #102a26 45%, #091e1b 100%)" }}>
        <BackgroundDecor />
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(90deg, transparent 0%, rgba(52,160,140,0.22) 35%, rgba(52,160,140,0.22) 65%, transparent 100%)" }} />
        <div className="max-w-4xl mx-auto px-5 sm:px-8 text-center relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger} className="space-y-6">
            <motion.h2 variants={fadeUp} style={{ fontSize: "clamp(1.45rem, 3.8vw, 2.2rem)", fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.24, color: "rgba(255,255,255,0.92)", maxWidth: "32rem", margin: "0 auto" }}>
              Cùng theo dõi thêm video và nội dung trên YouTube
            </motion.h2>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a href="/video" className="inline-flex items-center gap-2" style={{ height: "2.875rem", padding: "0 2rem", borderRadius: "999px", fontSize: "13px", fontWeight: 600, color: "#fff", textDecoration: "none", background: "linear-gradient(140deg, #22917f 0%, #1a7868 100%)", boxShadow: "0 3px 18px rgba(20,115,98,0.30), inset 0 1px 0 rgba(255,255,255,0.12)", transition: "box-shadow 0.2s ease, transform 0.2s ease", whiteSpace: "nowrap" }} onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = "0 5px 24px rgba(20,115,98,0.42)"; el.style.transform = "translateY(-1px)"; }} onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = "0 3px 18px rgba(20,115,98,0.30)"; el.style.transform = "translateY(0)"; }}>
                Xem thư viện video
                <ArrowRight size={14} strokeWidth={2} />
              </a>
              <a href="/cong-dong" className="inline-flex items-center gap-2" style={{ height: "2.875rem", padding: "0 1.875rem", borderRadius: "999px", fontSize: "13px", fontWeight: 500, color: "rgba(255,255,255,0.78)", textDecoration: "none", background: "rgba(255,255,255,0.055)", border: "1px solid rgba(255,255,255,0.14)", backdropFilter: "blur(10px)", transition: "background 0.2s ease, border-color 0.2s ease, color 0.2s ease", whiteSpace: "nowrap" }} onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "rgba(255,255,255,0.09)"; el.style.borderColor = "rgba(255,255,255,0.22)"; el.style.color = "rgba(255,255,255,0.92)"; }} onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "rgba(255,255,255,0.055)"; el.style.borderColor = "rgba(255,255,255,0.14)"; el.style.color = "rgba(255,255,255,0.78)"; }}>
                Tham gia cộng đồng
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
