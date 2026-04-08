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
  sourceType: string | null; sourcePage: string | null; sourceSection: string | null; productRef: string | null;
  message: string | null; status: string; notes: string | null;
  interestTopic: string | null; formType: string | null; leadStage: string | null;
  tags: string[] | null;
  lastContactedAt: string | null; nextFollowUpAt: string | null;
  consentStatus: string | null;
  utmSource: string | null; utmMedium: string | null; utmCampaign: string | null;
  utmTerm: string | null; utmContent: string | null;
  articleSlug: string | null; articleTitle: string | null;
  assignedTo: string | null; score: number;
  referrer: string | null;
  syncedToNotion: boolean; notionPageId: string | null; notionSyncedAt: string | null;
  syncedToSheets: boolean; sheetsSyncedAt: string | null;
  syncError: string | null;
  notifyStatus: string | null; notifyError: string | null;
  createdAt: string; updatedAt: string;
}

export interface SystemStatus {
  storage:   { provider: string };
  watermark: { enabled: boolean };
  email:     { configured: boolean; from: string | null };
  notion:    { enabled: boolean; configured: boolean };
  sheets:    { enabled: boolean; configured: boolean };
  adminKey:  { isDefault: boolean };
}
export interface LeadNote {
  id: number; leadId: number; note: string; noteType: string | null; createdAt: string;
}
export interface DashboardData {
  publishedCount: number; draftCount: number; productCount: number;
  totalLeads: number; newLeads: number;
  recentPosts: (Pick<NewsPost, "id" | "title" | "status" | "publishedAt" | "createdAt" | "updatedAt"> & { categoryName: string | null })[];
  recentLeads: Lead[];
  articlesPublished: number; articlesDraft: number;
  videosPublished: number; videosDraft: number;
  topicsCount: number; seriesCount: number;
  syncErrors: number;
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

/* ── Email types ────────────────────────────────────────────────────── */
export interface EmailSubscriber {
  id: number; email: string; fullName: string | null; firstName: string | null;
  subscriberStatus: string;
  interestPrimary: string | null; stage: string | null;
  sourceType: string | null; sourcePage: string | null; sourceSection: string | null;
  consentStatus: string | null; unsubscribeToken: string;
  linkedLeadId: number | null; tags: string[] | null;
  subscribedAt: string | null; unsubscribedAt: string | null;
  lastEmailSentAt: string | null; lastOpenedAt: string | null; lastClickedAt: string | null;
  createdAt: string; updatedAt: string;
}

export interface EmailCampaign {
  id: number; title: string; subject: string; previewText: string | null;
  campaignType: string; status: string; contentBody: string | null;
  targetType: string | null; targetTags: string[] | null;
  targetStage: string | null; targetSource: string | null; targetInterest: string | null;
  recipientCount: number | null; sentAt: string | null; scheduledAt: string | null;
  createdAt: string; updatedAt: string;
}

export interface EmailSequence {
  id: number; title: string; slug: string | null; description: string | null;
  status: string; triggerType: string | null;
  triggerTags: string[] | null; triggerConfig: Record<string, unknown> | null;
  excludeRules: string[] | null; goal: string | null;
  // Enriched analytics (from list endpoint)
  enrolledCount?: number; activeCount?: number; completedCount?: number;
  stepCount?: number; openRate?: number | null; clickRate?: number | null;
  createdAt: string; updatedAt: string;
}

export interface EmailSequenceStep {
  id: number; sequenceId: number; stepOrder: number;
  stepType: string | null; delayDays: number;
  subject: string; previewText: string | null; contentBody: string | null;
  senderName: string | null; senderEmail: string | null;
  ctaText: string | null; ctaUrl: string | null;
  ctaSecondaryText: string | null; ctaSecondaryUrl: string | null;
  tagName: string | null; updateField: string | null; updateValue: string | null;
  targetSequenceId: number | null;
  actionData: Record<string, unknown> | null;
  isActive: boolean; createdAt: string; updatedAt: string;
}

export interface SequenceAnalytics {
  enrolled: number; active: number; completed: number; exited: number;
  sent: number; opened: number; clicked: number;
  openRate: number | null; clickRate: number | null;
  steps: {
    stepId: number; stepOrder: number; stepType: string | null; subject: string; delayDays: number;
    sent: number; opened: number; clicked: number;
    openRate: number | null; clickRate: number | null;
  }[];
}

export interface SubscriberEnrollment {
  enrollmentId: number; sequenceId: number; seqTitle: string | null;
  status: string; currentStep: number;
  nextSendAt: string | null; enrolledAt: string; completedAt: string | null;
}

export interface LeadMagnet {
  id: number;
  title: string;
  slug: string;
  shortDescription: string | null;
  fullDescription: string | null;
  resourceType: string;
  coverImageUrl: string | null;
  coverImageAlt: string | null;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  fileMimeType: string | null;
  externalUrl: string | null;
  thankYouMessage: string | null;
  buttonLabel: string | null;
  status: string;
  gatingMode: string;
  deliveryMode: string;
  featured: boolean;
  topicSlug: string | null;
  tags: string[] | null;
  ctaTitle: string | null;
  ctaDescription: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  ogImageUrl: string | null;
  requiresPhone: boolean;
  sortOrder: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ResourceAnalytics {
  totalPageViews: number;
  totalUnlocks: number;
  totalDownloads: number;
  totalEmailSent: number;
  conversionRate: number;
  uniqueEmails: number;
  recent: Array<{ accessType: string; fullName: string | null; email: string | null; sourcePage: string | null; createdAt: string }>;
  topSources: Array<{ sourcePage: string | null; c: number }>;
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
  submit: (data: {
    name: string; email?: string; phone?: string;
    sourceType?: string; sourcePage?: string; sourceSection?: string; productRef?: string;
    message?: string; interestTopic?: string; formType?: string; consentStatus?: string;
    utmSource?: string; utmMedium?: string; utmCampaign?: string; referrer?: string;
    articleSlug?: string; articleTitle?: string;
    hp?: string; // honeypot — always send empty string
  }) => mutate<{ ok: boolean; id: number }>("POST", "/leads", data),
};

export const emailApi = {
  subscribe: (data: {
    email: string; fullName?: string; sourceType?: string;
    sourcePage?: string; sourceSection?: string; hp?: string;
  }) => mutate<{ ok: boolean; id?: number; alreadySubscribed?: boolean }>("POST", "/email/subscribe", data),

  unsubscribe: (token: string) =>
    get<{ ok: boolean; email?: string; error?: string }>(`/email/unsubscribe?token=${encodeURIComponent(token)}`),
};

export const resourcesApi = {
  getResources: (params?: { featured?: boolean; topic?: string }) => {
    const qs = new URLSearchParams(
      Object.entries(params ?? {})
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, String(v)])
    ).toString();
    return get<{ resources: LeadMagnet[] }>(`/resources${qs ? `?${qs}` : ""}`).then((d) => d.resources);
  },
  getResource: (slug: string) =>
    get<{ resource: LeadMagnet }>(`/resources/${slug}`).then((d) => d.resource),
  unlockResource: (
    slug: string,
    data: { fullName: string; email: string; phone?: string; interest?: string; hp?: string; sourcePage?: string; sourceSection?: string }
  ) =>
    mutate<{ ok: boolean; downloadUrl?: string | null; fileName?: string | null; thankYouMessage?: string | null; message: string }>(
      "POST", `/resources/${slug}/unlock`, data
    ),
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
  updateLead: (key: string, id: number, data: {
    status?: string; notes?: string; interestTopic?: string | null;
    formType?: string | null; leadStage?: string | null; tags?: string[] | null;
    lastContactedAt?: string | null; nextFollowUpAt?: string | null;
    assignedTo?: string | null; score?: number;
  }) => mutate<{ lead: Lead }>("PATCH", `/admin/leads/${id}`, data, key).then((d) => d.lead),
  deleteLead: (key: string, id: number) => mutate<{ ok: boolean }>("DELETE", `/admin/leads/${id}`, undefined, key),
  /* lead notes */
  getLeadNotes: (key: string, leadId: number) => get<{ notes: LeadNote[] }>(`/admin/leads/${leadId}/notes`, key).then((d) => d.notes),
  addLeadNote: (key: string, leadId: number, note: string, noteType?: string) => mutate<{ note: LeadNote }>("POST", `/admin/leads/${leadId}/notes`, { note, noteType: noteType ?? "internal" }, key).then((d) => d.note),
  deleteLeadNote: (key: string, noteId: number) => mutate<{ ok: boolean }>("DELETE", `/admin/leads/notes/${noteId}`, undefined, key),

