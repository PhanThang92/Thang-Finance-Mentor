# Overview

This is a pnpm workspace monorepo designed for building a personal brand landing page and an associated API server. The project aims to provide a comprehensive platform for content delivery, user engagement, and administrative management. It leverages a modern web stack to ensure scalability, maintainability, and a robust user experience.

The core of the project involves an Express API server providing data for a Next.js frontend application. Key capabilities include dynamic content management for articles and videos, an administrative CMS for managing content and site settings, and a customizable frontend built with a specific design system. The architecture supports a hybrid content system, combining static configurations with database-backed dynamic content.

# User Preferences

I prefer concise and clear communication. When making changes, prioritize iterative development and explain the rationale behind significant architectural decisions. I want to be asked before major changes are implemented. Do not make changes to the `lib/api-spec` folder. Do not make changes to the file `src/config/siteConfig.ts` without explicit approval.

# System Architecture

## Monorepo Structure and Tools

The project uses a pnpm workspace monorepo with TypeScript. Core tools include Node.js 24, pnpm, TypeScript 5.9, Express 5 for the API, PostgreSQL with Drizzle ORM for the database, and Zod for validation. API codegen is handled by Orval from an OpenAPI spec, and esbuild is used for CJS bundling.

The monorepo is structured into `artifacts/` for deployable applications (e.g., `api-server`), `lib/` for shared libraries (e.g., `api-spec`, `db`), and `scripts/` for utility scripts. TypeScript is configured with composite projects, extending a shared `tsconfig.base.json` for consistent type-checking across packages.

## API Server (`artifacts/api-server`)

The API server is an Express 5 application. It uses `@workspace/api-zod` for request/response validation and `@workspace/db` for persistence. Routes are organized under `src/routes/`, with `/api` as the base path. It handles CORS, JSON/urlencoded parsing.

## Database Layer (`lib/db`)

The database layer utilizes Drizzle ORM with PostgreSQL. It exports a Drizzle client instance and schema models defined in `src/schema/`. `drizzle-zod` is used for schema definitions.

## Frontend Application (`artifacts/pvt-swc`)

This is a personal brand landing page application with a dark-teal design system, targeting a Vietnamese audience.

### UI/UX and Design

- **Color Scheme**: Dark-teal design system.
- **Language**: Vietnamese only.
- **Theming**: Light mode.
- **Homepage**: Composed of 8 distinct sections, including Hero, ValueCore, LatestPosts (dynamic), Services, Topics, AboutPerson, Process, and CTA.
- **Image Handling**: Implements a deterministic fallback image system for articles based on `featuredImageDisplay`, `featuredImage`, product-based pools, category-based pools, and a default pool. Includes an image upload pipeline with `sharp` processing, WebP conversion, and SVG watermarking.

### Admin CMS (`/admin`)

- **Authentication**: Uses a configurable `ADMIN_KEY` for access, stored in localStorage.
- **Isolation**: Separated from the public site, without shared navigation components.
- **Modules**: Includes sections for Dashboard, Content (Posts, Categories, Tags), Ecosystem (Products, Leads), Operations (Community, Settings), and System (Account).
- **Dynamic Content Storage**: Product extra fields, community settings, and site settings are stored as JSON in the `site_settings` table to avoid schema changes.

### Content Architecture (3-Layer Hybrid System)

1.  **Layer A (Static/Structured Config)**: Stable, brand-level content (e.g., `siteConfig.ts`, `navigationConfig.ts`, `aboutPageData.tsx`).
2.  **Layer B (Content Collections)**: Repeatable, scalable content using typed models (e.g., `videosData.ts`, `seriesData.ts`, `topicsData.tsx`).
3.  **Layer C (UI Mapping)**: Pages dynamically render content by importing from Layer A and B, rather than hardcoding.

### Database-Backed Content

Articles and Videos are stored in PostgreSQL (`articles` and `videos` tables) and served via API routes (`/api/content/articles`, `/api/content/videos`). Frontend access is abstracted through `lib/articles.ts` and `lib/videos.ts`. Seeding is idempotent, using `scripts/src/seed-content.ts`.

### Admin CMS — Articles & Videos

The admin at `/admin` now includes full CRUD for both articles and videos (the KB hub content). Auth: `ADMIN_KEY` env var, default `swc-admin-2026`, stored in localStorage.

**Sidebar nav groups**: "" (Tổng quan), "Tin tức" (posts/categories/tags), "Kiến thức" (articles/videos/topics/series), "Hệ sinh thái" (products/leads), "Vận hành" (community/settings), "Hệ thống" (account).

**ArticlesPanel** (`src/pages/admin/ArticlesPanel.tsx`): list+form with filters (status/featured/homepage), topic+series dropdowns (loaded from content-meta API), SEO collapsible section (title/description/keywords/og-fields/noindex/canonical), showOnHomepage toggle, displayOrder field, auto-slug.

