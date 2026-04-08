import type { SeriesItem } from "@/types/content";
import { YOUTUBE_CHANNEL_URL } from "@/config/siteConfig";

/* ══════════════════════════════════════════════
   SERIES COLLECTION
   Source: mock data (replace with API/DB later)
══════════════════════════════════════════════ */

export const SERIES: SeriesItem[] = [
  {
    id:            "s-001",
    title:         "Con đường 1 triệu đô",
    slug:          "con-duong-1-trieu-do",
    description:
      "Hành trình xây dựng nền tảng tài chính vững chắc qua từng giai đoạn — từ tích lũy ban đầu đến đầu tư có chiến lược.",
    coverGradient: "linear-gradient(135deg, #0c2622 0%, #1a5a4e 100%)",
    count:         "5 video",
    type:          "video",
    featured:      true,
    order:         1,
    youtubeUrl:    YOUTUBE_CHANNEL_URL,
  },
  {
    id:            "s-002",
    title:         "Hành trình từ tư duy đến tự do",
    slug:          "hanh-trinh-tu-tu-duy-den-tu-do",
    description:
      "Chuỗi nội dung về tư duy tài chính đúng — yếu tố nền tảng trước khi bắt đầu bất kỳ bước đầu tư nào.",
    coverGradient: "linear-gradient(135deg, #0e1e2e 0%, #1e3c58 100%)",
    count:         "4 video",
    type:          "video",
    featured:      true,
    order:         2,
    youtubeUrl:    YOUTUBE_CHANNEL_URL,
  },
  {
    id:            "s-003",
    title:         "Góc nhìn đầu tư dài hạn",
    slug:          "goc-nhin-dau-tu-dai-han",
    description:
      "Phân tích và chia sẻ về chiến lược đầu tư dài hạn qua góc nhìn thực chiến, dựa trên nguyên tắc, không phải cảm xúc.",
    coverGradient: "linear-gradient(135deg, #1e1a0a 0%, #3e3418 100%)",
    count:         "6 video",
    type:          "video",
    featured:      true,
    order:         3,
    youtubeUrl:    YOUTUBE_CHANNEL_URL,
  },
];

export function getFeaturedSeries(): SeriesItem[] {
  return SERIES.filter((s) => s.featured).sort((a, b) => a.order - b.order);
}

export function getSeriesBySlug(slug: string): SeriesItem | undefined {
  return SERIES.find((s) => s.slug === slug);
}
