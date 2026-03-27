import { useQuery } from '@tanstack/react-query';
import { HiAcademicCap, HiUserGroup, HiClock, HiLocationMarker } from 'react-icons/hi';
import adminService from '../../services/adminService';
import LoadingSpinner from '../../components/LoadingSpinner';
import clsx from 'clsx';

export default function WorkshopsReportPage() {
  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['admin-workshops-report'],
    queryFn: adminService.workshopReport,
  });

  const workshops = data?.workshops || data || [];

  return (
    <div className="page-container">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900">
          Reporte de Talleres
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Estado de ocupacion de todos los talleres del evento
        </p>
      </div>

      {isLoading ? (
        <LoadingSpinner size="lg" label="Cargando talleres..." className="py-20" />
      ) : isError ? (
        <div className="card p-8 text-center">
          <p className="text-gray-500">Error al cargar el reporte. Intenta de nuevo.</p>
        </div>
      ) : workshops.length > 0 ? (
        <div className="space-y-4">
          {workshops.map((workshop, idx) => {
            const enrolled = workshop.enrolled_count || 0;
            const capacity = workshop.max_capacity || 1;
            const percent = Math.round((enrolled / capacity) * 100);
            const isFull = enrolled >= capacity;

            return (
              <div key={workshop.id || idx} className="card p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-bold text-primary text-lg truncate">
                      {workshop.name}
                    </h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                      {workshop.speaker_name && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <HiUserGroup className="w-3.5 h-3.5" />
                          <span>{workshop.speaker_name}</span>
                        </div>
                      )}
                      {workshop.time && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <HiClock className="w-3.5 h-3.5" />
                          <span>{workshop.time}</span>
                        </div>
                      )}
                      {workshop.location && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <HiLocationMarker className="w-3.5 h-3.5" />
                          <span>{workshop.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-2xl font-display font-bold text-gray-900">
                      {enrolled}
                      <span className="text-gray-400 text-sm font-normal">/{capacity}</span>
                    </p>
                    <p className={clsx(
                      'text-xs font-medium mt-0.5',
                      isFull ? 'text-red-500' : percent >= 80 ? 'text-amber-500' : 'text-green-500'
                    )}>
                      {isFull ? 'Completo' : `${percent}% ocupado`}
                    </p>
                  </div>
                </div>

                {/* Capacity bar */}
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={clsx(
                      'h-full rounded-full transition-all duration-700',
                      percent >= 90 ? 'bg-red-500' : percent >= 70 ? 'bg-accent' : 'bg-primary'
                    )}
                    style={{ width: `${Math.min(percent, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card p-8 sm:p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-4">
            <HiAcademicCap className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-display font-bold text-gray-900 text-lg mb-2">Sin talleres</h3>
          <p className="text-gray-500 text-sm">No hay talleres registrados en el sistema.</p>
        </div>
      )}
    </div>
  );
}
