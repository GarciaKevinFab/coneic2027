import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { HiMail, HiLockClosed, HiUser, HiAcademicCap, HiPhone, HiBriefcase } from 'react-icons/hi';
import authService from '../services/authService';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
    phone: '',
    university: '',
    career: '',
  });
  const [errors, setErrors] = useState({});

  const mutation = useMutation({
    mutationFn: (data) => authService.register(data),
    onSuccess: () => {
      setSuccess(true);
    },
    onError: (error) => {
      const detail = error.response?.data?.detail;
      if (typeof detail === 'string') {
        setErrors({ general: detail });
      } else if (typeof detail === 'object') {
        setErrors(detail);
      } else {
        setErrors({ general: 'Ocurrio un error al registrarte. Intenta de nuevo.' });
      }
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.full_name.trim()) newErrors.full_name = 'Nombre completo requerido';
    if (!formData.email.trim()) newErrors.email = 'Correo requerido';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Correo invalido';
    if (!formData.password) newErrors.password = 'Contrasena requerida';
    else if (formData.password.length < 8) newErrors.password = 'Minimo 8 caracteres';
    if (formData.password !== formData.confirm_password)
      newErrors.confirm_password = 'Las contrasenas no coinciden';
    if (!formData.university.trim()) newErrors.university = 'Universidad requerida';
    if (!formData.career.trim()) newErrors.career = 'Carrera requerida';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const { confirm_password, ...payload } = formData;
    mutation.mutate(payload);
  };

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md text-center">
          <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
            <HiMail className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="font-display font-bold text-2xl text-gray-900 mb-3">
            Revisa tu correo
          </h1>
          <p className="text-gray-500 mb-8">
            Te hemos enviado un enlace de verificacion a <strong className="text-gray-700">{formData.email}</strong>.
            Revisa tu bandeja de entrada (y spam) para activar tu cuenta.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[#1A3A6B] text-white font-semibold text-sm hover:bg-[#1A3A6B]/90 transition-colors"
          >
            Ir a iniciar sesion
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-lg bg-[#1A3A6B] flex items-center justify-center">
              <span className="text-white font-display font-bold text-sm">C27</span>
            </div>
          </Link>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-gray-900">
            Crea tu cuenta
          </h1>
          <p className="text-gray-500 mt-2">
            Registrate para participar en CONEIC 2027
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8 space-y-5"
        >
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
              <p className="text-red-600 text-sm">{errors.general}</p>
            </div>
          )}

          {/* Full name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nombre completo
            </label>
            <div className="relative">
              <HiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Juan Perez Garcia"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3A6B]/20 focus:border-[#1A3A6B] transition-colors"
              />
            </div>
            {errors.full_name && (
              <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>
            )}
          </div>

          {/* Email */}
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
                placeholder="juan@universidad.edu.pe"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3A6B]/20 focus:border-[#1A3A6B] transition-colors"
              />
            </div>
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Password & Confirm */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Contrasena
              </label>
              <div className="relative">
                <HiLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min. 8 caracteres"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3A6B]/20 focus:border-[#1A3A6B] transition-colors"
                />
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Confirmar contrasena
              </label>
              <div className="relative">
                <HiLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  placeholder="Repite tu contrasena"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3A6B]/20 focus:border-[#1A3A6B] transition-colors"
                />
              </div>
              {errors.confirm_password && (
                <p className="text-red-500 text-xs mt-1">{errors.confirm_password}</p>
              )}
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Telefono
            </label>
            <div className="relative">
              <HiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="999 999 999"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3A6B]/20 focus:border-[#1A3A6B] transition-colors"
              />
            </div>
          </div>

          {/* University & Career */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Universidad
              </label>
              <div className="relative">
                <HiAcademicCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  name="university"
                  value={formData.university}
                  onChange={handleChange}
                  placeholder="UNI"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3A6B]/20 focus:border-[#1A3A6B] transition-colors"
                />
              </div>
              {errors.university && (
                <p className="text-red-500 text-xs mt-1">{errors.university}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Carrera
              </label>
              <div className="relative">
                <HiBriefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  name="career"
                  value={formData.career}
                  onChange={handleChange}
                  placeholder="Ingenieria Civil"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3A6B]/20 focus:border-[#1A3A6B] transition-colors"
                />
              </div>
              {errors.career && (
                <p className="text-red-500 text-xs mt-1">{errors.career}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full py-3.5 rounded-xl bg-[#1A3A6B] text-white font-semibold text-base hover:bg-[#1A3A6B]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {mutation.isPending ? 'Registrando...' : 'Crear cuenta'}
          </button>

          <p className="text-center text-sm text-gray-500">
            Ya tienes cuenta?{' '}
            <Link to="/login" className="text-[#1A3A6B] font-semibold hover:underline">
              Inicia sesion
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
