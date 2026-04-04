/**
 * Seed script: Articles and Videos
 *
 * Populates the `articles` and `videos` tables from the original mock data.
 * Safe to run multiple times — uses INSERT … ON CONFLICT DO NOTHING so
 * existing records are never overwritten.
 *
 * Run:
 *   pnpm --filter @workspace/scripts run seed:content
 */
import { db, articlesTable, videosTable } from "@workspace/db";
import { sql } from "drizzle-orm";

/* ── Seed data (sourced from mock files) ────────────────────────────────── */

const articles = [
  {
    title:       "Hiểu đúng về tích sản để không bị lạc lối trong thị trường nhiều biến động",
    slug:        "hieu-dung-ve-tich-san",
    excerpt:     "Tích sản không chỉ là đầu tư — đó là một quá trình xây dựng nền tảng tài sản bền vững qua kỷ luật và thời gian.",
    content:     null,
    coverImageUrl: null,
    coverImageAlt: null,
    category:    "Tư duy đầu tư",
    categorySlug: "tu-duy-dau-tu",
    tags:        ["tích sản", "đầu tư dài hạn", "tư duy tài chính"],
    publishDate: new Date("2024-01-10T07:00:00Z"),
    featured:    true,
    status:      "published",
    readingTime: "7 phút",
    topicSlug:   "tu-duy-tich-san",
    seriesSlug:  null,
  },
  {
    title:       "Tại sao người kiếm nhiều vẫn không tích lũy được tài sản?",
    slug:        "tai-sao-nguoi-kiem-nhieu-van-khong-tich-luy",
    excerpt:     "Thu nhập cao chỉ là điều kiện cần — cấu trúc tài chính đúng mới là điều kiện đủ để tích sản bền vững.",
    content:     null,
    coverImageUrl: null,
    coverImageAlt: null,
    category:    "Tài chính cá nhân",
    categorySlug: "tai-chinh-ca-nhan",
    tags:        ["tài chính cá nhân", "tích sản", "thu nhập"],
    publishDate: new Date("2024-01-17T07:00:00Z"),
    featured:    true,
    status:      "published",
    readingTime: "5 phút",
    topicSlug:   "tai-chinh-ca-nhan",
    seriesSlug:  null,
  },
  {
    title:       "Những nguyên tắc đầu tư dài hạn mà người mới hay bỏ qua",
    slug:        "nhung-nguyen-tac-dau-tu-dai-han",
    excerpt:     "Đầu tư không phải cuộc đua tốc độ — đó là hành trình đòi hỏi kiên nhẫn, kỷ luật và góc nhìn rõ ràng.",
    content:     null,
    coverImageUrl: null,
    coverImageAlt: null,
    category:    "Đầu tư dài hạn",
    categorySlug: "dau-tu-dai-han",
    tags:        ["đầu tư dài hạn", "nguyên tắc", "người mới"],
    publishDate: new Date("2024-01-24T07:00:00Z"),
    featured:    false,
    status:      "published",
    readingTime: "8 phút",
    topicSlug:   "dau-tu-dai-han",
    seriesSlug:  null,
  },
  {
    title:       "Quản lý dòng tiền cá nhân — từ kiểm soát đến tự do",
    slug:        "quan-ly-dong-tien-ca-nhan",
    excerpt:     "Dòng tiền được kiểm soát tốt là nền tảng không thể thiếu trước khi bắt đầu bất kỳ chiến lược tích sản nào.",
    content:     null,
    coverImageUrl: null,
    coverImageAlt: null,
    category:    "Tài chính cá nhân",
    categorySlug: "tai-chinh-ca-nhan",
    tags:        ["dòng tiền", "tài chính cá nhân", "ngân sách"],
    publishDate: new Date("2024-02-01T07:00:00Z"),
    featured:    false,
    status:      "published",
    readingTime: "6 phút",
    topicSlug:   "tai-chinh-ca-nhan",
    seriesSlug:  null,
  },
  {
    title:       "Tư duy dài hạn trong thị trường ngắn hạn",
    slug:        "tu-duy-dai-han-trong-thi-truong-ngan-han",
    excerpt:     "Khi thị trường biến động, người có tư duy dài hạn không chỉ bình tĩnh hơn — họ còn đưa ra quyết định tốt hơn.",
    content:     null,
    coverImageUrl: null,
    coverImageAlt: null,
    category:    "Tư duy đầu tư",
    categorySlug: "tu-duy-dau-tu",
    tags:        ["tư duy", "đầu tư dài hạn", "thị trường"],
    publishDate: new Date("2024-02-08T07:00:00Z"),
    featured:    false,
    status:      "published",
    readingTime: "9 phút",
    topicSlug:   "dau-tu-dai-han",
    seriesSlug:  null,
  },
  {
    title:       "Bắt đầu đầu tư từ bao nhiêu tiền là đủ?",
    slug:        "bat-dau-dau-tu-tu-bao-nhieu-tien-la-du",
    excerpt:     "Câu hỏi không phải là bao nhiêu — mà là bắt đầu đúng cách với số tiền bạn đang có.",
    content:     null,
    coverImageUrl: null,
    coverImageAlt: null,
    category:    "Đầu tư dài hạn",
    categorySlug: "dau-tu-dai-han",
    tags:        ["đầu tư", "vốn nhỏ", "người mới"],
    publishDate: new Date("2024-02-15T07:00:00Z"),
    featured:    true,
    status:      "published",
    readingTime: "5 phút",
    topicSlug:   "dau-tu-dai-han",
    seriesSlug:  null,
  },
];

