# Hướng dẫn triển khai — Phan Văn Thắng SWC

Đây là hướng dẫn đầy đủ để triển khai dự án lên bất kỳ môi trường VPS/cloud nào ngoài Replit (ví dụ: DigitalOcean, Hetzner, AWS EC2, Render, Railway, Fly.io).

---

## Yêu cầu hệ thống

| Phần mềm | Phiên bản tối thiểu |
|---|---|
| Node.js | 20 LTS trở lên |
| pnpm | 9 trở lên |
| PostgreSQL | 15 trở lên |
| pg_dump (tùy chọn) | để backup dữ liệu |

---

## Biến môi trường

### API Server (`artifacts/api-server`)

Tạo file `.env` trong thư mục `artifacts/api-server` (hoặc set trực tiếp trên server):

```env
# Bắt buộc
DATABASE_URL=postgresql://user:password@host:5432/dbname
PORT=8080

# Bảo mật admin panel
ADMIN_KEY=your-secret-key-here         # Mặc định: swc-admin-2026

# Email (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx # Lấy tại resend.com
RESEND_FROM_EMAIL=no-reply@yourdomain.com
RESEND_FROM_NAME=Phan Văn Thắng SWC

# URL công khai của trang web (dùng trong email + OG image)
SITE_URL=https://yourdomain.com

# CORS — danh sách domain được phép gọi API (phân cách bằng dấu phẩy)
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Lưu trữ file
# Mặc định: local (lưu vào thư mục uploads/ trong cùng server)
# Để dùng S3, xem hướng dẫn bên dưới
STORAGE_PROVIDER=local
```

### Frontend (`artifacts/pvt-swc`)

```env
# Bắt buộc
PORT=3000
BASE_PATH=/

# Địa chỉ API server (chỉ dùng khi build — Vite proxy sẽ dùng giá trị này)
VITE_API_TARGET=http://localhost:8080
```

---

## Cài đặt & chạy lần đầu

```bash
# 1. Clone repo
git clone <repo-url>
cd <repo-folder>

# 2. Cài dependencies
pnpm install

# 3. Chạy migration DB (tạo tất cả bảng)
cd lib/db
pnpm run db:push
cd ../..

# 4. Build frontend
cd artifacts/pvt-swc
pnpm run build
cd ../..

# 5. Khởi động API server
cd artifacts/api-server
pnpm run build && pnpm run start
```

---

## Phục vụ frontend với Nginx

Sau khi `pnpm run build`, thư mục `artifacts/pvt-swc/dist/public` chứa toàn bộ file tĩnh. Cấu hình Nginx ví dụ:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend (file tĩnh)
    root /path/to/repo/artifacts/pvt-swc/dist/public;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API về API server
    location /api/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Phục vụ file upload nếu dùng local storage
    location /api/uploads/ {
        alias /path/to/repo/artifacts/api-server/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

> Với HTTPS, dùng Certbot: `certbot --nginx -d yourdomain.com`

---

## Quản lý tiến trình với PM2

```bash
npm install -g pm2

# Khởi động API server
pm2 start "node artifacts/api-server/dist/index.mjs" --name pvt-swc-api

# Lưu config để tự khởi động sau reboot
pm2 save
pm2 startup
```

---

## Lưu trữ file (Storage)

### Local (mặc định)

Files được lưu vào `artifacts/api-server/uploads/`. Đây là cấu hình mặc định, không cần thay đổi gì thêm. Đảm bảo thư mục này được backup thường xuyên.

### Amazon S3 (hoặc tương tự)

1. Mở `artifacts/api-server/src/lib/storage.ts`
2. Bỏ comment toàn bộ class `S3StorageProvider`
3. Cài thêm package: `pnpm --filter @workspace/api-server add @aws-sdk/client-s3`
4. Set các biến môi trường:

```env
STORAGE_PROVIDER=s3
AWS_REGION=ap-southeast-1
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
S3_BUCKET=your-bucket-name
S3_PUBLIC_URL=https://your-bucket.s3.ap-southeast-1.amazonaws.com
```

---

## Backup cơ sở dữ liệu

```bash
# Dump toàn bộ DB ra file SQL
node scripts/db-export.mjs

# Hoặc chỉ định tên file
node scripts/db-export.mjs /backups/my-backup.sql

# Cron job tự động backup mỗi ngày lúc 2 giờ sáng
0 2 * * * cd /path/to/repo && DATABASE_URL=<url> node scripts/db-export.mjs
```

Các file backup được lưu vào thư mục `backups/`.

---

## Tài khoản Admin

- URL: `https://yourdomain.com/admin`
- Xác thực: Bearer token trong header `Authorization`
- Token mặc định: `swc-admin-2026`
- Đổi token: set biến `ADMIN_KEY=your-new-secret` trên server và khởi động lại API server

---

## Kiểm tra hoạt động

```bash
# Health check API
curl https://yourdomain.com/api/health

# Kiểm tra bài viết
curl https://yourdomain.com/api/posts?status=published&limit=3
```

---

## Email Marketing (Resend)

1. Đăng ký tại [resend.com](https://resend.com)
2. Xác minh domain gửi email
3. Tạo API key, set `RESEND_API_KEY` trên server
4. Set `RESEND_FROM_EMAIL` và `RESEND_FROM_NAME`
5. Email sẽ được gửi tự động khi có lead mới đăng ký nhận tin

---

## Checklist triển khai

- [ ] PostgreSQL đã tạo và `DATABASE_URL` đã set
- [ ] Đã chạy `pnpm run db:push` để tạo các bảng
- [ ] `ADMIN_KEY` đã thay đổi khỏi giá trị mặc định
- [ ] `SITE_URL` đã set đúng domain
- [ ] `ALLOWED_ORIGINS` đã set domain frontend
- [ ] Frontend đã build (`pnpm run build`)
- [ ] Nginx đã cấu hình và reload
- [ ] HTTPS đã bật (Certbot)
- [ ] PM2 đang chạy API server
- [ ] Kiểm tra `/api/health` trả về 200
- [ ] Thử đăng nhập admin tại `/admin`
- [ ] (Tùy chọn) Resend API key đã set và test gửi email
