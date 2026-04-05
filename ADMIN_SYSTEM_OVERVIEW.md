# Tổng quan hệ thống Admin — Phan Văn Thắng SWC

## Mục đích
Tài liệu này mô tả kiến trúc của khu vực quản trị (admin) cho website thương hiệu cá nhân Phan Văn Thắng SWC. Hệ thống được thiết kế đơn giản, rõ ràng, dễ vận hành hàng ngày cho một người quản lý nội dung không chuyên kỹ thuật.

---

## Kiến trúc tổng thể

```
artifacts/
├── pvt-swc/              ← React + Vite frontend (website công khai + admin)
│   └── src/
│       ├── pages/Admin.tsx               ← Shell admin (đăng nhập + navigation)
│       └── pages/admin/
│           ├── shared.ts                 ← Hằng màu, style, helper dùng chung
│           ├── DashboardPanel.tsx        ← Trang tổng quan
│           ├── ArticlesPanel.tsx         ← Quản lý bài viết kiến thức
│           ├── VideosPanel.tsx           ← Quản lý video
│           ├── MediaPanel.tsx            ← Thư viện ảnh
│           ├── LeadsPanel.tsx            ← Quản lý leads / CRM nhẹ
│           ├── PostsPanel.tsx            ← Tin tức (bài viết dạng news)
│           ├── TopicsPanel.tsx           ← Chủ đề phân loại
│           ├── SeriesPanel.tsx           ← Series nội dung
│           ├── CategoriesPanel.tsx       ← Chuyên mục tin tức
│           ├── TagsPanel.tsx             ← Tags
│           ├── EmailSubscribersPanel.tsx ← Người đăng ký email
│           ├── EmailCampaignsPanel.tsx   ← Chiến dịch email
│           ├── EmailSequencesPanel.tsx   ← Chuỗi email tự động
│           ├── ResourcesPanel.tsx        ← Tài liệu / lead magnets
│           ├── ProductsPanel.tsx         ← Sản phẩm
│           ├── CommunityPanel.tsx        ← Cộng đồng
│           ├── ContactWidgetPanel.tsx    ← Nút liên hệ nổi
│           ├── AnalyticsPanel.tsx        ← Phân tích nội dung
│           ├── SettingsPanel.tsx         ← Cài đặt website + trạng thái hệ thống
│           ├── ImageUploadField.tsx      ← Trường upload ảnh dùng chung
│           ├── MediaPickerModal.tsx      ← Modal chọn ảnh từ thư viện
│           └── CropModal.tsx             ← Crop ảnh trước khi upload
│
└── api-server/           ← Node.js + Express API backend
    └── src/routes/
        ├── admin.ts      ← Tất cả API admin (yêu cầu Bearer token)
        └── leads.ts      ← Public lead submission endpoint
```

---

## Xác thực (Authentication)

- Hệ thống dùng một admin key duy nhất (single-user mode)
- Key mặc định: `swc-admin-2026`
- Để thay đổi: đặt biến môi trường `ADMIN_KEY` và khởi động lại server
- Key được lưu trong `localStorage` của trình duyệt sau đăng nhập
- Mọi request API admin đều gửi header: `Authorization: Bearer <key>`
- Middleware `requireAdmin` kiểm tra key trên mọi route `/api/admin/*`

---

## Navigation admin (phân nhóm)

| Nhóm | Mục | Chức năng |
|------|-----|-----------|
| (không nhóm) | Tổng quan | Dashboard số liệu + cảnh báo |
| Leads | Danh sách leads | CRM nhẹ — xem, lọc, cập nhật leads |
| Nội dung | Bài viết kiến thức | Quản lý articles (KB hub) |
| Nội dung | Video | Quản lý video kiến thức |
| Nội dung | Thư viện ảnh | Upload, xem, quản lý media |
| Nội dung | Tin tức | Bài viết dạng news |
| Phân loại | Chủ đề | Topics phân loại nội dung |
| Phân loại | Series | Series nội dung |
| Phân loại | Chuyên mục | Categories cho tin tức |
| Phân loại | Tags | Tags gắn vào bài viết |
| Email | Người đăng ký | Danh sách subscribers |
| Email | Chiến dịch | Email campaigns |
| Email | Chuỗi email | Automated sequences |
| Vận hành | Tài liệu | Lead magnets / gated content |
| Vận hành | Sản phẩm | Quản lý sản phẩm |
| Vận hành | Cộng đồng | Cộng đồng |
| Vận hành | Nút liên hệ | Floating contact widget |
| Vận hành | Phân tích | Analytics nội dung |
| Hệ thống | Cài đặt | Menu, footer, social, SEO, trạng thái hệ thống |
| Hệ thống | Tài khoản | Xem key, đổi key, đăng xuất |

---

## Luồng bài viết kiến thức (Articles)

1. Vào "Bài viết kiến thức" → nhấn "Tạo bài viết"
2. Điền: tiêu đề, slug (tự động từ tiêu đề), nội dung, excerpt
3. Chọn ảnh đại diện từ thư viện hoặc upload mới
4. Gắn chủ đề (topic), series (nếu có)
5. Điền SEO title, description nếu cần
6. Chuyển trạng thái: **Nháp → Đã xuất bản**
7. Bài viết sẽ hiển thị trên trang `/bai-viet/[slug]`

**Lưu ý quan trọng:**
- Không thay đổi slug của bài đã xuất bản — sẽ làm hỏng URL cũ
- Ảnh đại diện được xử lý qua pipeline 3 phiên bản: display (1600×900), medium (1280×720), thumbnail (800×450)

---

## Luồng quản lý ảnh (Media)

