import { pgTable, serial, text, timestamp, jsonb } from "drizzle-orm/pg-core";

export const analyticsEventsTable = pgTable("analytics_events", {
  id:         serial("id").primaryKey(),
  eventType:  text("event_type").notNull(),
  entityType: text("entity_type"),
  entitySlug: text("entity_slug"),
  eventLabel: text("event_label"),
  pagePath:   text("page_path"),
  referrer:   text("referrer"),
  sessionId:  text("session_id"),
  visitorId:  text("visitor_id"),
  metadata:   jsonb("metadata"),
  createdAt:  timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type AnalyticsEvent       = typeof analyticsEventsTable.$inferSelect;
export type InsertAnalyticsEvent = typeof analyticsEventsTable.$inferInsert;
