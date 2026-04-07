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
  // Storage backend that holds the files (local | s3 | cloudinary …)
  storageProvider:      text("storage_provider").notNull().default("local"),
  // Relative paths — portable across storage backends
  storagePathOriginal:  text("storage_path_original"),
  storagePathProcessed: text("storage_path_processed").notNull().default(""),  // large / display
  storagePathMedium:    text("storage_path_medium"),                           // medium (1280×720)
  storagePathThumbnail: text("storage_path_thumbnail"),                        // thumbnail (800×450)
  // Public URLs — absolute, ready to use in <img src>
  publicUrl:            text("public_url").notNull().default(""),              // large / display
  mediumUrl:            text("medium_url"),                                    // medium
  thumbnailUrl:         text("thumbnail_url"),                                 // thumbnail
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
