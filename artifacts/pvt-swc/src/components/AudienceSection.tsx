import React from "react";
import { motion } from "framer-motion";

export function AudienceSection() {
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

  const audiences = [
    "Người đi làm nhiều năm nhưng tài sản vẫn chưa hình thành rõ",
    "Người có thu nhập nhưng chưa có hệ thống quản lý và đầu tư bài bản",
    "Người muốn hiểu đầu tư theo hướng dài hạn, thực tế",
    "Người muốn phát triển bản thân và tài chính song song",
    "Người muốn đi đường dài, không FOMO"
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-[#173e38] to-[#122e2a] text-white">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="max-w-4xl mx-auto space-y-12"
        >
          <div className="text-center space-y-4">
            <motion.span variants={itemVariants} className="text-accent font-semibold tracking-wider uppercase text-sm">
              Dành cho ai?
            </motion.span>
            <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl font-bold">
              Trang này dành cho ai?
            </motion.h2>
            <motion.p variants={itemVariants} className="text-lg text-white/80">
              Nếu anh/chị đang ở một trong những giai đoạn dưới đây, rất có thể những nội dung tôi chia sẻ sẽ phù hợp:
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {audiences.map((text, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className={`bg-white/5 border border-white/10 p-6 rounded-xl backdrop-blur-sm shadow-sm ${idx === audiences.length - 1 ? 'md:col-span-2 md:w-1/2 md:mx-auto' : ''}`}
              >
                <p className="text-white/90 font-medium text-center">{text}</p>
              </motion.div>
            ))}
          </div>

          <motion.div variants={itemVariants} className="pt-8 text-center">
            <p className="italic text-accent/90 text-lg">
              "Nếu anh/chị đang tìm một hướng đi bình tĩnh hơn, thực tế hơn và có chiều sâu hơn với tài chính và cuộc sống, đây có thể là nơi phù hợp."
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
