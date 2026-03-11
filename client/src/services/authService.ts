import api from './api';

export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/login', { email, password });
    if (response && response.data) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('accessToken');
  },

  hasRole: (role: string): boolean => {
    const user = authService.getCurrentUser();
    return user?.roles?.includes(role) || false;
  },

  isAdmin: (): boolean => {
    return authService.hasRole('admin');
  },

  isHR: (): boolean => {
    return authService.hasRole('hr');
  },

  isAdminOrHR: (): boolean => {
    return authService.isAdmin() || authService.isHR();
  },

  changePassword: async (oldPassword: string, newPassword: string) => {
    const response = await api.put('/auth/change-password', { oldPassword, newPassword });
    return response.data;
  }
};
