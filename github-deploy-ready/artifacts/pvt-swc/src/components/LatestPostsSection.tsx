import React, { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { newsApi, type NewsPost } from "@/lib/newsApi";
import { getPostImage, getPostFallbackImage, isFallbackImage, getWatermarkText } from "@/lib/postImage";


const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};

function fmtDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("vi-VN", { day: "numeric", month: "long", year: "numeric" });
}

function articleHref(post: NewsPost) {
  const cat = post.category?.slug ?? "bai-viet";
  return `/tin-tuc/${cat}/${post.slug}`;
}

/* ── Watermark badge — shared between both card types ── */
function WatermarkBadge({ post }: { post: NewsPost }) {
  return (
    <div style={{
      position: "absolute", bottom: 0, right: 0,
      padding: "0.275rem 0.6rem",
      background: "rgba(5,22,19,0.75)",
      borderTop: "1px solid rgba(52,160,140,0.16)",
      borderLeft: "1px solid rgba(52,160,140,0.16)",
      fontSize: "8px", fontWeight: 600, letterSpacing: "0.13em",
      color: "rgba(52,160,140,0.78)", textTransform: "uppercase", pointerEvents: "none",
    }}>
      {getWatermarkText(post)}
    </div>
  );
}

/* ── Skeleton card ── */
function SkeletonCard({ large }: { large?: boolean }) {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        border: "1px solid hsl(var(--border) / 0.60)",
        background: "hsl(var(--card))",
      }}
    >
      <div style={{
        aspectRatio: large ? "16/7" : "16/9",
        background: "hsl(var(--muted) / 0.60)",
      }} />
      <div style={{ padding: "1.125rem 1.375rem 1.375rem" }}>
        <div style={{ height: "9px", borderRadius: "4px", background: "hsl(var(--muted) / 0.55)", width: "38%", marginBottom: "10px" }} />
        <div style={{ height: "15px", borderRadius: "4px", background: "hsl(var(--muted) / 0.40)", width: "88%", marginBottom: "7px" }} />
        <div style={{ height: "15px", borderRadius: "4px", background: "hsl(var(--muted) / 0.28)", width: "60%", marginBottom: "14px" }} />
        <div style={{ height: "11px", borderRadius: "4px", background: "hsl(var(--muted) / 0.22)", width: "28%" }} />
      </div>
    </div>
  );
}

/* ── Small skeleton (horizontal) ── */
function SmallSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden flex" style={{
      border: "1px solid hsl(var(--border) / 0.60)",
      background: "hsl(var(--card))",
      minHeight: "96px",
    }}>
      <div style={{ width: "108px", flexShrink: 0, background: "hsl(var(--muted) / 0.60)" }} />
      <div style={{ flex: 1, padding: "0.875rem 1rem", display: "flex", flexDirection: "column", justifyContent: "center", gap: "0.5rem" }}>
        <div style={{ height: "8px", borderRadius: "3px", background: "hsl(var(--muted) / 0.45)", width: "35%" }} />
        <div style={{ height: "13px", borderRadius: "3px", background: "hsl(var(--muted) / 0.35)", width: "90%" }} />
        <div style={{ height: "13px", borderRadius: "3px", background: "hsl(var(--muted) / 0.25)", width: "65%" }} />
        <div style={{ height: "10px", borderRadius: "3px", background: "hsl(var(--muted) / 0.20)", width: "30%", marginTop: "2px" }} />
      </div>
    </div>
  );
}

