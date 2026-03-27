import { useQuery } from '@tanstack/react-query';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import {
  HiAcademicCap,
  HiEye,
  HiHeart,
  HiUserGroup,
  HiCalendar,
  HiLocationMarker,
  HiOfficeBuilding,
  HiStar,
  HiGlobeAlt,
  HiArrowRight,
} from 'react-icons/hi';
import institutionalService from '../services/institutionalService';
import { ScrollReveal, StaggerContainer, StaggerItem } from '../components/animations';
import LoadingSpinner from '../components/LoadingSpinner';

const KEY_FACTS = [
  {
    icon: HiStar,
    label: 'Edicion',
    value: 'XXXIV',
    description: 'Trigesima cuarta edicion del congreso',
    color: '#F4A524',
  },
  {
    icon: HiAcademicCap,
    label: 'Universidad Sede',
    value: 'UNCP',
    description: 'Universidad Nacional del Centro del Peru',
    color: '#1A3A6B',
  },
  {
    icon: HiLocationMarker,
    label: 'Ciudad',
    value: 'Huancayo',
    description: 'Junin, Peru - 3,271 m.s.n.m.',
    color: '#16a34a',
  },
  {
    icon: HiCalendar,
    label: 'Fechas',
    value: '15 - 20 Ago',
    description: 'Agosto 2027 - 6 dias de congreso',
    color: '#dc2626',
  },
];

const MISSION_VISION_HISTORY = [
  {
    icon: HiAcademicCap,
    title: 'Mision',
    text: 'Fomentar el desarrollo academico y profesional de los estudiantes de ingenieria civil del Peru, creando espacios de aprendizaje, innovacion y networking que contribuyan a la formacion de profesionales de excelencia comprometidos con el desarrollo nacional.',
    iconBg: 'bg-[#1A3A6B]/10',
    iconColor: 'text-[#1A3A6B]',
    borderColor: 'border-[#1A3A6B]/20',
  },
  {
    icon: HiEye,
    title: 'Vision',
    text: 'Ser el congreso estudiantil de ingenieria civil referente en Latinoamerica, reconocido por su excelencia academica, innovacion tecnologica y contribucion al desarrollo de la infraestructura y la ingenieria del Peru.',
    iconBg: 'bg-[#F4A524]/10',
    iconColor: 'text-[#F4A524]',
    borderColor: 'border-[#F4A524]/20',
  },
  {
    icon: HiHeart,
    title: 'Historia',
    text: 'Desde 1992, CONEIC ha reunido a miles de estudiantes de ingenieria civil de todo el Peru. Cada ano, una universidad sede asume el honor de organizar este evento que se ha convertido en tradicion y pilar del desarrollo academico estudiantil en nuestra nacion.',
    iconBg: 'bg-green-50',
    iconColor: 'text-green-600',
    borderColor: 'border-green-200',
  },
];

function getInitials(name) {
  if (!name) return '??';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');
}

