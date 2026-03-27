import { Link } from 'react-router-dom';
import { HiCalendar, HiLocationMarker, HiArrowRight } from 'react-icons/hi';
import useCountdown from '../hooks/useCountdown';

export default function Hero() {
  const eventDate = new Date('2027-08-15T09:00:00');
  const countdown = useCountdown(eventDate);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary to-primary-700 min-h-[90vh] flex items-center">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-primary-400/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-white/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-white/5" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-white/90 text-sm font-medium">Inscripciones abiertas</span>
          </div>

          {/* Title */}
          <h1 className="font-display font-black text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white leading-tight mb-6">
            CONEIC{' '}
            <span className="text-accent">2027</span>
          </h1>
          <p className="text-xl sm:text-2xl text-primary-200 font-display font-semibold mb-4">
            Congreso Nacional de Estudiantes de Ingenieria Civil
          </p>
          <p className="text-base sm:text-lg text-primary-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            El punto de encuentro mas importante para estudiantes de ingenieria civil del Peru.
            Conferencias, talleres y networking en un evento sin precedentes.
          </p>

          {/* Event info badges */}
          <div className="flex flex-wrap justify-center gap-4 mb-10">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2.5">
              <HiCalendar className="w-5 h-5 text-accent" />
              <span className="text-white text-sm font-medium">15 - 20 de Agosto, 2027</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2.5">
              <HiLocationMarker className="w-5 h-5 text-accent" />
              <span className="text-white text-sm font-medium">Lima, Peru</span>
            </div>
          </div>

          {/* Countdown */}
          <div className="grid grid-cols-4 gap-3 sm:gap-4 max-w-md mx-auto mb-12">
            {[
              { value: countdown.days, label: 'Dias' },
              { value: countdown.hours, label: 'Horas' },
              { value: countdown.minutes, label: 'Min' },
              { value: countdown.seconds, label: 'Seg' },
            ].map((item) => (
              <div key={item.label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 sm:p-4 border border-white/10">
                <span className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-white block">
                  {String(item.value).padStart(2, '0')}
                </span>
                <span className="text-primary-300 text-xs sm:text-sm">{item.label}</span>
              </div>
            ))}
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="btn-accent text-base px-8 py-4 rounded-xl font-bold shadow-lg shadow-accent/25 hover:shadow-xl hover:shadow-accent/30 transition-all group"
            >
              Registrate ahora
              <HiArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform inline" />
            </Link>
            <Link
              to="/schedule"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-all"
            >
              Ver cronograma
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 120L48 110C96 100 192 80 288 70C384 60 480 60 576 65C672 70 768 80 864 85C960 90 1056 90 1152 85C1248 80 1344 70 1392 65L1440 60V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0Z" fill="white"/>
        </svg>
      </div>
    </section>
  );
}
