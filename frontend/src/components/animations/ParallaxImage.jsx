import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';

export default function ParallaxImage({
  src,
  alt = '',
  className = '',
  speed = 0.3,
  children,
}) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [`-${speed * 100}%`, `${speed * 100}%`]);

  return (
    <div ref={ref} className={`overflow-hidden relative ${className}`}>
      {src ? (
        <motion.img
          src={src}
          alt={alt}
          style={{ y }}
          className="w-full h-[120%] object-cover absolute inset-0"
        />
      ) : (
        <motion.div style={{ y }} className="absolute inset-0">
          {children}
        </motion.div>
      )}
    </div>
  );
}
