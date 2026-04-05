# Hướng dẫn xuất / nhập dữ liệu

Tài liệu này mô tả cách sao lưu và khôi phục từng loại dữ liệu trong hệ thống khi chuyển sang máy chủ mới hoặc môi trường hosting bên ngoài.

---

## Tổng quan kiến trúc

| Thành phần | Công nghệ | Lưu trữ |
|---|---|---|
| Cơ sở dữ liệu | PostgreSQL | `DATABASE_URL` env var |
| ORM / Schema | Drizzle ORM | `lib/db/src/schema/` |
| Migration | Drizzle Kit | `lib/db/migrations/` |
| File tải lên | Local disk / S3 | `artifacts/api-server/uploads/` |
| Quản trị | Bearer token | `ADMIN_KEY` env var |

---

## 1. Bài viết (Articles)

### Xuất

**Cách 1 — SQL dump (khuyến nghị)**
```bash
# Chỉ xuất bảng articles
pg_dump "$DATABASE_URL" \
  --table=articles \
  --table=topics \
  --table=series \
  --no-owner --no-acl \
  -f backup-articles.sql
```

**Cách 2 — JSON qua API**
```bash
curl "https://yourdomain.com/api/posts?limit=1000&status=all" \
  -H "Authorization: Bearer $ADMIN_KEY" \
  -o articles.json
```

**Cách 3 — CSV trực tiếp từ PostgreSQL**
```sql
COPY (
  SELECT id, slug, title, excerpt, content, status, published_at,
         topic_id, series_id, seo_title, seo_description
  FROM articles
  ORDER BY id
) TO '/tmp/articles.csv' WITH CSV HEADER;
```

### Nhập

```bash
# Từ SQL dump
psql "$DATABASE_URL" -f backup-articles.sql

# Từ CSV
psql "$DATABASE_URL" -c "\COPY articles FROM '/tmp/articles.csv' CSV HEADER"
```

> **Lưu ý**: nhập `topics` và `series` trước `articles` để giữ đúng foreign key.

---

## 2. Hình ảnh và file tải lên (Media / Uploads)

### Cấu trúc thư mục

```
artifacts/api-server/uploads/
  orig/        ← ảnh gốc khi upload
  disp/        ← ảnh đã resize/watermark (dùng trong web)
  thumb/       ← ảnh thumbnail nhỏ
  resources/   ← tài liệu PDF, Excel, v.v.
```

Database lưu metadata tại bảng `media_assets`. Cột `storagePathProcessed` là đường dẫn tương đối, cột `publicUrl` là URL công khai.

### Xuất

```bash
# Sao chép toàn bộ thư mục uploads
tar -czf uploads-backup.tar.gz -C artifacts/api-server uploads/

# Xuất metadata từ DB
pg_dump "$DATABASE_URL" \
  --table=media_assets \
  --no-owner --no-acl \
  -f backup-media-assets.sql
```

### Nhập

```bash
# Khôi phục thư mục uploads
tar -xzf uploads-backup.tar.gz -C artifacts/api-server/

# Khôi phục metadata
psql "$DATABASE_URL" -f backup-media-assets.sql
```

> **Nếu dùng S3**: thay vì copy thư mục, sync bucket:
> ```bash
> aws s3 sync s3://old-bucket s3://new-bucket --region ap-southeast-1
> ```
> Sau đó update `publicUrl` trong bảng `media_assets` nếu domain S3 thay đổi.

---

## 3. Leads / Danh sách liên hệ

### Xuất

**Cách 1 — SQL dump (toàn bộ, bao gồm ghi chú)**
```bash
pg_dump "$DATABASE_URL" \
  --table=leads \
  --table=lead_notes \
  --no-owner --no-acl \
  -f backup-leads.sql
```

**Cách 2 — CSV để nhập vào CRM khác**
```sql
COPY (
  SELECT
    id, email, full_name, phone, source,
    status, follow_up_date, created_at,
    tags, notes
  FROM leads
  ORDER BY created_at DESC
) TO '/tmp/leads.csv' WITH CSV HEADER;
```

