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

/* ── Icons (inline SVG, no external dep) ─────────────────────────── */
function PhoneIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" fill="currentColor"/>
    </svg>
  );
}

function ZaloIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect width="24" height="24" rx="5" fill="currentColor" fillOpacity="0.12"/>
      <text x="12" y="16.5" textAnchor="middle" fontSize="9" fontWeight="800" fill="currentColor" fontFamily="sans-serif">Zalo</text>
    </svg>
  );
}

function TelegramIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8l-1.7 7.98c-.12.56-.46.7-.93.43l-2.57-1.9-1.24 1.19c-.14.13-.26.24-.52.24l.18-2.6 4.7-4.25c.2-.18-.04-.28-.32-.1L7.15 14.3l-2.52-.79c-.55-.17-.56-.55.11-.81l9.83-3.79c.46-.16.86.11.71.81l-.64-.02z" fill="currentColor"/>
    </svg>
  );
}

function MessageIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" fill="currentColor"/>
    </svg>
  );
}

function CloseIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
    </svg>
  );
}

function ChannelIcon({ type, size = 16 }: { type: string; size?: number }) {
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

/* ── CSS keyframe style tag ───────────────────────────────────────── */
const WIDGET_STYLE = `
@keyframes fcw-pop-in {
  from { opacity: 0; transform: scale(0.88) translateY(6px); }
  to   { opacity: 1; transform: scale(1)    translateY(0);   }
}
@keyframes fcw-item-in {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0);   }
}
.fcw-item { animation: fcw-item-in 0.22s cubic-bezier(0.16,1,0.3,1) both; }
`;

/* ── Component ────────────────────────────────────────────────────── */
export function FloatingContactWidget() {
  const [data,    setData]    = useState<WidgetData | null>(null);
  const [isOpen,  setIsOpen]  = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  /* Detect mobile */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  /* Fetch widget data from API */
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

  /* Don't render if data isn't loaded, widget disabled, or no channels */
  if (!data || !data.enabled || !data.settings || data.channels.length === 0) return null;

  const { settings, channels } = data;

  /* Device visibility */
  if (isMobile  && !settings.showOnMobile)  return null;
  if (!isMobile && !settings.showOnDesktop) return null;

  /* Offset from edges */
  const rOffset = isMobile ? settings.mobileOffsetX : settings.desktopOffsetX;
  const bOffset = isMobile ? settings.mobileOffsetY : settings.desktopOffsetY;

  /* Filter channels for current device */
  const visibleChannels = channels.filter((ch) =>
    isMobile ? ch.showOnMobile : ch.showOnDesktop
  );
  if (visibleChannels.length === 0) return null;

  /* Channel accent colors */
  const CHANNEL_COLORS: Record<string, string> = {
    phone:    "#1a7868",
    zalo:     "#0068ff",
    telegram: "#229ED9",
  };

  return (
    <>
      <style>{WIDGET_STYLE}</style>
      <div
        ref={containerRef}
        style={{
          position:     "fixed",
          right:        `${rOffset}px`,
          bottom:       `${bOffset}px`,
          zIndex:       9999,
          display:      "flex",
          flexDirection: "column",
          alignItems:   "flex-end",
          gap:          "10px",
          pointerEvents: "none",
        }}
      >

        {/* ── Channel items (expanded) ─────────────────────────────── */}
        {isOpen && (
          <div
            style={{
              display:       "flex",
              flexDirection: "column",
              alignItems:    "flex-end",
              gap:           "8px",
              pointerEvents: "auto",
            }}
          >
            {visibleChannels.map((ch, i) => {
              const color = CHANNEL_COLORS[ch.channelType] ?? "#1a7868";
              const href  = buildHref(ch);
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
                    animationDelay:  `${i * 55}ms`,
                    display:         "flex",
                    alignItems:      "center",
                    gap:             "10px",
                    height:          "42px",
                    padding:         settings.showLabels ? "0 14px 0 12px" : "0 13px",
                    borderRadius:    "999px",
                    background:      "#fff",
                    border:          "1px solid rgba(0,0,0,0.08)",
                    boxShadow:       "0 2px 12px rgba(0,0,0,0.10), 0 1px 3px rgba(0,0,0,0.06)",
                    textDecoration:  "none",
                    color:           color,
                    fontSize:        "13px",
                    fontWeight:      500,
                    letterSpacing:   "0.010em",
                    whiteSpace:      "nowrap",
                    transition:      "transform 0.16s ease, box-shadow 0.16s ease",
                    fontFamily:      "'Be Vietnam Pro', sans-serif",
                    cursor:          "pointer",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.transform  = "translateX(-3px)";
                    el.style.boxShadow  = `0 4px 18px rgba(0,0,0,0.14), 0 2px 6px rgba(0,0,0,0.08)`;
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.transform  = "translateX(0)";
                    el.style.boxShadow  = "0 2px 12px rgba(0,0,0,0.10), 0 1px 3px rgba(0,0,0,0.06)";
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
                  {/* Color dot */}
                  <span style={{
                    width:        "28px",
                    height:       "28px",
                    borderRadius: "50%",
                    background:   color,
                    display:      "flex",
                    alignItems:   "center",
                    justifyContent: "center",
                    flexShrink:   0,
                    color:        "#fff",
                  }}>
                    <ChannelIcon type={ch.channelType} size={14} />
                  </span>

                  {settings.showLabels && (
                    <span style={{ color: "#1c2b28" }}>{ch.label}</span>
                  )}
                </a>
              );
            })}
          </div>
        )}

        {/* ── Main bubble ─────────────────────────────────────────── */}
        <button
          onClick={toggle}
          aria-label={isOpen ? "Đóng liên hệ nhanh" : "Mở liên hệ nhanh"}
          aria-expanded={isOpen}
          style={{
            pointerEvents:  "auto",
            width:           "52px",
            height:          "52px",
            borderRadius:    "50%",
            border:          "none",
            cursor:          "pointer",
            display:         "flex",
            alignItems:      "center",
            justifyContent:  "center",
            background:      isOpen
              ? "hsl(var(--primary) / 0.88)"
              : "hsl(var(--primary))",
            color:            "#fff",
            boxShadow:        isOpen
              ? "0 4px 16px rgba(10,40,35,0.24), 0 2px 6px rgba(10,40,35,0.16)"
              : "0 4px 20px rgba(10,40,35,0.28), 0 2px 8px rgba(10,40,35,0.16)",
            transition:       "transform 0.22s cubic-bezier(0.34,1.56,0.64,1), background 0.22s ease, box-shadow 0.22s ease",
            transform:        isOpen ? "rotate(0deg) scale(0.94)" : "rotate(0deg) scale(1)",
            outline:          "none",
            flexShrink:       0,
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.transform = isOpen ? "scale(0.92)" : "scale(1.06)";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.transform = isOpen ? "scale(0.94)" : "scale(1)";
          }}
        >
          {isOpen
            ? <CloseIcon size={15} />
            : <MessageIcon size={18} />
          }
        </button>

      </div>
    </>
  );
}
