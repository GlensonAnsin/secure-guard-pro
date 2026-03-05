import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

// Request interceptor to add the access token to headers
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle data extraction and auth errors
api.interceptors.response.use(
  (response) => {
    // Return only the data payload part 
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized globally
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url === '/login') {
        return Promise.reject(error);
      }
      
      // We could add refresh token logic here if desired
      // For now, if unauthorized, clear token and push to login
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;
