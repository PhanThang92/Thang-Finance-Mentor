import React from "react";
import { motion } from "framer-motion";
import { PlayCircle, Users, GraduationCap } from "lucide-react";

export function CommunitySection() {
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

  const stages = [
    {
      label: "Bước 1",
      icon: PlayCircle,
      title: "Theo dõi nội dung miễn phí",
      desc: "Nếu anh/chị đang ở giai đoạn bắt đầu, đây là cách phù hợp nhất. Hãy xem video, đọc bài viết, tiếp nhận dần các góc nhìn nền tảng và xây tư duy đúng trước."
    },
    {
      label: "Bước 2",
      icon: Users,
      title: "Tham gia cộng đồng",
      desc: "Nếu anh/chị muốn có môi trường để học cùng người khác, trao đổi, duy trì động lực và đi đường dài vững hơn, cộng đồng sẽ là nơi phù hợp hơn việc đi một mình."
    },
    {
      label: "Bước 3",
      icon: GraduationCap,
      title: "Tìm hiểu chương trình chuyên sâu",
      desc: "Nếu anh/chị muốn đi sâu hơn vào kiến thức, công cụ, hệ thống hoặc một lộ trình nghiêm túc hơn, tôi có những chương trình phù hợp cho từng giai đoạn phát triển."
    }
  ];

  return (
    <section id="cong-dong" className="py-24 bg-background">
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
              Cộng đồng
            </motion.span>
            <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl font-bold text-foreground">
              Những cách anh/chị có thể đồng hành cùng tôi
            </motion.h2>
            <motion.p variants={itemVariants} className="text-lg text-muted-foreground">
              Mỗi người đang ở một giai đoạn khác nhau. Vì vậy, tôi cũng muốn giữ cách đồng hành đủ linh hoạt để anh/chị có thể bắt đầu từ nơi phù hợp nhất với mình.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-[2px] bg-border z-0"></div>

            {stages.map((stage, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="relative z-10 bg-white rounded-xl p-8 border border-border shadow-sm flex flex-col items-center text-center space-y-4"
              >
                <div className="bg-background px-3 py-1 text-xs font-semibold text-primary rounded-full border border-border/50 mb-2">
                  {stage.label}
                </div>
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white shadow-md">
                  <stage.icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-foreground pt-2">{stage.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {stage.desc}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.div variants={itemVariants} className="text-center pt-4">
            <p className="text-muted-foreground/80 text-sm">
              Tôi ưu tiên sự phù hợp hơn số lượng.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
