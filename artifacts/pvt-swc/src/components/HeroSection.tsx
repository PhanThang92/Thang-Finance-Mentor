import React from "react";
import { motion } from "framer-motion";
import { BackgroundDecor } from "./BackgroundDecor";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section
      id="trang-chu"
      className="relative min-h-[100dvh] flex items-center pt-20 overflow-hidden bg-gradient-to-br from-[#122e2a] to-[#0a1816]"
    >
      <BackgroundDecor />
      <div className="container mx-auto px-4 md:px-6 relative z-10 py-12 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Xây tài sản dài hạn không bắt đầu từ may mắn.
              <br />
              <span className="text-white/90">
                Nó bắt đầu từ kỷ luật, tư duy đúng và một hành trình nghiêm túc.
              </span>
            </h1>
            <p className="text-xl text-white/80 font-medium">
              Tôi là Phan Văn Thắng SWC.
              <br />
              Tôi chia sẻ về tư duy tài chính, đầu tư dài hạn, phát triển bản thân và cách xây dựng một hệ thống đủ vững để người bình thường có thể đi xa hơn trên hành trình tự do tài chính.
            </p>
            <p className="text-base text-white/60 max-w-xl">
              Tôi không theo đuổi những lời hứa làm giàu nhanh. Tôi tin vào một con đường thực tế hơn: hiểu tiền đúng, sống kỷ luật hơn, đầu tư tỉnh táo hơn, và kiên trì đủ lâu để tài sản có cơ hội hình thành.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white border-none rounded-lg text-base h-12 px-8">
                Khám phá nội dung
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 bg-transparent rounded-lg text-base h-12 px-8">
                Tham gia cộng đồng
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="flex justify-center lg:justify-end"
          >
            <div className="relative w-full max-w-md aspect-[4/5] rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-gradient-to-t from-[#153430] to-[#1d423e] flex items-center justify-center">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent opacity-60 mix-blend-overlay"></div>
              <span className="text-7xl font-bold text-white/20 tracking-widest">PVT</span>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm py-2 px-6 rounded-full font-medium whitespace-nowrap shadow-lg"
              >
                7+ năm đầu tư dài hạn
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
