import clsx from 'clsx';

const sizes = {
  sm: 'w-5 h-5 border-2',
  md: 'w-8 h-8 border-2',
  lg: 'w-12 h-12 border-3',
  xl: 'w-16 h-16 border-4',
};

export default function LoadingSpinner({ size = 'md', className = '', label = 'Cargando...' }) {
  return (
    <div className={clsx('flex flex-col items-center justify-center gap-3', className)}>
      <div
        className={clsx(
          'rounded-full border-primary-200 border-t-primary animate-spin',
          sizes[size]
        )}
      />
      {label && <p className="text-sm text-gray-500">{label}</p>}
    </div>
  );
}
