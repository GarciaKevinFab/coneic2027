import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useQuery } from '@tanstack/react-query';
import {
  HiCalendar,
  HiClock,
  HiLocationMarker,
  HiUser,
  HiViewGrid,
  HiViewList,
  HiStar,
  HiAcademicCap,
  HiLightningBolt,
  HiUserGroup,
  HiMusicNote,
  HiFlag,
  HiPuzzle,
  HiChatAlt2,
} from 'react-icons/hi';
import { ScrollReveal, StaggerContainer, StaggerItem } from '../components/animations';
import scheduleService from '../services/scheduleService';
import ScheduleTimeline from '../components/ScheduleTimeline';
import LoadingSpinner from '../components/LoadingSpinner';
import clsx from 'clsx';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TYPE_CONFIG = {
  keynote: {
    label: 'Ponencia',
    gradient: 'from-[#1A3A6B] to-[#2a5a9b]',
    bg: 'bg-[#1A3A6B]/10',
    text: 'text-[#1A3A6B]',
    border: 'border-[#1A3A6B]/30',
    chipBg: 'bg-[#1A3A6B]',
    icon: HiAcademicCap,
    ring: 'ring-[#1A3A6B]/20',
  },
  workshop: {
    label: 'Taller',
    gradient: 'from-[#F4A524] to-[#e8931a]',
    bg: 'bg-[#F4A524]/10',
    text: 'text-[#b47a12]',
    border: 'border-[#F4A524]/30',
    chipBg: 'bg-[#F4A524]',
    icon: HiLightningBolt,
    ring: 'ring-[#F4A524]/20',
  },
  panel: {
    label: 'Panel',
    gradient: 'from-[#7c3aed] to-[#5b21b6]',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    chipBg: 'bg-purple-600',
    icon: HiChatAlt2,
    ring: 'ring-purple-200',
  },
  ceremony: {
    label: 'Ceremonia',
    gradient: 'from-[#059669] to-[#047857]',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    chipBg: 'bg-emerald-600',
    icon: HiFlag,
    ring: 'ring-emerald-200',
  },
  social: {
    label: 'Social',
    gradient: 'from-[#ec4899] to-[#db2777]',
    bg: 'bg-pink-50',
    text: 'text-pink-700',
    border: 'border-pink-200',
    chipBg: 'bg-pink-500',
    icon: HiMusicNote,
    ring: 'ring-pink-200',
  },
  competition: {
    label: 'Concurso',
    gradient: 'from-[#ef4444] to-[#dc2626]',
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    chipBg: 'bg-red-500',
    icon: HiPuzzle,
    ring: 'ring-red-200',
  },
  break: {
    label: 'Receso',
    gradient: 'from-[#9ca3af] to-[#6b7280]',
    bg: 'bg-gray-50',
    text: 'text-gray-500',
    border: 'border-gray-200',
    chipBg: 'bg-gray-400',
    icon: HiClock,
    ring: 'ring-gray-200',
  },
};

const TYPE_FILTERS = [
  { value: 'all', label: 'Todos', icon: HiViewGrid },
  { value: 'keynote', label: 'Ponencias', icon: HiAcademicCap },
  { value: 'workshop', label: 'Talleres', icon: HiLightningBolt },
  { value: 'panel', label: 'Paneles', icon: HiChatAlt2 },
  { value: 'ceremony', label: 'Ceremonias', icon: HiFlag },
  { value: 'social', label: 'Sociales', icon: HiMusicNote },
  { value: 'competition', label: 'Concursos', icon: HiPuzzle },
];

const DEFAULT_CONFIG = {
  label: 'Actividad',
  gradient: 'from-gray-400 to-gray-500',
  bg: 'bg-gray-50',
  text: 'text-gray-600',
  border: 'border-gray-200',
  chipBg: 'bg-gray-400',
  icon: HiCalendar,
  ring: 'ring-gray-200',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
}

