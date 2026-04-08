# Hướng dẫn thiết lập website trên Replit — Bộ quy tắc chuẩn

> Đúc kết từ dự án **Phan Văn Thắng SWC** — React + Vite SPA + Express API + PostgreSQL.  
> Áp dụng cho: personal brand site, landing page, fullstack web app.  
> Stack: Node.js · TypeScript · React · Vite · Express 5 · Drizzle ORM · PostgreSQL · Tailwind CSS · Resend email.

---

## MỤC LỤC

1. [Kiến trúc tổng quan](#1-kiến-trúc-tổng-quan)
2. [Cấu trúc thư mục chuẩn](#2-cấu-trúc-thư-mục-chuẩn)
3. [Package manager & scripts](#3-package-manager--scripts)
4. [Cấu hình Vite (frontend)](#4-cấu-hình-vite-frontend)
5. [Cấu hình Express (backend)](#5-cấu-hình-express-backend)
6. [Database — Drizzle ORM + PostgreSQL](#6-database--drizzle-orm--postgresql)
7. [Environment variables & Secrets](#7-environment-variables--secrets)
8. [Workflows Replit](#8-workflows-replit)
9. [Kết nối GitHub](#9-kết-nối-github)
10. [Deploy lên hosting ngoài (Plesk + Passenger)](#10-deploy-lên-hosting-ngoài-plesk--passenger)
11. [Email system (Resend)](#11-email-system-resend)
12. [CRM / Lead management](#12-crm--lead-management)
13. [SEO & OG meta injection](#13-seo--og-meta-injection)
14. [Các lỗi thường gặp & cách fix](#14-các-lỗi-thường-gặp--cách-fix)
15. [Checklist thiết lập dự án mới](#15-checklist-thiết-lập-dự-án-mới)

---

## 1. Kiến trúc tổng quan

```
Internet
    │
    ▼
[Plesk / CloudLinux]
    │
    ▼
[Passenger — chạy Node.js process]
    │
    ▼
[Express server — dist/index.mjs]
    ├── /api/*         → API routes (Express)
    ├── /api/uploads/* → static uploaded files
    └── /*             → SPA catch-all → dist/public/index.html (React Router)
```

**Nguyên tắc thiết kế:**
- Một process duy nhất xử lý cả API lẫn frontend (không tách server riêng).
- Vite chỉ dùng trong môi trường development — production serve static files qua Express.
- Không dùng Docker, virtual environment, hay server riêng cho frontend.

---

## 2. Cấu trúc thư mục chuẩn

```
root/
├── src/                      # Frontend React (nguồn duy nhất)
│   ├── pages/
│   ├── components/
│   ├── lib/
│   └── main.tsx
├── server/                   # Backend Express
│   ├── app.ts               # Express app chính
│   ├── routes/
│   │   ├── index.ts
│   │   ├── leads.ts
│   │   ├── admin.ts
│   │   └── ...
│   ├── services/
│   │   ├── emailService.ts
│   │   ├── notificationService.ts
│   │   └── customerConfirmationService.ts
│   └── db/
│       ├── index.ts
│       └── schema/
│           ├── index.ts     # Re-export tất cả
│           ├── cms.ts
│           ├── content.ts
│           └── ...
├── lib/db/src/schema/       # Schema dùng cho drizzle-kit migrations
│   └── cms.ts
├── artifacts/pvt-swc/       # Artifact config (Replit internal)
│   └── src/                 # symlink hoặc alias tới root/src/
├── dist/                    # Build output (git-ignored)
│   ├── index.mjs           # Express bundle (esbuild)
│   └── public/             # Vite frontend build
│       └── index.html
├── migrations/              # Drizzle migration files
├── package.json             # SINGLE package.json tại root
├── vite.config.ts
├── drizzle.config.ts
├── build.mjs                # esbuild script cho server
├── loader.mjs               # Entry point: load .env → run dist/index.mjs
├── tsconfig.json
├── .env                     # Local env vars (không commit)
├── .env.example             # Template env vars (commit)
└── .gitignore
```

**Quy tắc quan trọng:**
- **Một `package.json` duy nhất tại root** — không dùng monorepo riêng lẻ.
- `src/` tại root là nguồn frontend thực sự, không phải trong `artifacts/`.
- Schema DB runtime nằm ở `server/db/schema/`, schema migration ở `lib/db/src/schema/` — phải giữ đồng bộ.

---

## 3. Package manager & Scripts

**Package manager:** `npm` (không dùng pnpm, yarn cho project này).

```json
// package.json — scripts chuẩn
{
  "scripts": {
    "dev": "concurrently --kill-others -n vite,api -c cyan,green \"vite --host 0.0.0.0\" \"npm run start:api\"",
    "start:api": "API_PORT=8080 NODE_ENV=development node build.mjs && API_PORT=8080 node loader.mjs",
    "build": "vite build && node build.mjs",
    "start": "node loader.mjs",
    "db:push": "drizzle-kit push",
    "db:push-force": "drizzle-kit push --force",
    "db:studio": "drizzle-kit studio"
  },
  "type": "module"
}
```

**Lý do dùng `concurrently`:**
- Dev mode chạy Vite (port `$PORT` mặc định 20076 trên Replit) và Express (port 8080) song song.
- `--kill-others`: nếu một tiến trình crash, cả hai dừng → dễ debug.

**Lý do set `API_PORT=8080` cứng:**
- Replit inject `PORT` environment variable cho Vite. Nếu Express cũng đọc `PORT`, xung đột port.
- Giải pháp: Express luôn dùng `API_PORT`, Vite dùng `PORT`.

```typescript
// server/index.ts hoặc loader cuối chain
const API_PORT = Number(process.env.API_PORT ?? process.env.PORT ?? 8080);
```

---

## 4. Cấu hình Vite (frontend)

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

const port = Number(process.env.PORT ?? 3000);
const basePath = process.env.BASE_PATH ?? "/";

export default defineConfig({
  base: basePath,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
  server: {
    host: "0.0.0.0",       // BẮT BUỘC cho Replit — không dùng localhost
    port,
    allowedHosts: "all",   // BẮT BUỘC — Replit proxy qua domain khác
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "dist/public",   // Frontend build vào đây
    emptyOutDir: true,
  },
});
```

**Điểm bắt buộc với Replit:**
- `host: "0.0.0.0"` — không bao giờ dùng `localhost` hoặc `127.0.0.1`.
- `allowedHosts: "all"` hoặc `allowedHosts: true` — Replit preview là iframe qua proxy domain riêng.
- Proxy `/api` sang `localhost:8080` trong dev mode.

---

## 5. Cấu hình Express (backend)

### 5.1 Server build — esbuild

```javascript
// build.mjs
import * as esbuild from "esbuild";
await esbuild.build({
  entryPoints: ["server/index.ts"],
  bundle: true,
  platform: "node",
  format: "esm",
  outfile: "dist/index.mjs",
  packages: "external",   // Không bundle node_modules
  sourcemap: true,
});
```

### 5.2 Entry point — loader.mjs

```javascript
// loader.mjs — load .env TRƯỚC khi import app
import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// override: true → .env LUÔN THẮNG kể cả khi Replit/Plesk đã inject
config({ path: path.resolve(__dirname, ".env"), override: true });

// Chạy server đã build
await import("./dist/index.mjs");
```

**Tại sao cần `override: true`:**
- Replit tự động inject một số env vars. Nếu không override, `.env` local bị bỏ qua.
- Plesk/Passenger cũng inject vars. Cần đảm bảo config `.env` của mình là nguồn sự thật.

### 5.3 SPA catch-all — Express 5

```typescript
// server/app.ts — cuối file, sau tất cả API routes

const _DIST_DIR   = path.dirname(fileURLToPath(import.meta.url));
const DIST_PUBLIC = process.env.DIST_PUBLIC_DIR ?? path.join(_DIST_DIR, "public");

// Serve static files
app.use(express.static(DIST_PUBLIC, { maxAge: "1y", index: false }));

// SPA catch-all — Express 5 KHÔNG dùng app.get("*") hay app.get(/.*/)
// Dùng app.use() thay thế:
app.use(async (req, res) => {
  if (req.method !== "GET") {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const indexPath = path.join(DIST_PUBLIC, "index.html");
  // ... inject OG meta nếu là bot, hoặc send file thẳng
  res.sendFile(indexPath);
});
```

**Lỗi thường gặp với Express 5:**
- `app.get("*", handler)` → lỗi `TypeError: Route.get() requires a callback function`
- `app.get(/.*/, handler)` → lỗi regex incompatible
- **Fix:** Dùng `app.use()` không có path argument ở cuối chain.

### 5.4 DIST_PUBLIC path resolution

```typescript
// Dùng fileURLToPath thay vì process.cwd()
// Lý do: Passenger thay đổi working directory → process.cwd() sai
const _DIST_DIR = path.dirname(fileURLToPath(import.meta.url));
// import.meta.url = file:///path/to/dist/index.mjs
// → _DIST_DIR = /path/to/dist/
// → DIST_PUBLIC = /path/to/dist/public/
```

---

## 6. Database — Drizzle ORM + PostgreSQL

### 6.1 Cấu hình drizzle-kit

```typescript
// drizzle.config.ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./server/db/schema/index.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL! },
});
```

### 6.2 DB client

```typescript
// server/db/index.ts
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

export const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });
export * from "./schema";
```

### 6.3 Hai vị trí schema — giải thích

| Vị trí | Mục đích |
|--------|----------|
| `server/db/schema/*.ts` | Schema runtime — được import bởi Express API |
| `lib/db/src/schema/cms.ts` | Schema drizzle-kit — dùng để generate migrations |

**Phải giữ hai file đồng bộ** khi thêm/xóa cột!

### 6.4 Migration workflow

```bash
# Thường dùng:
npm run db:push

# Nếu gặp lỗi TTY (CI/CD, non-interactive terminal):
npm run db:push-force

# Nếu db:push hỏi interactive (không có TTY) → dùng raw SQL trực tiếp:
# ALTER TABLE leads ADD COLUMN IF NOT EXISTS notify_status text;
```

**Lỗi TTY với drizzle-kit:**
- Môi trường Replit shell, CI/CD, Passenger không có TTY.
- drizzle-kit sẽ hỏi "truncate table?" khi gặp constraint — crash vì không có stdin.
- Fix: Thêm cột mới bằng raw SQL `ALTER TABLE ... ADD COLUMN IF NOT EXISTS ...` thay vì `db:push`.

---

## 7. Environment variables & Secrets

### 7.1 Biến cần thiết

```bash
# .env.example (commit file này, KHÔNG commit .env)
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Email (Resend)
RESEND_API_KEY=re_xxxxx
RESEND_FROM_EMAIL=noreply@domain.com
RESEND_FROM_NAME=Tên người gửi

# App config
SITE_URL=https://domain.com
ADMIN_KEY=mat-khau-admin-manh  # Đổi ngay — default là swc-admin-2026

# Express
API_PORT=8080
NODE_ENV=production

# Optional
DIST_PUBLIC_DIR=/path/to/dist/public  # Override nếu Passenger set wrong cwd
ALLOWED_ORIGINS=https://domain.com,https://www.domain.com
```

### 7.2 Trên Replit — dùng Secrets

- Vào **Tools → Secrets** trong Replit.
- Thêm từng key, **KHÔNG** hardcode vào file.
- `.env` local chỉ dùng khi dev (không deploy).

### 7.3 Trên Plesk/hosting

- Vào **Websites → domain → Node.js → Environment variables**.
- Hoặc set trong `~/.bashrc` / file `.env` tại document root của Passenger.

---

## 8. Workflows Replit

### 8.1 Workflow duy nhất cần thiết

```
Tên: artifacts/pvt-swc: web
Lệnh: npm run dev
```

**Không cần** workflow riêng cho API — `npm run dev` đã chạy cả Vite + Express qua `concurrently`.

### 8.2 Artifact config

File `.replit` hoặc `artifact.toml` cấu hình:
- `previewPath`: `/` (route gốc)
- Port mapping: Vite port (`$PORT`) → preview iframe

### 8.3 Lỗi preview blank (white screen)

Nguyên nhân thường gặp:
1. Workflow chưa chạy — restart workflow.
2. `server.host` không phải `0.0.0.0` trong vite.config.
3. `allowedHosts` chưa set → Vite block request từ Replit proxy.
4. Conflict port giữa Vite và Express.

---

## 9. Kết nối GitHub

### 9.1 Từ Replit

1. **Tools → Git** → Connect to GitHub repo.
2. Hoặc dùng Git panel bên trái → Initialize → Connect remote.

### 9.2 .gitignore chuẩn

```gitignore
node_modules/
dist/
.env
*.env.local
.replit.nix
__pycache__/
.DS_Store
migrations/*.sql   # Tùy chọn — có thể commit migrations
```

### 9.3 Workflow commit từ Replit → GitHub

```
Replit Editor
    │ (code changes)
    ▼
Git panel → Stage → Commit → Push
    │
    ▼
GitHub repo (main branch)
    │
    ▼
Plesk: git pull → npm install → npm run build → touch tmp/restart.txt
```

---

## 10. Deploy lên hosting ngoài (Plesk + Passenger)

### 10.1 Yêu cầu hosting

- Node.js ≥ 18 (khuyến nghị 20+)
- Passenger (Apache/Nginx module)
- PostgreSQL database (có thể dùng DB Replit hoặc hosting riêng)
- Git access (SSH hoặc HTTPS)

### 10.2 Cấu hình Passenger

```apache
# .htaccess hoặc Apache VirtualHost
PassengerEnabled on
PassengerAppType node
PassengerStartupFile loader.mjs
PassengerAppEnv production
```

```nginx
# Nginx config
passenger_enabled on;
passenger_app_type node;
passenger_startup_file loader.mjs;
passenger_app_env production;
```

### 10.3 Quy trình deploy đầu tiên

```bash
# 1. Clone repo vào document root
git clone git@github.com:user/repo.git .

# 2. Tạo file .env
cp .env.example .env
nano .env  # Điền đầy đủ DATABASE_URL, RESEND_API_KEY, ...

# 3. Cài dependencies
npm install --production=false

# 4. Build
npm run build
# → tạo dist/public/ (Vite) và dist/index.mjs (Express)

# 5. Khởi động qua Passenger
touch tmp/restart.txt   # Plesk/Passenger tự restart Node process
# Hoặc: passenger-config restart-app /path/to/app

# 6. Kiểm tra logs
tail -f log/passenger.log
```

### 10.4 Quy trình deploy cập nhật

```bash
git pull origin main
npm install  # Nếu có thay đổi dependencies
npm run build
touch tmp/restart.txt
```

### 10.5 Database migration khi deploy

```bash
# Sau khi đã build và .env đã đúng:
node -e "import('./loader.mjs')" &   # Start server tạm để load env
# Hoặc export DATABASE_URL trực tiếp rồi:
npx drizzle-kit push

# Nếu không có TTY (thường gặp với Plesk):
# Dùng raw SQL qua psql hoặc Plesk Database tool
psql $DATABASE_URL -c "ALTER TABLE leads ADD COLUMN IF NOT EXISTS notify_status text"
```

### 10.6 Cấu trúc thư mục trên Plesk

```
/var/www/vhosts/domain.com/httpdocs/  ← document root
├── src/
├── server/
├── dist/                              ← được tạo khi build
│   ├── index.mjs                     ← Passenger startup file
│   └── public/
│       ├── index.html
│       └── assets/
├── loader.mjs                         ← Passenger thực sự start file này
├── package.json
├── .env
└── tmp/
    └── restart.txt                   ← touch để restart Passenger
```

---

## 11. Email system (Resend)

### 11.1 Cấu trúc service

```
server/services/
├── emailService.ts              # Base: sendEmail() wrapper
├── emailTemplates.ts            # HTML templates (welcome, campaign...)
├── notificationService.ts       # Gửi email ADMIN khi có lead mới
└── customerConfirmationService.ts  # Gửi email XÁC NHẬN cho khách
```

### 11.2 Admin notification flow

```
Khách submit form
    → leads.ts route handler lưu vào DB
    → [fire-and-forget] sendLeadNotification(lead)
        → đọc notify_email_* từ siteSettingsTable
        → xác định loại form → chọn recipient
        → build HTML email → sendEmail()
    → update leads.notifyStatus = "sent" | "failed"
```

### 11.3 Customer confirmation flow

```
Khách submit form (lead mới — không phải dedup)
    → [fire-and-forget] sendCustomerConfirmation(lead)
        → kiểm tra confirm_enabled từ siteSettingsTable
        → xác định category (lead/contact/product/community)
        → đọc confirm_subject_* + confirm_body_* từ DB
        → build HTML template → sendEmail(to: lead.email)
```

### 11.4 Cấu hình email trong Admin

| Setting key | Mô tả |
|-------------|-------|
| `notify_email_general` | Email admin nhận thông báo mặc định |
| `notify_email_contact` | Email nhận thông báo form liên hệ |
| `notify_email_lead` | Email nhận thông báo đăng ký/newsletter |
| `notify_email_product` | Email nhận thông báo sản phẩm/tư vấn |
| `confirm_enabled` | "true"/"false" — bật/tắt email xác nhận cho khách |
| `confirm_subject_lead` | Subject email xác nhận form đăng ký |
| `confirm_body_lead` | Nội dung email xác nhận form đăng ký |
| `confirm_subject_contact` | (tương tự cho từng loại...) |
| `confirm_body_contact` | |
| `confirm_subject_product` | |
| `confirm_body_product` | |
| `confirm_subject_community` | |
| `confirm_body_community` | |

### 11.5 Cấu hình DNS cho email

```
# SPF record
TXT @ "v=spf1 include:amazonses.com ~all"

# DKIM (Resend cung cấp sau khi verify domain)
TXT resend._domainkey "v=DKIM1; k=rsa; p=..."

# DMARC
TXT _dmarc "v=DMARC1; p=none; rua=mailto:dmarc@domain.com"
```

---

## 12. CRM / Lead management

### 12.1 Schema chuẩn — bảng `leads`

Các trường quan trọng:

| Cột | Type | Mục đích |
|-----|------|----------|
| `name` | text NOT NULL | Họ tên khách |
| `email` | text | Email (unique basis cho dedup) |
| `phone` | text | Số điện thoại |
| `source_type` | text | Nguồn (homepage/cong-dong/san-pham) |
| `source_page` | text | URL trang nguồn |
| `form_type` | text | email-capture/contact/community/consultation |
| `status` | text | moi/da-lien-he/dang-quan-tam/nuoi-duong/da-chuyen-doi/da-dong |
| `lead_stage` | text | Funnel stage tùy chỉnh |
| `tags` | jsonb | Mảng tags |
| `interest_topic` | text | Chủ đề quan tâm |
| `consent_status` | text | given/not-given |
| `utm_source/medium/campaign` | text | UTM tracking |
| `last_contacted_at` | timestamp | Lần liên hệ cuối |
| `next_follow_up_at` | timestamp | Ngày follow-up tiếp theo |
| `notify_status` | text | sent/failed/skipped |
| `notify_error` | text | Lỗi nếu gửi thất bại |

### 12.2 Anti-spam — honeypot field

```typescript
// Trong form HTML (ẩn hoàn toàn với CSS)
<input name="website" style="position:absolute;left:-9999px;opacity:0" tabIndex={-1} />

// Trong route handler
if (hp && String(hp).trim() !== "") {
  res.json({ ok: true }); // Silently succeed — không lưu
  return;
}
```

### 12.3 Email deduplication

```typescript
// Trước khi insert → check email đã tồn tại chưa
if (trimmedEmail) {
  const [existing] = await db.select().from(leadsTable)
    .where(eq(leadsTable.email, trimmedEmail)).limit(1);
  if (existing) {
    // Cập nhật record cũ, không tạo mới
    await db.update(leadsTable).set({ ...newData }).where(eq(leadsTable.id, existing.id));
    res.json({ ok: true, id: existing.id });
    return;
  }
}
```

### 12.4 Rate limiting — in-memory

```typescript
const submissionLog = new Map<string, number[]>();
function isRateLimited(key: string): boolean {
  const now = Date.now();
  const hits = (submissionLog.get(key) ?? []).filter((t) => now - t < 3_600_000);
  if (hits.length >= 3) return true;  // Max 3 lần/giờ
  hits.push(now);
  submissionLog.set(key, hits);
  return false;
}
```

---

## 13. SEO & OG meta injection

### 13.1 Cách hoạt động

- Khi crawlbot (Googlebot, Facebook, Twitter...) request page → Express phát hiện qua User-Agent.
- Express đọc `dist/public/index.html` → inject `<meta>` tags theo route.
- Human browser → nhận nguyên file HTML, React Router xử lý client-side.

### 13.2 Bot detection

```typescript
const BOT_RE = /bot|crawl|spider|facebookexternalhit|twitterbot|linkedinbot|discordbot|telegrambot|whatsapp|slackbot|applebot|google|yandex/i;
function isBot(ua: string): boolean { return BOT_RE.test(ua); }
```

### 13.3 Meta injection

```typescript
function injectMeta(template: string, meta: OgMeta): string {
  return template.replace(
    /<title>.*?<\/title>/,
    `<title>${esc(meta.title)}</title>`,
  ).replace(
    "</head>",
    `<meta property="og:title" content="${esc(meta.title)}">
     <meta property="og:description" content="${esc(meta.description)}">
     <meta property="og:image" content="${meta.image}">
     <meta name="twitter:card" content="summary_large_image">
     </head>`,
  );
}
```

---

## 14. Các lỗi thường gặp & cách fix

### Express 5 — wildcard route

```typescript
// ❌ SAI — crash với Express 5
app.get("*", handler);
app.get(/.*/, handler);

// ✅ ĐÚNG
app.use((req, res) => {
  if (req.method !== "GET") { res.status(404).json({ error: "Not found" }); return; }
  res.sendFile(path.join(DIST_PUBLIC, "index.html"));
});
```

### PORT conflict

```typescript
// ❌ SAI — cả Vite và Express đọc cùng PORT
const PORT = Number(process.env.PORT ?? 3000);

// ✅ ĐÚNG — phân biệt hai port
const API_PORT = Number(process.env.API_PORT ?? 8080);  // Express
// Vite tự đọc process.env.PORT từ Replit
```

### dotenv override

```javascript
// ❌ SAI — Replit inject override .env của bạn
config({ path: ".env" });

// ✅ ĐÚNG
config({ path: ".env", override: true });
```

### drizzle-kit TTY error trong non-interactive shell

```
Error: Interactive prompts require a TTY terminal
```

Fix: Dùng raw SQL thay vì `db:push`:
```sql
ALTER TABLE ten_bang ADD COLUMN IF NOT EXISTS ten_cot text;
```

### SPA catch-all — dist/public path sai

```typescript
// ❌ SAI — process.cwd() sai khi Passenger thay đổi working dir
const DIST_PUBLIC = path.join(process.cwd(), "dist/public");

// ✅ ĐÚNG — tính từ vị trí file đang chạy
const _DIST_DIR = path.dirname(fileURLToPath(import.meta.url));
const DIST_PUBLIC = path.join(_DIST_DIR, "public");
```

### Vite blank screen trên Replit

```typescript
// ✅ Bắt buộc trong vite.config.ts
server: {
  host: "0.0.0.0",        // Không dùng localhost
  allowedHosts: "all",    // Không block Replit proxy domain
}
```

---

## 15. Checklist thiết lập dự án mới

### Giai đoạn 1 — Khởi tạo trên Replit

- [ ] Tạo project mới trên Replit (Node.js template)
- [ ] Xóa cấu trúc mặc định, setup monorepo theo chuẩn trên
- [ ] Cài dependencies: `npm install`
- [ ] Cấu hình `vite.config.ts` với `host: "0.0.0.0"` và `allowedHosts: "all"`
- [ ] Tạo workflow: `npm run dev` (chạy Vite + Express concurrently)
- [ ] Test preview chạy được trong Replit iframe

### Giai đoạn 2 — Database

- [ ] Tạo Replit PostgreSQL database (hoặc kết nối external)
- [ ] `DATABASE_URL` đã có trong Replit Secrets
- [ ] Viết schema Drizzle vào `server/db/schema/`
- [ ] `npm run db:push` thành công
- [ ] Kiểm tra bảng đã tạo trong DB

### Giai đoạn 3 — Secrets & Config

- [ ] `ADMIN_KEY` (đổi từ default)
- [ ] `RESEND_API_KEY` (nếu dùng email)
- [ ] `RESEND_FROM_EMAIL` (phải verify trên Resend dashboard)
- [ ] `SITE_URL` (URL production)
- [ ] `SESSION_SECRET` (nếu dùng sessions)

### Giai đoạn 4 — Kết nối GitHub

- [ ] Tạo repo trên GitHub (public hoặc private)
- [ ] Kết nối từ Replit Git panel
- [ ] Tạo `.gitignore` (node_modules, dist, .env)
- [ ] Initial commit + push
- [ ] Verify repo trên GitHub có đủ code

### Giai đoạn 5 — Deploy lên hosting

- [ ] Hosting có Node.js ≥ 18 và Passenger
- [ ] Clone repo vào document root
- [ ] Tạo `.env` với đầy đủ production values
- [ ] `npm install`
- [ ] `npm run build` thành công
- [ ] Cấu hình Passenger: `startup_file = loader.mjs`
- [ ] `touch tmp/restart.txt`
- [ ] Test website load được
- [ ] Test API `/api/health` trả về 200
- [ ] Test form submission
- [ ] Test email notification (nếu cấu hình)
- [ ] Test admin panel `/admin`

### Giai đoạn 6 — Production checklist

- [ ] HTTPS bật (Let's Encrypt qua Plesk)
- [ ] SPF, DKIM, DMARC cấu hình cho domain email
- [ ] `ADMIN_KEY` đủ mạnh (không phải default)
- [ ] `NODE_ENV=production` trong env
- [ ] Error logs được monitor
- [ ] Backup database định kỳ

---

## Tóm tắt nhanh — Stack & Tools

| Thành phần | Lựa chọn | Lý do |
|-----------|----------|-------|
| Frontend | React + Vite + Tailwind CSS | Nhanh, ecosystem lớn, HMR tốt |
| Backend | Express 5 + TypeScript | Đơn giản, kiểm soát hoàn toàn |
| Database | PostgreSQL + Drizzle ORM | Type-safe, migrations tốt |
| Email | Resend | API đơn giản, deliverability cao |
| Build | esbuild (server) + Vite (client) | Cực nhanh |
| Deploy | Passenger (Plesk) | Ổn định, zero-config Node.js |
| Package manager | npm | Đơn giản, không cần pnpm cho single package |
| Env management | dotenv + override:true | Kiểm soát hoàn toàn |

---

*Tài liệu này được tổng hợp từ dự án Phan Văn Thắng SWC, tháng 4/2026.*