  /* system status */
  getSystemStatus: (key: string) => get<SystemStatus>("/admin/system-status", key),

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

  /* email — stats */
  getEmailStats: (key: string) =>
    get<{
      totalSubscribers: number; activeSubscribers: number; recentSubscribers: number;
      totalCampaigns: number; sentCampaigns: number; totalEmailsSent: number;
      activeSequences: number; totalEnrolled: number; activeEnrolled: number;
      recentCampaigns: Pick<EmailCampaign, "id" | "title" | "status" | "sentAt" | "recipientCount">[];
    }>("/admin/email/stats", key),

  /* email — settings */
  getEmailSettings: (key: string) =>
    get<{ senderName: string; senderEmail: string; replyToEmail: string; siteUrl: string; providerType: string; apiKeyConfigured: boolean }>("/admin/email/settings", key),
  sendTestEmailSettings: (key: string, toEmail: string) =>
    mutate<{ ok: boolean; error?: string }>("POST", "/admin/email/settings/test", { toEmail }, key),

  /* email — subscribers */
  getSubscribers: (key: string, params?: { q?: string; status?: string; stage?: string; interest?: string; source?: string }) => {
    const qs = new URLSearchParams(Object.entries(params ?? {}).filter(([, v]) => !!v) as [string, string][]).toString();
    return get<{ subscribers: EmailSubscriber[] }>(`/admin/email/subscribers${qs ? `?${qs}` : ""}`, key).then((d) => d.subscribers);
  },
  updateSubscriber: (key: string, id: number, data: Partial<EmailSubscriber>) =>
    mutate<{ subscriber: EmailSubscriber }>("PATCH", `/admin/email/subscribers/${id}`, data, key).then((d) => d.subscriber),
  getSubscriberEnrollments: (key: string, id: number) =>
    get<{ enrollments: SubscriberEnrollment[] }>(`/admin/email/subscribers/${id}/enrollments`, key).then((d) => d.enrollments),
  enrollSubscriber: (key: string, id: number, sequenceId: number, force?: boolean) =>
    mutate<{ ok: boolean; enrollment?: SubscriberEnrollment }>( "POST", `/admin/email/subscribers/${id}/enroll`, { sequenceId, force }, key),
  getSubscriberActivity: (key: string, id: number) =>
    get<{ events: { id: number; eventType: string; createdAt: string; seqTitle: string | null; eventMetadata: unknown }[] }>(`/admin/email/subscribers/${id}/activity`, key).then((d) => d.events),

