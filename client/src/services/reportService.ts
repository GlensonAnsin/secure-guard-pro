import api from './api';

export const reportService = {
  getGuardReport: async (params: any = {}) => {
    const response = await api.get('/reports/guards', { params });
    return response.data;
  },

  getAttendanceReport: async (params: any = {}) => {
    const response = await api.get('/reports/attendance', { params });
    return response.data;
  },

  getFirearmReport: async (params: any = {}) => {
    const response = await api.get('/reports/firearms', { params });
    return response.data;
  },

  getCompanyReport: async (params: any = {}) => {
    const response = await api.get('/reports/companies', { params });
    return response.data;
  },

  downloadCSV: async (reportType: string, params: any = {}) => {
    const response = await api.get(`/reports/${reportType}`, {
      params: { ...params, format: 'csv' },
      responseType: 'blob',
    });
    const blob = new Blob([response.data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${reportType}_report.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  },
};
