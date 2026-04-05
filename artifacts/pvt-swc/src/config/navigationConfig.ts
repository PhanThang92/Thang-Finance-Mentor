import type { NavItemConfig, FooterLinkItem } from "@/types/content";

/* ══════════════════════════════════════════════
   NAVIGATION CONFIG
   Defines all nav structure in one place.
   Navbar.tsx and Footer.tsx read from here.
   Paths are relative (no base URL prefix).
══════════════════════════════════════════════ */

/** Primary navbar items. Paths are relative and prefix-free.
 *  The Navbar component applies homeBase and special-case home anchors. */
export const NAV_ITEMS: NavItemConfig[] = [
  { name: "Trang chủ",  path: "/" },
  { name: "Giới thiệu", path: "/gioi-thieu" },
  {
    name:        "Kiến thức",
    dropdownKey: "kien-thuc",
    items: [
      { name: "Bài viết",       desc: "Những bài chia sẻ và phân tích chuyên sâu",  path: "/bai-viet" },
      { name: "Video",          desc: "Thư viện video từ kênh YouTube",              path: "/video"    },
      { name: "Chủ đề",         desc: "Khám phá nội dung theo từng nhóm kiến thức", path: "/chu-de"   },
      { name: "Series nổi bật", desc: "Theo dõi các chuỗi nội dung chính",          path: "/series"   },
    ],
  },
  { name: "Tin tức",   path: "/tin-tuc"   },
  { name: "Cộng đồng", path: "/cong-dong" },
  {
    name:        "Sản phẩm",
    dropdownKey: "san-pham",
    items: [
      { name: "SWC Pass",                desc: "Cổng truy cập vào hệ sinh thái SWC",      path: "/san-pham/swc-pass"             },
      { name: "Road to $1M · SWC PASS", desc: "Lộ trình tài chính cá nhân có hệ thống",  path: "/san-pham/duong-toi-1-trieu-do" },
      { name: "ATLAS",                   desc: "Hệ sinh thái bất động sản kỹ thuật số",   path: "/san-pham/atlas"                },
    ],
  },
  { name: "Liên hệ", path: "/lien-he" },
];

/** Footer — main nav column (top-level pages). */
export const FOOTER_NAV_LINKS: FooterLinkItem[] = [
  { name: "Trang chủ",  href: "/"          },
  { name: "Giới thiệu", href: "/gioi-thieu" },
  { name: "Kiến thức",  href: "/kien-thuc"  },
  { name: "Tin tức",    href: "/tin-tuc"    },
  { name: "Cộng đồng",  href: "/cong-dong"  },
  { name: "Liên hệ",    href: "/lien-he"   },
];

/** Footer — Kiến thức sub-links column. */
export const FOOTER_KIEN_THUC_LINKS: FooterLinkItem[] = [
  { name: "Bài viết",       href: "/bai-viet" },
  { name: "Video",          href: "/video"     },
  { name: "Chủ đề",         href: "/chu-de"    },
  { name: "Series nổi bật", href: "/series"    },
];

/**
 * Footer — Hệ sinh thái column.
 * Routes marked (* placeholder) do not yet have dedicated pages
 * and will redirect or use stub pages until fully built.
 */
export const FOOTER_HE_SINH_THAI_LINKS: FooterLinkItem[] = [
  { name: "SWC Pass",              href: "/san-pham/swc-pass"             },
  { name: "SWC Field",             href: "/he-sinh-thai/swc-field"        }, // placeholder
  { name: "Con đường 1 triệu đô",  href: "/san-pham/duong-toi-1-trieu-do" },
  { name: "Cộng đồng SWC",         href: "/cong-dong"                     },
];

/** Footer — Product links column (legacy, kept for reference). */
export const FOOTER_PRODUCT_LINKS: FooterLinkItem[] = [
  { name: "Road to $1M · SWC PASS", href: "/san-pham/duong-toi-1-trieu-do" },
  { name: "ATLAS",                   href: "/san-pham/atlas"                },
];

/** Active-index mapping: nav array index → location prefix.
 *  Used by Navbar for highlighted active state.
 *  Index 0 = Trang chủ (handled separately), 6 = Liên hệ (no active state).
 */
export const NAV_ACTIVE_MAP: Record<number, string> = {
  1: "/gioi-thieu",
  2: "/kien-thuc",     // also matches /bai-viet /video /chu-de /series
  3: "/tin-tuc",
  4: "/cong-dong",
  5: "/san-pham",
  6: "/lien-he",
};

/** Paths that make "Kiến thức" the active nav item. */
export const KIEN_THUC_PATHS = [
  "/kien-thuc",
  "/bai-viet",
  "/video",
  "/chu-de",
  "/series",
];
