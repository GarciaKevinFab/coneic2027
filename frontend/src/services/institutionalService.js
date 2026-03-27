import api from './api';

const institutionalService = {
  getEventInfo: async () => {
    const { data } = await api.get('/institutional/event/');
    return data;
  },

  getSponsors: async () => {
    const { data } = await api.get('/institutional/sponsors/');
    return data;
  },

  getCommittee: async () => {
    const { data } = await api.get('/institutional/committee/');
    return data;
  },
};

export default institutionalService;
