/* eslint-disable @typescript-eslint/no-explicit-any */
import api from './api';

export const reportService = {
  getGuardReport: async (params: any = {}) => {
    return await api.get('/reports/guards', { params });
  },

  getAttendanceReport: async (params: any = {}) => {
    return await api.get('/reports/attendance', { params });
  },

  getFirearmReport: async (params: any = {}) => {
    return await api.get('/reports/firearms', { params });
  },

  getCompanyReport: async (params: any = {}) => {
    return await api.get('/reports/companies', { params });
  },

  downloadCSV: async (reportType: string, params: any = {}) => {
    const responseData = await api.get(`/reports/${reportType}`, {
      params: { ...params, format: 'csv' },
      responseType: 'blob',
    });
    const blob = new Blob([responseData as any], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${reportType}_report.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  },
};
