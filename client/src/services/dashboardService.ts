import api from "./api";

export const dashboardService = {
  getGuardStats: async () => {
    return await api.get(`/guard-stats`);
  },
  getDashboardData: async () => {
    return await api.get(`/dashboard-data`);
  },
  getActivities: async (limit: number = 20) => {
    return await api.get(`/dashboard-activities?limit=${limit}`);
  },
};
