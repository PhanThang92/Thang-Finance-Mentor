import React from "react";
import { Mail, Users } from "lucide-react";
import { SiYoutube, SiFacebook } from "react-icons/si";

const navLinks = [
  { name: "Trang chủ", href: "#trang-chu" },
  { name: "Giới thiệu", href: "#gioi-thieu" },
  { name: "Nội dung", href: "#noi-dung" },
  { name: "Cộng đồng", href: "#cong-dong" },
  { name: "Liên hệ", href: "#lien-he" },
];

const socials = [
  { icon: SiYoutube, label: "YouTube", href: "#", ariaLabel: "YouTube" },
  { icon: SiFacebook, label: "Facebook", href: "#", ariaLabel: "Facebook" },
];

export function Footer() {
  return (
    <footer
      className="text-white"
      style={{ background: "linear-gradient(180deg, #091d1a 0%, #07161360 100%), #091d1a" }}
    >
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        {/* Main grid */}
        <div
          className="py-14 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-10 md:gap-16 border-b"
          style={{ borderColor: "rgba(255,255,255,0.07)" }}
        >
          {/* Brand */}
          <div className="space-y-5 max-w-sm">
            <p className="text-lg font-bold text-primary">Thắng SWC</p>
            <p className="text-sm leading-[1.85] text-white/50">
              Chia sẻ về tư duy tài chính, đầu tư dài hạn, phát triển bản thân và hành trình xây
              tài sản bền vững.
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-2">
              {socials.map(({ icon: Icon, href, ariaLabel }) => (
                <a
                  key={ariaLabel}
                  href={href}
                  aria-label={ariaLabel}
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-200"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(52,160,140,0.25)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)";
                  }}
                >
                  <Icon size={15} className="text-white/60" />
                </a>
              ))}
              <a
                href="mailto:contact@thangswc.com"
                aria-label="Email"
                className="w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-200"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <Mail size={15} className="text-white/60" />
              </a>
              <a
                href="#cong-dong"
                className="h-9 px-3.5 rounded-full flex items-center gap-2 text-xs font-medium text-white/60 transition-colors duration-200"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <Users size={13} />
                Cộng đồng
              </a>
            </div>
          </div>

          {/* Nav links */}
          <div className="space-y-4">
            <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-white/30">
              Điều hướng
            </p>
            <ul className="space-y-3">
              {navLinks.map(({ name, href }) => (
                <li key={name}>
                  <a
                    href={href}
                    className="text-sm text-white/50 hover:text-white/85 transition-colors duration-200"
                  >
                    {name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="py-7 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <p className="text-[12px] text-white/35">
            © 2024 Phan Văn Thắng SWC. Bảo lưu mọi quyền.
          </p>
          <p className="text-[11px] text-white/25 leading-relaxed max-w-md md:text-right">
            Thông tin trên website mang tính chia sẻ, giáo dục và tham khảo. Đây không phải là
            cam kết lợi nhuận và cũng không phải là lời khuyên đầu tư cá nhân hóa cho từng trường
            hợp cụ thể.
          </p>
        </div>
      </div>
    </footer>
  );
}
