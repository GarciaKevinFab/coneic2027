import api from './api';

const adminService = {
  getParticipants: async (params = {}) => {
    const { data } = await api.get('/admin/participants/', { params });
    return data;
  },

  exportExcel: async () => {
    const response = await api.get('/admin/participants/export/', {
      responseType: 'blob',
    });
    return response.data;
  },

  getPayments: async (params = {}) => {
    const { data } = await api.get('/admin/payments/', { params });
    return data;
  },

  accredit: async (qrToken) => {
    const { data } = await api.post(`/admin/accredit/${qrToken}/`);
    return data;
  },

  getStats: async () => {
    const { data } = await api.get('/admin/stats/');
    return data;
  },

  workshopReport: async () => {
    const { data } = await api.get('/admin/workshops/report/');
    return data;
  },

  generateCertificates: async (type) => {
    const { data } = await api.post('/certificates/generate/', { type });
    return data;
  },
};

export default adminService;
