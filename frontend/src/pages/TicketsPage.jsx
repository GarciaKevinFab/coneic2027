import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'motion/react';
import {
  HiCheck,
  HiX,
  HiStar,
  HiArrowRight,
  HiTicket,
  HiChevronDown,
  HiLightningBolt,
  HiShieldCheck,
  HiUserGroup,
  HiClock,
} from 'react-icons/hi';
import {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
} from '../components/animations';
import ticketService from '../services/ticketService';

/* ------------------------------------------------------------------ */
/*  Fallback data when the API returns nothing                        */
/* ------------------------------------------------------------------ */
const FALLBACK_TICKETS = [
  {
    id: 1,
    name: 'Estandar',
    description: 'Acceso a las actividades principales del congreso.',
    price: '150.00',
    benefits: [
      'Acceso a ponencias magistrales',
      'Acceso a paneles de discusion',
      'Ceremonia de inauguracion y clausura',
      'Material del congreso digital',
      'Certificado de participacion',
    ],
    includes_workshops: false,
    max_workshop_slots: 0,
    capacity: 300,
    sold_count: 87,
    is_active: true,
  },
  {
    id: 2,
    name: 'VIP',
    description: 'Experiencia completa con talleres y beneficios exclusivos.',
    price: '280.00',
    benefits: [
      'Todo lo del plan Estandar',
      'Acceso a 2 talleres practicos',
      'Kit de bienvenida fisico',
      'Acceso a eventos sociales',
      'Certificado de participacion y talleres',
      'Networking con ponentes',
    ],
    includes_workshops: true,
    max_workshop_slots: 2,
    capacity: 200,
    sold_count: 142,
    is_active: true,
  },
  {
    id: 3,
    name: 'Premium',
    description: 'La experiencia CONEIC mas completa y exclusiva.',
    price: '400.00',
    benefits: [
      'Todo lo del plan VIP',
      'Acceso ilimitado a todos los talleres',
      'Almuerzo incluido todos los dias',
      'Asiento preferencial en ponencias',
      'Acceso a cena de gala',
      'Certificado premium personalizado',
      'Polo y merchandising exclusivo',
      'Acceso prioritario a concursos',
    ],
    includes_workshops: true,
    max_workshop_slots: 99,
    capacity: 100,
    sold_count: 34,
    is_active: true,
  },
];

/* ------------------------------------------------------------------ */
/*  Comparison table features                                         */
/* ------------------------------------------------------------------ */
const COMPARISON_FEATURES = [
  { label: 'Ponencias magistrales', tiers: [true, true, true] },
  { label: 'Paneles de discusion', tiers: [true, true, true] },
  { label: 'Ceremonia de inauguracion y clausura', tiers: [true, true, true] },
  { label: 'Material digital del congreso', tiers: [true, true, true] },
  { label: 'Certificado de participacion', tiers: [true, true, true] },
  { label: 'Talleres practicos', tiers: [false, true, true] },
  { label: 'Kit de bienvenida fisico', tiers: [false, true, true] },
  { label: 'Eventos sociales y networking', tiers: [false, true, true] },
  { label: 'Networking exclusivo con ponentes', tiers: [false, true, true] },
  { label: 'Acceso ilimitado a talleres', tiers: [false, false, true] },
  { label: 'Almuerzo incluido todos los dias', tiers: [false, false, true] },
  { label: 'Asiento preferencial', tiers: [false, false, true] },
  { label: 'Cena de gala', tiers: [false, false, true] },
  { label: 'Merchandising exclusivo', tiers: [false, false, true] },
  { label: 'Acceso prioritario a concursos', tiers: [false, false, true] },
];

/* ------------------------------------------------------------------ */
/*  FAQ items                                                         */
/* ------------------------------------------------------------------ */
const FAQ_ITEMS = [
  {
    q: 'Puedo cambiar mi tipo de entrada despues de comprarla?',
    a: 'Si, puedes solicitar un upgrade de tu entrada hasta 15 dias antes del evento pagando la diferencia de precio. Contacta a nuestro equipo de soporte para gestionar el cambio.',
  },
  {
    q: 'Las entradas son transferibles?',
    a: 'No, todas las entradas son personales e intransferibles. Cada entrada esta vinculada al DNI del participante registrado y se verificara al momento de la acreditacion.',
  },
  {
    q: 'Que metodos de pago aceptan?',
    a: 'Aceptamos transferencias bancarias, Yape, Plin y tarjetas de credito/debito a traves de nuestra pasarela de pago segura. Al completar la compra recibiras un comprobante por correo electronico.',
  },
];

