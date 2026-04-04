import { useEffect } from "react";

interface SeoMeta {
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
  noindex?: boolean;
  siteName?: string;
}

const SITE_NAME = "Phan Văn Thắng SWC";
const DEFAULT_DESCRIPTION = "Chia sẻ tư duy đầu tư, tài chính cá nhân và hành trình tích sản dài hạn.";
const DEFAULT_OG_IMAGE = "/portrait.png";

function setMeta(name: string, content: string, useProperty = false) {
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

function setCanonical(url: string) {
  let el = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", url);
}

function setRobots(noindex: boolean) {
  const content = noindex ? "noindex, nofollow" : "index, follow";
  setMeta("robots", content);
}

export function useSeoMeta(meta: SeoMeta) {
  useEffect(() => {
    const pageTitle = meta.title
      ? `${meta.title} | ${SITE_NAME}`
      : SITE_NAME;

    document.title = pageTitle;

    const description = meta.description || DEFAULT_DESCRIPTION;
    const ogTitle     = meta.ogTitle     || meta.title || SITE_NAME;
    const ogDesc      = meta.ogDescription || description;
    const ogImage     = meta.ogImage     || DEFAULT_OG_IMAGE;

    setMeta("description",       description);
    if (meta.keywords) setMeta("keywords", meta.keywords);
    else removeMeta("keywords");

    setMeta("og:type",        "website",    true);
    setMeta("og:site_name",   SITE_NAME,   true);
    setMeta("og:title",       ogTitle,     true);
    setMeta("og:description", ogDesc,      true);
    setMeta("og:image",       ogImage,     true);

    setMeta("twitter:card",        "summary_large_image");
    setMeta("twitter:title",       ogTitle);
    setMeta("twitter:description", ogDesc);
    setMeta("twitter:image",       ogImage);

    if (meta.canonicalUrl) setCanonical(meta.canonicalUrl);
    setRobots(meta.noindex ?? false);

    return () => {
      document.title = SITE_NAME;
    };
  }, [
    meta.title, meta.description, meta.keywords, meta.ogTitle,
    meta.ogDescription, meta.ogImage, meta.canonicalUrl, meta.noindex,
  ]);
}
