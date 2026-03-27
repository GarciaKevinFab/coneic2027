import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { HiMail, HiLockClosed, HiCheckCircle } from 'react-icons/hi';
import authService from '../services/authService';
import toast from 'react-hot-toast';

export default function PasswordResetPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [step, setStep] = useState(token ? 'confirm' : 'request');
  const [email, setEmail] = useState('');
  const [passwords, setPasswords] = useState({ password: '', confirm: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleRequest = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await authService.requestPasswordReset(email);
      setDone(true);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error al enviar el correo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    if (passwords.password !== passwords.confirm) {
      toast.error('Las contrasenas no coinciden');
      return;
    }
    if (passwords.password.length < 8) {
      toast.error('La contrasena debe tener al menos 8 caracteres');
      return;
    }
    setIsLoading(true);
    try {
      await authService.confirmPasswordReset(token, passwords.password);
      setDone(true);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error al restablecer la contrasena');
    } finally {
      setIsLoading(false);
    }
  };

  if (done && step === 'request') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md text-center animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
            <HiMail className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="font-display font-bold text-2xl text-gray-900 mb-3">Revisa tu correo</h1>
          <p className="text-gray-500 mb-8">
            Si existe una cuenta con ese correo, recibiras un enlace para restablecer tu contrasena.
          </p>
          <Link to="/login" className="btn-primary">Volver al login</Link>
        </div>
      </div>
    );
  }

  if (done && step === 'confirm') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md text-center animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
            <HiCheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="font-display font-bold text-2xl text-gray-900 mb-3">Contrasena actualizada</h1>
          <p className="text-gray-500 mb-8">Tu contrasena ha sido restablecida exitosamente.</p>
          <Link to="/login" className="btn-primary">Iniciar sesion</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display font-bold text-2xl text-gray-900">
            {step === 'request' ? 'Recuperar contrasena' : 'Nueva contrasena'}
          </h1>
          <p className="text-gray-500 mt-2">
            {step === 'request'
              ? 'Ingresa tu correo y te enviaremos un enlace de recuperacion'
              : 'Ingresa tu nueva contrasena'}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8">
          {step === 'request' ? (
            <form onSubmit={handleRequest} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Correo electronico</label>
                <div className="relative">
                  <HiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    required
                    className="input-field pl-10"
                  />
                </div>
              </div>
              <button type="submit" disabled={isLoading} className="btn-primary w-full !py-3">
                {isLoading ? 'Enviando...' : 'Enviar enlace de recuperacion'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleConfirm} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nueva contrasena</label>
                <div className="relative">
                  <HiLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    value={passwords.password}
                    onChange={(e) => setPasswords((p) => ({ ...p, password: e.target.value }))}
                    placeholder="Min. 8 caracteres"
                    required
                    className="input-field pl-10"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirmar contrasena</label>
                <div className="relative">
                  <HiLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    value={passwords.confirm}
                    onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))}
                    placeholder="Repite tu contrasena"
                    required
                    className="input-field pl-10"
                  />
                </div>
              </div>
              <button type="submit" disabled={isLoading} className="btn-primary w-full !py-3">
                {isLoading ? 'Actualizando...' : 'Restablecer contrasena'}
              </button>
            </form>
          )}

          <p className="text-center text-sm text-gray-500 mt-5">
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Volver al login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
