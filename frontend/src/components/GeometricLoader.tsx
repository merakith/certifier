import { motion } from 'motion/react';

interface GeometricLoaderProps {
  size?: 'sm' | 'md' | 'lg';
}

export function GeometricLoader({ size = 'md' }: GeometricLoaderProps) {
  const dimensions = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  };

  return (
    <div className={`relative ${dimensions[size]} flex items-center justify-center`}>
      {/* Outer rotating square */}
      <motion.div
        animate={{
          rotate: [0, 90, 180, 270, 360],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute inset-0 border border-emerald-500/50"
      />
      
      {/* Middle rotating diamond */}
      <motion.div
        animate={{
          rotate: [45, 135, 225, 315, 405],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute inset-2 border border-emerald-400/40"
      />

      {/* Inner pulsating circle */}
      <motion.div
        animate={{
          scale: [0.8, 1.2, 0.8],
          opacity: [0.2, 0.8, 0.2],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)]"
      />

      {/* Intersecting lines */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div 
          animate={{ height: ['0%', '100%', '0%'] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-px bg-emerald-500/20" 
        />
        <motion.div 
          animate={{ width: ['0%', '100%', '0%'] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="h-px bg-emerald-500/20 absolute" 
        />
      </div>
    </div>
  );
}