/* eslint-disable @typescript-eslint/no-explicit-any */
import api from './api';

export const guardService = {
  getAll: async (page = 1, limit = 15, search = '', status = '') => {
    return await api.get(`/guards`, { params: { page, limit, search, status } });
  },
  
  getById: async (id: number) => {
    return await api.get(`/guards/${id}`);
  },

  create: async (data: any) => {
    return await api.post(`/guards`, data);
  },

  update: async (id: number, data: any) => {
    return await api.put(`/guards/${id}`, data);
  },

  delete: async (id: number) => {
    return await api.delete(`/guards/${id}`);
  },

  getGuardStats: async () => {
    return await api.get(`/guard-stats`);
  },
};
