import { useRef, lazy, Suspense, Component } from 'react';
import { Link } from 'react-router-dom';
import { HiCalendar, HiLocationMarker, HiArrowRight } from 'react-icons/hi';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import FloatingElement from './animations/FloatingElement';
import ParticleField from './animations/ParticleField';
import useCountdown from '../hooks/useCountdown';

/* ─── Lazy-loaded 3D scene (won't block initial render) ─── */
const HeroScene3D = lazy(() => import('./HeroScene3D'));

/* ─── Error boundary: silently hides 3D if WebGL unavailable ─── */
class Scene3DErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

/* ─── Animated countdown digit with flip effect ─── */
function CountdownDigit({ value }) {
  const display = String(value).padStart(2, '0');
  return (
    <div className="relative overflow-hidden h-10 sm:h-12 md:h-14 flex items-center justify-center">
      <AnimatePresence mode="popLayout">
        <motion.span
          key={display}
          initial={{ y: 30, opacity: 0, filter: 'blur(4px)' }}
          animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
          exit={{ y: -30, opacity: 0, filter: 'blur(4px)' }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className="text-3xl sm:text-4xl md:text-5xl font-display font-black text-white block"
        >
          {display}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

/* ─── Stagger container helper ─── */
const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const fadeSlideUp = {
  hidden: { opacity: 0, y: 32, filter: 'blur(6px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { type: 'spring', stiffness: 80, damping: 20 },
  },
};

/* ─── Main Hero component ─── */
export default function Hero() {
  const eventDate = new Date('2027-08-15T09:00:00');
  const countdown = useCountdown(eventDate);
  const sectionRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const gridY = useTransform(scrollYProgress, [0, 1], [0, 80]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden min-h-[90vh] flex items-center"
      style={{
        background: 'linear-gradient(135deg, #0f2847 0%, #1A3A6B 40%, #1a4f8a 100%)',
      }}
    >
      {/* ═══════════════ 3D Animated background ═══════════════ */}
      <Scene3DErrorBoundary>
        <Suspense fallback={null}>
          <HeroScene3D />
        </Suspense>
      </Scene3DErrorBoundary>

      {/* ═══════════════ Animated background blobs ═══════════════ */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top-right warm blob */}
        <motion.div
          className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(244,165,36,0.15) 0%, transparent 70%)' }}
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -25, 15, 0],
            scale: [1, 1.1, 0.95, 1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Bottom-left cool blob */}
        <motion.div
          className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(26,58,107,0.4) 0%, transparent 70%)' }}
          animate={{
            x: [0, -20, 25, 0],
            y: [0, 20, -30, 0],
            scale: [1, 0.95, 1.08, 1],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Center accent pulse */}
        <motion.div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(244,165,36,0.06) 0%, transparent 60%)' }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Concentric rings */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-white/[0.04]"
          animate={{ rotate: 360 }}
          transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-white/[0.06]"
          animate={{ rotate: -360 }}
          transition={{ duration: 90, repeat: Infinity, ease: 'linear' }}
        />

        {/* Parallax grid pattern */}
        <motion.div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            y: gridY,
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* ═══════════════ Floating geometric decorations ═══════════════ */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Triangle top-left */}
        <FloatingElement className="absolute top-[12%] left-[8%]" amplitude={18} duration={7} delay={0}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M14 2L26 26H2L14 2Z" stroke="rgba(244,165,36,0.2)" strokeWidth="1.5" />
          </svg>
        </FloatingElement>

        {/* Circle top-right */}
        <FloatingElement className="absolute top-[18%] right-[12%]" amplitude={14} duration={8} delay={1}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="9" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
          </svg>
        </FloatingElement>

        {/* Small filled circle mid-left */}
        <FloatingElement className="absolute top-[45%] left-[5%]" amplitude={20} duration={9} delay={2}>
          <div className="w-3 h-3 rounded-full" style={{ background: 'rgba(244,165,36,0.25)' }} />
        </FloatingElement>

        {/* Triangle mid-right */}
        <FloatingElement className="absolute top-[55%] right-[7%]" amplitude={16} duration={7.5} delay={0.5}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M11 2L20 20H2L11 2Z" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />
          </svg>
        </FloatingElement>

        {/* Diamond bottom-left */}
        <FloatingElement className="absolute bottom-[25%] left-[15%]" amplitude={12} duration={10} delay={3}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <rect x="9" y="1" width="11.3" height="11.3" rx="1" transform="rotate(45 9 1)" stroke="rgba(244,165,36,0.18)" strokeWidth="1.5" />
          </svg>
        </FloatingElement>

        {/* Circle bottom-right */}
        <FloatingElement className="absolute bottom-[30%] right-[10%]" amplitude={15} duration={6.5} delay={1.5}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
          </svg>
        </FloatingElement>

        {/* Small dot top-center */}
        <FloatingElement className="absolute top-[22%] left-[40%]" amplitude={10} duration={8} delay={4}>
          <div className="w-2 h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }} />
        </FloatingElement>

        {/* Cross shape right */}
        <FloatingElement className="absolute top-[35%] right-[18%]" amplitude={13} duration={9} delay={2.5}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <line x1="7" y1="0" x2="7" y2="14" stroke="rgba(244,165,36,0.15)" strokeWidth="1.5" />
            <line x1="0" y1="7" x2="14" y2="7" stroke="rgba(244,165,36,0.15)" strokeWidth="1.5" />
          </svg>
        </FloatingElement>
      </div>

      {/* ═══════════════ Particle field ═══════════════ */}
      <ParticleField className="absolute inset-0 z-0" />

      {/* ═══════════════ Main content ═══════════════ */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 z-10">
        <motion.div
          className="text-center max-w-4xl mx-auto"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {/* Badge */}
          <motion.div variants={fadeSlideUp} className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8">
            <motion.span
              className="w-2 h-2 rounded-full"
              style={{ background: '#F4A524' }}
              animate={{ opacity: [1, 0.4, 1], scale: [1, 0.85, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
            <span className="text-white/90 text-sm font-medium">Inscripciones abiertas</span>
          </motion.div>

          {/* Title */}
          <motion.h1
            variants={fadeSlideUp}
            className="font-display font-black text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white leading-tight mb-6"
          >
            CONEIC{' '}
            <span style={{ color: '#F4A524' }}>2027</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeSlideUp}
            className="text-xl sm:text-2xl font-display font-semibold mb-2"
            style={{ color: '#8badd4' }}
          >
            XXXIV Congreso Nacional de Estudiantes de Ingenieria Civil
          </motion.p>

          {/* Lema */}
          <motion.p
            variants={fadeSlideUp}
            className="text-base sm:text-lg font-display italic mb-4"
            style={{ color: '#F4A524' }}
          >
            &ldquo;Somos ingenieria, somos civil, somos transformacion&rdquo;
          </motion.p>

          {/* Description */}
          <motion.p
            variants={fadeSlideUp}
            className="text-base sm:text-lg mb-8 max-w-2xl mx-auto leading-relaxed"
            style={{ color: '#7a9cc4' }}
          >
            El punto de encuentro mas importante para estudiantes de ingenieria civil del Peru.
            Conferencias, talleres y networking en un evento sin precedentes.
          </motion.p>

          {/* Event info badges */}
          <motion.div variants={fadeSlideUp} className="flex flex-wrap justify-center gap-4 mb-10">
            <motion.div
              className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2.5"
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.15)' }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <HiCalendar className="w-5 h-5" style={{ color: '#F4A524' }} />
              <span className="text-white text-sm font-medium">15 - 20 Agosto 2027</span>
            </motion.div>
            <motion.div
              className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2.5"
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.15)' }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <HiLocationMarker className="w-5 h-5" style={{ color: '#F4A524' }} />
              <span className="text-white text-sm font-medium">Huancayo, Junin - Peru</span>
            </motion.div>
          </motion.div>

          {/* Countdown */}
          <motion.div variants={fadeSlideUp} className="grid grid-cols-4 gap-3 sm:gap-4 max-w-md mx-auto mb-12">
            {[
              { value: countdown.days, label: 'Dias' },
              { value: countdown.hours, label: 'Horas' },
              { value: countdown.minutes, label: 'Min' },
              { value: countdown.seconds, label: 'Seg' },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                className="backdrop-blur-sm rounded-2xl p-4 sm:p-5 border border-white/10 flex flex-col items-center justify-center min-h-[100px] sm:min-h-[110px]"
                style={{ background: 'rgba(255,255,255,0.08)' }}
                whileHover={{
                  scale: 1.06,
                  borderColor: 'rgba(244,165,36,0.4)',
                  background: 'rgba(255,255,255,0.12)',
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <CountdownDigit value={item.value} />
                <span className="text-xs sm:text-sm mt-1" style={{ color: '#7a9cc4' }}>
                  {item.label}
                </span>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA buttons */}
          <motion.div variants={fadeSlideUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <Link
                to="/register"
                className="inline-flex items-center text-base px-8 py-4 rounded-xl font-bold transition-shadow group"
                style={{
                  background: 'linear-gradient(135deg, #F4A524 0%, #e8931a 100%)',
                  color: '#1A3A6B',
                  boxShadow: '0 8px 30px rgba(244,165,36,0.3)',
                }}
              >
                Registrate ahora
                <HiArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <Link
                to="/schedule"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-colors"
              >
                Ver cronograma
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* ═══════════════ Bottom wave with slide-up entrance ═══════════════ */}
      <motion.div
        className="absolute bottom-0 left-0 right-0"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8, ease: 'easeOut' }}
      >
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full block">
          <path
            d="M0 120L48 110C96 100 192 80 288 70C384 60 480 60 576 65C672 70 768 80 864 85C960 90 1056 90 1152 85C1248 80 1344 70 1392 65L1440 60V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0Z"
            fill="white"
          />
        </svg>
      </motion.div>
    </section>
  );
}
