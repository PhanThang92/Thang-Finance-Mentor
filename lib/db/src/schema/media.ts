import { pgTable, serial, text, boolean, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/* ══════════════════════════════════════════════
   MEDIA ASSETS — Centralized image library
   Tracks every uploaded & processed image.
   Content entries reference publicUrl directly.
══════════════════════════════════════════════ */

export const mediaAssetsTable = pgTable("media_assets", {
  id:                   serial("id").primaryKey(),
  title:                text("title"),
  filename:             text("filename").notNull(),
  originalFilename:     text("original_filename"),
  mimeType:             text("mime_type"),
  sizeBytes:            integer("size_bytes"),
  width:                integer("width"),
  height:               integer("height"),
  storagePathOriginal:  text("storage_path_original"),
  storagePathProcessed: text("storage_path_processed").notNull().default(""),
  storagePathThumbnail: text("storage_path_thumbnail"),
  publicUrl:            text("public_url").notNull().default(""),
  thumbnailUrl:         text("thumbnail_url"),
  altText:              text("alt_text"),
  watermarkEnabled:     boolean("watermark_enabled").notNull().default(true),
  watermarkText:        text("watermark_text"),
  contentType:          text("content_type").notNull().default("shared"),
  usageContext:         text("usage_context").notNull().default("cover"),
  tags:                 text("tags").array(),
  createdAt:            timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt:            timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertMediaAssetSchema = createInsertSchema(mediaAssetsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type MediaAsset = typeof mediaAssetsTable.$inferSelect;
export type InsertMediaAsset = z.infer<typeof insertMediaAssetSchema>;
