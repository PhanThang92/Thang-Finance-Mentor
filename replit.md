# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   └── api-server/         # Express API server
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts, run via `pnpm --filter @workspace/scripts run <script>`
├── pnpm-workspace.yaml     # pnpm workspace (artifacts/*, lib/*, lib/integrations/*, scripts)
├── tsconfig.base.json      # Shared TS options (composite, bundler resolution, es2022)
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck` (which runs `tsc --build --emitDeclarationOnly`). This builds the full dependency graph so that cross-package imports resolve correctly. Running `tsc` inside a single package will fail if its dependencies haven't been built yet.
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck; actual JS bundling is handled by esbuild/tsx/vite...etc, not `tsc`.
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array. `tsc --build` uses this to determine build order and skip up-to-date packages.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes live in `src/routes/` and use `@workspace/api-zod` for request and response validation and `@workspace/db` for persistence.

- Entry: `src/index.ts` — reads `PORT`, starts Express
- App setup: `src/app.ts` — mounts CORS, JSON/urlencoded parsing, routes at `/api`
- Routes: `src/routes/index.ts` mounts sub-routers; `src/routes/health.ts` exposes `GET /health` (full path: `/api/health`)
- Depends on: `@workspace/db`, `@workspace/api-zod`
- `pnpm --filter @workspace/api-server run dev` — run the dev server
- `pnpm --filter @workspace/api-server run build` — production esbuild bundle (`dist/index.cjs`)
- Build bundles an allowlist of deps (express, cors, pg, drizzle-orm, zod, etc.) and externalizes the rest

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL. Exports a Drizzle client instance and schema models.

- `src/index.ts` — creates a `Pool` + Drizzle instance, exports schema
- `src/schema/index.ts` — barrel re-export of all models
- `src/schema/<modelname>.ts` — table definitions with `drizzle-zod` insert schemas (no models definitions exist right now)
- `drizzle.config.ts` — Drizzle Kit config (requires `DATABASE_URL`, automatically provided by Replit)
- Exports: `.` (pool, db, schema), `./schema` (schema only)

Production migrations are handled by Replit when publishing. In development, we just use `pnpm --filter @workspace/db run push`, and we fallback to `pnpm --filter @workspace/db run push-force`.

### `lib/api-spec` (`@workspace/api-spec`)

Owns the OpenAPI 3.1 spec (`openapi.yaml`) and the Orval config (`orval.config.ts`). Running codegen produces output into two sibling packages:

1. `lib/api-client-react/src/generated/` — React Query hooks + fetch client
2. `lib/api-zod/src/generated/` — Zod schemas

Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas from the OpenAPI spec (e.g. `HealthCheckResponse`). Used by `api-server` for response validation.

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks and fetch client from the OpenAPI spec (e.g. `useHealthCheck`, `healthCheck`).

### `scripts` (`@workspace/scripts`)

Utility scripts package. Each script is a `.ts` file in `src/` with a corresponding npm script in `package.json`. Run scripts via `pnpm --filter @workspace/scripts run <script>`. Scripts can import any workspace package (e.g., `@workspace/db`) by adding it as a dependency in `scripts/package.json`.

---

## Phan Văn Thắng SWC — Frontend App (`artifacts/pvt-swc`)

Personal brand landing page. Vietnamese only, light mode, dark-teal design system.

### Homepage Structure (rebuilt)

`src/pages/Home.tsx` composes 8 new section components:

1. **HeroSection** — dark teal full-viewport hero, portrait, new headline & CTAs ("Khám phá bài viết" / "Tìm hiểu dịch vụ"), trust line
2. **ValueCoreSection** — light card bg, 4 value cards with SVG icons
3. **LatestPostsSection** — dynamic from `/api/news/posts`, featured large card + 3 smaller side cards, skeleton loader, fallback images + watermarks
4. **ServicesSection** — dark teal bg, 3 service cards (articles / 1:1 / community)
5. **TopicsSection** — light card bg, 6 static topic cards enriched with API categories
6. **AboutPersonSection** — 2-col: portrait (with fade overlays) + bio text + quote + CTA
7. **ProcessSection** — 4-step numbered process with horizontal connector on desktop
8. **CTASection** — dark teal, "Bắt đầu từ việc hiểu đúng", 2 CTAs

### Article Fallback Image System

`src/lib/postImage.ts` provides `getPostImage(post)` which returns a deterministic image per post:

1. Custom `featuredImageDisplay` URL (processed/cropped, takes priority)
2. Custom `featuredImage` URL (original)
3. Product-based fallback pool (2 images each):
   - `atlas` → `fallback-atlas.svg`, `fallback-atlas-2.svg`
   - `road-to-1m` → `fallback-road-to-1m.svg`, `fallback-road-to-1m-2.svg`
4. Category-based fallback pool (2 images):
   - `tu-duy-dau-tu` → `fallback-tu-duy.svg`, `fallback-tu-duy-2.svg`
5. Default pool (2 images): `fallback-default.svg`, `fallback-default-2.svg`

Selection is deterministic: `pool[postId % poolSize]`. Same post always shows the same image. Different posts in the same group show different images. All fallbacks live in `public/images/`. `getWatermarkText(post)` returns a CSS watermark string shown on fallback images via overlay div in TinTuc.tsx, TinTucArticle.tsx, and admin PostsPanel.tsx.

### Admin CMS (`/admin`)

- Login key: `swc-admin-2026` (overridable via `ADMIN_KEY` env var, stored in localStorage as `swc_admin_key`)
- Isolated from public site: no Navbar/Footer inside `/admin`
- 10 navigation sections (sidebar grouped):
  - **Tổng quan**: Dashboard (stats, quick actions, recent posts & leads, active products list)
  - **Nội dung**: Bài viết (PostsPanel – searchable table + full editor w/ markdown toolbar, SEO, display toggles, status select, publishedAt date, breadcrumb nav), Chuyên mục (CategoriesPanel – CRUD), Tags (TagsPanel – chip view CRUD)
  - **Hệ sinh thái**: Sản phẩm (ProductsPanel – list view with product cards showing stats + status badge, full-page 7-tab editor: Thông tin chung/Hero/Sections/FAQ/Pricing/CTA/SEO; Sections/FAQ/Pricing have add/reorder↑↓/toggle/delete inline lists; settings stored as product_{slug}_{field} JSON), Leads (LeadsPanel – full-height: header+subtitle, "Xuất dữ liệu" CSV export, status tab strip with counts, filter bar with keyword+nguồn+sản phẩm, full table with 8 columns including inline status dropdown, right detail panel with contact/source/status/notes, empty states)
  - **Vận hành**: Cộng đồng (CommunityPanel – 4-tab editor: Thông tin chung/Hình thức tham gia/Liên kết cộng đồng/CTA & Form; participation paths stored as JSON array `community_paths`; form options as `community_form_options`; all in site_settings), Cài đặt (SettingsPanel – 6-tab rebuild: Menu (editable nav items with children/dropdown support stored as `site_nav_items` JSON), Footer (brand block + footer_nav_links JSON + footer_product_links JSON + extra links), Social (8 platform URL fields), Liên hệ (contact info + notes), Form (CTA config + response messages + source labels), SEO chung (title/desc/OG image/GA4/favicon with char counters))
  - **Hệ thống**: Tài khoản (AccountPanel – key management, logout)
- Product extra fields (headline, sub, features, price, CTA, SEO) stored in `site_settings` as `product_{slug}_{field}` keys — no DB schema change needed
- Community & settings fields all stored in `site_settings` table
- **Image upload pipeline** (complete): `POST /api/admin/upload-image` (multipart) → sharp processing to 1600×900 WebP with SVG watermark (lower-right pill, context-aware text) → saves orig + disp to `artifacts/api-server/uploads/{orig,disp}/`; `news_posts.featured_image_display` column stores the processed URL; PostsPanel ImageCard: file-upload button with spinner + "ĐÃ XỬ LÝ" badge + manual URL fallback + Xóa ảnh clear; TinTuc ArticleCard: CSS watermark overlay on fallback images only (baked-in watermark on uploaded images); `postImage.ts`: `getPostImage()` prefers `featuredImageDisplay`, `isFallbackImage()`, `getWatermarkText()` exported

### Content Architecture (3-Layer Hybrid System)

#### Layer A — Static / Structured Config
Stable brand-level content that rarely changes. Edit here, not inside components.

- `src/config/siteConfig.ts` — brandName, tagline, footerDescription, contactEmail, youtubeUrl, facebookUrl, social links, default SEO, disclaimer. **`YOUTUBE_CHANNEL_URL` is exported here — single source of truth.**
- `src/config/navigationConfig.ts` — `NAV_ITEMS` (all 7 navbar items + dropdown structures), `FOOTER_NAV_LINKS`, `FOOTER_KIEN_THUC_LINKS`, `FOOTER_PRODUCT_LINKS`, `KIEN_THUC_PATHS` (paths that activate Kiến thức nav item).
- `src/content/aboutPageData.tsx` — All Vietnamese text for `/gioi-thieu`: hero, aboutMain (highlights, quote), coreValues (with JSX icons), audienceSection, finalCta.

#### Layer B — Content Collections
Repeatable/scalable content. Each collection uses typed models (see `src/types/content.ts`).

- `src/content/videosData.ts` — 7 VideoItems (1 featured + 6 grid). Exports `getFeaturedVideo()`, `getHomepageVideos(n)`, `getVideosByCategory(cat)`, `searchVideos(q)`.
- `src/content/seriesData.ts` — 3 SeriesItems. Exports `getFeaturedSeries()`, `getSeriesBySlug(slug)`.
- `src/content/topicsData.tsx` — 6 TopicItems with JSX icons. Exports `getFeaturedTopics()`, `getTopicBySlug(slug)`.
- `src/content/articlesData.ts` — Mock ArticleItems (production data comes from `/api/news`).
- `src/content/newsData.ts` — Mock NewsItems (production data comes from `/api/news`).

#### Layer C — UI Mapping
Pages read from data/config rather than hardcoding content.

- `Navbar.tsx` → imports `NAV_ITEMS`, `KIEN_THUC_PATHS` from navigationConfig
- `Footer.tsx` → imports link arrays from navigationConfig; social URLs from siteConfig
- `GioiThieu.tsx` → imports all section content from aboutPageData
- `TopicsSection.tsx` → imports `TOPICS` from topicsData
- `YoutubeSection.tsx` → imports `YOUTUBE_CHANNEL_URL` from siteConfig; video data from videosData
- `Video.tsx` (page) → imports video data from videosData; series from seriesData; YouTube URL from siteConfig

#### Shared Types
`src/types/content.ts` — TypeScript interfaces for `VideoItem`, `SeriesItem`, `TopicItem`, `ArticleItem`, `NewsItem`, `NavItemConfig`, `FooterLinkItem`, `SocialLink`, `CoreValue`, and all about-page section types.

#### Service / Helper Layer
`src/lib/contentHelpers.ts` — re-exports all collection helpers + `formatDateVN()` and `estimateReadingTime()`.

#### Upgrade Path (for remaining static content)
To migrate Topics or Series to a real database:
1. Add a new Drizzle table in `lib/db/src/schema/content.ts` (already exists for articles/videos).
2. Add API routes in `artifacts/api-server/src/routes/content.ts`.
3. Create a seed script in `scripts/src/`.
4. Replace the static data file with an async fetch lib file (matching the pattern of `src/lib/articles.ts` and `src/lib/videos.ts`).

---

### Database-Backed Content (Phase 1 — Articles + Videos)

Articles and Videos are stored in PostgreSQL and served via the Express API.

#### Tables (in `lib/db/src/schema/content.ts`)

- `articles` — id, title, slug (unique), excerpt, content, cover_image_url, cover_image_alt, category, category_slug, tags (text[]), publish_date, featured, status (draft/published/archived), reading_time, topic_slug, series_slug, created_at, updated_at
- `videos` — id, title, slug (unique), excerpt, youtube_url, youtube_video_id, thumbnail_url, thumbnail_alt, thumbnail_gradient, duration, publish_date, featured, is_featured_video, status, topic_slug, series_slug, categories (text[]), created_at, updated_at

Both tables exported from `lib/db/src/schema/index.ts`.

#### API Routes (`artifacts/api-server/src/routes/content.ts`, mounted at `/api/content`)

- `GET /api/content/articles` — list with ?q=, ?category=, ?featured=true, ?status=published, ?limit=
- `GET /api/content/articles/:slug` — single article + related articles
- `GET /api/content/videos` — list with ?q=, ?category=, ?is_featured_video=true, ?featured=true, ?status=published, ?limit=
- `GET /api/content/videos/:slug` — single video

Publishing logic: only `status = published` records are returned by default. Pass `?status=all` for future admin use.

#### Seeding

Seed script: `scripts/src/seed-content.ts`
- Run: `pnpm --filter @workspace/scripts run seed:content`
- Idempotent: uses `ON CONFLICT (slug) DO NOTHING` — safe to re-run
- Seeds 6 articles and 7 videos from the original mock data

Initial seed was also executed directly via SQL for the first run.

#### Frontend Access Layer

- `artifacts/pvt-swc/src/lib/articles.ts` — `getPublishedArticles()`, `getFeaturedArticles()`, `getArticleBySlug()`, `searchArticles()`, `formatArticleDate()`
- `artifacts/pvt-swc/src/lib/videos.ts` — `getPublishedVideos()`, `getFeaturedVideo()`, `getHomepageVideos()`, `getVideosByCategory()`, `searchVideos()`, `getVideoBySlug()`, `videoGradient()`, `formatVideoDate()`

All fetch functions return empty arrays / null on failure — UI always renders gracefully.

#### Pages Updated to Use Live DB Data

- `YoutubeSection.tsx` — async loads featured video + 3 supporting videos from `/api/content/videos`; shows skeleton while loading
- `Video.tsx` (page) — async loads all videos + featured video; client-side filter by category/search
- `BaiViet.tsx` (page) — full article listing page with featured strip + all-articles grid; category filters + keyword search; was previously a placeholder

#### Remaining Static Content (not yet DB-backed)
- Series (static in `src/content/seriesData.ts`) — used in the Video page
- Topics (static in `src/content/topicsData.tsx`) — used in TopicsSection
- About page data (`src/content/aboutPageData.tsx`) — by design, rarely changes
