import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { HiSearch, HiAcademicCap } from 'react-icons/hi';
import workshopService from '../services/workshopService';
import WorkshopCard from '../components/WorkshopCard';
import LoadingSpinner from '../components/LoadingSpinner';

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

  // Extract unique types for the filter dropdown
  const types = useMemo(() => {
    const set = new Set();
    workshops.forEach((w) => {
      if (w.type) set.add(w.type);
    });
    return Array.from(set);
  }, [workshops]);

  const filteredWorkshops = useMemo(() => {
    let result = workshops;
    if (typeFilter !== 'all') {
      result = result.filter((w) => w.type === typeFilter);
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

  return (
    <div>
      {/* Page header */}
      <section className="bg-gradient-to-br from-[#1A3A6B] via-[#1A3A6B]/90 to-[#1A3A6B]/80 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-white mb-4">
            Talleres
          </h1>
          <p className="text-blue-200 text-lg max-w-2xl mx-auto">
            Talleres practicos impartidos por profesionales destacados
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            <div className="relative flex-1 max-w-md">
              <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar taller o ponente..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3A6B]/20 focus:border-[#1A3A6B] transition-colors"
              />
            </div>
            {types.length > 0 && (
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1A3A6B]/20 focus:border-[#1A3A6B]"
              >
                <option value="all">Todos los tipos</option>
                {types.map((type) => (
                  <option key={type} value={type} className="capitalize">
                    {type}
                  </option>
                ))}
              </select>
            )}
          </div>

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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWorkshops.map((workshop) => (
                <WorkshopCard key={workshop.id} workshop={workshop} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <HiAcademicCap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">
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
                  className="mt-3 text-sm text-[#1A3A6B] underline hover:no-underline"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
