import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { HiMail, HiLockClosed } from 'react-icons/hi';
import useAuth from '../hooks/useAuth';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(formData);
      navigate(from, { replace: true });
    } catch {
      // Error handled in useAuth
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
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

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Correo electronico</label>
            <div className="relative">
              <HiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="tu@email.com"
                required
                className="input-field pl-10"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-gray-700">Contrasena</label>
              <Link to="/password-reset" className="text-xs text-primary hover:underline">
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
                className="input-field pl-10"
              />
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="btn-primary w-full !py-3.5 text-base">
            {isLoading ? 'Iniciando sesion...' : 'Iniciar sesion'}
          </button>

          <p className="text-center text-sm text-gray-500">
            No tienes cuenta?{' '}
            <Link to="/register" className="text-primary font-semibold hover:underline">
              Registrate
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
