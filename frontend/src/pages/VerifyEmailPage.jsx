import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { HiCheckCircle, HiXCircle } from 'react-icons/hi';
import authService from '../services/authService';
import LoadingSpinner from '../components/LoadingSpinner';

export default function VerifyEmailPage() {
  const { token } = useParams();
  const [status, setStatus] = useState('loading'); // loading, success, error

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }

    authService
      .verifyEmail(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md text-center">
        {status === 'loading' && (
          <LoadingSpinner size="lg" label="Verificando tu correo..." />
        )}

        {status === 'success' && (
          <div className="animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
              <HiCheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <h1 className="font-display font-bold text-2xl text-gray-900 mb-3">
              Correo verificado
            </h1>
            <p className="text-gray-500 mb-8">
              Tu cuenta ha sido verificada exitosamente. Ya puedes iniciar sesion.
            </p>
            <Link to="/login" className="btn-primary">
              Iniciar sesion
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
              <HiXCircle className="w-12 h-12 text-red-500" />
            </div>
            <h1 className="font-display font-bold text-2xl text-gray-900 mb-3">
              Error de verificacion
            </h1>
            <p className="text-gray-500 mb-8">
              El enlace de verificacion es invalido o ha expirado. Intenta registrarte nuevamente.
            </p>
            <Link to="/register" className="btn-primary">
              Volver al registro
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
