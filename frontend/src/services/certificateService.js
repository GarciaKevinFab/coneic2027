import api from './api';

const certificateService = {
  getMyCerts: async () => {
    const { data } = await api.get('/certificates/my-certificates');
    return data;
  },

  download: async (certId) => {
    const response = await api.get(`/certificates/${certId}/download`, {
      responseType: 'blob',
    });
    return response;
  },

  validate: async (code) => {
    const { data } = await api.get(`/certificates/validate/${code}`);
    return data;
  },
};

export default certificateService;
