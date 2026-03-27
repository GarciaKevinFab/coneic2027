import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { HiSearch, HiUserGroup } from 'react-icons/hi';
import SpeakerCard from '../components/SpeakerCard';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';

const fetchSpeakers = async () => {
  const { data } = await api.get('/workshops/speakers/');
  return data;
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

  return (
    <div>
      {/* Page header */}
      <section className="bg-gradient-to-br from-[#1A3A6B] via-[#1A3A6B]/90 to-[#1A3A6B]/80 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-white mb-4">
            Ponentes
          </h1>
          <p className="text-blue-200 text-lg max-w-2xl mx-auto">
            Conoce a los expertos que compartiran su conocimiento en CONEIC 2027
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search bar */}
          <div className="max-w-md mx-auto mb-10">
            <div className="relative">
              <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar ponente, tema u organizacion..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3A6B]/20 focus:border-[#1A3A6B] transition-colors"
              />
            </div>
          </div>

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
          ) : filteredSpeakers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredSpeakers.map((speaker) => (
                <SpeakerCard key={speaker.id} speaker={speaker} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <HiUserGroup className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">
                {search
                  ? `No se encontraron ponentes para "${search}".`
                  : 'Proximamente anunciaremos a nuestros ponentes.'}
              </p>
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="mt-3 text-sm text-[#1A3A6B] underline hover:no-underline"
                >
                  Limpiar busqueda
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
