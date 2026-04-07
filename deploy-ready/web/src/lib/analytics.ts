const BASE     = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "");
const ENDPOINT = `${BASE}/api/track`;

function getVisitorId(): string {
  try {
    let vid = localStorage.getItem("swc_vid");
    if (!vid) { vid = crypto.randomUUID(); localStorage.setItem("swc_vid", vid); }
    return vid;
  } catch { return ""; }
}

function getSessionId(): string {
  try {
    let sid = sessionStorage.getItem("swc_sid");
    if (!sid) { sid = crypto.randomUUID(); sessionStorage.setItem("swc_sid", sid); }
    return sid;
  } catch { return ""; }
}

export interface TrackPayload {
  event_type: string;
  entity_type?: string;
  entity_slug?: string;
  event_label?: string;
  metadata?: Record<string, unknown>;
}

export function trackEvent(payload: TrackPayload): void {
  try {
    fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        visitor_id: getVisitorId(),
        session_id: getSessionId(),
        page_path: window.location.pathname,
        referrer: document.referrer || null,
      }),
      keepalive: true,
    }).catch(() => {});
  } catch { /* fire-and-forget, never throw */ }
}

const _viewedSlugs = new Set<string>();

export function trackArticleView(slug: string): void {
  const key = `article::${slug}`;
  if (_viewedSlugs.has(key)) return;
  _viewedSlugs.add(key);
  trackEvent({ event_type: "article_view", entity_type: "article", entity_slug: slug });
}

export function trackArticleClick(slug: string, label?: string): void {
  trackEvent({ event_type: "article_click", entity_type: "article", entity_slug: slug, event_label: label });
}

export function trackVideoClick(slug: string, label?: string): void {
  trackEvent({ event_type: "video_click", entity_type: "video", entity_slug: slug, event_label: label });
}

export function trackCtaClick(label: string, context?: string): void {
  trackEvent({ event_type: "cta_click", event_label: label, metadata: context ? { context } : undefined });
}

export function trackTopicClick(slug: string, label?: string): void {
  trackEvent({ event_type: "topic_click", entity_type: "topic", entity_slug: slug, event_label: label });
}

export function trackSeriesClick(slug: string, label?: string): void {
  trackEvent({ event_type: "series_click", entity_type: "series", entity_slug: slug, event_label: label });
}

export function trackHubClick(label: string): void {
  trackEvent({ event_type: "hub_click", event_label: label });
}
