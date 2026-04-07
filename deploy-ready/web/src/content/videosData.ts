import type { VideoItem } from "@/types/content";
import { YOUTUBE_CHANNEL_URL } from "@/config/siteConfig";

/* ══════════════════════════════════════════════
   VIDEO COLLECTION
   Source: mock data (replace with API/DB later)
   Upgrade path: swap this export for an async
   fetch function that returns VideoItem[].
══════════════════════════════════════════════ */

export const VIDEOS: VideoItem[] = [
  {
    id:               "v-featured",
    title:            "Đầu tư dài hạn bắt đầu từ đâu nếu bạn chưa có nhiều vốn?",
    slug:             "dau-tu-dai-han-bat-dau-tu-dau",
    excerpt:          "Một góc nhìn dành cho những người mới bắt đầu hành trình tích sản và muốn đi đường dài bằng sự kỷ luật thay vì cảm xúc.",
    duration:         "15 phút",
    thumbnailGradient: "linear-gradient(145deg, #0c2622 0%, #124540 55%, #1a6258 100%)",
    youtubeUrl:       YOUTUBE_CHANNEL_URL,
    publishDate:      "2024-01-15",
    featured:         true,
    isFeaturedVideo:  true,
    status:           "published",
    categories:       ["featured", "dau-tu"],
    topicSlug:        "dau-tu-dai-han",
  },
  {
    id:               "v-001",
    title:            "Vì sao kiếm nhiều hơn vẫn chưa chắc vững hơn về tài chính?",
    slug:             "vi-sao-kiem-nhieu-hon-van-chua-chac-vung",
    excerpt:          "Hiểu khác biệt giữa thu nhập cao và nền tảng tài chính vững.",
    duration:         "12 phút",
    thumbnailGradient: "linear-gradient(145deg, #0d1e2e 0%, #1a3550 55%, #1e4060 100%)",
    youtubeUrl:       YOUTUBE_CHANNEL_URL,
    publishDate:      "2024-01-22",
    featured:         false,
    isFeaturedVideo:  false,
    status:           "published",
    categories:       ["tai-chinh"],
    topicSlug:        "tai-chinh-ca-nhan",
  },
  {
    id:               "v-002",
    title:            "Người mới đầu tư nên nhìn vào điều gì trước lợi nhuận?",
    slug:             "nguoi-moi-dau-tu-nen-nhin-vao-dieu-gi",
    excerpt:          "Một cách tiếp cận thực tế hơn để giảm rủi ro khi bắt đầu.",
    duration:         "10 phút",
    thumbnailGradient: "linear-gradient(145deg, #1a200d 0%, #2d3b18 55%, #374720 100%)",
    youtubeUrl:       YOUTUBE_CHANNEL_URL,
    publishDate:      "2024-01-29",
    featured:         false,
    isFeaturedVideo:  false,
    status:           "published",
    categories:       ["dau-tu"],
    topicSlug:        "dau-tu-dai-han",
  },
  {
    id:               "v-003",
    title:            "Tích sản là quá trình của kỷ luật, không phải cảm hứng",
    slug:             "tich-san-la-qua-trinh-cua-ky-luat",
    excerpt:          "Xây tài sản bền vững thường bắt đầu từ những nguyên tắc nhỏ nhưng lặp lại đủ lâu.",
    duration:         "9 phút",
    thumbnailGradient: "linear-gradient(145deg, #1e1a0a 0%, #3a2e12 55%, #44381a 100%)",
    youtubeUrl:       YOUTUBE_CHANNEL_URL,
    publishDate:      "2024-02-05",
    featured:         true,
    isFeaturedVideo:  false,
    status:           "published",
    categories:       ["tu-duy", "featured"],
    topicSlug:        "tu-duy-tich-san",
  },
  {
    id:               "v-004",
    title:            "Không phải cứ cố hơn là tài chính sẽ tốt hơn",
    slug:             "khong-phai-cu-co-hon-la-tai-chinh-tot-hon",
    excerpt:          "Đôi khi điều cần thay đổi không phải là nỗ lực, mà là cấu trúc.",
    duration:         "14 phút",
    thumbnailGradient: "linear-gradient(145deg, #0d162a 0%, #1a2a4a 55%, #1e3255 100%)",
    youtubeUrl:       YOUTUBE_CHANNEL_URL,
    publishDate:      "2024-02-12",
    featured:         false,
    isFeaturedVideo:  false,
    status:           "published",
    categories:       ["tai-chinh", "tu-duy"],
    topicSlug:        "tai-chinh-ca-nhan",
  },
  {
    id:               "v-005",
    title:            "Muốn đi đường dài trong đầu tư, trước hết cần bình tĩnh",
    slug:             "muon-di-duong-dai-trong-dau-tu-truoc-het-can-binh-tinh",
    excerpt:          "Tâm lý là một phần của chất lượng quyết định tài chính.",
    duration:         "11 phút",
    thumbnailGradient: "linear-gradient(145deg, #1a0e18 0%, #341a30 55%, #3e2038 100%)",
    youtubeUrl:       YOUTUBE_CHANNEL_URL,
    publishDate:      "2024-02-19",
    featured:         false,
    isFeaturedVideo:  false,
    status:           "published",
    categories:       ["dau-tu", "tu-duy"],
    topicSlug:        "dau-tu-dai-han",
  },
  {
    id:               "v-006",
    title:            "Hiểu đúng về tích sản trước khi nghĩ đến tự do tài chính",
    slug:             "hieu-dung-ve-tich-san-truoc-khi-nghi-den-tu-do",
    excerpt:          "Tự do tài chính không bắt đầu từ khát vọng lớn, mà từ nền tảng đủ rõ.",
    duration:         "16 phút",
    thumbnailGradient: "linear-gradient(145deg, #0a1e18 0%, #143328 55%, #1a4032 100%)",
    youtubeUrl:       YOUTUBE_CHANNEL_URL,
    publishDate:      "2024-02-26",
    featured:         true,
    isFeaturedVideo:  false,
    status:           "published",
    categories:       ["tu-duy", "featured"],
    topicSlug:        "tu-duy-tich-san",
  },
];

/** The single featured video shown in the large block. */
export function getFeaturedVideo(): VideoItem | undefined {
  return VIDEOS.find((v) => v.isFeaturedVideo && v.status === "published");
}

/** Videos for the homepage YouTube section (non-featured, published). */
export function getHomepageVideos(count = 3): VideoItem[] {
  return VIDEOS.filter((v) => !v.isFeaturedVideo && v.status === "published").slice(0, count);
}

/** All published videos, optionally filtered by category. */
export function getVideosByCategory(category?: string): VideoItem[] {
  const published = VIDEOS.filter((v) => v.status === "published" && !v.isFeaturedVideo);
  if (!category || category === "all") return published;
  if (category === "featured") return VIDEOS.filter((v) => v.featured && v.status === "published");
  return published.filter((v) => v.categories.includes(category as any));
}

/** Search videos by title or excerpt. */
export function searchVideos(query: string): VideoItem[] {
  const q = query.toLowerCase().trim();
  if (!q) return getVideosByCategory();
  return VIDEOS.filter(
    (v) =>
      v.status === "published" &&
      !v.isFeaturedVideo &&
      (v.title.toLowerCase().includes(q) || v.excerpt.toLowerCase().includes(q))
  );
}
