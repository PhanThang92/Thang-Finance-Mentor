import { useState, useEffect } from "react";

export interface SiteSettings {
  brandName: string;
  brandTagline: string;
  brandDescription: string;
  brandSubTitle: string;

  contactEmail: string;
  contactEmailCollab: string;
  contactEmailNewsletter: string;
  contactEmailNoreply: string;
  contactPhone: string;
  contactAddress: string;
  contactCity: string;

  youtubeUrl: string;
  facebookUrl: string;
  zaloUrl: string;
  telegramUrl: string;
  tiktokUrl: string;
  linkedinUrl: string;
  communityUrl: string;

  footerTagline: string;
  footerDescription: string;
  footerDisclaimer: string;
  footerCopyright: string;
  footerCompanyName: string;
  footerShowCommunityCta: boolean;
  footerShowAddress: boolean;

  seoTitle: string;
  seoDescription: string;
  ogImage: string;
  canonicalUrl: string;
  ogSiteName: string;
}

export const SITE_SETTINGS_DEFAULT: SiteSettings = {
  brandName: "Phan Văn Thắng SWC",
  brandTagline: "Tư duy tài chính đúng. Tích sản dài hạn. Đầu tư với góc nhìn thực chiến.",
  brandDescription:
    "Chia sẻ kiến thức tài chính, đầu tư và tư duy tích sản theo hướng thực tế, kỷ luật và dài hạn.",
  brandSubTitle: "Thuộc hệ sinh thái Sky World Community",

  contactEmail: "lienhe@phanvanthang.net",
  contactEmailCollab: "hello@phanvanthang.net",
  contactEmailNewsletter: "newsletter@phanvanthang.net",
  contactEmailNoreply: "no-reply@phanvanthang.net",
  contactPhone: "",
  contactAddress: "",
  contactCity: "Hà Nội, Việt Nam",

  youtubeUrl: "https://youtube.com/@pvtswc",
  facebookUrl: "https://facebook.com/pvtswc",
  zaloUrl: "",
  telegramUrl: "",
  tiktokUrl: "",
  linkedinUrl: "",
  communityUrl: "",

  footerTagline: "Tư duy tài chính đúng. Tích sản dài hạn. Đầu tư với góc nhìn thực chiến.",
  footerDescription:
    "Chia sẻ kiến thức tài chính, đầu tư và tư duy tích sản theo hướng thực tế, kỷ luật và dài hạn.",
  footerDisclaimer:
    "Nội dung trên website mang tính chia sẻ và tham khảo, không phải cam kết lợi nhuận hay lời khuyên tài chính cá nhân hóa.",
  footerCopyright: "",
  footerCompanyName: "Phan Văn Thắng SWC",
  footerShowCommunityCta: true,
  footerShowAddress: true,

  seoTitle: "Phan Văn Thắng SWC — Tư duy tài chính và tích sản dài hạn",
  seoDescription:
    "Kiến thức tài chính, đầu tư dài hạn và tư duy tích sản theo hướng thực tế, kỷ luật và bền vững.",
  ogImage: "",
  canonicalUrl: "",
  ogSiteName: "Phan Văn Thắng SWC",
};

let _cache: SiteSettings | null = null;
let _promise: Promise<SiteSettings> | null = null;

function fetchOnce(): Promise<SiteSettings> {
  if (_cache) return Promise.resolve(_cache);
  if (_promise) return _promise;
  _promise = fetch("/api/site-settings")
    .then((r) => r.json() as Promise<{ settings: Record<string, string | null> }>)
    .then(({ settings: s }) => {
      const D = SITE_SETTINGS_DEFAULT;
      const result: SiteSettings = {
        brandName: s["logo_brand_name"] || D.brandName,
        brandTagline: s["brand_tagline"] || s["footer_tagline"] || D.brandTagline,
        brandDescription: s["brand_description"] || D.brandDescription,
        brandSubTitle: s["brand_sub_title"] || D.brandSubTitle,

        contactEmail: s["contact_email"] || s["social_email"] || D.contactEmail,
        contactEmailCollab: s["contact_email_collab"] || D.contactEmailCollab,
        contactEmailNewsletter: s["contact_email_newsletter"] || D.contactEmailNewsletter,
        contactEmailNoreply: s["contact_email_noreply"] || D.contactEmailNoreply,
        contactPhone: s["contact_phone"] ?? "",
        contactAddress: s["contact_address"] ?? "",
        contactCity: s["contact_city"] || D.contactCity,

        youtubeUrl: s["social_youtube"] || D.youtubeUrl,
        facebookUrl: s["social_facebook"] || D.facebookUrl,
        zaloUrl: s["social_zalo"] ?? "",
        telegramUrl: s["social_telegram"] ?? "",
        tiktokUrl: s["social_tiktok"] ?? "",
        linkedinUrl: s["social_linkedin"] ?? "",
        communityUrl: s["social_community"] ?? "",

        footerTagline: s["brand_tagline"] || s["footer_tagline"] || D.brandTagline,
        footerDescription: s["brand_description"] || D.brandDescription,
        footerDisclaimer: s["footer_disclaimer"] || D.footerDisclaimer,
        footerCopyright: s["footer_copyright"] ?? "",
        footerCompanyName:
          s["footer_company_name"] || s["logo_brand_name"] || D.brandName,
        footerShowCommunityCta: s["footer_show_community_cta"] !== "false",
        footerShowAddress: s["footer_show_address"] !== "false",

        seoTitle: s["site_seo_title"] || D.seoTitle,
        seoDescription: s["site_seo_description"] || D.seoDescription,
        ogImage: s["site_seo_og_image"] ?? "",
        canonicalUrl: s["site_canonical_url"] ?? "",
        ogSiteName: s["site_og_site_name"] || D.brandName,
      };
      _cache = result;
      return result;
    })
    .catch(() => SITE_SETTINGS_DEFAULT);
  return _promise;
}

export function invalidateSiteSettingsCache() {
  _cache = null;
  _promise = null;
}

export function useSiteSettings(): SiteSettings {
  const [settings, setSettings] = useState<SiteSettings>(_cache ?? SITE_SETTINGS_DEFAULT);

  useEffect(() => {
    let alive = true;
    fetchOnce().then((s) => { if (alive) setSettings(s); });
    return () => { alive = false; };
  }, []);

  return settings;
}
