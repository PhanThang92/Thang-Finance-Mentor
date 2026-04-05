# Overview

This project is a pnpm workspace monorepo for a personal brand landing page and an associated API server. Its purpose is to create a comprehensive platform for dynamic content delivery, user engagement, and administrative management, built with a modern web stack for scalability and a robust user experience.

The system features an Express API server providing data to a Next.js frontend. Key capabilities include dynamic content management for articles and videos, a dedicated administrative CMS, and a customizable frontend. The architecture supports a hybrid content system combining static configurations with database-backed dynamic content.

# User Preferences

I prefer concise and clear communication. When making changes, prioritize iterative development and explain the rationale behind significant architectural decisions. I want to be asked before major changes are implemented. Do not make changes to the `lib/api-spec` folder. Do not make changes to the file `src/config/siteConfig.ts` without explicit approval.

# System Architecture

## Monorepo Structure

The project uses a pnpm workspace monorepo with TypeScript. It's structured into `artifacts/` for deployable applications, `lib/` for shared libraries, and `scripts/` for utilities. TypeScript is configured with composite projects extending a shared `tsconfig.base.json`.

## API Server

An Express 5 application that uses `@workspace/api-zod` for validation and `@workspace/db` for persistence. Routes are under `/api`, handling CORS and JSON parsing.

## Database Layer

Utilizes Drizzle ORM with PostgreSQL. It exports a Drizzle client and schema models defined using `drizzle-zod`.

## Frontend Application (Personal Brand Landing Page)

A Next.js application with a dark-teal design system, targeting a Vietnamese audience.

### UI/UX and Design

-   **Color Scheme**: Dark-teal.
-   **Language**: Vietnamese only.
-   **Theming**: Light mode.
-   **Homepage**: Composed of 8 distinct sections (Hero, ValueCore, LatestPosts, Services, Topics, AboutPerson, Process, CTA).
-   **Image Handling**: Features a deterministic fallback image system and an image upload pipeline with `sharp` processing, WebP conversion, and SVG watermarking.

### Admin CMS (`/admin`)

-   **Authentication**: Uses a configurable `ADMIN_KEY` stored in localStorage.
-   **Isolation**: Separated from the public site.
-   **Modules**: Includes Dashboard, Content (Posts, Categories, Tags, Articles, Videos, Topics, Series), Ecosystem (Products, Leads), Operations (Community, Settings), Analytics, Email (Subscribers, Campaigns, Sequences), and System (Account).
-   **Dynamic Content Storage**: Product extra fields, community settings, and site settings are stored as JSON in the `site_settings` table.
-   **Content Management**: Full CRUD operations for articles, videos, topics, and series, including SEO fields, `showOnHomepage`, and `displayOrder`.
-   **Image Upload Pipeline**: Integrated into forms, supporting multiple formats, server-side processing (watermarking, compression to WebP), and storing multiple resolutions (display, thumbnail).
-   **OG Image Generator**: Server-side generation of branded Open Graph images (1200x630 PNG) for articles and videos, using `sharp` and SVG compositing.
-   **Media Library**: Centralized asset management system (`media_assets` table) for all uploaded images, including metadata, search, filtering, and usage checks before deletion.

### Content Architecture (3-Layer Hybrid System)

1.  **Layer A (Static/Structured Config)**: Stable, brand-level content (e.g., `siteConfig.ts`).
2.  **Layer B (Content Collections)**: Repeatable, scalable content using typed models (e.g., `videosData.ts`).
3.  **Layer C (UI Mapping)**: Pages dynamically render content by importing from Layer A and B.

### Database-Backed Content

Articles and Videos are stored in PostgreSQL (`articles` and `videos` tables) and served via API routes. Frontend access is abstracted, and seeding is idempotent.

### Admin CMS — Internal Analytics System

A lightweight internal analytics system for tracking content performance without requiring external tools.

**Database table**: `analytics_events` — flexible event log with indexes for fast querying.

Schema fields: `id` (serial PK), `event_type`, `entity_type`, `entity_slug`, `event_label`, `page_path`, `referrer`, `session_id`, `visitor_id` (UUID stored in localStorage/sessionStorage for anonymous tracking), `metadata` (JSONB), `created_at`.

**Tracked event types**:
- `article_view` — fires on `/tin-tuc/:category/:slug` article detail pages (deduped per session)
- `article_click` — fires when clicking article cards on BaiViet.tsx listing
- `video_click` — fires when clicking video cards on Video.tsx listing
- `cta_click` — fires on CTA section buttons (label stored in `event_label`)
- `topic_click` / `series_click` / `hub_click` — available via helper, not yet wired to all pages

**Tracking files**:
- `artifacts/pvt-swc/src/lib/analytics.ts` — client-side helper with `trackEvent()`, `trackArticleView()`, `trackArticleClick()`, `trackVideoClick()`, `trackCtaClick()`, `trackTopicClick()`, `trackSeriesClick()`, `trackHubClick()`
- `artifacts/api-server/src/routes/track.ts` — public `POST /api/track` endpoint (no auth required), fire-and-forget
- Analytics admin routes: `GET /api/admin/analytics?days=7` — returns summary + top articles/videos/CTAs/topics + trend data

**Visitor/session logic**: Anonymous UUIDs stored in `localStorage` (visitor_id, persists across sessions) and `sessionStorage` (session_id, per tab session). No PII collected. `trackArticleView` is deduped per slug per in-memory session.

