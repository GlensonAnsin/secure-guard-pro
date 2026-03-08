import api from './api';

export const guardViewService = {
    getById: async (id: number) => {
        return await api.get(`/guards/${id}`);
    },
    updateStatus: async (id: number, status: string) => {
        return await api.put(`/guards/${id}/status`, { status });
    },
}
