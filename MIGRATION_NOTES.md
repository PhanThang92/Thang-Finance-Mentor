# MIGRATION_NOTES.md
# Trạng thái di chuyển — Phan Văn Thắng SWC

Tài liệu này mô tả kiến trúc hiện tại, những gì đã sẵn sàng để di chuyển, những gì vẫn phụ thuộc vào Replit, và những gì cần làm trước khi di chuyển hoàn toàn sang hosting bên ngoài.

---

## 1. Kiến trúc hiện tại

```
pnpm monorepo
├── artifacts/
│   ├── api-server/          ← Express + Node.js backend
│   │   ├── src/
│   │   │   ├── routes/      ← Tất cả API endpoints (admin, leads, content, email...)
│   │   │   ├── services/    ← Email, file xử lý
│   │   │   ├── lib/
│   │   │   │   ├── storage.ts   ← Storage abstraction (local / S3)
│   │   │   │   └── logger.ts
│   │   │   └── og/          ← OG image generator
│   │   └── uploads/         ← File tải lên (local storage)
│   └── pvt-swc/             ← React + Vite frontend
│       └── src/
│           ├── pages/        ← Trang: Home, Bài viết, Video, Liên hệ, Admin...
│           ├── components/
│           └── config/siteConfig.ts
└── lib/
    └── db/                  ← Shared database layer
        ├── src/schema/       ← Drizzle schema (8 files, 18 bảng)
        ├── migrations/       ← SQL migration files (drizzle-kit generate)
        └── drizzle.config.ts
```

**Runtime**: Node.js 20 LTS  
**Database**: PostgreSQL (Replit built-in, kết nối qua `DATABASE_URL`)  
**ORM**: Drizzle ORM + drizzle-kit  
**Frontend**: React 18 + Vite 7 + Tailwind CSS  
**Email**: Resend SDK  
**Process manager**: Replit Workflow (dev); cần PM2 hoặc systemd cho production bên ngoài

---

## 2. Những gì đã sẵn sàng để di chuyển

