import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function FeaturedSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const featuredCards = [
    {
      title: "Hành Trình Từ Tư Duy Đến Tự Do",
      desc: "Một series về tư duy, trách nhiệm, tài chính, sự nghiệp và cách một người bình thường có thể trưởng thành dần để bước gần hơn tới tự do.",
      gradient: "from-[#122e2a] to-[#1d423e]"
    },
    {
      title: "Con đường đến 1 triệu đô",
      desc: "Không phải lời hứa làm giàu nhanh. Đây là hành trình xây tài sản dài hạn bằng kỷ luật tài chính, tư duy đầu tư đúng và một hệ thống đồng hành nghiêm túc.",
      gradient: "from-[#173e38] to-[#245b53]"
    },
    {
      title: "Kiến thức đầu tư nền tảng",
      desc: "Dành cho người muốn bắt đầu từ gốc: hiểu tiền, hiểu rủi ro, hiểu cách nhìn một cơ hội đầu tư bằng sự tỉnh táo thay vì cảm xúc.",
      gradient: "from-[#1d423e] to-[#2c6e64]"
    },
    {
      title: "Kỷ luật, cuộc sống và phát triển bản thân",
      desc: "Những chia sẻ gần hơn với đời sống hằng ngày, nhưng lại là phần rất quan trọng để xây nên một hành trình tài chính bền vững.",
      gradient: "from-[#245b53] to-[#368579]"
    }
  ];

  return (
    <section className="py-24 bg-primary/5">
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
              Bắt đầu từ đâu?
            </motion.span>
            <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl font-bold text-foreground">
              Bắt đầu từ những nội dung cốt lõi
            </motion.h2>
            <motion.p variants={itemVariants} className="text-lg text-muted-foreground">
              Nếu anh/chị mới biết đến tôi, đây là những nội dung nên bắt đầu trước.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredCards.map((card, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="bg-white rounded-xl overflow-hidden border border-border shadow-sm hover:shadow-md transition-all hover:-translate-y-1 group flex flex-col"
              >
                <div className={`h-40 w-full bg-gradient-to-br ${card.gradient} flex items-center justify-center relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent opacity-50 mix-blend-overlay"></div>
                </div>
                <div className="p-6 flex flex-col flex-grow space-y-4">
                  <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">{card.title}</h3>
                  <p className="text-muted-foreground flex-grow">
                    {card.desc}
                  </p>
                  <Button variant="link" className="px-0 w-fit text-primary font-semibold h-auto py-0">
                    Xem ngay →
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
