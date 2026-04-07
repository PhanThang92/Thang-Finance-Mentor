import React from "react";

/**
 * Renders clean HTML produced by TipTap editor.
 * Applies typography matching Prose.tsx visual tokens.
 *
 * Detection: use this when content starts with "<" (HTML format).
 * Use Prose.tsx for old markdown content.
 */

const ARTICLE_HTML_CSS = `
.article-html-body { font-family: 'Be Vietnam Pro', system-ui, sans-serif; }
.article-html-body > * + * { margin-top: 1.25em; }

.article-html-body p {
  font-size: clamp(15.5px, 1.55vw, 17px);
  line-height: 1.94;
  font-weight: 350;
  color: hsl(var(--foreground) / 0.70);
  letter-spacing: 0.003em;
  margin: 0 0 1.5rem;
}
.article-html-body p:last-child { margin-bottom: 0; }

.article-html-body h2 {
  font-size: clamp(1.1rem, 1.65vw, 1.28rem);
  font-weight: 680;
  line-height: 1.30;
  letter-spacing: -0.011em;
  color: hsl(var(--foreground) / 0.92);
  margin: 2.5rem 0 0.625rem;
  padding-top: 1.75rem;
  border-top: 1px solid hsl(var(--border) / 0.28);
}
.article-html-body h2:first-child {
  margin-top: 0;
  padding-top: 0;
  border-top: none;
}

.article-html-body h3 {
  font-size: clamp(1rem, 1.45vw, 1.1rem);
  font-weight: 620;
  line-height: 1.36;
  letter-spacing: -0.006em;
  color: hsl(var(--foreground) / 0.84);
  margin: 1.875rem 0 0.5rem;
}
.article-html-body h3:first-child { margin-top: 0; }

.article-html-body h4 {
  font-size: clamp(0.92rem, 1.3vw, 1.0rem);
  font-weight: 610;
  line-height: 1.40;
  letter-spacing: -0.004em;
  color: hsl(var(--foreground) / 0.80);
  margin: 1.5rem 0 0.375rem;
}
.article-html-body h4:first-child { margin-top: 0; }

.article-html-body strong {
  font-weight: 640;
  color: hsl(var(--foreground) / 0.86);
  letter-spacing: -0.003em;
}

.article-html-body em {
  font-style: italic;
  color: hsl(var(--foreground) / 0.72);
}

.article-html-body u {
  text-decoration-color: hsl(var(--primary) / 0.50);
  text-underline-offset: 3px;
}

.article-html-body a {
  color: hsl(var(--primary));
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-color: hsl(var(--primary) / 0.40);
  transition: color 0.15s ease, text-decoration-color 0.15s ease;
}
.article-html-body a:hover {
  color: hsl(var(--primary) / 0.80);
  text-decoration-color: hsl(var(--primary) / 0.60);
}

.article-html-body code {
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.875em;
  background: hsl(var(--muted));
  padding: 2px 6px;
  border-radius: 4px;
  color: hsl(var(--foreground) / 0.88);
}

.article-html-body pre {
  background: hsl(var(--muted));
  padding: 1rem 1.25rem;
  border-radius: 8px;
  overflow-x: auto;
  border: 1px solid hsl(var(--border) / 0.45);
  margin: 1.5rem 0;
}
.article-html-body pre code {
  background: none;
  padding: 0;
  font-size: 0.845em;
  color: hsl(var(--foreground) / 0.88);
}

.article-html-body blockquote {
  margin: 1.875rem 0;
  padding: 0.875rem 1.5rem 0.875rem 1.375rem;
  border-left: 2.5px solid hsl(var(--primary) / 0.36);
  background: hsl(var(--primary) / 0.024);
  border-radius: 0 6px 6px 0;
}
.article-html-body blockquote p {
  font-size: clamp(15px, 1.5vw, 16.5px);
  line-height: 1.90;
  font-weight: 350;
  color: hsl(var(--foreground) / 0.60);
  font-style: italic;
  margin: 0;
  letter-spacing: 0.003em;
}

.article-html-body ul {
  margin: 1.125rem 0 1.625rem;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.article-html-body ul li {
  display: flex;
  gap: 0.875rem;
  align-items: flex-start;
}
.article-html-body ul li::before {
  content: '';
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: hsl(var(--primary) / 0.45);
  flex-shrink: 0;
  margin-top: 0.65em;
}
.article-html-body ul li p {
  font-size: clamp(15px, 1.5vw, 16.5px);
  line-height: 1.88;
  font-weight: 350;
  color: hsl(var(--foreground) / 0.70);
  letter-spacing: 0.003em;
  margin: 0;
}

.article-html-body ol {
  margin: 1.125rem 0 1.625rem;
  padding: 0;
  list-style: none;
  counter-reset: article-ol;
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}
.article-html-body ol li {
  display: flex;
  gap: 0.875rem;
  align-items: flex-start;
  counter-increment: article-ol;
}
.article-html-body ol li::before {
  content: counter(article-ol);
  min-width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10.5px;
  font-weight: 650;
  color: hsl(var(--primary) / 0.85);
  background: hsl(var(--primary) / 0.07);
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 0.24em;
}
.article-html-body ol li p {
  font-size: clamp(15px, 1.5vw, 16.5px);
  line-height: 1.88;
  font-weight: 350;
  color: hsl(var(--foreground) / 0.70);
  letter-spacing: 0.003em;
  margin: 0;
}

.article-html-body hr {
  border: none;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  margin: 2.5rem 0;
  position: relative;
}
.article-html-body hr::before,
.article-html-body hr::after {
  content: '';
  flex: 1;
  height: 1px;
  background: hsl(var(--border) / 0.28);
}
`;

let cssInjected = false;
function injectCss() {
  if (cssInjected || typeof document === "undefined") return;
  cssInjected = true;
  const existing = document.getElementById("article-html-styles");
  if (existing) return;
  const style = document.createElement("style");
  style.id = "article-html-styles";
  style.textContent = ARTICLE_HTML_CSS;
  document.head.appendChild(style);
}

interface ArticleHtmlProps {
  content: string;
}

export function ArticleHtml({ content }: ArticleHtmlProps) {
  injectCss();

  if (!content?.trim()) return null;

  return (
    <div
      className="article-html-body"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}

/**
 * Returns true if content is HTML (from TipTap).
 * Returns false if content is markdown (from old textarea).
 */
export function isHtmlContent(content: string | null | undefined): boolean {
  if (!content) return false;
  const trimmed = content.trimStart();
  return trimmed.startsWith("<");
}
