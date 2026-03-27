import api from './api';

const authService = {
  register: async (userData) => {
    const { data } = await api.post('/auth/register/', userData);
    return data;
  },

  login: async (credentials) => {
    const { data } = await api.post('/auth/login/', credentials);
    return data;
  },

  verifyEmail: async (token) => {
    const { data } = await api.get(`/auth/verify-email/${token}/`);
    return data;
  },

  requestPasswordReset: async (email) => {
    const { data } = await api.post('/auth/password-reset/', { email });
    return data;
  },

  confirmPasswordReset: async (token, newPassword) => {
    const { data } = await api.post('/auth/password-reset/confirm/', {
      token,
      new_password: newPassword,
    });
    return data;
  },

  getProfile: async () => {
    const { data } = await api.get('/auth/profile/');
    return data;
  },

  updateProfile: async (profileData) => {
    const { data } = await api.put('/auth/profile/', profileData);
    return data;
  },

  refreshToken: async (refreshToken) => {
    const { data } = await api.post('/auth/token/refresh/', {
      refresh: refreshToken,
    });
    return data;
  },
};

export default authService;
