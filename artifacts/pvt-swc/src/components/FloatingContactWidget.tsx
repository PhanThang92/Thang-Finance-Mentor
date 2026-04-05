import React, { useEffect, useRef, useState, useCallback } from "react";

/* ── Types ────────────────────────────────────────────────────────── */
interface WidgetSettings {
  isEnabled: boolean;
  showLabels: boolean;
  showTooltips: boolean;
  desktopOffsetX: number;
  desktopOffsetY: number;
  mobileOffsetX: number;
  mobileOffsetY: number;
  showOnDesktop: boolean;
  showOnMobile: boolean;
}

interface ContactChannel {
  id: number;
  channelType: string;
  label: string;
  value: string;
  iconKey: string | null;
  tooltipText: string | null;
  isEnabled: boolean;
  displayOrder: number;
  openMode: string;
  showOnDesktop: boolean;
  showOnMobile: boolean;
}

interface WidgetData {
  enabled: boolean;
  settings: WidgetSettings | null;
  channels: ContactChannel[];
}

/* ── Icons (inline SVG) ───────────────────────────────────────────── */
function PhoneIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" fill="currentColor"/>
    </svg>
  );
}

function ZaloIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <text x="12" y="16" textAnchor="middle" fontSize="10" fontWeight="700" fill="currentColor" fontFamily="'Be Vietnam Pro',sans-serif">Z</text>
    </svg>
  );
}

function TelegramIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M21.4 3.2L2.6 10.5c-1.3.5-1.3 1.3-.2 1.6l4.8 1.5 1.9 5.7c.3.8.4 1.1 1 1.1s.8-.3 1.2-.7l2.7-2.6 5.2 3.8c1 .5 1.6.3 1.9-.9l3.4-16c.4-1.5-.6-2.2-1.7-1.8zM18.3 7L8.6 15.8l-.4 3.9-2.5-7.5L18.3 7z" fill="currentColor"/>
    </svg>
  );
}

function MessageIcon({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function ChannelIcon({ type, size = 15 }: { type: string; size?: number }) {
  if (type === "phone")    return <PhoneIcon size={size} />;
  if (type === "zalo")     return <ZaloIcon size={size} />;
  if (type === "telegram") return <TelegramIcon size={size} />;
  return <PhoneIcon size={size} />;
}

/* ── Build href for a channel ─────────────────────────────────────── */
function buildHref(channel: ContactChannel): string {
  if (channel.openMode === "tel") return `tel:${channel.value.replace(/\s/g, "")}`;
  return channel.value;
}

/* ── Track helper ─────────────────────────────────────────────────── */
function trackEvent(eventType: string, meta: Record<string, unknown> = {}) {
  try {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_type:  eventType,
        entity_type: "contact_widget",
        page_path:   window.location.pathname,
        metadata:    {
          source_path: window.location.pathname,
          device_type: window.innerWidth < 768 ? "mobile" : "desktop",
          ...meta,
        },
      }),
    }).catch(() => {});
  } catch { /* silently ignore */ }
}

/* ── Keyframe styles ──────────────────────────────────────────────── */
const WIDGET_STYLE = `
@keyframes fcw-item-in {
  from { opacity: 0; transform: translateY(6px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0)   scale(1);    }
}
.fcw-item {
  animation: fcw-item-in 0.20s cubic-bezier(0.16,1,0.3,1) both;
}
.fcw-item:hover {
  transform: translateX(-3px) !important;
}
`;

