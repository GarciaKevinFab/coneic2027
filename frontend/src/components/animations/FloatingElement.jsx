import { motion } from 'motion/react';

export default function FloatingElement({
  children,
  className = '',
  amplitude = 15,
  duration = 6,
  delay = 0,
}) {
  return (
    <motion.div
      className={className}
      animate={{
        y: [0, -amplitude, 0, amplitude, 0],
        rotate: [0, 2, 0, -2, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}
