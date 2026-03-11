/* eslint-disable @typescript-eslint/no-explicit-any */
import api from './api';

export const companyService = {
  getAll: async (page = 1, limit = 15, search = '') => {
    return await api.get('/companies', { params: { page, limit, search } });
  },

  getById: async (id: number) => {
    return await api.get(`/companies/${id}`);
  },

  getGuards: async (id: number) => {
    return await api.get(`/companies/${id}/guards`);
  },

  create: async (data: any) => {
    return await api.post('/companies', data);
  },

  update: async (id: number, data: any) => {
    return await api.put(`/companies/${id}`, data);
  },

  delete: async (id: number) => {
    return await api.delete(`/companies/${id}`);
  },
};
