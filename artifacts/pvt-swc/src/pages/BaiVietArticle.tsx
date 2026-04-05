import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { motion } from "framer-motion";
import { getArticleBySlug, type Article } from "@/lib/articles";
import { trackArticleView } from "@/lib/analytics";
import { CompactLeadForm } from "@/components/CompactLeadForm";
import { Prose } from "@/components/Prose";

const fadeUp = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.50, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };

function fmtDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("vi-VN", { day: "numeric", month: "long", year: "numeric" });
}

function wordCount(text: string | null) {
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
}

/* ── Related article card ── */
function RelatedCard({ article }: { article: Article }) {
  return (
    <Link href={`/bai-viet/${article.slug}`} style={{ textDecoration: "none" }}>
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
        <div style={{ width: "3px", flexShrink: 0, alignSelf: "stretch", borderRadius: "999px", background: "hsl(var(--primary) / 0.30)", minHeight: "2.5rem" }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          {article.category && (
            <span style={{
              fontSize: "9px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase",
              color: "hsl(var(--primary))", display: "block", marginBottom: "0.35rem",
            }}>
              {article.category}
            </span>
          )}
          <p style={{
            fontSize: "14px", fontWeight: 600, lineHeight: 1.38,
            color: "hsl(var(--foreground))", margin: "0 0 0.375rem",
            overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
          }}>
            {article.title}
          </p>
          <p style={{ fontSize: "11.5px", color: "hsl(var(--foreground) / 0.36)", margin: 0 }}>
            {fmtDate(article.publishDate)}
          </p>
        </div>
      </div>
    </Link>
  );
}

/* ── Page ── */
export default function BaiVietArticle() {
  const { slug } = useParams<{ slug: string }>();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["article", slug],
    queryFn:  () => getArticleBySlug(slug!),
    enabled:  !!slug,
  });

  useEffect(() => {
    if (slug) trackArticleView(slug);
  }, [slug]);

  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, [slug]);

  /* ── SEO ── */
  useEffect(() => {
    const article = data?.article;
    if (!article) return;
    const title = article.seoTitle ?? article.title ?? "Bài viết";
    document.title = `${title} — Thắng SWC`;
    const desc = article.seoDescription ?? article.excerpt ?? "";
    let metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.name = "description";
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = desc;
    return () => { document.title = "Thắng SWC"; };
  }, [data]);

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

  /* ── Error / not found ── */
  if (isError || !data?.article) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1.25rem" }}>
        <p style={{ fontSize: "15px", color: "hsl(var(--foreground) / 0.42)" }}>Không tìm thấy bài viết.</p>
        <Link href="/bai-viet" style={{ fontSize: "13px", color: "hsl(var(--primary))", textDecoration: "none", fontWeight: 500 }}>← Quay lại Bài viết</Link>
      </div>
    );
  }

  const { article, related } = data;
  const hasCover = !!article.coverImageUrl;

  return (
    <div style={{ minHeight: "100vh", background: "hsl(var(--background))" }}>

      {/* ── Article header ── */}
      <section style={{
        paddingTop:    "clamp(4.5rem, 9vw, 6rem)",
        paddingBottom: "2.75rem",
        background: "linear-gradient(160deg, hsl(var(--primary) / 0.042) 0%, hsl(var(--background)) 55%)",
        borderBottom: "1px solid hsl(var(--border) / 0.35)",
      }}>
        <div style={{ maxWidth: "700px", margin: "0 auto", padding: "0 1.5rem" }}>
          <motion.div initial="hidden" animate="visible" variants={stagger}>

            {/* ── Breadcrumb ── */}
            <motion.nav variants={fadeUp} aria-label="Breadcrumb" style={{
              display: "flex", gap: "0.4rem", alignItems: "center",
              marginBottom: "1.625rem", fontSize: "12px",
            }}>
              <Link href="/bai-viet" style={{
                color: "hsl(var(--primary))", textDecoration: "none", fontWeight: 500,
                transition: "opacity 0.16s ease",
              }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.72")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                Bài viết
              </Link>
              {article.category && (
                <>
                  <span style={{ color: "hsl(var(--foreground) / 0.22)", fontSize: "10px" }}>›</span>
                  <span style={{ color: "hsl(var(--foreground) / 0.50)" }}>
                    {article.category}
                  </span>
                </>
              )}
              <span style={{ color: "hsl(var(--foreground) / 0.22)", fontSize: "10px" }}>›</span>
              <span style={{
                color: "hsl(var(--foreground) / 0.38)", fontWeight: 400,
                maxWidth: "220px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {article.title.length > 42 ? article.title.slice(0, 42) + "…" : article.title}
              </span>
            </motion.nav>

            {/* ── Category badge ── */}
            {article.category && (
              <motion.div variants={fadeUp} style={{ marginBottom: "1.125rem" }}>
                <span style={{
                  fontSize: "9px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase",
                  color: "hsl(var(--primary))",
                  background: "hsl(var(--primary) / 0.10)",
                  padding: "4px 11px", borderRadius: "999px",
                  border: "1px solid hsl(var(--primary) / 0.22)",
                }}>
                  {article.category}
                </span>
              </motion.div>
            )}

            {/* ── Title ── */}
            <motion.h1 variants={fadeUp} style={{
              fontSize: "clamp(1.75rem, 4.5vw, 2.65rem)", fontWeight: 800,
              lineHeight: 1.16, letterSpacing: "-0.018em",
              color: "hsl(var(--foreground))", margin: "0 0 1.125rem",
            }}>
              {article.title}
            </motion.h1>

            {/* ── Excerpt ── */}
            {article.excerpt && (
              <motion.p variants={fadeUp} style={{
                fontSize: "16.5px", lineHeight: 1.82, fontWeight: 300,
                color: "hsl(var(--foreground) / 0.62)",
                margin: "0 0 1.625rem",
                fontStyle: "italic",
                borderLeft: "2.5px solid hsl(var(--primary) / 0.30)",
                paddingLeft: "1rem",
              }}>
                {article.excerpt}
              </motion.p>
            )}

            {/* ── Meta row ── */}
            <motion.div variants={fadeUp} style={{
              display: "flex", alignItems: "center", gap: "0.875rem",
              paddingTop: "1.125rem",
              borderTop: "1px solid hsl(var(--border) / 0.45)",
            }}>
              <div style={{
                width: "38px", height: "38px", borderRadius: "50%", flexShrink: 0,
                background: "hsl(var(--primary) / 0.12)",
                border: "1.5px solid hsl(var(--primary) / 0.22)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "hsl(var(--primary))" }}>T</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "hsl(var(--foreground) / 0.88)", lineHeight: 1.3 }}>
                  Phan Văn Thắng
                </span>
                <span style={{ fontSize: "11.5px", color: "hsl(var(--foreground) / 0.38)", lineHeight: 1.3 }}>
                  {fmtDate(article.publishDate)}
                </span>
              </div>
              {(article.readingTime || article.content) && (
                <span style={{
                  marginLeft: "auto",
                  fontSize: "11.5px", color: "hsl(var(--foreground) / 0.28)",
                  display: "flex", alignItems: "center", gap: "4px",
                }}>
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                    <circle cx="5.5" cy="5.5" r="4.5" stroke="currentColor" strokeWidth="1.2"/>
                    <path d="M5.5 3.5V5.5l1.5 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                  {article.readingTime ?? `${Math.max(1, Math.ceil(wordCount(article.content) / 200))} phút đọc`}
                </span>
              )}
            </motion.div>

          </motion.div>
        </div>
      </section>

      {/* ── Cover image (if available) ── */}
      {hasCover && (
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number], delay: 0.18 }}
          style={{ maxWidth: "700px", margin: "2.75rem auto 0", padding: "0 1.5rem" }}
        >
          <div style={{
            borderRadius: "12px", overflow: "hidden",
            boxShadow: "0 2px 18px rgba(10,40,35,0.08), 0 0 0 1px hsl(var(--border) / 0.35)",
            aspectRatio: "16/9",
          }}>
            <img
              src={article.coverImageUrl!}
              alt={article.coverImageAlt ?? article.title}
              style={{ width: "100%", height: "100%", display: "block", objectFit: "cover", filter: "brightness(0.98) contrast(1.01) saturate(0.98)" }}
            />
          </div>
        </motion.div>
      )}

      {/* ── Article body ── */}
      <section style={{ padding: "3rem 0 5rem" }}>
        <div style={{ maxWidth: "700px", margin: "0 auto", padding: "0 1.5rem" }}>

          {article.content
            ? <Prose content={article.content} />
            : (
              <p style={{ color: "hsl(var(--foreground) / 0.32)", fontStyle: "italic", fontSize: "15px" }}>
                Nội dung đang được cập nhật.
              </p>
            )
          }

          {/* ── Tags ── */}
          {(article.tags ?? []).length > 0 && (
            <div style={{ marginTop: "3.5rem", paddingTop: "1.75rem", borderTop: "1px solid hsl(var(--border) / 0.42)" }}>
              <p style={{
                fontSize: "10px", fontWeight: 700, letterSpacing: "0.15em",
                textTransform: "uppercase", color: "hsl(var(--foreground) / 0.30)",
                marginBottom: "0.75rem",
              }}>
                Chủ đề
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {(article.tags ?? []).map((tag, idx) => (
                  <span key={idx} style={{
                    fontSize: "12px", fontWeight: 500,
                    color: "hsl(var(--primary) / 0.88)",
                    background: "hsl(var(--primary) / 0.07)",
                    padding: "5px 13px", borderRadius: "999px",
                    border: "1px solid hsl(var(--primary) / 0.18)",
                    display: "inline-block",
                  }}>
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ── Author card ── */}
          <div style={{
            marginTop: "3rem",
            padding: "1.375rem 1.5rem",
            borderRadius: "10px",
            border: "1px solid hsl(var(--border) / 0.45)",
            background: "hsl(var(--primary) / 0.025)",
            display: "flex", gap: "1.125rem", alignItems: "flex-start",
          }}>
            <div style={{
              width: "44px", height: "44px", borderRadius: "50%", flexShrink: 0,
              background: "hsl(var(--primary) / 0.14)",
              border: "1.5px solid hsl(var(--primary) / 0.24)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ fontSize: "16px", fontWeight: 700, color: "hsl(var(--primary))" }}>T</span>
            </div>
            <div>
              <p style={{ fontSize: "13px", fontWeight: 600, color: "hsl(var(--foreground) / 0.88)", margin: "0 0 0.25rem", lineHeight: 1.3 }}>
                Phan Văn Thắng
              </p>
              <p style={{ fontSize: "12px", lineHeight: 1.68, color: "hsl(var(--foreground) / 0.44)", margin: 0, fontStyle: "italic" }}>
                Mentor tài chính dài hạn. Chia sẻ kiến thức về tư duy tích sản, đầu tư và phát triển bản thân.
              </p>
            </div>
          </div>

          {/* ── Back link ── */}
          <div style={{ marginTop: "2.5rem" }}>
            <Link href="/bai-viet"
              style={{
                fontSize: "13px", fontWeight: 500,
                color: "hsl(var(--foreground) / 0.48)",
                textDecoration: "none",
                display: "inline-flex", alignItems: "center", gap: "0.5rem",
                padding: "7px 16px 7px 12px",
                border: "1px solid hsl(var(--border) / 0.52)",
                borderRadius: "999px",
                transition: "color 0.18s ease, border-color 0.18s ease, background 0.18s ease",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.color       = "hsl(var(--foreground) / 0.78)";
                el.style.borderColor = "hsl(var(--border))";
                el.style.background  = "hsl(var(--muted) / 0.50)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.color       = "hsl(var(--foreground) / 0.48)";
                el.style.borderColor = "hsl(var(--border) / 0.52)";
                el.style.background  = "transparent";
              }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M7.5 2L3.5 6l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Quay lại Bài viết
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
            <div style={{ display: "flex", alignItems: "center", gap: "0.875rem", marginBottom: "1.375rem" }}>
              <div style={{ width: "1.5rem", height: "1.5px", background: "hsl(var(--primary) / 0.50)", borderRadius: "999px" }} />
              <p style={{
                fontSize: "10px", fontWeight: 700, letterSpacing: "0.16em",
                textTransform: "uppercase", color: "hsl(var(--foreground) / 0.36)", margin: 0,
              }}>
                Có thể anh/chị quan tâm
              </p>
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: related.length > 1 ? "repeat(auto-fit, minmax(260px, 1fr))" : "1fr",
              gap: "0.75rem",
            }}>
              {related.map((a) => <RelatedCard key={a.slug} article={a} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── Lead capture ── */}
      <CompactLeadForm
        title="Nhận thêm nội dung phù hợp"
        description="Để lại thông tin để nhận những bài viết và chia sẻ mới phù hợp với mối quan tâm của anh/chị."
        sourceType="bai-viet"
        sourcePage={`/bai-viet/${slug ?? ""}`}
        formType="email-capture"
        articleSlug={slug}
        articleTitle={article?.title}
        buttonLabel="Đăng ký nhận nội dung"
      />
    </div>
  );
}