/* ------------------------------------------------------------------ */
/*  Tier visual configuration                                         */
/* ------------------------------------------------------------------ */
const TIER_CONFIG = {
  0: {
    icon: HiTicket,
    gradient: 'from-slate-50 to-white',
    border: 'border-gray-200',
    badge: 'bg-[#1A3A6B]/10 text-[#1A3A6B]',
    priceColor: 'text-[#1A3A6B]',
    btnClass:
      'bg-[#1A3A6B] text-white hover:bg-[#1A3A6B]/90 shadow-lg shadow-[#1A3A6B]/20',
    checkColor: 'text-[#1A3A6B]',
    ringHover: 'hover:ring-[#1A3A6B]/30',
  },
  1: {
    icon: HiStar,
    gradient: 'from-[#F4A524]/5 via-amber-50/50 to-white',
    border: 'border-[#F4A524]',
    badge: 'bg-[#F4A524] text-white',
    priceColor: 'text-[#F4A524]',
    btnClass:
      'bg-gradient-to-r from-[#F4A524] to-amber-500 text-white hover:from-[#F4A524]/90 hover:to-amber-500/90 shadow-lg shadow-[#F4A524]/30',
    checkColor: 'text-[#F4A524]',
    ringHover: 'hover:ring-[#F4A524]/40',
  },
  2: {
    icon: HiShieldCheck,
    gradient: 'from-indigo-50/50 to-white',
    border: 'border-indigo-300',
    badge: 'bg-indigo-600/10 text-indigo-700',
    priceColor: 'text-indigo-700',
    btnClass:
      'bg-gradient-to-r from-indigo-600 to-[#1A3A6B] text-white hover:from-indigo-600/90 hover:to-[#1A3A6B]/90 shadow-lg shadow-indigo-600/20',
    checkColor: 'text-indigo-600',
    ringHover: 'hover:ring-indigo-400/30',
  },
};

