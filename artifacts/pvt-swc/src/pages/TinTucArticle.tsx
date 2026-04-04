import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { motion } from "framer-motion";
import { newsApi, type NewsPost } from "@/lib/newsApi";

/* ── motion ──────────────────────────────────────────────────────── */
const fadeUp = { hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };

function fmtDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("vi-VN", { day: "numeric", month: "long", year: "numeric" });
}

/* ── Related card (mini) ─────────────────────────────────────────── */
function RelatedCard({ post }: { post: NewsPost }) {
  return (
    <Link href={`/tin-tuc/${post.category?.slug ?? "bai-viet"}/${post.slug}`} style={{ textDecoration: "none" }}>
      <div style={{
        padding: "1.25rem 1.375rem", borderRadius: "10px",
        border: "1px solid hsl(var(--border) / 0.75)", cursor: "pointer",
        transition: "border-color 0.22s ease, box-shadow 0.22s ease",
      }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "hsl(var(--primary) / 0.40)"; e.currentTarget.style.boxShadow = "0 4px 18px rgba(10,40,35,0.09)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "hsl(var(--border) / 0.75)"; e.currentTarget.style.boxShadow = "none"; }}>
        {post.category && (
          <span style={{ fontSize: "9.5px", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "hsl(var(--primary))", display: "block", marginBottom: "0.5rem" }}>
            {post.category.name}
          </span>
        )}
        <p style={{ fontSize: "14px", fontWeight: 600, lineHeight: 1.35, color: "hsl(var(--foreground))", margin: "0 0 0.4rem" }}>{post.title}</p>
        <p style={{ fontSize: "11.5px", color: "hsl(var(--foreground) / 0.36)", margin: 0 }}>{fmtDate(post.publishedAt)}</p>
      </div>
    </Link>
  );
}

/* ── Prose renderer (plain text with paragraph breaks) ─────────────── */
function Prose({ content }: { content: string }) {
  const paragraphs = content.split(/\n\n+/);
  return (
    <div style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>
      {paragraphs.map((p, i) => {
        if (p.startsWith("# ")) return <h2 key={i} style={{ fontSize: "1.4rem", fontWeight: 700, margin: "2rem 0 0.75rem", color: "hsl(var(--foreground))" }}>{p.slice(2)}</h2>;
        if (p.startsWith("## ")) return <h3 key={i} style={{ fontSize: "1.15rem", fontWeight: 700, margin: "1.75rem 0 0.625rem", color: "hsl(var(--foreground))" }}>{p.slice(3)}</h3>;
        if (p.startsWith("- ")) {
          const items = p.split("\n").filter((l) => l.startsWith("- ")).map((l) => l.slice(2));
          return <ul key={i} style={{ margin: "1rem 0", paddingLeft: "1.25rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>{items.map((item, j) => <li key={j} style={{ fontSize: "15.5px", lineHeight: 1.85, fontWeight: 300, color: "hsl(var(--foreground) / 0.75)" }}>{item}</li>)}</ul>;
        }
        return <p key={i} style={{ fontSize: "15.5px", lineHeight: 1.9, fontWeight: 300, color: "hsl(var(--foreground) / 0.72)", margin: "0 0 1.375rem" }}>{p}</p>;
      })}
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────────────── */
export default function TinTucArticle() {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["post", slug],
    queryFn: () => newsApi.getPost(slug!),
    enabled: !!slug,
  });

  if (isLoading) {
    return <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", color: "hsl(var(--foreground) / 0.35)", fontSize: "14px" }}>Đang tải...</div>;
  }

  if (isError || !data?.post) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1.25rem" }}>
        <p style={{ fontSize: "16px", color: "hsl(var(--foreground) / 0.45)" }}>Không tìm thấy bài viết.</p>
        <Link href="/tin-tuc" style={{ fontSize: "13.5px", color: "hsl(var(--primary))", textDecoration: "none" }}>← Quay lại Tin tức</Link>
      </div>
    );
  }

  const { post, related } = data;

  return (
    <div style={{ minHeight: "100vh", background: "hsl(var(--background))" }}>
      {/* ── Hero ── */}
      <section style={{
        padding: "6rem 0 3.5rem",
        background: "linear-gradient(160deg, hsl(var(--primary) / 0.05) 0%, hsl(var(--background)) 55%)",
        borderBottom: "1px solid hsl(var(--border) / 0.40)",
      }}>
        <div style={{ maxWidth: "720px", margin: "0 auto", padding: "0 1.5rem" }}>
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            {/* Breadcrumb */}
            <motion.div variants={fadeUp} style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "1.5rem", fontSize: "12px", color: "hsl(var(--foreground) / 0.35)" }}>
              <Link href="/tin-tuc" style={{ color: "hsl(var(--primary))", textDecoration: "none", fontWeight: 500 }}>Tin tức</Link>
              <span>/</span>
              {post.category && <Link href={`/tin-tuc/${post.category.slug}`} style={{ color: "hsl(var(--foreground) / 0.45)", textDecoration: "none" }}>{post.category.name}</Link>}
              {post.category && <span>/</span>}
              <span style={{ color: "hsl(var(--foreground) / 0.30)" }}>{post.title.slice(0, 40)}{post.title.length > 40 ? "…" : ""}</span>
            </motion.div>

            {/* Category + product labels */}
            <motion.div variants={fadeUp} style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1.25rem" }}>
              {post.category && (
                <span style={{ fontSize: "9.5px", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "hsl(var(--primary))", background: "hsl(var(--primary) / 0.08)", padding: "3px 10px", borderRadius: "999px", border: "1px solid hsl(var(--primary) / 0.18)" }}>
                  {post.category.name}
                </span>
              )}
              {post.product && (
                <span style={{ fontSize: "9.5px", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "hsl(var(--foreground) / 0.45)", background: "hsl(var(--muted))", padding: "3px 10px", borderRadius: "999px", border: "1px solid hsl(var(--border) / 0.50)" }}>
                  {post.product.name}
                </span>
              )}
            </motion.div>

            <motion.h1 variants={fadeUp} style={{ fontSize: "clamp(1.6rem, 4vw, 2.5rem)", fontWeight: 800, lineHeight: 1.18, color: "hsl(var(--foreground))", margin: "0 0 1.25rem" }}>
              {post.title}
            </motion.h1>

            {post.excerpt && (
              <motion.p variants={fadeUp} style={{ fontSize: "16px", lineHeight: 1.8, fontWeight: 300, color: "hsl(var(--foreground) / 0.55)", margin: "0 0 1.5rem", fontStyle: "italic" }}>
                {post.excerpt}
              </motion.p>
            )}

            <motion.div variants={fadeUp} style={{ display: "flex", alignItems: "center", gap: "1.25rem", paddingTop: "1.25rem", borderTop: "1px solid hsl(var(--border) / 0.50)" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "hsl(var(--primary) / 0.14)", border: "1px solid hsl(var(--primary) / 0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "hsl(var(--primary))" }}>{(post.authorName ?? "T")[0]}</span>
              </div>
              <div>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "hsl(var(--foreground))", margin: 0 }}>{post.authorName}</p>
                <p style={{ fontSize: "11.5px", color: "hsl(var(--foreground) / 0.40)", margin: 0 }}>{fmtDate(post.publishedAt)}</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Featured image ── */}
      {post.featuredImage && (
        <div style={{ maxWidth: "720px", margin: "2.5rem auto 0", padding: "0 1.5rem" }}>
          <img src={post.featuredImage} alt={post.title} style={{ width: "100%", borderRadius: "12px", display: "block", objectFit: "cover", maxHeight: "420px", filter: "brightness(0.97)" }} />
        </div>
      )}

      {/* ── Content ── */}
      <section style={{ padding: "2.5rem 0 4rem" }}>
        <div style={{ maxWidth: "720px", margin: "0 auto", padding: "0 1.5rem" }}>
          {post.content ? <Prose content={post.content} /> : <p style={{ color: "hsl(var(--foreground) / 0.35)", fontStyle: "italic" }}>Nội dung đang được cập nhật.</p>}

          {/* Tags */}
          {(post.tags ?? []).length > 0 && (
            <div style={{ marginTop: "3rem", paddingTop: "1.75rem", borderTop: "1px solid hsl(var(--border) / 0.50)" }}>
              <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "hsl(var(--foreground) / 0.35)", marginBottom: "0.875rem" }}>Chủ đề</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {(post.tags ?? []).map((t) => (
                  <Link key={t.slug} href={`/tin-tuc/tag/${t.slug}`}
                    style={{ fontSize: "12px", fontWeight: 500, color: "hsl(var(--primary) / 0.85)", background: "hsl(var(--primary) / 0.07)", padding: "4px 12px", borderRadius: "999px", border: "1px solid hsl(var(--primary) / 0.20)", textDecoration: "none" }}>
                    #{t.slug}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Back link */}
          <div style={{ marginTop: "3rem" }}>
            <Link href="/tin-tuc" style={{ fontSize: "13.5px", fontWeight: 500, color: "hsl(var(--primary))", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Quay lại Tin tức
            </Link>
          </div>
        </div>
      </section>

      {/* ── Related ── */}
      {related.length > 0 && (
        <section style={{ padding: "3rem 0 5rem", borderTop: "1px solid hsl(var(--border) / 0.40)", background: "hsl(var(--muted) / 0.30)" }}>
          <div style={{ maxWidth: "720px", margin: "0 auto", padding: "0 1.5rem" }}>
            <p style={{ fontSize: "10.5px", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "hsl(var(--foreground) / 0.38)", marginBottom: "1.25rem" }}>Có thể anh/chị quan tâm</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              {related.map((p) => <RelatedCard key={p.slug} post={p} />)}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
