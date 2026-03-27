import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  HiAcademicCap,
  HiUserGroup,
  HiLightningBolt,
  HiGlobe,
  HiArrowRight,
  HiCalendar,
} from 'react-icons/hi';
import { motion } from 'motion/react';
import Hero from '../components/Hero';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
  AnimatedCounter,
} from '../components/animations';
import scheduleService from '../services/scheduleService';
import institutionalService from '../services/institutionalService';

const features = [
  {
    icon: HiAcademicCap,
    title: 'Ponencias Magistrales',
    description:
      'Expertos nacionales e internacionales compartiendo su conocimiento y experiencia.',
  },
  {
    icon: HiLightningBolt,
    title: 'Talleres Practicos',
    description:
      'Aprende herramientas y tecnicas de la mano de profesionales activos.',
  },
  {
    icon: HiUserGroup,
    title: 'Networking',
    description:
      'Conecta con estudiantes y profesionales de todo el Peru.',
  },
  {
    icon: HiGlobe,
    title: 'Innovacion',
    description:
      'Descubre las ultimas tendencias en ingenieria civil y construccion.',
  },
];

const stats = [
  { value: 500, suffix: '+', label: 'Participantes' },
  { value: 30, suffix: '+', label: 'Ponentes' },
  { value: 15, suffix: '+', label: 'Talleres' },
  { value: 6, suffix: '', label: 'Dias' },
];

const tierOrder = ['platinum', 'gold', 'silver', 'bronze'];

