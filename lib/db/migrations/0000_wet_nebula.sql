CREATE TABLE "news_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "news_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "news_post_tags" (
	"post_id" integer NOT NULL,
	"tag_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "news_posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"excerpt" text,
	"content" text,
	"featured_image" text,
	"featured_image_display" text,
	"category_id" integer,
	"product_id" integer,
	"status" text DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"author_name" text DEFAULT 'Phan Văn Thắng' NOT NULL,
	"seo_title" text,
	"seo_description" text,
	"is_featured" boolean DEFAULT false NOT NULL,
	"show_on_homepage" boolean DEFAULT false NOT NULL,
	"show_in_related" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "news_posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "news_products" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "news_products_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "news_tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "news_tags_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "contact_channels" (
	"id" serial PRIMARY KEY NOT NULL,
	"channel_type" text NOT NULL,
	"label" text NOT NULL,
	"value" text NOT NULL,
	"icon_key" text,
	"tooltip_text" text,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"open_mode" text DEFAULT 'new_tab' NOT NULL,
	"show_on_desktop" boolean DEFAULT true NOT NULL,
	"show_on_mobile" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_contact_widget_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"widget_title" text,
	"widget_subtitle" text,
	"position" text DEFAULT 'bottom-right' NOT NULL,
	"expand_direction" text DEFAULT 'up' NOT NULL,
	"show_labels" boolean DEFAULT true NOT NULL,
	"show_tooltips" boolean DEFAULT true NOT NULL,
	"desktop_offset_x" integer DEFAULT 24 NOT NULL,
	"desktop_offset_y" integer DEFAULT 24 NOT NULL,
	"mobile_offset_x" integer DEFAULT 16 NOT NULL,
	"mobile_offset_y" integer DEFAULT 16 NOT NULL,
	"default_open" boolean DEFAULT false NOT NULL,
	"theme_variant" text,
	"show_on_desktop" boolean DEFAULT true NOT NULL,
	"show_on_mobile" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lead_notes" (
	"id" serial PRIMARY KEY NOT NULL,
	"lead_id" integer NOT NULL,
	"note" text NOT NULL,
	"note_type" text DEFAULT 'internal',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"phone" text,
	"source_type" text,
	"source_page" text,
	"product_ref" text,
	"message" text,
	"status" text DEFAULT 'moi' NOT NULL,
	"notes" text,
	"interest_topic" text,
	"form_type" text,
	"lead_stage" text,
	"tags" jsonb,
	"last_contacted_at" timestamp with time zone,
	"next_follow_up_at" timestamp with time zone,
	"consent_status" text,
	"utm_source" text,
	"utm_medium" text,
	"utm_campaign" text,
	"assigned_to" text,
	"score" integer DEFAULT 0 NOT NULL,
	"source_section" text,
	"referrer" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "articles" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"excerpt" text,
	"content" text,
	"cover_image_url" text,
	"cover_image_alt" text,
	"cover_thumbnail_url" text,
	"category" text,
	"category_slug" text,
	"tags" text[],
	"publish_date" timestamp with time zone,
	"featured" boolean DEFAULT false NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"reading_time" text,
	"topic_slug" text,
	"series_slug" text,
	"seo_title" text,
	"seo_description" text,
	"seo_keywords" text,
	"og_title" text,
	"og_description" text,
	"og_image_url" text,
	"canonical_url" text,
	"noindex" boolean DEFAULT false NOT NULL,
	"generated_og_image_url" text,
	"og_image_generated" boolean DEFAULT false NOT NULL,
	"og_image_updated_at" timestamp with time zone,
	"show_on_homepage" boolean DEFAULT false NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "articles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "series" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"short_description" text,
	"cover_image_url" text,
	"cover_image_alt" text,
	"type" text DEFAULT 'mixed' NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"seo_title" text,
	"seo_description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "series_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "topics" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"short_description" text,
	"icon_key" text,
	"featured" boolean DEFAULT false NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"seo_title" text,
	"seo_description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "topics_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "videos" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"excerpt" text,
	"youtube_url" text NOT NULL,
	"youtube_video_id" text,
	"thumbnail_url" text,
	"thumbnail_alt" text,
	"thumbnail_small_url" text,
	"thumbnail_gradient" text,
	"duration" text,
	"publish_date" timestamp with time zone,
	"featured" boolean DEFAULT false NOT NULL,
	"is_featured_video" boolean DEFAULT false NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"topic_slug" text,
	"series_slug" text,
	"categories" text[],
	"seo_title" text,
	"seo_description" text,
	"seo_keywords" text,
	"og_title" text,
	"og_description" text,
	"og_image_url" text,
	"canonical_url" text,
	"noindex" boolean DEFAULT false NOT NULL,
	"generated_og_image_url" text,
	"og_image_generated" boolean DEFAULT false NOT NULL,
	"og_image_updated_at" timestamp with time zone,
	"show_on_homepage" boolean DEFAULT false NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "videos_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "media_assets" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text,
	"filename" text NOT NULL,
	"original_filename" text,
	"mime_type" text,
	"size_bytes" integer,
	"width" integer,
	"height" integer,
	"storage_path_original" text,
	"storage_path_processed" text DEFAULT '' NOT NULL,
	"storage_path_thumbnail" text,
	"public_url" text DEFAULT '' NOT NULL,
	"thumbnail_url" text,
	"alt_text" text,
	"watermark_enabled" boolean DEFAULT true NOT NULL,
	"watermark_text" text,
	"content_type" text DEFAULT 'shared' NOT NULL,
	"usage_context" text DEFAULT 'cover' NOT NULL,
	"tags" text[],
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "analytics_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_type" text NOT NULL,
	"entity_type" text,
	"entity_slug" text,
	"event_label" text,
	"page_path" text,
	"referrer" text,
	"session_id" text,
	"visitor_id" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_campaigns" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"subject" text NOT NULL,
	"preview_text" text,
	"campaign_type" text DEFAULT 'newsletter' NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"content_body" text,
	"target_type" text DEFAULT 'all',
	"target_tags" jsonb,
	"recipient_count" integer,
	"sent_at" timestamp with time zone,
	"scheduled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"subscriber_id" integer,
	"campaign_id" integer,
	"event_type" text NOT NULL,
	"event_metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_sequence_enrollments" (
	"id" serial PRIMARY KEY NOT NULL,
	"subscriber_id" integer NOT NULL,
	"sequence_id" integer NOT NULL,
	"current_step" integer DEFAULT 1 NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"next_send_at" timestamp with time zone,
	"enrolled_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "email_sequence_steps" (
	"id" serial PRIMARY KEY NOT NULL,
	"sequence_id" integer NOT NULL,
	"step_order" integer DEFAULT 1 NOT NULL,
	"delay_days" integer DEFAULT 0 NOT NULL,
	"subject" text NOT NULL,
	"preview_text" text,
	"content_body" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_sequences" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'active' NOT NULL,
	"trigger_type" text DEFAULT 'on_subscribe',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_subscribers" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"full_name" text,
	"subscriber_status" text DEFAULT 'subscribed' NOT NULL,
	"source_type" text,
	"source_page" text,
	"source_section" text,
	"consent_status" text DEFAULT 'given',
	"unsubscribe_token" text NOT NULL,
	"linked_lead_id" integer,
	"tags" jsonb,
	"subscribed_at" timestamp with time zone DEFAULT now(),
	"unsubscribed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "email_subscribers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "lead_magnets" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"short_description" text,
	"full_description" text,
	"resource_type" text DEFAULT 'file' NOT NULL,
	"cover_image_url" text,
	"cover_image_alt" text,
	"file_url" text,
	"file_name" text,
	"file_size" integer,
	"file_mime_type" text,
	"external_url" text,
	"thank_you_message" text,
	"button_label" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"gating_mode" text DEFAULT 'email_unlock' NOT NULL,
	"delivery_mode" text DEFAULT 'direct' NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"topic_slug" text,
	"tags" jsonb,
	"cta_title" text,
	"cta_description" text,
	"seo_title" text,
	"seo_description" text,
	"og_image_url" text,
	"requires_phone" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lead_magnets_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "resource_access_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"resource_id" integer NOT NULL,
	"lead_id" integer,
	"subscriber_id" integer,
	"full_name" text,
	"email" text,
	"phone" text,
	"access_type" text NOT NULL,
	"source_page" text,
	"source_section" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "news_post_tags" ADD CONSTRAINT "news_post_tags_post_id_news_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."news_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news_post_tags" ADD CONSTRAINT "news_post_tags_tag_id_news_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."news_tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news_posts" ADD CONSTRAINT "news_posts_category_id_news_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."news_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news_posts" ADD CONSTRAINT "news_posts_product_id_news_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."news_products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_notes" ADD CONSTRAINT "lead_notes_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_events" ADD CONSTRAINT "email_events_subscriber_id_email_subscribers_id_fk" FOREIGN KEY ("subscriber_id") REFERENCES "public"."email_subscribers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_events" ADD CONSTRAINT "email_events_campaign_id_email_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."email_campaigns"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_sequence_enrollments" ADD CONSTRAINT "email_sequence_enrollments_subscriber_id_email_subscribers_id_fk" FOREIGN KEY ("subscriber_id") REFERENCES "public"."email_subscribers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_sequence_enrollments" ADD CONSTRAINT "email_sequence_enrollments_sequence_id_email_sequences_id_fk" FOREIGN KEY ("sequence_id") REFERENCES "public"."email_sequences"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_sequence_steps" ADD CONSTRAINT "email_sequence_steps_sequence_id_email_sequences_id_fk" FOREIGN KEY ("sequence_id") REFERENCES "public"."email_sequences"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_subscribers" ADD CONSTRAINT "email_subscribers_linked_lead_id_leads_id_fk" FOREIGN KEY ("linked_lead_id") REFERENCES "public"."leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_access_events" ADD CONSTRAINT "resource_access_events_resource_id_lead_magnets_id_fk" FOREIGN KEY ("resource_id") REFERENCES "public"."lead_magnets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_access_events" ADD CONSTRAINT "resource_access_events_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_access_events" ADD CONSTRAINT "resource_access_events_subscriber_id_email_subscribers_id_fk" FOREIGN KEY ("subscriber_id") REFERENCES "public"."email_subscribers"("id") ON DELETE no action ON UPDATE no action;