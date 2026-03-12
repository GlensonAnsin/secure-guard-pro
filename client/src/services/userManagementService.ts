/* eslint-disable @typescript-eslint/no-explicit-any */
import api from './api';

export const userManagementService = {
  getAll: async (page = 1, limit = 15, search = '') => {
    return await api.get('/users', { params: { page, limit, search } });
  },

  create: async (data: any) => {
    return await api.post('/users', data);
  },

  update: async (id: number, data: any) => {
    return await api.put(`/users/${id}`, data);
  },

  delete: async (id: number) => {
    return await api.delete(`/users/${id}`);
  },
};
