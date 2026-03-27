import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'motion/react';
import { HiSearch, HiUserGroup, HiStar, HiAcademicCap, HiBriefcase } from 'react-icons/hi';
import { ScrollReveal, StaggerContainer, StaggerItem, AnimatedCounter } from '../components/animations';
import SpeakerCard from '../components/SpeakerCard';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';

const fetchSpeakers = async () => {
  const { data } = await api.get('/workshops/speakers/');
  return data.results || data;
};

export default function SpeakersPage() {
  const [search, setSearch] = useState('');

  const {
    data: speakers = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['speakers'],
    queryFn: fetchSpeakers,
    placeholderData: [],
  });

  const filteredSpeakers = useMemo(() => {
    if (!search.trim()) return speakers;
    const term = search.toLowerCase();
    return speakers.filter(
      (s) =>
        s.name?.toLowerCase().includes(term) ||
        s.topic?.toLowerCase().includes(term) ||
        s.organization?.toLowerCase().includes(term)
    );
  }, [speakers, search]);

  // Featured / keynote speakers: those flagged is_featured, or fallback to first 3
  const keynoteSpeakers = useMemo(() => {
    const featured = speakers.filter((s) => s.is_featured);
    if (featured.length > 0) return featured.slice(0, 3);
    return speakers.slice(0, 3);
  }, [speakers]);

  // Remaining speakers (exclude keynotes from main grid)
  const remainingSpeakers = useMemo(() => {
    const keynoteIds = new Set(keynoteSpeakers.map((s) => s.id));
    return filteredSpeakers.filter((s) => !keynoteIds.has(s.id));
  }, [filteredSpeakers, keynoteSpeakers]);

  // When searching, show all filtered results (don't split keynote/remaining)
  const isSearching = search.trim().length > 0;

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* ── Hero Banner ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1A3A6B] via-[#1A3A6B]/95 to-[#0f2847] py-20 md:py-28">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#F4A524]/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#F4A524]/5 rounded-full blur-3xl" />
          {/* Grid pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
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
              <HiStar className="w-4 h-4 text-[#F4A524]" />
              <span className="text-white/90 text-sm font-medium">CONEIC 2027</span>
            </div>
          </motion.div>

          <motion.h1
            className="font-display font-black text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white mb-5 tracking-tight"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
          >
            Ponentes
          </motion.h1>

          <motion.p
            className="text-blue-200/90 text-lg md:text-xl max-w-2xl mx-auto mb-8 leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          >
            Conoce a los expertos que compartiran su conocimiento y experiencia
            en el congreso nacional mas importante de ingenieria civil
          </motion.p>

          {/* Animated speaker count */}
          {speakers.length > 0 && (
            <motion.div
              className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl px-6 py-3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="flex items-center gap-2">
                <AnimatedCounter
                  target={speakers.length}
                  className="text-[#F4A524] font-display font-black text-3xl"
                  duration={1.5}
                />
                <span className="text-white/80 text-sm font-medium">
                  ponentes de clase mundial
                </span>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* ── Keynote / Featured Speakers ── */}
      {!isSearching && !isLoading && !isError && keynoteSpeakers.length > 0 && (
        <section className="py-16 md:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 bg-[#F4A524]/10 rounded-full px-4 py-1.5 mb-4">
                  <HiStar className="w-4 h-4 text-[#F4A524]" />
                  <span className="text-[#1A3A6B] text-sm font-bold uppercase tracking-wider">
                    Ponentes Destacados
                  </span>
                </div>
                <h2 className="font-display font-black text-2xl sm:text-3xl md:text-4xl text-[#1A3A6B]">
                  Keynote Speakers
                </h2>
              </div>
            </ScrollReveal>

            <StaggerContainer
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
              stagger={0.15}
            >
              {keynoteSpeakers.map((speaker) => (
                <StaggerItem key={speaker.id} withScale>
                  <motion.div
                    className="group relative bg-white rounded-3xl shadow-lg shadow-[#1A3A6B]/5 border border-gray-100 overflow-hidden"
                    whileHover={{ y: -10, boxShadow: '0 30px 60px rgba(26,58,107,0.18)' }}
                    transition={{ duration: 0.35 }}
                  >
                    {/* Featured badge */}
                    <div className="absolute top-4 right-4 z-10">
                      <div className="bg-[#F4A524] text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                        <HiStar className="w-3 h-3" />
                        Keynote
                      </div>
                    </div>

                    <div className="aspect-[3/4] bg-gradient-to-br from-[#1A3A6B]/5 to-[#1A3A6B]/10 relative overflow-hidden">
                      {(speaker.photo_url || speaker.photo) ? (
                        <img
                          src={speaker.photo_url || speaker.photo}
                          alt={speaker.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1A3A6B]/10 to-[#F4A524]/10">
                          <div className="w-28 h-28 rounded-full bg-[#1A3A6B]/10 flex items-center justify-center border-4 border-[#1A3A6B]/20">
                            <span className="text-5xl font-display font-bold text-[#1A3A6B]">
                              {speaker.name?.[0]?.toUpperCase() || 'P'}
                            </span>
                          </div>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>

                    <div className="p-6">
                      <h3 className="font-display font-bold text-[#1A3A6B] text-xl mb-2">
                        {speaker.name}
                      </h3>
                      {speaker.topic && (
                        <div className="flex items-start gap-2 mb-2">
                          <HiAcademicCap className="w-4 h-4 text-[#F4A524] shrink-0 mt-0.5" />
                          <p className="text-sm text-gray-700 font-medium leading-snug">
                            {speaker.topic}
                          </p>
                        </div>
                      )}
                      {speaker.organization && (
                        <div className="flex items-start gap-2">
                          <HiBriefcase className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                          <p className="text-sm text-gray-500">{speaker.organization}</p>
                        </div>
                      )}
                      {speaker.bio && (
                        <p className="text-xs text-gray-500 mt-3 line-clamp-3 leading-relaxed">
                          {speaker.bio}
                        </p>
                      )}
                    </div>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>
      )}

      {/* ── Search & All Speakers Grid ── */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search bar */}
          <ScrollReveal>
            <div className="max-w-lg mx-auto mb-12">
              <div className="relative group">
                <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#1A3A6B] transition-colors" />
                <input
                  type="text"
                  placeholder="Buscar ponente, tema u organizacion..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 bg-white text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1A3A6B]/20 focus:border-[#1A3A6B] focus:shadow-lg focus:shadow-[#1A3A6B]/5 transition-all duration-300"
                />
              </div>
            </div>
          </ScrollReveal>

          {/* Section heading for remaining speakers */}
          {!isSearching && !isLoading && !isError && remainingSpeakers.length > 0 && (
            <ScrollReveal className="mb-10">
              <h2 className="font-display font-bold text-xl sm:text-2xl text-[#1A3A6B] text-center">
                Todos los Ponentes
              </h2>
              <div className="w-16 h-1 bg-[#F4A524] rounded-full mx-auto mt-3" />
            </ScrollReveal>
          )}

          {/* Content */}
          {isLoading ? (
            <LoadingSpinner size="lg" className="py-16" />
          ) : isError ? (
            <div className="text-center py-16">
              <HiUserGroup className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-red-500 mb-4">No se pudo cargar la lista de ponentes.</p>
              <button
                onClick={() => window.location.reload()}
                className="text-sm text-[#1A3A6B] underline hover:no-underline"
              >
                Intentar de nuevo
              </button>
            </div>
          ) : (isSearching ? filteredSpeakers : remainingSpeakers).length > 0 ? (
            <StaggerContainer
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              stagger={0.08}
            >
              {(isSearching ? filteredSpeakers : remainingSpeakers).map((speaker) => (
                <StaggerItem key={speaker.id}>
                  <SpeakerCard speaker={speaker} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          ) : (
            <ScrollReveal>
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HiUserGroup className="w-10 h-10 text-gray-300" />
                </div>
                <p className="text-gray-500 text-lg">
                  {search
                    ? `No se encontraron ponentes para "${search}".`
                    : 'Proximamente anunciaremos a nuestros ponentes.'}
                </p>
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#1A3A6B] hover:text-[#F4A524] transition-colors"
                  >
                    Limpiar busqueda
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
