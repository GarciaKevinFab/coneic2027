import { useMemo } from 'react';
import { motion } from 'motion/react';

const PARTICLE_COUNT = 25;

function generateParticles() {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => {
    const size = Math.random() * 4 + 2; // 2-6px
    const opacity = Math.random() * 0.3 + 0.1; // 0.1-0.4
    const duration = Math.random() * 15 + 10; // 10-25s
    const delay = Math.random() * duration; // stagger starts
    const left = Math.random() * 100; // 0-100%
    const startY = Math.random() * 100; // 0-100%
    const isAccent = Math.random() > 0.6; // ~40% accent color, 60% white

    return {
      id: i,
      size,
      opacity,
      duration,
      delay,
      left,
      startY,
      color: isAccent ? 'rgba(244,165,36,' : 'rgba(255,255,255,',
    };
  });
}

export default function ParticleField({ className = '' }) {
  const particles = useMemo(() => generateParticles(), []);

  return (
    <div className={`overflow-hidden pointer-events-none ${className}`}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.left}%`,
            top: `${p.startY}%`,
            backgroundColor: `${p.color}${p.opacity})`,
          }}
          animate={{
            y: [0, -120, -240],
            opacity: [0, p.opacity, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
}