export default function AboutPage() {
  const {
    data: eventInfo,
    isLoading: loadingEvent,
    isError: eventError,
  } = useQuery({
    queryKey: ['event-info'],
    queryFn: institutionalService.getEventInfo,
  });

  const {
    data: committee = [],
    isLoading: loadingCommittee,
    isError: committeeError,
  } = useQuery({
    queryKey: ['committee'],
    queryFn: institutionalService.getCommittee,
    placeholderData: [],
  });

  const eventTitle = eventInfo?.title || 'XXXIV CONEIC Huancayo 2027';
  const eventDescription =
    eventInfo?.description ||
    'El Congreso Nacional de Estudiantes de Ingenieria Civil (CONEIC) es el evento academico mas importante organizado por y para estudiantes de ingenieria civil en el Peru. Reune a las mejores mentes jovenes del pais para compartir conocimiento, innovar y construir el futuro de la ingenieria peruana.';
  const eventDate = eventInfo?.date || '15 - 20 de Agosto, 2027';
  const eventLocation = eventInfo?.location || 'Huancayo, Junin - Peru';

  return (
    <div className="overflow-hidden">
      {/* ───────── Hero Banner ───────── */}
      <section className="relative bg-gradient-to-br from-[#1A3A6B] via-[#0f2847] to-[#1A3A6B] py-24 md:py-36 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#F4A524]/10 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-[30rem] h-[30rem] rounded-full bg-[#F4A524]/5 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50rem] h-[50rem] rounded-full border border-white/5" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#F4A524]/15 text-[#F4A524] text-sm font-semibold tracking-wide mb-6 border border-[#F4A524]/20">
              XXXIV Edicion &middot; Huancayo, Junin
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
            className="font-display font-black text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white mb-6 leading-tight"
          >
            Sobre{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F4A524] to-[#f5c266]">
              CONEIC 2027
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-blue-200/80 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed"
          >
            Conoce la historia y la vision detras del congreso de ingenieria civil mas
            importante del Peru, este ano desde el corazon de los Andes: Huancayo.
          </motion.p>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="mt-12"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="w-6 h-10 mx-auto rounded-full border-2 border-white/20 flex items-start justify-center pt-2"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#F4A524]" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ───────── Event Info Section ───────── */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loadingEvent ? (
            <LoadingSpinner size="lg" className="py-16" />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              {/* Text column */}
              <ScrollReveal direction="left">
                <div>
                  <span className="inline-block text-[#F4A524] font-semibold text-sm tracking-wider uppercase mb-4">
                    Acerca del Evento
                  </span>
                  <h2 className="font-display font-black text-3xl sm:text-4xl text-gray-900 mb-6 leading-tight">
                    {eventTitle}
                  </h2>
                  <div className="space-y-4 text-gray-600 leading-relaxed text-lg">
                    <p>{eventDescription}</p>
                    {!eventInfo?.description && (
                      <p>
                        En su XXXIV edicion, CONEIC reune a mas de 500 participantes de
                        universidades de todo el pais, junto a ponentes nacionales e
                        internacionales de primer nivel, en una semana de actividades
                        academicas, talleres practicos, concursos y eventos de integracion.
                      </p>
                    )}
                  </div>
                  <div className="mt-8 flex flex-col sm:flex-row gap-5">
                    <div className="flex items-center gap-3 text-gray-700">
                      <div className="w-10 h-10 rounded-xl bg-[#F4A524]/10 flex items-center justify-center flex-shrink-0">
                        <HiCalendar className="w-5 h-5 text-[#F4A524]" />
                      </div>
                      <span className="font-medium">{eventDate}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <div className="w-10 h-10 rounded-xl bg-[#1A3A6B]/10 flex items-center justify-center flex-shrink-0">
                        <HiLocationMarker className="w-5 h-5 text-[#1A3A6B]" />
                      </div>
                      <span className="font-medium">{eventLocation}</span>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              {/* Placeholder card column */}
              <ScrollReveal direction="right" delay={0.15}>
                <motion.div
                  whileHover={{ scale: 1.02, y: -4 }}
                  transition={{ duration: 0.3 }}
                  className="relative rounded-3xl overflow-hidden shadow-2xl shadow-[#1A3A6B]/10"
                >
                  {eventInfo?.banner_url ? (
                    <img
                      src={eventInfo.banner_url}
                      alt={eventTitle}
                      className="w-full h-full object-cover aspect-[4/3]"
                    />
                  ) : (
                    <div className="aspect-[4/3] bg-gradient-to-br from-[#1A3A6B] via-[#0f2847] to-[#1A3A6B] flex flex-col items-center justify-center p-10 text-center relative">
                      <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-[#F4A524]/10 blur-2xl" />
                        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-[#F4A524]/5 blur-2xl" />
                      </div>
                      <div className="relative">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[#F4A524]/15 border border-[#F4A524]/30 flex items-center justify-center">
                          <HiAcademicCap className="w-10 h-10 text-[#F4A524]" />
                        </div>
                        <h3 className="font-display font-black text-3xl md:text-4xl text-white mb-3">
                          XXXIV CONEIC
                        </h3>
                        <p className="text-[#F4A524] text-xl font-bold mb-4">
                          Huancayo 2027
                        </p>
                        <div className="w-16 h-0.5 bg-[#F4A524]/30 mx-auto mb-4" />
                        <p className="text-blue-200/70 italic text-sm max-w-xs mx-auto">
                          &ldquo;Somos ingenieria, somos civil, somos transformacion&rdquo;
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              </ScrollReveal>
            </div>
          )}
        </div>
      </section>

      {/* ───────── Key Facts Section ───────── */}
      <section className="py-20 md:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <span className="inline-block text-[#F4A524] font-semibold text-sm tracking-wider uppercase mb-3">
                Datos Clave
              </span>
              <h2 className="font-display font-black text-3xl sm:text-4xl text-gray-900">
                CONEIC en Numeros
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {KEY_FACTS.map((fact, i) => (
              <ScrollReveal key={fact.label} delay={i * 0.1}>
                <motion.div
                  whileHover={{ scale: 1.04, y: -6 }}
                  transition={{ duration: 0.25 }}
                  className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-shadow duration-300 text-center group"
                >
                  <div
                    className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:rotate-6"
                    style={{ backgroundColor: `${fact.color}15` }}
                  >
                    <fact.icon
                      className="w-7 h-7"
                      style={{ color: fact.color }}
                    />
                  </div>
                  <p className="text-xs font-semibold tracking-wider uppercase text-gray-400 mb-2">
                    {fact.label}
                  </p>
                  <p
                    className="font-display font-black text-3xl mb-2"
                    style={{ color: fact.color }}
                  >
                    {fact.value}
                  </p>
                  <p className="text-gray-500 text-sm">{fact.description}</p>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── Mission / Vision / History ───────── */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <span className="inline-block text-[#F4A524] font-semibold text-sm tracking-wider uppercase mb-3">
                Nuestros Pilares
              </span>
              <h2 className="font-display font-black text-3xl sm:text-4xl text-gray-900">
                Mision, Vision e Historia
              </h2>
            </div>
          </ScrollReveal>

          <StaggerContainer
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            stagger={0.15}
          >
            {MISSION_VISION_HISTORY.map((item) => (
              <StaggerItem key={item.title} withScale>
                <motion.div
                  whileHover={{ scale: 1.03, y: -6 }}
                  transition={{ duration: 0.25 }}
                  className={`bg-white rounded-2xl p-8 border ${item.borderColor} shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-shadow duration-300 h-full`}
                >
                  <div
                    className={`w-14 h-14 rounded-2xl ${item.iconBg} flex items-center justify-center mb-6`}
                  >
                    <item.icon className={`w-7 h-7 ${item.iconColor}`} />
                  </div>
                  <h3 className="font-display font-bold text-xl text-gray-900 mb-4">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">{item.text}</p>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ───────── What is CONEIC ───────── */}
      <section className="py-20 md:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16 items-center">
            <ScrollReveal direction="left" className="lg:col-span-3">
              <div>
                <span className="inline-block text-[#F4A524] font-semibold text-sm tracking-wider uppercase mb-3">
                  Nuestra Historia
                </span>
                <h2 className="font-display font-black text-3xl sm:text-4xl text-gray-900 mb-8">
                  &iquest;Que es CONEIC?
                </h2>
                <div className="space-y-5 text-gray-600 leading-relaxed text-lg">
                  <p>
                    El <strong className="text-gray-900">Congreso Nacional de Estudiantes de Ingenieria Civil (CONEIC)</strong> es
                    el evento academico y de integracion mas importante organizado por y
                    para estudiantes de ingenieria civil en el Peru. Su primera edicion se
                    celebro en <strong className="text-gray-900">1992 en Cajamarca</strong>,
                    estableciendo una tradicion que ha perdurado por mas de tres decadas.
                  </p>
                  <p>
                    Desde entonces, CONEIC ha recorrido las principales universidades del
                    pais. Ciudades como Lima, Arequipa, Trujillo, Cusco, Puno, Tacna,
                    Huancavelica, Ica, Piura, Chiclayo, Ayacucho y muchas mas han sido
                    sedes de este prestigioso congreso, permitiendo que cada edicion
                    refleje la riqueza cultural y academica de cada region.
                  </p>
                  <p>
                    En 2027, la ciudad de <strong className="text-gray-900">Huancayo</strong> y
                    la <strong className="text-gray-900">Universidad Nacional del Centro del Peru (UNCP)</strong> tienen
                    el honor de ser la sede de la XXXIV edicion, reuniendo a mas de 500
                    estudiantes de todo el pais bajo el lema{' '}
                    <em className="text-[#1A3A6B] font-semibold">
                      &ldquo;Somos ingenieria, somos civil, somos transformacion&rdquo;
                    </em>
                    .
                  </p>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={0.2} className="lg:col-span-2">
              <div className="space-y-4">
                {[
                  { year: '1992', text: 'Primera edicion en Cajamarca' },
                  { year: '2000', text: 'El congreso se consolida a nivel nacional' },
                  { year: '2010', text: 'Mas de 20 universidades participantes' },
                  { year: '2020', text: 'Adaptacion a formato virtual e hibrido' },
                  { year: '2027', text: 'XXXIV Edicion en Huancayo, Junin', highlight: true },
                ].map((milestone) => (
                  <motion.div
                    key={milestone.year}
                    whileHover={{ x: 6 }}
                    transition={{ duration: 0.2 }}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-colors duration-200 ${
                      milestone.highlight
                        ? 'bg-[#1A3A6B] border-[#1A3A6B]'
                        : 'bg-white border-gray-100 hover:border-[#F4A524]/30'
                    }`}
                  >
                    <span
                      className={`font-display font-black text-lg flex-shrink-0 w-16 text-center ${
                        milestone.highlight ? 'text-[#F4A524]' : 'text-[#1A3A6B]'
                      }`}
                    >
                      {milestone.year}
                    </span>
                    <div
                      className={`w-px h-8 flex-shrink-0 ${
                        milestone.highlight ? 'bg-white/20' : 'bg-gray-200'
                      }`}
                    />
                    <p
                      className={`text-sm font-medium ${
                        milestone.highlight ? 'text-white' : 'text-gray-600'
                      }`}
                    >
                      {milestone.text}
                    </p>
                  </motion.div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ───────── Organizing Committee ───────── */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <span className="inline-block text-[#F4A524] font-semibold text-sm tracking-wider uppercase mb-3">
                Nuestro Equipo
              </span>
              <h2 className="font-display font-black text-3xl sm:text-4xl text-gray-900">
                Comite Organizador
              </h2>
              <p className="text-gray-500 max-w-2xl mx-auto mt-4 text-lg">
                El equipo de estudiantes que hace posible la XXXIV edicion de CONEIC
              </p>
            </div>
          </ScrollReveal>

          {loadingCommittee ? (
            <LoadingSpinner size="lg" className="py-16" />
          ) : committeeError ? (
            <ScrollReveal>
              <div className="text-center py-12 px-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-red-50 flex items-center justify-center mb-4">
                  <HiGlobeAlt className="w-8 h-8 text-red-400" />
                </div>
                <p className="text-red-500 font-medium">
                  No se pudo cargar el comite organizador.
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  Intenta recargar la pagina.
                </p>
              </div>
            </ScrollReveal>
          ) : committee.length > 0 ? (
            <StaggerContainer
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
              stagger={0.08}
            >
              {committee.map((member, idx) => (
                <StaggerItem key={member.id || idx} withScale>
                  <motion.div
                    whileHover={{ scale: 1.04, y: -6 }}
                    transition={{ duration: 0.25 }}
                    className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-shadow duration-300 text-center group"
                  >
                    <div className="w-20 h-20 rounded-2xl mx-auto mb-5 overflow-hidden flex-shrink-0">
                      {member.photo_url ? (
                        <img
                          src={member.photo_url}
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#1A3A6B] to-[#0f2847] flex items-center justify-center">
                          <span className="text-white font-display font-bold text-lg">
                            {getInitials(member.name)}
                          </span>
                        </div>
                      )}
                    </div>
                    <h4 className="font-display font-bold text-gray-900 text-base mb-1">
                      {member.name}
                    </h4>
                    <p className="text-sm text-[#F4A524] font-semibold mb-1">
                      {member.role}
                    </p>
                    {member.university && (
                      <p className="text-xs text-gray-400 mt-1">{member.university}</p>
                    )}
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          ) : (
            <ScrollReveal>
              <div className="text-center py-12 px-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#1A3A6B]/5 flex items-center justify-center mb-4">
                  <HiUserGroup className="w-8 h-8 text-[#1A3A6B]/30" />
                </div>
                <p className="text-gray-400 font-medium">
                  Proximamente anunciaremos al comite organizador
                </p>
              </div>
            </ScrollReveal>
          )}
        </div>
      </section>

      {/* ───────── Venue Section ───────── */}
      <section className="py-20 md:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.3 }}
              className="relative rounded-3xl overflow-hidden shadow-2xl shadow-[#1A3A6B]/10"
            >
              <div className="bg-gradient-to-br from-[#1A3A6B] via-[#0f2847] to-[#1A3A6B] p-10 md:p-16 relative">
                {/* Decorative blobs */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-[#F4A524]/10 blur-3xl" />
                  <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-[#F4A524]/5 blur-3xl" />
                  <div className="absolute top-10 right-10 w-32 h-32 rounded-full border border-white/5" />
                  <div className="absolute bottom-10 left-10 w-24 h-24 rounded-full border border-white/5" />
                </div>

                <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-[#F4A524]/15 border border-[#F4A524]/30 flex items-center justify-center">
                        <HiOfficeBuilding className="w-6 h-6 text-[#F4A524]" />
                      </div>
                      <span className="text-[#F4A524] font-semibold text-sm tracking-wider uppercase">
                        Sede del Congreso
                      </span>
                    </div>
                    <h2 className="font-display font-black text-3xl sm:text-4xl text-white mb-6 leading-tight">
                      Universidad Nacional del Centro del Peru
                    </h2>
                    <div className="space-y-4 text-blue-200/80 leading-relaxed">
                      <p>
                        La UNCP, fundada en 1959, es una de las principales universidades
                        publicas de la sierra central del Peru. Su campus, ubicado en la
                        ciudad de Huancayo, ofrece las instalaciones ideales para albergar
                        un evento de la magnitud de CONEIC.
                      </p>
                      <p>
                        Huancayo, capital de la region Junin, se encuentra a 3,271 m.s.n.m.
                        en el corazon del Valle del Mantaro. Es conocida por su riqueza
                        cultural, gastronomica y paisajistica, ofreciendo a los asistentes
                        una experiencia unica mas alla de lo academico.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Campus', value: 'Ciudad Universitaria', icon: HiOfficeBuilding },
                      { label: 'Altitud', value: '3,271 m.s.n.m.', icon: HiGlobeAlt },
                      { label: 'Auditorio', value: 'Cap. +1000', icon: HiUserGroup },
                      { label: 'Fundacion', value: '1959', icon: HiAcademicCap },
                    ].map((item) => (
                      <motion.div
                        key={item.label}
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm hover:bg-white/10 transition-colors duration-300"
                      >
                        <item.icon className="w-5 h-5 text-[#F4A524] mb-3" />
                        <p className="text-xs text-blue-200/60 font-medium uppercase tracking-wider mb-1">
                          {item.label}
                        </p>
                        <p className="text-white font-display font-bold text-sm">
                          {item.value}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </ScrollReveal>
        </div>
      </section>

      {/* ───────── CTA Section ───────── */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="relative rounded-3xl overflow-hidden">
              <div className="bg-gradient-to-r from-[#1A3A6B] to-[#0f2847] p-12 md:p-20 text-center relative">
                {/* Decorative */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="absolute -top-10 left-1/4 w-64 h-64 rounded-full bg-[#F4A524]/10 blur-3xl" />
                  <div className="absolute -bottom-10 right-1/4 w-64 h-64 rounded-full bg-[#F4A524]/5 blur-3xl" />
                </div>

                <div className="relative">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                  >
                    <span className="inline-block px-4 py-1.5 rounded-full bg-[#F4A524]/15 text-[#F4A524] text-sm font-semibold tracking-wide mb-6 border border-[#F4A524]/20">
                      15 - 20 de Agosto, 2027
                    </span>
                  </motion.div>

                  <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-white mb-6 leading-tight">
                    Se parte de la{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F4A524] to-[#f5c266]">
                      transformacion
                    </span>
                  </h2>
                  <p className="text-blue-200/80 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
                    Unete a cientos de estudiantes de ingenieria civil de todo el Peru en
                    Huancayo. Inscribete ahora y asegura tu lugar en la XXXIV edicion de
                    CONEIC.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                      <Link
                        to="/registro"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-[#F4A524] text-[#1A3A6B] font-bold rounded-xl hover:bg-[#f5b84d] transition-colors duration-200 shadow-lg shadow-[#F4A524]/25"
                      >
                        Registrate Ahora
                        <HiArrowRight className="w-5 h-5" />
                      </Link>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                      <Link
                        to="/cronograma"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-colors duration-200 border border-white/20"
                      >
                        Ver Cronograma
                      </Link>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