/* ── Featured card ─────────────────────────────────────────────────────
   Image is responsive 16:9 aspect-ratio (scales with card width on mobile)
   Content padding clamps from mobile-comfortable to desktop-generous
── */
function FeaturedCard({ post }: { post: NewsPost }) {
  const [imgFailed, setImgFailed] = useState(false);
  const fallback = imgFailed || isFallbackImage(post);
  const src = fallback ? getPostFallbackImage(post) : getPostImage(post);

  return (
    <a
      href={articleHref(post)}
      className="group block rounded-xl overflow-hidden"
      style={{
        border: "1px solid hsl(var(--border) / 0.70)",
        background: "hsl(var(--card))",
        boxShadow: "0 2px 10px rgba(10,40,35,0.07)",
        textDecoration: "none",
        transition: "border-color 0.24s ease, box-shadow 0.24s ease, transform 0.24s ease",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = "hsl(var(--primary) / 0.28)";
        el.style.boxShadow = "0 8px 28px rgba(10,40,35,0.12)";
        el.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = "hsl(var(--border) / 0.70)";
        el.style.boxShadow = "0 2px 10px rgba(10,40,35,0.07)";
        el.style.transform = "translateY(0)";
      }}
    >
      {/* Image — responsive 16:9, never fixed pixels */}
      <div style={{
        position: "relative",
        aspectRatio: "16/9",
        overflow: "hidden",
        background: fallback ? "#091e1b" : "hsl(var(--muted))",
      }}>
        <img
          src={src}
          alt={post.title}
          loading="lazy"
          onError={() => setImgFailed(true)}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
        {fallback && <WatermarkBadge post={post} />}
      </div>

      {/* Content — padding scales with viewport width */}
      <div style={{
        paddingTop:    "clamp(1.25rem, 4vw, 2rem)",
        paddingRight:  "clamp(1.25rem, 4.5vw, 2.25rem)",
        paddingBottom: "clamp(1.375rem, 4.5vw, 2.25rem)",
        paddingLeft:   "clamp(1.25rem, 4.5vw, 2.25rem)",
      }}>
        {/* Badges */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.45rem", marginBottom: "0.875rem" }}>
          {post.category && (
            <span style={{
              fontSize: "10px", fontWeight: 600, letterSpacing: "0.11em", textTransform: "uppercase",
              padding: "2.5px 9px", borderRadius: "999px",
              background: "hsl(var(--primary) / 0.08)",
              color: "hsl(var(--primary))",
              border: "1px solid hsl(var(--primary) / 0.16)",
            }}>
              {post.category.name}
            </span>
          )}
          {post.product && (
            <span style={{
              fontSize: "10px", fontWeight: 600, letterSpacing: "0.11em", textTransform: "uppercase",
              padding: "2.5px 9px", borderRadius: "999px",
              background: "rgba(10,40,35,0.06)",
              color: "hsl(var(--foreground) / 0.55)",
              border: "1px solid hsl(var(--border) / 0.60)",
            }}>
              {post.product.name}
            </span>
          )}
        </div>

        {/* Title — clamped to 3 lines to prevent very long titles from dominating */}
        <h3
          style={{
            fontSize: "clamp(1.1rem, 2.6vw, 1.4rem)",
            fontWeight: 700,
            lineHeight: 1.3,
            letterSpacing: "-0.014em",
            color: "hsl(var(--foreground))",
            marginBottom: "0.625rem",
            transition: "color 0.2s ease",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
          className="group-hover:text-primary"
        >
          {post.title}
        </h3>

        {/* Excerpt — 3 lines max */}
        {post.excerpt && (
          <p style={{
            fontSize: "clamp(13px, 1.8vw, 14px)",
            lineHeight: 1.80,
            fontWeight: 400,
            color: "hsl(var(--muted-foreground))",
            marginBottom: "clamp(1rem, 3vw, 1.25rem)",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}>
            {post.excerpt}
          </p>
        )}

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: "11.5px", color: "hsl(var(--foreground) / 0.38)", fontWeight: 400 }}>
            {fmtDate(post.publishedAt)}
          </span>
          <span
            className="inline-flex items-center gap-1.5 group/link"
            style={{ fontSize: "12.5px", fontWeight: 500, color: "hsl(var(--primary))", letterSpacing: "0.005em" }}
          >
            Đọc tiếp
            <ArrowRight size={12} strokeWidth={2} className="group-hover/link:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </a>
  );
}

/* ── Small card ────────────────────────────────────────────────────────
   Horizontal layout on both mobile and desktop sidebar.
   Thumbnail uses absolute fill so image always matches card height,
   no gap below image when title wraps to 2+ lines.
── */
function SmallCard({ post }: { post: NewsPost }) {
  const [imgFailed, setImgFailed] = useState(false);
  const fallback = imgFailed || isFallbackImage(post);
  const src = fallback ? getPostFallbackImage(post) : getPostImage(post);

  return (
    <a
      href={articleHref(post)}
      className="group flex rounded-xl overflow-hidden"
      style={{
        border: "1px solid hsl(var(--border) / 0.70)",
        background: "hsl(var(--card))",
        boxShadow: "0 1px 4px rgba(10,40,35,0.05)",
        textDecoration: "none",
        minHeight: "96px",
        transition: "border-color 0.24s ease, box-shadow 0.24s ease, transform 0.24s ease",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = "hsl(var(--primary) / 0.22)";
        el.style.boxShadow = "0 4px 16px rgba(10,40,35,0.09)";
        el.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = "hsl(var(--border) / 0.70)";
        el.style.boxShadow = "0 1px 4px rgba(10,40,35,0.05)";
        el.style.transform = "translateY(0)";
      }}
    >
      {/* Thumbnail — absolute fill, always matches card height */}
      <div style={{
        width: "112px", flexShrink: 0,
        position: "relative", alignSelf: "stretch",
        overflow: "hidden",
        background: fallback ? "#091e1b" : "hsl(var(--muted))",
        borderRight: "1px solid hsl(var(--border) / 0.35)",
      }}>
        <img
          src={src}
          alt={post.title}
          loading="lazy"
          onError={() => setImgFailed(true)}
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
            objectFit: "cover", display: "block",
          }}
        />
        {fallback && <WatermarkBadge post={post} />}
      </div>

      {/* Content */}
      <div style={{
        flex: 1, minWidth: 0,
        padding: "0.875rem 1rem 0.875rem 0.875rem",
        display: "flex", flexDirection: "column",
        justifyContent: "center", gap: "0.375rem",
      }}>
        {post.category && (
          <span style={{
            display: "block",
            fontSize: "9px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
            color: "hsl(var(--primary))",
            lineHeight: 1,
          }}>
            {post.category.name}
          </span>
        )}
        <h4
          style={{
            fontSize: "13.5px", fontWeight: 600,
            lineHeight: 1.38, letterSpacing: "-0.008em",
            color: "hsl(var(--foreground))",
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
            transition: "color 0.2s ease",
            margin: 0,
          }}
          className="group-hover:text-primary"
        >
          {post.title}
        </h4>
        <span style={{ fontSize: "10.5px", color: "hsl(var(--foreground) / 0.36)", fontWeight: 400, lineHeight: 1 }}>
          {fmtDate(post.publishedAt)}
        </span>
      </div>
    </a>
  );
}

