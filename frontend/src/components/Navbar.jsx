import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { HiMenu, HiX, HiChevronDown, HiLogout, HiUser, HiTicket, HiViewGrid } from 'react-icons/hi';
import { motion, AnimatePresence } from 'motion/react';
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

function NavLinkWithIndicator({ to, end, label, scrolled, onClick }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        clsx(
          'relative px-3 py-2 rounded-lg text-sm font-medium transition-colors',
          isActive
            ? scrolled
              ? 'text-[#1A3A6B]'
              : 'text-white'
            : scrolled
              ? 'text-gray-600 hover:text-[#1A3A6B] hover:bg-gray-50'
              : 'text-white/80 hover:text-white hover:bg-white/10'
        )
      }
    >
      {({ isActive }) => (
        <>
          {label}
          {isActive && (
            <motion.span
              layoutId="nav-underline"
              className={clsx(
                'absolute bottom-0 left-3 right-3 h-0.5 rounded-full',
                scrolled ? 'bg-[#1A3A6B]' : 'bg-white'
              )}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}
        </>
      )}
    </NavLink>
  );
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { isAuthenticated, user, logout, isOrganizer } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50"
      animate={{
        backgroundColor: scrolled ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0)',
        backdropFilter: scrolled ? 'blur(12px)' : 'blur(0px)',
        boxShadow: scrolled
          ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)'
          : '0 0px 0px 0px rgba(0, 0, 0, 0)',
      }}
      transition={{ duration: 0.35, ease: 'easeInOut' }}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <div className="w-10 h-10 rounded-lg bg-[#1A3A6B] flex items-center justify-center">
                <span className="text-white font-display font-bold text-sm">C27</span>
              </div>
              <div className="hidden sm:block">
                <span
                  className={clsx(
                    'font-display font-bold text-lg transition-colors duration-300',
                    scrolled ? 'text-[#1A3A6B]' : 'text-white'
                  )}
                >
                  CONEIC
                </span>
                <span className="font-display font-bold text-[#F4A524] text-lg ml-1">
                  2027
                </span>
              </div>
            </Link>
          </motion.div>

          {/* Desktop nav links */}
          <div className="hidden lg:flex items-center gap-1">
            {publicLinks.map((link) => (
              <NavLinkWithIndicator
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                label={link.label}
                scrolled={scrolled}
              />
            ))}
          </div>

          {/* Desktop auth buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className={clsx(
                    'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors',
                    scrolled
                      ? 'hover:bg-gray-50'
                      : 'hover:bg-white/10'
                  )}
                >
                  <div
                    className={clsx(
                      'w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300',
                      scrolled ? 'bg-[#1A3A6B]/10' : 'bg-white/20'
                    )}
                  >
                    <span
                      className={clsx(
                        'font-semibold text-sm transition-colors duration-300',
                        scrolled ? 'text-[#1A3A6B]' : 'text-white'
                      )}
                    >
                      {user?.first_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span
                    className={clsx(
                      'text-sm font-medium transition-colors duration-300',
                      scrolled ? 'text-gray-700' : 'text-white'
                    )}
                  >
                    {user?.first_name || 'Mi cuenta'}
                  </span>
                  <motion.div
                    animate={{ rotate: dropdownOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <HiChevronDown
                      className={clsx(
                        'w-4 h-4 transition-colors duration-300',
                        scrolled ? 'text-gray-400' : 'text-white/70'
                      )}
                    />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setDropdownOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -8 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                        className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 origin-top-right"
                      >
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
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#F4A524] font-medium hover:bg-[#F4A524]/5"
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
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className={clsx(
                    'text-sm font-medium px-4 py-2 rounded-lg transition-colors duration-300',
                    scrolled
                      ? 'text-[#1A3A6B] hover:bg-[#1A3A6B]/5'
                      : 'text-white hover:bg-white/10'
                  )}
                >
                  Iniciar sesion
                </Link>
                <Link
                  to="/register"
                  className={clsx(
                    'text-sm font-medium px-5 py-2.5 rounded-lg transition-all duration-300',
                    scrolled
                      ? 'bg-[#1A3A6B] text-white hover:bg-[#1A3A6B]/90'
                      : 'bg-white text-[#1A3A6B] hover:bg-white/90'
                  )}
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={clsx(
              'lg:hidden p-2 rounded-lg transition-colors',
              scrolled
                ? 'text-gray-600 hover:bg-gray-100'
                : 'text-white hover:bg-white/10'
            )}
          >
            {mobileOpen ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="lg:hidden overflow-hidden"
            >
              <div
                className={clsx(
                  'py-4 border-t',
                  scrolled ? 'border-gray-100' : 'border-white/20'
                )}
              >
                <div className="flex flex-col gap-1">
                  {publicLinks.map((link, index) => (
                    <motion.div
                      key={link.to}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -16 }}
                      transition={{ delay: index * 0.04, duration: 0.25 }}
                    >
                      <NavLink
                        to={link.to}
                        end={link.to === '/'}
                        onClick={() => setMobileOpen(false)}
                        className={({ isActive }) =>
                          clsx(
                            'block px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                            isActive
                              ? scrolled
                                ? 'text-[#1A3A6B] bg-[#1A3A6B]/5'
                                : 'text-white bg-white/15'
                              : scrolled
                                ? 'text-gray-600 hover:text-[#1A3A6B] hover:bg-gray-50'
                                : 'text-white/80 hover:text-white hover:bg-white/10'
                          )
                        }
                      >
                        {link.label}
                      </NavLink>
                    </motion.div>
                  ))}

                  <div
                    className={clsx(
                      'border-t my-2',
                      scrolled ? 'border-gray-100' : 'border-white/20'
                    )}
                  />

                  {isAuthenticated ? (
                    <>
                      <motion.div
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: publicLinks.length * 0.04, duration: 0.25 }}
                      >
                        <Link
                          to="/dashboard"
                          onClick={() => setMobileOpen(false)}
                          className={clsx(
                            'block px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                            scrolled
                              ? 'text-gray-700 hover:bg-gray-50'
                              : 'text-white/90 hover:bg-white/10'
                          )}
                        >
                          Dashboard
                        </Link>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (publicLinks.length + 1) * 0.04, duration: 0.25 }}
                      >
                        <Link
                          to="/dashboard/profile"
                          onClick={() => setMobileOpen(false)}
                          className={clsx(
                            'block px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                            scrolled
                              ? 'text-gray-700 hover:bg-gray-50'
                              : 'text-white/90 hover:bg-white/10'
                          )}
                        >
                          Perfil
                        </Link>
                      </motion.div>
                      {isOrganizer() && (
                        <motion.div
                          initial={{ opacity: 0, x: -16 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: (publicLinks.length + 2) * 0.04, duration: 0.25 }}
                        >
                          <Link
                            to="/organizer"
                            onClick={() => setMobileOpen(false)}
                            className={clsx(
                              'block px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                              scrolled
                                ? 'text-[#F4A524] hover:bg-[#F4A524]/5'
                                : 'text-[#F4A524] hover:bg-white/10'
                            )}
                          >
                            Panel Organizador
                          </Link>
                        </motion.div>
                      )}
                      <motion.div
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (publicLinks.length + 3) * 0.04, duration: 0.25 }}
                      >
                        <button
                          onClick={() => {
                            handleLogout();
                            setMobileOpen(false);
                          }}
                          className="px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 text-left w-full"
                        >
                          Cerrar sesion
                        </button>
                      </motion.div>
                    </>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: publicLinks.length * 0.04, duration: 0.25 }}
                      className="flex flex-col gap-2 px-4 pt-2"
                    >
                      <Link
                        to="/login"
                        onClick={() => setMobileOpen(false)}
                        className={clsx(
                          'text-sm text-center font-medium px-4 py-3 rounded-lg border transition-colors duration-300',
                          scrolled
                            ? 'border-[#1A3A6B] text-[#1A3A6B] hover:bg-[#1A3A6B]/5'
                            : 'border-white text-white hover:bg-white/10'
                        )}
                      >
                        Iniciar sesion
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setMobileOpen(false)}
                        className={clsx(
                          'text-sm text-center font-medium px-4 py-3 rounded-lg transition-colors duration-300',
                          scrolled
                            ? 'bg-[#1A3A6B] text-white hover:bg-[#1A3A6B]/90'
                            : 'bg-white text-[#1A3A6B] hover:bg-white/90'
                        )}
                      >
                        Registrarse
                      </Link>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  );
}
