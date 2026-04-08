import React from "react";
import type { TopicItem } from "@/types/content";

/* ══════════════════════════════════════════════
   TOPICS COLLECTION
   Used by TopicsSection (homepage) and topic
   hub pages.  Icons are JSX, so file is .tsx.
   Upgrade path: fetch topics from API/DB and
   attach icon components on the client side.
══════════════════════════════════════════════ */

export const TOPICS: TopicItem[] = [
  {
    id:       "t-001",
    slug:     "tai-chinh-ca-nhan",
    name:     "Tài chính cá nhân",
    desc:     "Ngân sách, tiết kiệm, quản lý dòng tiền và xây nền tài chính cá nhân bền vững.",
    href:     "/tin-tuc/tai-chinh-ca-nhan",
    featured: true,
    order:    1,
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.4" />
        <path d="M10 6v1.5M10 12.5V14M7.5 9.5a2.5 2.5 0 015 0c0 1.38-1.12 2-2.5 2s-2.5.62-2.5 2a2.5 2.5 0 005 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id:       "t-002",
    slug:     "dau-tu-dai-han",
    name:     "Đầu tư dài hạn",
    desc:     "Góc nhìn, chiến lược và kinh nghiệm thực tế về đầu tư dài hạn có kỷ luật.",
    href:     "/tin-tuc",
    featured: true,
    order:    2,
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M3 14L7 9L11 12L16 5L18 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="18" cy="7" r="1.2" fill="currentColor" />
      </svg>
    ),
  },
  {
    id:       "t-003",
    slug:     "tu-duy-tich-san",
    name:     "Tư duy tích sản",
    desc:     "Xây dựng tư duy đúng về tài sản, giá trị và hành trình tự do tài chính.",
    href:     "/tin-tuc/tu-duy-dau-tu",
    featured: true,
    order:    3,
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M10 2l2.09 6H18l-4.91 3.57 1.87 5.74L10 13.71 5.04 17.31l1.87-5.74L2 8h5.91L10 2z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    ),
  },
  {
    id:       "t-004",
    slug:     "kien-thuc-thuc-chien",
    name:     "Kiến thức thực chiến",
    desc:     "Chia sẻ thực tế từ người đã áp dụng — không lý thuyết, không giật gân.",
    href:     "/tin-tuc",
    featured: true,
    order:    4,
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M10 2C7.8 2 6 3.8 6 6c0 1.5.8 2.8 2 3.5V11l2 3 2-3V9.5c1.2-.7 2-2 2-3.5 0-2.2-1.8-4-4-4z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 14h4M8 16.5h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id:       "t-005",
    slug:     "goc-nhin-thi-truong",
    name:     "Góc nhìn thị trường",
    desc:     "Phân tích, quan sát và cập nhật thị trường tài chính theo góc nhìn dài hạn.",
    href:     "/tin-tuc",
    featured: false,
    order:    5,
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.4" />
        <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M6 9h6M9 6v6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id:       "t-006",
    slug:     "phat-trien-ban-than",
    name:     "Phát triển bản thân",
    desc:     "Kỷ luật, thói quen và cách sống để hỗ trợ hành trình tài chính bền vững.",
    href:     "/tin-tuc",
    featured: false,
    order:    6,
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="10" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.4" />
        <path d="M3.5 17.5c0-3.59 2.91-6.5 6.5-6.5s6.5 2.91 6.5 6.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },
];

export function getFeaturedTopics(): TopicItem[] {
  return TOPICS.filter((t) => t.featured).sort((a, b) => a.order - b.order);
}

export function getTopicBySlug(slug: string): TopicItem | undefined {
  return TOPICS.find((t) => t.slug === slug);
}
