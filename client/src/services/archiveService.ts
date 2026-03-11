import api from './api';

export const archiveService = {
  getArchived: async (entity: string, page = 1, limit = 15) => {
    const response = await api.get(`/archive/${entity}`, { params: { page, limit } });
    return response.data;
  },

  restore: async (entity: string, id: number) => {
    const response = await api.post(`/archive/${entity}/${id}/restore`);
    return response.data;
  },

  permanentDelete: async (entity: string, id: number) => {
    const response = await api.delete(`/archive/${entity}/${id}`);
    return response.data;
  },
};
