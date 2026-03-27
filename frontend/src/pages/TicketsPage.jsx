import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { HiCheck, HiArrowRight, HiStar } from 'react-icons/hi';
import ticketService from '../services/ticketService';
import LoadingSpinner from '../components/LoadingSpinner';
import clsx from 'clsx';

const fallbackTickets = [
  {
    id: 'general',
    name: 'General',
    price: 80,
    description: 'Acceso a conferencias y eventos sociales',
    features: [
      'Acceso a todas las conferencias',
      'Eventos sociales',
      'Material del congreso',
      'Certificado de participacion',
      'Acceso a plataforma virtual',
    ],
    popular: false,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 150,
    description: 'Incluye talleres y beneficios adicionales',
    features: [
      'Todo lo del plan General',
      'Acceso a talleres (elige hasta 3)',
      'Kit de bienvenida premium',
      'Almuerzo incluido (6 dias)',
      'Certificado de talleres',
      'Networking exclusivo',
    ],
    popular: true,
  },
  {
    id: 'vip',
    name: 'VIP',
    price: 250,
    description: 'La experiencia completa CONEIC 2027',
    features: [
      'Todo lo del plan Premium',
      'Acceso a todos los talleres',
      'Asiento preferencial en conferencias',
      'Cena de gala incluida',
      'Sesion de fotos profesional',
      'Tour tecnico exclusivo',
      'Polo y merchandising oficial',
    ],
    popular: false,
  },
];

export default function TicketsPage() {
  const { data: tickets, isLoading } = useQuery({
    queryKey: ['ticket-types'],
    queryFn: ticketService.getTypes,
    placeholderData: null,
  });

  const ticketList = tickets || fallbackTickets;

  return (
    <div>
      {/* Page header */}
      <section className="bg-gradient-to-br from-primary-900 via-primary to-primary-700 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-white mb-4">
            Entradas
          </h1>
          <p className="text-primary-200 text-lg max-w-2xl mx-auto">
            Elige la entrada que mejor se adapte a tu experiencia CONEIC 2027
          </p>
        </div>
      </section>

      <section className="py-12 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <LoadingSpinner size="lg" className="py-16" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {ticketList.map((ticket, idx) => (
                <div
                  key={ticket.id || idx}
                  className={clsx(
                    'relative rounded-2xl border-2 overflow-hidden transition-all hover:shadow-xl',
                    ticket.popular
                      ? 'border-accent shadow-lg scale-[1.02]'
                      : 'border-gray-200 hover:border-primary-200'
                  )}
                >
                  {/* Popular badge */}
                  {ticket.popular && (
                    <div className="bg-accent text-primary-900 text-center py-2 text-sm font-bold flex items-center justify-center gap-1">
                      <HiStar className="w-4 h-4" />
                      Mas popular
                    </div>
                  )}

                  <div className="p-6 sm:p-8">
                    <h3 className="font-display font-bold text-2xl text-gray-900">{ticket.name}</h3>
                    <p className="text-gray-500 text-sm mt-1">{ticket.description}</p>

                    <div className="mt-6 mb-8">
                      <span className="text-4xl font-display font-black text-primary">
                        S/ {ticket.price}
                      </span>
                      <span className="text-gray-400 text-sm ml-1">/ persona</span>
                    </div>

                    <ul className="space-y-3 mb-8">
                      {ticket.features?.map((feature, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-3">
                          <HiCheck className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Link
                      to="/register"
                      className={clsx(
                        'w-full text-center py-3 rounded-xl font-semibold transition-all block group',
                        ticket.popular
                          ? 'btn-accent'
                          : 'btn-outline'
                      )}
                    >
                      Obtener entrada
                      <HiArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform inline" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Note */}
          <div className="mt-12 text-center">
            <p className="text-gray-500 text-sm">
              Todos los precios incluyen IGV. Los cupos son limitados.
            </p>
            <p className="text-gray-500 text-sm mt-1">
              Para inscripciones grupales contactar a{' '}
              <a href="mailto:contacto@coneic2027.pe" className="text-primary hover:underline">
                contacto@coneic2027.pe
              </a>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
