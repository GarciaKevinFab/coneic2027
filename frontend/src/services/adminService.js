import api from './api';

const adminService = {
  getParticipants: async (params = {}) => {
    const { data } = await api.get('/admin/participants', { params });
    return data;
  },

  exportExcel: async (params = {}) => {
    const response = await api.get('/admin/participants/export', {
      params,
      responseType: 'blob',
    });
    return response;
  },

  getPayments: async (params = {}) => {
    const { data } = await api.get('/admin/payments', { params });
    return data;
  },

  accredit: async (participantCode) => {
    const { data } = await api.post('/admin/accredit', { code: participantCode });
    return data;
  },

  getStats: async () => {
    const { data } = await api.get('/admin/stats');
    return data;
  },

  workshopReport: async () => {
    const { data } = await api.get('/admin/workshops/report');
    return data;
  },

  generateCertificates: async (type) => {
    const { data } = await api.post('/admin/certificates/generate', { type });
    return data;
  },

  getCertificateStatus: async () => {
    const { data } = await api.get('/admin/certificates/status');
    return data;
  },
};

export default adminService;