/* ── Component ────────────────────────────────────────────────────── */
export function FloatingContactWidget() {
  const [data,     setData]    = useState<WidgetData | null>(null);
  const [isOpen,   setIsOpen]  = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  /* Detect mobile */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  /* Fetch widget data */
  useEffect(() => {
    fetch("/api/contact/widget")
      .then((r) => r.ok ? r.json() : null)
      .then((d: WidgetData | null) => setData(d))
      .catch(() => {});
  }, []);

  /* ESC to close */
  useEffect(() => {
    if (!isOpen) return;
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") setIsOpen(false); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [isOpen]);

  /* Click-outside to close */
  useEffect(() => {
    if (!isOpen) return;
    const fn = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [isOpen]);

  const toggle = useCallback(() => {
    setIsOpen((prev) => {
      const next = !prev;
      trackEvent(next ? "contact_widget_open" : "contact_widget_close");
      return next;
    });
  }, []);

  if (!data || !data.enabled || !data.settings || data.channels.length === 0) return null;

  const { settings, channels } = data;

  if (isMobile  && !settings.showOnMobile)  return null;
  if (!isMobile && !settings.showOnDesktop) return null;

  /* Add a fixed extra breathing-room offset (8px) on top of the configured offset */
  const EXTRA = 8;
  const rOffset = (isMobile ? settings.mobileOffsetX : settings.desktopOffsetX) + EXTRA;
  const bOffset = (isMobile ? settings.mobileOffsetY : settings.desktopOffsetY) + EXTRA;

  const visibleChannels = channels.filter((ch) =>
    isMobile ? ch.showOnMobile : ch.showOnDesktop
  );
  if (visibleChannels.length === 0) return null;

  /* Per-channel accent color */
  const CHANNEL_COLORS: Record<string, string> = {
    phone:    "#1a7868",
    zalo:     "#0068ff",
    telegram: "#229ED9",
  };

  /* Shared off-white surface token */
  const SURFACE   = "#f4f3f1";          // warm off-white, noticeably softer than pure white
  const BORDER    = "rgba(0,0,0,0.055)"; // very soft edge
  const SHADOW    = "0 2px 10px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04)";
  const SHADOW_HV = "0 4px 16px rgba(0,0,0,0.11), 0 2px 5px rgba(0,0,0,0.06)";

  return (
    <>
      <style>{WIDGET_STYLE}</style>
      <div
        ref={containerRef}
        style={{
          position:      "fixed",
          right:         `${rOffset}px`,
          bottom:        `${bOffset}px`,
          zIndex:        9999,
          display:       "flex",
          flexDirection: "column",
          alignItems:    "flex-end",
          gap:           "8px",
          pointerEvents: "none",
        }}
      >

        {/* ── Expanded channel list ─────────────────────────────────── */}
        {isOpen && (
          <div
            style={{
              display:       "flex",
              flexDirection: "column",
              alignItems:    "flex-end",
              gap:           "7px",
              pointerEvents: "auto",
            }}
          >
            {visibleChannels.map((ch, i) => {
              const color    = CHANNEL_COLORS[ch.channelType] ?? "#1a7868";
              const href     = buildHref(ch);
              const isNewTab = ch.openMode === "new_tab";

              return (
                <a
                  key={ch.id}
                  href={href}
                  target={isNewTab ? "_blank" : undefined}
                  rel={isNewTab ? "noopener noreferrer" : undefined}
                  aria-label={ch.label}
                  title={settings.showTooltips && ch.tooltipText ? ch.tooltipText : undefined}
                  className="fcw-item"
                  style={{
                    animationDelay:  `${i * 50}ms`,
                    display:         "flex",
                    alignItems:      "center",
                    /* gap slightly tighter than before */
                    gap:             "8px",
                    /* ~13% shorter than original 42px */
                    height:          "37px",
                    padding:         settings.showLabels ? "0 12px 0 9px" : "0 10px",
                    borderRadius:    "999px",
                    background:      SURFACE,
                    border:          `1px solid ${BORDER}`,
                    boxShadow:       SHADOW,
                    textDecoration:  "none",
                    color:           "#1c2b28",
                    /* calmer typography */
                    fontSize:        "12.5px",
                    fontWeight:      400,
                    letterSpacing:   "0.005em",
                    whiteSpace:      "nowrap",
                    transition:      "transform 0.18s ease, box-shadow 0.18s ease",
                    fontFamily:      "'Be Vietnam Pro', sans-serif",
                    cursor:          "pointer",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.boxShadow = SHADOW_HV;
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.boxShadow = SHADOW;
                  }}
                  onClick={() => {
                    trackEvent("contact_channel_click", {
                      channel_type: ch.channelType,
                      channel_id:   ch.id,
                      label:        ch.label,
                    });
                    setIsOpen(false);
                  }}
                >
                  {/*
                    Unified icon container — identical size/shape for all 3 channels.
                    24×24 circle, same border-radius, no channel-specific quirks.
                  */}
                  <span style={{
                    width:          "24px",
                    height:         "24px",
                    borderRadius:   "50%",
                    background:     color,
                    display:        "flex",
                    alignItems:     "center",
                    justifyContent: "center",
                    flexShrink:     0,
                    color:          "#fff",
                  }}>
                    <ChannelIcon type={ch.channelType} size={13} />
                  </span>

                  {settings.showLabels && (
                    <span style={{ color: "#2a3d38" }}>{ch.label}</span>
                  )}
                </a>
              );
            })}
          </div>
        )}

        {/* ── Main trigger bubble ───────────────────────────────────── */}
        {/*
          The icon transforms in-place: MessageIcon → rotated × via CSS rotate.
          The button stays the same surface, slightly smaller (48px → was 52px).
          No separate "close" object — the same bubble changes state.
        */}
        <button
          onClick={toggle}
          aria-label={isOpen ? "Đóng liên hệ nhanh" : "Mở liên hệ nhanh"}
          aria-expanded={isOpen}
          style={{
            pointerEvents:   "auto",
            width:           "48px",
            height:          "48px",
            borderRadius:    "50%",
            border:          "none",
            cursor:          "pointer",
            display:         "flex",
            alignItems:      "center",
            justifyContent:  "center",
            background:      "hsl(var(--primary))",
            color:           "#fff",
            /* Softer shadow — less heavy than before */
            boxShadow:       "0 3px 14px rgba(10,40,35,0.22), 0 1px 5px rgba(10,40,35,0.12)",
            /* Icon rotates 135° when open — transforms into an implied × without switching component */
            transition:      "transform 0.26s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.22s ease",
            transform:       isOpen ? "rotate(135deg)" : "rotate(0deg)",
            outline:         "none",
            flexShrink:      0,
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.boxShadow = "0 5px 18px rgba(10,40,35,0.28), 0 2px 6px rgba(10,40,35,0.16)";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.boxShadow = "0 3px 14px rgba(10,40,35,0.22), 0 1px 5px rgba(10,40,35,0.12)";
          }}
        >
          {/* Always show the message icon — rotation handles the open/close visual */}
          <MessageIcon size={17} />
        </button>

      </div>
    </>
  );
}
