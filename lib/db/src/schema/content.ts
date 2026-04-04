import { pgTable, serial, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/* ══════════════════════════════════════════════
   CONTENT TABLES — Articles and Videos
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
