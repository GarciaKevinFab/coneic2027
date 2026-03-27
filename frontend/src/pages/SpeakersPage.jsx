import { useQuery } from '@tanstack/react-query';
import scheduleService from '../services/scheduleService';
import SpeakerCard from '../components/SpeakerCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function SpeakersPage() {
  const { data: speakers = [], isLoading } = useQuery({
    queryKey: ['speakers'],
    queryFn: scheduleService.getSpeakers,
    placeholderData: [],
  });

  return (
    <div>
      {/* Page header */}
      <section className="bg-gradient-to-br from-primary-900 via-primary to-primary-700 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-white mb-4">
            Ponentes
          </h1>
          <p className="text-primary-200 text-lg max-w-2xl mx-auto">
            Conoce a los expertos que compartiran su conocimiento en CONEIC 2027
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <LoadingSpinner size="lg" className="py-16" />
          ) : speakers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {speakers.map((speaker, idx) => (
                <SpeakerCard key={speaker.id || idx} speaker={speaker} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-400 text-lg">Proximamente anunciaremos a nuestros ponentes</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