  /* email — campaigns */
  getCampaigns: (key: string) =>
    get<{ campaigns: EmailCampaign[] }>("/admin/email/campaigns", key).then((d) => d.campaigns),
  getCampaignPreviewCount: (key: string, params: { targetType: string; targetStage?: string; targetSource?: string; targetInterest?: string }) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => !!v) as [string, string][]).toString();
    return get<{ count: number }>(`/admin/email/campaigns/preview-count?${qs}`, key).then((d) => d.count);
  },
  createCampaign: (key: string, data: Partial<EmailCampaign>) =>
    mutate<{ campaign: EmailCampaign }>("POST", "/admin/email/campaigns", data, key).then((d) => d.campaign),
  updateCampaign: (key: string, id: number, data: Partial<EmailCampaign>) =>
    mutate<{ campaign: EmailCampaign }>("PUT", `/admin/email/campaigns/${id}`, data, key).then((d) => d.campaign),
  deleteCampaign: (key: string, id: number) =>
    mutate<{ ok: boolean }>("DELETE", `/admin/email/campaigns/${id}`, undefined, key),
  duplicateCampaign: (key: string, id: number) =>
    mutate<{ campaign: EmailCampaign }>("POST", `/admin/email/campaigns/${id}/duplicate`, {}, key).then((d) => d.campaign),
  sendCampaign: (key: string, id: number) =>
    mutate<{ ok: boolean; recipientCount?: number; error?: string }>("POST", `/admin/email/campaigns/${id}/send`, {}, key),
  testCampaign: (key: string, id: number, testEmail: string) =>
    mutate<{ ok: boolean; error?: string }>("POST", `/admin/email/campaigns/${id}/test`, { testEmail }, key),

  /* email — sequences */
  getSequences: (key: string, params?: { status?: string; trigger?: string }) => {
    const qs = new URLSearchParams(Object.entries(params ?? {}).filter(([, v]) => !!v) as [string, string][]).toString();
    return get<{ sequences: EmailSequence[] }>(`/admin/email/sequences${qs ? `?${qs}` : ""}`, key).then((d) => d.sequences);
  },
  getSequenceAnalytics: (key: string, id: number) =>
    get<SequenceAnalytics>(`/admin/email/sequences/${id}/analytics`, key),
  createSequence: (key: string, data: Partial<EmailSequence>) =>
    mutate<{ sequence: EmailSequence }>("POST", "/admin/email/sequences", data, key).then((d) => d.sequence),
  updateSequence: (key: string, id: number, data: Partial<EmailSequence>) =>
    mutate<{ sequence: EmailSequence }>("PUT", `/admin/email/sequences/${id}`, data, key).then((d) => d.sequence),
  deleteSequence: (key: string, id: number) =>
    mutate<{ ok: boolean }>("DELETE", `/admin/email/sequences/${id}`, undefined, key),
  seedSequences: (key: string) =>
    mutate<{ ok: boolean; inserted: { slug: string }[]; skipped: { slug: string }[] }>("POST", "/admin/email/sequences/seed", {}, key),

  /* email — sequence steps */
  getSequenceSteps: (key: string, sequenceId: number) =>
    get<{ steps: EmailSequenceStep[] }>(`/admin/email/sequences/${sequenceId}/steps`, key).then((d) => d.steps),
  createSequenceStep: (key: string, sequenceId: number, data: Partial<EmailSequenceStep>) =>
    mutate<{ step: EmailSequenceStep }>("POST", `/admin/email/sequences/${sequenceId}/steps`, data, key).then((d) => d.step),
  updateSequenceStep: (key: string, id: number, data: Partial<EmailSequenceStep>) =>
    mutate<{ step: EmailSequenceStep }>("PUT", `/admin/email/steps/${id}`, data, key).then((d) => d.step),
  deleteSequenceStep: (key: string, id: number) =>
    mutate<{ ok: boolean }>("DELETE", `/admin/email/steps/${id}`, undefined, key),

  /* resources / lead magnets */
  getResources: (key: string) =>
    get<{ resources: LeadMagnet[] }>("/admin/resources", key).then((d) => d.resources),
  getResource: (key: string, id: number) =>
    get<{ resource: LeadMagnet }>(`/admin/resources/${id}`, key).then((d) => d.resource),
  createResource: (key: string, data: Partial<LeadMagnet>) =>
    mutate<{ resource: LeadMagnet }>("POST", "/admin/resources", data, key).then((d) => d.resource),
  updateResource: (key: string, id: number, data: Partial<LeadMagnet>) =>
    mutate<{ resource: LeadMagnet }>("PUT", `/admin/resources/${id}`, data, key).then((d) => d.resource),
  deleteResource: (key: string, id: number) =>
    mutate<{ ok: boolean }>("DELETE", `/admin/resources/${id}`, undefined, key),
  uploadResourceFile: async (key: string, file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    const r = await fetch("/api/admin/resources/upload-file", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}` },
      body: fd,
    });
    if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error((e as { error?: string }).error ?? "Upload failed"); }
    return r.json() as Promise<{ ok: boolean; url: string; fileName: string; fileSize: number; fileMimeType: string }>;
  },
  getResourceAnalytics: (key: string, id: number) =>
    get<ResourceAnalytics>(`/admin/resources/${id}/analytics`, key),
};
