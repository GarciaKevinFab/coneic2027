import { motion } from 'motion/react';

const containerVariants = {
  hidden: {},
  visible: (stagger = 0.1) => ({
    transition: {
      staggerChildren: stagger,
      delayChildren: 0.1,
    },
  }),
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

const itemVariantsScale = {
  hidden: { opacity: 0, scale: 0.85, y: 30 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

export function StaggerContainer({
  children,
  className = '',
  stagger = 0.1,
  once = true,
  amount = 0.15,
}) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      custom={stagger}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className = '', withScale = false }) {
  return (
    <motion.div
      variants={withScale ? itemVariantsScale : itemVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}
