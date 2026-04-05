import { pgTable, serial, text, timestamp, jsonb, integer } from "drizzle-orm/pg-core";

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
  status: text("status").notNull().default("moi"), // moi | da-lien-he | dang-quan-tam | nuoi-duong | da-chuyen-doi | da-dong
  notes: text("notes"),
  interestTopic: text("interest_topic"),  // e.g. "tài chính cá nhân", "đầu tư dài hạn"
  formType: text("form_type"),            // "email-capture" | "consultation" | "community"
  leadStage: text("lead_stage"),          // optional funnel stage
  tags: jsonb("tags").$type<string[]>(),  // flexible classification tags
  lastContactedAt: timestamp("last_contacted_at", { withTimezone: true }),
  nextFollowUpAt: timestamp("next_follow_up_at", { withTimezone: true }),
  consentStatus: text("consent_status"),  // "given" | "not-given"
  utmSource: text("utm_source"),
  utmMedium: text("utm_medium"),
  utmCampaign: text("utm_campaign"),
  assignedTo: text("assigned_to"),
  score: integer("score").default(0).notNull(),
  sourceSection: text("source_section"),
  referrer: text("referrer"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Lead = typeof leadsTable.$inferSelect;

/* ── Lead notes / interaction history ────────────────────────────── */
export const leadNotesTable = pgTable("lead_notes", {
  id: serial("id").primaryKey(),
  leadId: integer("lead_id").notNull().references(() => leadsTable.id, { onDelete: "cascade" }),
  note: text("note").notNull(),
  noteType: text("note_type").default("internal"), // "internal" | "call" | "email" | "meeting"
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type LeadNote = typeof leadNotesTable.$inferSelect;

/* ── Site settings (key-value) ────────────────────────────────────── */
export const siteSettingsTable = pgTable("site_settings", {
  key: text("key").primaryKey(),
  value: text("value"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type SiteSetting = typeof siteSettingsTable.$inferSelect;
