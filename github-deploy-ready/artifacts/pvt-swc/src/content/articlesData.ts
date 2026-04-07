import type { ArticleItem } from "@/types/content";

/* ══════════════════════════════════════════════
   ARTICLES COLLECTION — MOCK DATA
   Production data comes from the API server
   at /api/news (see src/lib/newsApi.ts).
   This file provides typed mock data and
   helper types for static fallback / testing.
   Upgrade path: replace exports with API calls
   that return ArticleItem[].
══════════════════════════════════════════════ */

export const MOCK_ARTICLES: ArticleItem[] = [
  {
    id:           "a-001",
    title:        "Hiểu đúng về tích sản để không bị lạc lối trong thị trường nhiều biến động",
    slug:         "hieu-dung-ve-tich-san",
    excerpt:      "Tích sản không chỉ là đầu tư — đó là một quá trình xây dựng nền tảng tài sản bền vững qua kỷ luật và thời gian.",
    category:     "Tư duy đầu tư",
    categorySlug: "tu-duy-dau-tu",
    tags:         ["tích sản", "đầu tư dài hạn", "tư duy tài chính"],
    publishDate:  "2024-01-10",
    featured:     true,
    status:       "published",
    readingTime:  7,
    topicSlug:    "tu-duy-tich-san",
  },
  {
    id:           "a-002",
    title:        "Tại sao người kiếm nhiều vẫn không tích lũy được tài sản?",
    slug:         "tai-sao-nguoi-kiem-nhieu-van-khong-tich-luy",
    excerpt:      "Thu nhập cao chỉ là điều kiện cần — cấu trúc tài chính đúng mới là điều kiện đủ để tích sản bền vững.",
    category:     "Tài chính cá nhân",
    categorySlug: "tai-chinh-ca-nhan",
    tags:         ["tài chính cá nhân", "tích sản", "thu nhập"],
    publishDate:  "2024-01-17",
    featured:     true,
    status:       "published",
    readingTime:  5,
    topicSlug:    "tai-chinh-ca-nhan",
  },
  {
    id:           "a-003",
    title:        "Những nguyên tắc đầu tư dài hạn mà người mới hay bỏ qua",
    slug:         "nhung-nguyen-tac-dau-tu-dai-han",
    excerpt:      "Đầu tư không phải cuộc đua tốc độ — đó là hành trình đòi hỏi kiên nhẫn, kỷ luật và góc nhìn rõ ràng.",
    category:     "Đầu tư dài hạn",
    categorySlug: "dau-tu-dai-han",
    tags:         ["đầu tư dài hạn", "nguyên tắc", "người mới"],
    publishDate:  "2024-01-24",
    featured:     false,
    status:       "published",
    readingTime:  8,
    topicSlug:    "dau-tu-dai-han",
  },
];

export function getFeaturedArticles(count = 3): ArticleItem[] {
  return MOCK_ARTICLES.filter((a) => a.featured && a.status === "published").slice(0, count);
}

export function getLatestArticles(count = 6): ArticleItem[] {
  return MOCK_ARTICLES.filter((a) => a.status === "published")
    .sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime())
    .slice(0, count);
}

export function getArticleBySlug(slug: string): ArticleItem | undefined {
  return MOCK_ARTICLES.find((a) => a.slug === slug && a.status === "published");
}
