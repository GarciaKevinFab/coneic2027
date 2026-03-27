import api from './api';

const ticketService = {
  getTypes: async () => {
    const { data } = await api.get('/tickets/types');
    return data;
  },

  purchase: async (purchaseData) => {
    const { data } = await api.post('/tickets/purchase', purchaseData);
    return data;
  },

  getMyTicket: async () => {
    const { data } = await api.get('/tickets/my-ticket');
    return data;
  },

  getReceipt: async (ticketId) => {
    const { data } = await api.get(`/tickets/${ticketId}/receipt`);
    return data;
  },

  getById: async (ticketId) => {
    const { data } = await api.get(`/tickets/${ticketId}`);
    return data;
  },
};

export default ticketService;
