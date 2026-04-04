export type MediaContext = "articles" | "videos" | "topics" | "series";

export interface MediaPreset {
  aspectRatio: number;
  context: string;
  maxFileSizeBytes: number;
}

export const MEDIA_CONFIG: Record<MediaContext, MediaPreset> = {
  articles: {
    aspectRatio: 16 / 9,
    context: "tu-duy-dau-tu",
    maxFileSizeBytes: 10 * 1024 * 1024,
  },
  videos: {
    aspectRatio: 16 / 9,
    context: "tu-duy-dau-tu",
    maxFileSizeBytes: 10 * 1024 * 1024,
  },
  topics: {
    aspectRatio: 16 / 9,
    context: "default",
    maxFileSizeBytes: 10 * 1024 * 1024,
  },
  series: {
    aspectRatio: 16 / 9,
    context: "default",
    maxFileSizeBytes: 10 * 1024 * 1024,
  },
};
