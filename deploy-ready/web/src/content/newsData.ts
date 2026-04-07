import type { NewsItem } from "@/types/content";

/* ══════════════════════════════════════════════
   NEWS / TIN TỨC COLLECTION — MOCK DATA
   Production data comes from the API server
   at /api/news.  This file provides typed
   mock data for fallback / offline scenarios.
   "Tin tức" = updates, announcements, community
   activities — distinct from "Kiến thức" articles.
══════════════════════════════════════════════ */

export const MOCK_NEWS: NewsItem[] = [
  {
    id:           "n-001",
    title:        "Cộng đồng SWC PASS vượt mốc 1.000 thành viên",
    slug:         "cong-dong-swc-pass-1000-thanh-vien",
    excerpt:      "Sau 6 tháng hoạt động, cộng đồng học tập SWC PASS đã đạt mốc 1.000 thành viên — cột mốc quan trọng trong hành trình xây hệ sinh thái kiến thức.",
    category:     "Cộng đồng",
    categorySlug: "cong-dong",
    publishDate:  "2024-03-01",
    featured:     true,
    status:       "published",
  },
  {
    id:           "n-002",
    title:        "Khai mở Series mới: Góc nhìn đầu tư dài hạn",
    slug:         "khai-mo-series-moi-goc-nhin-dau-tu-dai-han",
    excerpt:      "Series video 6 tập về đầu tư dài hạn sẽ được phát hành trên kênh YouTube trong tháng 3 — tập đầu tiên đã có mặt.",
    category:     "Thông báo",
    categorySlug: "thong-bao",
    publishDate:  "2024-02-28",
    featured:     true,
    status:       "published",
  },
  {
    id:           "n-003",
    title:        "ATLAS cập nhật tính năng phân tích dữ liệu bất động sản",
    slug:         "atlas-cap-nhat-tinh-nang-phan-tich",
    excerpt:      "Phiên bản mới của ATLAS bổ sung thêm công cụ phân tích giá theo khu vực và lịch sử giao dịch — giúp người dùng đánh giá dữ liệu rõ hơn.",
    category:     "Sản phẩm",
    categorySlug: "san-pham",
    publishDate:  "2024-02-20",
    featured:     false,
    status:       "published",
  },
];

export function getFeaturedNews(count = 3): NewsItem[] {
  return MOCK_NEWS.filter((n) => n.featured && n.status === "published").slice(0, count);
}

export function getLatestNews(count = 6): NewsItem[] {
  return MOCK_NEWS.filter((n) => n.status === "published")
    .sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime())
    .slice(0, count);
}
