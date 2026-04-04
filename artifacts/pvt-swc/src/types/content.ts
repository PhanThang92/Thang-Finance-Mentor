import type { ReactNode } from "react";

/* ══════════════════════════════════════════════
   SHARED CONTENT TYPES
   Source of truth for all data models.
   Upgrade path: swap local data files for
   Supabase / PostgreSQL / CMS queries that
   return objects matching these interfaces.
══════════════════════════════════════════════ */

/* ── Videos ── */
export interface VideoItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  duration: string;
  thumbnailGradient: string;
  youtubeUrl: string;
  publishDate: string;
  featured: boolean;
  isFeaturedVideo: boolean;
  status: "published" | "draft";
  categories: VideoCategory[];
  seriesSlug?: string;
  topicSlug?: string;
}

export type VideoCategory =
  | "all"
  | "featured"
  | "tai-chinh"
  | "dau-tu"
  | "tu-duy"
  | "series";

/* ── Series ── */
export interface SeriesItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverGradient: string;
  count: string;
  type: "video" | "article" | "mixed";
  featured: boolean;
  order: number;
  youtubeUrl: string;
}

/* ── Topics ── */
export interface TopicItem {
  id: string;
  slug: string;
  name: string;
  desc: string;
  href: string;
  icon: ReactNode;
  articleCount?: number;
  videoCount?: number;
  featured: boolean;
  order: number;
}

/* ── Articles ── */
export interface ArticleItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  categorySlug: string;
  tags: string[];
  publishDate: string;
  featured: boolean;
  status: "published" | "draft";
  readingTime?: number;
  topicSlug?: string;
  seriesSlug?: string;
}

/* ── News ── */
export interface NewsItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  categorySlug: string;
  publishDate: string;
  featured: boolean;
  status: "published" | "draft";
}

/* ── Navigation ── */
export interface NavDropdownItem {
  name: string;
  desc?: string;
  path: string;
}

export interface NavItemConfig {
  name: string;
  /** Relative path — used by simple link items. */
  path?: string;
  /** Identifier for dropdown variants. */
  dropdownKey?: string;
  items?: NavDropdownItem[];
}

export interface FooterLinkItem {
  name: string;
  href: string;
}

export interface SocialLink {
  platform: "youtube" | "facebook" | "email";
  href: string;
  ariaLabel: string;
}

/* ── About page ── */
export interface AboutHero {
  eyebrow: string;
  heading: string;
  subheading: string;
  supportingText: string;
}

export interface AboutMainSection {
  eyebrow: string;
  heading: string;
  description: string;
  highlights: string[];
  quote: string;
}

export interface CoreValue {
  title: string;
  desc: string;
  icon: ReactNode;
}

export interface AudienceSection {
  eyebrow: string;
  heading: string;
  items: string[];
}

export interface AboutCta {
  eyebrow: string;
  heading: string;
  subheading: string;
  primaryButton: ButtonLink;
  secondaryButton: ButtonLink;
}

export interface ButtonLink {
  label: string;
  href: string;
  external?: boolean;
}

/* ── Site-wide brand config ── */
export interface SiteConfig {
  brandName: string;
  brandTagline: string;
  footerDescription: string;
  contactEmail: string;
  youtubeUrl: string;
  facebookUrl: string;
  disclaimer: string;
  defaultSeoTitle: string;
  defaultSeoDescription: string;
}
