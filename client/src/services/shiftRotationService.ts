import api from './api';

export const shiftRotationService = {
  getStatus: async () => {
    return await api.get('/shift-rotation/status');
  },

  triggerAutoRotation: async () => {
    return await api.post('/shift-rotation/rotate');
  },

  manualRotate: async (companyId: number) => {
    return await api.post(`/shift-rotation/rotate/${companyId}`);
  },
};
