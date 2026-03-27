import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  HiTicket,
  HiAcademicCap,
  HiUser,
  HiQrcode,
  HiArrowRight,
  HiCalendar,
  HiDownload,
  HiShoppingCart,
} from 'react-icons/hi';
import useAuthStore from '../../store/authStore';
import ticketService from '../../services/ticketService';
import workshopService from '../../services/workshopService';
import LoadingSpinner from '../../components/LoadingSpinner';
import TicketCard from '../../components/TicketCard';

const quickLinks = [
  { label: 'Mi Perfil', icon: HiUser, to: '/dashboard/perfil', color: 'bg-blue-50 text-blue-600' },
  { label: 'Mis Talleres', icon: HiAcademicCap, to: '/dashboard/talleres', color: 'bg-green-50 text-green-600' },
  { label: 'Certificados', icon: HiDownload, to: '/dashboard/certificados', color: 'bg-purple-50 text-purple-600' },
  { label: 'Cronograma', icon: HiCalendar, to: '/cronograma', color: 'bg-orange-50 text-orange-600' },
];

export default function DashboardHome() {
  const user = useAuthStore((state) => state.user);
  const hasTicket = useAuthStore((state) => state.hasTicket);

  const {
    data: ticket,
    isLoading: ticketLoading,
  } = useQuery({
    queryKey: ['my-ticket'],
    queryFn: ticketService.getMyTicket,
    enabled: hasTicket(),
    retry: 1,
  });

  const {
    data: workshops,
    isLoading: workshopsLoading,
  } = useQuery({
    queryKey: ['my-workshops'],
    queryFn: workshopService.getMyWorkshops,
    retry: 1,
  });

  const upcomingWorkshops = (workshops || []).slice(0, 3);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-br from-[#1A3A6B] to-[#0f2548] rounded-2xl p-6 sm:p-8 text-white">
        <h1 className="text-2xl sm:text-3xl font-display font-bold">
          Hola, {user?.full_name?.split(' ')[0] || 'Participante'} 👋
        </h1>
        <p className="text-blue-200 mt-2 text-sm sm:text-base">
          Bienvenido a tu panel de CONEIC 2027. Aqui puedes gestionar tu entrada, talleres y certificados.
        </p>
      </div>

      {/* Ticket Status */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-display font-bold text-gray-900">Mi Entrada</h2>
          {ticket && (
            <Link
              to="/dashboard/mi-ticket"
              className="text-sm text-[#1A3A6B] hover:text-[#1A3A6B]/80 font-medium flex items-center gap-1"
            >
              Ver completo <HiArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {ticketLoading ? (
          <LoadingSpinner size="md" label="Cargando entrada..." />
        ) : ticket ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <TicketCard ticket={ticket} compact />
            {/* QR Preview */}
            {ticket.qr_code && (
              <Link
                to="/dashboard/mi-ticket"
                className="card p-6 flex flex-col items-center justify-center hover:shadow-md transition-shadow group"
              >
                <div className="w-16 h-16 rounded-2xl bg-[#1A3A6B]/5 flex items-center justify-center mb-3 group-hover:bg-[#1A3A6B]/10 transition-colors">
                  <HiQrcode className="w-8 h-8 text-[#1A3A6B]" />
                </div>
                <p className="font-medium text-gray-900 text-sm">Ver mi codigo QR</p>
                <p className="text-xs text-gray-500 mt-1">Toca para ver en pantalla completa</p>
              </Link>
            )}
          </div>
        ) : (
          <div className="card p-6 sm:p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#F4A524]/10 flex items-center justify-center mx-auto mb-4">
              <HiShoppingCart className="w-8 h-8 text-[#F4A524]" />
            </div>
            <h3 className="font-display font-bold text-gray-900 text-lg mb-2">
              Aun no tienes entrada
            </h3>
            <p className="text-gray-500 text-sm mb-5 max-w-sm mx-auto">
              Adquiere tu entrada para acceder a todas las ponencias, talleres y actividades del CONEIC 2027.
            </p>
            <Link
              to="/dashboard/comprar"
              className="inline-flex items-center gap-2 bg-[#F4A524] hover:bg-[#e09520] text-white font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              <HiTicket className="w-5 h-5" />
              Comprar Entrada
            </Link>
          </div>
        )}
      </section>

      {/* Upcoming Workshops */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-display font-bold text-gray-900">Proximos Talleres</h2>
          <Link
            to="/dashboard/talleres"
            className="text-sm text-[#1A3A6B] hover:text-[#1A3A6B]/80 font-medium flex items-center gap-1"
          >
            Ver todos <HiArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {workshopsLoading ? (
          <LoadingSpinner size="md" label="Cargando talleres..." />
        ) : upcomingWorkshops.length > 0 ? (
          <div className="space-y-3">
            {upcomingWorkshops.map((ws) => (
              <div key={ws.id} className="card p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#1A3A6B]/5 flex items-center justify-center shrink-0">
                  <HiAcademicCap className="w-5 h-5 text-[#1A3A6B]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 text-sm truncate">{ws.name}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {ws.time && <span>{ws.time}</span>}
                    {ws.time && ws.location && <span className="mx-1.5">·</span>}
                    {ws.location && <span>{ws.location}</span>}
                  </p>
                </div>
                <HiArrowRight className="w-4 h-4 text-gray-400 shrink-0" />
              </div>
            ))}
          </div>
        ) : (
          <div className="card p-6 text-center">
            <p className="text-gray-500 text-sm">No estas inscrito en ningun taller aun.</p>
            <Link
              to="/talleres"
              className="inline-block mt-3 text-sm text-[#1A3A6B] font-medium hover:underline"
            >
              Explorar talleres disponibles
            </Link>
          </div>
        )}
      </section>

      {/* Quick Links */}
      <section>
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
      </section>
    </div>
  );
}
