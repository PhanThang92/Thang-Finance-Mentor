import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useRoute } from "wouter";
import { motion } from "framer-motion";
import { newsApi, type NewsPost, type NewsCategory, type NewsProduct, type NewsTag } from "@/lib/newsApi";

/* ── motion presets ──────────────────────────────────────────────────── */
const VP = { once: true, amount: 0.12 };
const fadeUp = { hidden: { opacity: 0, y: 22 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };

/* ── helpers ──────────────────────────────────────────────────────────── */
function fmtDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("vi-VN", { day: "numeric", month: "long", year: "numeric" });
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.875rem", marginBottom: "0.25rem" }}>
      <div style={{ width: "1.75rem", height: "1.5px", background: "hsl(var(--primary))", borderRadius: "999px" }} />
      <span style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "hsl(var(--primary))" }}>{children}</span>
    </div>
  );
}

/* ── Article card ─────────────────────────────────────────────────────── */
function ArticleCard({ post }: { post: NewsPost }) {
  const cardHover = {
    initial: { y: 0, boxShadow: "0 2px 10px rgba(10,40,35,0.07)" },
    hover: { y: -3, boxShadow: "0 8px 28px rgba(10,40,35,0.13)", transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } },
  };
  return (
    <motion.div variants={fadeUp}>
      <Link href={`/tin-tuc/${post.category?.slug ?? "bai-viet"}/${post.slug}`} style={{ textDecoration: "none" }}>
        <motion.article
          initial="initial" whileHover="hover" variants={cardHover}
          style={{
            background: "hsl(var(--background))",
            border: "1px solid hsl(var(--border) / 0.80)", borderRadius: "12px",
            overflow: "hidden", cursor: "pointer", display: "flex", flexDirection: "column",
          }}>
          {post.featuredImage && (
            <div style={{ aspectRatio: "16/9", overflow: "hidden", background: "hsl(var(--muted))" }}>
              <img src={post.featuredImage} alt={post.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", filter: "brightness(0.96)" }} />
            </div>
          )}
          <div style={{ padding: "1.5rem 1.625rem", flex: 1, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
              {post.category && (
                <span style={{ fontSize: "9.5px", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "hsl(var(--primary))", background: "hsl(var(--primary) / 0.08)", padding: "3px 9px", borderRadius: "999px", border: "1px solid hsl(var(--primary) / 0.18)" }}>
                  {post.category.name}
                </span>
              )}
              {post.product && (
                <span style={{ fontSize: "9.5px", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "hsl(var(--foreground) / 0.45)", background: "hsl(var(--muted))", padding: "3px 9px", borderRadius: "999px", border: "1px solid hsl(var(--border) / 0.60)" }}>
                  {post.product.name}
                </span>
              )}
            </div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, lineHeight: 1.35, color: "hsl(var(--foreground))", margin: 0 }}>{post.title}</h3>
            {post.excerpt && <p style={{ fontSize: "13px", lineHeight: 1.75, fontWeight: 300, color: "hsl(var(--foreground) / 0.52)", margin: 0, flex: 1 }}>{post.excerpt}</p>}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", paddingTop: "0.5rem", borderTop: "1px solid hsl(var(--border) / 0.50)" }}>
              <span style={{ fontSize: "11px", fontWeight: 400, color: "hsl(var(--foreground) / 0.36)" }}>{fmtDate(post.publishedAt)}</span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                {(post.tags ?? []).slice(0, 2).map((t) => (
                  <span key={t.slug} style={{ fontSize: "9.5px", fontWeight: 500, color: "hsl(var(--foreground) / 0.38)", background: "hsl(var(--muted))", padding: "2px 7px", borderRadius: "999px" }}>#{t.slug}</span>
                ))}
              </div>
            </div>
          </div>
        </motion.article>
      </Link>
    </motion.div>
  );
}

/* ── Filter pill ─────────────────────────────────────────────────────── */
function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      padding: "5px 14px", borderRadius: "999px", border: "1px solid",
      fontSize: "12px", fontWeight: active ? 600 : 400, cursor: "pointer",
      transition: "all 0.2s ease",
      borderColor: active ? "hsl(var(--primary))" : "hsl(var(--border) / 0.70)",
      background: active ? "hsl(var(--primary) / 0.10)" : "transparent",
      color: active ? "hsl(var(--primary))" : "hsl(var(--foreground) / 0.55)",
    }}>
      {children}
    </button>
  );
}

