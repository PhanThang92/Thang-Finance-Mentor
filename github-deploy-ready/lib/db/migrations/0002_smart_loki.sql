ALTER TABLE "leads" ADD COLUMN "utm_term" text;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "utm_content" text;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "article_slug" text;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "article_title" text;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "synced_to_notion" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "notion_page_id" text;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "notion_synced_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "synced_to_sheets" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "sheets_synced_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "sync_error" text;