import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { relations } from "drizzle-orm";

export const newsCategoriesTable = pgTable("news_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const newsProductsTable = pgTable("news_products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const newsTagsTable = pgTable("news_tags", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const newsPostsTable = pgTable("news_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt"),
  content: text("content"),
  featuredImage: text("featured_image"),
  categoryId: integer("category_id").references(() => newsCategoriesTable.id),
  productId: integer("product_id").references(() => newsProductsTable.id),
  status: text("status").notNull().default("draft"),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  authorName: text("author_name").notNull().default("Phan Văn Thắng"),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const newsPostTagsTable = pgTable("news_post_tags", {
  postId: integer("post_id").notNull().references(() => newsPostsTable.id, { onDelete: "cascade" }),
  tagId: integer("tag_id").notNull().references(() => newsTagsTable.id, { onDelete: "cascade" }),
});

export const newsCategoriesRelations = relations(newsCategoriesTable, ({ many }) => ({
  posts: many(newsPostsTable),
}));

export const newsProductsRelations = relations(newsProductsTable, ({ many }) => ({
  posts: many(newsPostsTable),
}));

export const newsPostsRelations = relations(newsPostsTable, ({ one, many }) => ({
  category: one(newsCategoriesTable, { fields: [newsPostsTable.categoryId], references: [newsCategoriesTable.id] }),
  product: one(newsProductsTable, { fields: [newsPostsTable.productId], references: [newsProductsTable.id] }),
  postTags: many(newsPostTagsTable),
}));

export const newsPostTagsRelations = relations(newsPostTagsTable, ({ one }) => ({
  post: one(newsPostsTable, { fields: [newsPostTagsTable.postId], references: [newsPostsTable.id] }),
  tag: one(newsTagsTable, { fields: [newsPostTagsTable.tagId], references: [newsTagsTable.id] }),
}));

export const newsTagsRelations = relations(newsTagsTable, ({ many }) => ({
  postTags: many(newsPostTagsTable),
}));

export const insertNewsCategorySchema = createInsertSchema(newsCategoriesTable).omit({ id: true, createdAt: true });
export const insertNewsProductSchema = createInsertSchema(newsProductsTable).omit({ id: true, createdAt: true });
export const insertNewsTagSchema = createInsertSchema(newsTagsTable).omit({ id: true, createdAt: true });
export const insertNewsPostSchema = createInsertSchema(newsPostsTable).omit({ id: true, createdAt: true, updatedAt: true });

export type NewsCategory = typeof newsCategoriesTable.$inferSelect;
export type NewsProduct = typeof newsProductsTable.$inferSelect;
export type NewsTag = typeof newsTagsTable.$inferSelect;
export type NewsPost = typeof newsPostsTable.$inferSelect;
export type NewsPostTag = typeof newsPostTagsTable.$inferSelect;
export type InsertNewsPost = z.infer<typeof insertNewsPostSchema>;
