import React from "react";
import { motion } from "framer-motion";
import { Coins, User, Network } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiYoutube } from "react-icons/si";

export function ContentSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const contentPillars = [
    {
      icon: Coins,
      title: "Tư duy tài chính & đầu tư",
      desc: "Quản lý tài chính cá nhân, tư duy tích sản, hiểu rủi ro trước lợi nhuận, đầu tư dài hạn và góc nhìn thực tế về tài sản, dòng tiền và quyền sở hữu."
    },
    {
      icon: User,
      title: "Phát triển bản thân & sự nghiệp",
      desc: "Kỷ luật cá nhân, trách nhiệm với cuộc đời mình, tư duy nghề nghiệp, phát triển sự nghiệp theo hướng dài hạn và xây phiên bản tốt hơn của chính mình."
    },
    {
      icon: Network,
      title: "Hệ thống & cộng đồng",
      desc: "Hệ thống học tập, công cụ và tư duy ứng dụng, cách xây môi trường phát triển lành mạnh và cộng đồng cùng học, cùng làm, cùng trưởng thành."
    }
  ];

  return (
    <section id="noi-dung" className="py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="max-w-5xl mx-auto space-y-12"
        >
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <motion.span variants={itemVariants} className="text-primary font-semibold tracking-wider uppercase text-sm">
              Nội dung
            </motion.span>
            <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl font-bold text-foreground">
              Nội dung tôi đang chia sẻ
            </motion.h2>
            <motion.p variants={itemVariants} className="text-lg text-muted-foreground">
              Những gì tôi chia sẻ xoay quanh một mục tiêu chung: giúp anh/chị xây một nền tảng tốt hơn cho tài chính, công việc, tư duy và cuộc sống dài hạn.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {contentPillars.map((pillar, idx) => (
              <motion.div key={idx} variants={itemVariants} className="flex flex-col space-y-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <pillar.icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-foreground">{pillar.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {pillar.desc}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.div variants={itemVariants} className="pt-8 text-center">
            <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/5 rounded-lg">
              <SiYoutube className="mr-2 h-5 w-5" />
              Xem playlist YouTube
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
