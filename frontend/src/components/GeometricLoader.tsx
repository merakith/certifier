import { motion } from 'motion/react';

export function GeometricLoader({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dimensions = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-24 h-24"
  }[size];

  const innerSize = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-16 h-16"
  }[size];

  return (
    <div className={`relative ${dimensions} flex items-center justify-center`}>
      <motion.div
        className="absolute w-full h-full border border-zinc-800"
        animate={{
          rotate: 360,
          borderRadius: ["0%", "50%", "0%"],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      <motion.div
        className={`absolute ${innerSize} border border-emerald-500/30`}
        animate={{
          rotate: -360,
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      <motion.div
        className="w-1 h-1 bg-white shadow-[0_0_10px_white]"
        animate={{
          scale: [1, 2, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  );
}
