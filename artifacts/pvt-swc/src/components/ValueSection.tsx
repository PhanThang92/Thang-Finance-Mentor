import React from "react";
import { motion } from "framer-motion";
import { Shield, Eye, Layers } from "lucide-react";

export function ValueSection() {
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

  const values = [
    {
      num: "01",
      icon: Shield,
      title: "Kỷ luật tài chính",
      desc: "Không có tài sản bền vững nếu không có kỷ luật. Từ quản lý chi tiêu, xây quỹ an toàn, hình thành thói quen tích lũy đến cách ra quyết định trước cám dỗ ngắn hạn — tất cả đều là phần gốc."
    },
    {
      num: "02",
      icon: Eye,
      title: "Tư duy đầu tư đúng",
      desc: "Đầu tư không bắt đầu bằng câu hỏi: 'Cái gì tăng nhanh nhất?' Nó nên bắt đầu bằng những câu hỏi sâu hơn về rủi ro, giá trị và khả năng giữ được sự tỉnh táo khi thị trường biến động."
    },
    {
      num: "03",
      icon: Layers,
      title: "Hệ thống phát triển dài hạn",
      desc: "Một người có thể rất quyết tâm trong vài ngày. Nhưng để đi được vài năm, cần một hệ thống học tập, một môi trường đủ tốt, một cộng đồng đồng hành và những nguyên tắc đủ rõ để quay lại mỗi khi chệch hướng."
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="max-w-5xl mx-auto space-y-16"
        >
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <motion.span variants={itemVariants} className="text-primary font-semibold tracking-wider uppercase text-sm">
              Giá trị cốt lõi
            </motion.span>
            <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl font-bold text-foreground">
              3 trụ giá trị tôi theo đuổi
            </motion.h2>
            <motion.p variants={itemVariants} className="text-lg text-muted-foreground">
              Tôi tin rằng một hành trình tài chính bền vững thường không bắt đầu từ 'cơ hội kiếm được bao nhiêu'. Nó bắt đầu từ việc mình đang đứng trên nền gì.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((val, idx) => (
              <motion.div key={idx} variants={itemVariants} className="bg-background rounded-2xl p-8 border border-border shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 text-8xl font-bold text-muted/30 group-hover:text-primary/5 transition-colors select-none">
                  {val.num}
                </div>
                <div className="relative z-10 space-y-6">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <val.icon size={28} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">{val.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {val.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
