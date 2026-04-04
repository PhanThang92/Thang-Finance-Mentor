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

### Article Fallback Image System

`src/lib/postImage.ts` provides `getPostImage(post)` which returns a deterministic image per post:

1. Custom `featuredImage` URL (if set)
2. Product-based fallback pool (3 images each):
   - `atlas` → `fallback-atlas.svg`, `fallback-atlas-2.svg`, `fallback-atlas-3.svg`
   - `road-to-1m` → `fallback-road-to-1m.svg`, `fallback-road-to-1m-2.svg`, `fallback-road-to-1m-3.svg`
3. Category-based fallback pool (3 images):
   - `tu-duy-dau-tu` → `fallback-tu-duy.svg`, `fallback-tu-duy-2.svg`, `fallback-tu-duy-3.svg`
4. Default pool (2 images): `fallback-default.svg`, `fallback-default-2.svg`

Selection is deterministic: `pool[postId % poolSize]`. Same post always shows the same image. Different posts in the same group show different images. All fallbacks live in `public/images/`.

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
