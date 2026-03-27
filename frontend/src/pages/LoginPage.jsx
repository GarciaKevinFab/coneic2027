import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { HiMail, HiLockClosed } from 'react-icons/hi';
import authService from '../services/authService';
import useAuthStore from '../store/authStore';

export default function LoginPage() {
  const location = useLocation();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/dashboard';

  const mutation = useMutation({
    mutationFn: (credentials) => authService.login(credentials),
    onSuccess: (data) => {
      // Write directly to localStorage so it survives the page reload
      const storeData = {
        state: {
          user: data.user,
          accessToken: data.access,
          refreshToken: data.refresh,
          isAuthenticated: true,
          _hasHydrated: false,
        },
        version: 0,
      };
      localStorage.setItem('coneic-auth', JSON.stringify(storeData));
      // Full page reload — Zustand will rehydrate from localStorage
      window.location.href = from;
    },
    onError: (err) => {
      const data = err.response?.data;
      if (!data) {
        setError('Error de conexion. Intenta de nuevo.');
        return;
      }
      const msg = data.detail || data.non_field_errors?.[0] || 'Credenciales invalidas.';
      setError(typeof msg === 'string' ? msg : 'Error al iniciar sesion.');
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Completa todos los campos.');
      return;
    }
    mutation.mutate(formData);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-lg bg-[#1A3A6B] flex items-center justify-center">
              <span className="text-white font-display font-bold text-sm">C27</span>
            </div>
          </Link>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-gray-900">
            Bienvenido de vuelta
          </h1>
          <p className="text-gray-500 mt-2">
            Inicia sesion en tu cuenta CONEIC 2027
          </p>
        </div>

        {location.state?.registered && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-center">
            <p className="text-green-700 text-sm">
              Registro exitoso. Revisa tu correo para verificar tu cuenta antes de iniciar sesion.
            </p>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8 space-y-5"
        >
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Correo electronico
            </label>
            <div className="relative">
              <HiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="tu@email.com"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3A6B]/20 focus:border-[#1A3A6B] transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-gray-700">Contrasena</label>
              <Link
                to="/password-reset"
                className="text-xs text-[#1A3A6B] hover:underline"
              >
                Olvidaste tu contrasena?
              </Link>
            </div>
            <div className="relative">
              <HiLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Tu contrasena"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3A6B]/20 focus:border-[#1A3A6B] transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full py-3.5 rounded-xl bg-[#1A3A6B] text-white font-semibold text-base hover:bg-[#1A3A6B]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {mutation.isPending ? 'Iniciando sesion...' : 'Iniciar sesion'}
          </button>

          <p className="text-center text-sm text-gray-500">
            No tienes cuenta?{' '}
            <Link to="/register" className="text-[#1A3A6B] font-semibold hover:underline">
              Registrate
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
