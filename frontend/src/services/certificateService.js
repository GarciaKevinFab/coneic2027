import api from './api';

const certificateService = {
  getMyCertificates: async () => {
    const { data } = await api.get('/certificates/my/');
    return data.results || data;
  },

  download: async (certificateId) => {
    const response = await api.get(`/certificates/${certificateId}/download/`, {
      responseType: 'blob',
    });
    return response.data;
  },

  validate: async (code) => {
    const { data } = await api.get(`/certificates/validate/${code}/`);
    return data;
  },

  generate: async () => {
    const { data } = await api.post('/certificates/generate/');
    return data;
  },
};

export default certificateService;