**VideosPanel** (`src/pages/admin/VideosPanel.tsx`): same pattern + YouTube URL validation + auto thumbnail + category chips + topic/series dropdowns + SEO section + showOnHomepage + displayOrder.

**TopicsPanel** (`src/pages/admin/TopicsPanel.tsx`): full CRUD for `topics` table — title, slug, description, shortDescription, iconKey, featured star, displayOrder, status (active/hidden), seoTitle/seoDescription.

**SeriesPanel** (`src/pages/admin/SeriesPanel.tsx`): full CRUD for `series` table — title, slug, description, type (article/video/mixed), coverImageUrl/Alt, featured star, displayOrder, status, seoTitle/seoDescription.

**DB Schema additions** (`lib/db/src/schema/content.ts`):
- `articles`: +seoTitle, seoDescription, seoKeywords, ogTitle, ogDescription, ogImageUrl, canonicalUrl, noindex, showOnHomepage, displayOrder, topicSlug, seriesSlug
- `videos`: same SEO+homepage fields added
- New `topics` table: id, title, slug, description, shortDescription, iconKey, featured, displayOrder, status, seoTitle, seoDescription, createdAt, updatedAt
- New `series` table: id, title, slug, description, shortDescription, coverImageUrl, coverImageAlt, type, featured, displayOrder, status, seoTitle, seoDescription, createdAt, updatedAt

**New API routes**:
- `/api/admin/content-meta` (GET): returns active topics+series for dropdowns
- `/api/admin/topics` (full CRUD): GET list, GET /:id, POST, PUT /:id, DELETE /:id
- `/api/admin/series` (full CRUD): same pattern
- Dashboard updated with topicsCount, seriesCount
- Public content routes (`/api/content/articles`, `/api/content/videos`) return all SEO fields via `db.select()`

**SEO hook** (`src/hooks/useSeoMeta.ts`): Sets `document.title`, meta description/keywords, og:title/description/image, twitter card, canonical URL, robots. Used in BaiViet, Video, KienThuc, TinTuc, CongDong pages.

### Admin CMS — Image Upload Pipeline

A complete media workflow is integrated into Articles and Videos forms.

**Server-side** (`artifacts/api-server/src/routes/admin.ts`):
- Upload endpoint: `POST /api/admin/upload-image` (multipart, Bearer auth, 15MB limit)
- Accepts JPG/PNG/WebP/GIF/AVIF
- Generates two outputs from each upload:
  - **Display image**: 1600×900 WebP (quality 87) with watermark
  - **Thumbnail**: 800×450 WebP (quality 82), derived from display image
- Stored in `uploads/orig/`, `uploads/disp/`, `uploads/thumb/`; all served under `/api/uploads/`
- Watermark: configurable by `context` param: `tu-duy-dau-tu` → "THẮNG SWC · TÀI CHÍNH"; `atlas` → "THẮNG SWC · ATLAS"; etc.
- Returns `{ original, display, thumbnail }` URL paths

**Frontend components**:
- `src/config/mediaConfig.ts`: Centralized presets per context (articles/videos/topics/series) — aspect ratio, watermark context, file size limit
- `src/pages/admin/CropModal.tsx`: Full-screen crop UI using `react-easy-crop` — 16:9 fixed ratio, zoom slider, canvas export to JPEG blob
- `src/pages/admin/ImageUploadField.tsx`: Reusable upload+crop+preview widget — file validation (type + size), crop → upload → preview flow, Vietnamese status text ("Tải ảnh lên", "Đang xử lý ảnh...", etc.), "Thay ảnh" / "Xóa ảnh" buttons, thumbnail preview alongside main image

**DB fields added**:
- `articles.cover_thumbnail_url`: 800×450 thumbnail URL
- `videos.thumbnail_small_url`: 800×450 thumbnail URL

**UX flow**: Editor clicks "Tải ảnh lên" → selects file → crop modal opens → drags to adjust, zooms, clicks "Lưu ảnh" → image uploaded to server → watermarked + compressed → both display and thumbnail URLs saved to form → preview rendered inline. Manual URL fallback input remains below upload widget.

# External Dependencies

-   **Monorepo Tool**: pnpm workspaces
-   **Package Manager**: pnpm
-   **API Framework**: Express 5
-   **Database**: PostgreSQL
-   **ORM**: Drizzle ORM
-   **Validation**: Zod, `drizzle-zod`
-   **API Codegen**: Orval
-   **Build Tool**: esbuild
-   **Image Processing**: sharp (used in the image upload pipeline)
-   **Frontend Framework**: Next.js (implied by React components, not explicitly listed in stack but evident)
-   **Data Fetching/State Management**: React Query (for generated API client hooks)
-   **TypeScript**: v5.9