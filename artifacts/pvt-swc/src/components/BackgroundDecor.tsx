import React from "react";
import { motion } from "framer-motion";

export function BackgroundDecor() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      
      {/* Decorative circles */}
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-10%] right-[-5%] w-[40rem] h-[40rem] rounded-full border-[1px] border-primary/10 border-dashed"
      />
      <motion.div 
        animate={{ rotate: -360 }}
        transition={{ duration: 200, repeat: Infinity, ease: "linear" }}
        className="absolute top-[5%] right-[5%] w-[30rem] h-[30rem] rounded-full border-[1px] border-primary/20 border-dotted"
      />
      <div className="absolute bottom-[-20%] left-[-10%] w-[50rem] h-[50rem] rounded-full bg-primary/5 blur-[100px]" />
    </div>
  );
}
