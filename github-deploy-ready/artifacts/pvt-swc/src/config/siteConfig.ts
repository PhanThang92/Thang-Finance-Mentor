import type { SiteConfig } from "@/types/content";

/* ══════════════════════════════════════════════
   GLOBAL BRAND / SITE CONFIG
   Single source of truth for brand-level info.
   To update the YouTube URL or social links,
   change them here — not inside components.
══════════════════════════════════════════════ */

export const YOUTUBE_CHANNEL_URL = "https://youtube.com/@pvtswc";
export const FACEBOOK_URL        = "https://facebook.com/pvtswc";
export const CONTACT_EMAIL       = "lien-he@pvtswc.com";

export const siteConfig: SiteConfig = {
  brandName:    "Phan Văn Thắng SWC",
  brandTagline: "Tư duy tài chính đúng. Tích sản dài hạn. Đầu tư với góc nhìn thực chiến.",
  footerDescription:
    "Chia sẻ kiến thức tài chính, đầu tư và tư duy tích sản theo hướng thực tế, kỷ luật và dài hạn.",
  contactEmail:  CONTACT_EMAIL,
  youtubeUrl:    YOUTUBE_CHANNEL_URL,
  facebookUrl:   FACEBOOK_URL,
  disclaimer:
    "Nội dung trên website mang tính chia sẻ và tham khảo, không phải cam kết lợi nhuận hay lời khuyên tài chính cá nhân hóa.",
  defaultSeoTitle:
    "Phan Văn Thắng SWC — Tư duy tài chính và tích sản dài hạn",
  defaultSeoDescription:
    "Kiến thức tài chính, đầu tư dài hạn và tư duy tích sản theo hướng thực tế, kỷ luật và bền vững.",
};
