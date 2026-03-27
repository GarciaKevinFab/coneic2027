import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import authService from '../services/authService';
import toast from 'react-hot-toast';

export default function useAuth() {
  const navigate = useNavigate();
  const { user, isAuthenticated, login: storeLogin, logout: storeLogout, setUser, isOrganizer } = useAuthStore();

  const login = useCallback(async (credentials) => {
    try {
      const data = await authService.login(credentials);
      storeLogin(data.user, data.access_token, data.refresh_token);
      toast.success('Bienvenido de vuelta');
      return data;
    } catch (error) {
      const msg = error.response?.data?.detail || 'Error al iniciar sesion';
      toast.error(msg);
      throw error;
    }
  }, [storeLogin]);

  const register = useCallback(async (userData) => {
    try {
      const data = await authService.register(userData);
      toast.success('Registro exitoso. Revisa tu correo para verificar tu cuenta.');
      return data;
    } catch (error) {
      const msg = error.response?.data?.detail || 'Error al registrarse';
      toast.error(msg);
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    storeLogout();
    toast.success('Sesion cerrada');
    navigate('/');
  }, [storeLogout, navigate]);

  const refreshProfile = useCallback(async () => {
    try {
      const data = await authService.getProfile();
      setUser(data);
      return data;
    } catch (error) {
      console.error('Failed to refresh profile:', error);
    }
  }, [setUser]);

  return {
    user,
    isAuthenticated,
    isOrganizer: isOrganizer(),
    login,
    register,
    logout,
    refreshProfile,
  };
}