/* ------------------------------------------------------------------ */
/*  Capacity / Progress bar component                                 */
/* ------------------------------------------------------------------ */
function CapacityBar({ sold, capacity, isFeatured }) {
  const pct = Math.min(Math.round((sold / capacity) * 100), 100);
  const isUrgent = pct > 70;

  return (
    <div className="mt-4 mb-6">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-gray-500">
          {sold}/{capacity} vendidos
        </span>
        {isUrgent && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full"
          >
            <HiLightningBolt className="w-3 h-3" />
            Cupos limitados
          </motion.span>
        )}
      </div>
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${
            isUrgent
              ? 'bg-gradient-to-r from-red-400 to-red-500'
              : isFeatured
                ? 'bg-gradient-to-r from-[#F4A524] to-amber-400'
                : 'bg-gradient-to-r from-[#1A3A6B] to-blue-500'
          }`}
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  FAQ Accordion item                                                */
/* ------------------------------------------------------------------ */
function FAQItem({ question, answer, isOpen, onToggle }) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="font-semibold text-gray-900 text-sm sm:text-base pr-4">
          {question}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="shrink-0"
        >
          <HiChevronDown className="w-5 h-5 text-gray-400" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="px-6 pb-4 text-sm text-gray-600 leading-relaxed">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Pricing card component                                            */
/* ------------------------------------------------------------------ */
function PricingCard({ ticket, index, isFeatured }) {
  const config = TIER_CONFIG[index] || TIER_CONFIG[0];
  const Icon = config.icon;
  const price = parseFloat(ticket.price);
  const priceWhole = Math.floor(price);
  const priceDecimal = String(Math.round((price % 1) * 100)).padStart(2, '0');
  const sold = ticket.sold_count || 0;
  const capacity = ticket.capacity || 1;

  return (
    <motion.div
      whileHover={{
        y: -12,
        boxShadow: isFeatured
          ? '0 25px 60px -12px rgba(244, 165, 36, 0.35)'
          : '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className={`relative flex flex-col rounded-3xl border-2 p-6 sm:p-8 bg-gradient-to-b ${config.gradient} ${config.border} ${config.ringHover} ring-0 hover:ring-4 transition-all duration-300 ${
        isFeatured
          ? 'md:scale-105 md:-my-4 z-10 shadow-xl shadow-[#F4A524]/10'
          : 'shadow-lg shadow-gray-200/50'
      }`}
    >
      {/* Popular badge */}
      {isFeatured && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-[#F4A524] rounded-full blur-md opacity-40" />
            <span className="relative bg-gradient-to-r from-[#F4A524] to-amber-500 text-white text-xs font-bold px-5 py-2 rounded-full uppercase tracking-widest shadow-lg shadow-[#F4A524]/30 flex items-center gap-1.5">
              <HiStar className="w-3.5 h-3.5" />
              Mas Popular
            </span>
          </motion.div>
        </div>
      )}

      {/* Glowing ring effect for featured */}
      {isFeatured && (
        <div className="absolute inset-0 rounded-3xl pointer-events-none">
          <motion.div
            className="absolute inset-0 rounded-3xl border-2 border-[#F4A524]/20"
            animate={{
              boxShadow: [
                '0 0 0 0px rgba(244, 165, 36, 0.1)',
                '0 0 0 6px rgba(244, 165, 36, 0.05)',
                '0 0 0 0px rgba(244, 165, 36, 0.1)',
              ],
            }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-6 pt-2">
        <motion.div
          className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 ${
            isFeatured
              ? 'bg-gradient-to-br from-[#F4A524] to-amber-500 text-white shadow-lg shadow-[#F4A524]/20'
              : index === 2
                ? 'bg-gradient-to-br from-indigo-500 to-[#1A3A6B] text-white shadow-lg shadow-indigo-500/20'
                : 'bg-[#1A3A6B]/10 text-[#1A3A6B]'
          }`}
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: 'spring', stiffness: 400 }}
        >
          <Icon className="w-7 h-7" />
        </motion.div>

        <h3 className="font-display font-bold text-xl text-gray-900 mb-1">
          {ticket.name}
        </h3>
        <p className="text-sm text-gray-500 leading-relaxed">
          {ticket.description}
        </p>
      </div>

      {/* Price */}
      <div className="text-center mb-6">
        <div className="flex items-start justify-center">
          <span className="text-lg font-semibold text-gray-400 mt-2 mr-1">
            S/
          </span>
          <motion.span
            className={`font-display font-black text-5xl ${config.priceColor}`}
            initial={{ scale: 0.5, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.1 * index }}
          >
            {priceWhole}
          </motion.span>
          <span className={`text-lg font-bold mt-2 ml-0.5 ${config.priceColor} opacity-60`}>
            .{priceDecimal}
          </span>
        </div>
        <span className="text-xs text-gray-400 font-medium">/persona</span>
      </div>

      {/* Divider */}
      <div
        className={`h-px mb-6 ${
          isFeatured
            ? 'bg-gradient-to-r from-transparent via-[#F4A524]/30 to-transparent'
            : 'bg-gradient-to-r from-transparent via-gray-200 to-transparent'
        }`}
      />

      {/* Benefits */}
      <div className="flex-1 mb-6">
        <ul className="space-y-3">
          {ticket.benefits.map((benefit, idx) => (
            <motion.li
              key={idx}
              className="flex items-start gap-3"
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05 * idx + 0.2, duration: 0.3 }}
            >
              <span
                className={`mt-0.5 shrink-0 flex items-center justify-center w-5 h-5 rounded-full ${
                  isFeatured
                    ? 'bg-[#F4A524]/10'
                    : index === 2
                      ? 'bg-indigo-100'
                      : 'bg-[#1A3A6B]/10'
                }`}
              >
                <HiCheck className={`w-3.5 h-3.5 ${config.checkColor}`} />
              </span>
              <span className="text-sm text-gray-600 leading-snug">
                {benefit}
              </span>
            </motion.li>
          ))}
        </ul>
      </div>

      {/* Workshop badge */}
      {ticket.includes_workshops && (
        <div className="mb-4">
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg ${config.badge}`}
          >
            <HiUserGroup className="w-3.5 h-3.5" />
            {ticket.max_workshop_slots >= 99
              ? 'Talleres ilimitados'
              : `${ticket.max_workshop_slots} talleres incluidos`}
          </span>
        </div>
      )}

      {/* Capacity bar */}
      <CapacityBar
        sold={sold}
        capacity={capacity}
        isFeatured={isFeatured}
      />

      {/* CTA Button */}
      <Link
        to="/dashboard/purchase"
        className={`w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold text-sm transition-all group ${config.btnClass}`}
      >
        <HiTicket className="w-5 h-5" />
        Comprar entrada
        <HiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </Link>
    </motion.div>
  );
}

/* ================================================================== */
/*  MAIN PAGE                                                         */
/* ================================================================== */
export default function TicketsPage() {
  const [openFaq, setOpenFaq] = useState(null);

  const { data: apiTickets } = useQuery({
    queryKey: ['ticket-types'],
    queryFn: ticketService.getTypes,
  });

  const tickets =
    apiTickets && Array.isArray(apiTickets) && apiTickets.length > 0
      ? apiTickets.filter((t) => t.is_active)
      : FALLBACK_TICKETS;

  // Find middle index for "featured" treatment
  const featuredIdx = tickets.length === 3 ? 1 : -1;

  return (
    <div className="bg-white">
      {/* ============================================================ */}
      {/* HERO BANNER                                                   */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1A3A6B] via-[#1A3A6B]/95 to-[#0f2647] py-20 md:py-28">
        {/* Decorative background shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#F4A524]/10 blur-3xl"
            animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-blue-400/10 blur-3xl"
            animate={{ scale: [1.1, 1, 1.1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal>
            <motion.div
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-5 py-2 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <HiTicket className="w-4 h-4 text-[#F4A524]" />
              <span className="text-sm font-medium text-blue-200">
                Asegura tu lugar en el CONEIC 2027
              </span>
            </motion.div>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <h1 className="font-display font-black text-4xl sm:text-5xl md:text-6xl text-white mb-4 leading-tight">
              Elige tu{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F4A524] to-amber-400">
                Entrada
              </span>
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <p className="text-blue-200/80 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
              Tres opciones disenadas para que vivas la mejor experiencia del
              congreso nacional de ingenieria civil
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.3}>
            <div className="flex items-center justify-center gap-6 mt-8 text-sm text-blue-300/70">
              <span className="flex items-center gap-1.5">
                <HiShieldCheck className="w-4 h-4" />
                Pago seguro
              </span>
              <span className="flex items-center gap-1.5">
                <HiClock className="w-4 h-4" />
                Confirmacion inmediata
              </span>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ============================================================ */}
      {/* PRICING CARDS                                                 */}
      {/* ============================================================ */}
      <section className="relative py-16 md:py-24 -mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <StaggerContainer
            stagger={0.15}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-center"
          >
            {tickets.map((ticket, idx) => (
              <StaggerItem key={ticket.id || idx} withScale>
                <PricingCard
                  ticket={ticket}
                  index={idx}
                  isFeatured={idx === featuredIdx}
                />
              </StaggerItem>
            ))}
          </StaggerContainer>

          {/* Fine print */}
          <ScrollReveal delay={0.3}>
            <div className="mt-16 text-center space-y-2">
              <p className="text-sm text-gray-400 max-w-2xl mx-auto">
                Todos los precios incluyen IGV. Las entradas son personales e
                intransferibles. Al comprar, aceptas los terminos y condiciones
                del evento.
              </p>
              <p className="text-sm text-gray-400">
                Para inscripciones grupales contactar a{' '}
                <a
                  href="mailto:contacto@coneic2027.pe"
                  className="text-[#1A3A6B] hover:underline font-medium"
                >
                  contacto@coneic2027.pe
                </a>
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ============================================================ */}
      {/* COMPARISON TABLE                                              */}
      {/* ============================================================ */}
      <section className="py-16 md:py-24 bg-gray-50/70">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="font-display font-black text-3xl sm:text-4xl text-gray-900 mb-3">
                Que incluye cada entrada?
              </h2>
              <p className="text-gray-500 max-w-xl mx-auto">
                Compara los beneficios de cada tipo de entrada y elige la que
                mejor se adapte a tus necesidades
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden">
              {/* Table header */}
              <div className="grid grid-cols-4 gap-0 border-b border-gray-100">
                <div className="p-4 sm:p-6">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Beneficio
                  </span>
                </div>
                {tickets.slice(0, 3).map((t, i) => (
                  <div
                    key={t.id || i}
                    className={`p-4 sm:p-6 text-center ${
                      i === featuredIdx ? 'bg-[#F4A524]/5' : ''
                    }`}
                  >
                    <span
                      className={`text-sm font-bold ${
                        i === featuredIdx ? 'text-[#F4A524]' : 'text-gray-900'
                      }`}
                    >
                      {t.name}
                    </span>
                  </div>
                ))}
              </div>

              {/* Table rows */}
              {COMPARISON_FEATURES.map((feature, fIdx) => (
                <motion.div
                  key={fIdx}
                  className={`grid grid-cols-4 gap-0 ${
                    fIdx < COMPARISON_FEATURES.length - 1
                      ? 'border-b border-gray-50'
                      : ''
                  } ${fIdx % 2 === 1 ? 'bg-gray-50/30' : ''}`}
                  initial={{ opacity: 0, x: -15 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: fIdx * 0.03, duration: 0.3 }}
                >
                  <div className="p-3 sm:p-4 flex items-center">
                    <span className="text-xs sm:text-sm text-gray-600">
                      {feature.label}
                    </span>
                  </div>
                  {feature.tiers.map((included, tIdx) => (
                    <div
                      key={tIdx}
                      className={`p-3 sm:p-4 flex items-center justify-center ${
                        tIdx === featuredIdx ? 'bg-[#F4A524]/[0.03]' : ''
                      }`}
                    >
                      {included ? (
                        <motion.span
                          className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100"
                          whileHover={{ scale: 1.2 }}
                        >
                          <HiCheck className="w-4 h-4 text-emerald-600" />
                        </motion.span>
                      ) : (
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100">
                          <HiX className="w-3.5 h-3.5 text-gray-300" />
                        </span>
                      )}
                    </div>
                  ))}
                </motion.div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ============================================================ */}
      {/* FAQ SECTION                                                   */}
      {/* ============================================================ */}
      <section className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-10">
              <h2 className="font-display font-black text-3xl sm:text-4xl text-gray-900 mb-3">
                Preguntas frecuentes
              </h2>
              <p className="text-gray-500">
                Resolvemos tus dudas sobre las entradas
              </p>
            </div>
          </ScrollReveal>

          <div className="space-y-3">
            {FAQ_ITEMS.map((item, idx) => (
              <ScrollReveal key={idx} delay={0.1 * idx}>
                <FAQItem
                  question={item.q}
                  answer={item.a}
                  isOpen={openFaq === idx}
                  onToggle={() =>
                    setOpenFaq(openFaq === idx ? null : idx)
                  }
                />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* BOTTOM CTA                                                    */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1A3A6B] to-[#0f2647] py-16 md:py-20">
        {/* Decorative */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#F4A524]/5 blur-3xl"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal>
            <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-white mb-4">
              No te quedes sin tu{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F4A524] to-amber-400">
                entrada
              </span>
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <p className="text-blue-200/70 text-lg max-w-2xl mx-auto mb-8">
              Los cupos son limitados y se agotan rapidamente. Asegura tu lugar
              en el evento de ingenieria civil mas importante del Peru.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <Link
              to="/dashboard/purchase"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-[#F4A524] to-amber-500 text-white font-bold text-lg px-10 py-4 rounded-2xl shadow-xl shadow-[#F4A524]/30 hover:shadow-[#F4A524]/50 transition-all group"
            >
              <HiTicket className="w-6 h-6" />
              Comprar mi entrada ahora
              <HiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
