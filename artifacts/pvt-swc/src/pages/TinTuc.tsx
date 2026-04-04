import React, { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { newsApi, type NewsPost } from "@/lib/newsApi";

/* ── motion ──────────────────────────────────────────────────────────── */
const VP = { once: true, amount: 0.10 };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };
const fadeUp  = { hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { duration: 0.52, ease: [0.22, 1, 0.36, 1] } } };
const cardVar = {
  initial: { y: 0, boxShadow: "0 2px 10px rgba(10,40,35,0.06)" },
  hover:   { y: -3, boxShadow: "0 8px 28px rgba(10,40,35,0.13)", transition: { duration: 0.26, ease: [0.22, 1, 0.36, 1] } },
};

/* ── helpers ─────────────────────────────────────────────────────────── */
function fmtDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("vi-VN", { day: "numeric", month: "long", year: "numeric" });
}

/* ── Filter state ────────────────────────────────────────────────────── */
interface Filters {
  category: string | null;   // null = all
  product:  string | null;
  tag:      string | null;
  search:   string;
}

const DEFAULT_FILTERS: Filters = { category: null, product: null, tag: null, search: "" };

function hasActiveFilter(f: Filters) {
  return f.category !== null || f.product !== null || f.tag !== null || f.search !== "";
}

