import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import LoadingSpinner from './LoadingSpinner';

export default function OrganizerRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isOrganizer = useAuthStore((s) => s.isOrganizer);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const location = useLocation();

  if (!hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isOrganizer()) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
