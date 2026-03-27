import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { HiMail, HiCheckCircle } from 'react-icons/hi';
import authService from '../services/authService';

export default function PasswordResetPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: (emailValue) => authService.requestPasswordReset(emailValue),
    onSuccess: () => {
      setSent(true);
    },
    onError: (err) => {
      const msg = err.response?.data?.detail;
      setError(typeof msg === 'string' ? msg : 'Error al enviar el correo. Intenta de nuevo.');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) {
      setError('Ingresa tu correo electronico.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Ingresa un correo valido.');
      return;
    }
    mutation.mutate(email);
  };

  if (sent) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md text-center">
          <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
            <HiCheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="font-display font-bold text-2xl text-gray-900 mb-3">
            Revisa tu correo
          </h1>
          <p className="text-gray-500 mb-8">
            Si existe una cuenta asociada a <strong className="text-gray-700">{email}</strong>,
            recibiras un enlace para restablecer tu contrasena.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[#1A3A6B] text-white font-semibold text-sm hover:bg-[#1A3A6B]/90 transition-colors"
          >
            Volver al login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-lg bg-[#1A3A6B] flex items-center justify-center">
              <span className="text-white font-display font-bold text-sm">C27</span>
            </div>
          </Link>
          <h1 className="font-display font-bold text-2xl text-gray-900">
            Recuperar contrasena
          </h1>
          <p className="text-gray-500 mt-2">
            Ingresa tu correo y te enviaremos un enlace de recuperacion
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
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
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="tu@email.com"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3A6B]/20 focus:border-[#1A3A6B] transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full py-3 rounded-xl bg-[#1A3A6B] text-white font-semibold text-sm hover:bg-[#1A3A6B]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {mutation.isPending ? 'Enviando...' : 'Enviar enlace de recuperacion'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            <Link to="/login" className="text-[#1A3A6B] font-semibold hover:underline">
              Volver al login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
