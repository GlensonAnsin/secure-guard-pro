import api from './api';

export const shiftRotationService = {
  getStatus: async () => {
    const response = await api.get('/shift-rotation/status');
    return response.data;
  },

  triggerAutoRotation: async () => {
    const response = await api.post('/shift-rotation/rotate');
    return response.data;
  },

  manualRotate: async (companyId: number) => {
    const response = await api.post(`/shift-rotation/rotate/${companyId}`);
    return response.data;
  },
};
