/* eslint-disable @typescript-eslint/no-explicit-any */
import api from './api';

export const designationService = {
  getAll: async (page = 1, limit = 15, userId?: number) => {
    const params: any = { page, limit };
    if (userId) params.userId = userId;
    return await api.get(`/designations`, { params });
  },
  
  getById: async (id: number) => {
    return await api.get(`/designations/${id}`);
  },

  create: async (data: any) => {
    return await api.post(`/designations`, data);
  },

  update: async (id: number, data: any) => {
    return await api.put(`/designations/${id}`, data);
  },

  delete: async (id: number) => {
    return await api.delete(`/designations/${id}`);
  },
};
