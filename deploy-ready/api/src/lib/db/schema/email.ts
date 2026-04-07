import { pgTable, serial, text, timestamp, jsonb, integer, boolean } from "drizzle-orm/pg-core";
import { leadsTable } from "./cms";

/* ── Email subscribers ────────────────────────────────────────────── */
export const emailSubscribersTable = pgTable("email_subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  fullName: text("full_name"),
  firstName: text("first_name"),
  subscriberStatus: text("subscriber_status").notNull().default("subscribed"),
  // subscribed | unsubscribed | bounced | paused | suppressed
  interestPrimary: text("interest_primary"),
  // ky_luat_tai_chinh | dau_tu_dai_han | swc | con_duong_1_trieu_do | chua_ro
  stage: text("stage").default("new_lead"),
  // new_lead | nurturing | engaged | hot_lead | customer | inactive
  sourceType: text("source_type"),
  // website_homepage | website_article | website_contact | landing_leadmagnet | youtube | facebook | webinar | manual_import
  sourcePage: text("source_page"),
  sourceSection: text("source_section"),
  consentStatus: text("consent_status").default("given"),
  unsubscribeToken: text("unsubscribe_token").notNull(),
  linkedLeadId: integer("linked_lead_id").references(() => leadsTable.id),
  tags: jsonb("tags").$type<string[]>(),
  subscribedAt: timestamp("subscribed_at", { withTimezone: true }).defaultNow(),
  unsubscribedAt: timestamp("unsubscribed_at", { withTimezone: true }),
  lastEmailSentAt: timestamp("last_email_sent_at", { withTimezone: true }),
  lastOpenedAt: timestamp("last_opened_at", { withTimezone: true }),
  lastClickedAt: timestamp("last_clicked_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
export type EmailSubscriber = typeof emailSubscribersTable.$inferSelect;

/* ── Email campaigns (manual broadcasts / newsletters) ────────────── */
export const emailCampaignsTable = pgTable("email_campaigns", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  subject: text("subject").notNull(),
  previewText: text("preview_text"),
  campaignType: text("campaign_type").notNull().default("newsletter"),
  // newsletter | broadcast | automation
  status: text("status").notNull().default("draft"),
  // draft | sent | scheduled
  contentBody: text("content_body"),
  targetType: text("target_type").default("all"),
  // all | tagged | stage | source | interest
  targetTags: jsonb("target_tags").$type<string[]>(),
  targetStage: text("target_stage"),
  targetSource: text("target_source"),
  targetInterest: text("target_interest"),
  recipientCount: integer("recipient_count"),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
export type EmailCampaign = typeof emailCampaignsTable.$inferSelect;

/* ── Email events (sent / opened / clicked / bounced etc.) ────────── */
export const emailEventsTable = pgTable("email_events", {
  id: serial("id").primaryKey(),
  subscriberId: integer("subscriber_id").references(() => emailSubscribersTable.id),
  campaignId: integer("campaign_id").references(() => emailCampaignsTable.id),
  sequenceId: integer("sequence_id").references(() => emailSequencesTable.id, { onDelete: "set null" }),
  stepId: integer("step_id").references(() => emailSequenceStepsTable.id, { onDelete: "set null" }),
  eventType: text("event_type").notNull(),
  // sent | delivered | opened | clicked | bounced | unsubscribed
  eventMetadata: jsonb("event_metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
export type EmailEvent = typeof emailEventsTable.$inferSelect;

/* ── Email sequences (nurture flows) ─────────────────────────────── */
export const emailSequencesTable = pgTable("email_sequences", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").unique(),
  description: text("description"),
  status: text("status").notNull().default("active"),
  // active | paused | archived
  triggerType: text("trigger_type").default("on_subscribe"),
  // on_subscribe | tag_added | form_submitted | link_clicked | manual | segment_entered
  triggerTags: jsonb("trigger_tags").$type<string[]>(),
  triggerConfig: jsonb("trigger_config").$type<Record<string, unknown>>(),
  excludeRules: jsonb("exclude_rules").$type<string[]>(),
  // array of rule ids: already_customer, already_enrolled, already_completed, unsubscribed, bounced, has_tag:xxx
  goal: text("goal"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
export type EmailSequence = typeof emailSequencesTable.$inferSelect;

/* ── Email sequence steps ─────────────────────────────────────────── */
export const emailSequenceStepsTable = pgTable("email_sequence_steps", {
  id: serial("id").primaryKey(),
  sequenceId: integer("sequence_id").notNull().references(() => emailSequencesTable.id, { onDelete: "cascade" }),
  stepOrder: integer("step_order").notNull().default(1),
  stepType: text("step_type").default("email"),
  // email | wait | add_tag | remove_tag | update_field | end | move_to_sequence
  delayDays: integer("delay_days").notNull().default(0),
  // --- Email step fields ---
  subject: text("subject").notNull().default(""),
  previewText: text("preview_text"),
  contentBody: text("content_body"),
  senderName: text("sender_name"),
  senderEmail: text("sender_email"),
  ctaText: text("cta_text"),
  ctaUrl: text("cta_url"),
  ctaSecondaryText: text("cta_secondary_text"),
  ctaSecondaryUrl: text("cta_secondary_url"),
  // --- Tag / field steps ---
  tagName: text("tag_name"),
  updateField: text("update_field"),
  updateValue: text("update_value"),
  // --- Move to sequence step ---
  targetSequenceId: integer("target_sequence_id").references(() => emailSequencesTable.id, { onDelete: "set null" }),
  // --- Legacy / misc ---
  actionData: jsonb("action_data"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
export type EmailSequenceStep = typeof emailSequenceStepsTable.$inferSelect;

/* ── Sequence enrollments (tracks per-subscriber progress) ────────── */
export const emailSequenceEnrollmentsTable = pgTable("email_sequence_enrollments", {
  id: serial("id").primaryKey(),
  subscriberId: integer("subscriber_id").notNull().references(() => emailSubscribersTable.id, { onDelete: "cascade" }),
  sequenceId: integer("sequence_id").notNull().references(() => emailSequencesTable.id, { onDelete: "cascade" }),
  currentStep: integer("current_step").notNull().default(1),
  status: text("status").notNull().default("active"),
  // active | completed | paused | cancelled
  nextSendAt: timestamp("next_send_at", { withTimezone: true }),
  enrolledAt: timestamp("enrolled_at", { withTimezone: true }).defaultNow().notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});
export type EmailSequenceEnrollment = typeof emailSequenceEnrollmentsTable.$inferSelect;
