import api from './api';

const scheduleService = {
  getSchedule: async () => {
    const { data } = await api.get('/schedule/');
    return data.results || data;
  },

  getByDay: async (date) => {
    const { data } = await api.get(`/schedule/${date}/`);
    return data;
  },

  getByType: async (type) => {
    const { data } = await api.get('/schedule/by-type/', { params: { type } });
    return data;
  },
};

export default scheduleService;
