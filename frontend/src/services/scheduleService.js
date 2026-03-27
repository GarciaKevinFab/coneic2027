import api from './api';

const scheduleService = {
  getSchedule: async () => {
    const { data } = await api.get('/schedule');
    return data;
  },

  getByDay: async (day) => {
    const { data } = await api.get(`/schedule/day/${day}`);
    return data;
  },

  getByType: async (type) => {
    const { data } = await api.get(`/schedule/type/${type}`);
    return data;
  },

  getSpeakers: async () => {
    const { data } = await api.get('/schedule/speakers');
    return data;
  },
};

export default scheduleService;
