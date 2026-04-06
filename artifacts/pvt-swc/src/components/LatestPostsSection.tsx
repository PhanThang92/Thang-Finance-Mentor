import React from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { newsApi, type NewsPost } from "@/lib/newsApi";
import { getPostImage, isFallbackImage, getWatermarkText } from "@/lib/postImage";

/* ── fallback src — tiny transparent pixel, avoids broken-image icons ─ */
const BLANK = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEAAAAALAAAAAABAAEAAAI=";

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

/* ── Skeleton card ── */
function SkeletonCard({ large }: { large?: boolean }) {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        border: "1px solid hsl(var(--border) / 0.60)",
        background: "hsl(var(--card))",
        height: large ? "460px" : "300px",
      }}
    >
      <div style={{ height: large ? "260px" : "160px", background: "hsl(var(--muted) / 0.60)" }} />
      <div style={{ padding: "1.25rem 1.5rem" }}>
        <div style={{ height: "10px", borderRadius: "4px", background: "hsl(var(--muted) / 0.55)", width: "40%", marginBottom: "12px" }} />
        <div style={{ height: "16px", borderRadius: "4px", background: "hsl(var(--muted) / 0.40)", width: "85%", marginBottom: "8px" }} />
        <div style={{ height: "16px", borderRadius: "4px", background: "hsl(var(--muted) / 0.30)", width: "65%", marginBottom: "16px" }} />
        <div style={{ height: "12px", borderRadius: "4px", background: "hsl(var(--muted) / 0.25)", width: "30%" }} />
      </div>
    </div>
  );
}

/* ── Thumbnail with watermark + onError guard ── */
function PostThumb({ post, height }: { post: NewsPost; height: number }) {
  const src = getPostImage(post);
  const fallback = isFallbackImage(post);
  return (
    <div
      style={{
        position: "relative",
        height,
        overflow: "hidden",
        background: fallback ? "#091e1b" : "hsl(var(--muted))",
      }}
    >
      <img
        src={src}
        alt={post.title}
        loading="lazy"
        onError={(e) => {
          const img = e.currentTarget;
          img.onerror = null;
          img.src = BLANK;
          img.style.opacity = "0";
        }}
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      />
      {fallback && (
        <div style={{
          position: "absolute", bottom: 0, right: 0,
          padding: "0.3rem 0.65rem",
          background: "rgba(5,22,19,0.72)",
          borderTop: "1px solid rgba(52,160,140,0.18)",
          borderLeft: "1px solid rgba(52,160,140,0.18)",
          fontSize: "9px", fontWeight: 600, letterSpacing: "0.12em",
          color: "rgba(52,160,140,0.80)", textTransform: "uppercase", pointerEvents: "none",
        }}>
          {getWatermarkText(post)}
        </div>
      )}
    </div>
  );
}

/* ── Featured card (large) ── */
function FeaturedCard({ post }: { post: NewsPost }) {
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
      <PostThumb post={post} height={300} />
      <div style={{ padding: "2rem 2.25rem 2.25rem" }}>
        <div className="flex flex-wrap items-center gap-2 mb-3.5">
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

        <h3
          style={{
            fontSize: "clamp(1.15rem, 2.2vw, 1.4rem)",
            fontWeight: 700,
            lineHeight: 1.28,
            letterSpacing: "-0.015em",
            color: "hsl(var(--foreground))",
            marginBottom: "0.75rem",
            transition: "color 0.2s ease",
          }}
          className="group-hover:text-primary"
        >
          {post.title}
        </h3>

        {post.excerpt && (
          <p style={{
            fontSize: "14px",
            lineHeight: 1.82,
            fontWeight: 400,
            color: "hsl(var(--muted-foreground))",
            marginBottom: "1.25rem",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}>
            {post.excerpt}
          </p>
        )}

        <div className="flex items-center justify-between">
          <span style={{ fontSize: "11.5px", color: "hsl(var(--foreground) / 0.38)", fontWeight: 400 }}>
            {fmtDate(post.publishedAt)}
          </span>
          <span className="inline-flex items-center gap-1.5 group/link"
            style={{ fontSize: "12.5px", fontWeight: 500, color: "hsl(var(--primary))", letterSpacing: "0.005em" }}>
            Đọc tiếp
            <ArrowRight size={12} strokeWidth={2} className="group-hover/link:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </a>
  );
}

/* ── Small article card ── */
function SmallCard({ post }: { post: NewsPost }) {
  return (
    <a
      href={articleHref(post)}
      className="group flex gap-0 rounded-xl overflow-hidden"
      style={{
        border: "1px solid hsl(var(--border) / 0.70)",
        background: "hsl(var(--card))",
        boxShadow: "0 1px 4px rgba(10,40,35,0.05)",
        textDecoration: "none",
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
      {/* Thumbnail */}
      <div style={{ width: "108px", minHeight: "108px", flexShrink: 0, overflow: "hidden", position: "relative" }}>
        <PostThumb post={post} height={108} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: "0.875rem 1rem 0.875rem 0.875rem", minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center", gap: "0.3rem" }}>
        {post.category && (
          <span style={{
            display: "inline-block",
            fontSize: "9.5px", fontWeight: 600, letterSpacing: "0.10em", textTransform: "uppercase",
            color: "hsl(var(--primary))",
          }}>
            {post.category.name}
          </span>
        )}
        <h4
          style={{
            fontSize: "13.5px", fontWeight: 600, lineHeight: 1.35, letterSpacing: "-0.008em",
            color: "hsl(var(--foreground))",
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
            transition: "color 0.2s ease",
            margin: 0,
          }}
          className="group-hover:text-primary"
        >
          {post.title}
        </h4>
        <span style={{ fontSize: "11px", color: "hsl(var(--foreground) / 0.38)", fontWeight: 400 }}>
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

        {/* ── Header — own whileInView, always renders immediately ── */}
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
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
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

        {/* ── Content grid — independent animate (not whileInView) so it
            always plays when data arrives, regardless of scroll position ── */}
        {!isLoading && featured && (
          <motion.div
            key={`cards-${featured.id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">
              {/* Featured */}
              <FeaturedCard post={featured} />

              {/* Side cards */}
              <div className="flex flex-col gap-4">
                {rest.map((p) => (
                  <SmallCard key={p.id} post={p} />
                ))}
                {rest.length === 0 && (
                  <div
                    className="rounded-xl flex items-center justify-center"
                    style={{
                      flex: 1,
                      border: "1px dashed hsl(var(--border))",
                      minHeight: "120px",
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
              className="inline-flex items-center gap-2 rounded-full transition-all"
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
