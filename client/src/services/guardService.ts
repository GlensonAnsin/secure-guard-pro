/* eslint-disable @typescript-eslint/no-explicit-any */
import api from './api';

export const guardService = {
  getAll: async (page = 1, limit = 15, search = '', status = '') => {
    return await api.get(`/users`, { params: { page, limit, search, status } });
  },
  
  getById: async (id: number) => {
    return await api.get(`/users/${id}`);
  },

  create: async (data: any) => {
    return await api.post(`/users`, data);
  },

  update: async (id: number, data: any) => {
    return await api.put(`/users/${id}`, data);
  },

  delete: async (id: number) => {
    return await api.delete(`/users/${id}`);
  },

  getGuardStats: async () => {
    return await api.get(`/guard-stats`);
  },

  getDesignations: async (userId: number) => {
    return await api.get(`/designations`, { params: { userId } });
  }
};
