import api from './api';

export const guardViewService = {
    getById: async (id: number) => {
        return await api.get(`/guards/${id}`);
    },
}
