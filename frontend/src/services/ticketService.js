import api from './api';

const ticketService = {
  getTypes: async () => {
    const { data } = await api.get('/tickets/types/');
    return data.results || data;
  },

  purchase: async (purchaseData) => {
    const { data } = await api.post('/tickets/purchase/', purchaseData);
    return data;
  },

  getMyTicket: async () => {
    const { data } = await api.get('/tickets/me/');
    return data;
  },

  getReceipt: async (purchaseCode) => {
    const response = await api.get(`/tickets/receipt/${purchaseCode}/`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

export default ticketService;