| Thành phần | Trạng thái | Ghi chú |
|---|---|---|
| Database (PostgreSQL) | Sẵn sàng | Dùng `DATABASE_URL`, không hardcode |
| Schema & Migration | Sẵn sàng | `lib/db/migrations/` + `pnpm run generate` / `migrate` |
| API server | Sẵn sàng | Bind `PORT` env var, không hardcode |
| Admin auth | Sẵn sàng | `ADMIN_KEY` env var, fallback `swc-admin-2026` |
| CORS | Sẵn sàng | `ALLOWED_ORIGINS` env var (comma-separated) |
| Email (Resend) | Sẵn sàng | `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `RESEND_FROM_NAME` |
| File storage | Sẵn sàng | Abstracted qua `storage.ts`; local mặc định, S3 stub có sẵn |
| Vite proxy target | Sẵn sàng | `VITE_API_TARGET` env var cho dev server |
| Frontend build | Sẵn sàng | `pnpm run build` tạo static files tại `dist/public/` |
| DB backup | Sẵn sàng | `node scripts/db-export.mjs` dùng `pg_dump` |
| OG image generator | Sẵn sàng | Không phụ thuộc Replit |
| Lead/CRM system | Sẵn sàng | 26 cột, `lead_notes`, 6 trạng thái, honeypot, dedup |
| Email marketing | Sẵn sàng | Sequences, campaigns, subscribers, unsubscribe |
| Gated content | Sẵn sàng | Lead magnets, resource access events |

---

## 3. Những gì vẫn phụ thuộc vào Replit

| Thành phần | Mức độ phụ thuộc | Chi tiết |
|---|---|---|
| PostgreSQL database | **Trung bình** | DB do Replit cung cấp; cần export và import sang DB mới |
| Thư mục `uploads/` | **Trung bình** | File tải lên lưu trên Replit filesystem; cần sao chép sang server mới |
| Vite plugin: Cartographer | **Thấp** | Chỉ chạy khi `REPL_ID !== undefined` — tự tắt ngoài Replit |
| Vite plugin: Dev Banner | **Thấp** | Chỉ chạy khi `REPL_ID !== undefined` — tự tắt ngoài Replit |
| Vite plugin: Runtime Error Overlay | **Thấp** | Dev-only plugin, không ảnh hưởng production build |
| Workflow manager | **Thấp** | Replit quản lý tiến trình; cần PM2/systemd bên ngoài |
| Secrets management | **Thấp** | Replit lưu secrets trong UI; cần `.env` hoặc secret manager bên ngoài |

**Kết luận**: Không có phụ thuộc Replit nào trong logic nghiệp vụ. Tất cả phụ thuộc là hạ tầng (DB, filesystem, process management).

---

## 4. Những gì cần làm trước khi di chuyển hoàn toàn

### Bắt buộc
- [ ] **Export PostgreSQL database** — dùng `node scripts/db-export.mjs` hoặc `pg_dump`
- [ ] **Sao chép thư mục `uploads/`** — toàn bộ file ảnh và tài liệu
- [ ] **Đổi `ADMIN_KEY`** khỏi giá trị mặc định `swc-admin-2026`
- [ ] **Set `ALLOWED_ORIGINS`** đúng domain của frontend trên server mới
- [ ] **Set `SITE_URL`** đúng domain production

### Khuyến nghị (trước khi go-live)
- [ ] **Kích hoạt S3 storage** thay vì local disk (xem `storage.ts`) để uploads không mất khi server restart
- [ ] **Cấu hình Nginx** phục vụ frontend static files và proxy API
- [ ] **Bật HTTPS** với Certbot (Let's Encrypt)
- [ ] **Cài PM2** để quản lý API server process
- [ ] **Set up cron backup** cho database
- [ ] **Verify email domain** trên Resend và test gửi email

### Tuỳ chọn (có thể làm sau)
- [ ] Chuyển admin auth từ single token sang hệ thống user/password thực sự
- [ ] Thêm rate limiting tại Nginx hoặc middleware
- [ ] Kết nối Google Analytics hoặc Plausible
- [ ] Sync leads sang Notion, Google Sheets, hoặc CRM ngoài

---

## 5. Danh sách biến môi trường đầy đủ

### API Server (bắt buộc)
```
DATABASE_URL=postgresql://user:pass@host:5432/dbname
PORT=8080
```

### API Server (bảo mật)
```
ADMIN_KEY=your-secret-min-32-chars        # Mặc định: swc-admin-2026
ALLOWED_ORIGINS=https://yourdomain.com    # Mặc định: cho phép tất cả
SESSION_SECRET=your-session-secret        # Cho cookie session
```

### API Server (email)
```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=no-reply@yourdomain.com
RESEND_FROM_NAME=Phan Văn Thắng SWC
SITE_URL=https://yourdomain.com
```

### API Server (storage — chỉ khi dùng S3)
```
STORAGE_PROVIDER=s3
AWS_REGION=ap-southeast-1
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_S3_BUCKET=your-bucket
CDN_BASE_URL=https://cdn.yourdomain.com   # Tuỳ chọn
```

### Frontend (build time)
```
PORT=3000
BASE_PATH=/
VITE_API_TARGET=http://localhost:8080     # Chỉ dùng lúc dev
```

---

## 6. Rủi ro còn lại

| Rủi ro | Mức độ | Cách xử lý |
|---|---|---|
| Mất dữ liệu khi migrate | Trung bình | Dùng `pg_dump` + kiểm tra sau import |
| Mất file uploads | Trung bình | Sao chép `uploads/` + cân nhắc S3 |
| Admin key mặc định | Trung bình | Đổi `ADMIN_KEY` trước khi deploy production |
| Local disk storage | Thấp | Hoạt động tốt cho 1 server; dùng S3 cho multi-server |
| Email chưa cấu hình | Thấp | Hệ thống no-op khi thiếu `RESEND_API_KEY` |
| Replit plugins | Thấp | Tự tắt khi `REPL_ID` không tồn tại |

---

## 7. Lịch sử thay đổi liên quan đến portability

| Phiên | Thay đổi |
|---|---|
| 2026-04 | Tạo `storage.ts` — abstraction layer cho file storage (local + S3 stub) |
| 2026-04 | `admin.ts` + `adminResources.ts` chuyển sang dùng `storage.save()` / `storage.delete()` |
| 2026-04 | `app.ts` CORS dùng `ALLOWED_ORIGINS` env var thay vì `cors()` mở rộng |
| 2026-04 | `vite.config.ts` proxy target dùng `VITE_API_TARGET` env var |
| 2026-04 | Thêm scripts `generate`, `migrate`, `studio` vào `lib/db/package.json` |
| 2026-04 | Tạo `lib/db/migrations/0000_wet_nebula.sql` — snapshot đầu tiên của toàn bộ schema |
| 2026-04 | Tạo `scripts/db-export.mjs` — script backup database |
| 2026-04 | Tạo `README_DEPLOY.md` — hướng dẫn triển khai đầy đủ |
| 2026-04 | Tạo `DATA_MIGRATION.md` — hướng dẫn export/import từng loại dữ liệu |
