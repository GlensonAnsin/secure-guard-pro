/* eslint-disable @typescript-eslint/no-explicit-any */
import api from './api';

export const firearmService = {
  getAll: async (page = 1, limit = 15) => {
    return await api.get(`/firearms`, { params: { page, limit } });
  },
  
  getById: async (id: number) => {
    return await api.get(`/firearms/${id}`);
  },

  create: async (data: any) => {
    return await api.post(`/firearms`, data);
  },

  update: async (id: number, data: any) => {
    return await api.put(`/firearms/${id}`, data);
  },

  delete: async (id: number) => {
    return await api.delete(`/firearms/${id}`);
  }
};
