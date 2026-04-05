/* ── Public types ───────────────────────────────────────────────────── */
export interface NewsCategory { id: number; name: string; slug: string; description: string | null; createdAt: string; }
export interface NewsProduct   { id: number; name: string; slug: string; description: string | null; createdAt: string; }
export interface NewsTag       { id: number; name: string; slug: string; createdAt: string; }
export interface NewsPost {
  id: number; title: string; slug: string; excerpt: string | null; content: string | null;
  featuredImage: string | null; featuredImageDisplay: string | null;
  categoryId: number | null; productId: number | null;
  status: string; publishedAt: string | null; authorName: string;
  seoTitle: string | null; seoDescription: string | null;
  isFeatured: boolean; showOnHomepage: boolean; showInRelated: boolean;
  createdAt: string; updatedAt: string;
  category?: NewsCategory | null; product?: NewsProduct | null; tags?: NewsTag[];
}
export interface Lead {
  id: number; name: string; email: string | null; phone: string | null;
  sourceType: string | null; sourcePage: string | null; productRef: string | null;
  message: string | null; status: string; notes: string | null;
  createdAt: string; updatedAt: string;
}
export interface DashboardData {
  publishedCount: number; draftCount: number; productCount: number;
  totalLeads: number; newLeads: number;
  recentPosts: Pick<NewsPost, "id" | "title" | "status" | "publishedAt" | "createdAt" | "updatedAt"> & { categoryName: string | null }[];
  recentLeads: Lead[];
  articlesPublished: number; articlesDraft: number;
  videosPublished: number; videosDraft: number;
  topicsCount: number; seriesCount: number;
}

/* ── Content types (articles + videos from KB hub) ──────────────────── */
export interface Article {
  id: number; title: string; slug: string;
  excerpt: string | null; content: string | null;
  coverImageUrl: string | null; coverImageAlt: string | null; coverThumbnailUrl: string | null;
  category: string | null; categorySlug: string | null;
  tags: string[] | null;
  publishDate: string | null;
  featured: boolean; status: string;
  readingTime: string | null;
  topicSlug: string | null; seriesSlug: string | null;
  /* SEO */
  seoTitle: string | null; seoDescription: string | null; seoKeywords: string | null;
  ogTitle: string | null; ogDescription: string | null; ogImageUrl: string | null;
  canonicalUrl: string | null; noindex: boolean;
  /* Generated OG image */
  generatedOgImageUrl: string | null; ogImageGenerated: boolean; ogImageUpdatedAt: string | null;
  /* Homepage */
  showOnHomepage: boolean; displayOrder: number;
  createdAt: string; updatedAt: string;
}

export interface Video {
  id: number; title: string; slug: string;
  excerpt: string | null;
  youtubeUrl: string; youtubeVideoId: string | null;
  thumbnailUrl: string | null; thumbnailAlt: string | null; thumbnailSmallUrl: string | null; thumbnailGradient: string | null;
  duration: string | null;
  publishDate: string | null;
  featured: boolean; isFeaturedVideo: boolean; status: string;
  topicSlug: string | null; seriesSlug: string | null;
  categories: string[] | null;
  /* SEO */
  seoTitle: string | null; seoDescription: string | null; seoKeywords: string | null;
  ogTitle: string | null; ogDescription: string | null; ogImageUrl: string | null;
  canonicalUrl: string | null; noindex: boolean;
  /* Generated OG image */
  generatedOgImageUrl: string | null; ogImageGenerated: boolean; ogImageUpdatedAt: string | null;
  /* Homepage */
  showOnHomepage: boolean; displayOrder: number;
  createdAt: string; updatedAt: string;
}

export interface Topic {
  id: number; title: string; slug: string;
  description: string | null; shortDescription: string | null;
  iconKey: string | null;
  featured: boolean; displayOrder: number;
  status: string;
  seoTitle: string | null; seoDescription: string | null;
  createdAt: string; updatedAt: string;
}

export interface Series {
  id: number; title: string; slug: string;
  description: string | null; shortDescription: string | null;
  coverImageUrl: string | null; coverImageAlt: string | null;
  type: string;
  featured: boolean; displayOrder: number;
  status: string;
  seoTitle: string | null; seoDescription: string | null;
  createdAt: string; updatedAt: string;
}

