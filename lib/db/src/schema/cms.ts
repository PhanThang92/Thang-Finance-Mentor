import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

/* ── Leads / form submissions ─────────────────────────────────────── */
export const leadsTable = pgTable("leads", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  sourceType: text("source_type"),   // e.g. "cong-dong", "san-pham", "hero"
  sourcePage: text("source_page"),   // e.g. "/cong-dong", "/san-pham/atlas"
  productRef: text("product_ref"),   // product slug if applicable
  message: text("message"),
  status: text("status").notNull().default("moi"), // moi | da-lien-he | dang-theo-doi | hoan-tat
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Lead = typeof leadsTable.$inferSelect;

/* ── Site settings (key-value) ────────────────────────────────────── */
export const siteSettingsTable = pgTable("site_settings", {
  key: text("key").primaryKey(),
  value: text("value"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type SiteSetting = typeof siteSettingsTable.$inferSelect;
