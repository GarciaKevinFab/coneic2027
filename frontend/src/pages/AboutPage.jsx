import { useQuery } from '@tanstack/react-query';
import { HiAcademicCap, HiEye, HiHeart, HiUserGroup, HiCalendar, HiLocationMarker } from 'react-icons/hi';
import institutionalService from '../services/institutionalService';
import LoadingSpinner from '../components/LoadingSpinner';

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

  return (
    <div>
      {/* Page header */}
      <section className="bg-gradient-to-br from-[#1A3A6B] via-[#1A3A6B]/90 to-[#1A3A6B]/80 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-white mb-4">
            Sobre <span className="text-[#F4A524]">CONEIC 2027</span>
          </h1>
          <p className="text-blue-200 text-lg max-w-2xl mx-auto">
            Conoce la historia y la vision detras del congreso de ingenieria civil mas importante del Peru
          </p>
        </div>
      </section>

      {/* Event Info */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loadingEvent ? (
            <LoadingSpinner size="lg" className="py-12" />
          ) : eventError ? (
            <div className="text-center py-12">
              <p className="text-red-500">No se pudo cargar la informacion del evento.</p>
            </div>
          ) : eventInfo ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-20">
              <div>
                <h2 className="font-display font-black text-2xl sm:text-3xl text-gray-900 mb-6">
                  {eventInfo.title || 'CONEIC 2027'}
                </h2>
                <div className="space-y-4 text-gray-600 leading-relaxed">
                  <p>{eventInfo.description}</p>
                </div>
                <div className="mt-6 flex flex-col sm:flex-row gap-4">
                  {eventInfo.date && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <HiCalendar className="w-5 h-5 text-[#F4A524]" />
                      <span>{eventInfo.date}</span>
                    </div>
                  )}
                  {eventInfo.location && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <HiLocationMarker className="w-5 h-5 text-[#F4A524]" />
                      <span>{eventInfo.location}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-gradient-to-br from-[#1A3A6B]/10 to-[#1A3A6B]/20 rounded-3xl aspect-video flex items-center justify-center">
                {eventInfo.banner_url ? (
                  <img
                    src={eventInfo.banner_url}
                    alt={eventInfo.title}
                    className="w-full h-full object-cover rounded-3xl"
                  />
                ) : (
                  <span className="text-[#1A3A6B]/30 font-display font-bold text-2xl">CONEIC 2027</span>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-20">
              <div>
                <h2 className="font-display font-black text-2xl sm:text-3xl text-gray-900 mb-6">
                  El congreso que transforma
                </h2>
                <div className="space-y-4 text-gray-600 leading-relaxed">
                  <p>
                    El Congreso Nacional de Estudiantes de Ingenieria Civil (CONEIC) es el evento
                    academico mas importante organizado por y para estudiantes de ingenieria civil
                    en el Peru. Desde su primera edicion, CONEIC ha sido el espacio donde las nuevas
                    generaciones de ingenieros se encuentran para compartir conocimiento, experiencias
                    y construir redes profesionales.
                  </p>
                  <p>
                    En su edicion 2027, CONEIC reune a mas de 500 participantes de universidades
                    de todo el pais, junto a ponentes nacionales e internacionales de primer nivel,
                    en una semana de actividades academicas, talleres practicos y eventos sociales.
                  </p>
                </div>
              </div>
              <div className="bg-gradient-to-br from-[#1A3A6B]/10 to-[#1A3A6B]/20 rounded-3xl aspect-video flex items-center justify-center">
                <span className="text-[#1A3A6B]/30 font-display font-bold text-2xl">CONEIC 2027</span>
              </div>
            </div>
          )}

          {/* Mission, Vision, History */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-[#1A3A6B]/10 flex items-center justify-center mb-5">
                <HiAcademicCap className="w-6 h-6 text-[#1A3A6B]" />
              </div>
              <h3 className="font-display font-bold text-xl text-gray-900 mb-3">Mision</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Fomentar el desarrollo academico y profesional de los estudiantes de ingenieria
                civil del Peru, creando espacios de aprendizaje, innovacion y networking que
                contribuyan a la formacion de profesionales de excelencia.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-[#F4A524]/10 flex items-center justify-center mb-5">
                <HiEye className="w-6 h-6 text-[#F4A524]" />
              </div>
              <h3 className="font-display font-bold text-xl text-gray-900 mb-3">Vision</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Ser el congreso estudiantil de ingenieria civil referente en Latinoamerica,
                reconocido por su excelencia academica, innovacion y contribucion al desarrollo
                de la infraestructura del Peru.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center mb-5">
                <HiHeart className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-display font-bold text-xl text-gray-900 mb-3">Historia</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Desde su primera edicion, CONEIC ha reunido a miles de estudiantes de ingenieria
                civil de todo el Peru. Cada ano, una universidad sede organiza este evento que se
                ha convertido en tradicion y referente del desarrollo academico estudiantil.
              </p>
            </div>
          </div>

          {/* Committee */}
          <div>
            <div className="text-center mb-12">
              <h2 className="font-display font-black text-2xl sm:text-3xl text-gray-900">
                Comite Organizador
              </h2>
              <p className="text-gray-500 max-w-2xl mx-auto mt-4">
                El equipo detras de CONEIC 2027
              </p>
            </div>

            {loadingCommittee ? (
              <LoadingSpinner size="lg" className="py-12" />
            ) : committeeError ? (
              <div className="text-center py-8">
                <p className="text-red-500">No se pudo cargar el comite organizador.</p>
              </div>
            ) : committee.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {committee.map((member, idx) => (
                  <div key={member.id || idx} className="text-center">
                    <div className="w-24 h-24 rounded-full bg-[#1A3A6B]/10 mx-auto mb-4 flex items-center justify-center overflow-hidden">
                      {member.photo_url ? (
                        <img src={member.photo_url} alt={member.name} className="w-full h-full object-cover" />
                      ) : (
                        <HiUserGroup className="w-10 h-10 text-[#1A3A6B]/30" />
                      )}
                    </div>
                    <h4 className="font-display font-bold text-gray-900">{member.name}</h4>
                    <p className="text-sm text-[#F4A524] font-medium">{member.role}</p>
                    {member.university && (
                      <p className="text-xs text-gray-500 mt-1">{member.university}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-400 py-8">
                Proximamente anunciaremos al comite organizador
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
