import React from "react";
import { motion } from "framer-motion";
import { Briefcase, TrendingUp, BookOpen, Target } from "lucide-react";

export function AboutSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <section id="gioi-thieu" className="py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="space-y-12"
        >
          <div className="text-center space-y-4">
            <motion.span variants={itemVariants} className="text-primary font-semibold tracking-wider uppercase text-sm">
              Giới thiệu
            </motion.span>
            <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl font-bold text-foreground">
              Tôi là ai
            </motion.h2>
          </div>

          <motion.div variants={itemVariants} className="prose prose-lg text-muted-foreground prose-p:leading-relaxed mx-auto">
            <p>Tôi là Phan Văn Thắng.</p>
            <p>Tôi từng làm việc trong lĩnh vực công nghệ nhiều năm, sau đó bước sâu hơn vào hành trình quản lý tài chính cá nhân, đầu tư giá trị và phát triển tư duy tài sản dài hạn.</p>
            <p>Qua thời gian, tôi nhận ra một điều rất rõ:<br/>nhiều người làm việc chăm chỉ, thu nhập không hẳn thấp, nhưng sau nhiều năm vẫn chưa xây được một nền tài chính thật sự vững.</p>
            <p>Vấn đề thường không nằm ở việc họ thiếu cố gắng.<br/>Mà nằm ở chỗ họ chưa có một hệ thống đúng.</p>
            <p>Chưa hiểu tiền một cách đủ sâu.<br/>Chưa có kỷ luật tài chính đủ bền.<br/>Chưa có tư duy đầu tư đủ dài hạn.<br/>Và cũng chưa có một môi trường đủ tốt để đi cùng trong nhiều năm.</p>
            <p>Vì vậy, điều tôi đang theo đuổi hôm nay không phải là tạo ra cảm giác hưng phấn nhất thời. Tôi muốn chia sẻ một hướng đi thực tế hơn, bền hơn và có chiều sâu hơn:</p>
            <ul className="list-disc pl-5 space-y-2 mt-4 text-foreground/80 font-medium">
              <li>hiểu giá trị của lao động và thời gian</li>
              <li>xây nền tài chính cá nhân vững hơn</li>
              <li>rèn tư duy đầu tư đúng</li>
              <li>và từng bước hình thành tài sản bằng kỷ luật, kiến thức và sự trưởng thành của chính mình</li>
            </ul>
          </motion.div>

          <motion.div variants={containerVariants} className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-12 border-t border-border">
            {[
              { icon: Briefcase, title: "5 năm", desc: "Công nghệ" },
              { icon: TrendingUp, title: "7+", desc: "Năm đầu tư dài hạn" },
              { icon: BookOpen, title: "Chia sẻ", desc: "Kiến thức tài chính & phát triển bản thân" },
              { icon: Target, title: "Định hướng", desc: "Bền vững, thực tế, dài hạn" },
            ].map((badge, idx) => (
              <motion.div key={idx} variants={itemVariants} className="flex flex-col items-center text-center space-y-3 p-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                  <badge.icon size={24} />
                </div>
                <h4 className="font-bold text-foreground text-lg">{badge.title}</h4>
                <p className="text-sm text-muted-foreground">{badge.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
