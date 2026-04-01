import React from "react";
import { Mail, Users } from "lucide-react";
import { SiYoutube, SiFacebook } from "react-icons/si";

export function Footer() {
  const navLinks = [
    { name: "Trang chủ", href: "#trang-chu" },
    { name: "Giới thiệu", href: "#gioi-thieu" },
    { name: "Nội dung", href: "#noi-dung" },
    { name: "Cộng đồng", href: "#cong-dong" },
    { name: "Liên hệ", href: "#lien-he" },
  ];

  return (
    <footer className="bg-[#0a1816] text-white pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 border-b border-white/10 pb-12">
          
          <div className="md:col-span-5 space-y-6">
            <h2 className="text-2xl font-bold text-primary">Thắng SWC</h2>
            <p className="text-white/70 leading-relaxed max-w-sm">
              Chia sẻ về tư duy tài chính, đầu tư dài hạn, phát triển bản thân và hành trình xây tài sản bền vững.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/70 hover:bg-primary hover:text-white transition-colors" aria-label="YouTube">
                <SiYoutube size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/70 hover:bg-primary hover:text-white transition-colors" aria-label="Facebook">
                <SiFacebook size={18} />
              </a>
              <a href="mailto:#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/70 hover:bg-primary hover:text-white transition-colors" aria-label="Email">
                <Mail size={18} />
              </a>
              <a href="#cong-dong" className="px-4 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/70 hover:bg-primary hover:text-white transition-colors space-x-2 text-sm font-medium">
                <Users size={16} />
                <span>Cộng đồng</span>
              </a>
            </div>
          </div>

          <div className="md:col-span-7 flex flex-col md:items-end justify-between">
            <ul className="flex flex-wrap gap-x-8 gap-y-4 text-white/70 font-medium">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="hover:text-white transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
            
            <div className="mt-8 md:mt-0 max-w-xl text-right">
              <p className="text-[11px] text-white/40 leading-relaxed text-left md:text-right">
                Thông tin trên website mang tính chia sẻ, giáo dục và tham khảo. Đây không phải là cam kết lợi nhuận và cũng không phải là lời khuyên đầu tư cá nhân hóa cho từng trường hợp cụ thể.
              </p>
            </div>
          </div>
          
        </div>
        
        <div className="pt-8 text-center md:text-left text-sm text-white/50">
          <p>© 2024 Phan Văn Thắng SWC. Bảo lưu mọi quyền.</p>
        </div>
      </div>
    </footer>
  );
}
