/* eslint-disable @typescript-eslint/no-explicit-any */
import api from './api';

export const issuanceService = {
  getAll: async (page = 1, limit = 15) => {
    return await api.get(`/firearm-issuances`, { params: { page, limit } });
  },
  
  getById: async (id: number) => {
    return await api.get(`/firearm-issuances/${id}`);
  },

  create: async (data: any) => {
    return await api.post(`/firearm-issuances`, data);
  },

  update: async (id: number, data: any) => {
    return await api.put(`/firearm-issuances/${id}`, data);
  },

  delete: async (id: number) => {
    return await api.delete(`/firearm-issuances/${id}`);
  }
};