**Admin analytics panel**: `artifacts/pvt-swc/src/pages/admin/AnalyticsPanel.tsx`
- Accessible via admin sidebar "Phân tích nội dung" under "Phân tích" group
- Date range selector: 7 ngày / 30 ngày / 90 ngày
- Summary cards: Lượt xem bài viết, Lượt click video, Lượt click CTA, Lượt truy cập
- Trend chart: Recharts LineChart showing daily activity (3 lines: article views, video clicks, CTA clicks)
- Top articles list with view/click counts + title resolution (checks both `articles` and `news_posts` tables)
- Top videos list with click counts + title resolution (checks `videos` table)
- Top CTAs with click bar chart
- Top topics list with click counts
- Title resolution: two-step approach — get slugs first, then bulk lookup via separate queries (no correlated subqueries)

### CRM / Leads System

A full CRM system for tracking potential clients and interactions.

**Database tables**: `leads` (19 columns) + `lead_notes`

`leads` columns: `id`, `name`, `email`, `phone`, `source_type`, `source_page`, `product_ref`, `message`, `status`, `notes`, `interest_topic`, `form_type`, `lead_stage`, `tags` (JSONB), `last_contacted_at`, `next_follow_up_at`, `consent_status`, `created_at`, `updated_at`

**6 lead statuses**: `moi`, `da-lien-he`, `dang-quan-tam`, `nuoi-duong`, `da-chuyen-doi`, `da-dong`

**API routes** (all under `/api/admin/`):
- `GET /leads` — paginated list with filtering
- `PATCH /leads/:id` — update status, notes, interest, follow-up date
- `DELETE /leads/:id` — remove lead
- `GET /leads/:id/notes` — interaction history
- `POST /leads/:id/notes` — add note (types: internal, call, email, meeting)
- `DELETE /leads/:id/notes/:noteId` — remove note

**Forms that capture leads**:
- `LeadFormSection.tsx` — homepage "Liên hệ" section (email + name + phone + interest + honeypot)
- `CompactLeadForm.tsx` — compact form used in TinTucArticle.tsx (after related articles) and Video.tsx (at bottom)
- Various product/community forms

**Admin panel**: `artifacts/pvt-swc/src/pages/admin/LeadsPanel.tsx`
- Notes timeline with type badges (internal, call, email, meeting)
- Follow-up date picker with orange badge in header
- Quick status change inline + status pills in detail panel
- CSV export

### Email Marketing System

Full email marketing system with subscriber management, campaigns, and automated sequences.

**Database tables** (6 tables):
- `email_subscribers` — subscribers with unsubscribe token, source tracking, CRM link
- `email_campaigns` — newsletter broadcasts (draft → sent)
- `email_events` — sent / opened / clicked event log
- `email_sequences` — nurture sequence definitions
- `email_sequence_steps` — individual steps with delay_days
- `email_sequence_enrollments` — per-subscriber progress tracker

**Public API routes** (under `/api/email/`):
- `POST /subscribe` — newsletter signup (honeypot, rate limiting, CRM dedup, auto-link to lead)
- `GET /unsubscribe?token=` — one-click unsubscribe (returns JSON); triggers enrollment cancellations

**Admin API routes** (under `/api/admin/email/`, requires Bearer admin key):
- `GET /stats` — subscriber counts, campaign totals, recent campaigns
- `GET /subscribers`, `PATCH /subscribers/:id` — subscriber management
- `GET|POST /campaigns`, `GET|PUT|DELETE /campaigns/:id` — campaign CRUD
- `POST /campaigns/:id/send` — broadcast to subscribers
- `POST /campaigns/:id/test` — send test email
- `GET|POST /sequences`, `PUT|DELETE /sequences/:id` — sequence CRUD
- `GET|POST /sequences/:id/steps`, `PUT|DELETE /steps/:id` — step CRUD

**Services**:
- `emailService.ts` — Resend SDK wrapper; graceful no-op if `RESEND_API_KEY` not set
- `emailTemplates.ts` — HTML email templates (welcome, campaign, unsubscribe page)
- `sequenceWorker.ts` — background worker checks every 30 min for pending sequence emails

**Config env vars**: `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `RESEND_FROM_NAME`, `SITE_URL`

**Frontend**:
- `emailApi.subscribe()` + `emailApi.unsubscribe()` in `newsApi.ts`
- `HuyDangKy.tsx` — unsubscribe page at `/huy-dang-ky?token=...`
- Admin panels: `EmailSubscribersPanel.tsx`, `EmailCampaignsPanel.tsx`, `EmailSequencesPanel.tsx`

# External Dependencies

-   **Monorepo Tool**: pnpm workspaces
-   **Package Manager**: pnpm
-   **API Framework**: Express 5
-   **Database**: PostgreSQL
-   **ORM**: Drizzle ORM
-   **Validation**: Zod, `drizzle-zod`
-   **API Codegen**: Orval
-   **Build Tool**: esbuild
-   **Image Processing**: sharp
-   **Email Provider**: Resend (`resend` npm package) — requires `RESEND_API_KEY` env var; graceful no-op if not set
-   **Frontend Framework**: Next.js
-   **Data Fetching/State Management**: React Query
-   **TypeScript**: v5.9