/* ── Article card ────────────────────────────────────────────────────── */
function ArticleCard({ post }: { post: NewsPost }) {
  return (
    <motion.div variants={fadeUp} layout>
      <Link href={`/tin-tuc/${post.category?.slug ?? "bai-viet"}/${post.slug}`} style={{ textDecoration: "none" }}>
        <motion.article
          initial="initial" whileHover="hover" variants={cardVar}
          style={{
            background: "hsl(var(--background))",
            border: "1px solid hsl(var(--border) / 0.80)", borderRadius: "12px",
            overflow: "hidden", cursor: "pointer", display: "flex", flexDirection: "column", height: "100%",
          }}>
          {post.featuredImage && (
            <div style={{ aspectRatio: "16/9", overflow: "hidden", background: "hsl(var(--muted))", flexShrink: 0 }}>
              <img src={post.featuredImage} alt={post.title}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", filter: "brightness(0.96)" }} />
            </div>
          )}
          <div style={{ padding: "1.5rem 1.625rem", flex: 1, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {post.category && (
                <span style={{
                  fontSize: "9.5px", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase",
                  color: "hsl(var(--primary))", background: "hsl(var(--primary) / 0.08)",
                  padding: "3px 9px", borderRadius: "999px", border: "1px solid hsl(var(--primary) / 0.18)",
                }}>
                  {post.category.name}
                </span>
              )}
              {post.product && (
                <span style={{
                  fontSize: "9.5px", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase",
                  color: "hsl(var(--foreground) / 0.45)", background: "hsl(var(--muted))",
                  padding: "3px 9px", borderRadius: "999px", border: "1px solid hsl(var(--border) / 0.60)",
                }}>
                  {post.product.name}
                </span>
              )}
            </div>

            <h3 style={{ fontSize: "16px", fontWeight: 700, lineHeight: 1.35, color: "hsl(var(--foreground))", margin: 0 }}>
              {post.title}
            </h3>

            {post.excerpt && (
              <p style={{ fontSize: "13px", lineHeight: 1.75, fontWeight: 300, color: "hsl(var(--foreground) / 0.52)", margin: 0, flex: 1 }}>
                {post.excerpt}
              </p>
            )}

            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              marginTop: "auto", paddingTop: "0.5rem", borderTop: "1px solid hsl(var(--border) / 0.50)",
            }}>
              <span style={{ fontSize: "11px", fontWeight: 400, color: "hsl(var(--foreground) / 0.36)" }}>
                {fmtDate(post.publishedAt)}
              </span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                {(post.tags ?? []).slice(0, 2).map((t) => (
                  <span key={t.slug} style={{
                    fontSize: "9.5px", fontWeight: 500, color: "hsl(var(--foreground) / 0.38)",
                    background: "hsl(var(--muted))", padding: "2px 7px", borderRadius: "999px",
                  }}>
                    #{t.slug}
                  </span>
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
      padding: "5px 15px", borderRadius: "999px", border: "1px solid",
      fontSize: "12px", fontWeight: active ? 600 : 400, cursor: "pointer",
      transition: "color 0.18s ease, background 0.18s ease, border-color 0.18s ease, font-weight 0.18s ease",
      borderColor: active ? "hsl(var(--primary))" : "hsl(var(--border) / 0.70)",
      background:  active ? "hsl(var(--primary) / 0.10)" : "transparent",
      color:       active ? "hsl(var(--primary))" : "hsl(var(--foreground) / 0.55)",
      outline: "none",
    }}>
      {children}
    </button>
  );
}

/* ── Tag chip ────────────────────────────────────────────────────────── */
function TagChip({ active, onClick, slug }: { active: boolean; onClick: () => void; slug: string }) {
  return (
    <button onClick={onClick} style={{
      padding: "3px 10px", borderRadius: "999px", border: "1px solid",
      fontSize: "11px", cursor: "pointer",
      transition: "color 0.18s ease, background 0.18s ease, border-color 0.18s ease",
      borderColor: active ? "hsl(var(--primary) / 0.55)" : "hsl(var(--border) / 0.40)",
      background:  active ? "hsl(var(--primary) / 0.08)" : "transparent",
      color:       active ? "hsl(var(--primary))" : "hsl(var(--foreground) / 0.40)",
      fontWeight:  active ? 600 : 400,
      outline: "none",
    }}>
      #{slug}
    </button>
  );
}

/* ── Page ────────────────────────────────────────────────────────────── */
export default function TinTuc({
  catSlug,
  productSlug,
  tagSlug,
}: {
  catSlug?: string;
  productSlug?: string;
  tagSlug?: string;
}) {
  /* Single source of truth for all filters */
  const [filters, setFilters] = useState<Filters>({
    ...DEFAULT_FILTERS,
    category: catSlug   ?? null,
    product:  productSlug ?? null,
    tag:      tagSlug   ?? null,
  });

  /* Load ALL published posts once — all filtering is client-side */
  const { data: allPosts = [], isLoading } = useQuery({
    queryKey: ["posts-all"],
    queryFn: () => newsApi.getPosts({ status: "published" }),
    staleTime: 30_000,
  });

  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: newsApi.getCategories });
  const { data: products   = [] } = useQuery({ queryKey: ["products"],   queryFn: newsApi.getProducts });
  const { data: tags       = [] } = useQuery({ queryKey: ["tags"],       queryFn: newsApi.getTags });

  /* ── Filter setters ── */
  const setCategory = useCallback((slug: string | null) =>
    setFilters((f) => ({ ...f, category: f.category === slug ? null : slug, product: null, tag: null })), []);
  const setProduct = useCallback((slug: string | null) =>
    setFilters((f) => ({ ...f, product: f.product === slug ? null : slug, category: null, tag: null })), []);
  const setTag = useCallback((slug: string | null) =>
    setFilters((f) => ({ ...f, tag: f.tag === slug ? null : slug })), []);
  const setSearch = useCallback((q: string) =>
    setFilters((f) => ({ ...f, search: q })), []);
  const resetAll = useCallback(() => setFilters(DEFAULT_FILTERS), []);

  /* ── Client-side filtering — single pass ── */
  const visible = useMemo(() => {
    let result = allPosts;

    if (filters.category) {
      result = result.filter((p) => p.category?.slug === filters.category);
    }
    if (filters.product) {
      result = result.filter((p) => p.product?.slug === filters.product);
    }
    if (filters.tag) {
      result = result.filter((p) => (p.tags ?? []).some((t) => t.slug === filters.tag));
    }
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (p) => p.title.toLowerCase().includes(q) || (p.excerpt ?? "").toLowerCase().includes(q)
      );
    }

    return result;
  }, [allPosts, filters]);

  /* ── Page title ── */
  const pageTitle = filters.category
    ? (categories.find((c) => c.slug === filters.category)?.name ?? "Tin tức")
    : filters.product
    ? (products.find((p) => p.slug === filters.product)?.name ?? "Tin tức")
    : filters.tag
    ? `#${filters.tag}`
    : "Tin tức";

  const filtersActive = hasActiveFilter(filters);

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
            <motion.div variants={fadeUp}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.875rem", marginBottom: "0.25rem" }}>
                <div style={{ width: "1.75rem", height: "1.5px", background: "hsl(var(--primary))", borderRadius: "999px" }} />
                <span style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "hsl(var(--primary))" }}>Góc nhìn từ Thắng SWC</span>
              </div>
            </motion.div>

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

          {/* Search + clear */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.125rem", flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: "1 1 16rem", maxWidth: "28rem" }}>
              <svg style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", opacity: 0.35, pointerEvents: "none" }}
                width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M10 10l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <input
                type="text" placeholder="Tìm kiếm bài viết..." value={filters.search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%", height: "37px", padding: "0 14px 0 34px",
                  background: "transparent", border: "1px solid hsl(var(--border) / 0.80)", borderRadius: "999px",
                  fontSize: "13px", color: "hsl(var(--foreground))", outline: "none", boxSizing: "border-box",
                  transition: "border-color 0.18s ease",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "hsl(var(--primary) / 0.45)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "hsl(var(--border) / 0.80)")}
              />
            </div>

            {/* Xóa bộ lọc */}
            <AnimatePresence>
              {filtersActive && (
                <motion.button
                  key="clear"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.2 }}
                  onClick={resetAll}
                  style={{
                    fontSize: "12px", fontWeight: 500, color: "hsl(var(--primary))",
                    background: "none", border: "none", cursor: "pointer", padding: "4px 0",
                    display: "inline-flex", alignItems: "center", gap: "5px", whiteSpace: "nowrap",
                  }}>
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                    <path d="M1.5 1.5l8 8M9.5 1.5l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  Xóa bộ lọc
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Category + product pills */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.625rem" }}>
            <Pill active={!filtersActive} onClick={resetAll}>Tất cả</Pill>

            {categories.map((c) => (
              <Pill
                key={c.slug}
                active={filters.category === c.slug}
                onClick={() => setCategory(c.slug)}>
                {c.name}
              </Pill>
            ))}

            {products.map((p) => (
              <Pill
                key={p.slug}
                active={filters.product === p.slug}
                onClick={() => setProduct(p.slug)}>
                {p.name}
              </Pill>
            ))}
          </div>

          {/* Tag chips */}
          {tags.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
              {tags.map((t) => (
                <TagChip
                  key={t.slug}
                  active={filters.tag === t.slug}
                  slug={t.slug}
                  onClick={() => setTag(t.slug)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Grid ── */}
      <section className="py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          {isLoading ? (
            /* skeleton shimmer */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} style={{
                  height: "280px", borderRadius: "12px", border: "1px solid hsl(var(--border) / 0.60)",
                  background: "linear-gradient(90deg, hsl(var(--muted)) 25%, hsl(var(--background)) 50%, hsl(var(--muted)) 75%)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 1.5s infinite",
                }} />
              ))}
            </div>
          ) : visible.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ textAlign: "center", padding: "5rem 0" }}>
              <p style={{ fontSize: "15px", color: "hsl(var(--foreground) / 0.35)", fontWeight: 300, marginBottom: "1rem" }}>
                Chưa có bài viết nào phù hợp với bộ lọc hiện tại.
              </p>
              {filtersActive && (
                <button onClick={resetAll} style={{
                  fontSize: "13px", fontWeight: 500, color: "hsl(var(--primary))",
                  background: "none", border: "none", cursor: "pointer", textDecoration: "underline",
                }}>
                  Xem tất cả bài viết
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div
              key={`grid-${filters.category}-${filters.product}-${filters.tag}-${filters.search}`}
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {visible.map((p) => <ArticleCard key={p.slug} post={p} />)}
            </motion.div>
          )}

          {/* Result count when filtering */}
          <AnimatePresence>
            {!isLoading && filtersActive && visible.length > 0 && (
              <motion.p
                key="count"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  marginTop: "2.5rem", textAlign: "center",
                  fontSize: "12px", color: "hsl(var(--foreground) / 0.32)", fontWeight: 400,
                }}>
                {visible.length} bài viết phù hợp
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* shimmer keyframe */}
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
    </div>
  );
}
