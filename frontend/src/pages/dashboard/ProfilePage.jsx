import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { HiUser, HiSave, HiCheck } from 'react-icons/hi';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import authService from '../../services/authService';
import LoadingSpinner from '../../components/LoadingSpinner';

const COUNTRIES = [
  'Peru', 'Argentina', 'Bolivia', 'Brasil', 'Chile', 'Colombia',
  'Ecuador', 'Mexico', 'Paraguay', 'Uruguay', 'Venezuela', 'Otro',
];

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const updateProfile = useAuthStore((state) => state.updateProfile);

  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    university: '',
    career: '',
    country: '',
    city: '',
  });

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        full_name: user.full_name || '',
        phone: user.phone || '',
        university: user.university || '',
        career: user.career || '',
        country: user.country || '',
        city: user.city || '',
      });
    }
  }, [user]);

  const mutation = useMutation({
    mutationFn: authService.updateProfile,
    onSuccess: (data) => {
      updateProfile(data);
      setSaved(true);
      toast.success('Perfil actualizado correctamente');
      setTimeout(() => setSaved(false), 3000);
    },
    onError: (error) => {
      const msg = error.response?.data?.detail || 'Error al actualizar perfil';
      toast.error(msg);
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setSaved(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  if (!user) {
    return <LoadingSpinner size="lg" label="Cargando perfil..." className="py-20" />;
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900">Mi Perfil</h1>
        <p className="text-gray-500 mt-1 text-sm">Actualiza tu informacion personal</p>
      </div>

      {/* Avatar & Email Display */}
      <div className="card p-5 sm:p-6 mb-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-[#1A3A6B]/10 flex items-center justify-center shrink-0">
          <HiUser className="w-8 h-8 text-[#1A3A6B]" />
        </div>
        <div className="min-w-0">
          <h2 className="font-display font-bold text-gray-900 truncate">{user.full_name}</h2>
          <p className="text-sm text-gray-500 truncate">{user.email}</p>
          {user.role && (
            <span className="inline-block mt-1 text-xs font-medium bg-[#1A3A6B]/10 text-[#1A3A6B] px-2 py-0.5 rounded-full capitalize">
              {user.role}
            </span>
          )}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="card p-5 sm:p-6">
        <div className="space-y-5">
          {/* Full Name */}
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1.5">
              Nombre completo
            </label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              required
              className="input-field"
              placeholder="Tu nombre completo"
            />
          </div>

          {/* Email (readonly) */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
              Correo electronico
            </label>
            <input
              type="email"
              id="email"
              value={user.email || ''}
              readOnly
              disabled
              className="input-field bg-gray-50 text-gray-500 cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 mt-1">El correo no puede ser modificado</p>
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">
              Telefono
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="input-field"
              placeholder="+51 999 999 999"
            />
          </div>

          {/* University */}
          <div>
            <label htmlFor="university" className="block text-sm font-medium text-gray-700 mb-1.5">
              Universidad
            </label>
            <input
              type="text"
              id="university"
              name="university"
              value={form.university}
              onChange={handleChange}
              className="input-field"
              placeholder="Nombre de tu universidad"
            />
          </div>

          {/* Career */}
          <div>
            <label htmlFor="career" className="block text-sm font-medium text-gray-700 mb-1.5">
              Carrera
            </label>
            <input
              type="text"
              id="career"
              name="career"
              value={form.career}
              onChange={handleChange}
              className="input-field"
              placeholder="Ingenieria Civil, Arquitectura..."
            />
          </div>

          {/* Country & City */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1.5">
                Pais
              </label>
              <select
                id="country"
                name="country"
                value={form.country}
                onChange={handleChange}
                className="input-field"
              >
                <option value="">Seleccionar pais</option>
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1.5">
                Ciudad
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={form.city}
                onChange={handleChange}
                className="input-field"
                placeholder="Tu ciudad"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="mt-8 flex items-center justify-end gap-3">
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
              <HiCheck className="w-4 h-4" />
              Guardado
            </span>
          )}
          <button
            type="submit"
            disabled={mutation.isPending}
            className="inline-flex items-center gap-2 bg-[#1A3A6B] hover:bg-[#15305a] text-white font-semibold py-2.5 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <HiSave className="w-4 h-4" />
            {mutation.isPending ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}
