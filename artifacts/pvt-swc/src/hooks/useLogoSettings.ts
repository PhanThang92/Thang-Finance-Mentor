import { useState, useEffect } from "react";

export interface LogoSettings {
  logoLightBg:   string;
  logoDarkBg:    string;
  logoAccent:    string;
  logoIcon:      string;
  logoWatermark: string;
  displayName:   string;
  desktopWidth:  number;
  mobileWidth:   number;
}

const DEFAULT: LogoSettings = {
  logoLightBg:   "",
  logoDarkBg:    "",
  logoAccent:    "",
  logoIcon:      "",
  logoWatermark: "",
  displayName:   "Thắng SWC",
  desktopWidth:  120,
  mobileWidth:   90,
};

let _cache: LogoSettings | null = null;
let _promise: Promise<LogoSettings> | null = null;

function fetchOnce(): Promise<LogoSettings> {
  if (_cache) return Promise.resolve(_cache);
  if (_promise) return _promise;
  _promise = fetch("/api/logo-settings")
    .then((r) => r.json() as Promise<{ settings: Record<string, string | null> }>)
    .then(({ settings: s }) => {
      const result: LogoSettings = {
        logoLightBg:   s["logo_light_bg"]    ?? "",
        logoDarkBg:    s["logo_dark_bg"]     ?? "",
        logoAccent:    s["logo_accent"]      ?? "",
        logoIcon:      s["logo_icon"]        ?? "",
        logoWatermark: s["logo_watermark"]   ?? "",
        displayName:   s["logo_display_name"] || "Thắng SWC",
        desktopWidth:  parseInt(s["logo_desktop_width"] ?? "120", 10) || 120,
        mobileWidth:   parseInt(s["logo_mobile_width"]  ?? "90",  10) || 90,
      };
      _cache = result;
      return result;
    })
    .catch(() => DEFAULT);
  return _promise;
}

export function invalidateLogoCache() {
  _cache = null;
  _promise = null;
}

export function useLogoSettings(): LogoSettings {
  const [logo, setLogo] = useState<LogoSettings>(_cache ?? DEFAULT);

  useEffect(() => {
    let alive = true;
    fetchOnce().then((s) => { if (alive) setLogo(s); });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    const iconUrl = logo.logoIcon;
    if (!iconUrl) return;
    let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = iconUrl;
  }, [logo.logoIcon]);

  return logo;
}
