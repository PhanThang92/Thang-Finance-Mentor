# Hướng dẫn Deploy — Phan Văn Thắng SWC

## Cấu trúc

```
deploy-ready/
├── api/        ← Express API server (Node.js backend)
└── web/        ← React + Vite SPA (frontend)
```

Hai ứng dụng này chạy **độc lập** nhau. Khi deploy cần chạy cả hai:
- `api/` chạy backend server, kết nối database, xử lý leads, bài viết, v.v.
- `web/` phục vụ giao diện React và tự động proxy các request `/api/*` sang `api/`

---

## Yêu cầu môi trường

- **Node.js**: >= 18.0.0 (khuyến nghị 20.x hoặc 22.x)
- **npm**: >= 9.x
- **PostgreSQL**: >= 14

---

## Deploy API Server (`api/`)

### 1. Cài đặt dependencies

```bash
cd api
npm install
```

### 2. Tạo database

Tạo PostgreSQL database mới và import file SQL export:

```bash
psql "postgresql://user:password@host:5432/dbname" < database_export.sql
```

Hoặc chạy migration tự động từ schema (database trống):

```bash
# Chỉ cần đặt DATABASE_URL rồi chạy
npx drizzle-kit push
```

### 3. Cấu hình biến môi trường

Sao chép file mẫu và điền giá trị thực:

```bash
cp .env.example .env
```

Bắt buộc:
- `DATABASE_URL` — chuỗi kết nối PostgreSQL
- `PORT` — cổng server (mặc định: 8080)

### 4. Build và chạy

```bash
npm run build   # Biên dịch TypeScript → dist/
npm run start   # Chạy server production
```

Hoặc dev mode (build + start liên tục):

```bash
npm run dev
```

---

## Deploy Web Frontend (`web/`)

### 1. Cài đặt dependencies

```bash
cd web
npm install
```

### 2. Cấu hình biến môi trường

```bash
cp .env.example .env
```

- `PORT` — cổng web server (mặc định: 3000)
- `API_PORT` — cổng API server đang chạy (mặc định: 8080)
- `VITE_API_TARGET` — URL đầy đủ của API server khi dev (mặc định: http://localhost:8080)

### 3. Build

```bash
npm run build
```

Output: `dist/public/` — thư mục chứa toàn bộ file tĩnh.

### 4. Chạy production server

```bash
npm run start   # (hoặc: npm run serve)
```

Server này phục vụ SPA và tự proxy `/api/*` → API server.

---

## Platforms được hỗ trợ

| Platform | API | Web |
|---|---|---|
| VPS (Ubuntu/Debian) | `npm run build && npm start` | `npm run build && npm start` |
| Railway | Nhận diện tự động từ package.json | Nhận diện tự động |
| Render | Web Service, build: `npm run build`, start: `npm start` | Static Site hoặc Web Service |
| Fly.io | Dùng Dockerfile đơn giản | Tương tự |
| Vercel | Không phù hợp (cần persistent server) | Vercel tự deploy SPA |
| Netlify | Không phù hợp | Netlify tự deploy SPA |

> **Lưu ý Vercel/Netlify cho Web**: Nếu chỉ deploy `web/` lên Vercel/Netlify thì cần có API server đang chạy ở URL public (Railway, Render, VPS...) và đặt `VITE_API_TARGET` đúng.

---

## Biến môi trường đầy đủ — API

| Tên | Bắt buộc | Mô tả |
|---|---|---|
| `DATABASE_URL` | Có | Chuỗi kết nối PostgreSQL |
| `PORT` | Có | Cổng server |
| `ADMIN_KEY` | Khuyến nghị | Mật khẩu admin (mặc định: `swc-admin-2026`) |
| `SESSION_SECRET` | Khuyến nghị | Secret cho session |
| `RESEND_API_KEY` | Không | Gửi email qua Resend |
| `ENABLE_NOTION_SYNC` | Không | Đồng bộ leads sang Notion |
| `NOTION_API_KEY` | Không | Nếu bật Notion sync |
| `NOTION_DATABASE_ID` | Không | Nếu bật Notion sync |
| `ENABLE_GOOGLE_SHEETS_SYNC` | Không | Đồng bộ leads sang Google Sheets |
| `ALLOWED_ORIGINS` | Không | CORS origins (ngăn cách bằng dấu phẩy) |

---

## Loại hosting cần thiết

- **API server**: Cần **Node.js server hosting** (không phải static hosting). Phải hỗ trợ chạy process lâu dài.
- **Web frontend**: Sau khi build, có thể dùng **static hosting** (Vercel, Netlify, Cloudflare Pages) hoặc chạy `node server.mjs` trên Node.js hosting.

---

## Những thay đổi so với Replit gốc

1. Không còn phụ thuộc vào pnpm workspace — chạy độc lập với npm.
2. Shared packages (`@workspace/db`, `@workspace/api-zod`) đã được copy trực tiếp vào `api/src/lib/`.
3. Replit-specific Vite plugins đã bị loại bỏ (`@replit/vite-plugin-*`).
4. Vite config không còn bắt buộc `PORT` và `BASE_PATH` — có giá trị mặc định.
5. `@assets` alias (trỏ vào `attached_assets/` của Replit) đã bị loại bỏ.
