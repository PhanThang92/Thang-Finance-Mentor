import React from "react";
import { motion } from "framer-motion";
import { Shield, Eye, Layers } from "lucide-react";

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

const values = [
  {
    num: "01",
    icon: Shield,
    title: "Kỷ luật tài chính",
    desc: "Không có tài sản bền vững nếu không có kỷ luật. Từ quản lý chi tiêu, xây quỹ an toàn, hình thành thói quen tích lũy đến cách ra quyết định trước cám dỗ ngắn hạn — tất cả đều là phần gốc.",
  },
  {
    num: "02",
    icon: Eye,
    title: "Tư duy đầu tư đúng",
    desc: "Đầu tư không bắt đầu bằng câu hỏi: 'Cái gì tăng nhanh nhất?' Nó nên bắt đầu bằng những câu hỏi sâu hơn về rủi ro, giá trị và khả năng giữ được sự tỉnh táo khi thị trường biến động.",
  },
  {
    num: "03",
    icon: Layers,
    title: "Hệ thống phát triển dài hạn",
    desc: "Một người có thể rất quyết tâm trong vài ngày. Nhưng để đi được vài năm, cần một hệ thống học tập, một môi trường đủ tốt và những nguyên tắc đủ rõ để quay lại mỗi khi chệch hướng.",
  },
];

export function ValueSection() {
  return (
    <section className="py-28 md:py-36 bg-card">
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
              <span className="section-label">Giá trị cốt lõi</span>
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold text-foreground">
              3 trụ giá trị tôi theo đuổi
            </motion.h2>
            <motion.p variants={fadeUp} className="prose-body max-w-xl">
              Tôi tin rằng một hành trình tài chính bền vững không bắt đầu từ "cơ hội kiếm được
              bao nhiêu". Nó bắt đầu từ việc mình đang đứng trên nền gì.
            </motion.p>
          </div>

          {/* Value cards */}
          <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {values.map(({ num, icon: Icon, title, desc }) => (
              <motion.div
                key={num}
                variants={fadeUp}
                className="group relative rounded-xl bg-background border border-border p-7 hover:border-primary/30 hover:-translate-y-1 transition-all duration-300"
                style={{ boxShadow: "0 2px 8px -2px rgba(10,40,35,0.06)" }}
              >
                {/* Number watermark */}
                <span className="absolute top-5 right-6 text-5xl font-black text-muted/40 select-none leading-none group-hover:text-primary/10 transition-colors">
                  {num}
                </span>

                <div className="relative space-y-5">
                  {/* Icon */}
                  <div className="w-11 h-11 rounded-lg bg-primary/8 flex items-center justify-center text-primary">
                    <Icon size={22} strokeWidth={1.6} />
                  </div>

                  {/* Accent line */}
                  <div className="h-[2px] w-8 rounded-full bg-primary/40" />

                  <h3 className="text-[17px] font-bold text-foreground">{title}</h3>
                  <p className="text-sm leading-[1.85] text-muted-foreground">{desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
