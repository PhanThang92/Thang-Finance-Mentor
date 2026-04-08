import React, { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { newsApi, type NewsPost, type NewsCategory, type NewsProduct, type NewsTag } from "@/lib/newsApi";
import { getPostImage, getPostFallbackImage, isFallbackImage, getWatermarkText } from "@/lib/postImage";
import { useSeoMeta } from "@/hooks/useSeoMeta";

/* ── motion ──────────────────────────────────────────────────────────── */
const stagger  = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };
const fadeUp   = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.48, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } } };
const gridFade = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.28, ease: "easeOut" } } };
const cardVar  = {
  initial: { y: 0, boxShadow: "0 2px 10px rgba(10,40,35,0.05)" },
  hover:   { y: -3, boxShadow: "0 8px 28px rgba(10,40,35,0.12)", transition: { duration: 0.24, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

/* ── helpers ─────────────────────────────────────────────────────────── */
function fmtDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("vi-VN", { day: "numeric", month: "long", year: "numeric" });
}

/* ── Filter state ────────────────────────────────────────────────────── */
interface Filters {
  category: string | null;
  product:  string | null;
  tag:      string | null;
  search:   string;
}
const DEFAULT_FILTERS: Filters = { category: null, product: null, tag: null, search: "" };
const hasActiveFilter = (f: Filters) =>
  f.category !== null || f.product !== null || f.tag !== null || f.search !== "";
const filterKey = (f: Filters) => `${f.category}|${f.product}|${f.tag}|${f.search}`;

/* ── Article card ────────────────────────────────────────────────────── */
function ArticleCard({ post }: { post: NewsPost }) {
  const [imgFailed, setImgFailed] = useState(false);
  const isFallback = imgFailed || isFallbackImage(post);
  const imgSrc     = isFallback ? getPostFallbackImage(post) : getPostImage(post);
  const wmText     = isFallback ? getWatermarkText(post) : null;

  return (
    <motion.div variants={fadeUp}>
      <Link href={`/tin-tuc/${post.category?.slug ?? "bai-viet"}/${post.slug}`} style={{ textDecoration: "none" }}>
        <motion.article
          initial="initial" whileHover="hover" variants={cardVar}
          style={{
            background: "hsl(var(--background))",
            border: "1px solid hsl(var(--border) / 0.78)", borderRadius: "12px",
            overflow: "hidden", cursor: "pointer", display: "flex", flexDirection: "column", height: "100%",
          }}>
          {/* Featured / fallback image — always shown */}
          <div style={{
            aspectRatio: "16/9", overflow: "hidden",
            background: isFallback ? "#091e1b" : "hsl(var(--muted))",
            flexShrink: 0, position: "relative",
          }}>
            <img src={imgSrc} alt={post.title}
              onError={() => setImgFailed(true)}
              style={{
                width: "100%", height: "100%", objectFit: "cover",
                display: "block",
                filter: isFallback ? "none" : "brightness(0.96)",
                transition: "transform 0.36s ease",
              }} />
            {wmText && (
              <div style={{
                position: "absolute", bottom: "8px", right: "10px",
                background: "rgba(0,0,0,0.22)", backdropFilter: "blur(4px)",
                borderRadius: "3px", padding: "2px 8px",
                fontSize: "8.5px", fontWeight: 700, letterSpacing: "1.7px",
                color: "rgba(255,255,255,0.72)", textTransform: "uppercase",
                userSelect: "none", pointerEvents: "none",
              }}>
                {wmText}
              </div>
            )}
          </div>
          <div style={{
            paddingTop: "clamp(1.125rem, 4vw, 1.5rem)",
            paddingRight: "clamp(1.125rem, 4vw, 1.625rem)",
            paddingBottom: "clamp(1.125rem, 4vw, 1.5rem)",
            paddingLeft: "clamp(1.125rem, 4vw, 1.625rem)",
            flex: 1, display: "flex", flexDirection: "column", gap: "0.625rem",
          }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
              {post.category && (
                <span style={{
                  fontSize: "9px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase",
                  color: "hsl(var(--primary))", background: "hsl(var(--primary) / 0.08)",
                  padding: "3px 9px", borderRadius: "999px", border: "1px solid hsl(var(--primary) / 0.16)",
                }}>{post.category.name}</span>
              )}
              {post.product && (
                <span style={{
                  fontSize: "9px", fontWeight: 600, letterSpacing: "0.13em", textTransform: "uppercase",
                  color: "hsl(var(--foreground) / 0.40)", background: "hsl(var(--muted))",
                  padding: "3px 9px", borderRadius: "999px", border: "1px solid hsl(var(--border) / 0.55)",
                }}>{post.product.name}</span>
              )}
            </div>
            {/* Title — clamped to 3 lines for consistent card heights across the grid */}
            <h3 style={{
              fontSize: "clamp(15px, 2.2vw, 16px)", fontWeight: 700, lineHeight: 1.34,
              color: "hsl(var(--foreground))", margin: 0,
              display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden",
            }}>
              {post.title}
            </h3>
            {/* Excerpt — clamped to 3 lines to keep card height balanced */}
            {post.excerpt && (
              <p style={{
                fontSize: "13px", lineHeight: 1.75, fontWeight: 400,
                color: "hsl(var(--foreground) / 0.48)", margin: 0, flex: 1,
                display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden",
              }}>
                {post.excerpt}
              </p>
            )}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              marginTop: "auto", paddingTop: "0.5rem", borderTop: "1px solid hsl(var(--border) / 0.45)",
            }}>
              <span style={{ fontSize: "11px", color: "hsl(var(--foreground) / 0.34)" }}>{fmtDate(post.publishedAt)}</span>
              <div style={{ display: "flex", gap: "0.375rem" }}>
                {(post.tags ?? []).slice(0, 2).map((t) => (
                  <span key={t.slug} style={{
                    fontSize: "9.5px", fontWeight: 500, color: "hsl(var(--foreground) / 0.35)",
                    background: "hsl(var(--muted))", padding: "2px 7px", borderRadius: "999px",
                  }}>#{t.slug}</span>
                ))}
              </div>
            </div>
          </div>
        </motion.article>
      </Link>
    </motion.div>
  );
}

/* ── Category / product pill ─────────────────────────────────────────── */
function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      position: "relative",
      padding: "5px 15px", borderRadius: "999px", border: "1px solid",
      fontSize: "12.5px", cursor: "pointer", outline: "none",
      transition: "color 0.16s, background 0.16s, border-color 0.16s",
      borderColor: active ? "hsl(var(--primary))"           : "hsl(var(--border) / 0.65)",
      background:  active ? "hsl(var(--primary) / 0.11)"    : "transparent",
      color:       active ? "hsl(var(--primary))"           : "hsl(var(--foreground) / 0.52)",
      fontWeight:  active ? 600 : 400,
      letterSpacing: active ? "0.005em" : "0",
    }}>
      {/* active dot */}
      {active && (
        <span style={{
          position: "absolute", left: "8px", top: "50%", transform: "translateY(-50%)",
          width: "4px", height: "4px", borderRadius: "50%",
          background: "hsl(var(--primary))", display: "block",
        }} />
      )}
      <span style={{ marginLeft: active ? "8px" : "0", transition: "margin 0.16s" }}>{children}</span>
    </button>
  );
}

