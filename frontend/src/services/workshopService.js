import api from './api';

const workshopService = {
  getAll: async () => {
    const { data } = await api.get('/workshops');
    return data;
  },

  getById: async (workshopId) => {
    const { data } = await api.get(`/workshops/${workshopId}`);
    return data;
  },

  enroll: async (workshopId) => {
    const { data } = await api.post(`/workshops/${workshopId}/enroll`);
    return data;
  },

  unenroll: async (workshopId) => {
    const { data } = await api.delete(`/workshops/${workshopId}/enroll`);
    return data;
  },

  getMyWorkshops: async () => {
    const { data } = await api.get('/workshops/my-workshops');
    return data;
  },
};

export default workshopService;