**Cách 3 — JSON qua API Admin**
```bash
curl "https://yourdomain.com/api/admin/leads?limit=5000" \
  -H "Authorization: Bearer $ADMIN_KEY" \
  -o leads.json
```

### Nhập

```bash
# Từ SQL dump (giữ nguyên ID + ghi chú)
psql "$DATABASE_URL" -f backup-leads.sql

# Từ CSV (tạo bản ghi mới, ID tự tăng)
psql "$DATABASE_URL" -c "\COPY leads (email, full_name, phone, source, status, created_at) FROM '/tmp/leads.csv' CSV HEADER"
```

> **Deduplication**: Hệ thống tự kiểm tra email trùng khi lead đăng ký mới. Khi nhập hàng loạt, kiểm tra trước:
> ```sql
> SELECT email, COUNT(*) FROM leads GROUP BY email HAVING COUNT(*) > 1;
> ```

---

## 4. Tài khoản Admin

### Cơ chế xác thực

Hệ thống **không có bảng user/admin** trong database. Admin được xác thực bằng một Bearer token duy nhất, so sánh với biến môi trường `ADMIN_KEY`.

- Token mặc định: `swc-admin-2026`
- Ghi đè: set `ADMIN_KEY=your-secret` trên server

Không có gì để "xuất" hoặc "nhập" — chỉ cần giữ `ADMIN_KEY` trong file cấu hình môi trường.

### Chuyển sang máy chủ mới

```bash
# Trên server mới, chỉ cần set:
export ADMIN_KEY=your-secret-key-here

# Kiểm tra
curl "https://newdomain.com/api/admin/leads?limit=1" \
  -H "Authorization: Bearer your-secret-key-here"
```

> **Khuyến nghị bảo mật**: Đổi `ADMIN_KEY` khỏi giá trị mặc định trước khi chạy production. Dùng ít nhất 32 ký tự ngẫu nhiên.

---

## 5. Quy trình chuyển toàn bộ hệ thống

Đây là thứ tự an toàn khi migrate sang server mới:

```bash
# Bước 1: Dump toàn bộ DB
pg_dump "$OLD_DATABASE_URL" --no-owner --no-acl -f full-backup.sql

# Bước 2: Sao lưu uploads
tar -czf uploads-backup.tar.gz -C artifacts/api-server uploads/

# Bước 3: Clone repo lên server mới
git clone <repo-url> && cd <repo-folder>
pnpm install

# Bước 4: Set biến môi trường (xem README_DEPLOY.md)
# DATABASE_URL, PORT, ADMIN_KEY, SITE_URL, ALLOWED_ORIGINS, RESEND_API_KEY ...

# Bước 5: Tạo schema (KHÔNG chạy full-backup.sql trước bước này)
cd lib/db && pnpm run migrate && cd ../..

# Bước 6: Nhập dữ liệu
psql "$NEW_DATABASE_URL" -f full-backup.sql

# Bước 7: Khôi phục uploads
tar -xzf uploads-backup.tar.gz -C artifacts/api-server/

# Bước 8: Build frontend
cd artifacts/pvt-swc && pnpm run build && cd ../..

# Bước 9: Khởi động API server
cd artifacts/api-server && pnpm run build && pnpm run start
```

---

## 6. Lệnh Drizzle hữu ích

```bash
# Đẩy schema lên DB trực tiếp (không tạo file migration)
cd lib/db && pnpm run push

# Tạo file migration SQL từ schema hiện tại
cd lib/db && pnpm run generate

# Áp dụng các file migration đang chờ
cd lib/db && pnpm run migrate

# Mở Drizzle Studio (GUI xem/sửa DB)
cd lib/db && pnpm run studio
```

File migration được lưu tại `lib/db/migrations/`. Commit những file này vào git để theo dõi lịch sử thay đổi schema.

---

## 7. Kiểm tra sau khi migrate

```bash
# Kiểm tra API hoạt động
curl https://newdomain.com/api/health

# Kiểm tra số lượng bài viết
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM articles;"

# Kiểm tra số lượng leads
psql "$DATABASE_URL" -c "SELECT COUNT(*), status FROM leads GROUP BY status ORDER BY status;"

# Kiểm tra file tải lên
ls artifacts/api-server/uploads/disp/ | head -5
```
