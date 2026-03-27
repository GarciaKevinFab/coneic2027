import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'motion/react';
import { HiSearch, HiAcademicCap, HiLightningBolt, HiUserGroup, HiCollection } from 'react-icons/hi';
import { ScrollReveal, StaggerContainer, StaggerItem, AnimatedCounter } from '../components/animations';
import workshopService from '../services/workshopService';
import WorkshopCard from '../components/WorkshopCard';
import LoadingSpinner from '../components/LoadingSpinner';

// Color map for workshop type chips
const typeColorMap = {
  taller: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', activeBg: 'bg-blue-600', activeText: 'text-white' },
  conferencia: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', activeBg: 'bg-purple-600', activeText: 'text-white' },
  seminario: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', activeBg: 'bg-emerald-600', activeText: 'text-white' },
  laboratorio: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', activeBg: 'bg-orange-600', activeText: 'text-white' },
  charla: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200', activeBg: 'bg-pink-600', activeText: 'text-white' },
  mesa_redonda: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', activeBg: 'bg-teal-600', activeText: 'text-white' },
  curso: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', activeBg: 'bg-indigo-600', activeText: 'text-white' },
  workshop: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', activeBg: 'bg-cyan-600', activeText: 'text-white' },
};

// Fallback palette for types not in the map — cycles through distinct colors
const fallbackColors = [
  { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', activeBg: 'bg-rose-600', activeText: 'text-white' },
  { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', activeBg: 'bg-amber-600', activeText: 'text-white' },
  { bg: 'bg-lime-50', text: 'text-lime-700', border: 'border-lime-200', activeBg: 'bg-lime-600', activeText: 'text-white' },
  { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', activeBg: 'bg-sky-600', activeText: 'text-white' },
  { bg: 'bg-fuchsia-50', text: 'text-fuchsia-700', border: 'border-fuchsia-200', activeBg: 'bg-fuchsia-600', activeText: 'text-white' },
];

function getTypeColors(type, index) {
  const key = type?.toLowerCase().replace(/\s+/g, '_');
  return typeColorMap[key] || fallbackColors[index % fallbackColors.length];
}

export default function WorkshopsPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const {
    data: workshops = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['workshops'],
    queryFn: workshopService.getAll,
    placeholderData: [],
  });

  // Extract unique types for the filter chips
  const types = useMemo(() => {
    const set = new Set();
    workshops.forEach((w) => {
      if (w.workshop_type || w.type) set.add(w.workshop_type || w.type);
    });
    return Array.from(set);
  }, [workshops]);

  const filteredWorkshops = useMemo(() => {
    let result = workshops;
    if (typeFilter !== 'all') {
      result = result.filter((w) => (w.workshop_type || w.type) === typeFilter);
    }
    if (search.trim()) {
      const term = search.toLowerCase();
      result = result.filter(
        (w) =>
          w.name?.toLowerCase().includes(term) ||
          w.description?.toLowerCase().includes(term) ||
          w.speaker_name?.toLowerCase().includes(term)
      );
    }
    return result;
  }, [workshops, typeFilter, search]);

  // Total capacity across all workshops
  const totalCapacity = useMemo(() => {
    return workshops.reduce((sum, w) => sum + (w.capacity || w.max_capacity || 0), 0);
  }, [workshops]);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* ── Hero Banner ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1A3A6B] via-[#15325c] to-[#0f2847] py-20 md:py-28">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -left-20 w-80 h-80 bg-[#F4A524]/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-[#F4A524]/5 rounded-full blur-3xl" />
          <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          {/* Dot pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
              backgroundSize: '30px 30px',
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2 mb-6">
              <HiLightningBolt className="w-4 h-4 text-[#F4A524]" />
              <span className="text-white/90 text-sm font-medium">Aprendizaje Practico</span>
            </div>
          </motion.div>

          <motion.h1
            className="font-display font-black text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white mb-5 tracking-tight"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
          >
            Talleres
          </motion.h1>

          <motion.p
            className="text-blue-200/90 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          >
            Talleres practicos e interactivos impartidos por profesionales
            destacados de la ingenieria civil. Aprende haciendo.
          </motion.p>

          {/* Animated stats */}
          {workshops.length > 0 && (
            <motion.div
              className="inline-flex flex-wrap items-center justify-center gap-4 sm:gap-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl px-5 py-3">
                <HiCollection className="w-5 h-5 text-[#F4A524]" />
                <AnimatedCounter
                  target={workshops.length}
                  className="text-[#F4A524] font-display font-black text-2xl"
                  duration={1.5}
                />
                <span className="text-white/80 text-sm font-medium">talleres disponibles</span>
              </div>
              {totalCapacity > 0 && (
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl px-5 py-3">
                  <HiUserGroup className="w-5 h-5 text-[#F4A524]" />
                  <AnimatedCounter
                    target={totalCapacity}
                    className="text-[#F4A524] font-display font-black text-2xl"
                    duration={1.8}
                  />
                  <span className="text-white/80 text-sm font-medium">cupos totales</span>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </section>

      {/* ── Filters Section ── */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="space-y-6 mb-12">
              {/* Search bar */}
              <div className="max-w-lg mx-auto">
                <div className="relative group">
                  <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#1A3A6B] transition-colors" />
                  <input
                    type="text"
                    placeholder="Buscar taller o ponente..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 bg-white text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1A3A6B]/20 focus:border-[#1A3A6B] focus:shadow-lg focus:shadow-[#1A3A6B]/5 transition-all duration-300"
                  />
                </div>
              </div>

              {/* Type filter chips */}
              {types.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-2.5">
                  {/* "All" chip */}
                  <motion.button
                    onClick={() => setTypeFilter('all')}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border transition-colors duration-200 ${
                      typeFilter === 'all'
                        ? 'bg-[#1A3A6B] text-white border-[#1A3A6B] shadow-md shadow-[#1A3A6B]/20'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <HiCollection className="w-4 h-4" />
                    Todos
                  </motion.button>

                  {types.map((type, index) => {
                    const colors = getTypeColors(type, index);
                    const isActive = typeFilter === type;
                    return (
                      <motion.button
                        key={type}
                        onClick={() => setTypeFilter(type)}
                        className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border capitalize transition-colors duration-200 ${
                          isActive
                            ? `${colors.activeBg} ${colors.activeText} border-transparent shadow-md`
                            : `${colors.bg} ${colors.text} ${colors.border} hover:shadow-sm`
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {type}
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </div>
          </ScrollReveal>

          {/* Content */}
          {isLoading ? (
            <LoadingSpinner size="lg" className="py-16" />
          ) : isError ? (
            <div className="text-center py-16">
              <HiAcademicCap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-red-500 mb-4">No se pudo cargar la lista de talleres.</p>
              <button
                onClick={() => window.location.reload()}
                className="text-sm text-[#1A3A6B] underline hover:no-underline"
              >
                Intentar de nuevo
              </button>
            </div>
          ) : filteredWorkshops.length > 0 ? (
            <>
              {/* Results count */}
              <ScrollReveal className="mb-6">
                <p className="text-sm text-gray-500 text-center">
                  Mostrando{' '}
                  <span className="font-semibold text-[#1A3A6B]">{filteredWorkshops.length}</span>{' '}
                  {filteredWorkshops.length === 1 ? 'taller' : 'talleres'}
                  {typeFilter !== 'all' && (
                    <> de tipo <span className="font-semibold capitalize text-[#1A3A6B]">{typeFilter}</span></>
                  )}
                </p>
              </ScrollReveal>

              <StaggerContainer
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                stagger={0.08}
              >
                {filteredWorkshops.map((workshop) => (
                  <StaggerItem key={workshop.id}>
                    <WorkshopCard workshop={workshop} />
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </>
          ) : (
            <ScrollReveal>
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HiAcademicCap className="w-10 h-10 text-gray-300" />
                </div>
                <p className="text-gray-500 text-lg">
                  {search || typeFilter !== 'all'
                    ? 'No se encontraron talleres con los filtros seleccionados.'
                    : 'Proximamente anunciaremos los talleres disponibles.'}
                </p>
                {(search || typeFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setSearch('');
                      setTypeFilter('all');
                    }}
                    className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#1A3A6B] hover:text-[#F4A524] transition-colors"
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>
            </ScrollReveal>
          )}
        </div>
      </section>
    </div>
  );
}