const tierConfig = {
  platinum: { label: 'Platino', color: '#6B7280', cols: 'grid-cols-1 sm:grid-cols-2', borderColor: 'border-l-gray-400' },
  gold: { label: 'Oro', color: '#F4A524', cols: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3', borderColor: 'border-l-[#F4A524]' },
  silver: { label: 'Plata', color: '#9CA3AF', cols: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4', borderColor: 'border-l-gray-300' },
  bronze: { label: 'Bronce', color: '#B45309', cols: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4', borderColor: 'border-l-amber-700' },
};

function hasSponsorData(sponsors) {
  if (!sponsors || typeof sponsors !== 'object') return false;
  return tierOrder.some(
    (tier) => Array.isArray(sponsors[tier]) && sponsors[tier].length > 0,
  );
}

export default function HomePage() {
  const { data: sponsors = {} } = useQuery({
    queryKey: ['sponsors'],
    queryFn: institutionalService.getSponsors,
    placeholderData: {},
  });

  const { data: scheduleData = [] } = useQuery({
    queryKey: ['schedule-preview'],
    queryFn: scheduleService.getSchedule,
    placeholderData: [],
  });

  // Take first day's items for preview
  const schedule = scheduleData?.[0]?.items?.slice(0, 4) || [];

  const hasSponsors = hasSponsorData(sponsors);

  return (
    <div className="overflow-x-hidden">
      {/* ── Hero ── */}
      <Hero />

      {/* ── Features Section ── */}
      <section className="py-20 md:py-28 bg-white relative">
        {/* Subtle decorative background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(26,58,107,0.03)_0%,_transparent_70%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <ScrollReveal>
            <div className="text-center mb-14 md:mb-20">
              <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-[#F4A524] mb-4">
                Descubre
              </span>
              <h2 className="font-display font-black text-3xl md:text-4xl lg:text-5xl text-gray-900 leading-tight">
                Por que asistir a{' '}
                <span className="text-[#F4A524]">CONEIC 2027</span>
              </h2>
              <p className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto mt-5 leading-relaxed">
                Una experiencia transformadora para el futuro de la ingenieria
                civil
              </p>
            </div>
          </ScrollReveal>

          <StaggerContainer
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
            stagger={0.12}
          >
            {features.map((feature, idx) => (
              <StaggerItem key={idx}>
                <motion.div
                  whileHover={{ scale: 1.05, y: -6 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="text-center p-8 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:border-[#1A3A6B]/10 transition-shadow duration-300 cursor-default group h-full"
                >
                  <div className="w-16 h-16 rounded-2xl bg-[#1A3A6B]/5 group-hover:bg-[#1A3A6B]/10 flex items-center justify-center mx-auto mb-6 transition-colors duration-300">
                    <feature.icon className="w-8 h-8 text-[#1A3A6B]" />
                  </div>
                  <h3 className="font-display font-bold text-gray-900 text-lg mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ── Stats Section ── */}
      <section className="relative py-20 md:py-24 bg-[#1A3A6B] overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#F4A524] to-transparent opacity-60" />
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#F4A524]/5 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-white/5 blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <ScrollReveal>
            <div className="text-center mb-14">
              <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-[#F4A524] mb-4">
                En numeros
              </span>
              <h2 className="font-display font-black text-3xl md:text-4xl text-white">
                El evento mas grande de ingenieria civil
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {stats.map((stat, idx) => (
              <ScrollReveal key={idx} delay={idx * 0.1} direction="up">
                <div className="text-center">
                  <div className="text-4xl sm:text-5xl md:text-6xl font-display font-black text-[#F4A524] mb-2">
                    <AnimatedCounter
                      target={stat.value}
                      suffix={stat.suffix}
                      duration={2.5}
                      className="text-4xl sm:text-5xl md:text-6xl font-display font-black text-[#F4A524]"
                    />
                  </div>
                  <p className="text-blue-200 text-sm sm:text-base font-medium tracking-wide uppercase">
                    {stat.label}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Schedule Preview Section ── */}
      <section className="py-20 md:py-28 bg-gray-50 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(244,165,36,0.04)_0%,_transparent_70%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <ScrollReveal direction="left">
            <div className="text-center mb-14">
              <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-[#F4A524] mb-4">
                Programa
              </span>
              <h2 className="font-display font-black text-3xl md:text-4xl lg:text-5xl text-gray-900">
                Programa del Evento
              </h2>
              <p className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto mt-5 leading-relaxed">
                Seis dias de actividades, conferencias y talleres
              </p>
            </div>
          </ScrollReveal>

          {/* Day cards preview */}
          <StaggerContainer
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-12"
            stagger={0.08}
          >
            {[1, 2, 3, 4, 5, 6].map((day) => (
              <StaggerItem key={day}>
                <motion.div
                  whileHover={{ scale: 1.06, y: -4 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="bg-white rounded-xl p-5 text-center border border-gray-100 hover:border-[#1A3A6B]/20 hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-full bg-[#1A3A6B]/5 flex items-center justify-center mx-auto mb-3">
                    <HiCalendar className="w-6 h-6 text-[#1A3A6B]" />
                  </div>
                  <p className="font-display font-bold text-[#1A3A6B] text-sm">
                    Dia {day}
                  </p>
                  <p className="text-xs text-gray-400 mt-1 font-medium">
                    {14 + day} Ago
                  </p>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>

          {/* Schedule items preview */}
          {schedule.length > 0 && (
            <ScrollReveal direction="up" delay={0.2}>
              <div className="max-w-3xl mx-auto mb-12 space-y-4">
                {schedule.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1, duration: 0.5 }}
                    className="flex items-center gap-4 bg-white rounded-xl p-4 border border-gray-100 hover:border-[#1A3A6B]/10 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex-shrink-0 w-16 text-center">
                      <span className="text-xs font-bold text-[#1A3A6B] bg-[#1A3A6B]/5 rounded-lg px-2 py-1">
                        {item.time || item.start_time || ''}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-bold text-gray-900 text-sm truncate">
                        {item.title || item.name || ''}
                      </p>
                      {(item.speaker || item.location) && (
                        <p className="text-xs text-gray-400 mt-0.5 truncate">
                          {item.speaker} {item.location && `· ${item.location}`}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollReveal>
          )}

          <ScrollReveal delay={0.3}>
            <div className="text-center">
              <Link
                to="/schedule"
                className="inline-flex items-center justify-center px-8 py-4 bg-[#1A3A6B] text-white font-bold rounded-xl hover:bg-[#1A3A6B]/90 shadow-lg shadow-[#1A3A6B]/20 hover:shadow-xl hover:shadow-[#1A3A6B]/30 transition-all duration-300 group"
              >
                Ver cronograma completo
                <HiArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Sponsors Section ── */}
      <section className="py-20 md:py-28 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(26,58,107,0.02)_0%,_transparent_70%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <ScrollReveal>
            <div className="text-center mb-14">
              <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-[#F4A524] mb-4">
                Aliados
              </span>
              <h2 className="font-display font-black text-3xl md:text-4xl lg:text-5xl text-gray-900">
                Nuestros Patrocinadores
              </h2>
              <p className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto mt-5 leading-relaxed">
                Empresas que apoyan el desarrollo de la ingenieria civil
              </p>
            </div>
          </ScrollReveal>

          {hasSponsors ? (
            <div className="space-y-12">
              {tierOrder.map((tier) => {
                const items = sponsors[tier];
                if (!Array.isArray(items) || items.length === 0) return null;
                const config = tierConfig[tier];
                return (
                  <ScrollReveal key={tier} delay={0.1}>
                    <div>
                      <div className="flex items-center gap-3 mb-6">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: config.color }}
                        />
                        <h3 className="font-display font-bold text-lg text-gray-700 tracking-wide uppercase">
                          {config.label}
                        </h3>
                        <div className="flex-1 h-px bg-gray-200" />
                      </div>
                      <StaggerContainer
                        className={`grid ${config.cols} gap-4`}
                        stagger={0.08}
                      >
                        {items.map((sponsor, idx) => (
                          <StaggerItem key={sponsor.id || idx}>
                            <motion.div
                              whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.08)' }}
                              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                              className={`bg-white rounded-xl border border-gray-100 p-6 flex items-center justify-center min-h-[80px] border-l-4 ${config.borderColor} cursor-default`}
                            >
                              {sponsor.logo_url || sponsor.logo ? (
                                <img
                                  src={sponsor.logo_url || sponsor.logo}
                                  alt={sponsor.name}
                                  className="max-h-14 max-w-full object-contain grayscale hover:grayscale-0 transition-all duration-500"
                                />
                              ) : (
                                <span className="text-gray-500 font-display font-bold text-sm text-center">
                                  {sponsor.name}
                                </span>
                              )}
                            </motion.div>
                          </StaggerItem>
                        ))}
                      </StaggerContainer>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          ) : (
            <ScrollReveal delay={0.2}>
              <div className="text-center py-16">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
                  <HiGlobe className="w-10 h-10 text-gray-300" />
                </div>
                <p className="text-gray-400 text-lg font-medium">
                  Proximamente anunciaremos nuestros patrocinadores
                </p>
              </div>
            </ScrollReveal>
          )}
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="py-20 md:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal scale={0.92} duration={0.7}>
            <div className="bg-gradient-to-br from-[#1A3A6B] to-[#0f2847] rounded-3xl p-10 md:p-14 lg:p-20 text-center relative overflow-hidden">
              {/* Decorative glows */}
              <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[#F4A524]/10 blur-3xl" />
              <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-blue-400/10 blur-3xl" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-white/[0.02] blur-3xl" />

              <div className="relative">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-[#F4A524] mb-6">
                    Cupos limitados
                  </span>
                  <h2 className="font-display font-black text-3xl md:text-4xl lg:text-5xl text-white mb-5 leading-tight">
                    No te quedes fuera
                  </h2>
                  <p className="text-blue-200 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
                    Asegura tu lugar en el evento de ingenieria civil mas
                    importante del Peru. Los cupos son limitados.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center px-10 py-4 bg-[#F4A524] text-[#1A3A6B] text-base font-bold rounded-xl shadow-lg shadow-[#F4A524]/30 hover:bg-[#f5b340] hover:shadow-xl hover:shadow-[#F4A524]/40 transition-all duration-300 group"
                  >
                    Registrate ahora
                    <HiArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to="/tickets"
                    className="inline-flex items-center justify-center px-10 py-4 border-2 border-white/20 text-white font-semibold rounded-xl hover:bg-white/10 hover:border-white/30 transition-all duration-300"
                  >
                    Ver entradas
                  </Link>
                </motion.div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
