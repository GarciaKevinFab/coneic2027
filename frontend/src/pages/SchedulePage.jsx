import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { HiCalendar, HiFilter } from 'react-icons/hi';
import scheduleService from '../services/scheduleService';
import ScheduleTimeline from '../components/ScheduleTimeline';
import LoadingSpinner from '../components/LoadingSpinner';
import clsx from 'clsx';

const typeFilters = [
  { value: 'all', label: 'Todos' },
  { value: 'keynote', label: 'Ponencias' },
  { value: 'workshop', label: 'Talleres' },
  { value: 'panel', label: 'Paneles' },
  { value: 'ceremony', label: 'Ceremonias' },
  { value: 'social', label: 'Sociales' },
  { value: 'competition', label: 'Concursos' },
];

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
}

export default function SchedulePage() {
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [typeFilter, setTypeFilter] = useState('all');

  const {
    data: scheduleDays = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['schedule'],
    queryFn: scheduleService.getSchedule,
    placeholderData: [],
  });

  // Build day tabs from backend data
  const days = useMemo(() => {
    return scheduleDays.map((day, idx) => ({
      idx,
      id: day.id,
      label: day.title || `Dia ${idx + 1}`,
      date: formatDate(day.date),
    }));
  }, [scheduleDays]);

  const activeIdx = selectedDayIdx < days.length ? selectedDayIdx : 0;
  const currentDay = scheduleDays[activeIdx];

  // Filter events by type
  const filteredEvents = useMemo(() => {
    const items = currentDay?.items || [];
    if (typeFilter === 'all') return items;
    return items.filter((e) => e.item_type === typeFilter);
  }, [currentDay, typeFilter]);

  return (
    <div>
      {/* Page header */}
      <section className="bg-gradient-to-br from-[#1A3A6B] via-[#1A3A6B]/90 to-[#1A3A6B]/80 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-white mb-4">
            Cronograma
          </h1>
          <p className="text-blue-200 text-lg max-w-2xl mx-auto">
            Seis dias llenos de conferencias, talleres y actividades
          </p>
        </div>
      </section>

      <section className="py-8 md:py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <LoadingSpinner size="lg" className="py-16" />
          ) : isError ? (
            <div className="text-center py-16">
              <p className="text-red-500 mb-4">No se pudo cargar el cronograma.</p>
              <button
                onClick={() => window.location.reload()}
                className="text-sm text-[#1A3A6B] underline hover:no-underline"
              >
                Intentar de nuevo
              </button>
            </div>
          ) : (
            <>
              {/* Day tabs */}
              <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
                {days.map((day) => (
                  <button
                    key={day.idx}
                    onClick={() => setSelectedDayIdx(day.idx)}
                    className={clsx(
                      'flex flex-col items-center px-5 py-3 rounded-xl border-2 transition-all shrink-0 min-w-[90px]',
                      activeIdx === day.idx
                        ? 'border-[#1A3A6B] bg-[#1A3A6B] text-white'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-[#1A3A6B]/30'
                    )}
                  >
                    <HiCalendar className={clsx(
                      'w-4 h-4 mb-1',
                      activeIdx === day.idx ? 'text-[#F4A524]' : 'text-gray-400'
                    )} />
                    <span className="font-display font-bold text-sm whitespace-nowrap">
                      {day.label.length > 15 ? `Dia ${day.idx + 1}` : day.label}
                    </span>
                    <span className={clsx(
                      'text-xs mt-0.5',
                      activeIdx === day.idx ? 'text-blue-200' : 'text-gray-400'
                    )}>
                      {day.date}
                    </span>
                  </button>
                ))}
              </div>

              {/* Type filter dropdown */}
              <div className="flex items-center gap-3 mb-8">
                <HiFilter className="w-4 h-4 text-gray-400 shrink-0" />
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1A3A6B]/20 focus:border-[#1A3A6B]"
                >
                  {typeFilters.map((filter) => (
                    <option key={filter.value} value={filter.value}>
                      {filter.label}
                    </option>
                  ))}
                </select>
                {typeFilter !== 'all' && (
                  <button
                    onClick={() => setTypeFilter('all')}
                    className="text-xs text-[#1A3A6B] underline hover:no-underline"
                  >
                    Limpiar filtro
                  </button>
                )}
              </div>

              {/* Timeline */}
              {filteredEvents.length > 0 ? (
                <ScheduleTimeline events={filteredEvents} />
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <HiCalendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No hay eventos para este dia con el filtro seleccionado.</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
