/* ResourceBlock — compact embeddable component for featuring a resource
   on article pages, video pages, or the homepage.

   Usage:
     <ResourceBlock slug="checklist-dau-tu-dai-han" section="article-footer" />
     <ResourceBlock resource={myResource} />
*/

import React, { useEffect, useState } from "react";
import { Link } from "wouter";
import { resourcesApi, type LeadMagnet } from "@/lib/newsApi";

const PRIMARY = "#0f766e";
const TEAL_BG = "#f0faf8";

interface Props {
  slug?:     string;
  resource?: LeadMagnet;
  section?:  string;
  compact?:  boolean;
}

export function ResourceBlock({ slug, resource: propResource, section = "inline", compact = false }: Props) {
  const [resource, setResource] = useState<LeadMagnet | null>(propResource ?? null);
  const [loading,  setLoading]  = useState(!propResource && !!slug);

  useEffect(() => {
    if (!slug || propResource) return;
    resourcesApi.getResource(slug)
      .then(setResource)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug, propResource]);

  if (loading) return null;
  if (!resource) return null;

  const btnLabel = resource.buttonLabel || "Nhận tài liệu";

  if (compact) {
    return (
      <Link href={`/tai-lieu/${resource.slug}`} style={{ textDecoration: "none" }}>
        <div
          style={{
            display: "flex",
            gap: "14px",
            alignItems: "center",
            background: TEAL_BG,
            border: `1px solid rgba(15,118,110,0.15)`,
            borderRadius: "10px",
            padding: "14px 18px",
            cursor: "pointer",
          }}
        >
          {resource.coverImageUrl ? (
            <img
              src={resource.coverImageUrl}
              alt={resource.coverImageAlt ?? resource.title}
              style={{ width: "52px", height: "52px", objectFit: "cover", borderRadius: "6px", flexShrink: 0 }}
            />
          ) : (
            <div
              style={{
                width: "52px", height: "52px", borderRadius: "6px",
                background: PRIMARY, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "22px", opacity: 0.55,
              }}
            >
              ⊙
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: "0 0 3px", fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: PRIMARY }}>
              Tài liệu miễn phí
            </p>
            <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#1a1a1a", lineHeight: 1.35, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {resource.title}
            </p>
          </div>
          <span style={{ fontSize: "13px", fontWeight: 600, color: PRIMARY, flexShrink: 0 }}>
            {btnLabel} →
          </span>
        </div>
      </Link>
    );
  }

  return (
    <div
      style={{
        background: "#ffffff",
        border: `1px solid rgba(15,118,110,0.13)`,
        borderRadius: "14px",
        overflow: "hidden",
        boxShadow: "0 2px 20px rgba(15,118,110,0.07)",
      }}
    >
      {resource.coverImageUrl && (
        <div style={{ height: "180px", overflow: "hidden" }}>
          <img
            src={resource.coverImageUrl}
            alt={resource.coverImageAlt ?? resource.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      )}
      <div
        style={{
          padding: "24px 26px",
          background: TEAL_BG,
          borderTop: `1px solid rgba(15,118,110,0.1)`,
        }}
      >
        <p style={{ margin: "0 0 4px", fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: PRIMARY }}>
          Tài liệu miễn phí
        </p>
        <h3 style={{ margin: "0 0 8px", fontSize: "18px", fontWeight: 800, color: "#1a1a1a", lineHeight: 1.3, letterSpacing: "-0.01em" }}>
          {resource.title}
        </h3>
        {resource.ctaDescription || resource.shortDescription ? (
          <p style={{ margin: "0 0 18px", fontSize: "14px", color: "rgba(0,0,0,0.6)", lineHeight: 1.7 }}>
            {resource.ctaDescription ?? resource.shortDescription}
          </p>
        ) : null}
        <Link
          href={`/tai-lieu/${resource.slug}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "7px",
            padding: "11px 22px",
            borderRadius: "8px",
            background: PRIMARY,
            color: "#ffffff",
            textDecoration: "none",
            fontSize: "14px",
            fontWeight: 700,
          }}
        >
          {btnLabel}
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
