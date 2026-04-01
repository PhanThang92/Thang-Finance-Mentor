import React from "react";
import { motion } from "framer-motion";
import { PlayCircle, Users, GraduationCap } from "lucide-react";

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.14 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

const stages = [
  {
    step: "01",
    icon: PlayCircle,
    title: "Theo dõi nội dung miễn phí",
    desc: "Nếu anh/chị đang ở giai đoạn bắt đầu, đây là cách phù hợp nhất. Hãy xem video, đọc bài viết, tiếp nhận dần các góc nhìn nền tảng và xây tư duy đúng trước.",
  },
  {
    step: "02",
    icon: Users,
    title: "Tham gia cộng đồng",
    desc: "Nếu anh/chị muốn có môi trường để học cùng người khác, trao đổi, duy trì động lực và đi đường dài vững hơn, cộng đồng sẽ là nơi phù hợp hơn việc đi một mình.",
  },
  {
    step: "03",
    icon: GraduationCap,
    title: "Chương trình chuyên sâu",
    desc: "Nếu anh/chị muốn đi sâu hơn vào kiến thức, công cụ, hệ thống hoặc một lộ trình nghiêm túc hơn, tôi có những chương trình phù hợp cho từng giai đoạn phát triển.",
  },
];

export function CommunitySection() {
  return (
    <section id="cong-dong" className="py-28 md:py-36 bg-background">
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
              <span className="section-label">Cộng đồng</span>
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold text-foreground">
              Những cách anh/chị có thể đồng hành cùng tôi
            </motion.h2>
            <motion.p variants={fadeUp} className="prose-body max-w-xl">
              Mỗi người đang ở một giai đoạn khác nhau. Vì vậy, tôi cũng muốn giữ cách đồng hành
              đủ linh hoạt để anh/chị có thể bắt đầu từ nơi phù hợp nhất với mình.
            </motion.p>
          </div>

          {/* Stage cards */}
          <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {stages.map(({ step, icon: Icon, title, desc }) => (
              <motion.div
                key={step}
                variants={fadeUp}
                className="rounded-xl bg-card border border-border p-7 space-y-6 hover:border-primary/25 transition-colors duration-300"
                style={{ boxShadow: "0 2px 8px -2px rgba(10,40,35,0.06)" }}
              >
                {/* Step + icon row */}
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center text-white shadow-sm shadow-primary/20">
                    <Icon size={20} strokeWidth={1.7} />
                  </div>
                  <span
                    className="text-xs font-black tracking-[0.14em] uppercase"
                    style={{ color: "hsl(var(--muted-foreground) / 0.55)" }}
                  >
                    Bước {step}
                  </span>
                </div>

                <div className="space-y-2.5">
                  <h3 className="text-[16px] font-bold text-foreground leading-snug">{title}</h3>
                  <p className="text-sm leading-[1.85] text-muted-foreground">{desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Soft note */}
          <motion.div variants={fadeUp} className="flex items-center gap-3">
            <div className="h-px w-6 bg-border" />
            <p className="text-sm text-muted-foreground/70 italic">
              Tôi ưu tiên sự phù hợp hơn số lượng.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
