import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { motion } from "framer-motion";
import { newsApi, type NewsPost } from "@/lib/newsApi";
import { getPostImage, isFallbackImage, getWatermarkText } from "@/lib/postImage";
import { trackArticleView } from "@/lib/analytics";

/* ── motion ────────────────────────────────────────────────────────── */
const fadeUp = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.50, ease: [0.22, 1, 0.36, 1] } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };

function fmtDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("vi-VN", { day: "numeric", month: "long", year: "numeric" });
}

/* ── Related card ───────────────────────────────────────────────────── */
function RelatedCard({ post }: { post: NewsPost }) {
  return (
    <Link href={`/tin-tuc/${post.category?.slug ?? "bai-viet"}/${post.slug}`} style={{ textDecoration: "none" }}>
      <div
        style={{
          display: "flex", gap: "1rem", alignItems: "flex-start",
          padding: "1.125rem 1.25rem", borderRadius: "10px",
          border: "1px solid hsl(var(--border) / 0.70)",
          background: "hsl(var(--background))",
          cursor: "pointer",
          transition: "border-color 0.20s ease, box-shadow 0.20s ease, background 0.20s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "hsl(var(--primary) / 0.38)";
          e.currentTarget.style.boxShadow   = "0 4px 20px rgba(10,40,35,0.08)";
          e.currentTarget.style.background  = "hsl(var(--primary) / 0.02)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "hsl(var(--border) / 0.70)";
          e.currentTarget.style.boxShadow   = "none";
          e.currentTarget.style.background  = "hsl(var(--background))";
        }}
      >
        {/* Left accent */}
        <div style={{ width: "3px", flexShrink: 0, alignSelf: "stretch", borderRadius: "999px", background: "hsl(var(--primary) / 0.30)", minHeight: "2.5rem" }} />

        <div style={{ flex: 1, minWidth: 0 }}>
          {post.category && (
            <span style={{
              fontSize: "9px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase",
              color: "hsl(var(--primary))", display: "block", marginBottom: "0.35rem",
            }}>
              {post.category.name}
            </span>
          )}
          <p style={{
            fontSize: "14px", fontWeight: 600, lineHeight: 1.38,
            color: "hsl(var(--foreground))", margin: "0 0 0.375rem",
            overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
          }}>
            {post.title}
          </p>
          <p style={{ fontSize: "11.5px", color: "hsl(var(--foreground) / 0.36)", margin: 0 }}>
            {fmtDate(post.publishedAt)}
          </p>
        </div>
      </div>
    </Link>
  );
}

