ALTER TABLE "media_assets" ADD COLUMN "storage_provider" text DEFAULT 'local' NOT NULL;--> statement-breakpoint
ALTER TABLE "media_assets" ADD COLUMN "storage_path_medium" text;--> statement-breakpoint
ALTER TABLE "media_assets" ADD COLUMN "medium_url" text;