import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for secure cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for Bearer token if needed (though we use cookies)
apiClient.interceptors.request.use((config) => {
  // If using local storage for token, add it here.
  // Otherwise, withCredentials handles the cookie.
  return config;
});

// Response interceptor for handling errors and token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAuthRequest = originalRequest?.url === '/auth/login' || originalRequest?.url === '/auth/refresh';
    if (error.response?.status === 401 && !isAuthRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await apiClient.post('/auth/refresh');
        return apiClient(originalRequest);
      } catch (refreshError) {
        if (window.location.pathname !== '/login') window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