function formatDayName(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  const name = d.toLocaleDateString('es-PE', { weekday: 'short' });
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function getConfig(type) {
  return TYPE_CONFIG[type] || DEFAULT_CONFIG;
}

function getSpeakerName(item) {
  if (!item.speaker && !item.speaker_name) return null;
  if (typeof item.speaker === 'object' && item.speaker?.name) return item.speaker.name;
  return item.speaker_name || item.speaker || null;
}

/** Collect unique time slots from the items of ALL visible days. */
function collectTimeSlots(items) {
  const seen = new Set();
  const slots = [];
  for (const item of items) {
    const key = `${item.start_time}-${item.end_time}`;
    if (!seen.has(key)) {
      seen.add(key);
      slots.push({ start: item.start_time, end: item.end_time, key });
    }
  }
  slots.sort((a, b) => a.start.localeCompare(b.start));
  return slots;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** A single activity block in the grid. */
function GridBlock({ item, index }) {
  const itemType = item.item_type || item.type || 'break';
  const config = getConfig(itemType);
  const IconComp = config.icon;
  const speakerName = getSpeakerName(item);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.45, delay: index * 0.04, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ scale: 1.03, y: -4 }}
      className="group relative"
    >
      <div
        className={clsx(
          'relative overflow-hidden rounded-2xl p-4 h-full',
          'border transition-shadow duration-300',
          'shadow-sm hover:shadow-xl hover:shadow-black/10',
          config.border,
          'bg-white',
        )}
      >
        {/* Gradient accent bar at top */}
        <div
          className={clsx(
            'absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r',
            config.gradient,
          )}
        />

        {/* Header: type badge + icon */}
        <div className="flex items-start justify-between mb-2.5 pt-1">
          <span
            className={clsx(
              'inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white',
              config.chipBg,
            )}
          >
            <IconComp className="w-3 h-3" />
            {config.label}
          </span>
          {item.is_featured && (
            <HiStar className="w-4 h-4 text-[#F4A524] shrink-0" />
          )}
        </div>

        {/* Title */}
        <h4 className="font-display font-bold text-sm leading-snug text-gray-900 mb-2 line-clamp-2 group-hover:text-[#1A3A6B] transition-colors">
          {item.title}
        </h4>

        {/* Time */}
        <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mb-1.5">
          <HiClock className="w-3.5 h-3.5 shrink-0" />
          <span>{item.start_time} - {item.end_time}</span>
        </div>

        {/* Location */}
        {item.location && (
          <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mb-1.5">
            <HiLocationMarker className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{item.location}</span>
          </div>
        )}

        {/* Speaker */}
        {speakerName && (
          <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
            <HiUser className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{speakerName}</span>
          </div>
        )}

        {/* Hover glow */}
        <div
          className={clsx(
            'pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl ring-2',
            config.ring,
          )}
        />
      </div>
    </motion.div>
  );
}