const YOUTUBE_CHANNEL_URL = "https://youtube.com/@pvtswc";

const videos = [
  {
    title:            "Đầu tư dài hạn bắt đầu từ đâu nếu bạn chưa có nhiều vốn?",
    slug:             "dau-tu-dai-han-bat-dau-tu-dau",
    excerpt:          "Một góc nhìn dành cho những người mới bắt đầu hành trình tích sản và muốn đi đường dài bằng sự kỷ luật thay vì cảm xúc.",
    youtubeUrl:       YOUTUBE_CHANNEL_URL,
    youtubeVideoId:   null,
    thumbnailUrl:     null,
    thumbnailAlt:     null,
    thumbnailGradient: "linear-gradient(145deg, #0c2622 0%, #124540 55%, #1a6258 100%)",
    duration:         "15 phút",
    publishDate:      new Date("2024-01-15T07:00:00Z"),
    featured:         true,
    isFeaturedVideo:  true,
    status:           "published",
    topicSlug:        "dau-tu-dai-han",
    seriesSlug:       null,
    categories:       ["featured", "dau-tu"],
  },
  {
    title:            "Vì sao kiếm nhiều hơn vẫn chưa chắc vững hơn về tài chính?",
    slug:             "vi-sao-kiem-nhieu-hon-van-chua-chac-vung",
    excerpt:          "Hiểu khác biệt giữa thu nhập cao và nền tảng tài chính vững.",
    youtubeUrl:       YOUTUBE_CHANNEL_URL,
    youtubeVideoId:   null,
    thumbnailUrl:     null,
    thumbnailAlt:     null,
    thumbnailGradient: "linear-gradient(145deg, #0d1e2e 0%, #1a3550 55%, #1e4060 100%)",
    duration:         "12 phút",
    publishDate:      new Date("2024-01-22T07:00:00Z"),
    featured:         false,
    isFeaturedVideo:  false,
    status:           "published",
    topicSlug:        "tai-chinh-ca-nhan",
    seriesSlug:       null,
    categories:       ["tai-chinh"],
  },
  {
    title:            "Người mới đầu tư nên nhìn vào điều gì trước lợi nhuận?",
    slug:             "nguoi-moi-dau-tu-nen-nhin-vao-dieu-gi",
    excerpt:          "Một cách tiếp cận thực tế hơn để giảm rủi ro khi bắt đầu.",
    youtubeUrl:       YOUTUBE_CHANNEL_URL,
    youtubeVideoId:   null,
    thumbnailUrl:     null,
    thumbnailAlt:     null,
    thumbnailGradient: "linear-gradient(145deg, #1a200d 0%, #2d3b18 55%, #374720 100%)",
    duration:         "10 phút",
    publishDate:      new Date("2024-01-29T07:00:00Z"),
    featured:         false,
    isFeaturedVideo:  false,
    status:           "published",
    topicSlug:        "dau-tu-dai-han",
    seriesSlug:       null,
    categories:       ["dau-tu"],
  },
  {
    title:            "Tích sản là quá trình của kỷ luật, không phải cảm hứng",
    slug:             "tich-san-la-qua-trinh-cua-ky-luat",
    excerpt:          "Xây tài sản bền vững thường bắt đầu từ những nguyên tắc nhỏ nhưng lặp lại đủ lâu.",
    youtubeUrl:       YOUTUBE_CHANNEL_URL,
    youtubeVideoId:   null,
    thumbnailUrl:     null,
    thumbnailAlt:     null,
    thumbnailGradient: "linear-gradient(145deg, #1e1a0a 0%, #3a2e12 55%, #44381a 100%)",
    duration:         "9 phút",
    publishDate:      new Date("2024-02-05T07:00:00Z"),
    featured:         true,
    isFeaturedVideo:  false,
    status:           "published",
    topicSlug:        "tu-duy-tich-san",
    seriesSlug:       null,
    categories:       ["tu-duy", "featured"],
  },
  {
    title:            "Không phải cứ cố hơn là tài chính sẽ tốt hơn",
    slug:             "khong-phai-cu-co-hon-la-tai-chinh-tot-hon",
    excerpt:          "Đôi khi điều cần thay đổi không phải là nỗ lực, mà là cấu trúc.",
    youtubeUrl:       YOUTUBE_CHANNEL_URL,
    youtubeVideoId:   null,
    thumbnailUrl:     null,
    thumbnailAlt:     null,
    thumbnailGradient: "linear-gradient(145deg, #0d162a 0%, #1a2a4a 55%, #1e3255 100%)",
    duration:         "14 phút",
    publishDate:      new Date("2024-02-12T07:00:00Z"),
    featured:         false,
    isFeaturedVideo:  false,
    status:           "published",
    topicSlug:        "tai-chinh-ca-nhan",
    seriesSlug:       null,
    categories:       ["tai-chinh", "tu-duy"],
  },
  {
    title:            "Muốn đi đường dài trong đầu tư, trước hết cần bình tĩnh",
    slug:             "muon-di-duong-dai-trong-dau-tu-truoc-het-can-binh-tinh",
    excerpt:          "Tâm lý là một phần của chất lượng quyết định tài chính.",
    youtubeUrl:       YOUTUBE_CHANNEL_URL,
    youtubeVideoId:   null,
    thumbnailUrl:     null,
    thumbnailAlt:     null,
    thumbnailGradient: "linear-gradient(145deg, #1a0e18 0%, #341a30 55%, #3e2038 100%)",
    duration:         "11 phút",
    publishDate:      new Date("2024-02-19T07:00:00Z"),
    featured:         false,
    isFeaturedVideo:  false,
    status:           "published",
    topicSlug:        "dau-tu-dai-han",
    seriesSlug:       null,
    categories:       ["dau-tu", "tu-duy"],
  },
  {
    title:            "Hiểu đúng về tích sản trước khi nghĩ đến tự do tài chính",
    slug:             "hieu-dung-ve-tich-san-truoc-khi-nghi-den-tu-do",
    excerpt:          "Tự do tài chính không bắt đầu từ khát vọng lớn, mà từ nền tảng đủ rõ.",
    youtubeUrl:       YOUTUBE_CHANNEL_URL,
    youtubeVideoId:   null,
    thumbnailUrl:     null,
    thumbnailAlt:     null,
    thumbnailGradient: "linear-gradient(145deg, #0a1e18 0%, #143328 55%, #1a4032 100%)",
    duration:         "16 phút",
    publishDate:      new Date("2024-02-26T07:00:00Z"),
    featured:         true,
    isFeaturedVideo:  false,
    status:           "published",
    topicSlug:        "tu-duy-tich-san",
    seriesSlug:       null,
    categories:       ["tu-duy", "featured"],
  },
];

/* ── Run seed ───────────────────────────────────────────────────────────── */

async function seedArticles() {
  console.log("Seeding articles…");
  for (const article of articles) {
    await db
      .insert(articlesTable)
      .values(article)
      .onConflictDoNothing({ target: articlesTable.slug });
  }
  console.log(`  ✓ ${articles.length} articles processed (existing slugs skipped)`);
}

async function seedVideos() {
  console.log("Seeding videos…");
  for (const video of videos) {
    await db
      .insert(videosTable)
      .values(video)
      .onConflictDoNothing({ target: videosTable.slug });
  }
  console.log(`  ✓ ${videos.length} videos processed (existing slugs skipped)`);
}

async function main() {
  try {
    await seedArticles();
    await seedVideos();
    console.log("Seed complete.");
    process.exit(0);
  } catch (e) {
    console.error("Seed failed:", e);
    process.exit(1);
  }
}

main();
