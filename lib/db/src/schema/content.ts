import { pgTable, serial, text, boolean, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/* ══════════════════════════════════════════════
   CONTENT TABLES — Articles, Videos, Topics, Series
   These power the Kiến thức (Knowledge) hub.
   Separate from news_posts (the CMS blog).
══════════════════════════════════════════════ */

/* ── Articles ──────────────────────────────── */
export const articlesTable = pgTable("articles", {
  id:               serial("id").primaryKey(),
  title:            text("title").notNull(),
  slug:             text("slug").notNull().unique(),
  excerpt:          text("excerpt"),
  content:          text("content"),
  coverImageUrl:    text("cover_image_url"),
  coverImageAlt:    text("cover_image_alt"),
  category:         text("category"),
  categorySlug:     text("category_slug"),
  tags:             text("tags").array(),
  publishDate:      timestamp("publish_date", { withTimezone: true }),
  featured:         boolean("featured").notNull().default(false),
  status:           text("status").notNull().default("draft"),
  readingTime:      text("reading_time"),
  topicSlug:        text("topic_slug"),
  seriesSlug:       text("series_slug"),
  /* SEO fields */
  seoTitle:         text("seo_title"),
  seoDescription:   text("seo_description"),
  seoKeywords:      text("seo_keywords"),
  ogTitle:          text("og_title"),
  ogDescription:    text("og_description"),
  ogImageUrl:       text("og_image_url"),
  canonicalUrl:     text("canonical_url"),
  noindex:          boolean("noindex").notNull().default(false),
  /* Homepage control */
  showOnHomepage:   boolean("show_on_homepage").notNull().default(false),
  displayOrder:     integer("display_order").notNull().default(0),
  createdAt:        timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt:        timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertArticleSchema = createInsertSchema(articlesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Article = typeof articlesTable.$inferSelect;
export type InsertArticle = z.infer<typeof insertArticleSchema>;

export type ArticleStatus = "draft" | "published" | "archived";

/* ── Videos ────────────────────────────────── */
export const videosTable = pgTable("videos", {
  id:               serial("id").primaryKey(),
  title:            text("title").notNull(),
  slug:             text("slug").notNull().unique(),
  excerpt:          text("excerpt"),
  youtubeUrl:       text("youtube_url").notNull(),
  youtubeVideoId:   text("youtube_video_id"),
  thumbnailUrl:     text("thumbnail_url"),
  thumbnailAlt:     text("thumbnail_alt"),
  thumbnailGradient: text("thumbnail_gradient"),
  duration:         text("duration"),
  publishDate:      timestamp("publish_date", { withTimezone: true }),
  featured:         boolean("featured").notNull().default(false),
  isFeaturedVideo:  boolean("is_featured_video").notNull().default(false),
  status:           text("status").notNull().default("draft"),
  topicSlug:        text("topic_slug"),
  seriesSlug:       text("series_slug"),
  categories:       text("categories").array(),
  /* SEO fields */
  seoTitle:         text("seo_title"),
  seoDescription:   text("seo_description"),
  seoKeywords:      text("seo_keywords"),
  ogTitle:          text("og_title"),
  ogDescription:    text("og_description"),
  ogImageUrl:       text("og_image_url"),
  canonicalUrl:     text("canonical_url"),
  noindex:          boolean("noindex").notNull().default(false),
  /* Homepage control */
  showOnHomepage:   boolean("show_on_homepage").notNull().default(false),
  displayOrder:     integer("display_order").notNull().default(0),
  createdAt:        timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt:        timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertVideoSchema = createInsertSchema(videosTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Video = typeof videosTable.$inferSelect;
export type InsertVideo = z.infer<typeof insertVideoSchema>;

export type VideoStatus = "draft" | "published" | "archived";

/* ── Topics ────────────────────────────────── */
export const topicsTable = pgTable("topics", {
  id:               serial("id").primaryKey(),
  title:            text("title").notNull(),
  slug:             text("slug").notNull().unique(),
  description:      text("description"),
  shortDescription: text("short_description"),
  iconKey:          text("icon_key"),
  featured:         boolean("featured").notNull().default(false),
  displayOrder:     integer("display_order").notNull().default(0),
  status:           text("status").notNull().default("active"),
  seoTitle:         text("seo_title"),
  seoDescription:   text("seo_description"),
  createdAt:        timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt:        timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertTopicSchema = createInsertSchema(topicsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Topic = typeof topicsTable.$inferSelect;
export type InsertTopic = z.infer<typeof insertTopicSchema>;

/* ── Series ────────────────────────────────── */
export const seriesTable = pgTable("series", {
  id:               serial("id").primaryKey(),
  title:            text("title").notNull(),
  slug:             text("slug").notNull().unique(),
  description:      text("description"),
  shortDescription: text("short_description"),
  coverImageUrl:    text("cover_image_url"),
  coverImageAlt:    text("cover_image_alt"),
  type:             text("type").notNull().default("mixed"),
  featured:         boolean("featured").notNull().default(false),
  displayOrder:     integer("display_order").notNull().default(0),
  status:           text("status").notNull().default("active"),
  seoTitle:         text("seo_title"),
  seoDescription:   text("seo_description"),
  createdAt:        timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt:        timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertSeriesSchema = createInsertSchema(seriesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Series = typeof seriesTable.$inferSelect;
export type InsertSeries = z.infer<typeof insertSeriesSchema>;