/** The visual grid / table view. */
function ScheduleGrid({ days, activeIdx, filteredEvents }) {
  const currentDay = days[activeIdx];
  const timeSlots = useMemo(() => collectTimeSlots(filteredEvents), [filteredEvents]);

  // Group events by time slot key for the grid
  const eventsBySlot = useMemo(() => {
    const map = {};
    for (const item of filteredEvents) {
      const key = `${item.start_time}-${item.end_time}`;
      if (!map[key]) map[key] = [];
      map[key].push(item);
    }
    return map;
  }, [filteredEvents]);

  if (filteredEvents.length === 0) {
    return (
      <EmptyState />
    );
  }

  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0 pb-4">
      <div className="min-w-[360px] px-4 sm:px-0">
        {/* Time slots */}
        <div className="space-y-6">
          {timeSlots.map((slot, slotIdx) => {
            const items = eventsBySlot[slot.key] || [];
            return (
              <motion.div
                key={slot.key}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.4, delay: slotIdx * 0.06 }}
              >
                {/* Time label */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-2 bg-gradient-to-r from-[#1A3A6B] to-[#2a5a9b] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                    <HiClock className="w-3.5 h-3.5" />
                    {slot.start} - {slot.end}
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-[#1A3A6B]/20 to-transparent" />
                </div>

                {/* Activity cards in this slot */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {items.map((item, i) => (
                    <GridBlock
                      key={item.id || `${slot.key}-${i}`}
                      item={item}
                      index={i}
                    />
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-16"
    >
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-5">
        <HiCalendar className="w-10 h-10 text-gray-300" />
      </div>
      <p className="text-gray-500 text-lg font-medium">No hay eventos para este filtro.</p>
      <p className="text-gray-400 text-sm mt-1">Prueba seleccionando otro dia u otro tipo de actividad.</p>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function SchedulePage() {
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [typeFilter, setTypeFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'timeline'

  const {
    data: scheduleDays = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['schedule'],
    queryFn: scheduleService.getSchedule,
    placeholderData: [],
  });

  // Build day tabs
  const days = useMemo(() => {
    return scheduleDays.map((day, idx) => ({
      idx,
      id: day.id,
      label: day.title || `Dia ${idx + 1}`,
      date: formatDate(day.date),
      dayName: formatDayName(day.date),
      rawDate: day.date,
    }));
  }, [scheduleDays]);

  const activeIdx = selectedDayIdx < days.length ? selectedDayIdx : 0;
  const currentDay = scheduleDays[activeIdx];

  // Filter events by type
  const filteredEvents = useMemo(() => {
    const items = currentDay?.items || [];
    if (typeFilter === 'all') return items;
    return items.filter((e) => (e.item_type || e.type) === typeFilter);
  }, [currentDay, typeFilter]);

  const toggleView = useCallback(() => {
    setViewMode((prev) => (prev === 'grid' ? 'timeline' : 'grid'));
  }, []);

  const handleFilterToggle = useCallback((value) => {
    setTypeFilter((prev) => (prev === value ? 'all' : value));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* ------------------------------------------------------------------ */}
      {/* Hero banner                                                        */}
      {/* ------------------------------------------------------------------ */}
      <ScrollReveal direction="none" duration={0.8}>
        <section className="relative overflow-hidden bg-gradient-to-br from-[#1A3A6B] via-[#1e4a85] to-[#0f2a4f] py-20 md:py-28">
          {/* Decorative elements */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#F4A524]/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-[#F4A524]/5 rounded-full blur-3xl" />
            {/* Grid pattern overlay */}
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)',
                backgroundSize: '48px 48px',
              }}
            />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-4 py-1.5 mb-6"
            >
              <HiCalendar className="w-4 h-4 text-[#F4A524]" />
              <span className="text-sm font-medium text-blue-100">CONEIC 2027 Huancayo</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display font-black text-4xl sm:text-5xl md:text-6xl text-white mb-5"
            >
              Cronograma
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-blue-200/80 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
            >
              Seis dias de conferencias magistrales, talleres especializados,
              concursos y actividades sociales que no te puedes perder.
            </motion.p>

            {/* Stat pills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="flex flex-wrap justify-center gap-3 mt-8"
            >
              {scheduleDays.length > 0 && (
                <>
                  <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm text-blue-100">
                    <HiCalendar className="w-4 h-4 text-[#F4A524]" />
                    {scheduleDays.length} dias
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm text-blue-100">
                    <HiUserGroup className="w-4 h-4 text-[#F4A524]" />
                    {scheduleDays.reduce((acc, d) => acc + (d.items?.length || 0), 0)} actividades
                  </span>
                </>
              )}
            </motion.div>
          </div>
        </section>
      </ScrollReveal>

      {/* ------------------------------------------------------------------ */}
      {/* Main content area                                                  */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <LoadingSpinner size="lg" className="py-20" />
          ) : isError ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 mb-4">
                <HiCalendar className="w-8 h-8 text-red-300" />
              </div>
              <p className="text-red-500 font-medium mb-2">No se pudo cargar el cronograma.</p>
              <button
                onClick={() => window.location.reload()}
                className="text-sm text-[#1A3A6B] font-medium underline underline-offset-2 hover:no-underline"
              >
                Intentar de nuevo
              </button>
            </div>
          ) : (
            <>
              {/* -------------------------------------------------------------- */}
              {/* Controls bar: Day tabs + View toggle                            */}
              {/* -------------------------------------------------------------- */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                {/* Day selector pills */}
                <StaggerContainer
                  className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0"
                  stagger={0.06}
                >
                  {days.map((day) => (
                    <StaggerItem key={day.idx}>
                      <motion.button
                        onClick={() => setSelectedDayIdx(day.idx)}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.97 }}
                        className={clsx(
                          'relative flex flex-col items-center px-5 py-3 rounded-2xl border-2 transition-all shrink-0 min-w-[100px]',
                          activeIdx === day.idx
                            ? 'border-[#1A3A6B] bg-[#1A3A6B] text-white shadow-lg shadow-[#1A3A6B]/25'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-[#1A3A6B]/30 hover:shadow-md',
                        )}
                      >
                        {activeIdx === day.idx && (
                          <motion.div
                            layoutId="activeDayPill"
                            className="absolute inset-0 bg-[#1A3A6B] rounded-2xl"
                            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                            style={{ zIndex: -1 }}
                          />
                        )}
                        <span className={clsx(
                          'text-[10px] font-bold uppercase tracking-wider mb-0.5',
                          activeIdx === day.idx ? 'text-[#F4A524]' : 'text-gray-400'
                        )}>
                          {day.dayName}
                        </span>
                        <span className="font-display font-bold text-sm whitespace-nowrap">
                          {day.label.length > 15 ? `Dia ${day.idx + 1}` : day.label}
                        </span>
                        <span className={clsx(
                          'text-[11px] mt-0.5',
                          activeIdx === day.idx ? 'text-blue-200' : 'text-gray-400'
                        )}>
                          {day.date}
                        </span>
                      </motion.button>
                    </StaggerItem>
                  ))}
                </StaggerContainer>

                {/* View mode toggle */}
                <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 shrink-0 self-start lg:self-auto shadow-sm">
                  <motion.button
                    onClick={() => setViewMode('grid')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={clsx(
                      'flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all',
                      viewMode === 'grid'
                        ? 'bg-[#1A3A6B] text-white shadow-sm'
                        : 'text-gray-500 hover:text-gray-700',
                    )}
                  >
                    <HiViewGrid className="w-4 h-4" />
                    <span className="hidden sm:inline">Grilla</span>
                  </motion.button>
                  <motion.button
                    onClick={() => setViewMode('timeline')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={clsx(
                      'flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all',
                      viewMode === 'timeline'
                        ? 'bg-[#1A3A6B] text-white shadow-sm'
                        : 'text-gray-500 hover:text-gray-700',
                    )}
                  >
                    <HiViewList className="w-4 h-4" />
                    <span className="hidden sm:inline">Timeline</span>
                  </motion.button>
                </div>
              </div>

              {/* -------------------------------------------------------------- */}
              {/* Type filter chips                                               */}
              {/* -------------------------------------------------------------- */}
              <ScrollReveal direction="up" delay={0.1} duration={0.5}>
                <div className="flex flex-wrap gap-2 mb-8">
                  {TYPE_FILTERS.map((filter) => {
                    const isActive = typeFilter === filter.value;
                    const chipConfig = filter.value === 'all' ? null : getConfig(filter.value);
                    const FilterIcon = filter.icon;

                    return (
                      <motion.button
                        key={filter.value}
                        onClick={() => handleFilterToggle(filter.value)}
                        whileHover={{ scale: 1.06 }}
                        whileTap={{ scale: 0.94 }}
                        className={clsx(
                          'inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold border transition-all duration-200',
                          isActive
                            ? filter.value === 'all'
                              ? 'bg-[#1A3A6B] text-white border-[#1A3A6B] shadow-md shadow-[#1A3A6B]/20'
                              : `${chipConfig?.chipBg} text-white border-transparent shadow-md`
                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:shadow-sm',
                        )}
                      >
                        <FilterIcon className="w-3.5 h-3.5" />
                        {filter.label}
                        {isActive && filter.value !== 'all' && (
                          <span className="ml-0.5 w-4 h-4 flex items-center justify-center bg-white/25 rounded-full text-[9px]">
                            x
                          </span>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </ScrollReveal>

              {/* -------------------------------------------------------------- */}
              {/* Content: Grid or Timeline                                       */}
              {/* -------------------------------------------------------------- */}
              <AnimatePresence mode="wait">
                {viewMode === 'grid' ? (
                  <motion.div
                    key="grid"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.35 }}
                  >
                    <ScheduleGrid
                      days={days}
                      activeIdx={activeIdx}
                      filteredEvents={filteredEvents}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="timeline"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.35 }}
                    className="max-w-3xl mx-auto"
                  >
                    {filteredEvents.length > 0 ? (
                      <ScheduleTimeline events={filteredEvents} />
                    ) : (
                      <EmptyState />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* -------------------------------------------------------------- */}
              {/* Color legend at bottom                                          */}
              {/* -------------------------------------------------------------- */}
              <ScrollReveal direction="up" delay={0.2} className="mt-12">
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                    Tipos de actividad
                  </h3>
                  <div className="flex flex-wrap gap-x-5 gap-y-2">
                    {Object.entries(TYPE_CONFIG).map(([key, cfg]) => {
                      const LegendIcon = cfg.icon;
                      return (
                        <div key={key} className="flex items-center gap-2">
                          <div
                            className={clsx(
                              'w-3 h-3 rounded-full bg-gradient-to-r',
                              cfg.gradient,
                            )}
                          />
                          <LegendIcon className={clsx('w-3.5 h-3.5', cfg.text)} />
                          <span className="text-xs text-gray-600">{cfg.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </ScrollReveal>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
