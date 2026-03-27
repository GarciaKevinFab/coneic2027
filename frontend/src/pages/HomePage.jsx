import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  HiAcademicCap,
  HiUserGroup,
  HiLightningBolt,
  HiGlobe,
  HiArrowRight,
  HiCalendar,
} from 'react-icons/hi';
import Hero from '../components/Hero';
import SponsorGrid from '../components/SponsorGrid';
import LoadingSpinner from '../components/LoadingSpinner';
import scheduleService from '../services/scheduleService';
import institutionalService from '../services/institutionalService';

const features = [
  {
    icon: HiAcademicCap,
    title: 'Ponencias Magistrales',
    description: 'Expertos nacionales e internacionales compartiendo su conocimiento y experiencia.',
  },
  {
    icon: HiLightningBolt,
    title: 'Talleres Practicos',
    description: 'Aprende herramientas y tecnicas de la mano de profesionales activos.',
  },
  {
    icon: HiUserGroup,
    title: 'Networking',
    description: 'Conecta con estudiantes y profesionales de todo el Peru.',
  },
  {
    icon: HiGlobe,
    title: 'Innovacion',
    description: 'Descubre las ultimas tendencias en ingenieria civil y construccion.',
  },
];

const stats = [
  { value: '500+', label: 'Participantes' },
  { value: '30+', label: 'Ponentes' },
  { value: '15+', label: 'Talleres' },
  { value: '6', label: 'Dias' },
];

export default function HomePage() {
  const { data: sponsors = {} } = useQuery({
    queryKey: ['sponsors'],
    queryFn: institutionalService.getSponsors,
    placeholderData: {},
  });

  const { data: scheduleData = [] } = useQuery({
    queryKey: ['schedule-preview'],
    queryFn: scheduleService.getSchedule,
    placeholderData: [],
  });

  // Take first day's items for preview
  const schedule = scheduleData?.[0]?.items?.slice(0, 4) || [];

  return (
    <div>
      {/* Hero */}
      <Hero />

      {/* Features section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="section-title">
              Por que asistir a <span className="text-accent">CONEIC 2027</span>
            </h2>
            <p className="section-subtitle mx-auto mt-4">
              Una experiencia transformadora para el futuro de la ingenieria civil
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="text-center p-6 rounded-2xl hover:bg-primary-50/50 transition-colors group"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary-50 group-hover:bg-primary-100 flex items-center justify-center mx-auto mb-5 transition-colors">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-display font-bold text-gray-900 text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats section */}
      <section className="py-16 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <p className="text-3xl sm:text-4xl md:text-5xl font-display font-black text-accent">
                  {stat.value}
                </p>
                <p className="text-primary-200 text-sm sm:text-base mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Schedule preview section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">Programa del Evento</h2>
            <p className="section-subtitle mx-auto mt-4">
              Seis dias de actividades, conferencias y talleres
            </p>
          </div>

          {/* Day cards preview */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
            {[1, 2, 3, 4, 5, 6].map((day) => (
              <div
                key={day}
                className="bg-white rounded-xl p-4 text-center border border-gray-100 hover:border-primary-200 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-2">
                  <HiCalendar className="w-5 h-5 text-primary" />
                </div>
                <p className="font-display font-bold text-primary text-sm">Dia {day}</p>
                <p className="text-xs text-gray-500 mt-1">{14 + day} Ago</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link to="/schedule" className="btn-primary group">
              Ver cronograma completo
              <HiArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform inline" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-primary to-primary-700 rounded-3xl p-8 md:p-12 lg:p-16 text-center relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-accent/10 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-primary-400/20 blur-3xl" />
            <div className="relative">
              <h2 className="font-display font-black text-3xl md:text-4xl lg:text-5xl text-white mb-4">
                No te quedes fuera
              </h2>
              <p className="text-primary-200 text-lg mb-8 max-w-2xl mx-auto">
                Asegura tu lugar en el evento de ingenieria civil mas importante del Peru.
                Los cupos son limitados.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/register"
                  className="btn-accent text-base px-8 py-4 rounded-xl font-bold shadow-lg group"
                >
                  Registrate ahora
                  <HiArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform inline" />
                </Link>
                <Link
                  to="/tickets"
                  className="inline-flex items-center justify-center px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-all"
                >
                  Ver entradas
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sponsors section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">Nuestros Patrocinadores</h2>
            <p className="section-subtitle mx-auto mt-4">
              Empresas que apoyan el desarrollo de la ingenieria civil
            </p>
          </div>
          {sponsors.length > 0 ? (
            <SponsorGrid sponsors={sponsors} />
          ) : (
            <div className="text-center text-gray-400 py-12">
              <p>Proximamente anunciaremos nuestros patrocinadores</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
