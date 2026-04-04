export interface NewsCategory { id: number; name: string; slug: string; description: string | null; createdAt: string; }
export interface NewsProduct { id: number; name: string; slug: string; description: string | null; createdAt: string; }
export interface NewsTag { id: number; name: string; slug: string; createdAt: string; }
export interface NewsPost {
  id: number; title: string; slug: string; excerpt: string | null; content: string | null;
  featuredImage: string | null; categoryId: number | null; productId: number | null;
  status: string; publishedAt: string | null; authorName: string;
  seoTitle: string | null; seoDescription: string | null; createdAt: string; updatedAt: string;
  category?: NewsCategory | null; product?: NewsProduct | null; tags?: NewsTag[];
}

const BASE = "/api";

async function get<T>(path: string): Promise<T> {
  const r = await fetch(`${BASE}${path}`);
  if (!r.ok) throw new Error(`API error ${r.status}`);
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

export const newsApi = {
  getCategories: () => get<{ categories: NewsCategory[] }>("/news/categories").then((d) => d.categories),
  getProducts: () => get<{ products: NewsProduct[] }>("/news/products").then((d) => d.products),
  getTags: () => get<{ tags: NewsTag[] }>("/news/tags").then((d) => d.tags),
  getPosts: (params?: { category?: string; product?: string; tag?: string; q?: string; status?: string }) => {
    const qs = new URLSearchParams(Object.entries(params ?? {}).filter(([, v]) => !!v) as [string, string][]).toString();
    return get<{ posts: NewsPost[] }>(`/news/posts${qs ? `?${qs}` : ""}`).then((d) => d.posts);
  },
  getPost: (slug: string) => get<{ post: NewsPost; related: NewsPost[] }>(`/news/posts/${slug}`),
};

export const adminApi = {
  getMeta: (key: string) => mutate<{ categories: NewsCategory[]; products: NewsProduct[]; tags: NewsTag[] }>("GET", "/admin/meta", undefined, key),
  getPosts: (key: string) => mutate<{ posts: NewsPost[] }>("GET", "/admin/posts", undefined, key).then((d) => d.posts),
  createPost: (key: string, data: Partial<NewsPost> & { tagIds?: number[] }) => mutate<{ post: NewsPost }>("POST", "/admin/posts", data, key).then((d) => d.post),
  updatePost: (key: string, id: number, data: Partial<NewsPost> & { tagIds?: number[] }) => mutate<{ post: NewsPost }>("PUT", `/admin/posts/${id}`, data, key).then((d) => d.post),
  deletePost: (key: string, id: number) => mutate<{ ok: boolean }>("DELETE", `/admin/posts/${id}`, undefined, key),
  createTag: (key: string, name: string, slug: string) => mutate<{ tag: NewsTag }>("POST", "/admin/tags", { name, slug }, key).then((d) => d.tag),
};
