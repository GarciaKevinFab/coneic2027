import api from './api';

const institutionalService = {
  getEventInfo: async () => {
    const { data } = await api.get('/institutional/event-info');
    return data;
  },

  getSponsors: async () => {
    const { data } = await api.get('/institutional/sponsors');
    return data;
  },

  getCommittee: async () => {
    const { data } = await api.get('/institutional/committee');
    return data;
  },

  getFAQ: async () => {
    const { data } = await api.get('/institutional/faq');
    return data;
  },
};

export default institutionalService;
