import clsx from 'clsx';

const colorSchemes = {
  primary: 'bg-primary-50 text-primary',
  accent: 'bg-accent-50 text-accent-700',
  green: 'bg-green-50 text-green-600',
  red: 'bg-red-50 text-red-600',
  purple: 'bg-purple-50 text-purple-600',
  blue: 'bg-blue-50 text-blue-600',
};

export default function StatsCard({ icon: Icon, value, label, color = 'primary', trend, className = '' }) {
  const scheme = colorSchemes[color] || colorSchemes.primary;

  return (
    <div className={clsx('card p-5 sm:p-6', className)}>
      <div className="flex items-start justify-between">
        <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center', scheme)}>
          {Icon && <Icon className="w-6 h-6" />}
        </div>
        {trend !== undefined && (
          <span className={clsx(
            'text-xs font-semibold px-2 py-1 rounded-full',
            trend >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
          )}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-3xl font-display font-bold text-gray-900">
          {typeof value === 'number' ? value.toLocaleString('es-PE') : value}
        </p>
        <p className="text-sm text-gray-500 mt-1">{label}</p>
      </div>
    </div>
  );
}