/* ── Tag chip ────────────────────────────────────────────────────────── */
function TagChip({ active, onClick, slug }: { active: boolean; onClick: () => void; slug: string }) {
  return (
    <button onClick={onClick} style={{
      display: "inline-flex", alignItems: "center", gap: "4px",
      padding: "3px 10px", borderRadius: "999px", border: "1px solid",
      fontSize: "11px", cursor: "pointer", outline: "none",
      transition: "color 0.16s, background 0.16s, border-color 0.16s",
      borderColor: active ? "hsl(var(--primary) / 0.60)" : "hsl(var(--border) / 0.40)",
      background:  active ? "hsl(var(--primary) / 0.09)" : "transparent",
      color:       active ? "hsl(var(--primary))"        : "hsl(var(--foreground) / 0.38)",
      fontWeight:  active ? 600 : 400,
    }}>
      #{slug}
      {active && (
        <svg width="8" height="8" viewBox="0 0 8 8" fill="none" style={{ flexShrink: 0, opacity: 0.7 }}>
          <path d="M1 1l6 6M7 1L1 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
      )}
    </button>
  );
}

/* ── "Đang xem" context chip (dismissible) ───────────────────────────── */
function ContextChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.15 }}
      style={{
        display: "inline-flex", alignItems: "center", gap: "5px",
        padding: "2px 10px 2px 10px", borderRadius: "999px",
        background: "hsl(var(--primary) / 0.09)",
        border: "1px solid hsl(var(--primary) / 0.22)",
        color: "hsl(var(--primary))",
        fontSize: "11.5px", fontWeight: 500, lineHeight: 1.5,
      }}>
      {label}
      <button
        onClick={onRemove}
        style={{ background: "none", border: "none", cursor: "pointer", padding: "0", display: "flex", color: "inherit", opacity: 0.6 }}>
        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
          <path d="M1 1l6 6M7 1L1 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
      </button>
    </motion.span>
  );
}