/* ── Page ────────────────────────────────────────────────────────────── */
export default function TinTuc({ catSlug, productSlug, tagSlug }: { catSlug?: string; productSlug?: string; tagSlug?: string }) {
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState<string>(catSlug ?? "");
  const [activeProd, setActiveProd] = useState<string>(productSlug ?? "");
  const [activeTag, setActiveTag] = useState<string>(tagSlug ?? "");

  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: newsApi.getCategories });
  const { data: products = [] } = useQuery({ queryKey: ["products"], queryFn: newsApi.getProducts });
  const { data: tags = [] } = useQuery({ queryKey: ["tags"], queryFn: newsApi.getTags });
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["posts", activeCat, activeProd, activeTag],
    queryFn: () => newsApi.getPosts({ category: activeCat || undefined, product: activeProd || undefined, tag: activeTag || undefined }),
  });

  const filtered = useMemo(() => {
    if (!search.trim()) return posts;
    const q = search.toLowerCase();
    return posts.filter((p) => p.title.toLowerCase().includes(q) || (p.excerpt ?? "").toLowerCase().includes(q));
  }, [posts, search]);

  const pageTitle = activeCat
    ? (categories.find((c) => c.slug === activeCat)?.name ?? "Tin tức")
    : activeProd
    ? (products.find((p) => p.slug === activeProd)?.name ?? "Tin tức")
    : activeTag
    ? `#${activeTag}`
    : "Tin tức";

  return (
    <div style={{ minHeight: "100vh", background: "hsl(var(--background))" }}>
      {/* ── Hero ── */}
      <section style={{
        padding: "7rem 0 4rem",
        background: "linear-gradient(160deg, hsl(var(--primary) / 0.05) 0%, hsl(var(--background)) 60%)",
        borderBottom: "1px solid hsl(var(--border) / 0.50)",
      }}>
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeUp}><SectionLabel>Góc nhìn từ Thắng SWC</SectionLabel></motion.div>
            <motion.h1 variants={fadeUp} style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 800, lineHeight: 1.15, color: "hsl(var(--foreground))", margin: "1rem 0 1.25rem" }}>
              {pageTitle}
            </motion.h1>
            <motion.p variants={fadeUp} style={{ fontSize: "14.5px", fontWeight: 300, lineHeight: 1.85, color: "hsl(var(--foreground) / 0.50)", maxWidth: "38rem" }}>
              Góc nhìn dài hạn về tài chính cá nhân, đầu tư và hệ sinh thái sản phẩm — được viết rõ ràng, không hoa mỹ.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ── Filters ── */}
      <section style={{ borderBottom: "1px solid hsl(var(--border) / 0.40)", background: "hsl(var(--background))" }}>
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-5">
          {/* Search */}
          <div style={{ position: "relative", maxWidth: "28rem", marginBottom: "1.25rem" }}>
            <svg style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", opacity: 0.35 }} width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M10 10l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input
              type="text" placeholder="Tìm kiếm bài viết..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%", height: "38px", padding: "0 14px 0 34px",
                background: "transparent", border: "1px solid hsl(var(--border) / 0.80)", borderRadius: "999px",
                fontSize: "13px", color: "hsl(var(--foreground))", outline: "none", boxSizing: "border-box",
              }}
            />
          </div>

          {/* Category filters */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.625rem" }}>
            <Pill active={!activeCat && !activeProd && !activeTag} onClick={() => { setActiveCat(""); setActiveProd(""); setActiveTag(""); }}>Tất cả</Pill>
            {categories.map((c) => (
              <Pill key={c.slug} active={activeCat === c.slug} onClick={() => { setActiveCat(activeCat === c.slug ? "" : c.slug); setActiveProd(""); setActiveTag(""); }}>
                {c.name}
              </Pill>
            ))}
            {products.map((p) => (
              <Pill key={p.slug} active={activeProd === p.slug} onClick={() => { setActiveProd(activeProd === p.slug ? "" : p.slug); setActiveCat(""); setActiveTag(""); }}>
                {p.name}
              </Pill>
            ))}
          </div>

          {/* Tag filters */}
          {tags.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
              {tags.map((t) => (
                <button key={t.slug} onClick={() => setActiveTag(activeTag === t.slug ? "" : t.slug)}
                  style={{
                    padding: "3px 10px", borderRadius: "999px", border: "1px solid",
                    fontSize: "11px", cursor: "pointer", transition: "all 0.18s ease",
                    borderColor: activeTag === t.slug ? "hsl(var(--primary) / 0.55)" : "hsl(var(--border) / 0.40)",
                    background: activeTag === t.slug ? "hsl(var(--primary) / 0.08)" : "transparent",
                    color: activeTag === t.slug ? "hsl(var(--primary))" : "hsl(var(--foreground) / 0.38)",
                  }}>
                  #{t.slug}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Grid ── */}
      <section className="py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          {isLoading ? (
            <div style={{ textAlign: "center", padding: "5rem 0", color: "hsl(var(--foreground) / 0.35)", fontSize: "14px" }}>Đang tải...</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "5rem 0" }}>
              <p style={{ fontSize: "15px", color: "hsl(var(--foreground) / 0.35)", fontWeight: 300 }}>Chưa có bài viết nào phù hợp.</p>
            </div>
          ) : (
            <motion.div initial="hidden" whileInView="visible" viewport={VP} variants={stagger}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((p) => <ArticleCard key={p.slug} post={p} />)}
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
