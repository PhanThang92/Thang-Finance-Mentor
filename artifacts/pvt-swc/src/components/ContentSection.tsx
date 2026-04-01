import React from "react";
import { motion } from "framer-motion";
import { Coins, User, Network } from "lucide-react";
import { SiYoutube } from "react-icons/si";

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.13 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
};

const pillars = [
  {
    icon: Coins,
    title: "Tư duy tài chính & đầu tư",
    desc: "Quản lý tài chính cá nhân, tư duy tích sản, hiểu rủi ro trước lợi nhuận, đầu tư dài hạn và góc nhìn thực tế về tài sản, dòng tiền và quyền sở hữu.",
  },
  {
    icon: User,
    title: "Phát triển bản thân & sự nghiệp",
    desc: "Kỷ luật cá nhân, trách nhiệm với cuộc đời mình, tư duy nghề nghiệp, phát triển sự nghiệp theo hướng dài hạn và xây phiên bản tốt hơn của chính mình.",
  },
  {
    icon: Network,
    title: "Hệ thống & cộng đồng",
    desc: "Hệ thống học tập, công cụ và tư duy ứng dụng, cách xây môi trường phát triển lành mạnh và cộng đồng cùng học, cùng làm, cùng trưởng thành.",
  },
];

export function ContentSection() {
  return (
    <section id="noi-dung" className="py-28 md:py-36 bg-background">
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
          className="space-y-16"
        >
          {/* Header */}
          <div className="max-w-2xl space-y-4">
            <motion.div variants={fadeUp} className="flex items-center gap-3">
              <div className="h-px w-8 bg-primary/50" />
              <span className="section-label">Nội dung</span>
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold text-foreground">
              Nội dung tôi đang chia sẻ
            </motion.h2>
            <motion.p variants={fadeUp} className="prose-body max-w-xl">
              Những gì tôi chia sẻ xoay quanh một mục tiêu chung: giúp anh/chị xây một nền tảng
              tốt hơn cho tài chính, công việc, tư duy và cuộc sống dài hạn.
            </motion.p>
          </div>

          {/* Pillar cards */}
          <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {pillars.map(({ icon: Icon, title, desc }) => (
              <motion.div
                key={title}
                variants={fadeUp}
                className="rounded-xl bg-card border border-border p-7 space-y-5 hover:border-primary/25 transition-colors duration-300"
                style={{ boxShadow: "0 2px 8px -2px rgba(10,40,35,0.06)" }}
              >
                <div className="w-10 h-10 rounded-lg bg-primary/8 flex items-center justify-center text-primary">
                  <Icon size={20} strokeWidth={1.6} />
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-foreground mb-3">{title}</h3>
                  <p className="text-sm leading-[1.85] text-muted-foreground">{desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.div variants={fadeUp} className="pt-4">
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 h-11 px-6 rounded-full border border-primary/50 text-primary text-sm font-medium hover:bg-primary/6 transition-all duration-200"
              data-testid="btn-youtube"
            >
              <SiYoutube size={16} className="text-red-500" />
              Xem playlist YouTube
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
