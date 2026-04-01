import React from "react";
import { motion } from "framer-motion";
import { BackgroundDecor } from "./BackgroundDecor";

export function PhilosophySection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <section className="relative py-32 bg-gradient-to-b from-[#0a1816] to-[#122e2a] text-white overflow-hidden">
      <BackgroundDecor />
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="max-w-4xl mx-auto text-center space-y-12"
        >
          <div className="space-y-4">
            <motion.span variants={itemVariants} className="text-accent font-semibold tracking-wider uppercase text-sm">
              Tuyên ngôn
            </motion.span>
            <motion.h2 variants={itemVariants} className="text-3xl md:text-5xl font-bold">
              Tuyên ngôn của tôi
            </motion.h2>
          </div>

          <div className="relative">
            <span className="absolute -top-16 left-1/2 -translate-x-1/2 text-[15rem] leading-none font-serif text-primary/10 select-none">"</span>
            <motion.div variants={itemVariants} className="prose prose-xl prose-invert mx-auto relative z-10 space-y-8 font-medium text-white/90">
              <p>Tôi tin rằng tự do tài chính không phải là đặc quyền của một số ít người may mắn.</p>
              <p>Nó là kết quả của một quá trình đủ dài, đủ tỉnh táo và đủ kỷ luật.</p>
              
              <div className="h-px w-24 bg-primary/30 mx-auto my-12"></div>
              
              <p>Tôi cũng tin rằng:</p>
              <p><strong>Tiền bạc phản chiếu tư duy.</strong><br/>
              Cách một người sử dụng tiền thường cho thấy họ đang nhìn cuộc đời ngắn hay dài, nông hay sâu.</p>
              <p><strong>Đầu tư phản chiếu bản lĩnh.</strong><br/>
              Không phải lúc thị trường thuận lợi, mà chính trong biến động, cảm xúc và sự bất định, con người mới bộc lộ rõ nhất nền tảng của mình.</p>
              <p><strong>Tài sản phản chiếu hệ thống sống của mỗi người.</strong><br/>
              Nếu một người không có kỷ luật, không có nguyên tắc và không có định hướng dài hạn, rất khó để tài sản được hình thành một cách bền vững.</p>
              
              <div className="h-px w-24 bg-primary/30 mx-auto my-12"></div>
              
              <p>Vì vậy, điều tôi muốn xây không chỉ là những nội dung về đầu tư.</p>
              <p>Tôi muốn cùng anh/chị xây một hành trình lớn hơn thế:<br/>
              một hành trình sống chủ động hơn, hiểu giá trị của thời gian hơn, làm chủ bản thân tốt hơn, và từ đó từng bước tạo ra một nền tài chính vững hơn cho tương lai.</p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
