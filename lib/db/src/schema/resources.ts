import { pgTable, serial, text, timestamp, jsonb, integer, boolean } from "drizzle-orm/pg-core";
import { leadsTable } from "./cms";
import { emailSubscribersTable } from "./email";

/* ──────────────────────────────────────────────────────────────────────
   Lead magnets / downloadable resources

   gatingMode:
     public           — no form required; file URL served directly
     email_unlock     — name + email required before access
     lead_form_unlock — full form (name, email, phone, interest) required

   deliveryMode:
     direct  — download URL returned immediately after unlock
     email   — resource link sent via email
     both    — immediate download + email follow-up

   resourceType:
     file           — downloadable file (PDF, DOCX, XLSX, …)
     gated_page     — a content block unlocked after form
     external_link  — curated link delivered after form
   ───────────────────────────────────────────────────────────────────── */
export const leadMagnetsTable = pgTable("lead_magnets", {
  id:              serial("id").primaryKey(),
  title:           text("title").notNull(),
  slug:            text("slug").notNull().unique(),
  shortDescription: text("short_description"),
  fullDescription:  text("full_description"),
  resourceType:    text("resource_type").notNull().default("file"),
  coverImageUrl:   text("cover_image_url"),
  coverImageAlt:   text("cover_image_alt"),
  fileUrl:         text("file_url"),
  fileName:        text("file_name"),
  fileSize:        integer("file_size"),
  fileMimeType:    text("file_mime_type"),
  externalUrl:     text("external_url"),
  thankYouMessage: text("thank_you_message"),
  buttonLabel:     text("button_label"),
  status:          text("status").notNull().default("draft"),
  gatingMode:      text("gating_mode").notNull().default("email_unlock"),
  deliveryMode:    text("delivery_mode").notNull().default("direct"),
  featured:        boolean("featured").notNull().default(false),
  topicSlug:       text("topic_slug"),
  tags:            jsonb("tags").$type<string[]>(),
  ctaTitle:        text("cta_title"),
  ctaDescription:  text("cta_description"),
  seoTitle:        text("seo_title"),
  seoDescription:  text("seo_description"),
  ogImageUrl:      text("og_image_url"),
  requiresPhone:   boolean("requires_phone").notNull().default(false),
  sortOrder:       integer("sort_order").default(0),
  createdAt:       timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt:       timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type LeadMagnet = typeof leadMagnetsTable.$inferSelect;

/* ── Resource access events ──────────────────────────────────────────
   accessType values:
     page_view  — public detail page visited
     unlock     — form submitted & resource unlocked
     download   — direct download link clicked
     email_sent — resource delivered via email
   ───────────────────────────────────────────────────────────────────── */
export const resourceAccessEventsTable = pgTable("resource_access_events", {
  id:            serial("id").primaryKey(),
  resourceId:    integer("resource_id").notNull().references(() => leadMagnetsTable.id, { onDelete: "cascade" }),
  leadId:        integer("lead_id").references(() => leadsTable.id),
  subscriberId:  integer("subscriber_id").references(() => emailSubscribersTable.id),
  fullName:      text("full_name"),
  email:         text("email"),
  phone:         text("phone"),
  accessType:    text("access_type").notNull(),
  sourcePage:    text("source_page"),
  sourceSection: text("source_section"),
  metadata:      jsonb("metadata"),
  createdAt:     timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type ResourceAccessEvent = typeof resourceAccessEventsTable.$inferSelect;
