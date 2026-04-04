import React from "react";
import type { CoreValue } from "@/types/content";

/* ══════════════════════════════════════════════
   ABOUT PAGE CONTENT — STRUCTURED DATA
   All Vietnamese text for /gioi-thieu lives here.
   GioiThieu.tsx reads from this file for layout.
   Upgrade path: fetch from CMS / API and merge.
══════════════════════════════════════════════ */

/* ── A. Hero ── */
export const aboutHero = {
  eyebrow:       "Giới thiệu",
  heading:       "Phan Văn Thắng SWC",
  subheading:    "Chia sẻ kiến thức tài chính, đầu tư và tư duy tích sản theo hướng thực tế, kỷ luật và dài hạn.",
  supportingText: "Không theo đuổi những lời hứa ngắn hạn. Ưu tiên sự rõ ràng, nền tảng vững và hành trình đi đường dài.",
};

/* ── B. About Main ── */
export const aboutMain = {
  eyebrow:     "Về Phan Văn Thắng SWC",
  heading:     "Về Phan Văn Thắng SWC",
  description: "Phan Văn Thắng SWC theo đuổi hướng chia sẻ kiến thức tài chính, đầu tư và tư duy tích sản theo cách thực tế, kỷ luật và dài hạn. Mục tiêu không phải tạo cảm giác làm giàu nhanh, mà là giúp người đọc có góc nhìn rõ hơn để xây nền tảng tài chính bền vững theo thời gian.",
  highlights:  ["Góc nhìn dài hạn", "Nội dung thực chiến", "Ưu tiên giá trị bền vững"],
  quote:       "Đi đường dài trong tài chính luôn bắt đầu từ việc hiểu đúng.",
};

/* ── C. Core Values ── */
export const coreValues: CoreValue[] = [
  {
    title: "Rõ hơn trước khi nhanh hơn",
    desc:  "Tôi ưu tiên giúp người đọc hiểu đúng bản chất vấn đề trước khi nghĩ đến kết quả nhanh.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
        <circle cx="11" cy="11" r="8.5" stroke="hsl(var(--primary))" strokeWidth="1.5" />
        <path d="M8 11l2 2 4-4" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Dài hạn hơn ngắn hạn",
    desc:  "Những gì có giá trị bền vững thường cần thời gian, kỷ luật và sự chọn lọc.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
        <path d="M3 17L8 11L12 14L17 7L20 9" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="20" cy="9" r="1.5" fill="hsl(var(--primary))" />
      </svg>
    ),
  },
  {
    title: "Thực tế hơn khẩu hiệu",
    desc:  "Nội dung cần gần với đời sống, có khả năng áp dụng và tạo ra thay đổi thật.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
        <path d="M4 6h16M4 10h12M4 14h8M4 18h10" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Giá trị hơn hứa hẹn",
    desc:  "Mục tiêu không phải tạo cảm giác hào hứng nhất thời, mà là xây nền tảng đáng tin cậy theo thời gian.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
        <path d="M11 2L13.5 8H20L14.75 12L16.75 18L11 14.25L5.25 18L7.25 12L2 8H8.5L11 2Z"
          stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    ),
  },
];

/* ── D. Audience ── */
export const audienceSection = {
  eyebrow: "Dành cho ai",
  heading: "Phù hợp với những người đang muốn xây nền tài chính vững hơn",
  items: [
    "Người muốn hiểu tài chính cá nhân rõ hơn",
    "Người quan tâm đầu tư dài hạn thay vì chạy theo xu hướng ngắn hạn",
    "Người muốn tích sản theo cách kỷ luật và thực tế hơn",
    "Người cần một hệ nội dung chọn lọc để đi đường dài",
  ],
};

/* ── E. Final CTA ── */
export const aboutCta = {
  eyebrow:         "Bắt đầu",
  heading:         "Bắt đầu từ việc hiểu đúng, rồi đi đường dài",
  subheading:      "Khám phá thêm bài viết, chủ đề nội dung và những hướng kết nối phù hợp với hành trình của bạn.",
  primaryButton:   { label: "Khám phá bài viết", href: "/tin-tuc"  },
  secondaryButton: { label: "Tham gia cộng đồng", href: "/cong-dong" },
};
