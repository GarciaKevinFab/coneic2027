import api from './api';

const paymentService = {
  chargeCulqi: async (chargeData) => {
    const { data } = await api.post('/payments/charge/', chargeData);
    return data;
  },

  chargeYape: async (yapeData) => {
    const { data } = await api.post('/payments/yape/', yapeData);
    return data;
  },

  getStatus: async (purchaseCode) => {
    const { data } = await api.get(`/payments/status/${purchaseCode}/`);
    return data;
  },
};

export default paymentService;
