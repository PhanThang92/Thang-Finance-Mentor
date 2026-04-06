import { useEffect } from "react";

interface StructuredData {
  "@context": string;
  "@type": string;
  [key: string]: unknown;
}

interface SeoMeta {
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogImageWidth?: number;
  ogImageHeight?: number;
  ogType?: "website" | "article" | "product";
  canonicalUrl?: string;
  noindex?: boolean;
  siteName?: string;
  publishedAt?: string;
  modifiedAt?: string;
  author?: string;
  structuredData?: StructuredData;
}

export const SITE_NAME      = "Phan Văn Thắng SWC";
export const DEFAULT_DESCRIPTION = "Hành trình từ kiểm soát dòng tiền đến xây dựng tài sản bền vững. Tư duy tài chính thực chiến, đầu tư có kỷ luật, tích sản dài hạn.";
export const DEFAULT_OG_IMAGE_PATH  = "/og-default.jpg";   // homepage + general pages
export const ARTICLE_OG_IMAGE_PATH  = "/og-article.jpg";   // articles without featured image
export const PRODUCT_OG_IMAGE_PATH  = "/og-product.jpg";   // product pages without custom cover
export const OG_IMAGE_WIDTH  = 1200;
export const OG_IMAGE_HEIGHT = 630;

function absoluteUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  try {
    return `${window.location.origin}${path.startsWith("/") ? "" : "/"}${path}`;
  } catch {
    return path;
  }
}

function setMeta(name: string, content: string, useProperty = false) {
  if (!content) return;
  const attr = useProperty ? "property" : "name";
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function removeMeta(name: string, useProperty = false) {
  const attr = useProperty ? "property" : "name";
  const el = document.querySelector(`meta[${attr}="${name}"]`);
  if (el) el.remove();
}

function setLink(rel: string, href: string) {
  let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function setStructuredData(data: StructuredData) {
  const id = "structured-data-json-ld";
  let el = document.getElementById(id) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement("script");
    el.id = id;
    el.type = "application/ld+json";
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

function removeStructuredData() {
  const el = document.getElementById("structured-data-json-ld");
  if (el) el.remove();
}

export function useSeoMeta(meta: SeoMeta) {
  useEffect(() => {
    const siteName    = meta.siteName ?? SITE_NAME;
    const pageTitle   = meta.title ? `${meta.title} | ${siteName}` : siteName;
    const description = meta.description || DEFAULT_DESCRIPTION;
    const ogTitle     = meta.ogTitle || meta.title || siteName;
    const ogDesc      = meta.ogDescription || description;
    const ogImageAbs  = absoluteUrl(meta.ogImage || DEFAULT_OG_IMAGE_PATH);
    const ogType      = meta.ogType ?? "website";
    const pageUrl     = meta.canonicalUrl || (typeof window !== "undefined" ? window.location.href : "");

    document.title = pageTitle;

    setMeta("description",             description);
    setMeta("robots",                  meta.noindex ? "noindex, nofollow" : "index, follow");

    if (meta.keywords)  setMeta("keywords", meta.keywords);
    else                removeMeta("keywords");

    setMeta("og:type",         ogType,        true);
    setMeta("og:site_name",    siteName,      true);
    setMeta("og:locale",       "vi_VN",       true);
    setMeta("og:title",        ogTitle,       true);
    setMeta("og:description",  ogDesc,        true);
    setMeta("og:image",        ogImageAbs,    true);
    setMeta("og:image:width",  String(meta.ogImageWidth  ?? OG_IMAGE_WIDTH),  true);
    setMeta("og:image:height", String(meta.ogImageHeight ?? OG_IMAGE_HEIGHT), true);
    setMeta("og:url",          pageUrl,       true);

    if (ogType === "article") {
      if (meta.publishedAt) setMeta("article:published_time", meta.publishedAt, true);
      if (meta.modifiedAt)  setMeta("article:modified_time",  meta.modifiedAt,  true);
      if (meta.author)      setMeta("article:author",         meta.author,      true);
      setMeta("article:section", "Tài chính & Đầu tư", true);
    } else {
      removeMeta("article:published_time", true);
      removeMeta("article:modified_time",  true);
      removeMeta("article:author",         true);
      removeMeta("article:section",        true);
    }

    setMeta("twitter:card",        "summary_large_image");
    setMeta("twitter:site",        "@ThangSWC");
    setMeta("twitter:title",       ogTitle);
    setMeta("twitter:description", ogDesc);
    setMeta("twitter:image",       ogImageAbs);

    if (meta.canonicalUrl) setLink("canonical", meta.canonicalUrl);

    if (meta.structuredData) {
      setStructuredData(meta.structuredData);
    } else {
      removeStructuredData();
    }

    return () => {
      document.title = siteName;
      removeStructuredData();
    };
  }, [
    meta.title, meta.description, meta.keywords, meta.ogTitle,
    meta.ogDescription, meta.ogImage, meta.canonicalUrl, meta.noindex,
    meta.ogType, meta.publishedAt, meta.modifiedAt, meta.author,
    meta.siteName, meta.structuredData,
  ]);
}
