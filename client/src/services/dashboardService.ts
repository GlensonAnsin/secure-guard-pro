import api from "./api";

export const dashboardService = {
  getGuardStats: async () => {
    return await api.get(`/guard-stats`);
  },
};
