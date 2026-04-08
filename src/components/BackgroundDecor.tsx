import React from "react";
import { motion } from "framer-motion";

export function BackgroundDecor() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      {/* Subtle grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "5rem 5rem",
          maskImage: "radial-gradient(ellipse 70% 60% at 60% 10%, black 50%, transparent 100%)",
        }}
      />

      {/* Outer slow ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 180, repeat: Infinity, ease: "linear" }}
        className="absolute"
        style={{
          top: "-8%", right: "-6%",
          width: "44rem", height: "44rem",
          borderRadius: "50%",
          border: "1px dashed rgba(100,200,180,0.08)",
        }}
      />

      {/* Inner medium ring */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 130, repeat: Infinity, ease: "linear" }}
        className="absolute"
        style={{
          top: "4%", right: "4%",
          width: "32rem", height: "32rem",
          borderRadius: "50%",
          border: "1px solid rgba(100,200,180,0.06)",
        }}
      />

      {/* Small accent ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
        className="absolute"
        style={{
          top: "12%", right: "12%",
          width: "18rem", height: "18rem",
          borderRadius: "50%",
          border: "1px dashed rgba(100,200,180,0.10)",
        }}
      />

      {/* Glow blob bottom left */}
      <div
        className="absolute"
        style={{
          bottom: "-15%", left: "-8%",
          width: "42rem", height: "42rem",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(26,94,84,0.22) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      {/* Glow top center */}
      <div
        className="absolute"
        style={{
          top: "20%", left: "30%",
          width: "20rem", height: "20rem",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(36,130,115,0.10) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />
    </div>
  );
}
