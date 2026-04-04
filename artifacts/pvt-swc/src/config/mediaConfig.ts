export type MediaContext = "articles" | "videos" | "topics" | "series" | "shared";

export interface MediaPreset {
  aspectRatio: number;
  context: string;
  contentType: string;
  maxFileSizeBytes: number;
}

export const MEDIA_CONFIG: Record<MediaContext, MediaPreset> = {
  articles: {
    aspectRatio: 16 / 9,
    context: "tu-duy-dau-tu",
    contentType: "article",
    maxFileSizeBytes: 10 * 1024 * 1024,
  },
  videos: {
    aspectRatio: 16 / 9,
    context: "tu-duy-dau-tu",
    contentType: "video",
    maxFileSizeBytes: 10 * 1024 * 1024,
  },
  topics: {
    aspectRatio: 16 / 9,
    context: "default",
    contentType: "topic",
    maxFileSizeBytes: 10 * 1024 * 1024,
  },
  series: {
    aspectRatio: 16 / 9,
    context: "default",
    contentType: "series",
    maxFileSizeBytes: 10 * 1024 * 1024,
  },
  shared: {
    aspectRatio: 16 / 9,
    context: "default",
    contentType: "shared",
    maxFileSizeBytes: 10 * 1024 * 1024,
  },
};
