# Hướng dẫn Deploy — Phan Văn Thắng SWC (pnpm workspace)

## Cấu trúc workspace

```
github-deploy-ready/          ← push toàn bộ folder này lên GitHub
├── package.json              ← root workspace package.json
├── pnpm-workspace.yaml       ← định nghĩa các packages trong workspace
├── pnpm-lock.yaml            ← QUAN TRỌNG: lockfile để install đúng versions
├── tsconfig.base.json        ← TypeScript base config dùng chung
├── tsconfig.json             ← root TypeScript references
├── .npmrc                    ← pnpm settings
├── .gitignore
├── artifacts/
│   ├── pvt-swc/              ← Frontend React + Vite (website chính)
│   └── api-server/           ← Express.js API backend
└── lib/
    ├── db/                   ← @workspace/db (Drizzle ORM + schema)
    ├── api-zod/              ← @workspace/api-zod (Zod validation)
    └── api-client-react/     ← @workspace/api-client-react (React API client)
```

## Yêu cầu môi trường

- **Node.js**: >= 18.0.0 (khuyến nghị 20.x hoặc 22.x)
- **pnpm**: >= 8.x (`npm install -g pnpm`)
- **PostgreSQL**: >= 14

---

## Các bước deploy

### 1. Clone repo và cài dependencies

```bash
pnpm install
```

pnpm sẽ tự động nhận biết workspace structure từ `pnpm-workspace.yaml` và cài đặt tất cả packages.

### 2. Tạo database

Import database export có sẵn:
```bash
psql "postgresql://user:password@host:5432/dbname" < database_export.sql
```

Hoặc tạo database trống và push schema:
```bash
cd lib/db
DATABASE_URL=postgresql://... pnpm run push
```

### 3. Cấu hình biến môi trường

**API server** (`artifacts/api-server/.env`):
```bash
cp artifacts/api-server/.env.example artifacts/api-server/.env
# Sửa DATABASE_URL và các keys cần thiết
```

**Web frontend** (`artifacts/pvt-swc/.env`):
```bash
cp artifacts/pvt-swc/.env.example artifacts/pvt-swc/.env
```

### 4. Build API server

```bash
cd artifacts/api-server
pnpm run build
pnpm run start
```

### 5. Build và chạy frontend

```bash
cd artifacts/pvt-swc
pnpm run build
pnpm run serve      # hoặc: node server.mjs
```

---

## Deploy trên hosting cụ thể

### VPS (Ubuntu/Debian)

```bash
# Cài pnpm
npm install -g pnpm

# Clone từ GitHub
git clone https://github.com/your-repo/pvt-swc.git
cd pvt-swc

# Install toàn bộ workspace
pnpm install

# Build + start API
cd artifacts/api-server && pnpm run build && pnpm run start &

# Build + start Web
cd artifacts/pvt-swc && pnpm run build && node server.mjs
```

### Railway / Render

- Chạy từ root của repo
- Build command: `pnpm install && cd artifacts/api-server && pnpm run build`
- Start command: `node artifacts/api-server/dist/index.mjs`
- Tương tự cho web app, chạy riêng service thứ 2

---

## Biến môi trường — API Server

| Tên | Bắt buộc | Mô tả |
|---|---|---|
| `DATABASE_URL` | Có | Chuỗi kết nối PostgreSQL |
| `PORT` | Có | Cổng server |
| `ADMIN_KEY` | Khuyến nghị | Mật khẩu admin (mặc định: `swc-admin-2026`) |
| `SESSION_SECRET` | Khuyến nghị | Secret cho session |
| `RESEND_API_KEY` | Không | Gửi email qua Resend |
| `ENABLE_NOTION_SYNC` | Không | Đồng bộ leads sang Notion |
| `ENABLE_GOOGLE_SHEETS_SYNC` | Không | Đồng bộ leads sang Google Sheets |
| `ALLOWED_ORIGINS` | Không | CORS origins |

## Biến môi trường — Web Frontend

| Tên | Mặc định | Mô tả |
|---|---|---|
| `PORT` | 3000 | Cổng web server |
| `BASE_PATH` | / | Base URL path |
| `API_PORT` | 8080 | Cổng API server |
| `VITE_API_TARGET` | http://localhost:8080 | API target cho dev proxy |

---

## Những thay đổi so với Replit gốc

| Thay đổi | Lý do |
|---|---|
| Removed `@replit/vite-plugin-*` | Chỉ hoạt động trong môi trường Replit |
| `PORT` và `BASE_PATH` trong vite.config có default | Replit đặt bắt buộc; hosting thông thường thì không |
| `@assets` alias đã bỏ | Trỏ vào folder `attached_assets/` chỉ có trong Replit |
| Simplified `pnpm-workspace.yaml` | Chỉ include 5 packages cần thiết, bỏ platform overrides |

---

## Loại hosting phù hợp

- **API server**: Cần Node.js server hosting có persistent process
- **Web frontend**: Sau khi build là static files — có thể dùng static hosting (Vercel, Netlify) hoặc `node server.mjs` nếu cần OG image rendering cho social media crawlers
