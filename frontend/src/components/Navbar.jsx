import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { HiMenu, HiX, HiChevronDown, HiLogout, HiUser, HiTicket, HiViewGrid } from 'react-icons/hi';
import useAuthStore from '../store/authStore';
import clsx from 'clsx';

const publicLinks = [
  { to: '/', label: 'Inicio' },
  { to: '/about', label: 'Nosotros' },
  { to: '/schedule', label: 'Cronograma' },
  { to: '/speakers', label: 'Ponentes' },
  { to: '/workshops', label: 'Talleres' },
  { to: '/tickets', label: 'Entradas' },
  { to: '/faq', label: 'FAQ' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { isAuthenticated, user, logout, isOrganizer } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [navigate]);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  return (
    <header
      className={clsx(
        'sticky top-0 z-50 transition-all duration-300',
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-md' : 'bg-white'
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-display font-bold text-sm">C27</span>
            </div>
            <div className="hidden sm:block">
              <span className="font-display font-bold text-primary text-lg">CONEIC</span>
              <span className="font-display font-bold text-accent text-lg ml-1">2027</span>
            </div>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden lg:flex items-center gap-1">
            {publicLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  clsx(
                    'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'text-primary bg-primary-50'
                      : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Desktop auth buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-primary font-semibold text-sm">
                      {user?.first_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {user?.first_name || 'Mi cuenta'}
                  </span>
                  <HiChevronDown className={clsx('w-4 h-4 text-gray-400 transition-transform', dropdownOpen && 'rotate-180')} />
                </button>

                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-slide-down">
                      <Link
                        to="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <HiViewGrid className="w-4 h-4" /> Dashboard
                      </Link>
                      <Link
                        to="/dashboard/my-ticket"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <HiTicket className="w-4 h-4" /> Mi Entrada
                      </Link>
                      <Link
                        to="/dashboard/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <HiUser className="w-4 h-4" /> Perfil
                      </Link>
                      {isOrganizer() && (
                        <>
                          <div className="border-t border-gray-100 my-1" />
                          <Link
                            to="/organizer"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-accent-700 font-medium hover:bg-accent-50"
                          >
                            <HiViewGrid className="w-4 h-4" /> Panel Organizador
                          </Link>
                        </>
                      )}
                      <div className="border-t border-gray-100 my-1" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                      >
                        <HiLogout className="w-4 h-4" /> Cerrar sesion
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="btn-ghost text-sm">
                  Iniciar sesion
                </Link>
                <Link to="/register" className="btn-primary text-sm !py-2.5 !px-5">
                  Registrarse
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          >
            {mobileOpen ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-gray-100 py-4 animate-slide-down">
            <div className="flex flex-col gap-1">
              {publicLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    clsx(
                      'px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'text-primary bg-primary-50'
                        : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <div className="border-t border-gray-100 my-2" />
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/dashboard/profile"
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Perfil
                  </Link>
                  {isOrganizer() && (
                    <Link
                      to="/organizer"
                      onClick={() => setMobileOpen(false)}
                      className="px-4 py-3 rounded-lg text-sm font-medium text-accent-700 hover:bg-accent-50"
                    >
                      Panel Organizador
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileOpen(false);
                    }}
                    className="px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 text-left"
                  >
                    Cerrar sesion
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2 px-4 pt-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="btn-outline text-sm text-center"
                  >
                    Iniciar sesion
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="btn-primary text-sm text-center"
                  >
                    Registrarse
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
