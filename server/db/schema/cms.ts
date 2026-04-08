import { pgTable, serial, text, timestamp, jsonb, integer, boolean } from "drizzle-orm/pg-core";

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
  utmTerm: text("utm_term"),
  utmContent: text("utm_content"),
  assignedTo: text("assigned_to"),
  score: integer("score").default(0).notNull(),
  sourceSection: text("source_section"),
  referrer: text("referrer"),
  // Article context (when form submitted from an article page)
  articleSlug: text("article_slug"),
  articleTitle: text("article_title"),
  // External sync state
  syncedToNotion: boolean("synced_to_notion").notNull().default(false),
  notionPageId: text("notion_page_id"),
  notionSyncedAt: timestamp("notion_synced_at", { withTimezone: true }),
  syncedToSheets: boolean("synced_to_sheets").notNull().default(false),
  sheetsSyncedAt: timestamp("sheets_synced_at", { withTimezone: true }),
  syncError: text("sync_error"),
  // Email notification status
  notifyStatus: text("notify_status"),  // "sent" | "failed" | "skipped" | null
  notifyError:  text("notify_error"),   // error message if failed
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

/* ── Contact widget settings (single-row config) ──────────────────── */
export const contactWidgetSettingsTable = pgTable("site_contact_widget_settings", {
  id:               serial("id").primaryKey(),
  isEnabled:        boolean("is_enabled").notNull().default(true),
  widgetTitle:      text("widget_title"),
  widgetSubtitle:   text("widget_subtitle"),
  position:         text("position").notNull().default("bottom-right"),
  expandDirection:  text("expand_direction").notNull().default("up"),
  showLabels:       boolean("show_labels").notNull().default(true),
  showTooltips:     boolean("show_tooltips").notNull().default(true),
  desktopOffsetX:   integer("desktop_offset_x").notNull().default(24),
  desktopOffsetY:   integer("desktop_offset_y").notNull().default(24),
  mobileOffsetX:    integer("mobile_offset_x").notNull().default(16),
  mobileOffsetY:    integer("mobile_offset_y").notNull().default(16),
  defaultOpen:      boolean("default_open").notNull().default(false),
  themeVariant:     text("theme_variant"),
  showOnDesktop:    boolean("show_on_desktop").notNull().default(true),
  showOnMobile:     boolean("show_on_mobile").notNull().default(true),
  createdAt:        timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt:        timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type ContactWidgetSettings = typeof contactWidgetSettingsTable.$inferSelect;

/* ── Contact channels ─────────────────────────────────────────────── */
export const contactChannelsTable = pgTable("contact_channels", {
  id:            serial("id").primaryKey(),
  channelType:   text("channel_type").notNull(),   // phone | zalo | telegram
  label:         text("label").notNull(),
  value:         text("value").notNull(),           // phone number or URL
  iconKey:       text("icon_key"),
  tooltipText:   text("tooltip_text"),
  isEnabled:     boolean("is_enabled").notNull().default(true),
  displayOrder:  integer("display_order").notNull().default(0),
  openMode:      text("open_mode").notNull().default("new_tab"), // tel | same_tab | new_tab
  showOnDesktop: boolean("show_on_desktop").notNull().default(true),
  showOnMobile:  boolean("show_on_mobile").notNull().default(true),
  createdAt:     timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt:     timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type ContactChannel = typeof contactChannelsTable.$inferSelect;
