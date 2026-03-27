import { Link } from 'react-router-dom';
import { HiCheck, HiArrowRight } from 'react-icons/hi';
import clsx from 'clsx';

const tickets = [
  {
    name: 'Basico',
    price: 'S/150',
    description: 'Acceso a las actividades principales del congreso.',
    featured: false,
    benefits: [
      'Acceso a ponencias magistrales',
      'Acceso a paneles de discusion',
      'Ceremonia de inauguracion y clausura',
      'Material del congreso digital',
      'Certificado de participacion',
    ],
  },
  {
    name: 'Estandar',
    price: 'S/280',
    description: 'Experiencia completa con talleres incluidos.',
    featured: true,
    benefits: [
      'Todo lo del plan Basico',
      'Acceso a 2 talleres practicos',
      'Kit de bienvenida fisico',
      'Acceso a eventos sociales',
      'Certificado de participacion y talleres',
      'Networking con ponentes',
    ],
  },
  {
    name: 'Premium',
    price: 'S/400',
    description: 'La experiencia CONEIC mas completa y exclusiva.',
    featured: false,
    benefits: [
      'Todo lo del plan Estandar',
      'Acceso ilimitado a todos los talleres',
      'Almuerzo incluido todos los dias',
      'Asiento preferencial en ponencias',
      'Acceso a cena de gala',
      'Certificado premium personalizado',
      'Polo y merchandising exclusivo',
      'Acceso prioritario a concursos',
    ],
  },
];

export default function TicketsPage() {
  return (
    <div>
      {/* Page header */}
      <section className="bg-gradient-to-br from-[#1A3A6B] via-[#1A3A6B]/90 to-[#1A3A6B]/80 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-white mb-4">
            Entradas
          </h1>
          <p className="text-blue-200 text-lg max-w-2xl mx-auto">
            Elige el tipo de entrada que mejor se adapte a tu experiencia
          </p>
        </div>
      </section>

      <section className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-start">
            {tickets.map((ticket) => (
              <div
                key={ticket.name}
                className={clsx(
                  'relative flex flex-col rounded-2xl border-2 p-6 sm:p-8 transition-shadow',
                  ticket.featured
                    ? 'border-[#F4A524] shadow-lg shadow-[#F4A524]/10 md:-mt-4 md:pb-12'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                )}
              >
                {ticket.featured && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="bg-[#F4A524] text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">
                      Mas popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="font-display font-bold text-xl text-gray-900 mb-2">
                    {ticket.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">{ticket.description}</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span
                      className={clsx(
                        'font-display font-black text-4xl',
                        ticket.featured ? 'text-[#F4A524]' : 'text-[#1A3A6B]'
                      )}
                    >
                      {ticket.price}
                    </span>
                  </div>
                </div>

                <div className="flex-1 mb-8">
                  <ul className="space-y-3">
                    {ticket.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <HiCheck
                          className={clsx(
                            'w-5 h-5 shrink-0 mt-0.5',
                            ticket.featured ? 'text-[#F4A524]' : 'text-[#1A3A6B]'
                          )}
                        />
                        <span className="text-sm text-gray-600">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  to="/dashboard/comprar"
                  className={clsx(
                    'w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm transition-all group',
                    ticket.featured
                      ? 'bg-[#F4A524] text-white hover:bg-[#F4A524]/90 shadow-md shadow-[#F4A524]/20'
                      : 'bg-[#1A3A6B] text-white hover:bg-[#1A3A6B]/90'
                  )}
                >
                  Comprar entrada
                  <HiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            ))}
          </div>

          {/* Additional info */}
          <div className="mt-12 text-center">
            <p className="text-sm text-gray-500 max-w-2xl mx-auto">
              Todos los precios incluyen IGV. Las entradas son personales e intransferibles.
              Al comprar, aceptas los terminos y condiciones del evento.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Para inscripciones grupales contactar a{' '}
              <a href="mailto:contacto@coneic2027.pe" className="text-[#1A3A6B] hover:underline">
                contacto@coneic2027.pe
              </a>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
