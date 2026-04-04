import React from "react";
import { Mail, Users } from "lucide-react";
import { SiYoutube, SiFacebook } from "react-icons/si";

const navLinks = [
  { name: "Trang chủ", href: "#trang-chu" },
  { name: "Giới thiệu", href: "#gioi-thieu" },
  { name: "Nội dung", href: "#noi-dung" },
  { name: "Tin tức", href: "/tin-tuc" },
  { name: "Cộng đồng", href: "/cong-dong" },
  { name: "Liên hệ", href: "#lien-he" },
];

const productLinks = [
  { name: "Road to $1M · SWC PASS", href: "/san-pham/duong-toi-1-trieu-do" },
  { name: "ATLAS", href: "/san-pham/atlas" },
];

const socials = [
  { icon: SiYoutube, href: "#", ariaLabel: "YouTube" },
  { icon: SiFacebook, href: "#", ariaLabel: "Facebook" },
];

const iconButtonBase: React.CSSProperties = {
  width: "34px",
  height: "34px",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(255,255,255,0.055)",
  border: "1px solid rgba(255,255,255,0.09)",
  transition: "background 0.22s ease, border-color 0.22s ease",
  flexShrink: 0,
};

export function Footer() {
  return (
    <footer
      className="relative text-white overflow-hidden"
      style={{ background: "linear-gradient(180deg, #0a1f1c 0%, #071614 100%)" }}
    >
      {/* Subtle ambient glow — top right, very soft */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "-20%",
          right: "-10%",
          width: "32rem",
          height: "32rem",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(26,94,84,0.14) 0%, transparent 68%)",
          filter: "blur(48px)",
        }}
      />
      {/* Top border accent */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(52,160,140,0.20) 35%, rgba(52,160,140,0.20) 65%, transparent 100%)",
        }}
      />

      <div className="max-w-5xl mx-auto px-5 sm:px-8 relative z-10">

        {/* ── Main grid ── */}
        <div
          className="py-14 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-10 md:gap-20 border-b"
          style={{ borderColor: "rgba(255,255,255,0.07)" }}
        >

          {/* ── Brand block ── */}
          <div className="space-y-5 max-w-xs">
            {/* Brand signature */}
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <div
                  style={{
                    width: "1.75rem",
                    height: "1.5px",
                    background: "hsl(var(--primary) / 0.55)",
                    borderRadius: "999px",
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: "13.5px",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    color: "rgba(255,255,255,0.88)",
                    textTransform: "uppercase",
                  }}
                >
                  Thắng SWC
                </span>
              </div>
              <p
                style={{
                  fontSize: "11.5px",
                  fontWeight: 400,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "hsl(var(--primary) / 0.65)",
                  paddingLeft: "2.375rem",
                  lineHeight: 1,
                }}
              >
                Phan Văn Thắng
              </p>
            </div>

            {/* Description */}
            <p
              style={{
                fontSize: "13.5px",
                lineHeight: 1.88,
                fontWeight: 300,
                color: "rgba(255,255,255,0.50)",
              }}
            >
              Chia sẻ về tư duy tài chính, đầu tư dài hạn, phát triển bản thân và hành trình xây
              tài sản bền vững.
            </p>

            {/* Social + action row */}
            <div className="flex items-center gap-2 flex-wrap">
              {socials.map(({ icon: Icon, href, ariaLabel }) => (
                <a
                  key={ariaLabel}
                  href={href}
                  aria-label={ariaLabel}
                  style={{ ...iconButtonBase, textDecoration: "none" }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = "rgba(52,160,140,0.22)";
                    el.style.borderColor = "rgba(52,160,140,0.30)";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = "rgba(255,255,255,0.055)";
                    el.style.borderColor = "rgba(255,255,255,0.09)";
                  }}
                >
                  <Icon size={14} style={{ color: "rgba(255,255,255,0.58)" }} />
                </a>
              ))}

              <a
                href="mailto:contact@thangswc.com"
                aria-label="Email"
                style={{ ...iconButtonBase, textDecoration: "none" }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = "rgba(52,160,140,0.22)";
                  el.style.borderColor = "rgba(52,160,140,0.30)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = "rgba(255,255,255,0.055)";
                  el.style.borderColor = "rgba(255,255,255,0.09)";
                }}
              >
                <Mail size={13} style={{ color: "rgba(255,255,255,0.58)" }} />
              </a>

              {/* Cộng đồng pill — height matches icon circles */}
              <a
                href="/cong-dong"
                className="flex items-center gap-1.5"
                style={{
                  height: "34px",
                  padding: "0 14px",
                  borderRadius: "999px",
                  background: "rgba(255,255,255,0.055)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  fontSize: "11.5px",
                  fontWeight: 500,
                  letterSpacing: "0.01em",
                  color: "rgba(255,255,255,0.55)",
                  textDecoration: "none",
                  transition: "background 0.22s ease, border-color 0.22s ease, color 0.22s ease",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = "rgba(52,160,140,0.18)";
                  el.style.borderColor = "rgba(52,160,140,0.28)";
                  el.style.color = "rgba(255,255,255,0.80)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = "rgba(255,255,255,0.055)";
                  el.style.borderColor = "rgba(255,255,255,0.09)";
                  el.style.color = "rgba(255,255,255,0.55)";
                }}
              >
                <Users size={12} style={{ flexShrink: 0, color: "rgba(255,255,255,0.55)" }} />
                Cộng đồng
              </a>
            </div>
          </div>

          {/* ── Nav columns ── */}
          <div className="flex flex-col sm:flex-row gap-10 sm:gap-14">

            {/* Điều hướng */}
            <div className="space-y-5">
              <p
                style={{
                  fontSize: "10px",
                  fontWeight: 600,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.28)",
                  lineHeight: 1,
                }}
              >
                Điều hướng
              </p>
              <ul className="space-y-3.5">
                {navLinks.map(({ name, href }) => (
                  <li key={name}>
                    <a
                      href={href}
                      style={{
                        fontSize: "13.5px",
                        fontWeight: 400,
                        letterSpacing: "0.005em",
                        color: "rgba(255,255,255,0.48)",
                        textDecoration: "none",
                        transition: "color 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.86)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.48)";
                      }}
                    >
                      {name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Hệ sinh thái */}
            <div className="space-y-5">
              <p
                style={{
                  fontSize: "10px",
                  fontWeight: 600,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.28)",
                  lineHeight: 1,
                }}
              >
                Hệ sinh thái
              </p>
              <ul className="space-y-3.5">
                {productLinks.map(({ name, href }) => (
                  <li key={name}>
                    <a
                      href={href}
                      style={{
                        fontSize: "13.5px",
                        fontWeight: 400,
                        letterSpacing: "0.005em",
                        color: "rgba(255,255,255,0.48)",
                        textDecoration: "none",
                        transition: "color 0.2s ease",
                        display: "block",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.color = "rgba(52,160,140,0.90)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.48)";
                      }}
                    >
                      {name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div
          className="py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
        >
          <p
            style={{
              fontSize: "12px",
              fontWeight: 400,
              color: "rgba(255,255,255,0.38)",
              letterSpacing: "0.005em",
              flexShrink: 0,
            }}
          >
            © 2025 Phan Văn Thắng SWC. Bảo lưu mọi quyền.
          </p>
          <p
            style={{
              fontSize: "11.5px",
              fontWeight: 300,
              lineHeight: 1.76,
              color: "rgba(255,255,255,0.30)",
              maxWidth: "28rem",
            }}
            className="md:text-right"
          >
            Thông tin trên website mang tính chia sẻ, giáo dục và tham khảo. Đây không phải là cam
            kết lợi nhuận và cũng không phải là lời khuyên đầu tư cá nhân hóa cho từng trường hợp
            cụ thể.
          </p>
        </div>

      </div>
    </footer>
  );
}
