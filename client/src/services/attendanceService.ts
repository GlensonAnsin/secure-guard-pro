/* eslint-disable @typescript-eslint/no-explicit-any */
import api from './api';

export const attendanceService = {
  getAll: async (page = 1, limit = 15) => {
    return await api.get(`/attendances`, { params: { page, limit } });
  },
  
  getById: async (id: number) => {
    return await api.get(`/attendances/${id}`);
  },

  create: async (data: any) => {
    return await api.post(`/attendances`, data);
  },

  update: async (id: number, data: any) => {
    return await api.put(`/attendances/${id}`, data);
  },

  delete: async (id: number) => {
    return await api.delete(`/attendances/${id}`);
  }
};
