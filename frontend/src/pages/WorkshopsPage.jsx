import { useQuery } from '@tanstack/react-query';
import { HiSearch } from 'react-icons/hi';
import { useState } from 'react';
import workshopService from '../services/workshopService';
import WorkshopCard from '../components/WorkshopCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function WorkshopsPage() {
  const [search, setSearch] = useState('');

  const { data: workshops = [], isLoading } = useQuery({
    queryKey: ['workshops'],
    queryFn: workshopService.getAll,
    placeholderData: [],
  });

  const filtered = workshops.filter((w) =>
    w.name?.toLowerCase().includes(search.toLowerCase()) ||
    w.description?.toLowerCase().includes(search.toLowerCase()) ||
    w.speaker_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Page header */}
      <section className="bg-gradient-to-br from-primary-900 via-primary to-primary-700 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-white mb-4">
            Talleres
          </h1>
          <p className="text-primary-200 text-lg max-w-2xl mx-auto">
            Talleres practicos con cupos limitados. Inscribete en tu dashboard.
          </p>
        </div>
      </section>

      <section className="py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search */}
          <div className="max-w-md mx-auto mb-8">
            <div className="relative">
              <HiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar taller..."
                className="input-field pl-11"
              />
            </div>
          </div>

          {isLoading ? (
            <LoadingSpinner size="lg" className="py-16" />
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((workshop, idx) => (
                <WorkshopCard key={workshop.id || idx} workshop={workshop} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-400 text-lg">
                {search ? 'No se encontraron talleres con esa busqueda' : 'Proximamente anunciaremos los talleres'}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
