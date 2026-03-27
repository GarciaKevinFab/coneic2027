import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { HiCheckCircle, HiXCircle } from 'react-icons/hi';
import authService from '../services/authService';
import LoadingSpinner from '../components/LoadingSpinner';

export default function VerifyEmailPage() {
  const { token } = useParams();
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('No se encontro un token de verificacion en la URL.');
      return;
    }

    authService
      .verifyEmail(token)
      .then(() => {
        setStatus('success');
      })
      .catch((err) => {
        setStatus('error');
        const msg = err.response?.data?.detail;
        setErrorMessage(
          typeof msg === 'string'
            ? msg
            : 'El enlace de verificacion es invalido o ha expirado.'
        );
      });
  }, [token]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md text-center">
        {status === 'loading' && (
          <div>
            <LoadingSpinner size="lg" label="Verificando tu correo..." />
          </div>
        )}

        {status === 'success' && (
          <div>
            <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
              <HiCheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <h1 className="font-display font-bold text-2xl text-gray-900 mb-3">
              Correo verificado
            </h1>
            <p className="text-gray-500 mb-8">
              Tu cuenta ha sido verificada exitosamente. Ya puedes iniciar sesion.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[#1A3A6B] text-white font-semibold text-sm hover:bg-[#1A3A6B]/90 transition-colors"
            >
              Iniciar sesion
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
              <HiXCircle className="w-12 h-12 text-red-500" />
            </div>
            <h1 className="font-display font-bold text-2xl text-gray-900 mb-3">
              Error de verificacion
            </h1>
            <p className="text-gray-500 mb-8">
              {errorMessage}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[#1A3A6B] text-white font-semibold text-sm hover:bg-[#1A3A6B]/90 transition-colors"
              >
                Volver al registro
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
              >
                Iniciar sesion
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
