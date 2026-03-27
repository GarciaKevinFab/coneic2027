import { HiUser, HiClock, HiLocationMarker, HiUserGroup } from 'react-icons/hi';
import clsx from 'clsx';

export default function WorkshopCard({ workshop, onEnroll, onUnenroll, enrolled = false, loading = false }) {
  if (!workshop) return null;

  const capacityPercent = workshop.max_capacity
    ? Math.round((workshop.enrolled_count / workshop.max_capacity) * 100)
    : 0;
  const isFull = workshop.enrolled_count >= workshop.max_capacity;

  return (
    <div className="card flex flex-col">
      <div className="p-5 sm:p-6 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="font-display font-bold text-primary text-lg leading-tight">
            {workshop.name}
          </h3>
          {workshop.type && (
            <span className="badge-primary shrink-0 capitalize">{workshop.type}</span>
          )}
        </div>

        {workshop.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{workshop.description}</p>
        )}

        <div className="space-y-2 mb-4">
          {workshop.speaker_name && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <HiUser className="w-4 h-4 text-primary-400 shrink-0" />
              <span>{workshop.speaker_name}</span>
            </div>
          )}
          {workshop.time && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <HiClock className="w-4 h-4 text-primary-400 shrink-0" />
              <span>{workshop.time}</span>
            </div>
          )}
          {workshop.location && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <HiLocationMarker className="w-4 h-4 text-primary-400 shrink-0" />
              <span>{workshop.location}</span>
            </div>
          )}
        </div>

        <div className="mt-auto">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
            <div className="flex items-center gap-1">
              <HiUserGroup className="w-3.5 h-3.5" />
              <span>{workshop.enrolled_count || 0} / {workshop.max_capacity || '?'}</span>
            </div>
            <span className={clsx(isFull ? 'text-red-500 font-medium' : 'text-gray-500')}>
              {isFull ? 'Lleno' : `${capacityPercent}%`}
            </span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={clsx(
                'h-full rounded-full transition-all duration-500',
                capacityPercent >= 90 ? 'bg-red-500' : capacityPercent >= 70 ? 'bg-accent' : 'bg-primary'
              )}
              style={{ width: `${Math.min(capacityPercent, 100)}%` }}
            />
          </div>
        </div>

        {(onEnroll || onUnenroll) && (
          <div className="mt-4">
            {enrolled ? (
              <button
                onClick={() => onUnenroll?.(workshop.id)}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-lg border-2 border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                {loading ? 'Procesando...' : 'Cancelar inscripcion'}
              </button>
            ) : (
              <button
                onClick={() => onEnroll?.(workshop.id)}
                disabled={loading || isFull}
                className="btn-primary w-full text-sm !py-2.5"
              >
                {loading ? 'Procesando...' : isFull ? 'Sin cupos' : 'Inscribirse'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