/* ── Page ────────────────────────────────────────────────────────────── */
export default function TinTuc({ catSlug, productSlug, tagSlug }: { catSlug?: string; productSlug?: string; tagSlug?: string }) {
  useSeoMeta({
    title: "Tin Tức & Góc Nhìn",
    description: "Tin tức, phân tích và góc nhìn về thị trường tài chính, đầu tư và kinh tế từ Phan Văn Thắng SWC.",
    keywords: "tin tức tài chính, thị trường đầu tư, phân tích kinh tế, Phan Văn Thắng SWC",
    canonicalUrl: "https://thangswc.com/tin-tuc",
  });

  const [filters, setFilters] = useState<Filters>({
    ...DEFAULT_FILTERS,
    category: catSlug    ?? null,
    product:  productSlug ?? null,
    tag:      tagSlug    ?? null,
  });

  const { data: allPosts   = [], isLoading } = useQuery({ queryKey: ["posts-all"],  queryFn: () => newsApi.getPosts({ status: "published" }), staleTime: 30_000 });
  const { data: categories = [] }            = useQuery({ queryKey: ["categories"], queryFn: newsApi.getCategories });
  const { data: products   = [] }            = useQuery({ queryKey: ["products"],   queryFn: newsApi.getProducts });
  const { data: tags       = [] }            = useQuery({ queryKey: ["tags"],       queryFn: newsApi.getTags });

  /* ── Setters ── */
  const setCategory = useCallback((slug: string | null) =>
    setFilters((f) => ({ ...f, category: f.category === slug ? null : slug, product: null, tag: null })), []);
  const setProduct  = useCallback((slug: string | null) =>
    setFilters((f) => ({ ...f, product: f.product === slug ? null : slug, category: null, tag: null })), []);
  const setTag      = useCallback((slug: string | null) =>
    setFilters((f) => ({ ...f, tag: f.tag === slug ? null : slug })), []);
  const setSearch   = useCallback((q: string) => setFilters((f) => ({ ...f, search: q })), []);
  const resetAll    = useCallback(() => setFilters(DEFAULT_FILTERS), []);

  /* ── Client-side filter ── */
  const visible = useMemo(() => {
    let r = allPosts;
    if (filters.category) r = r.filter((p) => p.category?.slug === filters.category);
    if (filters.product)  r = r.filter((p) => p.product?.slug  === filters.product);
    if (filters.tag)      r = r.filter((p) => (p.tags ?? []).some((t) => t.slug === filters.tag));
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      r = r.filter((p) => p.title.toLowerCase().includes(q) || (p.excerpt ?? "").toLowerCase().includes(q));
    }
    return r;
  }, [allPosts, filters]);

  const filtersActive  = hasActiveFilter(filters);
  const activeCatName  = filters.category ? (categories.find((c) => c.slug === filters.category)?.name ?? null)  : null;
  const activeProdName = filters.product  ? (products.find((p) => p.slug  === filters.product)?.name  ?? null)  : null;

  /* ── "Đang xem" chips list ── */
  const contextChips: { key: string; label: string; remove: () => void }[] = [];
  if (activeCatName)      contextChips.push({ key: "cat",    label: activeCatName,         remove: () => setCategory(null) });
  if (activeProdName)     contextChips.push({ key: "prod",   label: activeProdName,        remove: () => setProduct(null)  });
  if (filters.tag)        contextChips.push({ key: "tag",    label: `#${filters.tag}`,     remove: () => setTag(null)      });
  if (filters.search)     contextChips.push({ key: "search", label: `"${filters.search}"`, remove: () => setSearch("")     });

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
                <span style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "hsl(var(--primary))" }}>
                  Góc nhìn từ Thắng SWC
                </span>
              </div>
            </motion.div>
            <motion.h1 variants={fadeUp} style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 800, lineHeight: 1.15, color: "hsl(var(--foreground))", margin: "1rem 0 1.25rem" }}>
              Tin tức
            </motion.h1>
            <motion.p variants={fadeUp} style={{ fontSize: "14.5px", fontWeight: 300, lineHeight: 1.85, color: "hsl(var(--foreground) / 0.50)", maxWidth: "38rem" }}>
              Góc nhìn dài hạn về tài chính cá nhân, đầu tư và hệ sinh thái sản phẩm — được viết rõ ràng, không hoa mỹ.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ── Filters ── */}
      <section style={{ borderBottom: "1px solid hsl(var(--border) / 0.38)", background: "hsl(var(--background))" }}>
        <div className="max-w-5xl mx-auto px-5 sm:px-8" style={{ padding: "1.25rem 1.5rem 1rem" }}>

          {/* Row 1: search */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: "1 1 16rem", maxWidth: "26rem" }}>
              <svg style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", opacity: 0.32, pointerEvents: "none" }}
                width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M10 10l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <input
                type="text"
                placeholder="Tìm kiếm bài viết..."
                value={filters.search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%", height: "36px", padding: "0 36px 0 34px",
                  background: "transparent", border: "1px solid hsl(var(--border) / 0.75)", borderRadius: "999px",
                  fontSize: "13px", color: "hsl(var(--foreground))", outline: "none", boxSizing: "border-box",
                  transition: "border-color 0.18s ease",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "hsl(var(--primary) / 0.45)")}
                onBlur ={(e) => (e.currentTarget.style.borderColor = "hsl(var(--border) / 0.75)")}
              />
              {/* clear search × */}
              <AnimatePresence>
                {filters.search && (
                  <motion.button
                    key="clr-s"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={() => setSearch("")}
                    style={{
                      position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
                      background: "none", border: "none", cursor: "pointer", padding: "2px",
                      color: "hsl(var(--foreground) / 0.35)", display: "flex",
                    }}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M1.5 1.5l7 7M8.5 1.5l-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* Reset all */}
            <AnimatePresence>
              {filtersActive && (
                <motion.button
                  key="rst"
                  initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -6 }}
                  transition={{ duration: 0.18 }}
                  onClick={resetAll}
                  style={{
                    fontSize: "12px", fontWeight: 500, color: "hsl(var(--foreground) / 0.40)",
                    background: "none", border: "1px solid hsl(var(--border) / 0.55)",
                    borderRadius: "999px", cursor: "pointer", padding: "4px 13px",
                    display: "inline-flex", alignItems: "center", gap: "5px",
                    transition: "color 0.16s, border-color 0.16s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "hsl(var(--foreground) / 0.70)"; e.currentTarget.style.borderColor = "hsl(var(--border))"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "hsl(var(--foreground) / 0.40)"; e.currentTarget.style.borderColor = "hsl(var(--border) / 0.55)"; }}>
                  <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                    <path d="M1 1l7 7M8 1L1 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                  Xóa bộ lọc
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Row 2: category + product pills */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.45rem", marginBottom: "0.55rem" }}>
            <Pill active={!filtersActive} onClick={resetAll}>Tất cả</Pill>
            {categories.map((c) => (
              <Pill key={c.slug} active={filters.category === c.slug} onClick={() => setCategory(c.slug)}>
                {c.name}
              </Pill>
            ))}
            {products.map((p) => (
              <Pill key={p.slug} active={filters.product === p.slug} onClick={() => setProduct(p.slug)}>
                {p.name}
              </Pill>
            ))}
          </div>

          {/* Row 3: tag chips */}
          {tags.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
              {tags.map((t) => (
                <TagChip key={t.slug} active={filters.tag === t.slug} slug={t.slug} onClick={() => setTag(t.slug)} />
              ))}
            </div>
          )}

          {/* Row 4: "Đang xem:" context bar */}
          <AnimatePresence>
            {contextChips.length > 0 && (
              <motion.div
                key="context"
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: "auto", marginTop: "0.875rem" }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                style={{ overflow: "hidden" }}>
                <div style={{
                  display: "flex", alignItems: "center", flexWrap: "wrap", gap: "0.5rem",
                  paddingTop: "0.875rem", borderTop: "1px solid hsl(var(--border) / 0.35)",
                }}>
                  <span style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", color: "hsl(var(--foreground) / 0.32)", textTransform: "uppercase", flexShrink: 0 }}>
                    Đang xem:
                  </span>
                  <AnimatePresence mode="popLayout">
                    {contextChips.map((chip) => (
                      <ContextChip key={chip.key} label={chip.label} onRemove={chip.remove} />
                    ))}
                  </AnimatePresence>
                  <span style={{ fontSize: "11px", color: "hsl(var(--foreground) / 0.28)", marginLeft: "0.25rem" }}>
                    — {visible.length} {visible.length === 1 ? "bài viết" : "bài viết"}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ── Grid ── */}
      <section style={{ padding: "4.5rem 0 6rem" }}>
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} style={{
                  height: "268px", borderRadius: "12px", border: "1px solid hsl(var(--border) / 0.55)",
                  background: "linear-gradient(90deg, hsl(var(--muted)) 25%, hsl(var(--background)) 50%, hsl(var(--muted)) 75%)",
                  backgroundSize: "200% 100%", animation: "shimmer 1.6s infinite linear",
                }} />
              ))}
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {visible.length === 0 ? (
                /* ── Empty state ── */
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.28 }}
                  style={{ textAlign: "center", padding: "5.5rem 0" }}>
                  {/* decorative line */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem", marginBottom: "1.75rem" }}>
                    <div style={{ width: "2.5rem", height: "1px", background: "hsl(var(--border))" }} />
                    <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "hsl(var(--primary) / 0.40)" }} />
                    <div style={{ width: "2.5rem", height: "1px", background: "hsl(var(--border))" }} />
                  </div>
                  <p style={{ fontSize: "15px", fontWeight: 500, color: "hsl(var(--foreground) / 0.40)", marginBottom: "0.5rem" }}>
                    Không có bài viết nào phù hợp
                  </p>
                  <p style={{ fontSize: "13px", fontWeight: 300, color: "hsl(var(--foreground) / 0.28)", marginBottom: "1.75rem", lineHeight: 1.7 }}>
                    Thử thay đổi bộ lọc hoặc từ khoá tìm kiếm.
                  </p>
                  {filtersActive && (
                    <button onClick={resetAll} style={{
                      fontSize: "12.5px", fontWeight: 500, color: "hsl(var(--primary))",
                      background: "hsl(var(--primary) / 0.08)", border: "1px solid hsl(var(--primary) / 0.22)",
                      borderRadius: "999px", cursor: "pointer", padding: "7px 20px",
                      transition: "background 0.18s ease",
                    }}>
                      Xem tất cả bài viết
                    </button>
                  )}
                </motion.div>
              ) : (
                /* ── Article grid ── */
                <motion.div
                  key={filterKey(filters)}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.065, delayChildren: 0.04 } } }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {visible.map((p) => <ArticleCard key={p.slug} post={p} />)}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </section>

      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
    </div>
  );
}
