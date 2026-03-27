import { HiClock, HiLocationMarker, HiUser, HiAcademicCap } from 'react-icons/hi';
import clsx from 'clsx';

const typeConfig = {
  keynote: { label: 'Ponencia magistral', color: 'bg-accent', dot: 'border-accent' },
  workshop: { label: 'Taller', color: 'bg-primary', dot: 'border-primary' },
  panel: { label: 'Panel', color: 'bg-purple-500', dot: 'border-purple-500' },
  break: { label: 'Receso', color: 'bg-gray-400', dot: 'border-gray-400' },
  ceremony: { label: 'Ceremonia', color: 'bg-green-500', dot: 'border-green-500' },
  social: { label: 'Social', color: 'bg-pink-500', dot: 'border-pink-500' },
  competition: { label: 'Concurso', color: 'bg-red-500', dot: 'border-red-500' },
};

function TimelineItem({ item, isLast }) {
  const config = typeConfig[item.type] || { label: item.type || 'Actividad', color: 'bg-gray-400', dot: 'border-gray-400' };

  return (
    <div className="flex gap-4 sm:gap-6">
      <div className="flex flex-col items-center">
        <div className={clsx('w-4 h-4 rounded-full border-[3px] bg-white shrink-0', config.dot)} />
        {!isLast && <div className="w-0.5 flex-1 bg-gray-200 min-h-[40px]" />}
      </div>
      <div className={clsx('pb-8 flex-1', isLast && 'pb-0')}>
        <div className="card p-4 sm:p-5 hover:shadow-md transition-shadow">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={clsx('badge text-white text-[10px]', config.color)}>{config.label}</span>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <HiClock className="w-3.5 h-3.5" />
              <span>{item.start_time} - {item.end_time}</span>
            </div>
          </div>
          <h4 className="font-display font-bold text-primary text-base sm:text-lg leading-tight">
            {item.title}
          </h4>
          {item.description && (
            <p className="text-sm text-gray-600 mt-1.5 line-clamp-2">{item.description}</p>
          )}
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
            {item.speaker && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <HiUser className="w-3.5 h-3.5" />
                <span>{item.speaker}</span>
              </div>
            )}
            {item.location && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <HiLocationMarker className="w-3.5 h-3.5" />
                <span>{item.location}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ScheduleTimeline({ items = [], emptyMessage = 'No hay actividades programadas.' }) {
  if (!items.length) {
    return (
      <div className="text-center py-12">
        <HiAcademicCap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {items.map((item, index) => (
        <TimelineItem key={item.id || index} item={item} isLast={index === items.length - 1} />
      ))}
    </div>
  );
}