export interface MediaAsset {
  id: number;
  title: string | null;
  filename: string;
  originalFilename: string | null;
  mimeType: string | null;
  sizeBytes: number | null;
  width: number | null;
  height: number | null;
  storagePathOriginal: string | null;
  storagePathProcessed: string;
  storagePathThumbnail: string | null;
  publicUrl: string;
  thumbnailUrl: string | null;
  altText: string | null;
  watermarkEnabled: boolean;
  watermarkText: string | null;
  contentType: string;
  usageContext: string;
  tags: string[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface MediaUsages {
  articles: { id: number; title: string }[];
  videos:   { id: number; title: string }[];
}

export interface ContentMeta {
  topics: Topic[];
  series: Series[];
}

const BASE = "/api";

async function get<T>(path: string, adminKey?: string): Promise<T> {
  const r = await fetch(`${BASE}${path}`, {
    headers: adminKey ? { Authorization: `Bearer ${adminKey}` } : {},
  });
  if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error((e as { error?: string }).error ?? `API error ${r.status}`); }
  return r.json();
}

async function mutate<T>(method: string, path: string, body?: unknown, adminKey?: string): Promise<T> {
  const r = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(adminKey ? { Authorization: `Bearer ${adminKey}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error((e as { error?: string }).error ?? `API error ${r.status}`); }
  return r.json();
}

/* ── Public API ─────────────────────────────────────────────────────── */
export const newsApi = {
  getCategories: () => get<{ categories: NewsCategory[] }>("/news/categories").then((d) => d.categories),
  getProducts:   () => get<{ products: NewsProduct[] }>("/news/products").then((d) => d.products),
  getTags:       () => get<{ tags: NewsTag[] }>("/news/tags").then((d) => d.tags),
  getPosts: (params?: { category?: string; product?: string; tag?: string; q?: string; status?: string }) => {
    const qs = new URLSearchParams(Object.entries(params ?? {}).filter(([, v]) => !!v) as [string, string][]).toString();
    return get<{ posts: NewsPost[] }>(`/news/posts${qs ? `?${qs}` : ""}`).then((d) => d.posts);
  },
  getPost: (slug: string) => get<{ post: NewsPost; related: NewsPost[] }>(`/news/posts/${slug}`),
};

export const leadsApi = {
  submit: (data: { name: string; email?: string; phone?: string; sourceType?: string; sourcePage?: string; productRef?: string; message?: string }) =>
    mutate<{ ok: boolean; id: number }>("POST", "/leads", data),
};

/* ── Admin API ──────────────────────────────────────────────────────── */
export const adminApi = {
  /* meta */
  getMeta: (key: string) => get<{ categories: NewsCategory[]; products: NewsProduct[]; tags: NewsTag[] }>("/admin/meta", key),
  getDashboard: (key: string) => get<DashboardData>("/admin/dashboard", key),
  getContentMeta: (key: string) => get<ContentMeta>("/admin/content-meta", key),

  /* posts */
  getPosts: (key: string) => get<{ posts: NewsPost[] }>("/admin/posts", key).then((d) => d.posts),
  createPost: (key: string, data: Partial<NewsPost> & { tagIds?: number[] }) => mutate<{ post: NewsPost }>("POST", "/admin/posts", data, key).then((d) => d.post),
  updatePost: (key: string, id: number, data: Partial<NewsPost> & { tagIds?: number[] }) => mutate<{ post: NewsPost }>("PUT", `/admin/posts/${id}`, data, key).then((d) => d.post),
  deletePost: (key: string, id: number) => mutate<{ ok: boolean }>("DELETE", `/admin/posts/${id}`, undefined, key),

  /* categories */
  createCategory: (key: string, data: { name: string; slug: string; description?: string }) => mutate<{ category: NewsCategory }>("POST", "/admin/categories", data, key).then((d) => d.category),
  updateCategory: (key: string, id: number, data: { name: string; slug: string; description?: string }) => mutate<{ category: NewsCategory }>("PUT", `/admin/categories/${id}`, data, key).then((d) => d.category),
  deleteCategory: (key: string, id: number) => mutate<{ ok: boolean }>("DELETE", `/admin/categories/${id}`, undefined, key),

  /* tags */
  createTag: (key: string, name: string, slug: string) => mutate<{ tag: NewsTag }>("POST", "/admin/tags", { name, slug }, key).then((d) => d.tag),
  updateTag: (key: string, id: number, name: string, slug: string) => mutate<{ tag: NewsTag }>("PUT", `/admin/tags/${id}`, { name, slug }, key).then((d) => d.tag),
  deleteTag: (key: string, id: number) => mutate<{ ok: boolean }>("DELETE", `/admin/tags/${id}`, undefined, key),

  /* products */
  createProduct: (key: string, data: { name: string; slug: string; description?: string }) => mutate<{ product: NewsProduct }>("POST", "/admin/products", data, key).then((d) => d.product),
  updateProduct: (key: string, id: number, data: { name: string; slug: string; description?: string }) => mutate<{ product: NewsProduct }>("PUT", `/admin/products/${id}`, data, key).then((d) => d.product),
  deleteProduct: (key: string, id: number) => mutate<{ ok: boolean }>("DELETE", `/admin/products/${id}`, undefined, key),

  /* image upload */
  uploadImage: async (key: string, file: File, context?: string): Promise<{ original: string; display: string }> => {
    const fd = new FormData();
    fd.append("image", file);
    if (context) fd.append("context", context);
    const r = await fetch(`${BASE}/admin/upload-image`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}` },
      body: fd,
    });
    if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error((e as { error?: string }).error ?? `Upload error ${r.status}`); }
    return r.json();
  },

  /* leads */
  getLeads: (key: string, params?: { status?: string; q?: string }) => {
    const qs = new URLSearchParams(Object.entries(params ?? {}).filter(([, v]) => !!v) as [string, string][]).toString();
    return get<{ leads: Lead[] }>(`/admin/leads${qs ? `?${qs}` : ""}`, key).then((d) => d.leads);
  },
  updateLead: (key: string, id: number, data: { status?: string; notes?: string }) => mutate<{ lead: Lead }>("PATCH", `/admin/leads/${id}`, data, key).then((d) => d.lead),
  deleteLead: (key: string, id: number) => mutate<{ ok: boolean }>("DELETE", `/admin/leads/${id}`, undefined, key),

  /* settings */
  getSettings: (key: string) => get<{ settings: Record<string, string | null> }>("/admin/settings", key).then((d) => d.settings),
  updateSettings: (key: string, data: Record<string, string>) => mutate<{ settings: Record<string, string | null> }>("PUT", "/admin/settings", data, key).then((d) => d.settings),

  /* articles (KB hub) */
  getArticles: (key: string) => get<{ articles: Article[] }>("/admin/articles", key).then((d) => d.articles),
  getArticleById: (key: string, id: number) => get<{ article: Article }>(`/admin/articles/${id}`, key).then((d) => d.article),
  createArticle: (key: string, data: Partial<Article>) => mutate<{ article: Article }>("POST", "/admin/articles", data, key).then((d) => d.article),
  updateArticle: (key: string, id: number, data: Partial<Article>) => mutate<{ article: Article }>("PUT", `/admin/articles/${id}`, data, key).then((d) => d.article),
  deleteArticle: (key: string, id: number) => mutate<{ ok: boolean }>("DELETE", `/admin/articles/${id}`, undefined, key),
  generateArticleOg: (key: string, id: number) => mutate<{ ok: boolean; generatedOgImageUrl: string }>("POST", `/admin/articles/${id}/generate-og`, {}, key),

  /* videos (KB hub) */
  getVideos: (key: string) => get<{ videos: Video[] }>("/admin/videos", key).then((d) => d.videos),
  getVideoById: (key: string, id: number) => get<{ video: Video }>(`/admin/videos/${id}`, key).then((d) => d.video),
  createVideo: (key: string, data: Partial<Video>) => mutate<{ video: Video }>("POST", "/admin/videos", data, key).then((d) => d.video),
  updateVideo: (key: string, id: number, data: Partial<Video>) => mutate<{ video: Video }>("PUT", `/admin/videos/${id}`, data, key).then((d) => d.video),
  deleteVideo: (key: string, id: number) => mutate<{ ok: boolean }>("DELETE", `/admin/videos/${id}`, undefined, key),
  generateVideoOg: (key: string, id: number) => mutate<{ ok: boolean; generatedOgImageUrl: string }>("POST", `/admin/videos/${id}/generate-og`, {}, key),

  /* topics */
  getTopics: (key: string) => get<{ topics: Topic[] }>("/admin/topics", key).then((d) => d.topics),
  createTopic: (key: string, data: Partial<Topic>) => mutate<{ topic: Topic }>("POST", "/admin/topics", data, key).then((d) => d.topic),
  updateTopic: (key: string, id: number, data: Partial<Topic>) => mutate<{ topic: Topic }>("PUT", `/admin/topics/${id}`, data, key).then((d) => d.topic),
  deleteTopic: (key: string, id: number) => mutate<{ ok: boolean }>("DELETE", `/admin/topics/${id}`, undefined, key),

  /* series */
  getSeries: (key: string) => get<{ series: Series[] }>("/admin/series", key).then((d) => d.series),
  createSeries: (key: string, data: Partial<Series>) => mutate<{ series: Series }>("POST", "/admin/series", data, key).then((d) => d.series),
  updateSeries: (key: string, id: number, data: Partial<Series>) => mutate<{ series: Series }>("PUT", `/admin/series/${id}`, data, key).then((d) => d.series),
  deleteSeries: (key: string, id: number) => mutate<{ ok: boolean }>("DELETE", `/admin/series/${id}`, undefined, key),

  /* media assets */
  getMedia: (key: string, params?: { q?: string; contentType?: string; sort?: string }) => {
    const qs = new URLSearchParams(
      Object.entries(params ?? {}).filter(([, v]) => !!v) as [string, string][],
    ).toString();
    return get<{ assets: MediaAsset[] }>(`/admin/media${qs ? `?${qs}` : ""}`, key).then((d) => d.assets);
  },
  getMediaAsset: (key: string, id: number) =>
    get<{ asset: MediaAsset }>(`/admin/media/${id}`, key).then((d) => d.asset),
  updateMediaAsset: (key: string, id: number, data: { title?: string | null; altText?: string | null; tags?: string[] | null; contentType?: string }) =>
    mutate<{ asset: MediaAsset }>("PUT", `/admin/media/${id}`, data, key).then((d) => d.asset),
  deleteMediaAsset: (key: string, id: number, force?: boolean) =>
    mutate<{ ok: boolean } | { error: string; usages: MediaUsages }>(
      "DELETE", `/admin/media/${id}${force ? "?force=1" : ""}`, undefined, key,
    ),
};