/* ── Main component ── */
export function LatestPostsSection() {
  const { data: posts, isLoading } = useQuery({
    queryKey: ["home-posts"],
    queryFn: () => newsApi.getPosts({ status: "published" }),
    staleTime: 5 * 60 * 1000,
  });

  const published = (posts ?? []).filter((p) => p.status === "published");
  const featured = published[0] ?? null;
  const rest = published.slice(1, 4);

  return (
    <section id="bai-viet" className="py-28 md:py-36 bg-background">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 space-y-12">

        {/* ── Header ── */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
        >
          <div className="space-y-4 max-w-xl">
            <motion.div variants={fadeUp} className="flex items-center gap-3">
              <div className="h-px w-8 bg-primary/50" />
              <span className="section-label">Bài viết mới nhất</span>
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
              Bài viết và chia sẻ nổi bật
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
              Những nội dung được chọn để giúp người đọc tiếp cận rõ hơn với tư duy tài chính, đầu tư và hành trình xây tài sản dài hạn.
            </motion.p>
          </div>
          <motion.div variants={fadeUp}>
            <a
              href="/tin-tuc"
              className="inline-flex items-center gap-2 group/all"
              style={{
                fontSize: "13px", fontWeight: 500, color: "hsl(var(--primary))",
                textDecoration: "none", whiteSpace: "nowrap",
              }}
            >
              Xem tất cả bài viết
              <ArrowRight size={14} strokeWidth={2} className="group-hover/all:translate-x-0.5 transition-transform" />
            </a>
          </motion.div>
        </motion.div>

        {/* ── Loading skeletons ── */}
        {isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">
            <SkeletonCard large />
            <div className="flex flex-col gap-4">
              <SmallSkeleton />
              <SmallSkeleton />
              <SmallSkeleton />
            </div>
          </div>
        )}

        {/* ── Empty state ── */}
        {!isLoading && published.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.40 }}
            className="flex flex-col items-center justify-center text-center py-20 rounded-xl space-y-2"
            style={{ border: "1px dashed hsl(var(--border))", background: "hsl(var(--card))" }}
          >
            <p style={{ fontSize: "15px", fontWeight: 500, color: "hsl(var(--foreground) / 0.70)" }}>
              Nội dung đang được cập nhật
            </p>
            <p style={{ fontSize: "13.5px", fontWeight: 400, color: "hsl(var(--muted-foreground))" }}>
              Các bài viết và chia sẻ mới sẽ sớm xuất hiện tại đây.
            </p>
          </motion.div>
        )}

        {/* ── Content grid ── */}
        {!isLoading && featured && (
          <motion.div
            key={`cards-${featured.id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">
              <FeaturedCard post={featured} />

              <div className="flex flex-col gap-4">
                {rest.map((p) => (
                  <SmallCard key={p.id} post={p} />
                ))}
                {rest.length === 0 && (
                  <div
                    className="rounded-xl flex items-center justify-center"
                    style={{
                      flex: 1, minHeight: "120px",
                      border: "1px dashed hsl(var(--border))",
                    }}
                  >
                    <p style={{ fontSize: "13px", color: "hsl(var(--muted-foreground))" }}>
                      Thêm bài viết trong Admin
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Footer CTA ── */}
        {!isLoading && published.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center pt-2"
          >
            <a
              href="/tin-tuc"
              className="inline-flex items-center gap-2 rounded-full"
              style={{
                height: "2.625rem",
                padding: "0 1.75rem",
                fontSize: "13px",
                fontWeight: 500,
                letterSpacing: "0.01em",
                color: "hsl(var(--primary))",
                border: "1px solid hsl(var(--primary) / 0.28)",
                background: "hsl(var(--primary) / 0.04)",
                textDecoration: "none",
                transition: "background 0.2s ease, border-color 0.2s ease",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = "hsl(var(--primary) / 0.09)";
                el.style.borderColor = "hsl(var(--primary) / 0.42)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = "hsl(var(--primary) / 0.04)";
                el.style.borderColor = "hsl(var(--primary) / 0.28)";
              }}
            >
              Xem tất cả bài viết
              <ArrowRight size={13} strokeWidth={2} />
            </a>
          </motion.div>
        )}

      </div>
    </section>
  );
}
