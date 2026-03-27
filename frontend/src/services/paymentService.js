import api from './api';

const paymentService = {
  chargeCulqi: async (paymentData) => {
    const { data } = await api.post('/payments/culqi', paymentData);
    return data;
  },

  chargeYape: async (paymentData) => {
    const { data } = await api.post('/payments/yape', paymentData);
    return data;
  },

  getStatus: async (paymentId) => {
    const { data } = await api.get(`/payments/${paymentId}/status`);
    return data;
  },

  getPaymentMethods: async () => {
    const { data } = await api.get('/payments/methods');
    return data;
  },
};

export default paymentService;