/* ── Prose renderer ─────────────────────────────────────────────────── */
function Prose({ content }: { content: string }) {
  const blocks = content.split(/\n\n+/);
  return (
    <div style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>
      {blocks.map((p, i) => {
        if (p.startsWith("# ")) return (
          <h2 key={i} style={{
            fontSize: "1.35rem", fontWeight: 700, lineHeight: 1.30,
            margin: "2.25rem 0 0.75rem", color: "hsl(var(--foreground))",
            letterSpacing: "-0.01em",
          }}>
            {p.slice(2)}
          </h2>
        );
        if (p.startsWith("## ")) return (
          <h3 key={i} style={{
            fontSize: "1.1rem", fontWeight: 700, lineHeight: 1.35,
            margin: "1.875rem 0 0.625rem", color: "hsl(var(--foreground))",
          }}>
            {p.slice(3)}
          </h3>
        );
        if (p.startsWith("- ")) {
          const items = p.split("\n").filter((l) => l.startsWith("- ")).map((l) => l.slice(2));
          return (
            <ul key={i} style={{ margin: "1.125rem 0", paddingLeft: "1.375rem", display: "flex", flexDirection: "column", gap: "0.55rem" }}>
              {items.map((item, j) => (
                <li key={j} style={{ fontSize: "16px", lineHeight: 1.90, fontWeight: 300, color: "hsl(var(--foreground) / 0.78)" }}>
                  {item}
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} style={{
            fontSize: "16px", lineHeight: 1.95, fontWeight: 300,
            color: "hsl(var(--foreground) / 0.76)", margin: "0 0 1.5rem",
            letterSpacing: "0.006em",
          }}>
            {p}
          </p>
        );
      })}
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────────────────── */
export default function TinTucArticle() {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["post", slug],
    queryFn:  () => newsApi.getPost(slug!),
    enabled:  !!slug,
  });

  useEffect(() => {
    if (slug) trackArticleView(slug);
  }, [slug]);

  /* ── Loading ── */
  if (isLoading) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "20px", height: "20px", borderRadius: "50%", border: "2px solid hsl(var(--primary) / 0.20)", borderTopColor: "hsl(var(--primary))", animation: "spin 0.8s linear infinite", margin: "0 auto 1rem" }} />
          <p style={{ fontSize: "13px", color: "hsl(var(--foreground) / 0.35)" }}>Đang tải bài viết...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  /* ── Error ── */
  if (isError || !data?.post) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1.25rem" }}>
        <p style={{ fontSize: "15px", color: "hsl(var(--foreground) / 0.42)" }}>Không tìm thấy bài viết.</p>
        <Link href="/tin-tuc" style={{ fontSize: "13px", color: "hsl(var(--primary))", textDecoration: "none", fontWeight: 500 }}>← Quay lại Tin tức</Link>
      </div>
    );
  }

  const { post, related } = data;
  const imgSrc     = getPostImage(post);
  const isFallback = isFallbackImage(post);

  return (
    <div style={{ minHeight: "100vh", background: "hsl(var(--background))" }}>

      {/* ── Article header ─────────────────────────────────────────────── */}
      <section style={{
        padding: "5rem 0 3rem",
        background: "linear-gradient(160deg, hsl(var(--primary) / 0.045) 0%, hsl(var(--background)) 52%)",
        borderBottom: "1px solid hsl(var(--border) / 0.38)",
      }}>
        <div style={{ maxWidth: "700px", margin: "0 auto", padding: "0 1.5rem" }}>
          <motion.div initial="hidden" animate="visible" variants={stagger}>

            {/* ── Breadcrumb ── */}
            <motion.nav variants={fadeUp} aria-label="Breadcrumb" style={{
              display: "flex", gap: "0.4rem", alignItems: "center",
              marginBottom: "1.625rem",
              fontSize: "12px",
            }}>
              <Link href="/tin-tuc" style={{
                color: "hsl(var(--primary))", textDecoration: "none", fontWeight: 500,
                transition: "opacity 0.16s ease",
              }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.72")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                Tin tức
              </Link>
              <span style={{ color: "hsl(var(--foreground) / 0.22)", fontSize: "10px" }}>›</span>
              {post.category && (
                <>
                  <Link href={`/tin-tuc/${post.category.slug}`} style={{
                    color: "hsl(var(--foreground) / 0.50)", textDecoration: "none",
                    transition: "color 0.16s ease",
                  }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "hsl(var(--foreground) / 0.75)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "hsl(var(--foreground) / 0.50)")}
                  >
                    {post.category.name}
                  </Link>
                  <span style={{ color: "hsl(var(--foreground) / 0.22)", fontSize: "10px" }}>›</span>
                </>
              )}
              <span style={{
                color: "hsl(var(--foreground) / 0.38)", fontWeight: 400,
                maxWidth: "220px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {post.title.length > 42 ? post.title.slice(0, 42) + "…" : post.title}
              </span>
            </motion.nav>

            {/* ── Category + product badges ── */}
            <motion.div variants={fadeUp} style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1.125rem" }}>
              {post.category && (
                <span style={{
                  fontSize: "9px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase",
                  color: "hsl(var(--primary))",
                  background: "hsl(var(--primary) / 0.10)",
                  padding: "4px 11px", borderRadius: "999px",
                  border: "1px solid hsl(var(--primary) / 0.22)",
                }}>
                  {post.category.name}
                </span>
              )}
              {post.product && (
                <span style={{
                  fontSize: "9px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase",
                  color: "hsl(var(--foreground) / 0.46)",
                  background: "hsl(var(--muted))",
                  padding: "4px 11px", borderRadius: "999px",
                  border: "1px solid hsl(var(--border) / 0.60)",
                }}>
                  {post.product.name}
                </span>
              )}
            </motion.div>

            {/* ── Title ── */}
            <motion.h1 variants={fadeUp} style={{
              fontSize: "clamp(1.75rem, 4.5vw, 2.65rem)", fontWeight: 800,
              lineHeight: 1.16, letterSpacing: "-0.018em",
              color: "hsl(var(--foreground))", margin: "0 0 1.125rem",
            }}>
              {post.title}
            </motion.h1>

            {/* ── Excerpt ── */}
            {post.excerpt && (
              <motion.p variants={fadeUp} style={{
                fontSize: "16.5px", lineHeight: 1.82, fontWeight: 300,
                color: "hsl(var(--foreground) / 0.62)",
                margin: "0 0 1.625rem",
                fontStyle: "italic",
                borderLeft: "2.5px solid hsl(var(--primary) / 0.30)",
                paddingLeft: "1rem",
              }}>
                {post.excerpt}
              </motion.p>
            )}

            {/* ── Author row ── */}
            <motion.div variants={fadeUp} style={{
              display: "flex", alignItems: "center", gap: "0.875rem",
              paddingTop: "1.125rem",
              borderTop: "1px solid hsl(var(--border) / 0.45)",
            }}>
              {/* Avatar */}
              <div style={{
                width: "38px", height: "38px", borderRadius: "50%", flexShrink: 0,
                background: "hsl(var(--primary) / 0.12)",
                border: "1.5px solid hsl(var(--primary) / 0.22)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "hsl(var(--primary))" }}>
                  {(post.authorName ?? "T")[0]}
                </span>
              </div>

              {/* Name + date */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "hsl(var(--foreground) / 0.88)", lineHeight: 1.3 }}>
                  {post.authorName}
                </span>
                <span style={{ fontSize: "11.5px", color: "hsl(var(--foreground) / 0.38)", lineHeight: 1.3 }}>
                  {fmtDate(post.publishedAt)}
                </span>
              </div>

              {/* Reading time (decorative) */}
              {post.content && (
                <span style={{
                  marginLeft: "auto",
                  fontSize: "11.5px", color: "hsl(var(--foreground) / 0.28)",
                  display: "flex", alignItems: "center", gap: "4px",
                }}>
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                    <circle cx="5.5" cy="5.5" r="4.5" stroke="currentColor" strokeWidth="1.2"/>
                    <path d="M5.5 3.5V5.5l1.5 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                  {Math.max(1, Math.ceil(post.content.split(/\s+/).length / 200))} phút đọc
                </span>
              )}
            </motion.div>

          </motion.div>
        </div>
      </section>

      {/* ── Featured / fallback image ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
        style={{ maxWidth: isFallback ? "960px" : "700px", margin: "2.5rem auto 0", padding: "0 1.5rem" }}
      >
        <div style={{
          borderRadius: isFallback ? "12px" : "10px",
          overflow: "hidden",
          background: isFallback ? "#091e1b" : "transparent",
          boxShadow: isFallback
            ? "0 2px 24px rgba(0,0,0,0.20)"
            : "0 4px 24px rgba(10,40,35,0.10)",
          border: isFallback ? "1px solid rgba(52,160,140,0.12)" : "none",
          aspectRatio: "16/9",
          position: "relative",
        }}>
          <img
            src={imgSrc} alt={post.title}
            style={{
              width: "100%", height: "100%", display: "block",
              objectFit: "cover",
              filter: isFallback ? "none" : "brightness(0.97) contrast(1.01)",
            }}
          />
          {isFallback && (
            <div style={{
              position: "absolute", bottom: 0, right: 0,
              padding: "0.45rem 0.85rem",
              background: "rgba(5,22,19,0.72)",
              borderTop: "1px solid rgba(52,160,140,0.18)",
              borderLeft: "1px solid rgba(52,160,140,0.18)",
              fontSize: "10px", fontWeight: 600, letterSpacing: "0.12em",
              color: "rgba(52,160,140,0.80)",
              textTransform: "uppercase", pointerEvents: "none",
            }}>
              {getWatermarkText(post)}
            </div>
          )}
        </div>
        {!isFallback && (
          <p style={{ fontSize: "11px", color: "hsl(var(--foreground) / 0.30)", textAlign: "center", marginTop: "0.625rem", fontStyle: "italic" }}>
            {post.title}
          </p>
        )}
      </motion.div>

      {/* ── Article body ── */}
      <section style={{ padding: "2.75rem 0 4.5rem" }}>
        <div style={{ maxWidth: "700px", margin: "0 auto", padding: "0 1.5rem" }}>

          {post.content
            ? <Prose content={post.content} />
            : <p style={{ color: "hsl(var(--foreground) / 0.32)", fontStyle: "italic", fontSize: "15px" }}>Nội dung đang được cập nhật.</p>
          }

          {/* ── Tags ── */}
          {(post.tags ?? []).length > 0 && (
            <div style={{ marginTop: "3.25rem", paddingTop: "1.75rem", borderTop: "1px solid hsl(var(--border) / 0.45)" }}>
              <p style={{
                fontSize: "10px", fontWeight: 700, letterSpacing: "0.15em",
                textTransform: "uppercase", color: "hsl(var(--foreground) / 0.32)",
                marginBottom: "0.75rem",
              }}>
                Chủ đề
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {(post.tags ?? []).map((t) => (
                  <Link key={t.slug} href={`/tin-tuc/tag/${t.slug}`}
                    style={{
                      fontSize: "12px", fontWeight: 500,
                      color: "hsl(var(--primary) / 0.88)",
                      background: "hsl(var(--primary) / 0.07)",
                      padding: "5px 13px", borderRadius: "999px",
                      border: "1px solid hsl(var(--primary) / 0.18)",
                      textDecoration: "none",
                      transition: "background 0.16s ease, border-color 0.16s ease, color 0.16s ease",
                      display: "inline-block",
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.background   = "hsl(var(--primary) / 0.13)";
                      el.style.borderColor  = "hsl(var(--primary) / 0.35)";
                      el.style.color        = "hsl(var(--primary))";
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.background   = "hsl(var(--primary) / 0.07)";
                      el.style.borderColor  = "hsl(var(--primary) / 0.18)";
                      el.style.color        = "hsl(var(--primary) / 0.88)";
                    }}
                  >
                    #{t.slug}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* ── Back link ── */}
          <div style={{ marginTop: "2.75rem" }}>
            <Link href="/tin-tuc"
              style={{
                fontSize: "13px", fontWeight: 500,
                color: "hsl(var(--foreground) / 0.50)",
                textDecoration: "none",
                display: "inline-flex", alignItems: "center", gap: "0.5rem",
                padding: "6px 14px 6px 10px",
                border: "1px solid hsl(var(--border) / 0.55)",
                borderRadius: "999px",
                transition: "color 0.18s ease, border-color 0.18s ease, background 0.18s ease",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.color       = "hsl(var(--foreground) / 0.80)";
                el.style.borderColor = "hsl(var(--border))";
                el.style.background  = "hsl(var(--muted) / 0.50)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.color       = "hsl(var(--foreground) / 0.50)";
                el.style.borderColor = "hsl(var(--border) / 0.55)";
                el.style.background  = "transparent";
              }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M7.5 2L3.5 6l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Quay lại Tin tức
            </Link>
          </div>
        </div>
      </section>

      {/* ── Related articles ── */}
      {related.length > 0 && (
        <section style={{
          padding: "2.75rem 0 5rem",
          borderTop: "1px solid hsl(var(--border) / 0.40)",
          background: "hsl(var(--muted) / 0.28)",
        }}>
          <div style={{ maxWidth: "700px", margin: "0 auto", padding: "0 1.5rem" }}>

            {/* Section label */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.875rem", marginBottom: "1.375rem" }}>
              <div style={{ width: "1.5rem", height: "1.5px", background: "hsl(var(--primary) / 0.50)", borderRadius: "999px" }} />
              <p style={{
                fontSize: "10px", fontWeight: 700, letterSpacing: "0.16em",
                textTransform: "uppercase", color: "hsl(var(--foreground) / 0.36)", margin: 0,
              }}>
                Có thể anh/chị quan tâm
              </p>
            </div>

            {/* Cards */}
            <div style={{
              display: "grid",
              gridTemplateColumns: related.length > 1 ? "repeat(auto-fit, minmax(260px, 1fr))" : "1fr",
              gap: "0.75rem",
            }}>
              {related.map((p) => <RelatedCard key={p.slug} post={p} />)}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
