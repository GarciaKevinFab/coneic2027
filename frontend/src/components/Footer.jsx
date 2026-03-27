import { Link } from 'react-router-dom';
import { HiMail, HiPhone, HiLocationMarker } from 'react-icons/hi';
import { FaFacebook, FaInstagram, FaLinkedin, FaYoutube } from 'react-icons/fa';

const footerLinks = {
  evento: [
    { label: 'Cronograma', to: '/schedule' },
    { label: 'Ponentes', to: '/speakers' },
    { label: 'Talleres', to: '/workshops' },
    { label: 'Entradas', to: '/tickets' },
  ],
  informacion: [
    { label: 'Nosotros', to: '/about' },
    { label: 'Preguntas frecuentes', to: '/faq' },
    { label: 'Validar certificado', to: '/validate-certificate' },
  ],
  cuenta: [
    { label: 'Registrarse', to: '/register' },
    { label: 'Iniciar sesion', to: '/login' },
    { label: 'Dashboard', to: '/dashboard' },
  ],
};

const socialLinks = [
  { icon: FaFacebook, href: 'https://facebook.com/coneic', label: 'Facebook' },
  { icon: FaInstagram, href: 'https://instagram.com/coneic', label: 'Instagram' },
  { icon: FaLinkedin, href: 'https://linkedin.com/company/coneic', label: 'LinkedIn' },
  { icon: FaYoutube, href: 'https://youtube.com/@coneic', label: 'YouTube' },
];

export default function Footer() {
  return (
    <footer className="bg-primary-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 py-12 lg:py-16">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                <span className="text-primary-900 font-display font-bold text-sm">C27</span>
              </div>
              <div>
                <span className="font-display font-bold text-white text-lg">CONEIC</span>
                <span className="font-display font-bold text-accent text-lg ml-1">2027</span>
              </div>
            </div>
            <p className="text-primary-200 text-sm leading-relaxed mb-6 max-w-sm">
              Congreso Nacional de Estudiantes de Ingenieria Civil 2027.
              El punto de encuentro para el futuro de la ingenieria civil en el Peru.
            </p>
            <div className="space-y-3">
              <a href="mailto:contacto@coneic2027.pe" className="flex items-center gap-2 text-primary-200 hover:text-accent text-sm transition-colors">
                <HiMail className="w-4 h-4 shrink-0" />
                contacto@coneic2027.pe
              </a>
              <a href="tel:+51999999999" className="flex items-center gap-2 text-primary-200 hover:text-accent text-sm transition-colors">
                <HiPhone className="w-4 h-4 shrink-0" />
                +51 999 999 999
              </a>
              <div className="flex items-start gap-2 text-primary-200 text-sm">
                <HiLocationMarker className="w-4 h-4 shrink-0 mt-0.5" />
                Universidad Nacional del Centro del Peru (UNCP) - Huancayo, Junin
              </div>
            </div>
          </div>

          {/* Links columns */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Evento</h3>
            <ul className="space-y-2.5">
              {footerLinks.evento.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-primary-200 hover:text-accent text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Informacion</h3>
            <ul className="space-y-2.5">
              {footerLinks.informacion.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-primary-200 hover:text-accent text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Cuenta</h3>
            <ul className="space-y-2.5">
              {footerLinks.cuenta.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-primary-200 hover:text-accent text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-primary-800 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-primary-300 text-xs">
            &copy; 2027 CONEIC. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="text-primary-300 hover:text-accent transition-colors"
              >
                <social.icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
