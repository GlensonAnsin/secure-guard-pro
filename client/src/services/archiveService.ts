import api from './api';

export const archiveService = {
  getArchived: async (entity: string, page = 1, limit = 15) => {
    return await api.get(`/archive/${entity}`, { params: { page, limit } });
  },

  restore: async (entity: string, id: number) => {
    return await api.post(`/archive/${entity}/${id}/restore`);
  },

  permanentDelete: async (entity: string, id: number) => {
    return await api.delete(`/archive/${entity}/${id}`);
  },
};
