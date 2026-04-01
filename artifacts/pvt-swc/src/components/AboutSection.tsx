import React from "react";
import { motion } from "framer-motion";
import { Briefcase, TrendingUp, BookOpen, Target } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.14 } },
};

const badges = [
  { icon: Briefcase, num: "5", unit: "năm", desc: "Công nghệ" },
  { icon: TrendingUp, num: "7+", unit: "năm", desc: "Đầu tư dài hạn" },
  { icon: BookOpen, num: "—", unit: "", desc: "Chia sẻ kiến thức" },
  { icon: Target, num: "—", unit: "", desc: "Định hướng bền vững" },
];

export function AboutSection() {
  return (
    <section id="gioi-thieu" className="py-28 md:py-36 bg-background">
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
              <span className="section-label">Giới thiệu</span>
            </motion.div>
            <motion.h2
              variants={fadeUp}
              className="text-3xl md:text-4xl font-bold text-foreground"
            >
              Tôi là ai
            </motion.h2>
          </div>

          {/* Body — two column on large screens */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-12 lg:gap-16 items-start">
            <motion.div variants={fadeUp} className="space-y-5 text-[15.5px] leading-[1.9] text-muted-foreground">
              <p className="text-foreground/90 text-base font-medium">
                Tôi là Phan Văn Thắng.
              </p>
              <p>
                Tôi từng làm việc trong lĩnh vực công nghệ nhiều năm, sau đó bước sâu hơn vào
                hành trình quản lý tài chính cá nhân, đầu tư giá trị và phát triển tư duy tài
                sản dài hạn.
              </p>
              <p>
                Qua thời gian, tôi nhận ra một điều rất rõ: nhiều người làm việc chăm chỉ, thu
                nhập không hẳn thấp, nhưng sau nhiều năm vẫn chưa xây được một nền tài chính
                thật sự vững.
              </p>
              <p>
                Vấn đề thường không nằm ở việc họ thiếu cố gắng. Mà nằm ở chỗ họ chưa có một
                hệ thống đúng. Chưa hiểu tiền một cách đủ sâu. Chưa có kỷ luật tài chính đủ
                bền. Chưa có tư duy đầu tư đủ dài hạn.
              </p>
              <p>
                Vì vậy, điều tôi đang theo đuổi không phải là tạo ra cảm giác hưng phấn nhất
                thời. Tôi muốn chia sẻ một hướng đi thực tế hơn, bền hơn và có chiều sâu hơn.
              </p>
              <ul className="mt-4 space-y-2.5">
                {[
                  "Hiểu giá trị của lao động và thời gian",
                  "Xây nền tài chính cá nhân vững hơn",
                  "Rèn tư duy đầu tư đúng",
                  "Từng bước hình thành tài sản bằng kỷ luật và kiến thức",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary/60 flex-shrink-0" />
                    <span className="text-foreground/75">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Sidebar quote card */}
            <motion.div
              variants={fadeUp}
              className="rounded-xl p-6 border border-border space-y-5 sticky top-28 bg-card shadow-sm"
            >
              <div
                className="h-0.5 w-10 rounded-full"
                style={{ background: "hsl(var(--primary))" }}
              />
              <p className="text-[15px] leading-[1.8] text-foreground/80 italic font-light">
                "Hành trình tài chính không bắt đầu từ thị trường. Nó bắt đầu từ tư duy."
              </p>
              <p className="text-sm text-muted-foreground font-medium">— Phan Văn Thắng SWC</p>
            </motion.div>
          </div>

          {/* Trust badges */}
          <motion.div
            variants={stagger}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-10 border-t border-border"
          >
            {badges.map(({ icon: Icon, num, unit, desc }, idx) => (
              <motion.div
                key={idx}
                variants={fadeUp}
                className="flex flex-col items-center text-center gap-3 p-5 rounded-xl bg-card border border-border/60"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/8 flex items-center justify-center text-primary">
                  <Icon size={20} strokeWidth={1.6} />
                </div>
                {num !== "—" ? (
                  <div>
                    <span className="text-2xl font-bold text-foreground">{num}</span>
                    {unit && <span className="text-sm text-muted-foreground ml-1">{unit}</span>}
                  </div>
                ) : null}
                <p className="text-xs text-muted-foreground leading-snug">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
