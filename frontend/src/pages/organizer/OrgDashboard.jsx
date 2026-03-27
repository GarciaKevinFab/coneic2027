import { useQuery } from '@tanstack/react-query';
import { HiUserGroup, HiCurrencyDollar, HiTicket, HiCheckCircle, HiAcademicCap, HiClipboardCheck } from 'react-icons/hi';
import { Link } from 'react-router-dom';
import adminService from '../../services/adminService';
import StatsCard from '../../components/StatsCard';
import LoadingSpinner from '../../components/LoadingSpinner';

const quickLinks = [
  { label: 'Participantes', to: '/organizer/participants', icon: HiUserGroup, color: 'bg-blue-50 text-blue-600' },
  { label: 'Pagos', to: '/organizer/payments', icon: HiCurrencyDollar, color: 'bg-green-50 text-green-600' },
  { label: 'Acreditacion', to: '/organizer/accreditation', icon: HiClipboardCheck, color: 'bg-purple-50 text-purple-600' },
  { label: 'Talleres', to: '/organizer/workshops', icon: HiAcademicCap, color: 'bg-orange-50 text-orange-600' },
];

export default function OrgDashboard() {
  const {
    data: stats,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: adminService.getStats,
    refetchInterval: 30000,
  });

  return (
    <div className="page-container">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900">
          Panel del Organizador
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Vista general del estado del evento CONEIC 2027
        </p>
      </div>

      {isLoading ? (
        <LoadingSpinner size="lg" label="Cargando estadisticas..." className="py-20" />
      ) : isError ? (
        <div className="card p-8 text-center">
          <p className="text-gray-500">Error al cargar las estadisticas. Intenta de nuevo.</p>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <StatsCard
              icon={HiUserGroup}
              value={stats?.total_participants || 0}
              label="Total participantes"
              color="primary"
            />
            <StatsCard
              icon={HiCurrencyDollar}
              value={stats?.total_revenue ? `S/ ${stats.total_revenue.toLocaleString('es-PE')}` : 'S/ 0'}
              label="Ingresos totales"
              color="green"
            />
            <StatsCard
              icon={HiTicket}
              value={stats?.total_tickets_sold || 0}
              label="Entradas vendidas"
              color="accent"
            />
            <StatsCard
              icon={HiCheckCircle}
              value={stats?.total_accredited || 0}
              label="Acreditados"
              color="purple"
            />
          </div>

          {/* Quick Links */}
          <div className="mb-8">
            <h2 className="text-lg font-display font-bold text-gray-900 mb-4">Accesos rapidos</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {quickLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="card p-4 flex flex-col items-center text-center hover:shadow-md transition-shadow group"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-2 ${link.color}`}>
                    <link.icon className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                    {link.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Additional stats */}
          {stats && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="card p-5">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Entradas General</h3>
                <p className="text-2xl font-display font-bold text-gray-900">{stats.tickets_general || 0}</p>
              </div>
              <div className="card p-5">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Entradas Premium</h3>
                <p className="text-2xl font-display font-bold text-gray-900">{stats.tickets_premium || 0}</p>
              </div>
              <div className="card p-5">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Entradas VIP</h3>
                <p className="text-2xl font-display font-bold text-gray-900">{stats.tickets_vip || 0}</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