1. Vào "Thư viện ảnh" → "Upload ảnh"
2. Chọn file (JPEG/PNG/WebP, tối đa 15MB)
3. Pipeline tự động tạo 3 phiên bản + watermark (nếu bật)
4. Ảnh sẵn sàng để dùng trong bài viết
5. Có thể chỉnh sửa alt text, caption

**Biến môi trường liên quan:**
- `WATERMARK_ENABLED` — `true`/`false` (mặc định `true`)
- `STORAGE_PROVIDER` — `local` hoặc `s3` (mặc định `local`)

---

## Luồng quản lý leads (CRM nhẹ)

### Khi có lead mới:
1. Dashboard hiển thị số "lead mới" màu đỏ trên sidebar
2. Vào "Danh sách leads" → leads mới hiển thị badge "MỚI" màu xanh
3. Click vào lead → mở panel chi tiết bên phải
4. Đổi trạng thái → "Đã liên hệ" (hoặc nhấn nút "Đánh dấu đã liên hệ")
5. Đặt ngày theo dõi tiếp theo nếu cần
6. Thêm ghi chú (Nội bộ / Gọi điện / Email / Gặp mặt)
7. Nhấn "Lưu thay đổi"

### Trạng thái lead (6 bước):
| Giá trị | Hiển thị | Ý nghĩa |
|---------|----------|---------|
| `moi` | Mới | Lead vừa gửi, chưa được xử lý |
| `da-lien-he` | Đã liên hệ | Đã liên lạc lần đầu |
| `dang-quan-tam` | Đang quan tâm | Lead đang cân nhắc |
| `nuoi-duong` | Nuôi dưỡng | Đang follow-up dài hạn |
| `da-chuyen-doi` | Đã chuyển đổi | Lead trở thành khách hàng |
| `da-dong` | Đã đóng | Không tiếp tục theo đuổi |

### Bảo vệ spam:
- Honeypot field ẩn — bot điền vào → bị loại im lặng
- Rate limit: tối đa 3 lần gửi/email/giờ
- Email deduplication: cùng email → cập nhật record cũ, không tạo mới

---

## Trạng thái đồng bộ (Notion / Google Sheets)

Mỗi lead có thể được đồng bộ tự động (sau khi cấu hình env vars):

| Trường | Ý nghĩa |
|--------|---------|
| `synced_to_notion` | Đã đồng bộ sang Notion |
| `notion_page_id` | ID trang Notion tương ứng |
| `notion_synced_at` | Thời điểm đồng bộ Notion thành công |
| `synced_to_sheets` | Đã đồng bộ sang Google Sheets |
| `sheets_synced_at` | Thời điểm đồng bộ Sheets thành công |
| `sync_error` | Thông báo lỗi nếu đồng bộ thất bại |

Dashboard sẽ hiển thị **cảnh báo cam** nếu có leads bị lỗi đồng bộ.

---

## Cài đặt hệ thống

Vào **Cài đặt → tab Hệ thống** để xem trạng thái:
- Admin key đã được đổi hay chưa
- Nhà cung cấp lưu trữ (local/S3)
- Watermark bật/tắt
- Email (Resend) đã cấu hình chưa
- Notion sync đã bật chưa
- Google Sheets sync đã bật chưa

Trang này **không hiển thị** các giá trị bí mật. Chỉ hiển thị trạng thái có/không.

---

## Biến môi trường quan trọng

```bash
# Bắt buộc
DATABASE_URL=              # PostgreSQL connection string
ADMIN_KEY=                 # Admin key (mặc định: swc-admin-2026 — NÊN đổi!)

# API proxy (frontend → backend)
VITE_API_TARGET=           # Backend URL (mặc định: http://localhost:8080)

# Email thông báo (Resend)
RESEND_API_KEY=            # Resend API key
RESEND_FROM_EMAIL=         # Email gửi (vd: hello@swc.vn)
RESEND_FROM_NAME=          # Tên hiển thị

# Lưu trữ ảnh
STORAGE_PROVIDER=local     # "local" hoặc "s3"
WATERMARK_ENABLED=true     # true/false

# Notion sync (tuỳ chọn)
ENABLE_NOTION_SYNC=true
NOTION_API_KEY=secret_...
NOTION_DATABASE_ID=...

# Google Sheets sync (tuỳ chọn)
ENABLE_GOOGLE_SHEETS_SYNC=true
GOOGLE_CLIENT_EMAIL=...
GOOGLE_PRIVATE_KEY=...
GOOGLE_SPREADSHEET_ID=...
GOOGLE_SHEET_NAME=Leads

# CORS
ALLOWED_ORIGINS=https://yourdomain.com
SITE_URL=https://yourdomain.com
```

---

## Tính di động (Portability)

Hệ thống được thiết kế để dễ chuyển sang hosting khác:

1. **Database**: Chỉ cần đổi `DATABASE_URL` — không phụ thuộc vào nền tảng cụ thể
2. **Storage**: Đổi `STORAGE_PROVIDER=s3` và cung cấp S3 credentials
3. **Integrations**: Tất cả kết nối ngoài (Notion, Sheets, Resend) qua env vars
4. **Build**: `pnpm build` tạo static frontend + Node.js backend

---

## Hạn chế hiện tại & đề xuất cải tiến

| Hạn chế | Gợi ý |
|---------|-------|
| Single-user admin | Thêm bảng users nếu cần nhiều admin |
| Admin key lưu localStorage | Implement JWT session nếu cần bảo mật cao hơn |
| Retry đồng bộ thủ công | Thêm scheduled job retry mỗi 30 phút |
| Không có preview bài viết | Thêm link xem trước ở tab mới |
| Không có rich text editor | Tích hợp TipTap hoặc Quill nếu cần WYSIWYG |

---

*Cập nhật lần cuối: 2026 — Phiên bản hiện tại hoạt động ổn định trên Replit và sẵn sàng triển khai ra ngoài.*
