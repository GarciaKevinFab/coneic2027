import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function OrganizerRoute() {
  const { isAuthenticated, isOrganizer } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isOrganizer()) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
