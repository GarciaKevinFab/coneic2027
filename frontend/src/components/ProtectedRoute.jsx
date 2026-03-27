import { useState, useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuthStore, { getHasHydrated, onHydrate } from '../store/authStore';
import LoadingSpinner from './LoadingSpinner';

export default function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const location = useLocation();
  const [hydrated, setHydrated] = useState(getHasHydrated());

  useEffect(() => {
    if (!hydrated) {
      onHydrate(() => setHydrated(true));
    }
  }, [hydrated]);

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
