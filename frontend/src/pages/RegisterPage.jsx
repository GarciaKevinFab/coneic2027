import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiMail, HiLockClosed, HiUser, HiAcademicCap, HiPhone } from 'react-icons/hi';
import useAuth from '../hooks/useAuth';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    university: '',
    student_code: '',
    password: '',
    password_confirm: '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.first_name.trim()) newErrors.first_name = 'Nombre requerido';
    if (!formData.last_name.trim()) newErrors.last_name = 'Apellido requerido';
    if (!formData.email.trim()) newErrors.email = 'Correo requerido';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Correo invalido';
    if (!formData.university.trim()) newErrors.university = 'Universidad requerida';
    if (!formData.password) newErrors.password = 'Contrasena requerida';
    else if (formData.password.length < 8) newErrors.password = 'Minimo 8 caracteres';
    if (formData.password !== formData.password_confirm)
      newErrors.password_confirm = 'Las contrasenas no coinciden';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      await register(formData);
      navigate('/login', { state: { registered: true } });
    } catch {
      // Error handled in useAuth hook
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
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

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre</label>
              <div className="relative">
                <HiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="Juan"
                  className="input-field pl-10"
                />
              </div>
              {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Apellido</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Perez"
                className="input-field"
              />
              {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Correo electronico</label>
            <div className="relative">
              <HiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="juan@universidad.edu.pe"
                className="input-field pl-10"
              />
            </div>
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Telefono</label>
            <div className="relative">
              <HiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="999 999 999"
                className="input-field pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Universidad</label>
              <div className="relative">
                <HiAcademicCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  name="university"
                  value={formData.university}
                  onChange={handleChange}
                  placeholder="UNI"
                  className="input-field pl-10"
                />
              </div>
              {errors.university && <p className="text-red-500 text-xs mt-1">{errors.university}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Codigo de estudiante</label>
              <input
                type="text"
                name="student_code"
                value={formData.student_code}
                onChange={handleChange}
                placeholder="20210001"
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Contrasena</label>
              <div className="relative">
                <HiLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min. 8 caracteres"
                  className="input-field pl-10"
                />
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirmar contrasena</label>
              <div className="relative">
                <HiLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  name="password_confirm"
                  value={formData.password_confirm}
                  onChange={handleChange}
                  placeholder="Repite tu contrasena"
                  className="input-field pl-10"
                />
              </div>
              {errors.password_confirm && <p className="text-red-500 text-xs mt-1">{errors.password_confirm}</p>}
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="btn-primary w-full !py-3.5 text-base">
            {isLoading ? 'Registrando...' : 'Crear cuenta'}
          </button>

          <p className="text-center text-sm text-gray-500">
            Ya tienes cuenta?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Inicia sesion
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
